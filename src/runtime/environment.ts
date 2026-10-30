// WibuScript runtime environment, execution limits, and in-memory module registry.
import type { RuntimeValue } from "./values";

export class RuntimeSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeSystemError";
  }
}

// ----------------------------------------------------------------------------
// ENVIRONMENT (LINGKUP VARIABEL & FUNGSI)
// ----------------------------------------------------------------------------

export interface EnvironmentOptions {
  outputHandler?: (message: string) => void;
  outputLog?: string[];
  maxLoopIterations?: number;
  maxCallStackDepth?: number;
  timeoutMs?: number;
  isCancelledRef?: { current: boolean };
  allowFs?: boolean;
}

// Virtual Modules Registry (berguna untuk lingkungan Web Playground & Browser)
export const VIRTUAL_MODULES = new Map<string, string>();

export function registerVirtualModule(modulePath: string, code: string): void {
  VIRTUAL_MODULES.set(modulePath, code);
}

export function clearVirtualModules(): void {
  VIRTUAL_MODULES.clear();
}

export class Environment {
  private parent?: Environment | undefined;
  private variables: Map<string, RuntimeValue>;
  public exports: Map<string, RuntimeValue>;

  // Keamanan & Pengaman Batasan Eksekusi (Safety Limits)
  public maxLoopIterations: number = 100_000;
  public maxCallStackDepth: number = 1000;
  public timeoutMs?: number | undefined;
  public isCancelledRef?: { current: boolean } | undefined;
  public allowFs: boolean = true;
  public executionStartTime: number;
  public loopIterationCount: number = 0;
  public callStackDepth: number = 0;

  constructor(parentEnv?: Environment | undefined) {
    this.parent = parentEnv;
    this.variables = new Map();
    this.exports = new Map();
    this.executionStartTime = parentEnv ? parentEnv.executionStartTime : Date.now();
    if (parentEnv) {
      this.maxLoopIterations = parentEnv.maxLoopIterations;
      this.maxCallStackDepth = parentEnv.maxCallStackDepth;
      this.timeoutMs = parentEnv.timeoutMs;
      this.isCancelledRef = parentEnv.isCancelledRef;
      this.allowFs = parentEnv.allowFs;
    }
  }

  public getRoot(): Environment {
    let curr: Environment = this;
    while (curr.parent) {
      curr = curr.parent;
    }
    return curr;
  }

  public checkLimits(): void {
    const root = this.getRoot();
    if (root.isCancelledRef?.current) {
      throw new RuntimeSystemError("[Runtime Error] Eksekusi dihentikan oleh pengguna (Cancelled).");
    }
    if (root.timeoutMs && Date.now() - root.executionStartTime > root.timeoutMs) {
      throw new RuntimeSystemError(
        `[Runtime Error] Batas waktu eksekusi (${root.timeoutMs}ms) terlampaui. Eksekusi dihentikan demi keamanan!`
      );
    }
  }

  public declareVar(name: string, value: RuntimeValue): RuntimeValue {
    if (this.variables.has(name)) {
      throw new Error(
        `[Runtime Error] Variabel '${name}' sudah dideklarasikan pada lingkup ini.`
      );
    }
    this.variables.set(name, value);
    return value;
  }

  public assignVar(name: string, value: RuntimeValue): RuntimeValue {
    const env = this.resolve(name);
    env.variables.set(name, value);
    return value;
  }

  public lookupVar(name: string): RuntimeValue {
    const env = this.resolve(name);
    const value = env.variables.get(name);
    if (!value) {
      throw new Error(`[Runtime Error] Variabel '${name}' tidak terdefinisi.`);
    }
    return value;
  }

  public resolve(name: string): Environment {
    if (this.variables.has(name)) {
      return this;
    }
    if (this.parent) {
      return this.parent.resolve(name);
    }
    throw new Error(`[Runtime Error] Variabel '${name}' belum dideklarasikan.`);
  }
}
