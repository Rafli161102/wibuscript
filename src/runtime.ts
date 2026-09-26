// ============================================================================
// WIBUSCRIPT RUNTIME & EVALUATOR
// Mesin Tree-Walking Interpreter untuk mengeksekusi AST WibuScript
// dalam lingkungan eksekusi Node.js.
// ============================================================================

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
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  Identifier,
  NumericLiteral,
  StringLiteral,
  BooleanLiteral,
} from "./ast.js";

// ----------------------------------------------------------------------------
// TIPE NILAI RUNTIME
// ----------------------------------------------------------------------------

export type ValueType = "null" | "number" | "boolean" | "string" | "native-fn" | "function";

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

export type NativeFnCall = (args: RuntimeValue[], env: Environment) => RuntimeValue;

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

export interface ReturnSignal {
  isReturn: true;
  value: RuntimeValue;
}

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
    case "native-fn":
      return "[NativeFunction]";
    case "function":
      return `[Function: ${(val as FunctionValue).name}]`;
    default:
      return "undefined";
  }
}

// ----------------------------------------------------------------------------
// ENVIRONMENT (LINGKUP VARIABEL & FUNGSI)
// ----------------------------------------------------------------------------

export class Environment {
  private parent?: Environment | undefined;
  private variables: Map<string, RuntimeValue>;

  constructor(parentEnv?: Environment | undefined) {
    this.parent = parentEnv;
    this.variables = new Map();
  }

  public declareVar(name: string, value: RuntimeValue): RuntimeValue {
    if (this.variables.has(name)) {
      throw new Error(`[Runtime Error] Variabel '${name}' sudah dideklarasikan pada lingkup ini.`);
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

/**
 * Membuat Lingkup Global dengan fungsi bawaan (mite / kasihMite) dan konstanta default.
 */
export function createGlobalEnvironment(): Environment {
  const env = new Environment();

  // Implementasi fungsi output mite() dan kasihMite()
  const printFn = MK_NATIVE_FN((args: RuntimeValue[]): RuntimeValue => {
    const output = args.map((arg) => formatRuntimeValue(arg)).join(" ");
    console.log(output);
    return MK_NULL();
  });

  env.declareVar("mite", printFn);
  env.declareVar("kasihMite", printFn);
  env.declareVar("print", printFn);

  // Konstanta bawaan
  env.declareVar("maji", MK_BOOL(true));
  env.declareVar("majiBener", MK_BOOL(true));
  env.declareVar("uso", MK_BOOL(false));
  env.declareVar("usoBanget", MK_BOOL(false));
  env.declareVar("kara", MK_NULL());
  env.declareVar("kosongZannen", MK_NULL());

  return env;
}

// ----------------------------------------------------------------------------
// EVALUATOR (TREE-WALKING INTERPRETER)
// ----------------------------------------------------------------------------

export function evaluate(astNode: Statement, env: Environment): RuntimeValue | ReturnSignal {
  switch (astNode.kind) {
    case "Program":
      return evalProgram(astNode as Program, env);

    case "VariableDeclaration":
      return evalVariableDeclaration(astNode as VariableDeclaration, env);

    case "FunctionDeclaration":
      return evalFunctionDeclaration(astNode as FunctionDeclaration, env);

    case "IfStatement":
      return evalIfStatement(astNode as IfStatement, env);

    case "LoopStatement":
      return evalLoopStatement(astNode as LoopStatement, env);

    case "ReturnStatement":
      return evalReturnStatement(astNode as ReturnStatement, env);

    case "BlockStatement":
      return evalBlockStatement(astNode as BlockStatement, env);

    case "ExpressionStatement":
      return evalExpressionStatement(astNode as ExpressionStatement, env);

    case "AssignmentExpression":
      return evalAssignment(astNode as AssignmentExpression, env);

    case "BinaryExpression":
      return evalBinaryExpression(astNode as BinaryExpression, env);

    case "CallExpression":
      return evalCallExpression(astNode as CallExpression, env);

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
      throw new Error(`[Runtime Error] Simpul AST '${astNode.kind}' belum didukung.`);
  }
}

function isReturnSignal(val: RuntimeValue | ReturnSignal): val is ReturnSignal {
  return typeof val === "object" && val !== null && "isReturn" in val && (val as ReturnSignal).isReturn === true;
}

function unwrapSignal(val: RuntimeValue | ReturnSignal): RuntimeValue {
  if (isReturnSignal(val)) {
    return val.value;
  }
  return val;
}

function isTruthy(val: RuntimeValue): boolean {
  switch (val.type) {
    case "boolean":
      return (val as BooleanValue).value;
    case "number":
      return (val as NumberValue).value !== 0;
    case "string":
      return (val as StringValue).value.length > 0;
    case "null":
      return false;
    default:
      return true;
  }
}

function evalProgram(program: Program, env: Environment): RuntimeValue {
  let lastEvaluated: RuntimeValue = MK_NULL();

  for (const statement of program.body) {
    const result = evaluate(statement, env);
    if (isReturnSignal(result)) {
      return result.value;
    }
    lastEvaluated = result;
  }

  return lastEvaluated;
}

function evalVariableDeclaration(declaration: VariableDeclaration, env: Environment): RuntimeValue {
  const value = unwrapSignal(evaluate(declaration.value, env));
  return env.declareVar(declaration.identifier, value);
}

function evalFunctionDeclaration(declaration: FunctionDeclaration, env: Environment): RuntimeValue {
  const fn: FunctionValue = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  };
  return env.declareVar(declaration.name, fn);
}

function evalIfStatement(stmt: IfStatement, env: Environment): RuntimeValue | ReturnSignal {
  const conditionValue = unwrapSignal(evaluate(stmt.condition, env));

  if (isTruthy(conditionValue)) {
    const scope = new Environment(env);
    for (const s of stmt.thenBranch) {
      const result = evaluate(s, scope);
      if (isReturnSignal(result)) return result;
    }
  } else if (stmt.elseBranch) {
    const scope = new Environment(env);
    for (const s of stmt.elseBranch) {
      const result = evaluate(s, scope);
      if (isReturnSignal(result)) return result;
    }
  }

  return MK_NULL();
}

function evalLoopStatement(stmt: LoopStatement, env: Environment): RuntimeValue | ReturnSignal {
  let lastVal: RuntimeValue = MK_NULL();

  while (isTruthy(unwrapSignal(evaluate(stmt.condition, env)))) {
    const scope = new Environment(env);
    for (const s of stmt.body) {
      const result = evaluate(s, scope);
      if (isReturnSignal(result)) return result;
      lastVal = result;
    }
  }

  return lastVal;
}

function evalReturnStatement(stmt: ReturnStatement, env: Environment): ReturnSignal {
  let value: RuntimeValue = MK_NULL();
  if (stmt.value) {
    value = unwrapSignal(evaluate(stmt.value, env));
  }
  return { isReturn: true, value };
}

function evalBlockStatement(block: BlockStatement, env: Environment): RuntimeValue | ReturnSignal {
  const scope = new Environment(env);
  let lastVal: RuntimeValue = MK_NULL();

  for (const s of block.body) {
    const result = evaluate(s, scope);
    if (isReturnSignal(result)) return result;
    lastVal = result;
  }

  return lastVal;
}

function evalExpressionStatement(stmt: ExpressionStatement, env: Environment): RuntimeValue | ReturnSignal {
  return evaluate(stmt.expression, env);
}

function evalIdentifier(ident: Identifier, env: Environment): RuntimeValue {
  return env.lookupVar(ident.symbol);
}

function evalAssignment(node: AssignmentExpression, env: Environment): RuntimeValue {
  const value = unwrapSignal(evaluate(node.value, env));
  return env.assignVar(node.assignee, value);
}

function evalBinaryExpression(binop: BinaryExpression, env: Environment): RuntimeValue {
  const left = unwrapSignal(evaluate(binop.left, env));
  const right = unwrapSignal(evaluate(binop.right, env));

  // Penjumlahan string atau angka
  if (binop.operator === "+") {
    if (left.type === "string" || right.type === "string") {
      return MK_STRING(formatRuntimeValue(left) + formatRuntimeValue(right));
    }
    if (left.type === "number" && right.type === "number") {
      return MK_NUMBER((left as NumberValue).value + (right as NumberValue).value);
    }
    throw new Error("[Runtime Error] Operator '+' hanya mendukung tipe Number dan String.");
  }

  // Operator numerik: -, *, /
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

  // Operator perbandingan kesetaraan: ==, !=
  if (binop.operator === "==") {
    if (left.type !== right.type) {
      return MK_BOOL(false);
    }
    switch (left.type) {
      case "number":
        return MK_BOOL((left as NumberValue).value === (right as NumberValue).value);
      case "string":
        return MK_BOOL((left as StringValue).value === (right as StringValue).value);
      case "boolean":
        return MK_BOOL((left as BooleanValue).value === (right as BooleanValue).value);
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
        return MK_BOOL((left as NumberValue).value !== (right as NumberValue).value);
      case "string":
        return MK_BOOL((left as StringValue).value !== (right as StringValue).value);
      case "boolean":
        return MK_BOOL((left as BooleanValue).value !== (right as BooleanValue).value);
      case "null":
        return MK_BOOL(false);
      default:
        return MK_BOOL(left !== right);
    }
  }

  throw new Error(`[Runtime Error] Operator '${binop.operator}' tidak kompatibel untuk tipe ${left.type} dan ${right.type}.`);
}

function evalCallExpression(call: CallExpression, env: Environment): RuntimeValue {
  const callee = env.lookupVar(call.callee);
  const evaluatedArgs: RuntimeValue[] = call.args.map((arg) => unwrapSignal(evaluate(arg, env)));

  if (callee.type === "native-fn") {
    return (callee as NativeFnValue).call(evaluatedArgs, env);
  }

  if (callee.type === "function") {
    const fn = callee as FunctionValue;
    const scope = new Environment(fn.declarationEnv);

    for (let i = 0; i < fn.parameters.length; i++) {
      const paramName = fn.parameters[i];
      if (paramName !== undefined) {
        const argVal = evaluatedArgs[i] ?? MK_NULL();
        scope.declareVar(paramName, argVal);
      }
    }

    let lastVal: RuntimeValue = MK_NULL();
    for (const stmt of fn.body) {
      const result = evaluate(stmt, scope);
      if (isReturnSignal(result)) {
        return result.value;
      }
      lastVal = result;
    }

    return lastVal;
  }

  throw new Error(`[Runtime Error] Identifier '${call.callee}' bukan merupakan fungsi yang dapat dipanggil.`);
}
