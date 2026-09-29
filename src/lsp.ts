// File: src/lsp.ts
// ============================================================================
// WIBUSCRIPT LANGUAGE SERVER PROTOCOL (Wibu LSP)
// Server mandiri berbasis standar JSON-RPC melalui standard I/O (stdin/stdout).
// Menyediakan diagnostik galat real-time, penyelesaian otomatis (autocomplete)
// seluruh 4 Dialek Mutlak, hover documentation, dan outline document symbols.
// Sesuai Dokumen Resmi ROADMAP-wibuscript.pdf & Arsitektur Compiler v2.0+.
// ============================================================================

import { tokenize } from "./lexer";
import { Parser } from "./parser";
import {
  DIALECTS,
  CANONICAL_KEYWORDS_CONTROL,
  CANONICAL_KEYWORDS_DECLARATION,
  CANONICAL_CONSTANTS,
  CANONICAL_SUPPORT_FUNCTIONS,
  HISTORICAL_ALIASES,
  type DialectId
} from "./dialect-definitions";

export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4
}

export interface Diagnostic {
  range: Range;
  severity: DiagnosticSeverity;
  source: string;
  message: string;
}

export enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10,
  Unit = 11,
  Value = 12,
  Enum = 13,
  Keyword = 14,
  Snippet = 15,
  Color = 16,
  File = 17,
  Reference = 18,
  Folder = 19,
  EnumMember = 20,
  Constant = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25
}

export enum InsertTextFormat {
  PlainText = 1,
  Snippet = 2
}

export interface CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
  insertTextFormat?: InsertTextFormat;
}

export enum SymbolKind {
  File = 1,
  Module = 2,
  Namespace = 3,
  Package = 4,
  Class = 5,
  Method = 6,
  Property = 7,
  Field = 8,
  Constructor = 9,
  Enum = 10,
  Interface = 11,
  Function = 12,
  Variable = 13,
  Constant = 14,
  String = 15,
  Number = 16,
  Boolean = 17,
  Array = 18,
  Object = 19,
  Key = 20,
  Null = 21,
  EnumMember = 22,
  Struct = 23,
  Event = 24,
  Operator = 25,
  TypeParameter = 26
}

export interface DocumentSymbol {
  name: string;
  detail?: string;
  kind: SymbolKind;
  range: Range;
  selectionRange: Range;
  children?: DocumentSymbol[];
}

export interface TextDocumentItem {
  uri: string;
  version: number;
  text: string;
}

export interface JsonRpcMessage {
  jsonrpc: string;
  id?: number | string | null;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

/**
 * Menyusun daftar CompletionItem lengkap dari 4 Dialek Mutlak WibuScript
 * yang diambil langsung dari Single Source of Truth dialect-definitions.ts.
 */
export function buildDialectCompletionItems(): CompletionItem[] {
  const items: CompletionItem[] = [];
  const seenLabels = new Set<string>();

  const dialectNames: Record<DialectId, string> = {
    murni: "Jepang Murni",
    singkat: "Jepang Singkat",
    wibu: "Wibu Absurd",
    rongawi: "Meme Rongawi"
  };

  const dialectKeys: DialectId[] = ["murni", "singkat", "wibu", "rongawi"];

  // 1. Kata Kunci Kontrol Alur (Control Flow Keywords)
  for (const [canonical, variants] of Object.entries(CANONICAL_KEYWORDS_CONTROL)) {
    variants.forEach((kw, idx) => {
      if (kw && !seenLabels.has(kw)) {
        seenLabels.add(kw);
        const dKey = dialectKeys[idx] ?? "murni";
        const dName = dialectNames[dKey];
        items.push({
          label: kw,
          kind: CompletionItemKind.Keyword,
          detail: `[${dName}] Kontrol Alur: ${canonical}`,
          documentation: `Struktur kontrol alur WibuScript (${canonical}) pada dialek ${dName}.`
        });
      }
    });
  }

  // 2. Kata Kunci Deklarasi (Variabel, Fungsi, Kelas, dsb)
  for (const [canonical, variants] of Object.entries(CANONICAL_KEYWORDS_DECLARATION)) {
    variants.forEach((kw, idx) => {
      if (kw && !seenLabels.has(kw)) {
        seenLabels.add(kw);
        const dKey = dialectKeys[idx] ?? "murni";
        const dName = dialectNames[dKey];
        items.push({
          label: kw,
          kind: CompletionItemKind.Keyword,
          detail: `[${dName}] Deklarasi: ${canonical}`,
          documentation: `Sintaks deklarasi WibuScript (${canonical}) pada dialek ${dName}.`
        });
      }
    });
  }

  // 3. Konstanta Literal (Constants & Literals)
  for (const [canonical, variants] of Object.entries(CANONICAL_CONSTANTS)) {
    variants.forEach((kw, idx) => {
      if (kw && !seenLabels.has(kw)) {
        seenLabels.add(kw);
        const dKey = dialectKeys[idx] ?? "murni";
        const dName = dialectNames[dKey];
        items.push({
          label: kw,
          kind: CompletionItemKind.Constant,
          detail: `[${dName}] Nilai Konstan: ${canonical}`,
          documentation: `Nilai literal bawaan WibuScript (${canonical}) pada dialek ${dName}.`
        });
      }
    });
  }

  // 4. Pustaka Standar Bawaan (Standard Functions)
  for (const [canonical, variants] of Object.entries(CANONICAL_SUPPORT_FUNCTIONS)) {
    variants.forEach((kw, idx) => {
      if (kw && !seenLabels.has(kw)) {
        seenLabels.add(kw);
        const dKey = dialectKeys[idx] ?? "murni";
        const dName = dialectNames[dKey];
        items.push({
          label: kw,
          kind: CompletionItemKind.Function,
          detail: `[${dName}] Pustaka Standar: ${canonical}()`,
          documentation: `Panggilan fungsi runtime bawaan WibuScript (${canonical}) pada dialek ${dName}.`,
          insertText: `${kw}($1)`,
          insertTextFormat: InsertTextFormat.Snippet
        });
      }
    });
  }

  // 5. Alias Historis & Kompatibilitas
  for (const [category, aliases] of Object.entries(HISTORICAL_ALIASES)) {
    for (const alias of aliases) {
      if (!seenLabels.has(alias)) {
        seenLabels.add(alias);
        const isFunc = category === "supportFunctions";
        const isConst = category === "constantLanguage";

        items.push({
          label: alias,
          kind: isFunc
            ? CompletionItemKind.Function
            : isConst
            ? CompletionItemKind.Constant
            : CompletionItemKind.Keyword,
          detail: isFunc
            ? `[Kompatibilitas] Fungsi Standar: ${alias}()`
            : isConst
            ? `[Kompatibilitas] Nilai Konstan: ${alias}`
            : `[Kompatibilitas] Kata Kunci: ${alias}`,
          documentation: `Kata kunci alternatif WibuScript untuk kategori ${category}.`,
          insertText: isFunc ? `${alias}($1)` : alias,
          insertTextFormat: isFunc ? InsertTextFormat.Snippet : InsertTextFormat.PlainText
        });
      }
    }
  }

  // 6. Metode Bantuan Tipe Modern (Hasil<T,E> dan Opsional<T>)
  const modernMethods: {
    canonical: string;
    variants: [string, string, string, string];
    detail: string;
    doc: string;
    snippet: string;
  }[] = [
    {
      canonical: "unwrap",
      variants: ["hiraku", "hira", "bukaBanh", "jebolmas"],
      detail: "Membuka nilai Hasil/Opsional atau melempar galat jika gagal/kosong.",
      doc: "Mengambil nilai di dalam seikou/aru. Jika shippai/nai, melempar galat.",
      snippet: "unwrap()"
    },
    {
      canonical: "unwrapOr",
      variants: ["unwrapOr", "unwrapOr", "unwrapOr", "unwrapOr"],
      detail: "Membuka nilai Hasil/Opsional dengan nilai default fallback.",
      doc: "Mengambil nilai di dalam seikou/aru, atau nilai fallback jika shippai/nai.",
      snippet: "unwrapOr(${1:defaultValue})"
    },
    {
      canonical: "map",
      variants: ["utsusu", "utu", "henshinSuru", "predikbola"],
      detail: "Mentransformasikan nilai Hasil/Opsional dengan fungsi pemetaan.",
      doc: "Jika bernilai seikou/aru, menjalankan fungsi mapping terhadap nilainya.",
      snippet: "map(${1:x} => ${2:x})"
    },
    {
      canonical: "andThen",
      variants: ["tsugiSuru", "tsuSuru", "lanjutBanh", "gaspolmas"],
      detail: "Menghubungkan operasi berantai monadic yang mengembalikan Hasil/Opsional baru.",
      doc: "Menjalankan fungsi rantai jika nilai awal adalah seikou/aru.",
      snippet: "andThen(${1:x} => ${2:seikou(x)})"
    }
  ];

  for (const m of modernMethods) {
    if (!seenLabels.has(m.canonical)) {
      seenLabels.add(m.canonical);
      items.push({
        label: m.canonical,
        kind: CompletionItemKind.Method,
        detail: `[Metode Modern] .${m.canonical}()`,
        documentation: `${m.detail}\n\n${m.doc}`,
        insertText: m.snippet,
        insertTextFormat: InsertTextFormat.Snippet
      });
    }

    m.variants.forEach((kw, idx) => {
      if (kw && !seenLabels.has(kw)) {
        seenLabels.add(kw);
        const dKey = dialectKeys[idx] ?? "murni";
        const dName = dialectNames[dKey];
        items.push({
          label: kw,
          kind: CompletionItemKind.Method,
          detail: `[${dName}] Metode: .${kw}() (${m.canonical})`,
          documentation: `${m.detail}\n\n${m.doc}`,
          insertText: `${kw}($1)`,
          insertTextFormat: InsertTextFormat.Snippet
        });
      }
    });
  }

  // 7. Properti Tipe Modern
  const modernProperties = [
    { name: "isOk", doc: "Bernilai true jika instance adalah Hasil sukses (seikou)." },
    { name: "isError", doc: "Bernilai true jika instance adalah Hasil galat (shippai)." },
    { name: "isSome", doc: "Bernilai true jika instance adalah Opsional berisi (aru)." },
    { name: "isNone", doc: "Bernilai true jika instance adalah Opsional kosong (nai)." },
    { name: "value", doc: "Mengambil nilai langsung dari Hasil atau Opsional." },
    { name: "error", doc: "Mengambil pesan galat dari Hasil (shippai)." }
  ];

  for (const p of modernProperties) {
    if (!seenLabels.has(p.name)) {
      seenLabels.add(p.name);
      items.push({
        label: p.name,
        kind: CompletionItemKind.Property,
        detail: `[Properti Modern] .${p.name}`,
        documentation: p.doc
      });
    }
  }

  // 8. Snippet Pola Blok Kontrol Alur 4 Dialek
  const blockSnippets: {
    label: string;
    dKey: DialectId;
    body: string;
    description: string;
  }[] = [
    // Jepang Murni
    { label: "moshi-snippet", dKey: "murni", body: "moshi (${1:kondisi}) {\n\t$0\n}", description: "Blok percabangan kondisi (moshi)" },
    { label: "zutto-snippet", dKey: "murni", body: "zutto (${1:kondisi}) {\n\t$0\n}", description: "Blok perulangan (zutto)" },
    { label: "shougo-snippet", dKey: "murni", body: "shougo (${1:ekspresi}) {\n\tbaai ${2:kasus}: {\n\t\t$0\n\t}\n\thyoujun: {\n\t\t\n\t}\n}", description: "Blok pattern matching (shougo)" },
    { label: "jutsu-snippet", dKey: "murni", body: "jutsu ${1:namaFungsi}(${2:parameter}) {\n\t$0\n}", description: "Deklarasi fungsi (jutsu)" },
    { label: "sekte-snippet", dKey: "murni", body: "sekte ${1:NamaKelas} {\n\ttanjou(${2:parameter}) {\n\t\t$0\n\t}\n}", description: "Deklarasi kelas (sekte)" },

    // Jepang Singkat
    { label: "mo-snippet", dKey: "singkat", body: "mo (${1:kondisi}) {\n\t$0\n}", description: "Blok percabangan singkat (mo)" },
    { label: "zu-snippet", dKey: "singkat", body: "zu (${1:kondisi}) {\n\t$0\n}", description: "Blok perulangan singkat (zu)" },
    { label: "sho-snippet", dKey: "singkat", body: "sho (${1:ekspresi}) {\n\tbaa ${2:kasus}: {\n\t\t$0\n\t}\n\thyo: {\n\t\t\n\t}\n}", description: "Blok pattern matching singkat (sho)" },
    { label: "ju-snippet", dKey: "singkat", body: "ju ${1:namaFungsi}(${2:parameter}) {\n\t$0\n}", description: "Deklarasi fungsi singkat (ju)" },
    { label: "sek-snippet", dKey: "singkat", body: "sek ${1:NamaKelas} {\n\ttan(${2:parameter}) {\n\t\t$0\n\t}\n}", description: "Deklarasi kelas singkat (sek)" },

    // Wibu Absurd
    { label: "moShiKalo-snippet", dKey: "wibu", body: "moShiKalo (${1:kondisi}) {\n\t$0\n}", description: "Blok percabangan wibu (moShiKalo)" },
    { label: "zuttoLoop-snippet", dKey: "wibu", body: "zuttoLoop (${1:kondisi}) {\n\t$0\n}", description: "Blok perulangan wibu (zuttoLoop)" },
    { label: "cocokkan-snippet", dKey: "wibu", body: "cocokkan (${1:ekspresi}) {\n\tkaloPas ${2:kasus}: {\n\t\t$0\n\t}\n\tsisaan: {\n\t\t\n\t}\n}", description: "Blok pattern matching wibu (cocokkan)" },
    { label: "mybini-snippet", dKey: "wibu", body: "mybini ${1:namaFungsi}(${2:parameter}) {\n\t$0\n}", description: "Deklarasi fungsi wibu (mybini)" },
    { label: "nakama-snippet", dKey: "wibu", body: "nakama ${1:NamaKelas} {\n\tumareta(${2:parameter}) {\n\t\t$0\n\t}\n}", description: "Deklarasi kelas wibu (nakama)" },

    // Meme Rongawi
    { label: "izintampil-snippet", dKey: "rongawi", body: "izintampil (${1:kondisi}) {\n\t$0\n}", description: "Blok percabangan rongawi (izintampil)" },
    { label: "nyawit-snippet", dKey: "rongawi", body: "nyawit (${1:kondisi}) {\n\t$0\n}", description: "Blok perulangan rongawi (nyawit)" },
    { label: "persimpangan-snippet", dKey: "rongawi", body: "persimpangan (${1:ekspresi}) {\n\tkenaben ${2:kasus}: {\n\t\t$0\n\t}\n\tyappingtolol: {\n\t\t\n\t}\n}", description: "Blok pattern matching rongawi (persimpangan)" },
    { label: "fufufafa-snippet", dKey: "rongawi", body: "fufufafa ${1:namaFungsi}(${2:parameter}) {\n\t$0\n}", description: "Deklarasi fungsi rongawi (fufufafa)" },
    { label: "sektejomok-snippet", dKey: "rongawi", body: "sektejomok ${1:NamaKelas} {\n\tambatunat(${2:parameter}) {\n\t\t$0\n\t}\n}", description: "Deklarasi kelas rongawi (sektejomok)" }
  ];

  for (const s of blockSnippets) {
    items.push({
      label: s.label,
      kind: CompletionItemKind.Snippet,
      detail: `[Snippet ${dialectNames[s.dKey]}] ${s.description}`,
      documentation: `Snippet kode terstruktur untuk dialek ${dialectNames[s.dKey]}.\n\nTemplate:\n\`\`\`wibu\n${s.body}\n\`\`\``,
      insertText: s.body,
      insertTextFormat: InsertTextFormat.Snippet
    });
  }

  return items;
}

/**
 * Melakukan validasi kode WibuScript dan mengembalikan array Diagnostic jika ditemukan galat.
 * Mendeteksi galat Lexer (karakter tak dikenal, string belum ditutup, dsb)
 * dan galat Parser (sintaks tak valid, kurung belum ditutup, token tak diharapkan).
 */
export function validateWibuScript(sourceText: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (!sourceText.trim()) {
    return diagnostics;
  }

  try {
    const tokens = tokenize(sourceText);
    const parser = new Parser();
    parser.produceAST(tokens);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Parsing lokasi baris dan kolom dari format pesan standar Lexer/Parser:
    // Format: "... pada baris 5, kolom 12."
    const locationRegex = /baris\s+(\d+),\s*kolom\s+(\d+)/i;
    const match = errorMessage.match(locationRegex);

    let line = 0;
    let character = 0;

    if (match && match[1] && match[2]) {
      // Protokol LSP menggunakan indeks baris dan kolom berbasis 0 (0-indexed)
      line = Math.max(0, parseInt(match[1], 10) - 1);
      character = Math.max(0, parseInt(match[2], 10) - 1);
    }

    const lines = sourceText.split(/\r?\n/);
    const safeLine = Math.min(line, Math.max(0, lines.length - 1));
    const lineContent = lines[safeLine] || "";
    let endCharacter = character + 1;

    if (character < lineContent.length) {
      const remaining = lineContent.slice(character);
      const matchWord = remaining.match(/^[a-zA-Z0-9_]+/);
      if (matchWord && matchWord[0].length > 0) {
        endCharacter = character + matchWord[0].length;
      }
    }

    diagnostics.push({
      range: {
        start: { line: safeLine, character },
        end: { line: safeLine, character: Math.max(character + 1, endCharacter) }
      },
      severity: DiagnosticSeverity.Error,
      source: "wibuscript",
      message: errorMessage
    });
  }

  return diagnostics;
}

/**
 * Mengambil daftar simbol dokumen (DocumentSymbol) untuk panel outline dan navigasi editor.
 */
export function getDocumentSymbols(sourceText: string): DocumentSymbol[] {
  const symbols: DocumentSymbol[] = [];

  try {
    const tokens = tokenize(sourceText);
    const parser = new Parser();
    const program = parser.produceAST(tokens);
    const lines = sourceText.split(/\r?\n/);

    const findSymbolPosition = (name: string): { line: number; character: number } => {
      for (let l = 0; l < lines.length; l++) {
        const lineStr = lines[l];
        if (lineStr !== undefined) {
          const col = lineStr.indexOf(name);
          if (col !== -1) {
            return { line: l, character: col };
          }
        }
      }
      return { line: 0, character: 0 };
    };

    for (const stmt of program.body) {
      if (stmt.kind === "FunctionDeclaration") {
        const fn = stmt as any;
        const pos = findSymbolPosition(fn.name);
        symbols.push({
          name: fn.name,
          detail: `jutsu ${fn.name}(${fn.parameters ? fn.parameters.join(", ") : ""})`,
          kind: SymbolKind.Function,
          range: {
            start: pos,
            end: { line: pos.line, character: pos.character + fn.name.length }
          },
          selectionRange: {
            start: pos,
            end: { line: pos.line, character: pos.character + fn.name.length }
          }
        });
      } else if (stmt.kind === "ClassDeclaration") {
        const cls = stmt as any;
        const pos = findSymbolPosition(cls.name);
        const children: DocumentSymbol[] = [];

        if (cls.constructorMethod) {
          const cName = cls.constructorMethod.name || "tanjou";
          const cPos = findSymbolPosition(cName);
          children.push({
            name: cName,
            detail: "konstruktor",
            kind: SymbolKind.Constructor,
            range: {
              start: cPos,
              end: { line: cPos.line, character: cPos.character + cName.length }
            },
            selectionRange: {
              start: cPos,
              end: { line: cPos.line, character: cPos.character + cName.length }
            }
          });
        }

        if (Array.isArray(cls.methods)) {
          for (const m of cls.methods) {
            const mPos = findSymbolPosition(m.name);
            children.push({
              name: m.name,
              detail: `metode ${m.name}`,
              kind: SymbolKind.Method,
              range: {
                start: mPos,
                end: { line: mPos.line, character: mPos.character + m.name.length }
              },
              selectionRange: {
                start: mPos,
                end: { line: mPos.line, character: mPos.character + m.name.length }
              }
            });
          }
        }

        symbols.push({
          name: cls.name,
          detail: `sekte ${cls.name}`,
          kind: SymbolKind.Class,
          range: {
            start: pos,
            end: { line: pos.line, character: pos.character + cls.name.length }
          },
          selectionRange: {
            start: pos,
            end: { line: pos.line, character: pos.character + cls.name.length }
          },
          children
        });
      } else if (stmt.kind === "VariableDeclaration") {
        const v = stmt as any;
        if (typeof v.identifier === "string") {
          const pos = findSymbolPosition(v.identifier);
          const isConst = Boolean(
            lines[pos.line]?.slice(0, pos.character).match(/\b(zettai|ze|zettaiDa|bundarahma|hargaMati|const)\b/)
          );
          symbols.push({
            name: v.identifier,
            detail: isConst ? "zettai" : "kore",
            kind: isConst ? SymbolKind.Constant : SymbolKind.Variable,
            range: {
              start: pos,
              end: { line: pos.line, character: pos.character + v.identifier.length }
            },
            selectionRange: {
              start: pos,
              end: { line: pos.line, character: pos.character + v.identifier.length }
            }
          });
        }
      }
    }
  } catch {
    // Jika berkas sedang dalam status galat sintaks parsial saat diketik, lewati
  }

  return symbols;
}

/**
 * Kelas WibuLanguageServer yang mengelola siklus hidup pesan LSP
 * secara independen dan mendukung pengujian unit tanpa proses child_process.
 */
export class WibuLanguageServer {
  private documents = new Map<string, TextDocumentItem>();
  private completionItems: CompletionItem[] = [];
  private onSendRpc: ((msg: JsonRpcMessage) => void) | null = null;

  constructor(onSendRpc?: (msg: JsonRpcMessage) => void) {
    this.completionItems = buildDialectCompletionItems();
    this.onSendRpc = onSendRpc ?? null;
  }

  public setSendHandler(handler: (msg: JsonRpcMessage) => void): void {
    this.onSendRpc = handler;
  }

  public getDocument(uri: string): TextDocumentItem | undefined {
    return this.documents.get(uri);
  }

  public getCompletionItems(): CompletionItem[] {
    return this.completionItems;
  }

  public validateDocument(uri: string, text: string): Diagnostic[] {
    const diagnostics = validateWibuScript(text);
    if (this.onSendRpc) {
      this.onSendRpc({
        jsonrpc: "2.0",
        method: "textDocument/publishDiagnostics",
        params: {
          uri,
          diagnostics
        }
      });
    }
    return diagnostics;
  }

  public handleMessage(msg: JsonRpcMessage): JsonRpcMessage | null {
    const { id, method, params } = msg;

    if (!method) {
      return null;
    }

    switch (method) {
      case "initialize": {
        return {
          jsonrpc: "2.0",
          id: id ?? 1,
          result: {
            capabilities: {
              textDocumentSync: 1, // Full document synchronization
              completionProvider: {
                resolveProvider: false,
                triggerCharacters: [".", " ", "(", ":"]
              },
              hoverProvider: true,
              documentSymbolProvider: true
            },
            serverInfo: {
              name: "wibuscript-language-server",
              version: "2.4.0"
            }
          }
        };
      }

      case "initialized": {
        // Klien telah terhubung dan mengonfirmasi inisialisasi
        return null;
      }

      case "textDocument/didOpen": {
        const item = params?.textDocument;
        if (item && item.uri) {
          this.documents.set(item.uri, {
            uri: item.uri,
            version: item.version || 1,
            text: item.text || ""
          });
          this.validateDocument(item.uri, item.text || "");
        }
        return null;
      }

      case "textDocument/didChange": {
        const item = params?.textDocument;
        const changes = params?.contentChanges;
        if (item && item.uri && Array.isArray(changes) && changes.length > 0) {
          const newText = changes[changes.length - 1].text || "";
          this.documents.set(item.uri, {
            uri: item.uri,
            version: item.version || 1,
            text: newText
          });
          this.validateDocument(item.uri, newText);
        }
        return null;
      }

      case "textDocument/didClose": {
        const item = params?.textDocument;
        if (item && item.uri) {
          this.documents.delete(item.uri);
          if (this.onSendRpc) {
            this.onSendRpc({
              jsonrpc: "2.0",
              method: "textDocument/publishDiagnostics",
              params: {
                uri: item.uri,
                diagnostics: []
              }
            });
          }
        }
        return null;
      }

      case "textDocument/completion": {
        return {
          jsonrpc: "2.0",
          id: id ?? 1,
          result: this.completionItems
        };
      }

      case "textDocument/hover": {
        const item = params?.textDocument;
        const pos: Position | undefined = params?.position;
        let hoverContent: string | null = null;

        if (item && pos && this.documents.has(item.uri)) {
          const doc = this.documents.get(item.uri)!;
          const lines = doc.text.split(/\r?\n/);
          const targetLine = lines[pos.line] || "";

          // Ekstraksi kata/simbol di sekitar posisi kursor
          const left = targetLine.slice(0, pos.character).match(/[a-zA-Z0-9_]+$/);
          const right = targetLine.slice(pos.character).match(/^[a-zA-Z0-9_]+/);
          const word = `${left ? left[0] : ""}${right ? right[0] : ""}`;

          if (word) {
            const found = this.completionItems.find((c) => c.label === word);
            if (found) {
              hoverContent = `**WibuScript (${found.detail || "Kata Kunci"})**\n\n${found.documentation || ""}`;
            }
          }
        }

        return {
          jsonrpc: "2.0",
          id: id ?? 1,
          result: hoverContent
            ? {
                contents: {
                  kind: "markdown",
                  value: hoverContent
                }
              }
            : null
        };
      }

      case "textDocument/documentSymbol": {
        const item = params?.textDocument;
        let symbols: DocumentSymbol[] = [];

        if (item && this.documents.has(item.uri)) {
          const doc = this.documents.get(item.uri)!;
          symbols = getDocumentSymbols(doc.text);
        }

        return {
          jsonrpc: "2.0",
          id: id ?? 1,
          result: symbols
        };
      }

      case "shutdown": {
        return {
          jsonrpc: "2.0",
          id: id ?? 1,
          result: null
        };
      }

      case "exit": {
        if (typeof process !== "undefined" && process.exit) {
          process.exit(0);
        }
        return null;
      }

      default: {
        if (id !== undefined && id !== null) {
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Metode '${method}' tidak ditemukan.`
            }
          };
        }
        return null;
      }
    }
  }
}

/**
 * Mengirimkan pesan JSON-RPC terformat dengan Content-Length header ke process.stdout.
 */
function sendJsonRpc(message: JsonRpcMessage): void {
  const jsonPayload = JSON.stringify(message);
  const buffer = Buffer.from(jsonPayload, "utf-8");
  const headers = `Content-Length: ${buffer.length}\r\n\r\n`;
  process.stdout.write(headers);
  process.stdout.write(buffer);
}

/**
 * Memulai Wibu Language Server Protocol (LSP) pada antarmuka Standard I/O.
 */
export function startLanguageServer(): void {
  const server = new WibuLanguageServer((msg) => sendJsonRpc(msg));
  let messageBuffer = Buffer.alloc(0);

  process.stdin.on("data", (chunk: Buffer) => {
    messageBuffer = Buffer.concat([messageBuffer, chunk]);

    while (true) {
      const headerSeparator = messageBuffer.indexOf("\r\n\r\n");
      if (headerSeparator === -1) {
        break;
      }

      const headerText = messageBuffer.slice(0, headerSeparator).toString("utf-8");
      const match = headerText.match(/Content-Length:\s*(\d+)/i);
      if (!match || !match[1]) {
        // Header tidak valid, buang hingga pemisah
        messageBuffer = messageBuffer.slice(headerSeparator + 4);
        continue;
      }

      const contentLength = parseInt(match[1], 10);
      const bodyStartIndex = headerSeparator + 4;
      const totalMessageLength = bodyStartIndex + contentLength;

      if (messageBuffer.length < totalMessageLength) {
        // Tunggu hingga seluruh paket payload tiba
        break;
      }

      const bodyBuffer = messageBuffer.slice(bodyStartIndex, totalMessageLength);
      messageBuffer = messageBuffer.slice(totalMessageLength);

      try {
        const parsedJson = JSON.parse(bodyBuffer.toString("utf-8"));
        const response = server.handleMessage(parsedJson);
        if (response) {
          sendJsonRpc(response);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        process.stderr.write(`[Wibu LSP JSON Parse Error] ${errorMsg}\n`);
      }
    }
  });

  process.stdin.on("end", () => {
    process.exit(0);
  });
}
