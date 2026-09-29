// File: tests/resilience.test.ts
// ============================================================================
// WIBUSCRIPT RESILIENCE & FAULT TOLERANCE TEST SUITE
// Memverifikasi ketahanan, stabilitas, dan toleransi kesalahan pada seluruh
// lapisan WibuScript: Parser Recursion Guard, Lexer Protection, Uncatchable
// Runtime Limits (RuntimeSystemError), Sandbox File Isolation, Array Memory Limits,
// dan DOM Transpiler Nested Expressions.
// ============================================================================

import { describe, it, expect } from "vitest";
import {
  tokenize,
  Parser,
  runWibuScriptAsync,
  createGlobalEnvironment,
  evaluate,
  registerVirtualModule,
  clearVirtualModules,
  RuntimeSystemError,
} from "../src/index";
import { transpile } from "../src/dom-transpiler";

describe("WibuScript Resilience & Fault Tolerance Verification", () => {
  describe("1. Ketahanan Parser terhadap Rekursi Berlebih (Recursion Stack Limit)", () => {
    it("menolak sarang tanda kurung yang melampaui batas kedalaman secara aman", () => {
      // 550 tingkat kurung bersarang (batas maksimum default adalah 500)
      const openParens = "(".repeat(550);
      const closeParens = ")".repeat(550);
      const sourceCode = `kore nilai = ${openParens} 42 ${closeParens};`;

      const tokens = tokenize(sourceCode);
      const parser = new Parser(500);

      expect(() => parser.produceAST(tokens)).toThrowError(
        /Batas kedalaman penguraian terlampaui/
      );
    });

    it("menolak sarang blok kode yang melampaui batas kedalaman secara aman", () => {
      const openBraces = "{ ".repeat(550);
      const closeBraces = " }".repeat(550);
      const sourceCode = `${openBraces} kore a = 1; ${closeBraces}`;

      const tokens = tokenize(sourceCode);
      const parser = new Parser(500);

      expect(() => parser.produceAST(tokens)).toThrowError(
        /Batas kedalaman penguraian terlampaui/
      );
    });

    it("mampu mengurai dan mengeksekusi ekspresi bersarang dalam batas wajar", async () => {
      const openParens = "(".repeat(40);
      const closeParens = ")".repeat(40);
      const sourceCode = `kore nilai = ${openParens} 10 + 5 ${closeParens};`;

      const logs: string[] = [];
      const result = await runWibuScriptAsync(sourceCode, {
        outputHandler: (msg) => logs.push(msg),
      });

      expect(result.error).toBeUndefined();
    });
  });

  describe("2. Ketahanan Lexer terhadap Input Malformed & Unterminated Literals", () => {
    it("menolak komentar multi-baris yang tidak ditutup sebelum akhir berkas", () => {
      const code = "kore x = 10; /* komentar ini tidak pernah ditutup";
      expect(() => tokenize(code)).toThrowError(
        /Komentar multi-baris belum ditutup sebelum akhir berkas/
      );
    });

    it("menolak literal string yang tidak ditutup sebelum akhir berkas", () => {
      const code = 'kore teks = "halo dunia yang tak berakhir;';
      expect(() => tokenize(code)).toThrowError(
        /Literal string belum ditutup sebelum akhir berkas/
      );
    });

    it("menolak literal template string yang tidak ditutup sebelum akhir berkas", () => {
      const code = "kore info = `nama: ${user};";
      expect(() => tokenize(code)).toThrowError(
        /Literal template string belum ditutup sebelum akhir berkas/
      );
    });

    it("menolak simbol yang tidak sah dengan pesan posisi baris dan kolom yang jelas", () => {
      const code = "kore angka = 10 @ 20;";
      expect(() => tokenize(code)).toThrowError(
        /Karakter tidak dikenali: '@'/
      );
    });
  });

  describe("3. Proteksi RuntimeSystemError (Uncatchable Safety Limits)", () => {
    it("mencegah blok kokoromi/yurusu menelan Infinite Loop (maxLoopIterations)", async () => {
      // Loop tanpa henti yang mencoba menangkap error sendiri dengan kokoromi/yurusu
      const code = `
        zutto (maji) {
          kokoromi {
            // Lakukan perulangan
          } yurusu (e) {
            // Coba telan error sistem
          }
        }
      `;

      const result = await runWibuScriptAsync(code, {
        maxLoopIterations: 500,
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Batas iterasi perulangan terlampaui");
    });

    it("mencegah blok kokoromi/yurusu menelan Infinite Recursion (maxCallStackDepth)", async () => {
      const code = `
        jutsu rekursiBahaya() {
          kokoromi {
            rekursiBahaya();
          } yurusu (e) {
            // Coba telan error stack overflow
            rekursiBahaya();
          }
        }
        rekursiBahaya();
      `;

      const result = await runWibuScriptAsync(code, {
        maxCallStackDepth: 50,
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Batas kedalaman tumpukan panggilan");
    });

    it("mencegah blok kokoromi/yurusu menelan Timeout eksekusi", async () => {
      const code = `
        zutto (maji) {
          kokoromi {
            // Lakukan kalkulasi
          } yurusu (e) {
            // Coba telan error timeout
          }
        }
      `;

      const result = await runWibuScriptAsync(code, {
        timeoutMs: 100,
        maxLoopIterations: 10_000_000,
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Batas waktu eksekusi");
    });

    it("mencegah blok kokoromi/yurusu menelan Pembatalan oleh Pengguna (Cancellation)", async () => {
      const isCancelledRef = { current: false };

      const code = `
        zutto (maji) {
          kokoromi {
            // Loop berjalan
          } yurusu (e) {
            // Coba telan error pembatalan
          }
        }
      `;

      // Batalkan eksekusi setelah 50ms
      setTimeout(() => {
        isCancelledRef.current = true;
      }, 50);

      const result = await runWibuScriptAsync(code, {
        isCancelledRef,
        maxLoopIterations: 10_000_000,
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Eksekusi dihentikan oleh pengguna (Cancelled)");
    });
  });

  describe("4. Isolasi Sistem Berkas Sandbox (allowFs: false)", () => {
    it("menolak pembacaan berkas (yomu/bacaBerkas) saat allowFs bernilai false", async () => {
      const code = `kore teks = yomu("package.json");`;
      const result = await runWibuScriptAsync(code, {
        allowFs: false,
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Operasi sistem berkas dilarang oleh konfigurasi lingkungan");
    });

    it("menolak penulisan berkas (kaku/tulisBerkas) saat allowFs bernilai false", async () => {
      const code = `kaku("bahaya.txt", "data");`;
      const result = await runWibuScriptAsync(code, {
        allowFs: false,
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Operasi sistem berkas dilarang oleh konfigurasi lingkungan");
    });

    it("menolak pemanggilan berkas eksternal (yobu) saat allowFs bernilai false", async () => {
      const code = `yobu("examples/kalkulator.wibu");`;
      const result = await runWibuScriptAsync(code, {
        allowFs: false,
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Operasi sistem berkas dilarang oleh konfigurasi lingkungan");
    });

    it("tetap mengizinkan pemanggilan Virtual Module dalam memori meskipun allowFs bernilai false", async () => {
      clearVirtualModules();
      registerVirtualModule("modulMemori", `
        kore rahasia = 999;
        mite(rahasia);
      `);

      const logs: string[] = [];
      const code = `yobu("modulMemori");`;

      const result = await runWibuScriptAsync(code, {
        allowFs: false,
        outputHandler: (msg) => logs.push(msg),
      });

      clearVirtualModules();
      expect(result.error).toBeUndefined();
      expect(logs).toContain("999");
    });
  });

  describe("5. Perlindungan Batasan Memori Barisan (Array Size Guard)", () => {
    it("menolak penambahan elemen melebihi 100.000 elemen pada barisan", async () => {
      const env = createGlobalEnvironment();
      const code = `
        kore arr = [];
        // Buat barisan awal dan coba paksa tambah
      `;
      const tokens = tokenize(code);
      const parser = new Parser();
      await evaluate(parser.produceAST(tokens), env);

      // Simulasikan barisan yang telah mencapai 100.000 elemen
      const arrVal = env.lookupVar("arr") as any;
      arrVal.elements = new Array(100_000).fill(null);

      // Coba tambah 1 elemen menggunakan ireta
      const pushCode = `ireta(arr, 123);`;
      const pushTokens = tokenize(pushCode);
      const pushAst = new Parser().produceAST(pushTokens);

      await expect(evaluate(pushAst, env)).rejects.toThrowError(
        /Batas maksimum elemen barisan \(100\.000 elemen\) terlampaui/
      );
    });
  });

  describe("6. Ketahanan DOM Transpiler terhadap Ekspresi Bersarang", () => {
    it("mentranspilasi wadah.masukinKeDunia dengan argumen fungsi bersarang tanpa korupsi tanda kurung", () => {
      const code = 'wadah.masukinKeDunia(bikinWujud("div"));';
      const result = transpile(code);
      expect(result).toBe('wadah.appendChild(document.createElement("div"));');
    });

    it("mentranspilasi masukinKeDunia global dengan argumen fungsi bersarang", () => {
      const code = 'masukinKeDunia(bikinWujud("span"));';
      const result = transpile(code);
      expect(result).toBe('document.body.appendChild(document.createElement("span"));');
    });

    it("mentranspilasi pindahIsekai dengan pemanggilan fungsi bersarang secara utuh", () => {
      const code = 'pindahIsekai(bikinUrl("auth", ambilToken()));';
      const result = transpile(code);
      expect(result).toBe('window.location.href = bikinUrl("auth", ambilToken());');
    });

    it("mentranspilasi masukinKeDunia multi-baris dengan benar", () => {
      const code = `
        wadah.masukinKeDunia(
          bikinWujud("p")
        );
      `;
      const result = transpile(code);
      expect(result).toContain('wadah.appendChild(');
      expect(result).toContain('document.createElement("p")');
    });
  });
});
