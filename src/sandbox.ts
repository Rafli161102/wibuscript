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

const MAX_SANDBOX_SOURCE_LENGTH = 1_000_000;
const MAX_SANDBOX_OUTPUT_LINES = 1_000;
const MAX_SANDBOX_OUTPUT_LINE_LENGTH = 10_000;

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

        const vm = require("node:vm");
        const safeConsole = Object.create(null);
        const stringify = (value) => {
          if (typeof value === "string") return value;
          try { return JSON.stringify(value); } catch {
            try { return String(value); } catch { return "[unserializable]"; }
          }
        };
        const sendLog = (type, args) => {
          const data = args.map(stringify).join(" ");
          parentPort.postMessage({ type, id, data });
        };
        const safeLog = (...args) => sendLog("STDOUT", args);
        const safeError = (...args) => sendLog("STDERR", args);
        // Do not expose host-realm functions/prototypes to the VM context.
        Object.setPrototypeOf(safeLog, null);
        Object.setPrototypeOf(safeError, null);
        safeConsole.log = safeLog;
        safeConsole.info = safeLog;
        safeConsole.warn = safeLog;
        safeConsole.error = safeError;

        try {
          // Defense in depth: no process/require/host objects are injected.
          // Disable eval/new Function and WebAssembly compilation inside the context.
          const context = vm.createContext({ console: safeConsole }, {
            codeGeneration: { strings: false, wasm: false },
          });
          const script = new vm.Script(
            '(async () => { "use strict";\\n' + code + '\\n})()',
            { filename: "<wibuscript-sandbox>" }
          );
          const res = await script.runInContext(context, { timeout: Math.max(1, (msg.timeoutMs || 5000) + 100) });
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
        const deny = (api) => {
          const blocked = () => {
            throw new Error("Akses API browser '" + api + "' ditolak oleh sandbox isolasi.");
          };
          Object.setPrototypeOf(blocked, null);
          return blocked;
        };

        // Dedicated workers have no DOM. Also remove common network and
        // nested-worker entry points before evaluating generated JavaScript.
        for (const api of [
          "fetch", "XMLHttpRequest", "WebSocket", "EventSource",
          "Worker", "SharedWorker", "BroadcastChannel", "WebTransport",
          "RTCPeerConnection", "importScripts"
        ]) {
          try {
            Object.defineProperty(self, api, {
              configurable: false,
              enumerable: false,
              writable: false,
              value: deny(api),
            });
          } catch {
            try { self[api] = deny(api); } catch {}
          }
        }

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

    if (sourceCodeOrTranspiled.length > MAX_SANDBOX_SOURCE_LENGTH) {
      return {
        success: false,
        output: [],
        error: `Ukuran kode melebihi batas sandbox (${MAX_SANDBOX_SOURCE_LENGTH} karakter).`,
        executionTimeMs: 0,
      };
    }

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

      const appendOutput = (data: string, handler?: (line: string) => void) => {
        if (isSettled) return;
        if (outputBuffer.length >= MAX_SANDBOX_OUTPUT_LINES) {
          isSettled = true;
          cleanup();
          resolve({
            success: false,
            output: outputBuffer,
            error: `Batas output sandbox (${MAX_SANDBOX_OUTPUT_LINES} baris) terlampaui.`,
            executionTimeMs: Date.now() - startTime,
          });
          return;
        }
        const line = data.length > MAX_SANDBOX_OUTPUT_LINE_LENGTH
          ? `${data.slice(0, MAX_SANDBOX_OUTPUT_LINE_LENGTH)}… [baris dipotong]`
          : data;
        outputBuffer.push(line);
        handler?.(line);
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
          appendOutput(msg.data, options.onStdout);
        } else if (msg.type === "STDERR" && msg.data != null) {
          appendOutput(msg.data, options.onStderr);
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
          resolve({
            success: false,
            output: outputBuffer,
            error: `Worker berhenti sebelum mengirim hasil (kode keluar: ${code}).`,
            executionTimeMs: Date.now() - startTime,
          });
        }
      });

      // Kirim payload kode sumber ke worker
      worker.postMessage({ type: "EXECUTE", id, code, timeoutMs });
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

      const appendOutput = (data: string, handler?: (line: string) => void) => {
        if (isSettled) return;
        if (outputBuffer.length >= MAX_SANDBOX_OUTPUT_LINES) {
          isSettled = true;
          cleanup();
          resolve({
            success: false,
            output: outputBuffer,
            error: `Batas output sandbox (${MAX_SANDBOX_OUTPUT_LINES} baris) terlampaui.`,
            executionTimeMs: Date.now() - startTime,
          });
          return;
        }
        const line = data.length > MAX_SANDBOX_OUTPUT_LINE_LENGTH
          ? `${data.slice(0, MAX_SANDBOX_OUTPUT_LINE_LENGTH)}… [baris dipotong]`
          : data;
        outputBuffer.push(line);
        handler?.(line);
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
          appendOutput(msg.data, options.onStdout);
        } else if (msg.type === "STDERR" && msg.data != null) {
          appendOutput(msg.data, options.onStderr);
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
