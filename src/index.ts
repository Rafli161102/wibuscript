// ============================================================================
// WIBUSCRIPT CORE ENGINE ENTRY POINT
// Ekspor modul murni WibuScript (Lexer, Parser, AST, Runtime, Environment).
// 100% aman untuk lingkungan Web Browser dan Client Components (Next.js).
// ============================================================================

import { tokenize, TokenType, KEYWORDS, type Token } from "./lexer";
import { Parser } from "./parser";
import {
  createGlobalEnvironment,
  evaluate,
  runWibuScriptAsync,
  unwrapSignal,
  formatRuntimeValue,
  Environment,
  MK_NULL,
  MK_NUMBER,
  MK_BOOL,
  MK_STRING,
  MK_NATIVE_FN,
  type RuntimeValue,
  type NullValue,
  type NumberValue,
  type BooleanValue,
  type StringValue,
  type NativeFnValue,
  type FunctionValue,
  type ReturnSignal,
  type ExecutionResult,
  type EnvironmentOptions,
} from "./runtime";

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
  Environment,
  MK_NULL,
  MK_NUMBER,
  MK_BOOL,
  MK_STRING,
  MK_NATIVE_FN,
  type RuntimeValue,
  type NullValue,
  type NumberValue,
  type BooleanValue,
  type StringValue,
  type NativeFnValue,
  type FunctionValue,
  type ReturnSignal,
  type ExecutionResult,
  type EnvironmentOptions,
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
