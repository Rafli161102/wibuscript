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
  type RunWibuScriptOptions,
} from "./runtime";
import { convertDialect, type Dialect, DIALECT_TABLE } from "./converter";
import {
  transpileToJS,
  transpileWithSourceMap,
  Transpiler,
  type SourceMapV3,
  type TranspileOptions,
  type TranspileResult,
} from "./transpiler";
import {
  WibuSandbox,
  runInSandbox,
  type SandboxOptions,
  type SandboxResult,
} from "./sandbox";
import {
  DIALECTS,
  OFFICIAL_VISUAL_THEME,
  getDialectMetadata,
  getKeywordsByCategory,
  getAllKeywordsForDialect,
  getAllKeywords,
  getRegexForCategory,
  generateMonarchTokensProvider,
  generateTextMateGrammar,
  type DialectId,
  type VisualTokenCategory,
} from "./dialect-definitions";

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
  type RunWibuScriptOptions,
  convertDialect,
  type Dialect,
  DIALECT_TABLE,
  transpileToJS,
  transpileWithSourceMap,
  Transpiler,
  type SourceMapV3,
  type TranspileOptions,
  type TranspileResult,
  WibuSandbox,
  runInSandbox,
  type SandboxOptions,
  type SandboxResult,
  DIALECTS,
  OFFICIAL_VISUAL_THEME,
  getDialectMetadata,
  getKeywordsByCategory,
  getAllKeywordsForDialect,
  getAllKeywords,
  getRegexForCategory,
  generateMonarchTokensProvider,
  generateTextMateGrammar,
  type DialectId,
  type VisualTokenCategory,
};

export * from "./ast";
export * from "./dom-transpiler";
export { transpile as transpileDOM, transpile as transpileWibuWeb } from "./dom-transpiler";
export * as web from "./modules/web";
export * as server from "./modules/server";

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
