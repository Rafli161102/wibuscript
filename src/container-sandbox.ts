import { spawn } from "node:child_process";

export interface ContainerSandboxOptions {
  /** Docker/Podman-compatible CLI executable. Defaults to "docker". */
  dockerBinary?: string;
  /** Prebuilt runner image. Build it from the repository Dockerfile first. */
  image?: string;
  timeoutMs?: number;
  memoryLimitMb?: number;
  cpuLimit?: number;
  maxSourceLength?: number;
  maxOutputBytes?: number;
}

export interface ContainerSandboxResult {
  success: boolean;
  output: string[];
  result?: string;
  error?: string;
  executionTimeMs: number;
}

interface RunnerPayload {
  success: boolean;
  output?: string[];
  result?: string;
  error?: string;
  executionTimeMs?: number;
}

const DEFAULTS = {
  timeoutMs: 10_000,
  memoryLimitMb: 128,
  cpuLimit: 1,
  maxSourceLength: 1_000_000,
  maxOutputBytes: 1_048_576,
};

function assertRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} harus berada di antara ${min} dan ${max}.`);
  }
}

function isValidImageName(image: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9._/:@-]*$/.test(image);
}

/**
 * Docker-backed runner for code that must be isolated from the host process.
 *
 * This requires a trusted, locally built runner image and an available Docker
 * daemon. The container is launched with no network, a read-only root
 * filesystem, a non-root uid, dropped capabilities, and explicit resource
 * limits. It is a stronger boundary than Worker Threads/node:vm, but still
 * depends on the host container runtime and kernel.
 */
export class ContainerSandbox {
  private readonly dockerBinary: string;
  private readonly image: string;
  private readonly timeoutMs: number;
  private readonly memoryLimitMb: number;
  private readonly cpuLimit: number;
  private readonly maxSourceLength: number;
  private readonly maxOutputBytes: number;

  constructor(options: ContainerSandboxOptions = {}) {
    this.dockerBinary = options.dockerBinary ?? "docker";
    this.image = options.image ?? "wibuscript-runner:latest";
    this.timeoutMs = options.timeoutMs ?? DEFAULTS.timeoutMs;
    this.memoryLimitMb = options.memoryLimitMb ?? DEFAULTS.memoryLimitMb;
    this.cpuLimit = options.cpuLimit ?? DEFAULTS.cpuLimit;
    this.maxSourceLength = options.maxSourceLength ?? DEFAULTS.maxSourceLength;
    this.maxOutputBytes = options.maxOutputBytes ?? DEFAULTS.maxOutputBytes;

    if (!isValidImageName(this.image)) {
      throw new Error("Nama image container tidak valid.");
    }
    assertRange("timeoutMs", this.timeoutMs, 100, 60_000);
    assertRange("memoryLimitMb", this.memoryLimitMb, 64, 4_096);
    assertRange("cpuLimit", this.cpuLimit, 0.1, 8);
    assertRange("maxSourceLength", this.maxSourceLength, 1, 1_000_000);
    assertRange("maxOutputBytes", this.maxOutputBytes, 1_024, 16_777_216);
  }

  public async execute(sourceCode: string): Promise<ContainerSandboxResult> {
    const startedAt = Date.now();
    if (typeof sourceCode !== "string" || sourceCode.length > this.maxSourceLength) {
      return {
        success: false,
        output: [],
        error: `Ukuran kode melebihi batas container sandbox (${this.maxSourceLength} karakter).`,
        executionTimeMs: 0,
      };
    }

    const args = [
      "run",
      "--rm",
      "--interactive",
      "--network=none",
      "--read-only",
      "--init",
      "--stop-timeout=1",
      `--memory=${this.memoryLimitMb}m`,
      `--memory-swap=${this.memoryLimitMb}m`,
      `--cpus=${this.cpuLimit}`,
      "--pids-limit=64",
      "--cap-drop=ALL",
      "--security-opt=no-new-privileges:true",
      "--user=65532:65532",
      "--tmpfs=/tmp:rw,noexec,nosuid,nodev,size=16m",
      this.image,
    ];

    return new Promise<ContainerSandboxResult>((resolve) => {
      let settled = false;
      let timedOut = false;
      let outputTooLarge = false;
      let stdout = "";
      let stderr = "";
      const child = spawn(this.dockerBinary, args, {
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
      });

      const finish = (result: ContainerSandboxResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(result);
      };

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 250).unref();
      }, this.timeoutMs);

      child.stdout.on("data", (chunk: Buffer) => {
        if (settled || outputTooLarge) return;
        if (Buffer.byteLength(stdout) + chunk.length > this.maxOutputBytes) {
          outputTooLarge = true;
          child.kill("SIGKILL");
          return;
        }
        stdout += chunk.toString("utf8");
      });

      child.stderr.on("data", (chunk: Buffer) => {
        if (stderr.length < 8_192) {
          stderr += chunk.toString("utf8").slice(0, 8_192 - stderr.length);
        }
      });

      child.on("error", (error: Error) => {
        finish({
          success: false,
          output: [],
          error: `Gagal menjalankan container runtime: ${error.message}. Pastikan Docker tersedia dan daemon aktif.`,
          executionTimeMs: Date.now() - startedAt,
        });
      });

      child.on("close", (code) => {
        if (timedOut) {
          finish({
            success: false,
            output: [],
            error: `Eksekusi container melewati batas waktu (${this.timeoutMs} ms).`,
            executionTimeMs: Date.now() - startedAt,
          });
          return;
        }
        if (outputTooLarge) {
          finish({
            success: false,
            output: [],
            error: `Output container melewati batas ${this.maxOutputBytes} byte.`,
            executionTimeMs: Date.now() - startedAt,
          });
          return;
        }

        let payload: RunnerPayload;
        try {
          payload = JSON.parse(stdout) as RunnerPayload;
        } catch {
          finish({
            success: false,
            output: [],
            error: code === 0
              ? "Container runner mengembalikan respons yang tidak valid."
              : `Container runner gagal (exit ${code}): ${stderr.trim() || stdout.trim() || "tidak ada detail"}`,
            executionTimeMs: Date.now() - startedAt,
          });
          return;
        }

        finish({
          success: payload.success === true && code === 0,
          output: Array.isArray(payload.output) ? payload.output : [],
          result: payload.result,
          error: payload.error,
          executionTimeMs: payload.executionTimeMs ?? Date.now() - startedAt,
        });
      });

      child.stdin.on("error", () => {
        // The process may exit before it consumes stdin; the close handler
        // reports the actionable container error.
      });
      child.stdin.end(JSON.stringify({ source: sourceCode, timeoutMs: this.timeoutMs }));
    });
  }
}
