import { describe, it, expect } from "vitest";
import { runWibuScriptAsync, transpileToJS } from "../src/index";
import {
  normalizePackageName,
  resolveNpmPackage,
  installPackage,
} from "../src/pm";

describe("WibuScript v2.2.0 - Prioritas 1: Interoperabilitas NPM (FFI)", () => {
  describe("1. Wibu Package Manager (src/pm.ts)", () => {
    it("dapat menormalisasi nama paket dari format npm:nama-paket", () => {
      expect(normalizePackageName("npm:lodash")).toBe("lodash");
      expect(normalizePackageName("npm:@types/node")).toBe("@types/node");
      expect(normalizePackageName("  npm:express  ")).toBe("express");
      expect(normalizePackageName("axios")).toBe("axios");
    });

    it("dapat meresolusi paket JavaScript npm yang terpasang di node_modules", () => {
      const res = resolveNpmPackage("npm:lodash");
      expect(res).not.toBeNull();
      expect(res?.kind).toBe("js");
      expect(res?.packageName).toBe("lodash");
      expect(res?.entryPath).toBeDefined();
    });

    it("mengembalikan null untuk paket yang tidak terpasang di node_modules", () => {
      const res = resolveNpmPackage("npm:paket-khayalan-wibuscript-12345");
      expect(res).toBeNull();
    });

    it("menolak instalasi dengan nama paket tidak valid secara aman", () => {
      const result = installPackage("paket dengan spasi; rm -rf /");
      expect(result).toBe(false);
    });

    it("menangani kegagalan instalasi paket yang tidak ada di registry npm", () => {
      const result = installPackage("paket-palsu-wibuscript-tidak-ada-987654");
      expect(result).toBe(false);
    });
  });

  describe("2. FFI Runtime: Impor dan Eksekusi Paket NPM di 4 Dialek", () => {
    it("Dialek Jepang Murni: mengimpor lodash dan mengeksekusi capitalize serta chunk", async () => {
      const code = `
        toriyoseru { capitalize, chunk } kara "npm:lodash";
        kore kata = capitalize("wibuscript");
        mite(kata);
        kore pecahan = chunk([1, 2, 3, 4], 2);
        kuchiMite(pecahan);
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["Wibuscript", "[[1, 2], [3, 4]]"]);
    });

    it("Dialek Jepang Singkat: mengimpor lodash (tori ... kra)", async () => {
      const code = `
        tori { capitalize, difference } kra "npm:lodash";
        ko nama = capitalize("singkat");
        mi(nama);
        ko sisa = difference([1, 2, 3, 4], [2, 3]);
        km(sisa);
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["Singkat", "[1, 4]"]);
    });

    it("Dialek Wibu Absurd: mengimpor lodash (summonJutsu ... dari)", async () => {
      const code = `
        summonJutsu { capitalize, chunk } dari "npm:lodash";
        iniDesu judul = capitalize("wibu ffi");
        teriakAmba(judul);
        iniDesu grup = chunk([10, 20, 30], 1);
        omaeWaIu(grup);
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["Wibu ffi", "[[10], [20], [30]]"]);
    });

    it("Dialek Meme Rongawi: mengimpor lodash (begalbaju ... ngawiland)", async () => {
      const code = `
        begalbaju { capitalize, compact } ngawiland "npm:lodash";
        pokmipokmi teks = capitalize("rongawi");
        salamkenal(teks);
        pokmipokmi bersih = compact([1, 0, uso, 2, ""]);
        cawapresin(bersih);
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["Rongawi", "[1, 2]"]);
    });

    it("Mendukung wildcard import (*) dari pustaka npm", async () => {
      const code = `
        toriyoseru * kara "npm:lodash";
        kore c = chunk([5, 6, 7, 8], 2);
        kuchiMite(c);
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["[[5, 6], [7, 8]]"]);
    });

    it("Memberikan runtime error terperinci jika simbol tidak ada di paket npm", async () => {
      const code = `
        toriyoseru { simbolKhayalan } kara "npm:lodash";
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Simbol 'simbolKhayalan' tidak ditemukan pada pustaka npm 'npm:lodash'");
    });

    it("Memberikan runtime error terperinci jika paket npm belum terpasang", async () => {
      const code = `
        toriyoseru { sesuatu } kara "npm:paket_yang_belum_dipasang_xyz";
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("tidak ditemukan di node_modules. Silakan pasang terlebih dahulu dengan: wibu add");
    });
  });

  describe("3. Transpiler: ES2022 Output untuk Interop NPM", () => {
    it("menghasilkan ES2022 import yang bersih tanpa prefix npm:", () => {
      const code = `
        toriyoseru { chunk, capitalize } kara "npm:lodash";
        kore teks = capitalize("wibuscript");
      `;
      const js = transpileToJS(code);
      expect(js).toContain('import { chunk, capitalize } from "lodash";');
      expect(js).not.toContain("npm:lodash");
    });

    it("menghasilkan wildcard import ES2022 untuk * dari paket npm", () => {
      const code = `
        toriyoseru * kara "npm:lodash";
        kore potongan = chunk([1, 2], 1);
      `;
      const js = transpileToJS(code);
      expect(js).toContain('import * as _mod_lodash from "lodash";');
      expect(js).toContain("Object.assign(globalThis,");
    });
  });
});
