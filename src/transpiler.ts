// File: src/transpiler.ts
// ============================================================================
// WIBUSCRIPT JAVASCRIPT TRANSPILER
// Mengompilasi AST WibuScript menjadi kode JavaScript (ES2022+ / Node.js)
// yang dapat dijalankan secara langsung tanpa interpreter.
// ============================================================================

import type {
  Program,
  Statement,
  Expression,
  VariableDeclaration,
  IfStatement,
  LoopStatement,
  FunctionDeclaration,
  ReturnStatement,
  BlockStatement,
  ExpressionStatement,
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

// Pemetaan fungsi bawaan WibuScript (4 Dialek) ke implementasi JavaScript
const STDLIB_MAP: Record<string, string> = {
  // Print
  mite: "console.log",
  mi: "console.log",
  teriakAmba: "console.log",
  salamkenal: "console.log",
  kuchiMite: "console.log",
  km: "console.log",
  bacotAmba: "console.log",
  cawapresin: "console.log",

  // Waktu
  imaJikan: "(() => new Date().toISOString())",
  ima: "(() => new Date().toISOString())",
  jamBerapaBanh: "(() => new Date().toISOString())",
  cekJamLur: "(() => new Date().toISOString())",

  // Konversi Angka
  suji: "Number",
  suj: "Number",
  jadiAngkaBanh: "Number",
  ubahJadiDuit: "Number",
  bikinJadiSuji: "Number",
  sujiNi: "Number",

  // Matematika
  ruuto: "Math.sqrt",
  ru: "Math.sqrt",
  akarPangkat: "Math.sqrt",
  akarLur: "Math.sqrt",
  zettaichi: "Math.abs",
  zet: "Math.abs",
  mutlakBanh: "Math.abs",
  mutlakLur: "Math.abs",
  kiriSute: "Math.floor",
  ks: "Math.floor",
  bawahinBanh: "Math.floor",
  bawahLur: "Math.floor",
  kiriAge: "Math.ceil",
  kia: "Math.ceil",
  atasinBanh: "Math.ceil",
  atasLur: "Math.ceil",
  marume: "Math.round",
  beki: "Math.pow",

  // JSON
  kanjiNi: "JSON.parse",
  kn: "JSON.parse",
  jadiObjekBanh: "JSON.parse",
  uraiJsonLur: "JSON.parse",
  kanjiMojiretsu: "JSON.stringify",
  kmj: "JSON.stringify",
  jadiTeksBanh: "JSON.stringify",
  bungkusJsonLur: "JSON.stringify",

  // Inisialisasi Barisan
  retsu: "((...args) => args)",
  ret: "((...args) => args)",
  bikinBarisan: "((...args) => args)",
  kumpulinJawa: "((...args) => args)",
};

export class Transpiler {
  private indentLevel = 0;

  private indent(): string {
    return "  ".repeat(this.indentLevel);
  }

  public transpile(program: Program): string {
    const lines: string[] = [
      "// Hasil Transpilasi WibuScript ke JavaScript (ES2022+)",
      '"use strict";',
      "",
    ];

    // Helper functions
    lines.push(
      "const __nagasa = (v) => (v ? (v.length ?? 0) : 0);",
      "const __utsusu = (arr, fn) => arr.map(fn);",
      "const __erabu = (arr, fn) => arr.filter(fn);",
      "const __mitsukeru = (arr, fn) => arr.find(fn) ?? null;",
      ""
    );

    for (const stmt of program.body) {
      lines.push(this.transpileStatement(stmt));
    }

    return lines.join("\n");
  }

  private transpileStatement(stmt: Statement): string {
    switch (stmt.kind) {
      case "VariableDeclaration":
        return this.transpileVariableDeclaration(stmt as VariableDeclaration);

      case "IfStatement":
        return this.transpileIfStatement(stmt as IfStatement);

      case "LoopStatement":
        return this.transpileLoopStatement(stmt as LoopStatement);

      case "FunctionDeclaration":
        return this.transpileFunctionDeclaration(stmt as FunctionDeclaration);

      case "ReturnStatement":
        return this.transpileReturnStatement(stmt as ReturnStatement);

      case "BreakStatement":
        return `${this.indent()}break;`;

      case "ContinueStatement":
        return `${this.indent()}continue;`;

      case "TryCatchStatement":
        return this.transpileTryCatchStatement(stmt as TryCatchStatement);

      case "BlockStatement":
        return this.transpileBlockStatement(stmt as BlockStatement);

      case "ExpressionStatement":
        return `${this.indent()}${this.transpileExpression((stmt as ExpressionStatement).expression)};`;

      default:
        return `${this.indent()}/* Simpul AST tidak dikenal: ${stmt.kind} */`;
    }
  }

  private transpileVariableDeclaration(node: VariableDeclaration): string {
    const value = this.transpileExpression(node.value);
    return `${this.indent()}let ${node.identifier} = ${value};`;
  }

  private transpileIfStatement(node: IfStatement): string {
    const cond = this.transpileExpression(node.condition);
    let out = `${this.indent()}if (${cond}) {\n`;

    this.indentLevel++;
    for (const s of node.thenBranch) {
      out += this.transpileStatement(s) + "\n";
    }
    this.indentLevel--;

    if (node.elseBranch && node.elseBranch.length > 0) {
      out += `${this.indent()}} else {\n`;
      this.indentLevel++;
      for (const s of node.elseBranch) {
        out += this.transpileStatement(s) + "\n";
      }
      this.indentLevel--;
    }

    out += `${this.indent()}}`;
    return out;
  }

  private transpileLoopStatement(node: LoopStatement): string {
    const cond = this.transpileExpression(node.condition);
    let out = `${this.indent()}while (${cond}) {\n`;

    this.indentLevel++;
    for (const s of node.body) {
      out += this.transpileStatement(s) + "\n";
    }
    this.indentLevel--;

    out += `${this.indent()}}`;
    return out;
  }

  private transpileFunctionDeclaration(node: FunctionDeclaration): string {
    const params = node.parameters.join(", ");
    let out = `${this.indent()}function ${node.name}(${params}) {\n`;

    this.indentLevel++;
    for (const s of node.body) {
      out += this.transpileStatement(s) + "\n";
    }
    this.indentLevel--;

    out += `${this.indent()}}`;
    return out;
  }

  private transpileReturnStatement(node: ReturnStatement): string {
    if (node.value) {
      return `${this.indent()}return ${this.transpileExpression(node.value)};`;
    }
    return `${this.indent()}return;`;
  }

  private transpileTryCatchStatement(node: TryCatchStatement): string {
    let out = `${this.indent()}try {\n`;

    this.indentLevel++;
    for (const s of node.tryBranch) {
      out += this.transpileStatement(s) + "\n";
    }
    this.indentLevel--;

    const errVar = node.catchVariable || "err";
    out += `${this.indent()}} catch (${errVar}) {\n`;

    this.indentLevel++;
    for (const s of node.catchBranch) {
      out += this.transpileStatement(s) + "\n";
    }
    this.indentLevel--;

    out += `${this.indent()}}`;
    return out;
  }

  private transpileBlockStatement(node: BlockStatement): string {
    let out = `${this.indent()}{\n`;
    this.indentLevel++;
    for (const s of node.body) {
      out += this.transpileStatement(s) + "\n";
    }
    this.indentLevel--;
    out += `${this.indent()}}`;
    return out;
  }

  private transpileExpression(expr: Expression): string {
    switch (expr.kind) {
      case "NumericLiteral":
        return String((expr as NumericLiteral).value);

      case "StringLiteral":
        return JSON.stringify((expr as StringLiteral).value);

      case "BooleanLiteral":
        return (expr as BooleanLiteral).value ? "true" : "false";

      case "NullLiteral":
        return "null";

      case "Identifier": {
        const symbol = (expr as Identifier).symbol;
        // Literal khusus 4 dialek
        if (["hontou", "hon", "menyalaAbkuh", "unjukkebolehan", "maji", "majiBener"].includes(symbol)) return "true";
        if (["uso", "ladehBanh", "keracunanmbg", "usoBanget"].includes(symbol)) return "false";
        if (["munashi", "mu", "maafLancang", "blukutuk", "kara", "kosongZannen"].includes(symbol)) return "null";

        const stdMapped = STDLIB_MAP[symbol];
        if (stdMapped) return stdMapped;

        return symbol;
      }

      case "ArrayLiteral": {
        const elements = (expr as ArrayLiteral).elements.map((e) =>
          this.transpileExpression(e)
        );
        return `[${elements.join(", ")}]`;
      }

      case "ObjectLiteral": {
        const props = (expr as ObjectLiteral).properties.map((p) => {
          const val = p.value ? this.transpileExpression(p.value) : p.key;
          return `${p.key}: ${val}`;
        });
        return `{ ${props.join(", ")} }`;
      }

      case "MemberExpr": {
        const member = expr as MemberExpr;
        const obj = this.transpileExpression(member.object);
        if (member.computed) {
          const prop = this.transpileExpression(member.property);
          return `${obj}[${prop}]`;
        }
        const propName = (member.property as Identifier).symbol;
        return `${obj}.${propName}`;
      }

      case "AssignmentExpression": {
        const assign = expr as AssignmentExpression;
        const assignee =
          assign.assignee.kind === "Identifier"
            ? (assign.assignee as Identifier).symbol
            : this.transpileExpression(assign.assignee);
        const val = this.transpileExpression(assign.value);
        return `${assignee} = ${val}`;
      }

      case "BinaryExpression": {
        const bin = expr as BinaryExpression;
        const left = this.transpileExpression(bin.left);
        const right = this.transpileExpression(bin.right);
        return `(${left} ${bin.operator} ${right})`;
      }

      case "UnaryExpression": {
        const un = expr as UnaryExpression;
        const operand = this.transpileExpression(un.operand);
        return `(${un.operator}${operand})`;
      }

      case "CallExpression": {
        const call = expr as CallExpression;
        const callee = call.callee;

        // Penanganan metode barisan khusus
        if (["utsusu", "utu", "petainBanh", "petainLur"].includes(callee)) {
          const arr = this.transpileExpression(call.args[0]!);
          const fn = this.transpileExpression(call.args[1]!);
          return `__utsusu(${arr}, ${fn})`;
        }

        if (["erabu", "era", "saringBanh", "saringLur"].includes(callee)) {
          const arr = this.transpileExpression(call.args[0]!);
          const fn = this.transpileExpression(call.args[1]!);
          return `__erabu(${arr}, ${fn})`;
        }

        if (["mitsukeru", "mitu", "cariinBanh", "golekLur"].includes(callee)) {
          const arr = this.transpileExpression(call.args[0]!);
          const fn = this.transpileExpression(call.args[1]!);
          return `__mitsukeru(${arr}, ${fn})`;
        }

        if (["nagasa", "naga", "seginiDoang", "itungPanjangLur", "tolongCekNagasa"].includes(callee)) {
          const arg = this.transpileExpression(call.args[0]!);
          return `__nagasa(${arg})`;
        }

        const mappedCallee = STDLIB_MAP[callee] ?? callee;
        const args = call.args.map((a) => this.transpileExpression(a)).join(", ");
        return `${mappedCallee}(${args})`;
      }

      default:
        return "/* ekspresi tidak dikenal */";
    }
  }
}

/**
 * Mengonversi kode sumber WibuScript langsung menjadi kode JavaScript murni.
 */
export function transpileToJS(sourceCode: string): string {
  const tokens = tokenize(sourceCode);
  const parser = new Parser();
  const program = parser.produceAST(tokens);
  const transpiler = new Transpiler();
  return transpiler.transpile(program);
}
