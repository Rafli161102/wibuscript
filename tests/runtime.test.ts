// File: tests/runtime.test.ts
import { describe, it, expect } from "vitest";
import {
  tokenize,
  Parser,
  evaluate,
  createGlobalEnvironment,
  runWibuScriptAsync,
  unwrapSignal,
  type NumberValue,
  type StringValue,
  type BooleanValue,
} from "../src/index";

// Fungsi utilitas pembantu untuk mengevaluasi kode WibuScript dan mengembalikan RuntimeValue akhir
async function runCode(code: string) {
  const tokens = tokenize(code);
  const parser = new Parser();
  const program = parser.produceAST(tokens);
  const env = createGlobalEnvironment();
  const rawResult = await evaluate(program, env);
  return unwrapSignal(rawResult);
}

describe("WibuScript Runtime & Evaluator Test Suite", () => {
  describe("Deklarasi Variabel (Sistem 4 Dialek Mutlak)", () => {
    it("harus mendukung deklarasi variabel menggunakan 4 dialek (kore, ko, siImut, pokmipokmi)", async () => {
      const resultMurni = (await runCode('kore nama = "Megumin"; nama;')) as StringValue;
      expect(resultMurni.type).toBe("string");
      expect(resultMurni.value).toBe("Megumin");

      const resultSingkat = (await runCode("ko level = 99; level;")) as NumberValue;
      expect(resultSingkat.type).toBe("number");
      expect(resultSingkat.value).toBe(99);

      const resultWibu = (await runCode('siImut waifu = "Aqua"; waifu;')) as StringValue;
      expect(resultWibu.type).toBe("string");
      expect(resultWibu.value).toBe("Aqua");

      const resultRongawi = (await runCode("pokmipokmi saldo = 500; saldo;")) as NumberValue;
      expect(resultRongawi.type).toBe("number");
      expect(resultRongawi.value).toBe(500);
    });

    it("harus mendukung nilai boolean (hontou / hon / menyalaAbkuh dan uso / ladehBanh)", async () => {
      const resultHontou = (await runCode("kore aktif = hontou; aktif;")) as BooleanValue;
      expect(resultHontou.type).toBe("boolean");
      expect(resultHontou.value).toBe(true);

      const resultHon = (await runCode("ko aktif = hon; aktif;")) as BooleanValue;
      expect(resultHon.type).toBe("boolean");
      expect(resultHon.value).toBe(true);

      const resultUso = (await runCode("kore aktif = uso; aktif;")) as BooleanValue;
      expect(resultUso.type).toBe("boolean");
      expect(resultUso.value).toBe(false);

      const resultLadeh = (await runCode("siImut aktif = ladehBanh; aktif;")) as BooleanValue;
      expect(resultLadeh.type).toBe("boolean");
      expect(resultLadeh.value).toBe(false);
    });
  });

  describe("Operasi Matematika Standar", () => {
    it("harus mengeksekusi operasi penambahan (+)", async () => {
      const result = (await runCode("15 + 27;")) as NumberValue;
      expect(result.type).toBe("number");
      expect(result.value).toBe(42);
    });

    it("harus mengeksekusi operasi pengurangan (-)", async () => {
      const result = (await runCode("50 - 18;")) as NumberValue;
      expect(result.type).toBe("number");
      expect(result.value).toBe(32);
    });

    it("harus mengeksekusi operasi perkalian (*)", async () => {
      const result = (await runCode("7 * 8;")) as NumberValue;
      expect(result.type).toBe("number");
      expect(result.value).toBe(56);
    });

    it("harus mengeksekusi operasi pembagian (/)", async () => {
      const result = (await runCode("100 / 4;")) as NumberValue;
      expect(result.type).toBe("number");
      expect(result.value).toBe(25);
    });
  });

  describe("Pustaka Standar (Sistem Alias Ganda)", () => {
    it("harus menghitung panjang karakter dengan nagasa (Shorthand) dan tolongCekNagasa (Ekstensi)", async () => {
      const resultShorthand = (await runCode('nagasa("WibuScript");')) as NumberValue;
      expect(resultShorthand.type).toBe("number");
      expect(resultShorthand.value).toBe(10);

      const resultEkstensi = (await runCode('tolongCekNagasa("WibuScript");')) as NumberValue;
      expect(resultEkstensi.type).toBe("number");
      expect(resultEkstensi.value).toBe(10);
    });

    it("harus mengonversi string menjadi angka dengan sujiNi (Shorthand) dan bikinJadiSuji (Ekstensi)", async () => {
      const resultShorthand = (await runCode('sujiNi("10");')) as NumberValue;
      expect(resultShorthand.type).toBe("number");
      expect(resultShorthand.value).toBe(10);

      const resultEkstensi = (await runCode('bikinJadiSuji("10");')) as NumberValue;
      expect(resultEkstensi.type).toBe("number");
      expect(resultEkstensi.value).toBe(10);
    });

    it("harus mendukung manipulasi string kapital (dekaku vs bikinGedeKore)", async () => {
      const resultShorthand = (await runCode('dekaku("anime");')) as StringValue;
      expect(resultShorthand.type).toBe("string");
      expect(resultShorthand.value).toBe("ANIME");

      const resultEkstensi = (await runCode('bikinGedeKore("anime");')) as StringValue;
      expect(resultEkstensi.type).toBe("string");
      expect(resultEkstensi.value).toBe("ANIME");
    });

    it("harus mendukung manipulasi string huruf kecil (chiisaku vs bikinKecilKore)", async () => {
      const resultShorthand = (await runCode('chiisaku("ISEKAI");')) as StringValue;
      expect(resultShorthand.type).toBe("string");
      expect(resultShorthand.value).toBe("isekai");

      const resultEkstensi = (await runCode('bikinKecilKore("ISEKAI");')) as StringValue;
      expect(resultEkstensi.type).toBe("string");
      expect(resultEkstensi.value).toBe("isekai");
    });

    it("harus mendukung perhitungan pangkat matematika (beki vs kalkulasiPangkatSuji)", async () => {
      const resultShorthand = (await runCode("beki(2, 3);")) as NumberValue;
      expect(resultShorthand.type).toBe("number");
      expect(resultShorthand.value).toBe(8);

      const resultEkstensi = (await runCode("kalkulasiPangkatSuji(2, 3);")) as NumberValue;
      expect(resultEkstensi.type).toBe("number");
      expect(resultEkstensi.value).toBe(8);
    });

    it("harus memeriksa tipe data runtime (shurui vs apaTipeKoreWa)", async () => {
      const resultShorthand = (await runCode("shurui(42);")) as StringValue;
      expect(resultShorthand.value).toBe("angka");

      const resultEkstensi = (await runCode('apaTipeKoreWa("teks");')) as StringValue;
      expect(resultEkstensi.value).toBe("teks");
    });

    it("harus mendukung waktu sistem (imaJikan vs waktuSekarang)", async () => {
      const resultShorthand = (await runCode("imaJikan();")) as StringValue;
      expect(resultShorthand.type).toBe("string");
      expect(resultShorthand.value.length).toBeGreaterThan(0);

      const resultEkstensi = (await runCode("waktuSekarang();")) as StringValue;
      expect(resultEkstensi.type).toBe("string");
      expect(resultEkstensi.value.length).toBeGreaterThan(0);
    });
  });

  describe("Keamanan Bahasa & Batasan Runtime (Security Safeguards)", () => {
    it("harus membatasi infinite loop dengan batas iterasi perulangan (maxLoopIterations)", async () => {
      const code = `
        kore i = 0
        zutto (hontou) {
          i = i + 1
        }
      `;
      const env = createGlobalEnvironment({ maxLoopIterations: 50 });
      const tokens = tokenize(code);
      const parser = new Parser();
      const program = parser.produceAST(tokens);

      await expect(evaluate(program, env)).rejects.toThrow(
        /Batas iterasi perulangan terlampaui \(50 putaran\)/
      );
    });

    it("harus membatasi for-each loop jika iterasi melebihi batas", async () => {
      const code = `
        kore daftar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        subete (x no daftar) {
          // iterasi
        }
      `;
      const env = createGlobalEnvironment({ maxLoopIterations: 5 });
      const tokens = tokenize(code);
      const parser = new Parser();
      const program = parser.produceAST(tokens);

      await expect(evaluate(program, env)).rejects.toThrow(
        /Batas iterasi perulangan terlampaui \(5 putaran\)/
      );
    });

    it("harus melindungi browser dari stack overflow melalui maxCallStackDepth", async () => {
      const code = `
        jutsu rekursiTanpaHenti() {
          kaesu rekursiTanpaHenti()
        }
        rekursiTanpaHenti()
      `;
      const env = createGlobalEnvironment({ maxCallStackDepth: 15 });
      const tokens = tokenize(code);
      const parser = new Parser();
      const program = parser.produceAST(tokens);

      await expect(evaluate(program, env)).rejects.toThrow(
        /Batas kedalaman tumpukan panggilan \(15\) terlampaui/
      );
    });

    it("harus menghentikan eksekusi jika batas waktu (timeoutMs) terlampaui", async () => {
      const code = `
        kore i = 0
        zutto (i < 100000) {
          i = i + 1
        }
      `;
      // Timeout sangat singkat (5ms)
      const env = createGlobalEnvironment({ timeoutMs: 5 });
      const tokens = tokenize(code);
      const parser = new Parser();
      const program = parser.produceAST(tokens);

      await expect(evaluate(program, env)).rejects.toThrow(
        /Batas waktu eksekusi \(5ms\) terlampaui/
      );
    });

    it("harus merespons pembatalan pengguna (isCancelledRef)", async () => {
      const cancelToken = { current: false };
      const code = `
        kore i = 0
        zutto (i < 100) {
          i = i + 1
          moshi (i == 10) {
            // batalkan
          }
        }
      `;
      // Simulasi token diaktifkan
      cancelToken.current = true;
      const env = createGlobalEnvironment({ isCancelledRef: cancelToken });
      const tokens = tokenize(code);
      const parser = new Parser();
      const program = parser.produceAST(tokens);

      await expect(evaluate(program, env)).rejects.toThrow(
        /Eksekusi dihentikan oleh pengguna/
      );
    });

    it("runWibuScriptAsync harus menangkap galat keamanan dan mengembalikan objek error dengan aman", async () => {
      const code = `
        zutto (hontou) {}
      `;
      const result = await runWibuScriptAsync(code, { maxLoopIterations: 20 });
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Batas iterasi perulangan terlampaui (20 putaran)");
    });
  });
});
