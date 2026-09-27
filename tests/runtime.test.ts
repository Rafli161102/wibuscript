// File: tests/runtime.test.ts
import { describe, it, expect } from "vitest";
import {
  tokenize,
  Parser,
  evaluate,
  createGlobalEnvironment,
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
  describe("Deklarasi Variabel (koreWa vs kore)", () => {
    it("harus mendukung deklarasi variabel menggunakan koreWa (Ekstensi)", async () => {
      const result = (await runCode('koreWa nama = "Megumin"; nama;')) as StringValue;
      expect(result.type).toBe("string");
      expect(result.value).toBe("Megumin");
    });

    it("harus mendukung deklarasi variabel menggunakan kore (Shorthand)", async () => {
      const result = (await runCode("kore level = 99; level;")) as NumberValue;
      expect(result.type).toBe("number");
      expect(result.value).toBe(99);
    });

    it("harus mendukung nilai boolean (maji / majiBener dan uso / usoBanget)", async () => {
      const resultMaji = (await runCode("kore aktif = maji; aktif;")) as BooleanValue;
      expect(resultMaji.type).toBe("boolean");
      expect(resultMaji.value).toBe(true);

      const resultUso = (await runCode("kore aktif = uso; aktif;")) as BooleanValue;
      expect(resultUso.type).toBe("boolean");
      expect(resultUso.value).toBe(false);
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
  });
});
