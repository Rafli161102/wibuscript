// File: src/sandbox.ts
// ============================================================================
// WIBUSCRIPT SANDBOX RUNNER (ISOLATED WORKER EXECUTION)
// Menjalankan kode WibuScript / Transpiled JavaScript dalam lingkungan
// terisolasi menggunakan Web Worker (Browser) dan Worker Threads (Node.js).
// Sesuai Roadmap Bagian 7 (Lapisan Proteksi Klien: batas waktu eksekusi,
// pembatas memori, dan default-deny terhadap akses API berbahaya).
// ============================================================================

import { transpileToJS } from "./transpiler";

export interface SandboxOptions {
  timeoutMs?: number; // Batas waktu eksekusi dalam milidetik (default: 5000 ms)
  memoryLimitMb?: number; // Pembatas memori dalam megabyte (khusus Node.js, default: 128 MB)
  onStdout?: (line: string) => void; // Callback streaming terminal stdout
  onStderr?: (line: string) => void; // Callback streaming terminal stderr
}

export interface SandboxResult {
  success: boolean;
  output: string[];
  result?: unknown;
  error?: string;
  executionTimeMs: number;
}

// Skrip internal yang dieksekusi di dalam Web Worker / Worker Thread
const WORKER_SCRIPT_SOURCE = `
const isNodeWorker = typeof process !== "undefined" && process.versions != null && Boolean(process.versions.node);

if (isNodeWorker) {
  const { parentPort } = require("node:worker_threads");
  if (parentPort) {
    parentPort.on("message", async (msg) => {
      if (msg.type === "EXECUTE") {
        const { id, code } = msg;
        const startTime = Date.now();

        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = (...args) => {
          const str = args.map(a => (typeof a === "object" && a !== null ? JSON.stringify(a) : String(a))).join(" ");
          parentPort.postMessage({ type: "STDOUT", id, data: str });
        };
        console.error = (...args) => {
          const str = args.map(a => (typeof a === "object" && a !== null ? JSON.stringify(a) : String(a))).join(" ");
          parentPort.postMessage({ type: "STDERR", id, data: str });
        };
        console.warn = console.log;
        console.info = console.log;

        try {
          // Default-deny kebijakan keamanan: larang akses modul OS berbahaya
          const deny = (apiName) => () => {
            throw new Error("Akses API terlarang '" + apiName + "' ditolak oleh sandbox WibuScript.");
          };
          const safeRequire = (mod) => {
            throw new Error("Akses require('" + mod + "') diblokir oleh sandbox isolasi.");
          };
          const safeProcess = {
            env: {},
            version: "v2.0-wibuscript-sandbox",
            nextTick: process.nextTick,
            cwd: () => "/",
          };

          const runner = new Function(
            "require",
            "process",
            "child_process",
            "fs",
            "net",
            "http",
            "https",
            "global",
            "globalThis",
            \`"use strict"; return (async () => {\\n\${code}\\n})();\`
          );

          const res = await runner(
            safeRequire,
            safeProcess,
            deny("child_process"),
            deny("fs"),
            deny("net"),
            deny("http"),
            deny("https"),
            {},
            {}
          );

          parentPort.postMessage({
            type: "SUCCESS",
            id,
            result: res !== undefined ? res : null,
            executionTimeMs: Date.now() - startTime,
          });
        } catch (err) {
          parentPort.postMessage({
            type: "ERROR",
            id,
            error: err && err.message ? err.message : String(err),
            executionTimeMs: Date.now() - startTime,
          });
        } finally {
          console.log = originalLog;
          console.error = originalError;
          console.warn = originalWarn;
          console.info = originalInfo;
        }
      }
    });
  }
} else {
  // Lingkungan Browser Web Worker
  self.onmessage = async (e) => {
    const msg = e.data;
    if (msg.type === "EXECUTE") {
      const { id, code } = msg;
      const startTime = Date.now();

      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => {
        const str = args.map(a => (typeof a === "object" && a !== null ? JSON.stringify(a) : String(a))).join(" ");
        self.postMessage({ type: "STDOUT", id, data: str });
      };
      console.error = (...args) => {
        const str = args.map(a => (typeof a === "object" && a !== null ? JSON.stringify(a) : String(a))).join(" ");
        self.postMessage({ type: "STDERR", id, data: str });
      };

      try {
        const deny = (api) => () => {
          throw new Error("Akses API browser '" + api + "' ditolak oleh sandbox isolasi.");
        };

        const runner = new Function(
          "XMLHttpRequest",
          "WebSocket",
          "Worker",
          "SharedWorker",
          "importScripts",
          \`"use strict"; return (async () => {\\n\${code}\\n})();\`
        );

        const res = await runner(
          deny("XMLHttpRequest"),
          deny("WebSocket"),
          deny("Worker"),
          deny("SharedWorker"),
          deny("importScripts")
        );

        self.postMessage({
          type: "SUCCESS",
          id,
          result: res !== undefined ? res : null,
          executionTimeMs: Date.now() - startTime,
        });
      } catch (err) {
        self.postMessage({
          type: "ERROR",
          id,
          error: err && err.message ? err.message : String(err),
          executionTimeMs: Date.now() - startTime,
        });
      } finally {
        console.log = originalLog;
        console.error = originalError;
      }
    }
  };
}
`;

export class WibuSandbox {
  private defaultTimeoutMs: number;
  private defaultMemoryLimitMb: number;

  constructor(options: SandboxOptions = {}) {
    this.defaultTimeoutMs = options.timeoutMs ?? 5000;
    this.defaultMemoryLimitMb = options.memoryLimitMb ?? 128;
  }

  /**
   * Menjalankan kode WibuScript atau JavaScript transpilasi dalam worker terisolasi.
   */
  public async execute(
    sourceCodeOrTranspiled: string,
    options: SandboxOptions = {}
  ): Promise<SandboxResult> {
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const memoryLimitMb = options.memoryLimitMb ?? this.defaultMemoryLimitMb;

    // Deteksi jika input masih berupa kode sumber WibuScript (belum ditranspilasi)
    let jsCode = sourceCodeOrTranspiled;
    if (
      !sourceCodeOrTranspiled.includes("// Hasil Transpilasi WibuScript") &&
      !sourceCodeOrTranspiled.includes('"use strict"')
    ) {
      try {
        jsCode = transpileToJS(sourceCodeOrTranspiled);
      } catch (err) {
        return {
          success: false,
          output: [],
          error: `Transpilasi gagal: ${err instanceof Error ? err.message : String(err)}`,
          executionTimeMs: 0,
        };
      }
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const outputBuffer: string[] = [];

    const isNode =
      typeof process !== "undefined" &&
      process.versions != null &&
      Boolean(process.versions.node) &&
      typeof window === "undefined";

    if (isNode) {
      return this.executeNodeWorker(
        jsCode,
        executionId,
        timeoutMs,
        memoryLimitMb,
        options,
        outputBuffer
      );
    } else {
      return this.executeBrowserWorker(
        jsCode,
        executionId,
        timeoutMs,
        options,
        outputBuffer
      );
    }
  }

  private async executeNodeWorker(
    code: string,
    id: string,
    timeoutMs: number,
    memoryLimitMb: number,
    options: SandboxOptions,
    outputBuffer: string[]
  ): Promise<SandboxResult> {
    const { Worker } = await import("node:worker_threads");
    const startTime = Date.now();

    return new Promise<SandboxResult>((resolve) => {
      let isSettled = false;
      let timer: NodeJS.Timeout | null = null;

      const worker = new Worker(WORKER_SCRIPT_SOURCE, {
        eval: true,
        resourceLimits: {
          maxOldGenerationSizeMb: memoryLimitMb,
        },
      });

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        worker.terminate().catch(() => {});
      };

      timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          resolve({
            success: false,
            output: outputBuffer,
            error: `Eksekusi dibatalkan: batas waktu eksekusi (${timeoutMs} ms) terlampaui.`,
            executionTimeMs: Date.now() - startTime,
          });
        }
      }, timeoutMs);

      worker.on("message", (msg: { type: string; id: string; data?: string; result?: unknown; error?: string; executionTimeMs?: number }) => {
        if (msg.id !== id) return;

        if (msg.type === "STDOUT" && msg.data != null) {
          outputBuffer.push(msg.data);
          if (options.onStdout) options.onStdout(msg.data);
        } else if (msg.type === "STDERR" && msg.data != null) {
          outputBuffer.push(msg.data);
          if (options.onStderr) options.onStderr(msg.data);
        } else if (msg.type === "SUCCESS") {
          if (!isSettled) {
            isSettled = true;
            cleanup();
            resolve({
              success: true,
              output: outputBuffer,
              result: msg.result,
              executionTimeMs: msg.executionTimeMs ?? (Date.now() - startTime),
            });
          }
        } else if (msg.type === "ERROR") {
          if (!isSettled) {
            isSettled = true;
            cleanup();
            resolve({
              success: false,
              output: outputBuffer,
              error: msg.error || "Galat tidak diketahui di dalam sandbox.",
              executionTimeMs: msg.executionTimeMs ?? (Date.now() - startTime),
            });
          }
        }
      });

      worker.on("error", (err: unknown) => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          resolve({
            success: false,
            output: outputBuffer,
            error: err instanceof Error ? err.message : String(err),
            executionTimeMs: Date.now() - startTime,
          });
        }
      });

      worker.on("exit", (code) => {
        if (!isSettled) {
          isSettled = true;
          if (timer) clearTimeout(timer);
          if (code !== 0) {
            resolve({
              success: false,
              output: outputBuffer,
              error: `Worker berhenti tiba-tiba dengan kode keluar: ${code}`,
              executionTimeMs: Date.now() - startTime,
            });
          }
        }
      });

      // Kirim payload kode sumber ke worker
      worker.postMessage({ type: "EXECUTE", id, code });
    });
  }

  private async executeBrowserWorker(
    code: string,
    id: string,
    timeoutMs: number,
    options: SandboxOptions,
    outputBuffer: string[]
  ): Promise<SandboxResult> {
    const startTime = Date.now();

    return new Promise<SandboxResult>((resolve) => {
      let isSettled = false;
      let timer: number | null = null;

      const blob = new Blob([WORKER_SCRIPT_SOURCE], {
        type: "application/javascript",
      });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      const cleanup = () => {
        if (timer !== null) clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
      };

      timer = window.setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          resolve({
            success: false,
            output: outputBuffer,
            error: `Eksekusi dibatalkan: batas waktu eksekusi (${timeoutMs} ms) terlampaui.`,
            executionTimeMs: Date.now() - startTime,
          });
        }
      }, timeoutMs);

      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (!msg || msg.id !== id) return;

        if (msg.type === "STDOUT" && msg.data != null) {
          outputBuffer.push(msg.data);
          if (options.onStdout) options.onStdout(msg.data);
        } else if (msg.type === "STDERR" && msg.data != null) {
          outputBuffer.push(msg.data);
          if (options.onStderr) options.onStderr(msg.data);
        } else if (msg.type === "SUCCESS") {
          if (!isSettled) {
            isSettled = true;
            cleanup();
            resolve({
              success: true,
              output: outputBuffer,
              result: msg.result,
              executionTimeMs: msg.executionTimeMs ?? (Date.now() - startTime),
            });
          }
        } else if (msg.type === "ERROR") {
          if (!isSettled) {
            isSettled = true;
            cleanup();
            resolve({
              success: false,
              output: outputBuffer,
              error: msg.error || "Galat runtime di dalam web worker sandbox.",
              executionTimeMs: msg.executionTimeMs ?? (Date.now() - startTime),
            });
          }
        }
      };

      worker.onerror = (err: unknown) => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          resolve({
            success: false,
            output: outputBuffer,
            error:
              err instanceof Error
                ? err.message
                : typeof err === "object" && err !== null && "message" in err
                ? String((err as { message: unknown }).message)
                : "Galat tak tertangani pada Web Worker sandbox.",
            executionTimeMs: Date.now() - startTime,
          });
        }
      };

      worker.postMessage({ type: "EXECUTE", id, code });
    });
  }
}

/**
 * Fungsi pembantu praktis untuk menjalankan kode WibuScript di dalam sandbox terisolasi.
 */
export async function runInSandbox(
  sourceCodeOrTranspiled: string,
  options?: SandboxOptions
): Promise<SandboxResult> {
  const sandbox = new WibuSandbox(options);
  return sandbox.execute(sourceCodeOrTranspiled, options);
}
