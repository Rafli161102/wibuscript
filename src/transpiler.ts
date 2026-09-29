// File: src/transpiler.ts
// ============================================================================
// WIBUSCRIPT JAVASCRIPT TRANSPILER (COMPILER PIPELINE v2.0)
// Mengompilasi AST WibuScript menjadi kode JavaScript modern (ES2022+ / Node.js / Browser)
// Mendukung Deklarasi let/const, Blok Kendali (If-ElseIf-Else, While, Break/Continue),
// Pattern Matching (shougo), Destructuring (Array & Object), Spread Operator (...),
// Pemetaan Pustaka Standar 4 Dialek, dan Penghasil Source Map v3 Resmi.
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
  ArrayPattern,
  ObjectPattern,
  SpreadElement,
} from "./ast";
import { tokenize } from "./lexer";
import { Parser } from "./parser";

/**
 * Format Standar Spesifikasi Source Map Versi 3
 */
export interface SourceMapV3 {
  version: 3;
  file: string;
  sourceRoot?: string;
  sources: string[];
  sourcesContent?: (string | null)[];
  names: string[];
  mappings: string;
}

export interface TranspileOptions {
  sourceMap?: boolean;
  filename?: string;
  sourceContent?: string;
  target?: "es2022" | "commonjs";
}

export interface TranspileResult {
  code: string;
  map?: SourceMapV3;
  mapString?: string;
  inlineSourceMap?: string;
}

// Karakter encoding Base64 VLQ untuk Source Map v3
const VLQ_BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function encodeVLQ(num: number): string {
  let vlq = num < 0 ? (-num << 1) | 1 : num << 1;
  let encoded = "";
  do {
    let digit = vlq & 31;
    vlq >>>= 5;
    if (vlq > 0) {
      digit |= 32;
    }
    encoded += VLQ_BASE64_CHARS[digit];
  } while (vlq > 0);
  return encoded;
}

// Pemetaan fungsi bawaan WibuScript (4 Dialek Mutlak) ke implementasi JavaScript
const STDLIB_MAP: Record<string, string> = {
  // Tampilkan (Print)
  mite: "console.log",
  mi: "console.log",
  iuYo: "console.log",
  salamkenal: "console.log",
  teriakAmba: "console.log",
  kuchiMite: "console.log",
  km: "console.log",
  omaeWaIu: "console.log",
  cawapresin: "console.log",
  bacotAmba: "console.log",

  // Waktu & Timestamp
  imaJikan: "(() => new Date().toISOString())",
  ima: "(() => new Date().toISOString())",
  nanjiDesu: "(() => new Date().toISOString())",
  kopihitam: "(() => new Date().toISOString())",
  jamBerapaBanh: "(() => new Date().toISOString())",
  cekJamLur: "(() => new Date().toISOString())",

  // Konversi Angka
  suji: "Number",
  suj: "Number",
  suujiNi: "Number",
  ubahJadiDuit: "Number",
  jadiAngkaBanh: "Number",
  bikinJadiSuji: "Number",

  // Matematika
  ruuto: "Math.sqrt",
  ru: "Math.sqrt",
  heihoukon: "Math.sqrt",
  robogor: "Math.sqrt",
  akarPangkat: "Math.sqrt",
  akarLur: "Math.sqrt",

  zettaichi: "Math.abs",
  zet: "Math.abs",
  zettaiChi: "Math.abs",
  ironiman: "Math.abs",
  mutlakBanh: "Math.abs",
  mutlakLur: "Math.abs",

  kiriSute: "Math.floor",
  ks: "Math.floor",
  shitaKiri: "Math.floor",
  hutanselatan: "Math.floor",
  bawahinBanh: "Math.floor",
  bawahLur: "Math.floor",

  kiriAge: "Math.ceil",
  kia: "Math.ceil",
  ueKiri: "Math.ceil",
  menaracukur: "Math.ceil",
  atasinBanh: "Math.ceil",
  atasLur: "Math.ceil",

  marume: "Math.round",
  maru: "Math.round",
  maneNi: "Math.round",
  shakerbot: "Math.round",

  beki: "Math.pow",
  bek: "Math.pow",
  tsuyokuNare: "Math.pow",
  naikinPangkat: "Math.pow",

  randamu: "Math.random",
  ran: "Math.random",
  unmeiGacha: "Math.random",
  rudalmentah: "Math.random",

  // Penanganan Format JSON
  kanjiNi: "JSON.parse",
  kn: "JSON.parse",
  wakattaYo: "JSON.parse",
  salintempel: "JSON.parse",
  jadiObjekBanh: "JSON.parse",
  uraiJsonLur: "JSON.parse",

  kanjiMojiretsu: "JSON.stringify",
  kmj: "JSON.stringify",
  oshieteNe: "JSON.stringify",
  copascaption: "JSON.stringify",
  jadiTeksBanh: "JSON.stringify",
  bungkusJsonLur: "JSON.stringify",

  // Inisialisasi Barisan (Array Constructor)
  retsu: "((...args) => args)",
  ret: "((...args) => args)",
  nakamaTachi: "((...args) => args)",
  budakhitam: "((...args) => args)",
  bikinBarisan: "((...args) => args)",
  kumpulinBocah: "((...args) => args)",
  kumpulinJawa: "((...args) => args)",

  // Terminasi Program
  shikei: "((code = 0) => { if (typeof process !== 'undefined' && process.exit) { process.exit(code); } else { throw new Error('Program selesai dengan kode ' + code); } })",
  shi: "((code = 0) => { if (typeof process !== 'undefined' && process.exit) { process.exit(code); } else { throw new Error('Program selesai dengan kode ' + code); } })",
  shineeeYo: "((code = 0) => { if (typeof process !== 'undefined' && process.exit) { process.exit(code); } else { throw new Error('Program selesai dengan kode ' + code); } })",
  udahKelarinAja: "((code = 0) => { if (typeof process !== 'undefined' && process.exit) { process.exit(code); } else { throw new Error('Program selesai dengan kode ' + code); } })",

  // Penundaan Eksekusi (Sleep)
  shibaraku: "((ms) => new Promise((resolve) => setTimeout(resolve, ms)))",
  siba: "((ms) => new Promise((resolve) => setTimeout(resolve, ms)))",
  matteNeSikit: "((ms) => new Promise((resolve) => setTimeout(resolve, ms)))",
  nungguinLu: "((ms) => new Promise((resolve) => setTimeout(resolve, ms)))",

  // Jaringan & HTTP
  ukeru: "fetch",
  uke: "fetch",
  tottekiteNe: "fetch",
  SepongMas: "fetch",

  // Tipe Data Modern: Hasil<T,E> (Result)
  seikou: "__ok",
  sei: "__ok",
  hokiBanh: "__ok",
  berhasilBanh: "__ok",
  menyalaAbangku: "__ok",
  untungmas: "__ok",
  ok: "__ok",

  shippai: "__err",
  sip: "__err",
  zonkBanh: "__err",
  gagalBanh: "__err",
  rugidong: "__err",
  hancurmas: "__err",
  error: "__err",

  // Tipe Data Modern: Opsional<T> (Option)
  aru: "__some",
  ar: "__some",
  adaBanh: "__some",
  adamas: "__some",
  some: "__some",

  nai: "__none",
  na: "__none",
  gaadaBanh: "__none",
  kosongBanh: "__none",
  habismas: "__none",
  zonktolol: "__none",
  none: "__none",
};

export class Transpiler {
  private indentLevel = 0;
  private lineMap: Array<{ generatedLine: number; originalLine: number }> = [];
  private currentGeneratedLine = 1;

  private indent(): string {
    return "  ".repeat(this.indentLevel);
  }

  /**
   * Menghasilkan representasi string JavaScript ES2022+ lengkap dari simpul Program AST.
   */
  public transpile(program: Program, options: TranspileOptions = {}): string {
    this.indentLevel = 0;
    this.lineMap = [];
    this.currentGeneratedLine = 1;

    const runtimeHelpers: string[] = [
      "// Hasil Transpilasi WibuScript ke JavaScript (ES2022+)",
      '"use strict";',
      "",
      "// --- Pustaka Runtime WibuScript Teroptimasi (4 Dialek) ---",
      "const __nagasa = (v) => (v != null ? (v.length ?? 0) : 0);",
      "const __utsusu = (arr, fn) => (Array.isArray(arr) ? arr.map(fn) : []);",
      "const __erabu = (arr, fn) => (Array.isArray(arr) ? arr.filter(fn) : []);",
      "const __mitsukeru = (arr, fn) => (Array.isArray(arr) ? (arr.find(fn) ?? null) : null);",
      "const __bunri = (str, sep) => String(str ?? '').split(sep ?? '');",
      "const __tsunagu = (arr, sep) => (Array.isArray(arr) ? arr.join(sep ?? '') : '');",
      "const __okikae = (str, from, to) => String(str ?? '').split(from).join(to);",
      "const __kiri = (str) => String(str ?? '').trim();",
      "const __fukumu = (t, item) => (Array.isArray(t) ? t.includes(item) : String(t ?? '').includes(item));",
      "const __narabikae = (arr, fn) => (Array.isArray(arr) ? (fn ? [...arr].sort(fn) : [...arr].sort()) : []);",
      "const __kirinuki = (t, s, e) => (t != null ? t.slice(s, e) : null);",
      "const __shurui = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);",
      "const __ireta = (arr, item) => (Array.isArray(arr) ? (arr.push(item), arr) : [item]);",
      "const __toru = (arr) => (Array.isArray(arr) ? arr.pop() : null);",
      "const __kiru = (arr) => (Array.isArray(arr) ? arr.shift() : null);",
      "const __ookiku = (str) => String(str ?? '').toUpperCase();",
      "const __chiisaku = (str) => String(str ?? '').toLowerCase();",
      "const __gacha = (items, weights) => {",
      "  if (!Array.isArray(items) || items.length === 0) return null;",
      "  if (!weights) return items[Math.floor(Math.random() * items.length)];",
      "  const total = weights.reduce((a, b) => a + b, 0);",
      "  let r = Math.random() * total;",
      "  for (let i = 0; i < items.length; i++) {",
      "    if (r < weights[i]) return items[i];",
      "    r -= weights[i];",
      "  }",
      "  return items[items.length - 1];",
      "};",
      "const __ok = (val) => ({ tag: 'ok', isOk: true, isError: false, value: val, error: null, unwrap: () => val, hiraku: () => val, hira: () => val, bukaBanh: () => val, jebolmas: () => val, unwrapOr: () => val, hirakuKa: () => val, hiraKa: () => val, bukaKaloGak: () => val, cadanganmas: () => val, map: (fn) => __ok(fn(val)), utsusu: (fn) => __ok(fn(val)), utu: (fn) => __ok(fn(val)), henshinSuru: (fn) => __ok(fn(val)), predikbola: (fn) => __ok(fn(val)), andThen: (fn) => fn(val), tsugiSuru: (fn) => fn(val), tsuSuru: (fn) => fn(val), lanjutBanh: (fn) => fn(val), gaspolmas: (fn) => fn(val) });",
      "const __err = (err) => { const self = { tag: 'error', isOk: false, isError: true, value: null, error: err, unwrap: () => { throw new Error(`[Runtime Error] Result is Error: ${err}`); }, hiraku: () => { throw new Error(`[Runtime Error] Result is Error: ${err}`); }, hira: () => { throw new Error(`[Runtime Error] Result is Error: ${err}`); }, bukaBanh: () => { throw new Error(`[Runtime Error] Result is Error: ${err}`); }, jebolmas: () => { throw new Error(`[Runtime Error] Result is Error: ${err}`); }, unwrapOr: (def) => def, hirakuKa: (def) => def, hiraKa: (def) => def, bukaKaloGak: (def) => def, cadanganmas: (def) => def, map: () => self, utsusu: () => self, utu: () => self, henshinSuru: () => self, predikbola: () => self, andThen: () => self, tsugiSuru: () => self, tsuSuru: () => self, lanjutBanh: () => self, gaspolmas: () => self }; return self; };",
      "const __some = (val) => ({ tag: 'some', isSome: true, isNone: false, value: val, unwrap: () => val, hiraku: () => val, hira: () => val, bukaBanh: () => val, jebolmas: () => val, unwrapOr: () => val, hirakuKa: () => val, hiraKa: () => val, bukaKaloGak: () => val, cadanganmas: () => val, map: (fn) => __some(fn(val)), utsusu: (fn) => __some(fn(val)), utu: (fn) => __some(fn(val)), henshinSuru: (fn) => __some(fn(val)), predikbola: (fn) => __some(fn(val)), andThen: (fn) => fn(val), tsugiSuru: (fn) => fn(val), tsuSuru: (fn) => fn(val), lanjutBanh: (fn) => fn(val), gaspolmas: (fn) => fn(val) });",
      "const __none = () => { const self = { tag: 'none', isSome: false, isNone: true, value: null, unwrap: () => { throw new Error('[Runtime Error] Option is None'); }, hiraku: () => { throw new Error('[Runtime Error] Option is None'); }, hira: () => { throw new Error('[Runtime Error] Option is None'); }, bukaBanh: () => { throw new Error('[Runtime Error] Option is None'); }, jebolmas: () => { throw new Error('[Runtime Error] Option is None'); }, unwrapOr: (def) => def, hirakuKa: (def) => def, hiraKa: (def) => def, bukaKaloGak: (def) => def, cadanganmas: (def) => def, map: () => self, utsusu: () => self, utu: () => self, henshinSuru: () => self, predikbola: () => self, andThen: () => self, tsugiSuru: () => self, tsuSuru: () => self, lanjutBanh: () => self, gaspolmas: () => self }; return self; };",
      "const __matchVal = (v) => { if (v != null && typeof v === 'object' && typeof v.tag === 'string') return v.tag; if (typeof v === 'function' && typeof v.tag === 'string') return v.tag; return v; };",
      "__ok.tag = 'ok'; __err.tag = 'error'; __some.tag = 'some'; __none.tag = 'none';",
      "const seikou = __ok, sei = __ok, hokiBanh = __ok, menyalaAbangku = __ok, ok = __ok;",
      "const shippai = __err, sip = __err, zonkBanh = __err, rugidong = __err, error = __err;",
      "const aru = __some, ar = __some, adaBanh = __some, adamas = __some, some = __some;",
      "const nai = __none, na = __none, gaadaBanh = __none, habismas = __none, none = __none;",
      "",
    ];

    const bodyLines: string[] = [];
    let approximateSourceLine = 1;

    for (const stmt of program.body) {
      const transpiled = this.transpileStatement(stmt);
      bodyLines.push(transpiled);

      // Catat pemetaan baris untuk Source Map
      const startLine = runtimeHelpers.length + bodyLines.length;
      this.lineMap.push({
        generatedLine: startLine,
        originalLine: approximateSourceLine++,
      });
    }

    const fullCode = [...runtimeHelpers, ...bodyLines].join("\n");

    if (options.sourceMap) {
      const map = this.generateSourceMap(
        options.filename || "source.wibu",
        options.sourceContent || ""
      );
      const mapBase64 = Buffer.from(JSON.stringify(map)).toString("base64");
      return `${fullCode}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${mapBase64}\n`;
    }

    return fullCode;
  }

  /**
   * Menghasilkan struktur data Source Map v3 berdasarkan translasi baris kode.
   */
  public generateSourceMap(filename: string, sourceContent: string): SourceMapV3 {
    let mappings = "";
    let prevOriginalLine = 0;
    let prevOriginalCol = 0;

    // Setiap baris hasil transpilasi dipisahkan oleh tanda titik koma (;)
    for (let i = 0; i < this.lineMap.length; i++) {
      const item = this.lineMap[i];
      if (!item) continue;

      const lineDelta = item.originalLine - 1 - prevOriginalLine;
      const colDelta = 0 - prevOriginalCol;

      // Segmen: generatedCol (0), sourceFileIndex (0), originalLineDelta, originalColDelta
      const segment = `${encodeVLQ(0)}${encodeVLQ(0)}${encodeVLQ(lineDelta)}${encodeVLQ(colDelta)}`;
      mappings += (i === 0 ? "" : ";") + segment;

      prevOriginalLine = item.originalLine - 1;
      prevOriginalCol = 0;
    }

    return {
      version: 3,
      file: filename.replace(/\.wibu$/, ".js"),
      sources: [filename],
      sourcesContent: [sourceContent],
      names: [],
      mappings,
    };
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
        return `${this.indent()}${this.transpileExpression(
          (stmt as ExpressionStatement).expression
        )};`;

      default:
        return `${this.indent()}/* Simpul AST tidak dikenal: ${stmt.kind} */`;
    }
  }

  private transpileVariableDeclaration(node: VariableDeclaration): string {
    const isConst = Boolean((node as unknown as { isConstant?: boolean }).isConstant);
    const keyword = isConst ? "const" : "let";
    const value = this.transpileExpression(node.value);

    // Destructuring Pola Barisan: kore [a, b, ...sisa] = nilai
    if (node.pattern) {
      if (node.pattern.kind === "ArrayPattern") {
        const elements = node.pattern.elements.map((el) => {
          if (el === null) return "";
          if (typeof el === "string") return el;
          return `...${el.argument}`;
        });
        return `${this.indent()}${keyword} [${elements.join(", ")}] = ${value};`;
      } else if (node.pattern.kind === "ObjectPattern") {
        // Destructuring Pola Kamus Objek: kore { nama, klan: marga } = nilai
        const props = node.pattern.properties.map((p) => {
          if (p.target) return `${p.key}: ${p.target}`;
          return p.key;
        });
        return `${this.indent()}${keyword} { ${props.join(", ")} } = ${value};`;
      }
    }

    return `${this.indent()}${keyword} ${node.identifier} = ${value};`;
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
      // Optimasi rantai Else-If menjadi struktur if-else bertingkat bersih
      if (node.elseBranch.length === 1 && node.elseBranch[0]?.kind === "IfStatement") {
        const nestedIf = this.transpileIfStatement(node.elseBranch[0] as IfStatement);
        out += `${this.indent()}} else ${nestedIf.trimStart()}`;
        return out;
      }

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
    const rawSource = node.source;

    if (rawSource === "web" || rawSource === "wibu:web") {
      if (node.importedNames.length === 1 && node.importedNames[0] === "*") {
        return `${this.indent()}import * as _mod_web from "wibuscript/web";\n${this.indent()}Object.assign(globalThis, _mod_web.default || _mod_web);`;
      }
      return `${this.indent()}import { ${node.importedNames.join(", ")} } from "wibuscript/web";`;
    }

    if (rawSource === "server" || rawSource === "wibu:server") {
      if (node.importedNames.length === 1 && node.importedNames[0] === "*") {
        return `${this.indent()}import * as _mod_server from "wibuscript/server";\n${this.indent()}Object.assign(globalThis, _mod_server.default || _mod_server);`;
      }
      return `${this.indent()}import { ${node.importedNames.join(", ")} } from "wibuscript/server";`;
    }

    const isNpm = rawSource.startsWith("npm:");
    const targetSource = isNpm ? rawSource.slice(4) : rawSource;

    if (node.importedNames.length === 1 && node.importedNames[0] === "*") {
      if (isNpm) {
        const alias = `_mod_${targetSource.replace(/[^a-zA-Z0-9_]/g, "_")}`;
        return `${this.indent()}import * as ${alias} from "${targetSource}";\n${this.indent()}Object.assign(globalThis, ${alias}.default && Object.keys(${alias}).length === 1 ? ${alias}.default : ${alias});`;
      }
      return `${this.indent()}import "${targetSource}";`;
    }
    return `${this.indent()}import { ${node.importedNames.join(", ")} } from "${targetSource}";`;
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

  private isModernTypeMatch(node: MatchStatement): boolean {
    const modernKeywords = new Set([
      "seikou", "shippai", "aru", "nai",
      "sei", "sip", "ar", "na",
      "hokiBanh", "zonkBanh", "adaBanh", "gaadaBanh",
      "menyalaAbangku", "rugidong", "adamas", "habismas",
      "ok", "error", "some", "none"
    ]);

    for (const c of node.cases) {
      if (!c.value) continue;
      if (c.value.kind === "Identifier" && modernKeywords.has((c.value as Identifier).symbol)) {
        return true;
      }
      if (c.value.kind === "StringLiteral" && modernKeywords.has((c.value as StringLiteral).value)) {
        return true;
      }
    }
    return false;
  }

  private transpileMatchStatement(node: MatchStatement): string {
    const disc = this.transpileExpression(node.discriminant);
    const isModern = this.isModernTypeMatch(node);
    let out = isModern
      ? `${this.indent()}switch (__matchVal(${disc})) {\n`
      : `${this.indent()}switch (${disc}) {\n`;
    this.indentLevel++;
    for (const c of node.cases) {
      if (c.value) {
        const val = this.transpileExpression(c.value);
        out += isModern
          ? `${this.indent()}case __matchVal(${val}): {\n`
          : `${this.indent()}case ${val}: {\n`;
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

        // Pemetaan literal boolean dan null khas 4 dialek
        if (
          ["hontou", "hon", "hontouNi", "unjukkebolehan", "menyalaAbkuh", "maji", "majiBener"].includes(
            symbol
          )
        )
          return "true";
        if (
          ["uso", "chigauYo", "keracunanmbg", "ladehBanh", "usoBanget"].includes(
            symbol
          )
        )
          return "false";
        if (
          ["munashi", "mu", "naniKore", "blukutuk", "maafLancang", "kara", "kosongZannen"].includes(
            symbol
          )
        )
          return "null";

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
        // Ekspresi Pattern Matching (shougo) di dalam ekspresi dieksekusi via IIFE aman
        const matchStmt = expr as MatchStatement;
        const disc = this.transpileExpression(matchStmt.discriminant);
        const isModern = this.isModernTypeMatch(matchStmt);
        let out = `(() => {\n`;
        this.indentLevel++;
        out += isModern
          ? `${this.indent()}switch (__matchVal(${disc})) {\n`
          : `${this.indent()}switch (${disc}) {\n`;
        this.indentLevel++;

        for (const c of matchStmt.cases) {
          if (c.value) {
            out += isModern
              ? `${this.indent()}case __matchVal(${this.transpileExpression(c.value)}): {\n`
              : `${this.indent()}case ${this.transpileExpression(c.value)}: {\n`;
          } else {
            out += `${this.indent()}default: {\n`;
          }
          this.indentLevel++;
          for (let i = 0; i < c.body.length; i++) {
            const s = c.body[i]!;
            if (i === c.body.length - 1 && s.kind === "ExpressionStatement") {
              out += `${this.indent()}return ${this.transpileExpression(
                (s as ExpressionStatement).expression
              )};\n`;
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

        // Pemetaan Pustaka Standar Khusus Barisan & String
        if (
          ["utsusu", "utu", "henshinSuru", "predikbola", "petainBanh"].includes(
            calleeName
          )
        ) {
          const arr = this.transpileExpression(call.args[0]!);
          const fn = this.transpileExpression(call.args[1]!);
          return `__utsusu(${arr}, ${fn})`;
        }

        if (
          ["erabu", "era", "senbatsuNe", "morebullets", "saringBanh"].includes(
            calleeName
          )
        ) {
          const arr = this.transpileExpression(call.args[0]!);
          const fn = this.transpileExpression(call.args[1]!);
          return `__erabu(${arr}, ${fn})`;
        }

        if (
          ["mitsukeru", "mitu", "mitsuketaYo", "fesnuker", "cariinBanh"].includes(
            calleeName
          )
        ) {
          const arr = this.transpileExpression(call.args[0]!);
          const fn = this.transpileExpression(call.args[1]!);
          return `__mitsukeru(${arr}, ${fn})`;
        }

        if (
          ["bunri", "bu", "barabara", "pecahkepala", "pecahKata", "bedahno", "pecahin"].includes(
            calleeName
          )
        ) {
          const str = this.transpileExpression(call.args[0]!);
          const sep = call.args[1] ? this.transpileExpression(call.args[1]) : "''";
          return `__bunri(${str}, ${sep})`;
        }

        if (
          ["tsunagu", "tsuna", "isshoNi", "lendirmurni", "lemKata", "gandengen", "lemin"].includes(
            calleeName
          )
        ) {
          const arr = this.transpileExpression(call.args[0]!);
          const sep = call.args[1] ? this.transpileExpression(call.args[1]) : "''";
          return `__tsunagu(${arr}, ${sep})`;
        }

        if (
          ["okikae", "oki", "irekaeruNe", "akuntumbal", "sulapKata", "gantinen", "tumbalkan"].includes(
            calleeName
          )
        ) {
          const str = this.transpileExpression(call.args[0]!);
          const from = this.transpileExpression(call.args[1]!);
          const to = this.transpileExpression(call.args[2]!);
          return `__okikae(${str}, ${from}, ${to})`;
        }

        if (
          ["kiri", "kri", "kireeNi", "cukurfade", "pangkas", "potongen", "cukur"].includes(
            calleeName
          )
        ) {
          const str = this.transpileExpression(call.args[0]!);
          return `__kiri(${str})`;
        }

        if (
          ["fukumu", "fuku", "hairuKana", "monyetijo", "punyaGak", "onora", "adaGak"].includes(
            calleeName
          )
        ) {
          const target = this.transpileExpression(call.args[0]!);
          const item = this.transpileExpression(call.args[1]!);
          return `__fukumu(${target}, ${item})`;
        }

        if (
          ["narabikae", "nara", "narabeteNe", "goyangpantat", "rapihin", "urutno", "barisin"].includes(
            calleeName
          )
        ) {
          const arr = this.transpileExpression(call.args[0]!);
          const comp = call.args[1] ? this.transpileExpression(call.args[1]) : "null";
          return `__narabikae(${arr}, ${comp})`;
        }

        if (
          ["kirinuki", "kinu", "sukoshiDake", "pedangdaging", "potongSebagian", "cuplikno", "comot"].includes(
            calleeName
          )
        ) {
          const target = this.transpileExpression(call.args[0]!);
          const start = this.transpileExpression(call.args[1]!);
          const end = call.args[2] ? this.transpileExpression(call.args[2]) : "undefined";
          return `__kirinuki(${target}, ${start}, ${end})`;
        }

        if (
          ["gacha", "gac", "tarikGacha", "weeklypass", "mputerNasib", "spinZeus"].includes(
            calleeName
          )
        ) {
          const items = this.transpileExpression(call.args[0]!);
          const weights = call.args[1] ? this.transpileExpression(call.args[1]) : "undefined";
          return `__gacha(${items}, ${weights})`;
        }

        if (
          ["nagasa", "naga", "doreKurai", "panjangberurat", "seginiDoang", "tolongCekNagasa", "cekUkuran"].includes(
            calleeName
          )
        ) {
          const arg = this.transpileExpression(call.args[0]!);
          return `__nagasa(${arg})`;
        }

        if (["shurui", "shu", "naniTypeNe", "omagot"].includes(calleeName)) {
          const arg = this.transpileExpression(call.args[0]!);
          return `__shurui(${arg})`;
        }

        if (["ireta", "ire", "haireNe", "priaotot"].includes(calleeName)) {
          const arr = this.transpileExpression(call.args[0]!);
          const item = this.transpileExpression(call.args[1]!);
          return `__ireta(${arr}, ${item})`;
        }

        if (["toru", "to", "deteike", "danaterbakar"].includes(calleeName)) {
          const arr = this.transpileExpression(call.args[0]!);
          return `__toru(${arr})`;
        }

        if (["kiru", "ki", "kiriteNe", "kertaslecek"].includes(calleeName)) {
          const arr = this.transpileExpression(call.args[0]!);
          return `__kiru(${arr})`;
        }

        if (["ookiku", "ooki", "ookiVoice", "gakhabisgila"].includes(calleeName)) {
          const str = this.transpileExpression(call.args[0]!);
          return `__ookiku(${str})`;
        }

        if (["chiisaku", "chii", "chiisaiVoice", "monyetbanyumas"].includes(calleeName)) {
          const str = this.transpileExpression(call.args[0]!);
          return `__chiisaku(${str})`;
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
 * Mendukung opsi penyertaan Source Map v3 inline atau objek.
 */
export function transpileToJS(sourceCode: string, options: TranspileOptions = {}): string {
  const tokens = tokenize(sourceCode);
  const parser = new Parser();
  const program = parser.produceAST(tokens);
  const transpiler = new Transpiler();
  return transpiler.transpile(program, options);
}

/**
 * Mengompilasi kode sumber WibuScript dan mengembalikan kode JavaScript beserta objek Source Map v3.
 */
export function transpileWithSourceMap(
  sourceCode: string,
  filename = "source.wibu"
): TranspileResult {
  const tokens = tokenize(sourceCode);
  const parser = new Parser();
  const program = parser.produceAST(tokens);
  const transpiler = new Transpiler();

  const code = transpiler.transpile(program, {
    sourceMap: false,
    filename,
    sourceContent: sourceCode,
  });

  const map = transpiler.generateSourceMap(filename, sourceCode);
  const mapString = JSON.stringify(map);
  const mapBase64 = Buffer.from(mapString).toString("base64");
  const inlineSourceMap = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${mapBase64}`;

  return {
    code,
    map,
    mapString,
    inlineSourceMap,
  };
}
