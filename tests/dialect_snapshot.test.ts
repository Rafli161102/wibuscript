// File: tests/dialect_snapshot.test.ts
// ============================================================================
// WIBUSCRIPT DIALECT PARITY & SNAPSHOT TEST SUITE (v2.0 COMPLIANCE)
// Memverifikasi kesetaraan mutlak 4 Dialek WibuScript:
// 1. Jepang Murni (murni)
// 2. Jepang Singkat (singkat)
// 3. Wibu Absurd (wibu)
// 4. Meme Rongawi (rongawi)
// Menjamin prinsip arsitektur: "Satu Inti, Banyak Target" dan
// "Sintaks 4 Dialek Dibekukan: Semua dialek bermuara pada satu AST bersama".
// Sesuai Dokumen Resmi ROADMAP-wibuscript.pdf Bagian 14 & 15.
// ============================================================================

import { describe, it, expect } from "vitest";
import { tokenize } from "../src/lexer";
import { Parser } from "../src/parser";
import { transpileToJS, transpileWithSourceMap } from "../src/transpiler";
import { WibuSandbox, runInSandbox } from "../src/sandbox";
import type { Program } from "../src/ast";

function parseCode(code: string): Program {
  const tokens = tokenize(code);
  const parser = new Parser();
  return parser.produceAST(tokens);
}

describe("WibuScript v2.0 - Dialect Parity & Snapshot Verification", () => {
  // --------------------------------------------------------------------------
  // PROGRAM 1: FAKTORIAL (Rekursi & Percabangan Kondisional)
  // --------------------------------------------------------------------------
  describe("Kasus Logika 1: Faktorial Rekursif & Alur Kontrol", () => {
    const codeMurni = `
      jutsu faktorial(n) {
        moshi (n <= 1) {
          kaesu 1;
        } hoka {
          kaesu n * faktorial(n - 1);
        }
      }
      kore hasil = faktorial(5);
    `;

    const codeSingkat = `
      ju faktorial(n) {
        mo (n <= 1) {
          kae 1;
        } ho {
          kae n * faktorial(n - 1);
        }
      }
      ko hasil = faktorial(5);
    `;

    const codeWibu = `
      mybini faktorial(n) {
        moShiKalo (n <= 1) {
          haiBeri 1;
        } shoganaiNe {
          haiBeri n * faktorial(n - 1);
        }
      }
      iniDesu hasil = faktorial(5);
    `;

    const codeRongawi = `
      fufufafa faktorial(n) {
        izintampil (n <= 1) {
          kandabahlil 1;
        } woijawa {
          kandabahlil n * faktorial(n - 1);
        }
      }
      pokmipokmi hasil = faktorial(5);
    `;

    it("menghasilkan struktur AST yang 100% identik di seluruh 4 dialek", () => {
      const astMurni = parseCode(codeMurni);
      const astSingkat = parseCode(codeSingkat);
      const astWibu = parseCode(codeWibu);
      const astRongawi = parseCode(codeRongawi);

      expect(astSingkat).toEqual(astMurni);
      expect(astWibu).toEqual(astMurni);
      expect(astRongawi).toEqual(astMurni);
    });

    it("menghasilkan eksekusi nilai yang 100% identik di seluruh 4 dialek", async () => {
      const sandbox = new WibuSandbox({ timeoutMs: 3000 });

      const resMurni = await sandbox.execute(`${codeMurni}\nmite(hasil);`);
      const resSingkat = await sandbox.execute(`${codeSingkat}\nmi(hasil);`);
      const resWibu = await sandbox.execute(`${codeWibu}\niuYo(hasil);`);
      const resRongawi = await sandbox.execute(`${codeRongawi}\nsalamkenal(hasil);`);

      expect(resMurni.success).toBe(true);
      expect(resSingkat.success).toBe(true);
      expect(resWibu.success).toBe(true);
      expect(resRongawi.success).toBe(true);

      expect(resMurni.output).toEqual(["120"]);
      expect(resSingkat.output).toEqual(["120"]);
      expect(resWibu.output).toEqual(["120"]);
      expect(resRongawi.output).toEqual(["120"]);
    });
  });

  // --------------------------------------------------------------------------
  // PROGRAM 2: MANIPULASI ARRAY (Iterasi Koleksi & Filter Modulo)
  // --------------------------------------------------------------------------
  describe("Kasus Logika 2: Manipulasi Array & Iterasi Koleksi", () => {
    const codeMurni = `
      kore angka = [1, 2, 3, 4, 5, 6];
      kore genap = [];
      subete (x no angka) {
        moshi (x % 2 == 0) {
          genap = [...genap, x * 10];
        }
      }
    `;

    const codeSingkat = `
      ko angka = [1, 2, 3, 4, 5, 6];
      ko genap = [];
      sube (x no angka) {
        mo (x % 2 == 0) {
          genap = [...genap, x * 10];
        }
      }
    `;

    const codeWibu = `
      iniDesu angka = [1, 2, 3, 4, 5, 6];
      iniDesu genap = [];
      zenbuNe (x dari angka) {
        moShiKalo (x % 2 == 0) {
          genap = [...genap, x * 10];
        }
      }
    `;

    const codeRongawi = `
      pokmipokmi angka = [1, 2, 3, 4, 5, 6];
      pokmipokmi genap = [];
      thugshaker (x alasdaun angka) {
        izintampil (x % 2 == 0) {
          genap = [...genap, x * 10];
        }
      }
    `;

    it("menghasilkan struktur AST yang 100% identik di seluruh 4 dialek", () => {
      const astMurni = parseCode(codeMurni);
      const astSingkat = parseCode(codeSingkat);
      const astWibu = parseCode(codeWibu);
      const astRongawi = parseCode(codeRongawi);

      expect(astSingkat).toEqual(astMurni);
      expect(astWibu).toEqual(astMurni);
      expect(astRongawi).toEqual(astMurni);
    });

    it("menghasilkan eksekusi nilai yang 100% identik di seluruh 4 dialek", async () => {
      const sandbox = new WibuSandbox({ timeoutMs: 3000 });

      const resMurni = await sandbox.execute(`${codeMurni}\nmite(genap);`);
      const resSingkat = await sandbox.execute(`${codeSingkat}\nmi(genap);`);
      const resWibu = await sandbox.execute(`${codeWibu}\niuYo(genap);`);
      const resRongawi = await sandbox.execute(`${codeRongawi}\nsalamkenal(genap);`);

      expect(resMurni.success).toBe(true);
      expect(resSingkat.success).toBe(true);
      expect(resWibu.success).toBe(true);
      expect(resRongawi.success).toBe(true);

      expect(resMurni.output).toEqual(["[20,40,60]"]);
      expect(resSingkat.output).toEqual(["[20,40,60]"]);
      expect(resWibu.output).toEqual(["[20,40,60]"]);
      expect(resRongawi.output).toEqual(["[20,40,60]"]);
    });
  });

  // --------------------------------------------------------------------------
  // PROGRAM 3: PATTERN MATCHING (Shougo / Switch Eksklusif)
  // --------------------------------------------------------------------------
  describe("Kasus Logika 3: Pencocokan Pola (Pattern Matching / Shougo)", () => {
    const codeMurni = `
      jutsu evaluasi(skor) {
        shougo (skor) {
          baai 100: {
            kaesu "SEMPURNA";
          }
          baai 50: {
            kaesu "LULUS";
          }
          hyoujun: {
            kaesu "REMIDI";
          }
        }
      }
      kore hasilA = evaluasi(100);
      kore hasilB = evaluasi(50);
      kore hasilC = evaluasi(10);
    `;

    const codeSingkat = `
      ju evaluasi(skor) {
        sho (skor) {
          baa 100: {
            kae "SEMPURNA";
          }
          baa 50: {
            kae "LULUS";
          }
          hyo: {
            kae "REMIDI";
          }
        }
      }
      ko hasilA = evaluasi(100);
      ko hasilB = evaluasi(50);
      ko hasilC = evaluasi(10);
    `;

    const codeWibu = `
      mybini evaluasi(skor) {
        cocokkan (skor) {
          kaloPas 100: {
            haiBeri "SEMPURNA";
          }
          kaloPas 50: {
            haiBeri "LULUS";
          }
          sisaan: {
            haiBeri "REMIDI";
          }
        }
      }
      iniDesu hasilA = evaluasi(100);
      iniDesu hasilB = evaluasi(50);
      iniDesu hasilC = evaluasi(10);
    `;

    const codeRongawi = `
      fufufafa evaluasi(skor) {
        persimpangan (skor) {
          kenaben 100: {
            kandabahlil "SEMPURNA";
          }
          kenaben 50: {
            kandabahlil "LULUS";
          }
          yappingtolol: {
            kandabahlil "REMIDI";
          }
        }
      }
      pokmipokmi hasilA = evaluasi(100);
      pokmipokmi hasilB = evaluasi(50);
      pokmipokmi hasilC = evaluasi(10);
    `;

    it("menghasilkan struktur AST yang 100% identik di seluruh 4 dialek", () => {
      const astMurni = parseCode(codeMurni);
      const astSingkat = parseCode(codeSingkat);
      const astWibu = parseCode(codeWibu);
      const astRongawi = parseCode(codeRongawi);

      expect(astSingkat).toEqual(astMurni);
      expect(astWibu).toEqual(astMurni);
      expect(astRongawi).toEqual(astMurni);
    });

    it("menghasilkan eksekusi nilai yang 100% identik di seluruh 4 dialek", async () => {
      const sandbox = new WibuSandbox({ timeoutMs: 3000 });

      const resMurni = await sandbox.execute(
        `${codeMurni}\nmite(hasilA);\nmite(hasilB);\nmite(hasilC);`
      );
      const resSingkat = await sandbox.execute(
        `${codeSingkat}\nmi(hasilA);\nmi(hasilB);\nmi(hasilC);`
      );
      const resWibu = await sandbox.execute(
        `${codeWibu}\niuYo(hasilA);\niuYo(hasilB);\niuYo(hasilC);`
      );
      const resRongawi = await sandbox.execute(
        `${codeRongawi}\nsalamkenal(hasilA);\nsalamkenal(hasilB);\nsalamkenal(hasilC);`
      );

      expect(resMurni.success).toBe(true);
      expect(resSingkat.success).toBe(true);
      expect(resWibu.success).toBe(true);
      expect(resRongawi.success).toBe(true);

      const expectedOutput = ["SEMPURNA", "LULUS", "REMIDI"];
      expect(resMurni.output).toEqual(expectedOutput);
      expect(resSingkat.output).toEqual(expectedOutput);
      expect(resWibu.output).toEqual(expectedOutput);
      expect(resRongawi.output).toEqual(expectedOutput);
    });
  });

  // --------------------------------------------------------------------------
  // PROGRAM 4: DESTRUCTURING (Array Rest & Object Aliasing)
  // --------------------------------------------------------------------------
  describe("Kasus Logika 4: Pembongkaran Destructuring (Array & Kamus Objek)", () => {
    const codeMurni = `
      kore [a, b, ...sisa] = [10, 20, 30, 40];
      kore { nama, klan: marga } = { nama: "Sasuke", klan: "Uchiha" };
      kore total = a + b;
    `;

    const codeSingkat = `
      ko [a, b, ...sisa] = [10, 20, 30, 40];
      ko { nama, klan: marga } = { nama: "Sasuke", klan: "Uchiha" };
      ko total = a + b;
    `;

    const codeWibu = `
      iniDesu [a, b, ...sisa] = [10, 20, 30, 40];
      iniDesu { nama, klan: marga } = { nama: "Sasuke", klan: "Uchiha" };
      iniDesu total = a + b;
    `;

    const codeRongawi = `
      pokmipokmi [a, b, ...sisa] = [10, 20, 30, 40];
      pokmipokmi { nama, klan: marga } = { nama: "Sasuke", klan: "Uchiha" };
      pokmipokmi total = a + b;
    `;

    it("menghasilkan struktur AST yang 100% identik di seluruh 4 dialek", () => {
      const astMurni = parseCode(codeMurni);
      const astSingkat = parseCode(codeSingkat);
      const astWibu = parseCode(codeWibu);
      const astRongawi = parseCode(codeRongawi);

      expect(astSingkat).toEqual(astMurni);
      expect(astWibu).toEqual(astMurni);
      expect(astRongawi).toEqual(astMurni);
    });

    it("menghasilkan eksekusi nilai yang 100% identik di seluruh 4 dialek", async () => {
      const sandbox = new WibuSandbox({ timeoutMs: 3000 });

      const resMurni = await sandbox.execute(
        `${codeMurni}\nmite(total);\nmite(marga);\nmite(sisa);`
      );
      const resSingkat = await sandbox.execute(
        `${codeSingkat}\nmi(total);\nmi(marga);\nmi(sisa);`
      );
      const resWibu = await sandbox.execute(
        `${codeWibu}\niuYo(total);\niuYo(marga);\niuYo(sisa);`
      );
      const resRongawi = await sandbox.execute(
        `${codeRongawi}\nsalamkenal(total);\nsalamkenal(marga);\nsalamkenal(sisa);`
      );

      expect(resMurni.success).toBe(true);
      expect(resSingkat.success).toBe(true);
      expect(resWibu.success).toBe(true);
      expect(resRongawi.success).toBe(true);

      const expectedOutput = ["30", "Uchiha", "[30,40]"];
      expect(resMurni.output).toEqual(expectedOutput);
      expect(resSingkat.output).toEqual(expectedOutput);
      expect(resWibu.output).toEqual(expectedOutput);
      expect(resRongawi.output).toEqual(expectedOutput);
    });
  });

  // --------------------------------------------------------------------------
  // PROGRAM 5: TIPE DATA MODERN (Hasil & Opsional dengan Pattern Matching)
  // --------------------------------------------------------------------------
  describe("Kasus Logika 5: Tipe Data Modern Hasil & Opsional dengan Pencocokan Pola", () => {
    const codeMurni = `
      kore r = seikou(50);
      kore rMod = r.map(x => x * 2);
      kore hasilUnwrap = rMod.unwrap();

      kore o = aru("WibuScript");
      kore hasilOpt = o.unwrapOr("Kosong");

      kore statusHasil = shougo (rMod) {
        baai "ok": { kaesu "SUKSES_HASIL"; }
        baai "error": { kaesu "GAGAL_HASIL"; }
      };

      kore statusOpt = shougo (o) {
        baai "some": { kaesu "SUKSES_OPSIONAL"; }
        baai "none": { kaesu "GAGAL_OPSIONAL"; }
      };
    `;

    const codeSingkat = `
      ko r = seikou(50);
      ko rMod = r.map(x => x * 2);
      ko hasilUnwrap = rMod.unwrap();

      ko o = aru("WibuScript");
      ko hasilOpt = o.unwrapOr("Kosong");

      ko statusHasil = sho (rMod) {
        baa "ok": { kae "SUKSES_HASIL"; }
        baa "error": { kae "GAGAL_HASIL"; }
      };

      ko statusOpt = sho (o) {
        baa "some": { kae "SUKSES_OPSIONAL"; }
        baa "none": { kae "GAGAL_OPSIONAL"; }
      };
    `;

    const codeWibu = `
      iniDesu r = seikou(50);
      iniDesu rMod = r.map(x => x * 2);
      iniDesu hasilUnwrap = rMod.unwrap();

      iniDesu o = aru("WibuScript");
      iniDesu hasilOpt = o.unwrapOr("Kosong");

      iniDesu statusHasil = cocokkan (rMod) {
        kaloPas "ok": { haiBeri "SUKSES_HASIL"; }
        kaloPas "error": { haiBeri "GAGAL_HASIL"; }
      };

      iniDesu statusOpt = cocokkan (o) {
        kaloPas "some": { haiBeri "SUKSES_OPSIONAL"; }
        kaloPas "none": { haiBeri "GAGAL_OPSIONAL"; }
      };
    `;

    const codeRongawi = `
      pokmipokmi r = seikou(50);
      pokmipokmi rMod = r.map(x => x * 2);
      pokmipokmi hasilUnwrap = rMod.unwrap();

      pokmipokmi o = aru("WibuScript");
      pokmipokmi hasilOpt = o.unwrapOr("Kosong");

      pokmipokmi statusHasil = persimpangan (rMod) {
        kenaben "ok": { kandabahlil "SUKSES_HASIL"; }
        kenaben "error": { kandabahlil "GAGAL_HASIL"; }
      };

      pokmipokmi statusOpt = persimpangan (o) {
        kenaben "some": { kandabahlil "SUKSES_OPSIONAL"; }
        kenaben "none": { kandabahlil "GAGAL_OPSIONAL"; }
      };
    `;

    it("menghasilkan struktur AST yang 100% identik di seluruh 4 dialek", () => {
      const astMurni = parseCode(codeMurni);
      const astSingkat = parseCode(codeSingkat);
      const astWibu = parseCode(codeWibu);
      const astRongawi = parseCode(codeRongawi);

      expect(astSingkat).toEqual(astMurni);
      expect(astWibu).toEqual(astMurni);
      expect(astRongawi).toEqual(astMurni);
    });

    it("menghasilkan eksekusi nilai yang 100% identik di seluruh 4 dialek", async () => {
      const sandbox = new WibuSandbox({ timeoutMs: 3000 });

      const resMurni = await sandbox.execute(
        `${codeMurni}\nmite(hasilUnwrap);\nmite(hasilOpt);\nmite(statusHasil);\nmite(statusOpt);`
      );
      const resSingkat = await sandbox.execute(
        `${codeSingkat}\nmi(hasilUnwrap);\nmi(hasilOpt);\nmi(statusHasil);\nmi(statusOpt);`
      );
      const resWibu = await sandbox.execute(
        `${codeWibu}\niuYo(hasilUnwrap);\niuYo(hasilOpt);\niuYo(statusHasil);\niuYo(statusOpt);`
      );
      const resRongawi = await sandbox.execute(
        `${codeRongawi}\nsalamkenal(hasilUnwrap);\nsalamkenal(hasilOpt);\nsalamkenal(statusHasil);\nsalamkenal(statusOpt);`
      );

      expect(resMurni.success).toBe(true);
      expect(resSingkat.success).toBe(true);
      expect(resWibu.success).toBe(true);
      expect(resRongawi.success).toBe(true);

      const expectedOutput = ["100", "WibuScript", "SUKSES_HASIL", "SUKSES_OPSIONAL"];
      expect(resMurni.output).toEqual(expectedOutput);
      expect(resSingkat.output).toEqual(expectedOutput);
      expect(resWibu.output).toEqual(expectedOutput);
      expect(resRongawi.output).toEqual(expectedOutput);
    });
  });

  // --------------------------------------------------------------------------
  // PENGUJIAN SOURCE MAP v3 & PROTEKSI SANDBOX
  // --------------------------------------------------------------------------
  describe("Source Map v3 & Proteksi Keamanan Sandbox", () => {
    it("menghasilkan Source Map v3 yang valid dan dapat diurai", () => {
      const wibuCode = `
        kore a = 10;
        kore b = 20;
        kore total = a + b;
      `;
      const result = transpileWithSourceMap(wibuCode, "uji_map.wibu");
      expect(result.map).toBeDefined();
      const map = result.map!;
      expect(map.version).toBe(3);
      expect(map.file).toBe("uji_map.js");
      expect(map.sources).toEqual(["uji_map.wibu"]);
      expect(typeof map.mappings).toBe("string");
      expect(result.inlineSourceMap).toContain("data:application/json;charset=utf-8;base64,");
    });

    it("menghentikan perulangan tak terbatas (infinite loop) sesuai batas waktu timeout", async () => {
      const loopCode = `
        kore i = 0;
        zutto (hontou) {
          i = i + 1;
        }
      `;
      const result = await runInSandbox(loopCode, { timeoutMs: 300 });
      expect(result.success).toBe(false);
      expect(result.error).toContain("batas waktu eksekusi (300 ms) terlampaui");
    });

    it("menerapkan default-deny terhadap modul berbahaya di dalam sandbox", async () => {
      const maliciousCode = `
        kokoromi {
          kore fs = require("fs");
        } yurusu (e) {
          mite("DITOLAK_DENGAN_AMAN");
        }
      `;
      const js = transpileToJS(maliciousCode);
      const result = await runInSandbox(js);
      expect(result.output).toContain("DITOLAK_DENGAN_AMAN");
    });
  });
});
