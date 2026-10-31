import { tokenize } from "./lexer";
import { Parser } from "./parser";
import { CANONICAL_SUPPORT_FUNCTIONS, HISTORICAL_ALIASES } from "./dialect-definitions";

export type SemanticSeverity = "error" | "warning";
export interface SemanticDiagnostic {
  phase: "Semantic";
  code: "duplicate-declaration" | "undefined-name" | "unused-variable" | "unused-function" | "control-flow-outside-context" | "unreachable-code";
  severity: SemanticSeverity;
  message: string;
  line: number;
  column: number;
  sourceLine: string;
}
interface SymbolEntry {
  name: string;
  kind: "variable" | "function" | "class" | "parameter" | "import";
  line: number;
  column: number;
  reads: number;
  exported: boolean;
}
interface Scope { parent: Scope | null; symbols: Map<string, SymbolEntry>; }

const BUILTINS = new Set<string>([
  ...Object.values(CANONICAL_SUPPORT_FUNCTIONS).flat(),
  ...HISTORICAL_ALIASES.supportFunctions,
  "console", "Math", "JSON", "Date", "Promise", "Array", "Object", "String",
  "Number", "Boolean", "Error", "Map", "Set", "RegExp", "NaN", "Infinity",
  "undefined", "globalThis", "fetch", "URL", "URLSearchParams", "setTimeout",
  "clearTimeout", "setInterval", "clearInterval", "parseInt", "parseFloat",
  "isNaN", "isFinite"
]);
function nodeLocation(node: any, fallback: { line: number; column: number }) {
  const loc = node?.loc?.start;
  return {
    line: Number.isInteger(loc?.line) && loc.line > 0 ? loc.line : fallback.line,
    column: Number.isInteger(loc?.column) && loc.column > 0 ? loc.column : fallback.column
  };
}

/** Performs conservative lexical-scope analysis. It never executes source code. */
export function analyzeSource(source: string): SemanticDiagnostic[] {
  const program = new Parser().produceAST(tokenize(source));
  const lines = source.split(/\r\n|\n|\r/);
  const diagnostics: SemanticDiagnostic[] = [];
  const root: Scope = { parent: null, symbols: new Map() };
  let current = root;
  let functionDepth = 0;
  let loopDepth = 0;

  const report = (code: SemanticDiagnostic["code"], severity: SemanticSeverity, message: string, location: { line: number; column: number }) => {
    diagnostics.push({ phase: "Semantic", code, severity, message, line: location.line, column: location.column, sourceLine: lines[location.line - 1] ?? "" });
  };
  const pushScope = () => { current = { parent: current, symbols: new Map() }; };
  const popScope = () => {
    const leaving = current;
    for (const symbol of leaving.symbols.values()) {
      if (!symbol.exported && symbol.reads === 0 && (symbol.kind === "variable" || symbol.kind === "function")) {
        report(symbol.kind === "function" ? "unused-function" : "unused-variable", "warning",
          symbol.kind === "function" ? \`Fungsi '\${symbol.name}' dideklarasikan tetapi tidak pernah digunakan.\` : \`Variabel '\${symbol.name}' dideklarasikan tetapi tidak pernah dibaca.\`,
          { line: symbol.line, column: symbol.column });
      }
    }
    current = leaving.parent ?? root;
  };
  const declare = (name: string, kind: SymbolEntry["kind"], location: { line: number; column: number }, exported = false) => {
    if (!name || name === "*") return;
    if (current.symbols.has(name)) {
      report("duplicate-declaration", "error", \`Nama '\${name}' sudah dideklarasikan pada scope yang sama.\`, location);
      return;
    }
    current.symbols.set(name, { name, kind, line: location.line, column: location.column, reads: 0, exported });
  };
  const resolve = (name: string): SymbolEntry | undefined => {
    let scope: Scope | null = current;
    while (scope) {
      const found = scope.symbols.get(name);
      if (found) return found;
      scope = scope.parent;
    }
    return undefined;
  };
  const readName = (name: string, location: { line: number; column: number }) => {
    if (!name || BUILTINS.has(name)) return;
    const symbol = resolve(name);
    if (symbol) symbol.reads++;
    else report("undefined-name", "error", \`Nama '\${name}' tidak ditemukan dalam scope yang tersedia.\`, location);
  };
  const writeName = (name: string, location: { line: number; column: number }) => {
    if (name && !BUILTINS.has(name) && !resolve(name)) {
      report("undefined-name", "error", \`Nama '\${name}' ditugaskan sebelum dideklarasikan.\`, location);
    }
  };

  const visitExpression = (node: any, location: { line: number; column: number }): void => {
    if (!node || typeof node !== "object") return;
    const loc = nodeLocation(node, location);
    switch (node.kind) {
      case "Identifier": readName(node.symbol, loc); return;
      case "AssignmentExpression":
        if (node.assignee?.kind === "Identifier") writeName(node.assignee.symbol, loc);
        else if (node.assignee?.kind === "MemberExpr") visitExpression(node.assignee, loc);
        else if (node.assignee?.kind === "ArrayPattern") {
          for (const item of node.assignee.elements ?? []) {
            if (typeof item === "string") writeName(item, loc);
            else if (item?.kind === "RestElement") writeName(item.argument, loc);
          }
        } else if (node.assignee?.kind === "ObjectPattern") {
          for (const item of node.assignee.properties ?? []) writeName(item.target ?? item.key, loc);
        }
        visitExpression(node.value, loc); return;
      case "MemberExpr":
        visitExpression(node.object, loc);
        if (node.computed) visitExpression(node.property, loc);
        return;
      case "CallExpression":
        if (typeof node.callee === "string") readName(node.callee, loc);
        else visitExpression(node.callee, loc);
        for (const arg of node.args ?? []) visitExpression(arg, loc);
        return;
      case "NewExpression":
        readName(node.className, loc);
        for (const arg of node.args ?? []) visitExpression(arg, loc);
        return;
      case "ArrowFunctionExpression":
        pushScope(); functionDepth++;
        for (const param of node.parameters ?? []) declare(param, "parameter", loc);
        visitStatements(node.body ?? []);
        functionDepth--; popScope(); return;
      case "ObjectLiteral":
        for (const property of node.properties ?? []) visitExpression(property.value, loc);
        return;
      case "ArrayLiteral":
        for (const item of node.elements ?? []) visitExpression(item, loc);
        return;
      case "SpreadElement": visitExpression(node.argument, loc); return;
      case "Property": visitExpression(node.value, loc); return;
      default:
        for (const [key, value] of Object.entries(node)) {
          if (["kind", "loc", "symbol", "operator"].includes(key)) continue;
          if (Array.isArray(value)) {
            for (const child of value) if (child && typeof child === "object") visitExpression(child, loc);
          } else if (value && typeof value === "object") visitExpression(value, loc);
        }
    }
  };

  const visitStatements = (statements: any[]): void => {
    let terminated = false;
    for (const statement of statements) {
      const loc = nodeLocation(statement, { line: 1, column: 1 });
      if (terminated) report("unreachable-code", "warning", "Pernyataan ini tidak dapat dijangkau setelah alur kontrol berakhir.", loc);
      switch (statement.kind) {
        case "VariableDeclaration":
          if (statement.pattern?.kind === "ArrayPattern") {
            for (const item of statement.pattern.elements ?? []) {
              if (typeof item === "string") declare(item, "variable", loc);
              else if (item?.kind === "RestElement") declare(item.argument, "variable", loc);
            }
          } else if (statement.pattern?.kind === "ObjectPattern") {
            for (const item of statement.pattern.properties ?? []) declare(item.target ?? item.key, "variable", loc);
          } else declare(statement.identifier, "variable", loc);
          visitExpression(statement.value, loc); break;
        case "FunctionDeclaration":
          declare(statement.name, "function", loc);
          pushScope(); functionDepth++;
          for (const param of statement.parameters ?? []) declare(param, "parameter", loc);
          visitStatements(statement.body ?? []);
          functionDepth--; popScope(); break;
        case "ClassDeclaration":
          declare(statement.name, "class", loc);
          if (statement.parentClass) readName(statement.parentClass, loc);
          pushScope();
          if (statement.constructorMethod) {
            pushScope(); functionDepth++;
            for (const param of statement.constructorMethod.parameters ?? []) declare(param, "parameter", loc);
            visitStatements(statement.constructorMethod.body ?? []);
            functionDepth--; popScope();
          }
          for (const method of statement.methods ?? []) {
            pushScope(); functionDepth++;
            for (const param of method.parameters ?? []) declare(param, "parameter", loc);
            visitStatements(method.body ?? []);
            functionDepth--; popScope();
          }
          popScope(); break;
        case "ImportStatement":
          for (const name of statement.importedNames ?? []) if (name !== "*") declare(name, "import", loc);
          break;
        case "ExportStatement":
          if (statement.declaration) {
            const declaration = statement.declaration;
            if (declaration.kind === "VariableDeclaration") {
              if (!declaration.pattern) declare(declaration.identifier, "variable", loc, true);
              visitExpression(declaration.value, loc);
            } else {
              visitStatements([declaration]);
              const name = declaration.name;
              if (name) { const symbol = resolve(name); if (symbol) symbol.exported = true; }
            }
          } else {
            for (const name of statement.exportedNames ?? []) {
              const symbol = resolve(name);
              if (symbol) symbol.exported = true;
              else readName(name, loc);
            }
          }
          break;
        case "IfStatement":
          visitExpression(statement.condition, loc);
          pushScope(); visitStatements(statement.thenBranch ?? []); popScope();
          if (statement.elseBranch) { pushScope(); visitStatements(statement.elseBranch); popScope(); }
          break;
        case "LoopStatement":
          visitExpression(statement.condition, loc); loopDepth++;
          pushScope(); visitStatements(statement.body ?? []); popScope(); loopDepth--; break;
        case "ForEachStatement":
          visitExpression(statement.collection, loc); loopDepth++;
          pushScope(); declare(statement.item, "variable", loc); visitStatements(statement.body ?? []); popScope(); loopDepth--; break;
        case "TryCatchStatement":
          pushScope(); visitStatements(statement.tryBranch ?? []); popScope();
          pushScope(); if (statement.catchVariable) declare(statement.catchVariable, "parameter", loc);
          visitStatements(statement.catchBranch ?? []); popScope(); break;
        case "MatchStatement":
          visitExpression(statement.discriminant, loc);
          for (const item of statement.cases ?? []) {
            if (item.value) visitExpression(item.value, loc);
            pushScope(); visitStatements(item.body ?? []); popScope();
          }
          break;
        case "BlockStatement": pushScope(); visitStatements(statement.body ?? []); popScope(); break;
        case "ExpressionStatement": visitExpression(statement.expression, loc); break;
        case "ReturnStatement":
          if (functionDepth === 0) report("control-flow-outside-context", "error", "Pernyataan return hanya boleh digunakan di dalam fungsi.", loc);
          if (statement.value) visitExpression(statement.value, loc);
          terminated = true; break;
        case "BreakStatement":
        case "ContinueStatement":
          if (loopDepth === 0) report("control-flow-outside-context", "error",
            statement.kind === "BreakStatement" ? "break hanya boleh digunakan di dalam perulangan." : "continue hanya boleh digunakan di dalam perulangan.", loc);
          terminated = true; break;
        default: visitExpression(statement, loc);
      }
    }
  };

  visitStatements(program.body);
  for (const symbol of root.symbols.values()) {
    if (!symbol.exported && symbol.reads === 0 && (symbol.kind === "variable" || symbol.kind === "function")) {
      report(symbol.kind === "function" ? "unused-function" : "unused-variable", "warning",
        symbol.kind === "function" ? \`Fungsi '\${symbol.name}' dideklarasikan tetapi tidak pernah digunakan.\` : \`Variabel '\${symbol.name}' dideklarasikan tetapi tidak pernah dibaca.\`,
        { line: symbol.line, column: symbol.column });
    }
  }
  return diagnostics;
}
