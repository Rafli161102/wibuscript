// ============================================================================
// WIBUSCRIPT CORE ENGINE ENTRY POINT
// Ekspor modul murni WibuScript (Lexer, Parser, AST, Runtime, Environment,
// Dialect Converter, JavaScript Transpiler, dan REPL).
// ============================================================================

import { tokenize, TokenType, KEYWORDS, type Token } from "./lexer";
import { Parser } from "./parser";
import {
  createGlobalEnvironment,
  evaluate,
  runWibuScriptAsync,
  unwrapSignal,
  formatRuntimeValue,
  invokeFunction,
  jsValueToRuntimeValue,
  runtimeValueToJsValue,
  Environment,
  MK_NULL,
  MK_NUMBER,
  MK_BOOL,
  MK_STRING,
  MK_ARRAY,
  MK_OBJECT,
  MK_NATIVE_FN,
  MK_CLASS,
  MK_INSTANCE,
  VIRTUAL_MODULES,
  registerVirtualModule,
  clearVirtualModules,
  type RuntimeValue,
  type NullValue,
  type NumberValue,
  type BooleanValue,
  type StringValue,
  type ArrayValue,
  type ObjectValue,
  type NativeFnValue,
  type FunctionValue,
  type ClassValue,
  type InstanceValue,
  type ReturnSignal,
  type ExecutionResult,
  type EnvironmentOptions,
} from "./runtime";
import { convertDialect, type Dialect, DIALECT_TABLE } from "./converter";
import { transpileToJS, Transpiler } from "./transpiler";

export {
  tokenize,
  TokenType,
  KEYWORDS,
  type Token,
  Parser,
  createGlobalEnvironment,
  evaluate,
  runWibuScriptAsync,
  unwrapSignal,
  formatRuntimeValue,
  invokeFunction,
  jsValueToRuntimeValue,
  runtimeValueToJsValue,
  Environment,
  MK_NULL,
  MK_NUMBER,
  MK_BOOL,
  MK_STRING,
  MK_ARRAY,
  MK_OBJECT,
  MK_NATIVE_FN,
  MK_CLASS,
  MK_INSTANCE,
  VIRTUAL_MODULES,
  registerVirtualModule,
  clearVirtualModules,
  type RuntimeValue,
  type NullValue,
  type NumberValue,
  type BooleanValue,
  type StringValue,
  type ArrayValue,
  type ObjectValue,
  type NativeFnValue,
  type FunctionValue,
  type ClassValue,
  type InstanceValue,
  type ReturnSignal,
  type ExecutionResult,
  type EnvironmentOptions,
  convertDialect,
  type Dialect,
  DIALECT_TABLE,
  transpileToJS,
  Transpiler,
};

export * from "./ast";

/**
 * Menjalankan kode sumber WibuScript langsung di memori secara asinkronus.
 * Bebas dari ketergantungan modul Node.js internal (node:fs, node:path).
 */
export async function runWibuScript(sourceCode: string): Promise<void> {
  const tokens = tokenize(sourceCode);
  const parser = new Parser();
  const program = parser.produceAST(tokens);
  const environment = createGlobalEnvironment();
  await evaluate(program, environment);
}
