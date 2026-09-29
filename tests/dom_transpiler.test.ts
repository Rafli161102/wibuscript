// File: tests/dom_transpiler.test.ts
// ============================================================================
// WIBUSCRIPT DOM & WEB API TRANSPILER TEST SUITE
// Memverifikasi ketepatan pemetaan Kamus Wibu-DOM, pemeliharaan sintaks dasar,
// serta kekebalan mutlak literal string dan komentar dari distorsi transformasi.
// ============================================================================

import { describe, it, expect } from "vitest";
import { transpile, generateBrowserHTML } from "../src/dom-transpiler";
import * as fs from "node:fs";
import * as path from "node:path";

describe("WibuScript DOM & Web API Transpiler Verification", () => {
  describe("1. Pemetaan Sintaks Dasar WibuScript", () => {
    it("mentranspilasi deklarasi variabel dan tetapan (siImut & hargaMati)", () => {
      const code = `
        hargaMati pi = 3.14;
        siImut counter = 0;
      `;
      const result = transpile(code);
      expect(result).toContain("const pi = 3.14;");
      expect(result).toContain("let counter = 0;");
    });

    it("mentranspilasi percabangan alur kendali (whenYh, kaloGakGitu, yaudahlahYa)", () => {
      const code = `
        whenYh (angka > 10) {
          kasihPaham menyalaAbkuh;
        } kaloGakGitu (angka == 10) {
          teriakAmba("Sama dengan 10");
        } yaudahlahYa {
          kasihPaham maafLancang;
        }
      `;
      const result = transpile(code);
      expect(result).toContain("if (angka > 10) {");
      expect(result).toContain("return true;");
      expect(result).toContain("else if (angka == 10) {");
      expect(result).toContain("console.log(\"Sama dengan 10\");");
      expect(result).toContain("else {");
      expect(result).toContain("return false;");
    });

    it("mentranspilasi deklarasi fungsi (mybini & kasihPaham)", () => {
      const code = `
        mybini kaliDua(x) {
          kasihPaham x * 2;
        }
      `;
      const result = transpile(code);
      expect(result).toContain("function kaliDua(x) {");
      expect(result).toContain("return x * 2;");
    });
  });

  describe("2. Pemetaan Kamus Wibu-DOM (Web API & Browser)", () => {
    it("mentranspilasi culikId menjadi document.getElementById", () => {
      const code = 'siImut el = culikId("header");';
      const result = transpile(code);
      expect(result).toBe('let el = document.getElementById("header");');
    });

    it("mentranspilasi pantauSatu menjadi document.querySelector", () => {
      const code = 'siImut target = pantauSatu(".item-active");';
      const result = transpile(code);
      expect(result).toBe('let target = document.querySelector(".item-active");');
    });

    it("mentranspilasi bikinWujud menjadi document.createElement", () => {
      const code = 'siImut box = bikinWujud("div");';
      const result = transpile(code);
      expect(result).toBe('let box = document.createElement("div");');
    });

    it("mentranspilasi isiHati menjadi innerHTML", () => {
      const code = 'el.isiHati = "Konten Baru";';
      const result = transpile(code);
      expect(result).toBe('el.innerHTML = "Konten Baru";');
    });

    it("mentranspilasi kaloDisentuh menjadi addEventListener", () => {
      const code = 'tombol.kaloDisentuh("click", mybini() { teriakAmba("Klik!"); });';
      const result = transpile(code);
      expect(result).toBe('tombol.addEventListener("click", function() { console.log("Klik!"); });');
    });

    it("mentranspilasi masukinKeDunia secara global maupun bertingkat", () => {
      const globalCode = "masukinKeDunia(kartu);";
      expect(transpile(globalCode)).toBe("document.body.appendChild(kartu);");

      const nestedCode = "wadah.masukinKeDunia(kartu);";
      expect(transpile(nestedCode)).toBe("wadah.appendChild(kartu);");
    });

    it("mentranspilasi gantiBaju menjadi className", () => {
      const code = 'elemen.gantiBaju = "card highlight";';
      const result = transpile(code);
      expect(result).toBe('elemen.className = "card highlight";');
    });

    it("mentranspilasi pindahIsekai menjadi window.location.href", () => {
      const code = 'pindahIsekai("https://example.com");';
      const result = transpile(code);
      expect(result).toBe('window.location.href = "https://example.com";');
    });

    it("mentranspilasi peringatanSepuh menjadi alert", () => {
      const code = 'peringatanSepuh("Peringatan Sistem!");';
      const result = transpile(code);
      expect(result).toBe('alert("Peringatan Sistem!");');
    });

    it("mentranspilasi tungguBentar menjadi setTimeout", () => {
      const code = "tungguBentar(aksi, 1000);";
      const result = transpile(code);
      expect(result).toBe("setTimeout(aksi, 1000);");
    });

    it("mentranspilasi loopingMaut menjadi setInterval", () => {
      const code = "loopingMaut(detak, 500);";
      const result = transpile(code);
      expect(result).toBe("setInterval(detak, 500);");
    });
  });

  describe("3. Proteksi Mutlak Literal String dan Komentar (Lexical Masking)", () => {
    it("tidak mengubah kata kunci yang berada di dalam string kutip ganda", () => {
      const code = 'siImut pesan = "hargaMati siImut culikId isiHati masukinKeDunia";';
      const result = transpile(code);
      expect(result).toBe('let pesan = "hargaMati siImut culikId isiHati masukinKeDunia";');
    });

    it("tidak mengubah kata kunci yang berada di dalam string kutip tunggal", () => {
      const code = "siImut kata = 'whenYh kaloGakGitu yaudahlahYa';";
      const result = transpile(code);
      expect(result).toBe("let kata = 'whenYh kaloGakGitu yaudahlahYa';");
    });

    it("tidak mengubah kata kunci di dalam template literal backtick", () => {
      const code = "siImut info = `Peringatan: ${isiHati} dan ${bikinWujud}`;";
      const result = transpile(code);
      expect(result).toBe("let info = `Peringatan: ${isiHati} dan ${bikinWujud}`;");
    });

    it("mempertahankan string dengan escape karakter secara utuh", () => {
      const code = 'siImut teks = "Kata orang: \\"culikId dan isiHati\\" harus dijaga.";';
      const result = transpile(code);
      expect(result).toBe('let teks = "Kata orang: \\"culikId dan isiHati\\" harus dijaga.";');
    });

    it("tidak mengubah komentar satu baris dan komentar multi baris", () => {
      const code = `
        // culikId tidak boleh diubah
        /* whenYh dan yaudahlahYa harus tetap ada */
        siImut aktif = menyalaAbkuh;
      `;
      const result = transpile(code);
      expect(result).toContain("// culikId tidak boleh diubah");
      expect(result).toContain("/* whenYh dan yaudahlahYa harus tetap ada */");
      expect(result).toContain("let aktif = true;");
    });
  });

  describe("4. Opsi Pembungkus & Generator HTML Browser", () => {
    it("membungkus kode dalam IIFE jika wrapInIIFE aktif", () => {
      const code = "siImut x = 10;";
      const result = transpile(code, { wrapInIIFE: true });
      expect(result).toContain("(() => {");
      expect(result).toContain("let x = 10;");
      expect(result).toContain("})();");
    });

    it("menambahkan listener DOMContentLoaded jika waitForDOM aktif", () => {
      const code = "siImut y = 20;";
      const result = transpile(code, { waitForDOM: true });
      expect(result).toContain('document.addEventListener("DOMContentLoaded", () => {');
      expect(result).toContain("let y = 20;");
    });

    it("menghasilkan dokumen HTML yang valid via generateBrowserHTML", () => {
      const html = generateBrowserHTML('siImut tombol = culikId("btn");', {
        title: "Uji HTML",
      });
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<title>Uji HTML</title>");
      expect(html).toContain("let tombol = document.getElementById(\"btn\");");
    });
  });

  describe("5. Transpilasi Berkas Contoh Nyata (examples/dom_cringe.wibu)", () => {
    it("berhasil mentranspilasi examples/dom_cringe.wibu menjadi JavaScript valid", () => {
      const filePath = path.resolve(__dirname, "..", "examples", "dom_cringe.wibu");
      const wibuCode = fs.readFileSync(filePath, "utf-8");
      const compiled = transpile(wibuCode);

      expect(compiled).toContain('const namaAplikasi = "Portal Petualangan Wibu"');
      expect(compiled).toContain('console.log("Memulai aplikasi: " + namaAplikasi)');
      expect(compiled).toContain('let kontainer = document.getElementById("app-root")');
      expect(compiled).toContain("if (kontainer) {");
      expect(compiled).toContain('let kartu = document.createElement("div")');
      expect(compiled).toContain('kartu.className = "kartu-wibu"');
      expect(compiled).toContain('kartu.appendChild(judul)');
      expect(compiled).toContain('tombol.addEventListener("click", function() {');
      expect(compiled).toContain('alert("Gerbang isekai sedang diinisialisasi...")');
      expect(compiled).toContain('window.location.href = "https://github.com/Rafli161102/wibuscript"');
      expect(compiled).toContain("document.body.appendChild(kartu)");
      expect(compiled).toContain("else {");
      expect(compiled).toContain('let logError = document.querySelector(".error-log")');
    });
  });
});
