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
  AssignmentExpression,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  Identifier,
  NumericLiteral,
  StringLiteral,
  BooleanLiteral,
  ArrayLiteral,
  ObjectLiteral,
  MemberExpr,
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
  | "function";

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
    default:
      return "undefined";
  }
}

export function jsValueToRuntimeValue(val: unknown): RuntimeValue {
  if (val === null || val === undefined) return MK_NULL();
  if (typeof val === "boolean") return MK_BOOL(val);
  if (typeof val === "number") return MK_NUMBER(val);
  if (typeof val === "string") return MK_STRING(val);
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
    default:
      return formatRuntimeValue(val);
  }
}

export async function invokeFunction(
  callee: RuntimeValue,
  args: RuntimeValue[],
  env: Environment
): Promise<RuntimeValue> {
  if (callee.type === "native-fn") {
    const result = (callee as NativeFnValue).call(args, env);
    return result instanceof Promise ? await result : result;
  }

  if (callee.type === "function") {
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
      const result = await evaluate(stmt, scope);
      if (isReturnSignal(result)) {
        return result.value;
      }
      lastVal = result as RuntimeValue;
    }

    return lastVal;
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
}

export class Environment {
  private parent?: Environment | undefined;
  private variables: Map<string, RuntimeValue>;

  constructor(parentEnv?: Environment | undefined) {
    this.parent = parentEnv;
    this.variables = new Map();
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
  }

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
  env.declareVar("print", printFn);
  env.declareVar("kuchiMite", printFn);
  env.declareVar("km", printFn);
  env.declareVar("bacotAmba", printFn);
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
  env.declareVar("nungguinLu", delayFn);

  // 3. Waktu Lokal: imaJikan (Murni) / ima (Singkat) / jamBerapaBanh (Wibu) / cekJamLur (Rongawi)
  const waktuSekarangFn = MK_NATIVE_FN((): RuntimeValue => {
    return MK_STRING(new Date().toLocaleTimeString());
  });
  env.declareVar("sekarangImaDesu", waktuSekarangFn);
  env.declareVar("ima", waktuSekarangFn);
  env.declareVar("imaDesu", waktuSekarangFn);
  env.declareVar("waktuSekarang", waktuSekarangFn);
  env.declareVar("imaJikan", waktuSekarangFn);
  env.declareVar("jamBerapaBanh", waktuSekarangFn);
  env.declareVar("cekJamLur", waktuSekarangFn);

  // 4. Panjang/Length: nagasa (Murni) / naga (Singkat) / seginiDoang (Wibu) / itungPanjangLur (Rongawi)
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
  env.declareVar("itungPanjangLur", panjangFn);

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
  env.declareVar("bendaApaanLur", tipeDataFn);

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

  // 9. Tambah Array: ireta (Murni) / ire (Singkat) / masukinLur (Wibu) / tambahBarang (Rongawi)
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
  env.declareVar("masukinLur", pushRetsuFn);
  env.declareVar("tambahBarang", pushRetsuFn);

  // 10. Ambil Array: toru (Murni) / tor (Singkat) / ambilBelakang (Wibu) / keluarinBarang (Rongawi)
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
  env.declareVar("ambilBelakang", popRetsuFn);
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
  env.declareVar("potongSini", potongTeksFn);
  env.declareVar("cuilTeks", potongTeksFn);

  // 12. Uppercase: ookiku (Murni) / ook (Singkat) / gedeinHuruf (Wibu) / besarinSemua (Rongawi)
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
  env.declareVar("besarinSemua", uppercaseFn);

  // 13. Lowercase: chiisaku (Murni) / chi (Singkat) / kecilinHuruf (Wibu) / kecilinSemua (Rongawi)
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
  env.declareVar("kecilinSemua", lowercaseFn);

  // 14. Generator Acak / RNG: randamu (Murni) / ran (Singkat) / gachaBanh (Wibu) / kocokAngka (Rongawi)
  const gachaFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
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
  env.declareVar("gachaPull", gachaFn);
  env.declareVar("gacha", gachaFn);
  env.declareVar("randamu", gachaFn);
  env.declareVar("ran", gachaFn);
  env.declareVar("gachaBanh", gachaFn);
  env.declareVar("kocokAngka", gachaFn);

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
  env.declareVar("udahKelarinAja", panicFn);

  // 16. Inisialisasi Barisan/Array: retsu (Murni) / ret (Singkat) / bikinBarisan (Wibu) / kumpulinJawa (Rongawi)
  const retsuFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    return MK_ARRAY([...args]);
  });
  env.declareVar("bikinRetsu", retsuFn);
  env.declareVar("retsu", retsuFn);
  env.declareVar("ret", retsuFn);
  env.declareVar("bikinBarisan", retsuFn);
  env.declareVar("kumpulinJawa", retsuFn);

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
  env.declareVar("bukaBerkasLur", bacaBerkasFn);

  // 19. Tulis Berkas: kaku (Murni) / ka (Singkat) / tulisinBerkas (Wibu) / coretBerkasLur (Rongawi)
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
  env.declareVar("coretBerkasLur", tulisBerkasFn);

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
        let response: Response;
        try {
          response = await fetch(url);
        } catch (err: unknown) {
          if (
            typeof process !== "undefined" &&
            process.env &&
            process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0"
          ) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            response = await fetch(url);
          } else {
            throw err;
          }
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
  env.declareVar("SepongMas", fetchFn);

  // 22. Penguraian & Pembungkusan JSON:
  // Parse: kanjiNi (Murni) / kn (Singkat) / jadiObjekBanh (Wibu) / uraiJsonLur (Rongawi)
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
  env.declareVar("uraiJsonLur", jsonParseFn);

  // Stringify: kanjiMojiretsu (Murni) / kmj (Singkat) / jadiTeksBanh (Wibu) / bungkusJsonLur (Rongawi)
  const jsonStringifyFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const valArg = args[0] ?? MK_NULL();
    const jsObj = runtimeValueToJsValue(valArg);
    return MK_STRING(JSON.stringify(jsObj));
  });
  env.declareVar("kanjiMojiretsu", jsonStringifyFn);
  env.declareVar("kmj", jsonStringifyFn);
  env.declareVar("jadiTeksBanh", jsonStringifyFn);
  env.declareVar("bungkusJsonLur", jsonStringifyFn);

  // 23. Fungsi Tingkat Tinggi Barisan / Array:
  // Map: utsusu (Murni) / utu (Singkat) / petainBanh (Wibu) / petainLur (Rongawi)
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
  env.declareVar("petainLur", mapFn);

  // Filter: erabu (Murni) / era (Singkat) / saringBanh (Wibu) / saringLur (Rongawi)
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
  env.declareVar("saringLur", filterFn);

  // Find: mitsukeru (Murni) / mitu (Singkat) / cariinBanh (Wibu) / golekLur (Rongawi)
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
  env.declareVar("golekLur", findFn);

  // 24. Matematika Tingkat Lanjut:
  // Akar Kuadrat (SQRT): ruuto (Murni) / ru (Singkat) / akarPangkat (Wibu) / akarLur (Rongawi)
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
  env.declareVar("akarLur", sqrtFn);

  // Nilai Mutlak (ABS): zettaichi (Murni) / zet (Singkat) / mutlakBanh (Wibu) / mutlakLur (Rongawi)
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
  env.declareVar("mutlakLur", absFn);

  // Pembulatan ke Bawah (FLOOR): kiriSute (Murni) / ks (Singkat) / bawahinBanh (Wibu) / bawahLur (Rongawi)
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
  env.declareVar("bawahLur", floorFn);

  // Pembulatan ke Atas (CEIL): kiriAge (Murni) / kia (Singkat) / atasinBanh (Wibu) / atasLur (Rongawi)
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
  env.declareVar("atasLur", ceilFn);

  return env;
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

    case "IfStatement":
      return await evalIfStatement(astNode as IfStatement, env);

    case "LoopStatement":
      return await evalLoopStatement(astNode as LoopStatement, env);

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

  for (const statement of program.body) {
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

  while (isTruthy(unwrapSignal(await evaluate(stmt.condition, env)))) {
    const scope = new Environment(env);
    let shouldBreak = false;

    for (const s of stmt.body) {
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
    if (left.type !== right.type) {
      return MK_BOOL(false);
    }
    switch (left.type) {
      case "number":
        return MK_BOOL(
          (left as NumberValue).value === (right as NumberValue).value
        );
      case "string":
        return MK_BOOL(
          (left as StringValue).value === (right as StringValue).value
        );
      case "boolean":
        return MK_BOOL(
          (left as BooleanValue).value === (right as BooleanValue).value
        );
      case "null":
        return MK_BOOL(true);
      default:
        return MK_BOOL(left === right);
    }
  }

  if (binop.operator === "!=") {
    if (left.type !== right.type) {
      return MK_BOOL(true);
    }
    switch (left.type) {
      case "number":
        return MK_BOOL(
          (left as NumberValue).value !== (right as NumberValue).value
        );
      case "string":
        return MK_BOOL(
          (left as StringValue).value !== (right as StringValue).value
        );
      case "boolean":
        return MK_BOOL(
          (left as BooleanValue).value !== (right as BooleanValue).value
        );
      case "null":
        return MK_BOOL(false);
      default:
        return MK_BOOL(left !== right);
    }
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

async function evalCallExpression(
  call: CallExpression,
  env: Environment
): Promise<RuntimeValue> {
  const callee = env.lookupVar(call.callee);
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
    elements.push(unwrapSignal(await evaluate(el, env)));
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

  if (objectVal.type === "array") {
    const arr = objectVal as ArrayValue;
    if (!node.computed) {
      const prop = (node.property as Identifier).symbol;
      if (prop === "length" || prop === "nagasa" || prop === "naga") {
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

  if (objectVal.type === "string" && node.computed) {
    const str = (objectVal as StringValue).value;
    const idxVal = unwrapSignal(await evaluate(node.property, env));
    if (idxVal.type === "number") {
      const idx = (idxVal as NumberValue).value;
      if (idx >= 0 && idx < str.length) {
        return MK_STRING(str[idx] as string);
      }
      return MK_NULL();
    }
  }

  throw new Error(
    `[Runtime Error] Tidak dapat mengakses properti dari tipe '${objectVal.type}'.`
  );
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
// HIGH-LEVEL ASYNC RUNNER UNTUK BROWSER & CLI
// ----------------------------------------------------------------------------

export interface ExecutionResult {
  outputLog: string[];
  lastValue: RuntimeValue;
  error?: string | undefined;
}

/**
 * Menjalankan kode WibuScript secara asinkronus dengan penangkapan output log.
 */
export async function runWibuScriptAsync(
  sourceCode: string,
  onOutput?: (message: string) => void
): Promise<ExecutionResult> {
  const outputLog: string[] = [];

  const handler = (msg: string) => {
    outputLog.push(msg);
    if (onOutput) {
      onOutput(msg);
    }
  };

  const env = createGlobalEnvironment({
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
