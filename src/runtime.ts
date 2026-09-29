// File: src/runtime.ts
// ============================================================================
// WIBUSCRIPT RUNTIME & EVALUATOR
// Mesin Tree-Walking Interpreter untuk mengeksekusi AST WibuScript
// dalam lingkungan eksekusi Node.js maupun Web Browser.
// Dilengkapi penangkap output, pustaka standar asinkronus dengan Sistem Alias
// ganda (Versi Ekstensi Indo-Jepang vs Versi Shorthand Romaji Murni), dukungan Objek {},
// Akses Properti Titik (obj.prop), dan Kontrol Perulangan (Break/Continue).
// ============================================================================

import fs from "fs";
import path from "path";

import type {
  Statement,
  Program,
  VariableDeclaration,
  IfStatement,
  LoopStatement,
  FunctionDeclaration,
  ReturnStatement,
  BlockStatement,
  ExpressionStatement,
  BreakStatement,
  ContinueStatement,
  TryCatchStatement,
  ForEachStatement,
  AssignmentExpression,
  BinaryExpression,
  UnaryExpression,
  ArrowFunctionExpression,
  CallExpression,
  Identifier,
  NumericLiteral,
  StringLiteral,
  BooleanLiteral,
  ArrayLiteral,
  ObjectLiteral,
  MemberExpr,
  ClassDeclaration,
  ExportStatement,
  ImportStatement,
  NewExpression,
  ThisExpression,
  MatchStatement,
  MatchCase,
  DestructuringPattern,
  ArrayPattern,
  ObjectPattern,
  SpreadElement,
  RestElement,
} from "./ast";
import { tokenize } from "./lexer";
import { Parser } from "./parser";

// ----------------------------------------------------------------------------
// TIPE NILAI RUNTIME
// ----------------------------------------------------------------------------

export type ValueType =
  | "null"
  | "number"
  | "boolean"
  | "string"
  | "array"
  | "object"
  | "native-fn"
  | "function"
  | "class"
  | "instance";

export interface RuntimeValue {
  type: ValueType;
}

export interface NullValue extends RuntimeValue {
  type: "null";
  value: null;
}

export interface NumberValue extends RuntimeValue {
  type: "number";
  value: number;
}

export interface BooleanValue extends RuntimeValue {
  type: "boolean";
  value: boolean;
}

export interface StringValue extends RuntimeValue {
  type: "string";
  value: string;
}

export interface ArrayValue extends RuntimeValue {
  type: "array";
  elements: RuntimeValue[];
}

export interface ObjectValue extends RuntimeValue {
  type: "object";
  properties: Map<string, RuntimeValue>;
}

export type NativeFnCall = (
  args: RuntimeValue[],
  env: Environment
) => RuntimeValue | Promise<RuntimeValue>;

export interface NativeFnValue extends RuntimeValue {
  type: "native-fn";
  call: NativeFnCall;
}

export interface FunctionValue extends RuntimeValue {
  type: "function";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Statement[];
}

export interface ClassValue extends RuntimeValue {
  type: "class";
  name: string;
  parentClass?: ClassValue | undefined;
  constructorMethod?: FunctionDeclaration | undefined;
  methods: Map<string, FunctionDeclaration>;
  declarationEnv: Environment;
}

export interface InstanceValue extends RuntimeValue {
  type: "instance";
  className: string;
  classVal: ClassValue;
  fields: Map<string, RuntimeValue>;
}

// ----------------------------------------------------------------------------
// SINYAL KONTROL ALUR (RETURN, BREAK, CONTINUE)
// ----------------------------------------------------------------------------

export interface ReturnSignal {
  isReturn: true;
  value: RuntimeValue;
}

export interface BreakSignal {
  isBreak: true;
}

export interface ContinueSignal {
  isContinue: true;
}

export type ControlSignal = ReturnSignal | BreakSignal | ContinueSignal;

// ----------------------------------------------------------------------------
// KONSTRUKTOR NILAI RUNTIME
// ----------------------------------------------------------------------------

export function MK_NULL(): NullValue {
  return { type: "null", value: null };
}

export function MK_NUMBER(n = 0): NumberValue {
  return { type: "number", value: n };
}

export function MK_BOOL(b = true): BooleanValue {
  return { type: "boolean", value: b };
}

export function MK_STRING(s = ""): StringValue {
  return { type: "string", value: s };
}

export function MK_ARRAY(elements: RuntimeValue[] = []): ArrayValue {
  return { type: "array", elements };
}

export function MK_OBJECT(
  properties = new Map<string, RuntimeValue>()
): ObjectValue {
  return { type: "object", properties };
}

export function MK_NATIVE_FN(call: NativeFnCall): NativeFnValue {
  return { type: "native-fn", call };
}

export function MK_CLASS(
  name: string,
  declarationEnv: Environment,
  methods = new Map<string, FunctionDeclaration>(),
  parentClass?: ClassValue,
  constructorMethod?: FunctionDeclaration
): ClassValue {
  return {
    type: "class",
    name,
    declarationEnv,
    methods,
    parentClass,
    constructorMethod,
  };
}

export function MK_INSTANCE(classVal: ClassValue): InstanceValue {
  return {
    type: "instance",
    className: classVal.name,
    classVal,
    fields: new Map(),
  };
}

export function formatRuntimeValue(val: RuntimeValue): string {
  switch (val.type) {
    case "string":
      return (val as StringValue).value;
    case "number":
      return String((val as NumberValue).value);
    case "boolean":
      return (val as BooleanValue).value ? "true" : "false";
    case "null":
      return "null";
    case "array": {
      const formattedItems = (val as ArrayValue).elements
        .map((el) => formatRuntimeValue(el))
        .join(", ");
      return `[${formattedItems}]`;
    }
    case "object": {
      const entries: string[] = [];
      (val as ObjectValue).properties.forEach((v, k) => {
        entries.push(`${k}: ${formatRuntimeValue(v)}`);
      });
      return entries.length === 0 ? "{}" : `{ ${entries.join(", ")} }`;
    }
    case "native-fn":
      return "[NativeFunction]";
    case "function":
      return `[Function: ${(val as FunctionValue).name}]`;
    case "class":
      return `[Sekte: ${(val as ClassValue).name}]`;
    case "instance": {
      const inst = val as InstanceValue;
      const entries: string[] = [];
      inst.fields.forEach((v, k) => {
        entries.push(`${k}: ${formatRuntimeValue(v)}`);
      });
      return entries.length === 0
        ? `<${inst.className}>`
        : `<${inst.className} { ${entries.join(", ")} }>`;
    }
    default:
      return "undefined";
  }
}

export function jsValueToRuntimeValue(val: unknown): RuntimeValue {
  if (val === null || val === undefined) return MK_NULL();
  if (typeof val === "boolean") return MK_BOOL(val);
  if (typeof val === "number") return MK_NUMBER(val);
  if (typeof val === "string") return MK_STRING(val);
  if (typeof val === "function") {
    const fn = val as (...args: unknown[]) => unknown;
    return MK_NATIVE_FN((args: RuntimeValue[]) => {
      const jsArgs = args.map(runtimeValueToJsValue);
      const res = fn(...jsArgs);
      return jsValueToRuntimeValue(res);
    });
  }
  if (Array.isArray(val)) {
    return MK_ARRAY(val.map(jsValueToRuntimeValue));
  }
  if (typeof val === "object") {
    const map = new Map<string, RuntimeValue>();
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      map.set(k, jsValueToRuntimeValue(v));
    }
    return MK_OBJECT(map);
  }
  return MK_STRING(String(val));
}

export function runtimeValueToJsValue(val: RuntimeValue): unknown {
  switch (val.type) {
    case "null":
      return null;
    case "boolean":
      return (val as BooleanValue).value;
    case "number":
      return (val as NumberValue).value;
    case "string":
      return (val as StringValue).value;
    case "array":
      return (val as ArrayValue).elements.map(runtimeValueToJsValue);
    case "object": {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of (val as ObjectValue).properties.entries()) {
        obj[k] = runtimeValueToJsValue(v);
      }
      return obj;
    }
    case "native-fn":
    case "function": {
      return (...jsArgs: unknown[]) => {
        const wibuArgs = jsArgs.map(jsValueToRuntimeValue);
        if (val.type === "native-fn") {
          const res = (val as NativeFnValue).call(wibuArgs, new Environment());
          return runtimeValueToJsValue(res as RuntimeValue);
        }
        return formatRuntimeValue(val);
      };
    }
    default:
      return formatRuntimeValue(val);
  }
}

export async function invokeFunction(
  callee: RuntimeValue,
  args: RuntimeValue[],
  env: Environment
): Promise<RuntimeValue> {
  const root = env.getRoot();
  root.checkLimits();

  if (callee.type === "native-fn") {
    const result = (callee as NativeFnValue).call(args, env);
    return result instanceof Promise ? await result : result;
  }

  if (callee.type === "function") {
    if (root.callStackDepth >= root.maxCallStackDepth) {
      throw new Error(
        `[Runtime Error] Batas kedalaman tumpukan panggilan (${root.maxCallStackDepth}) terlampaui. Terdeteksi rekursi tanpa batas (Infinite Recursion)!`
      );
    }

    root.callStackDepth++;
    try {
      const fn = callee as FunctionValue;
      const scope = new Environment(fn.declarationEnv);

      for (let i = 0; i < fn.parameters.length; i++) {
        const paramName = fn.parameters[i];
        if (paramName !== undefined) {
          const argVal = args[i] ?? MK_NULL();
          scope.declareVar(paramName, argVal);
        }
      }

      let lastVal: RuntimeValue = MK_NULL();
      for (const stmt of fn.body) {
        root.checkLimits();
        const result = await evaluate(stmt, scope);
        if (isReturnSignal(result)) {
          return result.value;
        }
        lastVal = result as RuntimeValue;
      }

      return lastVal;
    } finally {
      root.callStackDepth--;
    }
  }

  throw new Error(
    `[Runtime Error] Tipe '${callee.type}' bukan merupakan fungsi yang dapat dipanggil.`
  );
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
      throw new Error("[Runtime Error] Eksekusi dihentikan oleh pengguna (Cancelled).");
    }
    if (root.timeoutMs && Date.now() - root.executionStartTime > root.timeoutMs) {
      throw new Error(
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

function checkNodeEnvironment(): void {
  const isNode =
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null &&
    typeof fs !== "undefined" &&
    typeof fs.readFileSync === "function";

  if (!isNode) {
    throw new Error("Fitur I/O hanya tersedia di lingkungan Node.js/CLI");
  }
}

/**
 * Membuat Lingkup Global dengan dukungan penangkap output (output capture)
 * dan pustaka standar bawaan dengan arsitektur Sistem Alias ganda:
 * Versi Ekstensi (Indo-Jepang) vs Versi Shorthand (100% Romaji Jepang Murni).
 */
export function createGlobalEnvironment(
  optionsOrHandler?: EnvironmentOptions | ((message: string) => void)
): Environment {
  const env = new Environment();

  let outputHandler: ((message: string) => void) | undefined;
  let logArray: string[] | undefined;

  if (typeof optionsOrHandler === "function") {
    outputHandler = optionsOrHandler;
  } else if (optionsOrHandler) {
    outputHandler = optionsOrHandler.outputHandler;
    logArray = optionsOrHandler.outputLog;
    if (optionsOrHandler.maxLoopIterations !== undefined) {
      env.maxLoopIterations = optionsOrHandler.maxLoopIterations;
    }
    if (optionsOrHandler.maxCallStackDepth !== undefined) {
      env.maxCallStackDepth = optionsOrHandler.maxCallStackDepth;
    }
    if (optionsOrHandler.timeoutMs !== undefined) {
      env.timeoutMs = optionsOrHandler.timeoutMs;
    }
    if (optionsOrHandler.isCancelledRef !== undefined) {
      env.isCancelledRef = optionsOrHandler.isCancelledRef;
    }
  }
  env.executionStartTime = Date.now();

  // 1. Output Standar: kasihMite() (Ekstensi) vs mite() (Shorthand)
  const printFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const formatted = args.map((arg) => formatRuntimeValue(arg)).join(" ");

    if (outputHandler) {
      outputHandler(formatted);
    } else if (logArray) {
      logArray.push(formatted);
    } else {
      console.log(formatted);
    }

    return MK_NULL();
  });

  env.declareVar("kasihMite", printFn);
  env.declareVar("mite", printFn);
  env.declareVar("mi", printFn);
  env.declareVar("teriakAmba", printFn);
  env.declareVar("salamkenal", printFn);
  env.declareVar("print", printFn);
  env.declareVar("kuchiMite", printFn);
  env.declareVar("km", printFn);
  env.declareVar("bacotAmba", printFn);
  env.declareVar("omaeWaIu", printFn);
  env.declareVar("iuYo", printFn);
  env.declareVar("cawapresin", printFn);

  // 2. Delay: shibaraku (Murni) / siba (Singkat) / santuyDulu (Wibu) / nungguinLu (Rongawi)
  const delayFn = MK_NATIVE_FN(
    async (args: RuntimeValue[]): Promise<RuntimeValue> => {
      const firstArg = args[0];
      const delayMs =
        firstArg && firstArg.type === "number"
          ? (firstArg as NumberValue).value
          : 1000;
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
      return MK_NULL();
    }
  );

  env.declareVar("tungguBentarKudasai", delayFn);
  env.declareVar("mate", delayFn);
  env.declareVar("tungguBentar", delayFn);
  env.declareVar("shibaraku", delayFn);
  env.declareVar("siba", delayFn);
  env.declareVar("santuyDulu", delayFn);
  env.declareVar("matteNeSikit", delayFn);
  env.declareVar("nungguinLu", delayFn);

  // 3. Waktu Lokal: imaJikan (Murni) / ima (Singkat) / jamBerapaBanh (Wibu) / kopihitam (Rongawi)
  const waktuSekarangFn = MK_NATIVE_FN((): RuntimeValue => {
    return MK_STRING(new Date().toLocaleTimeString());
  });
  env.declareVar("sekarangImaDesu", waktuSekarangFn);
  env.declareVar("ima", waktuSekarangFn);
  env.declareVar("imaDesu", waktuSekarangFn);
  env.declareVar("waktuSekarang", waktuSekarangFn);
  env.declareVar("imaJikan", waktuSekarangFn);
  env.declareVar("jamBerapaBanh", waktuSekarangFn);
  env.declareVar("nanjiDesu", waktuSekarangFn);
  env.declareVar("kopihitam", waktuSekarangFn);
  env.declareVar("cekJamLur", waktuSekarangFn); // alias lama (deprecated)

  // 4. Panjang/Length: nagasa (Murni) / naga (Singkat) / seginiDoang (Wibu) / panjangberurat (Rongawi)
  const panjangFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const arg = args[0];
    if (!arg) {
      return MK_NUMBER(0);
    }
    if (arg.type === "array") {
      return MK_NUMBER((arg as ArrayValue).elements.length);
    }
    const str =
      arg.type === "string"
        ? (arg as StringValue).value
        : formatRuntimeValue(arg);
    return MK_NUMBER(str.length);
  });
  env.declareVar("tolongCekNagasa", panjangFn);
  env.declareVar("nagasa", panjangFn);
  env.declareVar("cekNagasa", panjangFn);
  env.declareVar("panjangTeks", panjangFn);
  env.declareVar("naga", panjangFn);
  env.declareVar("seginiDoang", panjangFn);
  env.declareVar("doreKurai", panjangFn);
  env.declareVar("panjangberurat", panjangFn);
  env.declareVar("cekUkuran", panjangFn);
  env.declareVar("itungPanjangLur", panjangFn); // alias lama (deprecated)

  // 5. Konversi Angka: suji (Murni) / suj (Singkat) / jadiAngkaBanh (Wibu) / ubahJadiDuit (Rongawi)
  const ubahAngkaFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const arg = args[0];
    if (!arg) {
      return MK_NUMBER(0);
    }
    const str =
      arg.type === "string"
        ? (arg as StringValue).value
        : formatRuntimeValue(arg);
    const parsed = Number(str);
    return MK_NUMBER(Number.isNaN(parsed) ? 0 : parsed);
  });
  env.declareVar("bikinJadiSuji", ubahAngkaFn);
  env.declareVar("sujiNi", ubahAngkaFn);
  env.declareVar("jadiSuji", ubahAngkaFn);
  env.declareVar("ubahAngka", ubahAngkaFn);
  env.declareVar("suji", ubahAngkaFn);
  env.declareVar("suj", ubahAngkaFn);
  env.declareVar("jadiAngkaBanh", ubahAngkaFn);
  env.declareVar("suujiNi", ubahAngkaFn);
  env.declareVar("ubahJadiDuit", ubahAngkaFn);

  // 6. Tipe Data: shurui (Murni) / shu (Singkat) / iniApaan (Wibu) / bendaApaanLur (Rongawi)
  const tipeDataFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const arg = args[0];
    if (!arg) {
      return MK_STRING("null");
    }
    switch (arg.type) {
      case "number":
        return MK_STRING("angka");
      case "string":
        return MK_STRING("teks");
      case "boolean":
        return MK_STRING("boolean");
      case "array":
        return MK_STRING("array");
      case "object":
        return MK_STRING("objek");
      case "null":
        return MK_STRING("null");
      case "function":
      case "native-fn":
        return MK_STRING("fungsi");
      default:
        return MK_STRING("null");
    }
  });
  env.declareVar("apaTipeKoreWa", tipeDataFn);
  env.declareVar("shurui", tipeDataFn);
  env.declareVar("tipeNani", tipeDataFn);
  env.declareVar("shu", tipeDataFn);
  env.declareVar("iniApaan", tipeDataFn);
  env.declareVar("naniTypeNe", tipeDataFn);
  env.declareVar("omagot", tipeDataFn);
  env.declareVar("bendaApaanLur", tipeDataFn); // alias lama (deprecated)

  // 7. Pangkat: beki (Murni) / bek (Singkat) / angkatin (Wibu) / naikinPangkat (Rongawi)
  const pangkatFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const baseArg = args[0];
    const expArg = args[1];
    const base =
      baseArg && baseArg.type === "number" ? (baseArg as NumberValue).value : 0;
    const exp =
      expArg && expArg.type === "number" ? (expArg as NumberValue).value : 1;
    return MK_NUMBER(Math.pow(base, exp));
  });
  env.declareVar("kalkulasiPangkatSuji", pangkatFn);
  env.declareVar("beki", pangkatFn);
  env.declareVar("pangkatSuji", pangkatFn);
  env.declareVar("bek", pangkatFn);
  env.declareVar("angkatin", pangkatFn);
  env.declareVar("tsuyokuNare", pangkatFn);
  env.declareVar("naikinPangkat", pangkatFn);

  // 8. Pembulatan: marume (Murni) / maru (Singkat) / bulatinBanh (Wibu) / rapihinAngka (Rongawi)
  const bulatFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const arg = args[0];
    const val =
      arg && arg.type === "number" ? (arg as NumberValue).value : 0;
    return MK_NUMBER(Math.round(val));
  });
  env.declareVar("bikinBulatSuji", bulatFn);
  env.declareVar("marume", bulatFn);
  env.declareVar("bulatSuji", bulatFn);
  env.declareVar("maru", bulatFn);
  env.declareVar("bulatinBanh", bulatFn);
  env.declareVar("rapihinAngka", bulatFn);
  env.declareVar("maneNi", bulatFn);

  // 9. Tambah Array: ireta (Murni) / ire (Singkat) / masukinSini (Wibu) / priaotot (Rongawi)
  const pushRetsuFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const target = args[0];
    const item = args[1] ?? MK_NULL();
    if (target && target.type === "array") {
      (target as ArrayValue).elements.push(item);
      return target;
    }
    return MK_NULL();
  });
  env.declareVar("masukinKeRetsu", pushRetsuFn);
  env.declareVar("tsuika", pushRetsuFn);
  env.declareVar("isiRetsu", pushRetsuFn);
  env.declareVar("ireta", pushRetsuFn);
  env.declareVar("ire", pushRetsuFn);
  env.declareVar("priaotot", pushRetsuFn);
  env.declareVar("haireNe", pushRetsuFn);
  env.declareVar("tambahBarang", pushRetsuFn);
  env.declareVar("masukinLur", pushRetsuFn); // alias lama (deprecated)

  // 10. Ambil Array: toru (Murni) / tor (Singkat) / deteike (Wibu) / danaterbakar (Rongawi)
  const popRetsuFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const target = args[0];
    if (target && target.type === "array") {
      const popped = (target as ArrayValue).elements.pop();
      return popped ?? MK_NULL();
    }
    return MK_NULL();
  });
  env.declareVar("keluarinDariRetsu", popRetsuFn);
  env.declareVar("sakujo", popRetsuFn);
  env.declareVar("buangRetsu", popRetsuFn);
  env.declareVar("toru", popRetsuFn);
  env.declareVar("tor", popRetsuFn);
  env.declareVar("deteike", popRetsuFn);
  env.declareVar("ambilBelakang", popRetsuFn);
  env.declareVar("danaterbakar", popRetsuFn);
  env.declareVar("keluarinBarang", popRetsuFn);

  // 11. Substring: potongKoreNagasa (Ekstensi) vs kiru (Shorthand)
  const potongTeksFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const strArg = args[0];
    const startArg = args[1];
    const endArg = args[2];
    if (!strArg) return MK_STRING("");

    const rawStr =
      strArg.type === "string"
        ? (strArg as StringValue).value
        : formatRuntimeValue(strArg);
    const start =
      startArg && startArg.type === "number"
        ? (startArg as NumberValue).value
        : 0;

    if (endArg && endArg.type === "number") {
      return MK_STRING(rawStr.substring(start, (endArg as NumberValue).value));
    }
    return MK_STRING(rawStr.substring(start));
  });
  env.declareVar("potongKoreNagasa", potongTeksFn);
  env.declareVar("kiru", potongTeksFn);
  env.declareVar("potongTeks", potongTeksFn);
  env.declareVar("kir", potongTeksFn);
  env.declareVar("kertaslecek", potongTeksFn);
  env.declareVar("kiriteNe", potongTeksFn);
  env.declareVar("cuilTeks", potongTeksFn);
  env.declareVar("potongSini", potongTeksFn);
  env.declareVar("gorokLur", potongTeksFn); // alias lama (deprecated)

  // 12. Uppercase: ookiku (Murni) / ook (Singkat) / gedeinHuruf (Wibu) / gakhabisgila (Rongawi)
  const uppercaseFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const arg = args[0];
    if (!arg) return MK_STRING("");
    const str =
      arg.type === "string"
        ? (arg as StringValue).value
        : formatRuntimeValue(arg);
    return MK_STRING(str.toUpperCase());
  });
  env.declareVar("bikinGedeKore", uppercaseFn);
  env.declareVar("dekaku", uppercaseFn);
  env.declareVar("ookiku", uppercaseFn);
  env.declareVar("ook", uppercaseFn);
  env.declareVar("gedeinHuruf", uppercaseFn);
  env.declareVar("gakhabisgila", uppercaseFn);
  env.declareVar("ookiVoice", uppercaseFn);
  env.declareVar("besarinSemua", uppercaseFn);
  env.declareVar("gedeinLur", uppercaseFn); // alias lama (deprecated)

  // 13. Lowercase: chiisaku (Murni) / chi (Singkat) / kecilinHuruf (Wibu) / monyetbanyumas (Rongawi)
  const lowercaseFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const arg = args[0];
    if (!arg) return MK_STRING("");
    const str =
      arg.type === "string"
        ? (arg as StringValue).value
        : formatRuntimeValue(arg);
    return MK_STRING(str.toLowerCase());
  });
  env.declareVar("bikinKecilKore", lowercaseFn);
  env.declareVar("chiisaku", lowercaseFn);
  env.declareVar("chi", lowercaseFn);
  env.declareVar("kecilinHuruf", lowercaseFn);
  env.declareVar("monyetbanyumas", lowercaseFn);
  env.declareVar("chiisaiVoice", lowercaseFn);
  env.declareVar("kecilinSemua", lowercaseFn);
  env.declareVar("kecilinLur", lowercaseFn); // alias lama (deprecated)

  // 14. Generator Acak & Gacha RNG: randamu/gacha (Murni) / ran/gac (Singkat) / tarikGacha/gachaBanh (Wibu) / mputerNasib/kocokAngka (Rongawi)
  const gachaFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    // Mode 1: Pengundian Item dari Barisan (Array Gacha Pull)
    if (args.length > 0 && args[0]?.type === "array") {
      const items = (args[0] as ArrayValue).elements;
      if (items.length === 0) {
        return MK_NULL();
      }
      const weightsArg = args[1];
      // Pemilihan seragam jika bobot tidak diberikan
      if (!weightsArg || weightsArg.type !== "array") {
        const randIdx = Math.floor(Math.random() * items.length);
        return items[randIdx] ?? MK_NULL();
      }
      // Pemilihan berbobot (weighted RNG)
      const weights = (weightsArg as ArrayValue).elements.map((w) =>
        w.type === "number" ? (w as NumberValue).value : 1
      );
      const totalWeight = weights.reduce((acc, curr) => acc + curr, 0);
      if (totalWeight <= 0) {
        const randIdx = Math.floor(Math.random() * items.length);
        return items[randIdx] ?? MK_NULL();
      }
      let randomVal = Math.random() * totalWeight;
      for (let i = 0; i < items.length; i++) {
        const w = weights[i] ?? 1;
        if (randomVal < w) {
          return items[i] ?? MK_NULL();
        }
        randomVal -= w;
      }
      return items[items.length - 1] ?? MK_NULL();
    }

    // Mode 2: Bilangan Bulat Acak (min..max)
    let min = 0;
    let max = 100;
    if (args.length === 1) {
      const first = args[0];
      if (first && first.type === "number") {
        max = (first as NumberValue).value;
      }
    } else if (args.length >= 2) {
      const first = args[0];
      const second = args[1];
      if (first && first.type === "number") {
        min = (first as NumberValue).value;
      }
      if (second && second.type === "number") {
        max = (second as NumberValue).value;
      }
    }
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    const result = Math.floor(Math.random() * (high - low + 1)) + low;
    return MK_NUMBER(result);
  });
  env.declareVar("randamu", gachaFn);
  env.declareVar("ran", gachaFn);
  env.declareVar("gacha", gachaFn);
  env.declareVar("gac", gachaFn);
  env.declareVar("gachaBanh", gachaFn);
  env.declareVar("tarikGacha", gachaFn);
  env.declareVar("rudalmentah", gachaFn);
  env.declareVar("unmeiGacha", gachaFn);
  env.declareVar("kocokAngka", gachaFn);
  env.declareVar("mputerNasib", gachaFn);
  env.declareVar("spinZeus", gachaFn);
  env.declareVar("weeklypass", gachaFn);
  env.declareVar("gachaPull", gachaFn);
  env.declareVar("kocokLur", gachaFn); // alias lama (deprecated)

  // 15. Force Panic / Throw Error: shikei (Murni) / shi (Singkat) / matiinProgram (Wibu) / udahKelarinAja (Rongawi)
  const panicFn = MK_NATIVE_FN((args: RuntimeValue[]): never => {
    const firstArg = args[0];
    const message = firstArg
      ? formatRuntimeValue(firstArg)
      : "Terjadi kesalahan fatal (Panic).";
    throw new Error(`[Panic] ${message}`);
  });
  env.declareVar("yameteKudasai", panicFn);
  env.declareVar("yamete", panicFn);
  env.declareVar("shikei", panicFn);
  env.declareVar("shi", panicFn);
  env.declareVar("matiinProgram", panicFn);
  env.declareVar("shineeeYo", panicFn);
  env.declareVar("udahKelarinAja", panicFn);

  // 16. Inisialisasi Barisan/Array: retsu (Murni) / ret (Singkat) / bikinBarisan (Wibu) / kumpulinJawa (Rongawi)
  const retsuFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    return MK_ARRAY([...args]);
  });
  env.declareVar("bikinRetsu", retsuFn);
  env.declareVar("retsu", retsuFn);
  env.declareVar("ret", retsuFn);
  env.declareVar("bikinBarisan", retsuFn);
  env.declareVar("nakamaTachi", retsuFn);
  env.declareVar("kumpulinJawa", retsuFn);
  env.declareVar("kumpulinBocah", retsuFn);
  env.declareVar("budakhitam", retsuFn);

  // 17. Konstanta Bawaan
  env.declareVar("maji", MK_BOOL(true));
  env.declareVar("majiBener", MK_BOOL(true));
  env.declareVar("uso", MK_BOOL(false));
  env.declareVar("usoBanget", MK_BOOL(false));
  env.declareVar("kara", MK_NULL());
  env.declareVar("kosongZannen", MK_NULL());

  // 18. Baca Berkas: tolongBacaBerkas(path) vs yomu(path)
  const bacaBerkasFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    checkNodeEnvironment();

    const pathArg = args[0];
    if (!pathArg) {
      throw new Error("[Runtime Error] Argumen path berkas diperlukan.");
    }

    const rawPath =
      pathArg.type === "string"
        ? (pathArg as StringValue).value
        : formatRuntimeValue(pathArg);

    const resolvedPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), rawPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `[Runtime Error] Berkas tidak ditemukan pada path: ${resolvedPath}`
      );
    }

    const content = fs.readFileSync(resolvedPath, "utf-8");
    return MK_STRING(content);
  });

  env.declareVar("tolongBacaBerkas", bacaBerkasFn);
  env.declareVar("yomu", bacaBerkasFn);
  env.declareVar("bacaBerkas", bacaBerkasFn);
  env.declareVar("yo", bacaBerkasFn);
  env.declareVar("bacainBerkas", bacaBerkasFn);
  env.declareVar("yomimasuNe", bacaBerkasFn);
  env.declareVar("ototkawat", bacaBerkasFn);
  env.declareVar("bukaBerkasLur", bacaBerkasFn); // alias lama (deprecated)

  // 19. Tulis Berkas: kaku (Murni) / ka (Singkat) / tulisinBerkas (Wibu) / teksusang (Rongawi)
  const tulisBerkasFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    checkNodeEnvironment();

    const pathArg = args[0];
    const contentArg = args[1];

    if (!pathArg) {
      throw new Error("[Runtime Error] Argumen path berkas diperlukan.");
    }

    const rawPath =
      pathArg.type === "string"
        ? (pathArg as StringValue).value
        : formatRuntimeValue(pathArg);

    const content =
      contentArg !== undefined
        ? contentArg.type === "string"
          ? (contentArg as StringValue).value
          : formatRuntimeValue(contentArg)
        : "";

    const resolvedPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), rawPath);
    const parentDir = path.dirname(resolvedPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(resolvedPath, content, "utf-8");
    return MK_NULL();
  });

  env.declareVar("tolongTulisBerkas", tulisBerkasFn);
  env.declareVar("kaku", tulisBerkasFn);
  env.declareVar("tulisBerkas", tulisBerkasFn);
  env.declareVar("ka", tulisBerkasFn);
  env.declareVar("tulisinBerkas", tulisBerkasFn);
  env.declareVar("kakimasuNe", tulisBerkasFn);
  env.declareVar("teksusang", tulisBerkasFn);
  env.declareVar("coretBerkasLur", tulisBerkasFn); // alias lama (deprecated)

  // 20. Impor Modul: yobu (Murni) / yoB (Singkat) / panggilBerkas (Wibu) / sikatBanh (Rongawi)
  const imporModulFn = MK_NATIVE_FN(
    async (args: RuntimeValue[]): Promise<RuntimeValue> => {
      checkNodeEnvironment();

      const pathArg = args[0];
      if (!pathArg) {
        throw new Error("[Runtime Error] Argumen path modul diperlukan.");
      }

      let rawPath =
        pathArg.type === "string"
          ? (pathArg as StringValue).value
          : formatRuntimeValue(pathArg);

      let resolvedPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), rawPath);

      if (!fs.existsSync(resolvedPath)) {
        const inExamples = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "examples", rawPath);
        if (fs.existsSync(inExamples)) {
          resolvedPath = inExamples;
        } else if (!rawPath.endsWith(".wibu")) {
          const withExt = path.resolve(/*turbopackIgnore: true*/ process.cwd(), rawPath + ".wibu");
          const withExtInExamples = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "examples", rawPath + ".wibu");
          if (fs.existsSync(withExt)) {
            resolvedPath = withExt;
          } else if (fs.existsSync(withExtInExamples)) {
            resolvedPath = withExtInExamples;
          } else {
            throw new Error(
              `[Runtime Error] Modul '${rawPath}' tidak ditemukan pada path: ${resolvedPath}`
            );
          }
        } else {
          throw new Error(
            `[Runtime Error] Modul '${rawPath}' tidak ditemukan pada path: ${resolvedPath}`
          );
        }
      }

      const fileContent = fs.readFileSync(resolvedPath, "utf-8");
      const tokens = tokenize(fileContent);
      const parser = new Parser();
      const program = parser.produceAST(tokens);
      const result = await evaluate(program, env);
      return unwrapSignal(result);
    }
  );

  env.declareVar("tolongPanggilModul", imporModulFn);
  env.declareVar("yobu", imporModulFn);
  env.declareVar("panggilModul", imporModulFn);
  env.declareVar("yoB", imporModulFn);
  env.declareVar("panggilBerkas", imporModulFn);
  env.declareVar("mottekite", imporModulFn);
  env.declareVar("sikatBanh", imporModulFn);

  // 21. HTTP Fetch API: ukeru (Murni) / uke (Singkat) / ambilDataBanh (Wibu) / SepongMas (Rongawi)
  const fetchFn = MK_NATIVE_FN(
    async (args: RuntimeValue[]): Promise<RuntimeValue> => {
      const urlArg = args[0];
      if (!urlArg) {
        throw new Error(
          "[Runtime Error] Argumen URL diperlukan untuk fetch data."
        );
      }
      const url =
        urlArg.type === "string"
          ? (urlArg as StringValue).value
          : formatRuntimeValue(urlArg);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        let response: Response;
        try {
          response = await fetch(url, { signal: controller.signal });
        } finally {
          clearTimeout(timeoutId);
        }
        const text = await response.text();
        return MK_STRING(text);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `[Runtime Error] Gagal mengambil data dari URL '${url}': ${message}`
        );
      }
    }
  );

  env.declareVar("tolongAmbilData", fetchFn);
  env.declareVar("totte", fetchFn);
  env.declareVar("ambilData", fetchFn);
  env.declareVar("ukeru", fetchFn);
  env.declareVar("uke", fetchFn);
  env.declareVar("ambilDataBanh", fetchFn);
  env.declareVar("tottekiteNe", fetchFn);
  env.declareVar("SepongMas", fetchFn);

  // 22. Penguraian & Pembungkusan JSON:
  // Parse: kanjiNi (Murni) / kn (Singkat) / jadiObjekBanh (Wibu) / salintempel (Rongawi)
  const jsonParseFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const textArg = args[0];
    if (!textArg) {
      throw new Error("[Runtime Error] Argumen teks JSON diperlukan untuk kanjiNi / urai JSON.");
    }
    const raw = textArg.type === "string" ? (textArg as StringValue).value : formatRuntimeValue(textArg);
    try {
      const parsed = JSON.parse(raw);
      return jsValueToRuntimeValue(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`[Runtime Error] Format JSON tidak valid: ${msg}`);
    }
  });
  env.declareVar("kanjiNi", jsonParseFn);
  env.declareVar("kn", jsonParseFn);
  env.declareVar("jadiObjekBanh", jsonParseFn);
  env.declareVar("wakattaYo", jsonParseFn);
  env.declareVar("salintempel", jsonParseFn);
  env.declareVar("uraiJsonLur", jsonParseFn); // alias lama (deprecated)

  // Stringify: kanjiMojiretsu (Murni) / kmj (Singkat) / jadiTeksBanh (Wibu) / copascaption (Rongawi)
  const jsonStringifyFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const valArg = args[0] ?? MK_NULL();
    const jsObj = runtimeValueToJsValue(valArg);
    return MK_STRING(JSON.stringify(jsObj));
  });
  env.declareVar("kanjiMojiretsu", jsonStringifyFn);
  env.declareVar("kmj", jsonStringifyFn);
  env.declareVar("jadiTeksBanh", jsonStringifyFn);
  env.declareVar("oshieteNe", jsonStringifyFn);
  env.declareVar("copascaption", jsonStringifyFn);
  env.declareVar("bungkusJsonLur", jsonStringifyFn); // alias lama (deprecated)

  // 23. Fungsi Tingkat Tinggi Barisan / Array:
  // Map: utsusu (Murni) / utu (Singkat) / petainBanh (Wibu) / predikbola (Rongawi)
  const mapFn = MK_NATIVE_FN(async (args: RuntimeValue[], scopeEnv: Environment): Promise<RuntimeValue> => {
    const arrArg = args[0];
    const fnArg = args[1];
    if (!arrArg || arrArg.type !== "array") {
      throw new Error("[Runtime Error] Argumen pertama utsusu harus berupa barisan (array).");
    }
    if (!fnArg || (fnArg.type !== "function" && fnArg.type !== "native-fn")) {
      throw new Error("[Runtime Error] Argumen kedua utsusu harus berupa fungsi callback.");
    }
    const arr = arrArg as ArrayValue;
    const mapped: RuntimeValue[] = [];
    for (let i = 0; i < arr.elements.length; i++) {
      const el = arr.elements[i] as RuntimeValue;
      const res = await invokeFunction(fnArg, [el, MK_NUMBER(i), arr], scopeEnv);
      mapped.push(res);
    }
    return MK_ARRAY(mapped);
  });
  env.declareVar("utsusu", mapFn);
  env.declareVar("utu", mapFn);
  env.declareVar("petainBanh", mapFn);
  env.declareVar("henshinSuru", mapFn);
  env.declareVar("predikbola", mapFn);
  env.declareVar("petainLur", mapFn); // alias lama (deprecated)

  // Filter: erabu (Murni) / era (Singkat) / saringBanh (Wibu) / morebullets (Rongawi)
  const filterFn = MK_NATIVE_FN(async (args: RuntimeValue[], scopeEnv: Environment): Promise<RuntimeValue> => {
    const arrArg = args[0];
    const fnArg = args[1];
    if (!arrArg || arrArg.type !== "array") {
      throw new Error("[Runtime Error] Argumen pertama erabu harus berupa barisan (array).");
    }
    if (!fnArg || (fnArg.type !== "function" && fnArg.type !== "native-fn")) {
      throw new Error("[Runtime Error] Argumen kedua erabu harus berupa fungsi callback.");
    }
    const arr = arrArg as ArrayValue;
    const filtered: RuntimeValue[] = [];
    for (let i = 0; i < arr.elements.length; i++) {
      const el = arr.elements[i] as RuntimeValue;
      const res = await invokeFunction(fnArg, [el, MK_NUMBER(i), arr], scopeEnv);
      if (isTruthy(res)) {
        filtered.push(el);
      }
    }
    return MK_ARRAY(filtered);
  });
  env.declareVar("erabu", filterFn);
  env.declareVar("era", filterFn);
  env.declareVar("saringBanh", filterFn);
  env.declareVar("senbatsuNe", filterFn);
  env.declareVar("morebullets", filterFn);
  env.declareVar("saringLur", filterFn); // alias lama (deprecated)

  // Find: mitsukeru (Murni) / mitu (Singkat) / cariinBanh (Wibu) / fesnuker (Rongawi)
  const findFn = MK_NATIVE_FN(async (args: RuntimeValue[], scopeEnv: Environment): Promise<RuntimeValue> => {
    const arrArg = args[0];
    const fnArg = args[1];
    if (!arrArg || arrArg.type !== "array") {
      throw new Error("[Runtime Error] Argumen pertama mitsukeru harus berupa barisan (array).");
    }
    if (!fnArg || (fnArg.type !== "function" && fnArg.type !== "native-fn")) {
      throw new Error("[Runtime Error] Argumen kedua mitsukeru harus berupa fungsi callback.");
    }
    const arr = arrArg as ArrayValue;
    for (let i = 0; i < arr.elements.length; i++) {
      const el = arr.elements[i] as RuntimeValue;
      const res = await invokeFunction(fnArg, [el, MK_NUMBER(i), arr], scopeEnv);
      if (isTruthy(res)) {
        return el;
      }
    }
    return MK_NULL();
  });
  env.declareVar("mitsukeru", findFn);
  env.declareVar("mitu", findFn);
  env.declareVar("cariinBanh", findFn);
  env.declareVar("mitsuketaYo", findFn);
  env.declareVar("fesnuker", findFn);

  // 24. Matematika Tingkat Lanjut:
  // Akar Kuadrat (SQRT): ruuto (Murni) / ru (Singkat) / akarPangkat (Wibu) / robogor (Rongawi)
  const sqrtFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const val = args[0];
    if (!val || val.type !== "number") {
      throw new Error("[Runtime Error] Argumen perhitungan akar harus berupa angka.");
    }
    return MK_NUMBER(Math.sqrt((val as NumberValue).value));
  });
  env.declareVar("ruuto", sqrtFn);
  env.declareVar("ru", sqrtFn);
  env.declareVar("akarPangkat", sqrtFn);
  env.declareVar("heihoukon", sqrtFn);
  env.declareVar("robogor", sqrtFn);
  env.declareVar("akarLur", sqrtFn); // alias lama (deprecated)

  // Nilai Mutlak (ABS): zettaichi (Murni) / zet (Singkat) / mutlakBanh (Wibu) / ironiman (Rongawi)
  const absFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const val = args[0];
    if (!val || val.type !== "number") {
      throw new Error("[Runtime Error] Argumen perhitungan nilai mutlak harus berupa angka.");
    }
    return MK_NUMBER(Math.abs((val as NumberValue).value));
  });
  env.declareVar("zettaichi", absFn);
  env.declareVar("zet", absFn);
  env.declareVar("mutlakBanh", absFn);
  env.declareVar("zettaiChi", absFn);
  env.declareVar("ironiman", absFn);
  env.declareVar("mutlakLur", absFn); // alias lama (deprecated)

  // Pembulatan ke Bawah (FLOOR): kiriSute (Murni) / ks (Singkat) / bawahinBanh (Wibu) / hutanselatan (Rongawi)
  const floorFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const val = args[0];
    if (!val || val.type !== "number") {
      throw new Error("[Runtime Error] Argumen pembulatan ke bawah harus berupa angka.");
    }
    return MK_NUMBER(Math.floor((val as NumberValue).value));
  });
  env.declareVar("kiriSute", floorFn);
  env.declareVar("ks", floorFn);
  env.declareVar("bawahinBanh", floorFn);
  env.declareVar("shitaKiri", floorFn);
  env.declareVar("hutanselatan", floorFn);
  env.declareVar("bawahLur", floorFn); // alias lama (deprecated)

  // Pembulatan ke Atas (CEIL): kiriAge (Murni) / kia (Singkat) / atasinBanh (Wibu) / menaracukur (Rongawi)
  const ceilFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const val = args[0];
    if (!val || val.type !== "number") {
      throw new Error("[Runtime Error] Argumen pembulatan ke atas harus berupa angka.");
    }
    return MK_NUMBER(Math.ceil((val as NumberValue).value));
  });
  env.declareVar("kiriAge", ceilFn);
  env.declareVar("kia", ceilFn);
  env.declareVar("atasinBanh", ceilFn);
  env.declareVar("ueKiri", ceilFn);
  env.declareVar("menaracukur", ceilFn);
  env.declareVar("atasLur", ceilFn); // alias lama (deprecated)

  // 25. Manipulasi Teks & String (String Utilities):
  // Pecah String: bunri (Murni) / bu (Singkat) / pecahKata (Wibu) / bedahno (Rongawi)
  const bunriFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const strArg = args[0];
    const sepArg = args[1];
    if (!strArg || strArg.type !== "string") {
      throw new Error("[Runtime Error] Argumen pertama bunri harus berupa teks (string).");
    }
    const sep = sepArg && sepArg.type === "string" ? (sepArg as StringValue).value : "";
    const parts = (strArg as StringValue).value.split(sep);
    return MK_ARRAY(parts.map((p) => MK_STRING(p)));
  });
  env.declareVar("bunri", bunriFn);
  env.declareVar("bu", bunriFn);
  env.declareVar("pecahKata", bunriFn);
  env.declareVar("barabara", bunriFn);
  env.declareVar("bedahno", bunriFn);
  env.declareVar("pecahin", bunriFn);
  env.declareVar("pecahkepala", bunriFn);

  // Gabung String: tsunagu (Murni) / tsuna (Singkat) / lemKata (Wibu) / gandengen (Rongawi)
  const tsunaguFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const arrArg = args[0];
    const sepArg = args[1];
    if (!arrArg || arrArg.type !== "array") {
      throw new Error("[Runtime Error] Argumen pertama tsunagu harus berupa barisan (array).");
    }
    const sep = sepArg && sepArg.type === "string" ? (sepArg as StringValue).value : "";
    const joined = (arrArg as ArrayValue).elements
      .map((el) => formatRuntimeValue(el))
      .join(sep);
    return MK_STRING(joined);
  });
  env.declareVar("tsunagu", tsunaguFn);
  env.declareVar("tsuna", tsunaguFn);
  env.declareVar("lemKata", tsunaguFn);
  env.declareVar("isshoNi", tsunaguFn);
  env.declareVar("gandengen", tsunaguFn);
  env.declareVar("lemin", tsunaguFn);
  env.declareVar("lendirmurni", tsunaguFn);

  // Ganti Substring: okikae (Murni) / oki (Singkat) / sulapKata (Wibu) / gantinen (Rongawi)
  const okikaeFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const strArg = args[0];
    const fromArg = args[1];
    const toArg = args[2];
    if (
      !strArg ||
      strArg.type !== "string" ||
      !fromArg ||
      fromArg.type !== "string" ||
      !toArg ||
      toArg.type !== "string"
    ) {
      throw new Error("[Runtime Error] Seluruh argumen okikae harus berupa teks (string).");
    }
    const res = (strArg as StringValue).value
      .split((fromArg as StringValue).value)
      .join((toArg as StringValue).value);
    return MK_STRING(res);
  });
  env.declareVar("okikae", okikaeFn);
  env.declareVar("oki", okikaeFn);
  env.declareVar("sulapKata", okikaeFn);
  env.declareVar("irekaeruNe", okikaeFn);
  env.declareVar("gantinen", okikaeFn);
  env.declareVar("tumbalkan", okikaeFn);
  env.declareVar("akuntumbal", okikaeFn);

  // Pangkas Spasi: kiri (Murni) / kri (Singkat) / pangkas (Wibu) / potongen (Rongawi)
  const kiriFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const strArg = args[0];
    if (!strArg || strArg.type !== "string") {
      throw new Error("[Runtime Error] Argumen kiri harus berupa teks (string).");
    }
    return MK_STRING((strArg as StringValue).value.trim());
  });
  env.declareVar("kiri", kiriFn);
  env.declareVar("kri", kiriFn);
  env.declareVar("pangkas", kiriFn);
  env.declareVar("kireeNi", kiriFn);
  env.declareVar("potongen", kiriFn);
  env.declareVar("cukur", kiriFn);
  env.declareVar("cukurfade", kiriFn);

  // 26. Utilitas Koleksi & Array Tambahan:
  // Cek Keberadaan (Includes): fukumu (Murni) / fuku (Singkat) / punyaGak (Wibu) / onora (Rongawi)
  const fukumuFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const targetArg = args[0];
    const itemArg = args[1];
    if (!targetArg) {
      throw new Error("[Runtime Error] Target pemeriksaan fukumu tidak boleh kosong.");
    }
    if (targetArg.type === "array") {
      const arr = targetArg as ArrayValue;
      const itemVal = itemArg ? formatRuntimeValue(itemArg) : "null";
      const found = arr.elements.some((el) => {
        if (el.type === itemArg?.type) {
          if (el.type === "number") return (el as NumberValue).value === (itemArg as NumberValue).value;
          if (el.type === "string") return (el as StringValue).value === (itemArg as StringValue).value;
          if (el.type === "boolean") return (el as BooleanValue).value === (itemArg as BooleanValue).value;
        }
        return formatRuntimeValue(el) === itemVal;
      });
      return MK_BOOL(found);
    }
    if (targetArg.type === "string") {
      const str = (targetArg as StringValue).value;
      const sub = itemArg ? formatRuntimeValue(itemArg) : "";
      return MK_BOOL(str.includes(sub));
    }
    throw new Error(
      "[Runtime Error] Argumen pertama fukumu harus berupa barisan (array) atau teks (string)."
    );
  });
  env.declareVar("fukumu", fukumuFn);
  env.declareVar("fuku", fukumuFn);
  env.declareVar("punyaGak", fukumuFn);
  env.declareVar("hairuKana", fukumuFn);
  env.declareVar("onora", fukumuFn);
  env.declareVar("adaGak", fukumuFn);
  env.declareVar("monyetijo", fukumuFn);

  // Urutkan Barisan (Sort): narabikae (Murni) / nara (Singkat) / rapihin (Wibu) / urutno (Rongawi)
  const narabikaeFn = MK_NATIVE_FN(
    async (args: RuntimeValue[], scopeEnv: Environment): Promise<RuntimeValue> => {
      const arrArg = args[0];
      if (!arrArg || arrArg.type !== "array") {
        throw new Error("[Runtime Error] Argumen pertama narabikae harus berupa barisan (array).");
      }
      const comparator = args[1];
      const copy = [...(arrArg as ArrayValue).elements];

      if (comparator && (comparator.type === "function" || comparator.type === "native-fn")) {
        for (let i = 0; i < copy.length - 1; i++) {
          for (let j = 0; j < copy.length - i - 1; j++) {
            const cmpRes = await invokeFunction(comparator, [copy[j]!, copy[j + 1]!], scopeEnv);
            const cmpNum =
              cmpRes.type === "number"
                ? (cmpRes as NumberValue).value
                : isTruthy(cmpRes)
                ? 1
                : -1;
            if (cmpNum > 0) {
              const temp = copy[j]!;
              copy[j] = copy[j + 1]!;
              copy[j + 1] = temp;
            }
          }
        }
      } else {
        copy.sort((a, b) => {
          if (a.type === "number" && b.type === "number") {
            return (a as NumberValue).value - (b as NumberValue).value;
          }
          return formatRuntimeValue(a).localeCompare(formatRuntimeValue(b));
        });
      }
      return MK_ARRAY(copy);
    }
  );
  env.declareVar("narabikae", narabikaeFn);
  env.declareVar("nara", narabikaeFn);
  env.declareVar("rapihin", narabikaeFn);
  env.declareVar("narabeteNe", narabikaeFn);
  env.declareVar("urutno", narabikaeFn);
  env.declareVar("barisin", narabikaeFn);
  env.declareVar("goyangpantat", narabikaeFn);

  // Irisan Barisan / Teks (Slice): kirinuki (Murni) / kinu (Singkat) / potongSebagian (Wibu) / cuplikno (Rongawi)
  const kirinukiFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const targetArg = args[0];
    const startArg = args[1];
    const endArg = args[2];
    if (!targetArg) {
      throw new Error("[Runtime Error] Argumen pertama kirinuki tidak boleh kosong.");
    }
    const start = startArg && startArg.type === "number" ? (startArg as NumberValue).value : 0;
    const end = endArg && endArg.type === "number" ? (endArg as NumberValue).value : undefined;

    if (targetArg.type === "array") {
      const arr = targetArg as ArrayValue;
      return MK_ARRAY(arr.elements.slice(start, end));
    }
    if (targetArg.type === "string") {
      const str = (targetArg as StringValue).value;
      return MK_STRING(str.slice(start, end));
    }
    throw new Error(
      "[Runtime Error] Argumen pertama kirinuki harus berupa barisan (array) atau teks (string)."
    );
  });
  env.declareVar("kirinuki", kirinukiFn);
  env.declareVar("kinu", kirinukiFn);
  env.declareVar("potongSebagian", kirinukiFn);
  env.declareVar("sukoshiDake", kirinukiFn);
  env.declareVar("cuplikno", kirinukiFn);
  env.declareVar("comot", kirinukiFn);
  env.declareVar("pedangdaging", kirinukiFn);

  // 27. Pustaka Standar Tipe Data Modern: Hasil<T,E> (Result) & Opsional<T> (Option)
  const seikouFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    return createResultOk(args[0] ?? MK_NULL());
  });
  (seikouFn as any).tag = "ok";

  const shippaiFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    return createResultError(args[0] ?? MK_NULL());
  });
  (shippaiFn as any).tag = "error";

  const aruFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    return createOptionSome(args[0] ?? MK_NULL());
  });
  (aruFn as any).tag = "some";

  const naiFn = MK_NATIVE_FN((): RuntimeValue => {
    return createOptionNone();
  });
  (naiFn as any).tag = "none";

  // Hasil Ok (seikou / sei / hokiBanh / menyalaAbangku / ok)
  env.declareVar("seikou", seikouFn);
  env.declareVar("sei", seikouFn);
  env.declareVar("hokiBanh", seikouFn);
  env.declareVar("berhasilBanh", seikouFn);
  env.declareVar("menyalaAbangku", seikouFn);
  env.declareVar("untungmas", seikouFn);
  env.declareVar("ok", seikouFn);

  // Hasil Error (shippai / sip / zonkBanh / rugidong / error)
  env.declareVar("shippai", shippaiFn);
  env.declareVar("sip", shippaiFn);
  env.declareVar("zonkBanh", shippaiFn);
  env.declareVar("gagalBanh", shippaiFn);
  env.declareVar("rugidong", shippaiFn);
  env.declareVar("hancurmas", shippaiFn);
  env.declareVar("error", shippaiFn);

  // Opsional Some (aru / ar / adaBanh / adamas / some)
  env.declareVar("aru", aruFn);
  env.declareVar("ar", aruFn);
  env.declareVar("adaBanh", aruFn);
  env.declareVar("adamas", aruFn);
  env.declareVar("some", aruFn);

  // Opsional None (nai / na / gaadaBanh / habismas / none)
  env.declareVar("nai", naiFn);
  env.declareVar("na", naiFn);
  env.declareVar("gaadaBanh", naiFn);
  env.declareVar("kosongBanh", naiFn);
  env.declareVar("habismas", naiFn);
  env.declareVar("zonktolol", naiFn);
  env.declareVar("none", naiFn);

  return env;
}

export function createResultOk(val: RuntimeValue): RuntimeValue {
  const map = new Map<string, RuntimeValue>();
  map.set("tag", MK_STRING("ok"));
  map.set("isOk", MK_BOOL(true));
  map.set("isError", MK_BOOL(false));
  map.set("value", val);
  map.set("error", MK_NULL());

  const unwrapFn = MK_NATIVE_FN((): RuntimeValue => val);
  const unwrapOrFn = MK_NATIVE_FN((): RuntimeValue => val);
  const mapFn = MK_NATIVE_FN(async (args: RuntimeValue[], scopeEnv: Environment): Promise<RuntimeValue> => {
    const fn = args[0];
    if (!fn) return createResultOk(val);
    const mapped = await invokeFunction(fn, [val], scopeEnv);
    return createResultOk(unwrapSignal(mapped));
  });
  const andThenFn = MK_NATIVE_FN(async (args: RuntimeValue[], scopeEnv: Environment): Promise<RuntimeValue> => {
    const fn = args[0];
    if (!fn) return createResultOk(val);
    const res = await invokeFunction(fn, [val], scopeEnv);
    return unwrapSignal(res);
  });

  map.set("unwrap", unwrapFn);
  map.set("hiraku", unwrapFn);
  map.set("hira", unwrapFn);
  map.set("bukaBanh", unwrapFn);
  map.set("jebolmas", unwrapFn);

  map.set("unwrapOr", unwrapOrFn);
  map.set("hirakuKa", unwrapOrFn);
  map.set("hiraKa", unwrapOrFn);
  map.set("bukaKaloGak", unwrapOrFn);
  map.set("cadanganmas", unwrapOrFn);

  map.set("map", mapFn);
  map.set("utsusu", mapFn);
  map.set("utu", mapFn);
  map.set("henshinSuru", mapFn);
  map.set("predikbola", mapFn);

  map.set("andThen", andThenFn);
  map.set("tsugiSuru", andThenFn);
  map.set("tsuSuru", andThenFn);
  map.set("lanjutBanh", andThenFn);
  map.set("gaspolmas", andThenFn);

  return MK_OBJECT(map);
}

export function createResultError(err: RuntimeValue): RuntimeValue {
  const map = new Map<string, RuntimeValue>();
  map.set("tag", MK_STRING("error"));
  map.set("isOk", MK_BOOL(false));
  map.set("isError", MK_BOOL(true));
  map.set("value", MK_NULL());
  map.set("error", err);

  const unwrapFn = MK_NATIVE_FN((): RuntimeValue => {
    const msg = formatRuntimeValue(err);
    throw new Error(`[Runtime Error] Gagal membuka Hasil (Result is Error): ${msg}`);
  });
  const unwrapOrFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    return args[0] ?? MK_NULL();
  });
  const selfFn = MK_NATIVE_FN((): RuntimeValue => createResultError(err));

  map.set("unwrap", unwrapFn);
  map.set("hiraku", unwrapFn);
  map.set("hira", unwrapFn);
  map.set("bukaBanh", unwrapFn);
  map.set("jebolmas", unwrapFn);

  map.set("unwrapOr", unwrapOrFn);
  map.set("hirakuKa", unwrapOrFn);
  map.set("hiraKa", unwrapOrFn);
  map.set("bukaKaloGak", unwrapOrFn);
  map.set("cadanganmas", unwrapOrFn);

  map.set("map", selfFn);
  map.set("utsusu", selfFn);
  map.set("utu", selfFn);
  map.set("henshinSuru", selfFn);
  map.set("predikbola", selfFn);

  map.set("andThen", selfFn);
  map.set("tsugiSuru", selfFn);
  map.set("tsuSuru", selfFn);
  map.set("lanjutBanh", selfFn);
  map.set("gaspolmas", selfFn);

  return MK_OBJECT(map);
}

export function createOptionSome(val: RuntimeValue): RuntimeValue {
  const map = new Map<string, RuntimeValue>();
  map.set("tag", MK_STRING("some"));
  map.set("isSome", MK_BOOL(true));
  map.set("isNone", MK_BOOL(false));
  map.set("value", val);

  const unwrapFn = MK_NATIVE_FN((): RuntimeValue => val);
  const unwrapOrFn = MK_NATIVE_FN((): RuntimeValue => val);
  const mapFn = MK_NATIVE_FN(async (args: RuntimeValue[], scopeEnv: Environment): Promise<RuntimeValue> => {
    const fn = args[0];
    if (!fn) return createOptionSome(val);
    const mapped = await invokeFunction(fn, [val], scopeEnv);
    return createOptionSome(unwrapSignal(mapped));
  });
  const andThenFn = MK_NATIVE_FN(async (args: RuntimeValue[], scopeEnv: Environment): Promise<RuntimeValue> => {
    const fn = args[0];
    if (!fn) return createOptionSome(val);
    const res = await invokeFunction(fn, [val], scopeEnv);
    return unwrapSignal(res);
  });

  map.set("unwrap", unwrapFn);
  map.set("hiraku", unwrapFn);
  map.set("hira", unwrapFn);
  map.set("bukaBanh", unwrapFn);
  map.set("jebolmas", unwrapFn);

  map.set("unwrapOr", unwrapOrFn);
  map.set("hirakuKa", unwrapOrFn);
  map.set("hiraKa", unwrapOrFn);
  map.set("bukaKaloGak", unwrapOrFn);
  map.set("cadanganmas", unwrapOrFn);

  map.set("map", mapFn);
  map.set("utsusu", mapFn);
  map.set("utu", mapFn);
  map.set("henshinSuru", mapFn);
  map.set("predikbola", mapFn);

  map.set("andThen", andThenFn);
  map.set("tsugiSuru", andThenFn);
  map.set("tsuSuru", andThenFn);
  map.set("lanjutBanh", andThenFn);
  map.set("gaspolmas", andThenFn);

  return MK_OBJECT(map);
}

export function createOptionNone(): RuntimeValue {
  const map = new Map<string, RuntimeValue>();
  map.set("tag", MK_STRING("none"));
  map.set("isSome", MK_BOOL(false));
  map.set("isNone", MK_BOOL(true));
  map.set("value", MK_NULL());

  const unwrapFn = MK_NATIVE_FN((): RuntimeValue => {
    throw new Error("[Runtime Error] Gagal membuka Opsional (Option is None).");
  });
  const unwrapOrFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    return args[0] ?? MK_NULL();
  });
  const selfFn = MK_NATIVE_FN((): RuntimeValue => createOptionNone());

  map.set("unwrap", unwrapFn);
  map.set("hiraku", unwrapFn);
  map.set("hira", unwrapFn);
  map.set("bukaBanh", unwrapFn);
  map.set("jebolmas", unwrapFn);

  map.set("unwrapOr", unwrapOrFn);
  map.set("hirakuKa", unwrapOrFn);
  map.set("hiraKa", unwrapOrFn);
  map.set("bukaKaloGak", unwrapOrFn);
  map.set("cadanganmas", unwrapOrFn);

  map.set("map", selfFn);
  map.set("utsusu", selfFn);
  map.set("utu", selfFn);
  map.set("henshinSuru", selfFn);
  map.set("predikbola", selfFn);

  map.set("andThen", selfFn);
  map.set("tsugiSuru", selfFn);
  map.set("tsuSuru", selfFn);
  map.set("lanjutBanh", selfFn);
  map.set("gaspolmas", selfFn);

  return MK_OBJECT(map);
}

// ----------------------------------------------------------------------------
// EVALUATOR (TREE-WALKING ASYNC INTERPRETER)
// ----------------------------------------------------------------------------

export async function evaluate(
  astNode: Statement,
  env: Environment
): Promise<RuntimeValue | ControlSignal> {
  switch (astNode.kind) {
    case "Program":
      return await evalProgram(astNode as Program, env);

    case "VariableDeclaration":
      return await evalVariableDeclaration(astNode as VariableDeclaration, env);

    case "FunctionDeclaration":
      return evalFunctionDeclaration(astNode as FunctionDeclaration, env);

    case "ClassDeclaration":
      return await evalClassDeclaration(astNode as ClassDeclaration, env);

    case "ExportStatement":
      return await evalExportStatement(astNode as ExportStatement, env);

    case "ImportStatement":
      return await evalImportStatement(astNode as ImportStatement, env);

    case "NewExpression":
      return await evalNewExpression(astNode as NewExpression, env);

    case "ThisExpression":
      return evalThisExpression(astNode as ThisExpression, env);

    case "IfStatement":
      return await evalIfStatement(astNode as IfStatement, env);

    case "MatchStatement":
      return await evalMatchStatement(astNode as MatchStatement, env);

    case "LoopStatement":
      return await evalLoopStatement(astNode as LoopStatement, env);

    case "ForEachStatement":
      return await evalForEachStatement(astNode as ForEachStatement, env);

    case "BreakStatement":
      return { isBreak: true };

    case "ContinueStatement":
      return { isContinue: true };

    case "ReturnStatement":
      return await evalReturnStatement(astNode as ReturnStatement, env);

    case "TryCatchStatement":
      return await evalTryCatchStatement(astNode as TryCatchStatement, env);

    case "BlockStatement":
      return await evalBlockStatement(astNode as BlockStatement, env);

    case "ExpressionStatement":
      return await evalExpressionStatement(astNode as ExpressionStatement, env);

    case "AssignmentExpression":
      return await evalAssignment(astNode as AssignmentExpression, env);

    case "BinaryExpression":
      return await evalBinaryExpression(astNode as BinaryExpression, env);

    case "UnaryExpression":
      return await evalUnaryExpression(astNode as UnaryExpression, env);

    case "ArrowFunctionExpression":
      return evalArrowFunctionExpression(astNode as ArrowFunctionExpression, env);

    case "CallExpression":
      return await evalCallExpression(astNode as CallExpression, env);

    case "MemberExpr":
      return await evalMemberExpr(astNode as MemberExpr, env);

    case "ArrayLiteral":
      return await evalArrayLiteral(astNode as ArrayLiteral, env);

    case "ObjectLiteral":
      return await evalObjectLiteral(astNode as ObjectLiteral, env);

    case "Identifier":
      return evalIdentifier(astNode as Identifier, env);

    case "NumericLiteral":
      return MK_NUMBER((astNode as NumericLiteral).value);

    case "StringLiteral":
      return MK_STRING((astNode as StringLiteral).value);

    case "BooleanLiteral":
      return MK_BOOL((astNode as BooleanLiteral).value);

    case "NullLiteral":
      return MK_NULL();

    default:
      throw new Error(
        `[Runtime Error] Simpul AST '${astNode.kind}' belum didukung.`
      );
  }
}

function isReturnSignal(val: unknown): val is ReturnSignal {
  return (
    typeof val === "object" &&
    val !== null &&
    "isReturn" in val &&
    (val as ReturnSignal).isReturn === true
  );
}

function isBreakSignal(val: unknown): val is BreakSignal {
  return (
    typeof val === "object" &&
    val !== null &&
    "isBreak" in val &&
    (val as BreakSignal).isBreak === true
  );
}

function isContinueSignal(val: unknown): val is ContinueSignal {
  return (
    typeof val === "object" &&
    val !== null &&
    "isContinue" in val &&
    (val as ContinueSignal).isContinue === true
  );
}

export function unwrapSignal(val: RuntimeValue | ControlSignal): RuntimeValue {
  if (isReturnSignal(val)) {
    return val.value;
  }
  if (isBreakSignal(val) || isContinueSignal(val)) {
    return MK_NULL();
  }
  return val as RuntimeValue;
}

function isTruthy(val: RuntimeValue): boolean {
  switch (val.type) {
    case "boolean":
      return (val as BooleanValue).value;
    case "number":
      return (val as NumberValue).value !== 0;
    case "string":
      return (val as StringValue).value.length > 0;
    case "array":
      return (val as ArrayValue).elements.length > 0;
    case "object":
      return (val as ObjectValue).properties.size > 0;
    case "null":
      return false;
    default:
      return true;
  }
}

async function evalProgram(
  program: Program,
  env: Environment
): Promise<RuntimeValue> {
  let lastEvaluated: RuntimeValue = MK_NULL();
  const root = env.getRoot();

  for (const statement of program.body) {
    root.checkLimits();
    const result = await evaluate(statement, env);
    if (isReturnSignal(result)) {
      return result.value;
    }
    lastEvaluated = unwrapSignal(result);
  }

  return lastEvaluated;
}

async function evalVariableDeclaration(
  declaration: VariableDeclaration,
  env: Environment
): Promise<RuntimeValue> {
  const value = unwrapSignal(await evaluate(declaration.value, env));
  if (declaration.pattern) {
    applyDestructuringPattern(declaration.pattern, value, env, true);
    return value;
  }
  return env.declareVar(declaration.identifier, value);
}

function evalFunctionDeclaration(
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeValue {
  const fn: FunctionValue = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  };
  return env.declareVar(declaration.name, fn);
}

async function evalIfStatement(
  stmt: IfStatement,
  env: Environment
): Promise<RuntimeValue | ControlSignal> {
  const conditionValue = unwrapSignal(await evaluate(stmt.condition, env));

  if (isTruthy(conditionValue)) {
    const scope = new Environment(env);
    for (const s of stmt.thenBranch) {
      const result = await evaluate(s, scope);
      if (
        isReturnSignal(result) ||
        isBreakSignal(result) ||
        isContinueSignal(result)
      ) {
        return result;
      }
    }
  } else if (stmt.elseBranch) {
    const scope = new Environment(env);
    for (const s of stmt.elseBranch) {
      const result = await evaluate(s, scope);
      if (
        isReturnSignal(result) ||
        isBreakSignal(result) ||
        isContinueSignal(result)
      ) {
        return result;
      }
    }
  }

  return MK_NULL();
}

async function evalLoopStatement(
  stmt: LoopStatement,
  env: Environment
): Promise<RuntimeValue | ReturnSignal> {
  let lastVal: RuntimeValue = MK_NULL();
  const root = env.getRoot();

  while (isTruthy(unwrapSignal(await evaluate(stmt.condition, env)))) {
    root.checkLimits();
    root.loopIterationCount++;
    if (root.loopIterationCount > root.maxLoopIterations) {
      throw new Error(
        `[Runtime Error] Batas iterasi perulangan terlampaui (${root.maxLoopIterations} putaran). Terdeteksi potensi perulangan tak hingga (Infinite Loop)!`
      );
    }

    if (root.loopIterationCount % 200 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const scope = new Environment(env);
    let shouldBreak = false;

    for (const s of stmt.body) {
      root.checkLimits();
      const result = await evaluate(s, scope);

      if (isReturnSignal(result)) {
        return result;
      }

      if (isBreakSignal(result)) {
        shouldBreak = true;
        break;
      }

      if (isContinueSignal(result)) {
        break;
      }

      lastVal = result;
    }

    if (shouldBreak) {
      break;
    }
  }

  return lastVal;
}

async function evalForEachStatement(
  stmt: ForEachStatement,
  env: Environment
): Promise<RuntimeValue | ReturnSignal> {
  const root = env.getRoot();
  root.checkLimits();

  const collectionVal = unwrapSignal(await evaluate(stmt.collection, env));
  let items: RuntimeValue[] = [];

  if (collectionVal.type === "array") {
    items = (collectionVal as ArrayValue).elements;
  } else if (collectionVal.type === "string") {
    const str = (collectionVal as StringValue).value;
    items = str.split("").map((c) => MK_STRING(c));
  } else if (collectionVal.type === "object") {
    const obj = collectionVal as ObjectValue;
    items = Array.from(obj.properties.keys()).map((k) => MK_STRING(k));
  } else {
    throw new Error(
      `[Runtime Error] Tipe '${collectionVal.type}' tidak dapat diiterasi dengan perulangan 'subete'.`
    );
  }

  let lastVal: RuntimeValue = MK_NULL();

  for (const item of items) {
    root.checkLimits();
    root.loopIterationCount++;
    if (root.loopIterationCount > root.maxLoopIterations) {
      throw new Error(
        `[Runtime Error] Batas iterasi perulangan terlampaui (${root.maxLoopIterations} putaran). Terdeteksi potensi perulangan tak hingga (Infinite Loop)!`
      );
    }

    if (root.loopIterationCount % 200 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const scope = new Environment(env);
    scope.declareVar(stmt.item, item);
    let shouldBreak = false;

    for (const s of stmt.body) {
      root.checkLimits();
      const result = await evaluate(s, scope);

      if (isReturnSignal(result)) {
        return result;
      }

      if (isBreakSignal(result)) {
        shouldBreak = true;
        break;
      }

      if (isContinueSignal(result)) {
        break;
      }

      lastVal = result;
    }

    if (shouldBreak) {
      break;
    }
  }

  return lastVal;
}

async function evalReturnStatement(
  stmt: ReturnStatement,
  env: Environment
): Promise<ReturnSignal> {
  let value: RuntimeValue = MK_NULL();
  if (stmt.value) {
    value = unwrapSignal(await evaluate(stmt.value, env));
  }
  return { isReturn: true, value };
}

async function evalBlockStatement(
  block: BlockStatement,
  env: Environment
): Promise<RuntimeValue | ControlSignal> {
  const scope = new Environment(env);
  let lastVal: RuntimeValue = MK_NULL();

  for (const s of block.body) {
    const result = await evaluate(s, scope);
    if (
      isReturnSignal(result) ||
      isBreakSignal(result) ||
      isContinueSignal(result)
    ) {
      return result;
    }
    lastVal = result;
  }

  return lastVal;
}

async function evalExpressionStatement(
  stmt: ExpressionStatement,
  env: Environment
): Promise<RuntimeValue | ControlSignal> {
  return await evaluate(stmt.expression, env);
}

function evalIdentifier(ident: Identifier, env: Environment): RuntimeValue {
  return env.lookupVar(ident.symbol);
}

async function evalAssignment(
  node: AssignmentExpression,
  env: Environment
): Promise<RuntimeValue> {
  const value = unwrapSignal(await evaluate(node.value, env));

  if (node.assignee.kind === "Identifier") {
    return env.assignVar((node.assignee as Identifier).symbol, value);
  }

  if (
    node.assignee.kind === "ArrayPattern" ||
    node.assignee.kind === "ObjectPattern"
  ) {
    applyDestructuringPattern(
      node.assignee as DestructuringPattern,
      value,
      env,
      false
    );
    return value;
  }

  if (node.assignee.kind === "MemberExpr") {
    const member = node.assignee as MemberExpr;
    const target = unwrapSignal(await evaluate(member.object, env));

    if (target.type === "object") {
      const obj = target as ObjectValue;
      let propKey: string;
      if (member.computed) {
        const evaluatedKey = unwrapSignal(await evaluate(member.property, env));
        propKey = formatRuntimeValue(evaluatedKey);
      } else {
        propKey = (member.property as Identifier).symbol;
      }
      obj.properties.set(propKey, value);
      return value;
    }

    if (target.type === "instance") {
      const inst = target as InstanceValue;
      let propKey: string;
      if (member.computed) {
        const evaluatedKey = unwrapSignal(await evaluate(member.property, env));
        propKey = formatRuntimeValue(evaluatedKey);
      } else {
        propKey = (member.property as Identifier).symbol;
      }
      inst.fields.set(propKey, value);
      return value;
    }

    if (target.type === "array") {
      const arr = target as ArrayValue;
      const evaluatedIdx = unwrapSignal(await evaluate(member.property, env));
      if (evaluatedIdx.type !== "number") {
        throw new Error("[Runtime Error] Indeks barisan (array) harus berupa angka.");
      }
      const idx = (evaluatedIdx as NumberValue).value;
      if (idx < 0 || idx >= arr.elements.length) {
        throw new Error(
          `[Runtime Error] Indeks array di luar batas: ${idx} (panjang barisan: ${arr.elements.length}).`
        );
      }
      arr.elements[idx] = value;
      return value;
    }

    throw new Error(
      `[Runtime Error] Tidak dapat menugaskan properti ke nilai bertipe '${target.type}'.`
    );
  }

  throw new Error("[Runtime Error] Target penugasan '=' tidak valid.");
}

async function evalBinaryExpression(
  binop: BinaryExpression,
  env: Environment
): Promise<RuntimeValue> {
  // Evaluasi short-circuit untuk operator logika AND (&&) dan OR (||)
  if (binop.operator === "&&") {
    const left = unwrapSignal(await evaluate(binop.left, env));
    if (!isTruthy(left)) {
      return left;
    }
    return unwrapSignal(await evaluate(binop.right, env));
  }

  if (binop.operator === "||") {
    const left = unwrapSignal(await evaluate(binop.left, env));
    if (isTruthy(left)) {
      return left;
    }
    return unwrapSignal(await evaluate(binop.right, env));
  }

  const left = unwrapSignal(await evaluate(binop.left, env));
  const right = unwrapSignal(await evaluate(binop.right, env));

  if (binop.operator === "+") {
    if (left.type === "string" || right.type === "string") {
      return MK_STRING(formatRuntimeValue(left) + formatRuntimeValue(right));
    }
    if (left.type === "number" && right.type === "number") {
      return MK_NUMBER(
        (left as NumberValue).value + (right as NumberValue).value
      );
    }
    throw new Error(
      "[Runtime Error] Operator '+' hanya mendukung tipe Number dan String."
    );
  }

  if (left.type === "number" && right.type === "number") {
    const l = (left as NumberValue).value;
    const r = (right as NumberValue).value;

    switch (binop.operator) {
      case "-":
        return MK_NUMBER(l - r);
      case "*":
        return MK_NUMBER(l * r);
      case "/":
        if (r === 0) {
          throw new Error("[Runtime Error] Pembagian dengan angka nol.");
        }
        return MK_NUMBER(l / r);
      case "%":
        if (r === 0) {
          throw new Error("[Runtime Error] Operasi modulo dengan angka nol.");
        }
        return MK_NUMBER(l % r);
      case "<":
        return MK_BOOL(l < r);
      case "<=":
        return MK_BOOL(l <= r);
      case ">":
        return MK_BOOL(l > r);
      case ">=":
        return MK_BOOL(l >= r);
    }
  }

  if (binop.operator === "==") {
    return MK_BOOL(checkValuesEqual(left, right));
  }

  if (binop.operator === "!=") {
    return MK_BOOL(!checkValuesEqual(left, right));
  }

  throw new Error(
    `[Runtime Error] Operator '${binop.operator}' tidak kompatibel untuk tipe ${left.type} dan ${right.type}.`
  );
}

async function evalUnaryExpression(
  node: UnaryExpression,
  env: Environment
): Promise<RuntimeValue> {
  const operand = unwrapSignal(await evaluate(node.operand, env));

  if (node.operator === "!") {
    return MK_BOOL(!isTruthy(operand));
  }

  if (node.operator === "-") {
    if (operand.type === "number") {
      return MK_NUMBER(-(operand as NumberValue).value);
    }
    throw new Error(
      `[Runtime Error] Operator uner '-' hanya berlaku untuk tipe number, bukan '${operand.type}'.`
    );
  }

  throw new Error(`[Runtime Error] Operator uner '${node.operator}' tidak didukung.`);
}

function evalArrowFunctionExpression(
  node: ArrowFunctionExpression,
  env: Environment
): FunctionValue {
  return {
    type: "function",
    name: "anonymous",
    parameters: node.parameters,
    declarationEnv: env,
    body: node.body,
  };
}

async function evalCallExpression(
  call: CallExpression,
  env: Environment
): Promise<RuntimeValue> {
  const callee =
    typeof call.callee === "string"
      ? env.lookupVar(call.callee)
      : unwrapSignal(await evaluate(call.callee, env));
  const evaluatedArgs: RuntimeValue[] = [];

  for (const arg of call.args) {
    evaluatedArgs.push(unwrapSignal(await evaluate(arg, env)));
  }

  return await invokeFunction(callee, evaluatedArgs, env);
}

async function evalArrayLiteral(
  node: ArrayLiteral,
  env: Environment
): Promise<RuntimeValue> {
  const elements: RuntimeValue[] = [];
  for (const el of node.elements) {
    if (el.kind === "SpreadElement") {
      const spread = el as SpreadElement;
      const spreadVal = unwrapSignal(await evaluate(spread.argument, env));
      if (spreadVal.type === "array") {
        elements.push(...(spreadVal as ArrayValue).elements);
      } else if (spreadVal.type === "string") {
        for (const char of (spreadVal as StringValue).value) {
          elements.push(MK_STRING(char));
        }
      } else {
        throw new Error(
          `[Runtime Error] Operator spread '...' hanya dapat diterapkan pada barisan (array) atau string, bukan '${spreadVal.type}'.`
        );
      }
    } else {
      elements.push(unwrapSignal(await evaluate(el, env)));
    }
  }
  return MK_ARRAY(elements);
}

async function evalObjectLiteral(
  node: ObjectLiteral,
  env: Environment
): Promise<RuntimeValue> {
  const properties = new Map<string, RuntimeValue>();

  for (const prop of node.properties) {
    const runtimeVal = prop.value
      ? unwrapSignal(await evaluate(prop.value, env))
      : env.lookupVar(prop.key);
    properties.set(prop.key, runtimeVal);
  }

  return MK_OBJECT(properties);
}

async function evalMemberExpr(
  node: MemberExpr,
  env: Environment
): Promise<RuntimeValue> {
  const objectVal = unwrapSignal(await evaluate(node.object, env));

  if (objectVal.type === "object") {
    const obj = objectVal as ObjectValue;
    let propKey: string;
    if (node.computed) {
      const evaluatedKey = unwrapSignal(await evaluate(node.property, env));
      propKey = formatRuntimeValue(evaluatedKey);
    } else {
      propKey = (node.property as Identifier).symbol;
    }

    if (!obj.properties.has(propKey)) {
      return MK_NULL();
    }

    return obj.properties.get(propKey) as RuntimeValue;
  }

  if (objectVal.type === "instance") {
    const inst = objectVal as InstanceValue;
    let propKey: string;
    if (node.computed) {
      const evaluatedKey = unwrapSignal(await evaluate(node.property, env));
      propKey = formatRuntimeValue(evaluatedKey);
    } else {
      propKey = (node.property as Identifier).symbol;
    }

    // 1. Cek apakah ada di fields
    if (inst.fields.has(propKey)) {
      return inst.fields.get(propKey)!;
    }

    // 2. Cek apakah merupakan metode kelas (dengan pencarian hierarki ke atas)
    let currentClass: ClassValue | undefined = inst.classVal;
    while (currentClass) {
      if (currentClass.methods.has(propKey)) {
        const methodDecl = currentClass.methods.get(propKey)!;
        return MK_NATIVE_FN(
          async (args: RuntimeValue[], callEnv: Environment): Promise<RuntimeValue> => {
            const root = (callEnv ?? env).getRoot();
            root.checkLimits();
            if (root.callStackDepth >= root.maxCallStackDepth) {
              throw new Error(
                `[Runtime Error] Batas kedalaman tumpukan panggilan (${root.maxCallStackDepth}) terlampaui. Terdeteksi rekursi tanpa batas (Infinite Recursion)!`
              );
            }
            root.callStackDepth++;
            try {
              const methodScope = new Environment(currentClass!.declarationEnv);
              // Ikat kata kunci diri sendiri di semua dialek
              methodScope.declareVar("jibun", inst);
              methodScope.declareVar("ji", inst);
              methodScope.declareVar("siAing", inst);
              methodScope.declareVar("siSaya", inst);
              methodScope.declareVar("lanangmas", inst);
              methodScope.declareVar("awakku", inst);
              methodScope.declareVar("this", inst);

              for (let i = 0; i < methodDecl.parameters.length; i++) {
                const pName = methodDecl.parameters[i];
                if (pName !== undefined) {
                  methodScope.declareVar(pName, args[i] ?? MK_NULL());
                }
              }

              for (const s of methodDecl.body) {
                root.checkLimits();
                const res = await evaluate(s, methodScope);
                if (isReturnSignal(res)) {
                  return res.value;
                }
              }
              return MK_NULL();
            } finally {
              root.callStackDepth--;
            }
          }
        );
      }
      currentClass = currentClass.parentClass;
    }

    return MK_NULL();
  }

  if (objectVal.type === "array") {
    const arr = objectVal as ArrayValue;
    if (!node.computed) {
      const prop = (node.property as Identifier).symbol;
      if (
        prop === "length" ||
        prop === "nagasa" ||
        prop === "naga" ||
        prop === "seginiDoang" ||
        prop === "panjangberurat" ||
        prop === "panjang" ||
        prop === "cekUkuran" ||
        prop === "itungPanjangLur" || // deprecated
        prop === "dawa"
      ) {
        return MK_NUMBER(arr.elements.length);
      }
      throw new Error(
        `[Runtime Error] Properti '${prop}' tidak ditemukan pada barisan. Gunakan [indeks].`
      );
    }
    const idxVal = unwrapSignal(await evaluate(node.property, env));
    if (idxVal.type !== "number") {
      throw new Error("[Runtime Error] Indeks barisan (array) harus berupa angka.");
    }
    const idx = (idxVal as NumberValue).value;
    if (idx < 0 || idx >= arr.elements.length) {
      return MK_NULL();
    }
    return arr.elements[idx] as RuntimeValue;
  }

  if (objectVal.type === "string") {
    const str = (objectVal as StringValue).value;
    if (!node.computed) {
      const prop = (node.property as Identifier).symbol;
      if (
        prop === "length" ||
        prop === "nagasa" ||
        prop === "naga" ||
        prop === "seginiDoang" ||
        prop === "panjangberurat" ||
        prop === "panjang" ||
        prop === "cekUkuran" ||
        prop === "itungPanjangLur" || // deprecated
        prop === "dawa"
      ) {
        return MK_NUMBER(str.length);
      }
      throw new Error(
        `[Runtime Error] Properti '${prop}' tidak ditemukan pada string. Gunakan .nagasa atau [indeks].`
      );
    }
    const idxVal = unwrapSignal(await evaluate(node.property, env));
    if (idxVal.type === "number") {
      const idx = (idxVal as NumberValue).value;
      if (idx >= 0 && idx < str.length) {
        return MK_STRING(str[idx] as string);
      }
      return MK_NULL();
    }
    throw new Error("[Runtime Error] Indeks string harus berupa angka.");
  }

  throw new Error(
    `[Runtime Error] Tidak dapat mengakses properti dari tipe '${objectVal.type}'.`
  );
}

function checkValuesEqual(left: RuntimeValue, right: RuntimeValue): boolean {
  // Dukungan pencocokan pola langsung untuk tipe data modern: Hasil<T,E> & Opsional<T>
  const getTag = (v: RuntimeValue): string | null => {
    if (v.type === "object") {
      const tagVal = (v as ObjectValue).properties.get("tag");
      if (tagVal && tagVal.type === "string") return (tagVal as StringValue).value;
    }
    if (v.type === "native-fn") {
      const tagVal = (v as any).tag;
      if (typeof tagVal === "string") return tagVal;
    }
    return null;
  };

  const leftTag = getTag(left);
  const rightTag = getTag(right);

  const TAG_ALIASES: Record<string, string[]> = {
    ok: [
      "ok",
      "seikou",
      "sei",
      "hokiBanh",
      "hoki",
      "berhasil",
      "berhasilBanh",
      "menyalaAbangku",
      "menyala",
      "untungmas",
    ],
    error: [
      "error",
      "shippai",
      "sip",
      "zonkBanh",
      "zonk",
      "gagal",
      "gagalBanh",
      "rugidong",
      "rugi",
      "hancurmas",
    ],
    some: ["some", "aru", "ar", "adaBanh", "ada", "adamas"],
    none: [
      "none",
      "nai",
      "na",
      "gaadaBanh",
      "gaada",
      "kosong",
      "kosongBanh",
      "habismas",
      "zonktolol",
    ],
  };

  const matchesTag = (tag: string, candidate: RuntimeValue): boolean => {
    if (candidate.type === "string") {
      const strVal = (candidate as StringValue).value;
      const aliases = TAG_ALIASES[tag];
      return aliases ? aliases.includes(strVal) : tag === strVal;
    }
    const candTag = getTag(candidate);
    return candTag === tag;
  };

  if (leftTag && matchesTag(leftTag, right)) {
    return true;
  }
  if (rightTag && matchesTag(rightTag, left)) {
    return true;
  }

  if (left.type !== right.type) {
    return false;
  }
  switch (left.type) {
    case "number":
      return (left as NumberValue).value === (right as NumberValue).value;
    case "string":
      return (left as StringValue).value === (right as StringValue).value;
    case "boolean":
      return (left as BooleanValue).value === (right as BooleanValue).value;
    case "null":
      return true;
    default:
      return left === right;
  }
}

function applyDestructuringPattern(
  pattern: DestructuringPattern,
  value: RuntimeValue,
  env: Environment,
  isDeclaration: boolean
): void {
  if (pattern.kind === "ArrayPattern") {
    let sourceElements: RuntimeValue[] = [];
    if (value.type === "array") {
      sourceElements = (value as ArrayValue).elements;
    } else if (value.type === "string") {
      sourceElements = (value as StringValue).value.split("").map((c) => MK_STRING(c));
    } else {
      throw new Error(
        `[Runtime Error] Pola destructuring barisan memerlukan array atau string, bukan '${value.type}'.`
      );
    }

    for (let i = 0; i < pattern.elements.length; i++) {
      const item = pattern.elements[i];
      if (item === null || item === undefined) continue;

      if (typeof item === "string") {
        const val = sourceElements[i] ?? MK_NULL();
        if (isDeclaration) {
          env.declareVar(item, val);
        } else {
          env.assignVar(item, val);
        }
      } else if (item.kind === "RestElement") {
        const restVals = sourceElements.slice(i);
        const restArr = MK_ARRAY(restVals);
        if (isDeclaration) {
          env.declareVar(item.argument, restArr);
        } else {
          env.assignVar(item.argument, restArr);
        }
        break;
      }
    }
  } else if (pattern.kind === "ObjectPattern") {
    for (const prop of pattern.properties) {
      const varName = prop.target ?? prop.key;
      let val: RuntimeValue = MK_NULL();

      if (value.type === "object") {
        val = (value as ObjectValue).properties.get(prop.key) ?? MK_NULL();
      } else if (value.type === "instance") {
        const inst = value as InstanceValue;
        if (inst.fields.has(prop.key)) {
          val = inst.fields.get(prop.key)!;
        }
      }

      if (isDeclaration) {
        env.declareVar(varName, val);
      } else {
        env.assignVar(varName, val);
      }
    }
  }
}

async function evalMatchStatement(
  stmt: MatchStatement,
  env: Environment
): Promise<RuntimeValue | ControlSignal> {
  const discriminant = unwrapSignal(await evaluate(stmt.discriminant, env));

  let matchedCase: MatchCase | undefined = undefined;
  let defaultCase: MatchCase | undefined = undefined;

  for (const c of stmt.cases) {
    if (c.value === undefined) {
      defaultCase = c;
    } else if (!matchedCase) {
      const caseVal = unwrapSignal(await evaluate(c.value, env));
      if (checkValuesEqual(discriminant, caseVal)) {
        matchedCase = c;
      }
    }
  }

  const targetCase = matchedCase ?? defaultCase;
  if (!targetCase) {
    return MK_NULL();
  }

  const caseScope = new Environment(env);
  let lastVal: RuntimeValue = MK_NULL();

  for (const s of targetCase.body) {
    const res = await evaluate(s, caseScope);
    if (
      isReturnSignal(res) ||
      isBreakSignal(res) ||
      isContinueSignal(res)
    ) {
      return res;
    }
    lastVal = res;
  }

  return lastVal;
}

async function evalTryCatchStatement(
  stmt: TryCatchStatement,
  env: Environment
): Promise<RuntimeValue | ControlSignal> {
  try {
    const tryScope = new Environment(env);
    let lastVal: RuntimeValue = MK_NULL();
    for (const s of stmt.tryBranch) {
      const res = await evaluate(s, tryScope);
      if (
        isReturnSignal(res) ||
        isBreakSignal(res) ||
        isContinueSignal(res)
      ) {
        return res;
      }
      lastVal = res as RuntimeValue;
    }
    return lastVal;
  } catch (err: unknown) {
    const catchScope = new Environment(env);
    if (stmt.catchVariable) {
      const errMsg = err instanceof Error ? err.message : String(err);
      catchScope.declareVar(stmt.catchVariable, MK_STRING(errMsg));
    }
    let lastVal: RuntimeValue = MK_NULL();
    for (const s of stmt.catchBranch) {
      const res = await evaluate(s, catchScope);
      if (
        isReturnSignal(res) ||
        isBreakSignal(res) ||
        isContinueSignal(res)
      ) {
        return res;
      }
      lastVal = res as RuntimeValue;
    }
    return lastVal;
  }
}

// ----------------------------------------------------------------------------
// EVALUATOR: OOP & SISTEM MODUL
// ----------------------------------------------------------------------------

async function evalClassDeclaration(
  stmt: ClassDeclaration,
  env: Environment
): Promise<RuntimeValue> {
  let parentClassVal: ClassValue | undefined = undefined;
  if (stmt.parentClass) {
    const parentVal = env.lookupVar(stmt.parentClass);
    if (parentVal.type !== "class") {
      throw new Error(
        `[Runtime Error] Kelas induk '${stmt.parentClass}' bukan merupakan sekte/kelas yang valid.`
      );
    }
    parentClassVal = parentVal as ClassValue;
  }

  const methods = new Map<string, FunctionDeclaration>();
  for (const m of stmt.methods) {
    methods.set(m.name, m);
  }

  const classVal = MK_CLASS(
    stmt.name,
    env,
    methods,
    parentClassVal,
    stmt.constructorMethod
  );

  return env.declareVar(stmt.name, classVal);
}

async function evalNewExpression(
  node: NewExpression,
  env: Environment
): Promise<RuntimeValue> {
  const classVal = env.lookupVar(node.className);
  if (classVal.type !== "class") {
    throw new Error(
      `[Runtime Error] '${node.className}' bukan merupakan sekte/kelas yang dapat diinstansiasi.`
    );
  }
  const cls = classVal as ClassValue;
  const instance = MK_INSTANCE(cls);

  // Cari konstruktor di kelas ini atau rantai warisan
  let ctor: FunctionDeclaration | undefined = cls.constructorMethod;
  let curr: ClassValue | undefined = cls;
  while (!ctor && curr?.parentClass) {
    curr = curr.parentClass;
    ctor = curr?.constructorMethod;
  }

  if (ctor) {
    const root = env.getRoot();
    root.checkLimits();
    if (root.callStackDepth >= root.maxCallStackDepth) {
      throw new Error(
        `[Runtime Error] Batas kedalaman tumpukan panggilan (${root.maxCallStackDepth}) terlampaui. Terdeteksi rekursi tanpa batas (Infinite Recursion)!`
      );
    }
    root.callStackDepth++;
    try {
      const evaluatedArgs: RuntimeValue[] = [];
      for (const arg of node.args) {
        evaluatedArgs.push(unwrapSignal(await evaluate(arg, env)));
      }

      const ctorScope = new Environment(cls.declarationEnv);
      ctorScope.declareVar("jibun", instance);
      ctorScope.declareVar("ji", instance);
      ctorScope.declareVar("siAing", instance);
      ctorScope.declareVar("siSaya", instance);
      ctorScope.declareVar("lanangmas", instance);
      ctorScope.declareVar("awakku", instance);
      ctorScope.declareVar("this", instance);

      for (let i = 0; i < ctor.parameters.length; i++) {
        const pName = ctor.parameters[i];
        if (pName !== undefined) {
          ctorScope.declareVar(pName, evaluatedArgs[i] ?? MK_NULL());
        }
      }

      for (const s of ctor.body) {
        root.checkLimits();
        const res = await evaluate(s, ctorScope);
        if (isReturnSignal(res)) {
          if (res.value.type === "instance" || res.value.type === "object") {
            return res.value;
          }
          break;
        }
      }
    } finally {
      root.callStackDepth--;
    }
  }

  return instance;
}

function evalThisExpression(
  _node: ThisExpression,
  env: Environment
): RuntimeValue {
  try {
    return env.lookupVar("jibun");
  } catch {
    try {
      return env.lookupVar("this");
    } catch {
      throw new Error(
        "[Runtime Error] Kata kunci 'jibun' ('this') hanya dapat digunakan di dalam badan sekte/kelas."
      );
    }
  }
}

async function evalExportStatement(
  stmt: ExportStatement,
  env: Environment
): Promise<RuntimeValue> {
  if (stmt.declaration) {
    const val = unwrapSignal(await evaluate(stmt.declaration, env));
    for (const name of stmt.exportedNames) {
      env.exports.set(name, val);
    }
    return val;
  }

  for (const name of stmt.exportedNames) {
    const val = env.lookupVar(name);
    env.exports.set(name, val);
  }

  return MK_NULL();
}

async function evalImportStatement(
  stmt: ImportStatement,
  env: Environment
): Promise<RuntimeValue> {
  const source = stmt.source;
  let moduleCode: string | undefined = undefined;

  // 1. Cek Virtual Modules Registry (Kompatibel Playground Browser & Testing)
  if (VIRTUAL_MODULES.has(source)) {
    moduleCode = VIRTUAL_MODULES.get(source)!;
  } else if (
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null
  ) {
    if (source.startsWith("npm:")) {
      const { resolveNpmPackage, loadNpmJsModule } = await import("./pm");
      const pkgInfo = resolveNpmPackage(source);

      if (!pkgInfo) {
        const cleanName = source.slice(4).trim();
        throw new Error(
          `[Runtime Error] Pustaka '${source}' tidak ditemukan di node_modules. Silakan pasang terlebih dahulu dengan: wibu add ${cleanName}`
        );
      }

      if (pkgInfo.kind === "wibu") {
        try {
          moduleCode = fs.readFileSync(pkgInfo.entryPath, "utf-8");
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          throw new Error(
            `[Runtime Error] Gagal membaca berkas modul WibuScript '${pkgInfo.entryPath}': ${msg}`
          );
        }
      } else {
        // Interop Pustaka JavaScript NPM (FFI)
        let jsModule: any;
        try {
          jsModule = loadNpmJsModule(pkgInfo.packageName);
        } catch (loadErr: unknown) {
          const msg = loadErr instanceof Error ? loadErr.message : String(loadErr);
          throw new Error(msg);
        }

        const isObjectLike = (v: any): boolean =>
          (typeof v === "object" || typeof v === "function") && v !== null;

        const resolvedTarget =
          isObjectLike(jsModule) &&
          jsModule.default &&
          Object.keys(jsModule).length === 1
            ? jsModule.default
            : jsModule;

        if (stmt.importedNames.includes("*")) {
          const alias = pkgInfo.packageName.replace(/[^a-zA-Z0-9_]/g, "_");
          try {
            env.declareVar(alias, jsValueToRuntimeValue(resolvedTarget));
          } catch {
            env.assignVar(alias, jsValueToRuntimeValue(resolvedTarget));
          }

          if (isObjectLike(resolvedTarget)) {
            for (const [key, val] of Object.entries(resolvedTarget)) {
              const runtimeVal = jsValueToRuntimeValue(val);
              try {
                env.declareVar(key, runtimeVal);
              } catch {
                env.assignVar(key, runtimeVal);
              }
            }
          }
        } else {
          for (const name of stmt.importedNames) {
            let foundVal =
              isObjectLike(resolvedTarget) && name in resolvedTarget
                ? (resolvedTarget as any)[name]
                : undefined;

            if (foundVal === undefined && isObjectLike(jsModule) && name in jsModule) {
              foundVal = (jsModule as any)[name];
            }

            if (foundVal === undefined) {
              throw new Error(
                `[Runtime Error] Simbol '${name}' tidak ditemukan pada pustaka npm '${source}'.`
              );
            }

            const runtimeVal = jsValueToRuntimeValue(foundVal);
            try {
              env.declareVar(name, runtimeVal);
            } catch {
              env.assignVar(name, runtimeVal);
            }
          }
        }

        return MK_NULL();
      }
    } else {
      try {
        const directPath = path.isAbsolute(source)
          ? source
          : path.resolve(/*turbopackIgnore: true*/ process.cwd(), source);

        if (fs.existsSync(directPath)) {
          moduleCode = fs.readFileSync(directPath, "utf-8");
        } else if (fs.existsSync(`${directPath}.wibu`)) {
          moduleCode = fs.readFileSync(`${directPath}.wibu`, "utf-8");
        }
      } catch {
        // Abaikan error fs
      }
    }
  }

  if (moduleCode === undefined) {
    throw new Error(
      `[Runtime Error] Modul '${source}' tidak dapat ditemukan atau dimuat.`
    );
  }

  // Parse dan eksekusi modul dalam lingkungan baru
  const moduleTokens = tokenize(moduleCode);
  const moduleParser = new Parser();
  const moduleAst = moduleParser.produceAST(moduleTokens);

  // Buat scope modul dari root environment agar pustaka standar global tetap tersedia
  let rootEnv: Environment = env;
  while ((rootEnv as any).parent) {
    rootEnv = (rootEnv as any).parent;
  }
  const moduleEnv = new Environment(rootEnv);
  await evaluate(moduleAst, moduleEnv);

  // Impor simbol ke dalam lingkungan pemanggil
  if (stmt.importedNames.includes("*")) {
    if (moduleEnv.exports.size > 0) {
      for (const [key, val] of moduleEnv.exports.entries()) {
        try {
          env.declareVar(key, val);
        } catch {
          env.assignVar(key, val);
        }
      }
    } else {
      for (const [key, val] of (moduleEnv as any).variables.entries()) {
        try {
          env.declareVar(key, val);
        } catch {
          env.assignVar(key, val);
        }
      }
    }
  } else {
    for (const name of stmt.importedNames) {
      let val: RuntimeValue;
      if (moduleEnv.exports.has(name)) {
        val = moduleEnv.exports.get(name)!;
      } else {
        val = moduleEnv.lookupVar(name);
      }
      try {
        env.declareVar(name, val);
      } catch {
        env.assignVar(name, val);
      }
    }
  }

  return MK_NULL();
}

// ----------------------------------------------------------------------------
// HIGH-LEVEL ASYNC RUNNER UNTUK BROWSER & CLI
// ----------------------------------------------------------------------------

export interface ExecutionResult {
  outputLog: string[];
  lastValue: RuntimeValue;
  error?: string | undefined;
}

export interface RunWibuScriptOptions extends EnvironmentOptions {}

/**
 * Menjalankan kode WibuScript secara asinkronus dengan penangkapan output log
 * dan opsi batasan keamanan runtime.
 */
export async function runWibuScriptAsync(
  sourceCode: string,
  onOutputOrOptions?: ((message: string) => void) | RunWibuScriptOptions
): Promise<ExecutionResult> {
  const outputLog: string[] = [];
  let onOutput: ((message: string) => void) | undefined;
  let customOptions: RunWibuScriptOptions = {};

  if (typeof onOutputOrOptions === "function") {
    onOutput = onOutputOrOptions;
  } else if (onOutputOrOptions) {
    customOptions = onOutputOrOptions;
    onOutput = onOutputOrOptions.outputHandler;
  }

  const handler = (msg: string) => {
    outputLog.push(msg);
    if (onOutput) {
      onOutput(msg);
    }
  };

  const env = createGlobalEnvironment({
    ...customOptions,
    outputHandler: handler,
    outputLog,
  });

  try {
    const tokens = tokenize(sourceCode);
    const parser = new Parser();
    const program = parser.produceAST(tokens);
    const lastValue = unwrapSignal(await evaluate(program, env));
    return { outputLog, lastValue };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    outputLog.push(errorMessage);
    if (onOutput) {
      onOutput(errorMessage);
    }
    return { outputLog, lastValue: MK_NULL(), error: errorMessage };
  }
}
