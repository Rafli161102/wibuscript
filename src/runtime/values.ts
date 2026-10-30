// WibuScript runtime value model and constructors.
// Kept independent from the evaluator so runtime APIs can be organized by concern.
import type { FunctionDeclaration, Statement } from "../ast";
import type { Environment } from "./environment";

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
  nativeRef?: any;
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
  properties = new Map<string, RuntimeValue>(),
  nativeRef?: any
): ObjectValue {
  return { type: "object", properties, nativeRef };
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

export function formatRuntimeValue(
  val: RuntimeValue,
  seen = new Set<RuntimeValue>()
): string {
  if (
    val &&
    typeof val === "object" &&
    (val.type === "object" || val.type === "array" || val.type === "instance")
  ) {
    if (seen.has(val)) return "[Circular]";
    seen.add(val);
  }

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
        .map((el) => formatRuntimeValue(el, seen))
        .join(", ");
      return `[${formattedItems}]`;
    }
    case "object": {
      const objVal = val as ObjectValue;
      if (objVal.nativeRef !== undefined) {
        if (
          typeof objVal.nativeRef.toString === "function" &&
          objVal.nativeRef.toString !== Object.prototype.toString
        ) {
          return objVal.nativeRef.toString();
        }
        if (
          objVal.nativeRef.constructor &&
          objVal.nativeRef.constructor.name !== "Object"
        ) {
          return `[${objVal.nativeRef.constructor.name}]`;
        }
      }
      const entries: string[] = [];
      objVal.properties.forEach((v, k) => {
        entries.push(`${k}: ${formatRuntimeValue(v, seen)}`);
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
        entries.push(`${k}: ${formatRuntimeValue(v, seen)}`);
      });
      return entries.length === 0
        ? `<${inst.className}>`
        : `<${inst.className} { ${entries.join(", ")} }>`;
    }
    default:
      return "undefined";
  }
}
