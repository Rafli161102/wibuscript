// File: tests/lsp.test.ts
// ============================================================================
// Pengujian Unit Komprehensif: Wibu Language Server Protocol (LSP)
// Memverifikasi diagnostik real-time, penyelesaian otomatis 4 Dialek Mutlak,
// hover documentation, outline document symbols, dan siklus hidup JSON-RPC.
// ============================================================================

import { describe, it, expect } from "vitest";
import {
  validateWibuScript,
  buildDialectCompletionItems,
  getDocumentSymbols,
  WibuLanguageServer,
  DiagnosticSeverity,
  CompletionItemKind,
  SymbolKind,
  type JsonRpcMessage
} from "../src/lsp";

describe("Wibu Language Server Protocol (src/lsp.ts)", () => {
  // --------------------------------------------------------------------------
  // 1. PENGUJIAN DIAGNOSTIK REAL-TIME (VALIDASI LEXER & PARSER)
  // --------------------------------------------------------------------------
  describe("Validasi Kode & Diagnostik Galat (validateWibuScript)", () => {
    it("mengembalikan array kosong untuk kode yang sah di seluruh 4 dialek", () => {
      const codeMurni = `
        kore a = 10;
        jutsu kali(x, y) { kaesu x * y; }
        kore hasil = seikou(kali(a, 2));
      `;
      const codeSingkat = `
        ko a = 10;
        ju kali(x, y) { kae x * y; }
        ko hasil = sei(kali(a, 2));
      `;
      const codeWibu = `
        iniDesu a = 10;
        mybini kali(x, y) { haiBeri x * y; }
        iniDesu hasil = hokiBanh(kali(a, 2));
      `;
      const codeRongawi = `
        pokmipokmi a = 10;
        fufufafa kali(x, y) { kandabahlil x * y; }
        pokmipokmi hasil = menyalaAbangku(kali(a, 2));
      `;

      expect(validateWibuScript(codeMurni)).toEqual([]);
      expect(validateWibuScript(codeSingkat)).toEqual([]);
      expect(validateWibuScript(codeWibu)).toEqual([]);
      expect(validateWibuScript(codeRongawi)).toEqual([]);
    });

    it("mengembalikan array kosong untuk kode string kosong atau hanya spasi", () => {
      expect(validateWibuScript("")).toEqual([]);
      expect(validateWibuScript("   \n\t  \n")).toEqual([]);
    });

    it("menangkap galat Lexer (karakter tak dikenal) dan menandai baris serta kolom", () => {
      const invalidLexerCode = "kore a = 10;\n@bukanSimbolSah;";
      const diagnostics = validateWibuScript(invalidLexerCode);

      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]!.severity).toBe(DiagnosticSeverity.Error);
      expect(diagnostics[0]!.source).toBe("wibuscript");
      expect(diagnostics[0]!.range.start.line).toBe(1); // Baris kedua (0-indexed)
      expect(diagnostics[0]!.message).toContain("Lexer Error");
    });

    it("menangkap galat Lexer (string belum ditutup)", () => {
      const unclosedStringCode = 'kore pesan = "halo dunia;';
      const diagnostics = validateWibuScript(unclosedStringCode);

      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]!.severity).toBe(DiagnosticSeverity.Error);
      expect(diagnostics[0]!.message).toContain("Literal string belum ditutup");
    });

    it("menangkap galat Parser (sintaks tak lengkap / token tak terduga)", () => {
      const invalidParserCode = "moshi (x > 5) {\n  kore y =\n}";
      const diagnostics = validateWibuScript(invalidParserCode);

      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]!.severity).toBe(DiagnosticSeverity.Error);
      expect(diagnostics[0]!.source).toBe("wibuscript");
      expect(diagnostics[0]!.range.start.line).toBeGreaterThanOrEqual(1);
    });

    it("menangkap galat Parser pada pencocokan pola shougo", () => {
      const invalidMatchCode = "shougo (val) {\n  bukanBaai: 123;\n}";
      const diagnostics = validateWibuScript(invalidMatchCode);

      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]!.message).toContain("Diharapkan kata kunci 'baai' atau 'hyoujun'");
      expect(diagnostics[0]!.range.start.line).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // 2. PENGUJIAN PENYELESAIAN OTOMATIS 4 DIALEK MUTLAK (AUTOCOMPLETE)
  // --------------------------------------------------------------------------
  describe("Penyelesaian Otomatis 4 Dialek Mutlak (buildDialectCompletionItems)", () => {
    const items = buildDialectCompletionItems();

    it("menghasilkan koleksi penyelesaian otomatis lengkap dari dialect-definitions", () => {
      expect(items.length).toBeGreaterThan(100);
    });

    it("memuat kata kunci kontrol alur dari seluruh 4 dialek", () => {
      const labels = new Set(items.map((i) => i.label));

      // Jepang Murni
      expect(labels.has("moshi")).toBe(true);
      expect(labels.has("zutto")).toBe(true);
      expect(labels.has("shougo")).toBe(true);

      // Jepang Singkat
      expect(labels.has("mo")).toBe(true);
      expect(labels.has("zu")).toBe(true);
      expect(labels.has("sho")).toBe(true);

      // Wibu Absurd
      expect(labels.has("moShiKalo")).toBe(true);
      expect(labels.has("zuttoLoop")).toBe(true);
      expect(labels.has("cocokkan")).toBe(true);

      // Meme Rongawi
      expect(labels.has("izintampil")).toBe(true);
      expect(labels.has("nyawit")).toBe(true);
      expect(labels.has("persimpangan")).toBe(true);
    });

    it("memuat kata kunci deklarasi dari seluruh 4 dialek", () => {
      const labels = new Set(items.map((i) => i.label));

      expect(labels.has("kore")).toBe(true);
      expect(labels.has("ko")).toBe(true);
      expect(labels.has("iniDesu")).toBe(true);
      expect(labels.has("pokmipokmi")).toBe(true);

      expect(labels.has("sekte")).toBe(true);
      expect(labels.has("sek")).toBe(true);
      expect(labels.has("nakama")).toBe(true);
      expect(labels.has("sektejomok")).toBe(true);
    });

    it("memuat fungsi pustaka standar dan tipe data modern di seluruh 4 dialek", () => {
      const labels = new Set(items.map((i) => i.label));

      // Fungsi standar
      expect(labels.has("mite")).toBe(true);
      expect(labels.has("mi")).toBe(true);
      expect(labels.has("iuYo")).toBe(true);
      expect(labels.has("salamkenal")).toBe(true);

      // Konstruktor Hasil
      expect(labels.has("seikou")).toBe(true);
      expect(labels.has("shippai")).toBe(true);
      expect(labels.has("sei")).toBe(true);
      expect(labels.has("sip")).toBe(true);
      expect(labels.has("hokiBanh")).toBe(true);
      expect(labels.has("zonkBanh")).toBe(true);
      expect(labels.has("menyalaAbangku")).toBe(true);
      expect(labels.has("rugidong")).toBe(true);

      // Konstruktor Opsional
      expect(labels.has("aru")).toBe(true);
      expect(labels.has("nai")).toBe(true);
      expect(labels.has("ar")).toBe(true);
      expect(labels.has("na")).toBe(true);
      expect(labels.has("adaBanh")).toBe(true);
      expect(labels.has("gaadaBanh")).toBe(true);
      expect(labels.has("adamas")).toBe(true);
      expect(labels.has("habismas")).toBe(true);

      // Alias universal
      expect(labels.has("ok")).toBe(true);
      expect(labels.has("error")).toBe(true);
      expect(labels.has("some")).toBe(true);
      expect(labels.has("none")).toBe(true);
    });

    it("memuat metode bantuan berantai untuk tipe modern", () => {
      const labels = new Set(items.map((i) => i.label));

      expect(labels.has("unwrap")).toBe(true);
      expect(labels.has("unwrapOr")).toBe(true);
      expect(labels.has("map")).toBe(true);
      expect(labels.has("andThen")).toBe(true);

      // Alias dialek metode
      expect(labels.has("hiraku")).toBe(true);
      expect(labels.has("bukaBanh")).toBe(true);
      expect(labels.has("jebolmas")).toBe(true);
      expect(labels.has("predikbola")).toBe(true);
      expect(labels.has("gaspolmas")).toBe(true);
    });

    it("memuat template snippet kontrol alur untuk penulisan cepat", () => {
      const snippetItems = items.filter((i) => i.kind === CompletionItemKind.Snippet);
      expect(snippetItems.length).toBeGreaterThanOrEqual(15);

      const snippetLabels = snippetItems.map((s) => s.label);
      expect(snippetLabels).toContain("moshi-snippet");
      expect(snippetLabels).toContain("mo-snippet");
      expect(snippetLabels).toContain("cocokkan-snippet");
      expect(snippetLabels).toContain("persimpangan-snippet");
    });
  });

  // --------------------------------------------------------------------------
  // 3. PENGUJIAN OUTLINE DOKUMEN (DOCUMENT SYMBOLS)
  // --------------------------------------------------------------------------
  describe("Ekstraksi Simbol Dokumen (getDocumentSymbols)", () => {
    it("mengekstrak fungsi, kelas, metode, dan variabel dengan tepat", () => {
      const code = `
        kore total = 100;
        zettai KURS = 15000;

        jutsu hitungDiskon(harga) {
          kaesu harga * 0.9;
        }

        sekte Kasir {
          tanjou(nama) {
            jibun.nama = nama;
          }
          proses(nominal) {
            kaesu nominal;
          }
        }
      `;

      const symbols = getDocumentSymbols(code);
      const symbolNames = symbols.map((s) => s.name);

      expect(symbolNames).toContain("total");
      expect(symbolNames).toContain("KURS");
      expect(symbolNames).toContain("hitungDiskon");
      expect(symbolNames).toContain("Kasir");

      const kasirSymbol = symbols.find((s) => s.name === "Kasir");
      expect(kasirSymbol?.kind).toBe(SymbolKind.Class);
      expect(kasirSymbol?.children?.length).toBe(2);

      const fnSymbol = symbols.find((s) => s.name === "hitungDiskon");
      expect(fnSymbol?.kind).toBe(SymbolKind.Function);

      const constSymbol = symbols.find((s) => s.name === "KURS");
      expect(constSymbol?.kind).toBe(SymbolKind.Constant);
    });
  });

  // --------------------------------------------------------------------------
  // 4. PENGUJIAN SIKLUS HIDUP PROTOKOL SERVER (WibuLanguageServer)
  // --------------------------------------------------------------------------
  describe("Siklus Hidup Server LSP (WibuLanguageServer)", () => {
    it("merespons permintaan initialize dengan kapabilitas yang didukung", () => {
      const server = new WibuLanguageServer();
      const response = server.handleMessage({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {}
      });

      expect(response).not.toBeNull();
      expect(response?.id).toBe(1);
      expect(response?.result.capabilities.textDocumentSync).toBe(1);
      expect(response?.result.capabilities.hoverProvider).toBe(true);
      expect(response?.result.capabilities.documentSymbolProvider).toBe(true);
      expect(response?.result.serverInfo.name).toBe("wibuscript-language-server");
    });

    it("mengirimkan diagnostik otomatis pada event textDocument/didOpen dan didChange", () => {
      const publishedMessages: JsonRpcMessage[] = [];
      const server = new WibuLanguageServer((msg) => {
        publishedMessages.push(msg);
      });

      const uri = "file:///workspace/test.wibu";

      // 1. Buka berkas dengan kode error
      server.handleMessage({
        jsonrpc: "2.0",
        method: "textDocument/didOpen",
        params: {
          textDocument: {
            uri,
            version: 1,
            text: "kore x = ;"
          }
        }
      });

      expect(publishedMessages.length).toBe(1);
      expect(publishedMessages[0]!.method).toBe("textDocument/publishDiagnostics");
      expect(publishedMessages[0]!.params.uri).toBe(uri);
      expect(publishedMessages[0]!.params.diagnostics.length).toBeGreaterThan(0);

      // 2. Perbarui berkas menjadi kode valid (real-time fix)
      server.handleMessage({
        jsonrpc: "2.0",
        method: "textDocument/didChange",
        params: {
          textDocument: { uri, version: 2 },
          contentChanges: [{ text: "kore x = 42;" }]
        }
      });

      expect(publishedMessages.length).toBe(2);
      expect(publishedMessages[1]!.params.diagnostics.length).toBe(0);

      // 3. Tutup berkas, memastikan diagnostik dibersihkan
      server.handleMessage({
        jsonrpc: "2.0",
        method: "textDocument/didClose",
        params: {
          textDocument: { uri }
        }
      });

      expect(publishedMessages.length).toBe(3);
      expect(publishedMessages[2]!.params.diagnostics).toEqual([]);
    });

    it("merespons textDocument/completion dengan daftar item", () => {
      const server = new WibuLanguageServer();
      const response = server.handleMessage({
        jsonrpc: "2.0",
        id: 42,
        method: "textDocument/completion",
        params: {}
      });

      expect(response?.id).toBe(42);
      expect(Array.isArray(response?.result)).toBe(true);
      expect(response?.result.length).toBeGreaterThan(100);
    });

    it("merespons textDocument/hover dengan dokumentasi markdown kata kunci", () => {
      const server = new WibuLanguageServer();
      const uri = "file:///workspace/hover_test.wibu";

      server.handleMessage({
        jsonrpc: "2.0",
        method: "textDocument/didOpen",
        params: {
          textDocument: {
            uri,
            version: 1,
            text: "moshi (hontou) { mite(1); }"
          }
        }
      });

      const hoverResponse = server.handleMessage({
        jsonrpc: "2.0",
        id: 99,
        method: "textDocument/hover",
        params: {
          textDocument: { uri },
          position: { line: 0, character: 2 } // Pada kata 'moshi'
        }
      });

      expect(hoverResponse?.id).toBe(99);
      expect(hoverResponse?.result?.contents?.value).toContain("WibuScript");
      expect(hoverResponse?.result?.contents?.value).toContain("moshi");
    });

    it("merespons metode tidak dikenal dengan kode error -32601", () => {
      const server = new WibuLanguageServer();
      const response = server.handleMessage({
        jsonrpc: "2.0",
        id: 123,
        method: "metodePalsu/yangTidakAda",
        params: {}
      });

      expect(response?.error?.code).toBe(-32601);
      expect(response?.error?.message).toContain("tidak ditemukan");
    });

    it("mengembalikan null untuk permintaan shutdown", () => {
      const server = new WibuLanguageServer();
      const response = server.handleMessage({
        jsonrpc: "2.0",
        id: 500,
        method: "shutdown",
        params: {}
      });

      expect(response?.id).toBe(500);
      expect(response?.result).toBeNull();
    });
  });
});
