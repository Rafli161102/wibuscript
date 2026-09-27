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
  kumpulinBocah: "((...args) => args)",
  budakhitam: "((...args) => args)",
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
      "const __bunri = (str, sep) => String(str).split(sep ?? '');",
      "const __tsunagu = (arr, sep) => (Array.isArray(arr) ? arr.join(sep ?? '') : '');",
      "const __okikae = (str, from, to) => String(str).split(from).join(to);",
      "const __kiri = (str) => String(str).trim();",
      "const __fukumu = (t, item) => (Array.isArray(t) ? t.includes(item) : String(t).includes(item));",
      "const __narabikae = (arr, fn) => (fn ? [...arr].sort(fn) : [...arr].sort());",
      "const __kirinuki = (t, s, e) => t.slice(s, e);",
      "const __gacha = (items, weights) => { if (!Array.isArray(items) || items.length === 0) return null; if (!weights) return items[Math.floor(Math.random() * items.length)]; const total = weights.reduce((a, b) => a + b, 0); let r = Math.random() * total; for (let i = 0; i < items.length; i++) { if (r < weights[i]) return items[i]; r -= weights[i]; } return items[items.length - 1]; };",
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

      case "ForEachStatement":
        return this.transpileForEachStatement(stmt as ForEachStatement);

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

      case "ClassDeclaration":
        return this.transpileClassDeclaration(stmt as ClassDeclaration);

      case "ExportStatement":
        return this.transpileExportStatement(stmt as ExportStatement);

      case "ImportStatement":
        return this.transpileImportStatement(stmt as ImportStatement);

      case "MatchStatement":
        return this.transpileMatchStatement(stmt as MatchStatement);

      case "ExpressionStatement":
        return `${this.indent()}${this.transpileExpression((stmt as ExpressionStatement).expression)};`;

      default:
        return `${this.indent()}/* Simpul AST tidak dikenal: ${stmt.kind} */`;
    }
  }

  private transpileVariableDeclaration(node: VariableDeclaration): string {
    const value = this.transpileExpression(node.value);
    if (node.pattern) {
      if (node.pattern.kind === "ArrayPattern") {
        const elements = node.pattern.elements.map((el) => {
          if (el === null) return "";
          if (typeof el === "string") return el;
          return `...${el.argument}`;
        });
        return `${this.indent()}let [${elements.join(", ")}] = ${value};`;
      } else if (node.pattern.kind === "ObjectPattern") {
        const props = node.pattern.properties.map((p) => {
          if (p.target) return `${p.key}: ${p.target}`;
          return p.key;
        });
        return `${this.indent()}let { ${props.join(", ")} } = ${value};`;
      }
    }
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

  private transpileForEachStatement(node: ForEachStatement): string {
    const collection = this.transpileExpression(node.collection);
    let out = `${this.indent()}for (const ${node.item} of ${collection}) {\n`;

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

  private transpileClassDeclaration(node: ClassDeclaration): string {
    const extendsClause = node.parentClass ? ` extends ${node.parentClass}` : "";
    let out = `${this.indent()}class ${node.name}${extendsClause} {\n`;
    this.indentLevel++;

    if (node.constructorMethod) {
      const params = node.constructorMethod.parameters.join(", ");
      out += `${this.indent()}constructor(${params}) {\n`;
      this.indentLevel++;
      for (const s of node.constructorMethod.body) {
        out += this.transpileStatement(s) + "\n";
      }
      this.indentLevel--;
      out += `${this.indent()}}\n`;
    }

    for (const m of node.methods) {
      const params = m.parameters.join(", ");
      out += `${this.indent()}${m.name}(${params}) {\n`;
      this.indentLevel++;
      for (const s of m.body) {
        out += this.transpileStatement(s) + "\n";
      }
      this.indentLevel--;
      out += `${this.indent()}}\n`;
    }

    this.indentLevel--;
    out += `${this.indent()}}`;
    return out;
  }

  private transpileExportStatement(node: ExportStatement): string {
    if (node.declaration) {
      const declStr = this.transpileStatement(node.declaration).trimStart();
      return `${this.indent()}export ${declStr}`;
    }
    return `${this.indent()}export { ${node.exportedNames.join(", ")} };`;
  }

  private transpileImportStatement(node: ImportStatement): string {
    if (node.importedNames.length === 1 && node.importedNames[0] === "*") {
      return `${this.indent()}import "${node.source}";`;
    }
    return `${this.indent()}import { ${node.importedNames.join(", ")} } from "${node.source}";`;
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

  private transpileMatchStatement(node: MatchStatement): string {
    const disc = this.transpileExpression(node.discriminant);
    let out = `${this.indent()}switch (${disc}) {\n`;
    this.indentLevel++;
    for (const c of node.cases) {
      if (c.value) {
        const val = this.transpileExpression(c.value);
        out += `${this.indent()}case ${val}: {\n`;
      } else {
        out += `${this.indent()}default: {\n`;
      }
      this.indentLevel++;
      for (const s of c.body) {
        out += this.transpileStatement(s) + "\n";
      }
      out += `${this.indent()}break;\n`;
      this.indentLevel--;
      out += `${this.indent()}}\n`;
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
        const elements = (expr as ArrayLiteral).elements.map((e) => {
          if (e.kind === "SpreadElement") {
            return `...${this.transpileExpression((e as SpreadElement).argument)}`;
          }
          return this.transpileExpression(e as Expression);
        });
        return `[${elements.join(", ")}]`;
      }

      case "ObjectLiteral": {
        const props = (expr as ObjectLiteral).properties.map((p) => {
          const val = p.value ? this.transpileExpression(p.value) : p.key;
          return `${p.key}: ${val}`;
        });
        return `{ ${props.join(", ")} }`;
      }

      case "NewExpression": {
        const newExpr = expr as NewExpression;
        const args = newExpr.args.map((a) => this.transpileExpression(a)).join(", ");
        return `new ${newExpr.className}(${args})`;
      }

      case "ThisExpression":
        return "this";

      case "MemberExpr": {
        const member = expr as MemberExpr;
        let obj = this.transpileExpression(member.object);
        if (member.object.kind === "NewExpression") {
          obj = `(${obj})`;
        }
        if (member.computed) {
          const prop = this.transpileExpression(member.property);
          return `${obj}[${prop}]`;
        }
        const propName = (member.property as Identifier).symbol;
        return `${obj}.${propName}`;
      }

      case "AssignmentExpression": {
        const assign = expr as AssignmentExpression;
        if (assign.assignee.kind === "Identifier") {
          const assignee = (assign.assignee as Identifier).symbol;
          const val = this.transpileExpression(assign.value);
          return `${assignee} = ${val}`;
        }
        if (assign.assignee.kind === "ArrayPattern") {
          const pat = assign.assignee as ArrayPattern;
          const elements = pat.elements.map((el) => {
            if (el === null) return "";
            if (typeof el === "string") return el;
            return `...${el.argument}`;
          });
          const val = this.transpileExpression(assign.value);
          return `[${elements.join(", ")}] = ${val}`;
        }
        if (assign.assignee.kind === "ObjectPattern") {
          const pat = assign.assignee as ObjectPattern;
          const props = pat.properties.map((p) => {
            if (p.target) return `${p.key}: ${p.target}`;
            return p.key;
          });
          const val = this.transpileExpression(assign.value);
          return `({ ${props.join(", ")} } = ${val})`;
        }
        const assignee = this.transpileExpression(assign.assignee as Expression);
        const val = this.transpileExpression(assign.value);
        return `${assignee} = ${val}`;
      }

      case "MatchStatement": {
        const matchStmt = expr as MatchStatement;
        const disc = this.transpileExpression(matchStmt.discriminant);
        let out = `(() => {\n`;
        this.indentLevel++;
        out += `${this.indent()}switch (${disc}) {\n`;
        this.indentLevel++;
        for (const c of matchStmt.cases) {
          if (c.value) {
            out += `${this.indent()}case ${this.transpileExpression(c.value)}: {\n`;
          } else {
            out += `${this.indent()}default: {\n`;
          }
          this.indentLevel++;
          for (let i = 0; i < c.body.length; i++) {
            const s = c.body[i]!;
            if (i === c.body.length - 1 && s.kind === "ExpressionStatement") {
              out += `${this.indent()}return ${this.transpileExpression((s as ExpressionStatement).expression)};\n`;
            } else {
              out += this.transpileStatement(s) + "\n";
            }
          }
          this.indentLevel--;
          out += `${this.indent()}}\n`;
        }
        this.indentLevel--;
        out += `${this.indent()}}\n`;
        this.indentLevel--;
        out += `${this.indent()}})()`;
        return out;
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

      case "ArrowFunctionExpression": {
        const arrow = expr as ArrowFunctionExpression;
        const params = arrow.parameters.join(", ");
        if (
          arrow.isExpressionBody &&
          arrow.body.length === 1 &&
          arrow.body[0]?.kind === "ReturnStatement"
        ) {
          const ret = arrow.body[0] as ReturnStatement;
          const retVal = ret.value ? this.transpileExpression(ret.value) : "undefined";
          return `((${params}) => ${retVal})`;
        }
        let out = `((${params}) => {\n`;
        this.indentLevel++;
        for (const s of arrow.body) {
          out += this.transpileStatement(s) + "\n";
        }
        this.indentLevel--;
        out += `${this.indent()}})`;
        return out;
      }

      case "CallExpression": {
        const call = expr as CallExpression;
        const callee = call.callee;
        const calleeName = typeof callee === "string" ? callee : "";

        // Penanganan metode barisan & pustaka khusus
        if (["utsusu", "utu", "petainBanh", "petainLur"].includes(calleeName)) {
          const arr = this.transpileExpression(call.args[0]!);
          const fn = this.transpileExpression(call.args[1]!);
          return `__utsusu(${arr}, ${fn})`;
        }

        if (["erabu", "era", "saringBanh", "saringLur"].includes(calleeName)) {
          const arr = this.transpileExpression(call.args[0]!);
          const fn = this.transpileExpression(call.args[1]!);
          return `__erabu(${arr}, ${fn})`;
        }

        if (["mitsukeru", "mitu", "cariinBanh", "golekLur", "ciduk", "fesnuker"].includes(calleeName)) {
          const arr = this.transpileExpression(call.args[0]!);
          const fn = this.transpileExpression(call.args[1]!);
          return `__mitsukeru(${arr}, ${fn})`;
        }

        if (["bunri", "bu", "pecahKata", "bedahno", "pecahin", "pecahkepala"].includes(calleeName)) {
          const str = this.transpileExpression(call.args[0]!);
          const sep = call.args[1] ? this.transpileExpression(call.args[1]) : "''";
          return `__bunri(${str}, ${sep})`;
        }

        if (["tsunagu", "tsuna", "lemKata", "gandengen", "lemin", "lendirmurni"].includes(calleeName)) {
          const arr = this.transpileExpression(call.args[0]!);
          const sep = call.args[1] ? this.transpileExpression(call.args[1]) : "''";
          return `__tsunagu(${arr}, ${sep})`;
        }

        if (["okikae", "oki", "sulapKata", "gantinen", "tumbalkan", "akuntumbal"].includes(calleeName)) {
          const str = this.transpileExpression(call.args[0]!);
          const from = this.transpileExpression(call.args[1]!);
          const to = this.transpileExpression(call.args[2]!);
          return `__okikae(${str}, ${from}, ${to})`;
        }

        if (["kiri", "kri", "pangkas", "potongen", "cukur", "cukurfade"].includes(calleeName)) {
          const str = this.transpileExpression(call.args[0]!);
          return `__kiri(${str})`;
        }

        if (["fukumu", "fuku", "punyaGak", "onora", "adaGak", "monyetijo"].includes(calleeName)) {
          const target = this.transpileExpression(call.args[0]!);
          const item = this.transpileExpression(call.args[1]!);
          return `__fukumu(${target}, ${item})`;
        }

        if (["narabikae", "nara", "rapihin", "urutno", "barisin", "goyangpantat"].includes(calleeName)) {
          const arr = this.transpileExpression(call.args[0]!);
          const comp = call.args[1] ? this.transpileExpression(call.args[1]) : "null";
          return `__narabikae(${arr}, ${comp})`;
        }

        if (["kirinuki", "kinu", "potongSebagian", "cuplikno", "comot", "pedangdaging"].includes(calleeName)) {
          const target = this.transpileExpression(call.args[0]!);
          const start = this.transpileExpression(call.args[1]!);
          const end = call.args[2] ? this.transpileExpression(call.args[2]) : "undefined";
          return `__kirinuki(${target}, ${start}, ${end})`;
        }

        if (["gacha", "gac", "tarikGacha", "mputerNasib", "spinZeus", "weeklypass"].includes(calleeName)) {
          const items = this.transpileExpression(call.args[0]!);
          const weights = call.args[1] ? this.transpileExpression(call.args[1]) : "undefined";
          return `__gacha(${items}, ${weights})`;
        }

        if (["nagasa", "naga", "seginiDoang", "itungPanjangLur", "tolongCekNagasa", "cekUkuran", "panjangberurat"].includes(calleeName)) {
          const arg = this.transpileExpression(call.args[0]!);
          return `__nagasa(${arg})`;
        }

        let mappedCallee: string;
        if (typeof callee === "string") {
          mappedCallee = STDLIB_MAP[callee] ?? callee;
        } else if (callee.kind === "MemberExpr") {
          mappedCallee = this.transpileExpression(callee);
        } else {
          mappedCallee = `(${this.transpileExpression(callee)})`;
        }
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
