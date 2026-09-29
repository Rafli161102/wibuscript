// File: src/lsp.ts
// ============================================================================
// WIBUSCRIPT LANGUAGE SERVER PROTOCOL (Wibu LSP)
// Server mandiri berbasis standar JSON-RPC melalui standard I/O (stdin/stdout).
// Menyediakan diagnostik galat real-time dan penyelesaian otomatis 4 Dialek Mutlak.
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

export interface CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
}

interface TextDocumentItem {
  uri: string;
  version: number;
  text: string;
}

interface JsonRpcMessage {
  jsonrpc: string;
  id?: number | string | null;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

/**
 * Menyusun daftar CompletionItem lengkap dari 4 Dialek Mutlak WibuScript.
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

  // 1. Kata Kunci Kontrol Alur
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

  // 3. Konstanta Literal
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
          insertText: `${kw}($1)`
        });
      }
    });
  }

  // 5. Alias Historis & Kompatibilitas
  for (const [category, aliases] of Object.entries(HISTORICAL_ALIASES)) {
    for (const alias of aliases) {
      if (!seenLabels.has(alias)) {
        seenLabels.add(alias);
        items.push({
          label: alias,
          kind: CompletionItemKind.Keyword,
          detail: `[Kompatibilitas] Alias: ${category}`,
          documentation: `Kata kunci alternatif WibuScript untuk kategori ${category}.`
        });
      }
    }
  }

  return items;
}

/**
 * Melakukan validasi kode WibuScript dan mengembalikan array Diagnostic jika ditemukan galat.
 */
export function validateWibuScript(sourceText: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  try {
    const tokens = tokenize(sourceText);
    const parser = new Parser();
    parser.produceAST(tokens);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Parsing lokasi baris dan kolom dari format pesan standar Lexer/Parser:
    // Contoh: "... pada baris 5, kolom 12."
    const locationRegex = /baris\s+(\d+),\s*kolom\s+(\d+)/i;
    const match = errorMessage.match(locationRegex);

    let line = 0;
    let character = 0;

    if (match && match[1] && match[2]) {
      // Protokol LSP menggunakan indeks baris dan kolom berbasis 0 (0-indexed)
      line = Math.max(0, parseInt(match[1], 10) - 1);
      character = Math.max(0, parseInt(match[2], 10) - 1);
    }

    diagnostics.push({
      range: {
        start: { line, character },
        end: { line, character: character + 1 }
      },
      severity: DiagnosticSeverity.Error,
      source: "wibuscript",
      message: errorMessage
    });
  }

  return diagnostics;
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
  const documents = new Map<string, TextDocumentItem>();
  const completionItems = buildDialectCompletionItems();

  let messageBuffer = Buffer.alloc(0);

  function processDocumentValidation(uri: string, text: string): void {
    const diagnostics = validateWibuScript(text);
    sendJsonRpc({
      jsonrpc: "2.0",
      method: "textDocument/publishDiagnostics",
      params: {
        uri,
        diagnostics
      }
    });
  }

  function handleMessage(msg: JsonRpcMessage): void {
    const { id, method, params } = msg;

    if (!method) {
      return;
    }

    switch (method) {
      case "initialize": {
        sendJsonRpc({
          jsonrpc: "2.0",
          id: id ?? 1,
          result: {
            capabilities: {
              textDocumentSync: 1, // Full document synchronization
              completionProvider: {
                resolveProvider: false,
                triggerCharacters: [".", " ", "(", ":"]
              },
              hoverProvider: true
            },
            serverInfo: {
              name: "wibuscript-language-server",
              version: "2.0.1"
            }
          }
        });
        break;
      }

      case "initialized": {
        // Klien telah terhubung dan mengonfirmasi inisialisasi
        break;
      }

      case "textDocument/didOpen": {
        const item = params?.textDocument;
        if (item && item.uri) {
          documents.set(item.uri, {
            uri: item.uri,
            version: item.version || 1,
            text: item.text || ""
          });
          processDocumentValidation(item.uri, item.text || "");
        }
        break;
      }

      case "textDocument/didChange": {
        const item = params?.textDocument;
        const changes = params?.contentChanges;
        if (item && item.uri && Array.isArray(changes) && changes.length > 0) {
          const newText = changes[changes.length - 1].text || "";
          documents.set(item.uri, {
            uri: item.uri,
            version: item.version || 1,
            text: newText
          });
          processDocumentValidation(item.uri, newText);
        }
        break;
      }

      case "textDocument/didClose": {
        const item = params?.textDocument;
        if (item && item.uri) {
          documents.delete(item.uri);
          // Bersihkan seluruh diagnostik galat pada berkas yang ditutup
          sendJsonRpc({
            jsonrpc: "2.0",
            method: "textDocument/publishDiagnostics",
            params: {
              uri: item.uri,
              diagnostics: []
            }
          });
        }
        break;
      }

      case "textDocument/completion": {
        sendJsonRpc({
          jsonrpc: "2.0",
          id: id ?? 1,
          result: completionItems
        });
        break;
      }

      case "textDocument/hover": {
        const item = params?.textDocument;
        const pos: Position | undefined = params?.position;
        let hoverContent: string | null = null;

        if (item && pos && documents.has(item.uri)) {
          const doc = documents.get(item.uri)!;
          const lines = doc.text.split("\n");
          const targetLine = lines[pos.line] || "";

          // Cari kata di sekitar posisi kursor
          const left = targetLine.slice(0, pos.character).match(/[a-zA-Z0-9_]+$/);
          const right = targetLine.slice(pos.character).match(/^[a-zA-Z0-9_]+/);
          const word = `${left ? left[0] : ""}${right ? right[0] : ""}`;

          if (word) {
            const found = completionItems.find((c) => c.label === word);
            if (found) {
              hoverContent = `**WibuScript (${found.detail || "Kata Kunci"})**\n\n${found.documentation || ""}`;
            }
          }
        }

        sendJsonRpc({
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
        });
        break;
      }

      case "shutdown": {
        sendJsonRpc({
          jsonrpc: "2.0",
          id: id ?? 1,
          result: null
        });
        break;
      }

      case "exit": {
        process.exit(0);
        break;
      }

      default: {
        if (id !== undefined && id !== null) {
          sendJsonRpc({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Metode '${method}' tidak ditemukan.`
            }
          });
        }
        break;
      }
    }
  }

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
        handleMessage(parsedJson);
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
