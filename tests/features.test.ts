// File: tests/features.test.ts
import { describe, it, expect } from "vitest";
import {
  tokenize,
  Parser,
  evaluate,
  createGlobalEnvironment,
  unwrapSignal,
  convertDialect,
  transpileToJS,
  type NumberValue,
  type StringValue,
  type BooleanValue,
  type ArrayValue,
  type ObjectValue,
} from "../src/index";

async function runCode(code: string) {
  const tokens = tokenize(code);
  const parser = new Parser();
  const program = parser.produceAST(tokens);
  const env = createGlobalEnvironment();
  const rawResult = await evaluate(program, env);
  return unwrapSignal(rawResult);
}

describe("WibuScript Fitur Baru & Rekomendasi Lengkap", () => {
  describe("Array Literals & Indexing", () => {
    it("harus membuat literal array dan mengakses indeks dengan kurung siku []", async () => {
      const result = (await runCode(`
        kore daftar = [10, 20, 30];
        daftar[1];
      `)) as NumberValue;
      expect(result.type).toBe("number");
      expect(result.value).toBe(20);
    });

    it("harus mendukung manipulasi nilai elemen array melalui penugasan indeks", async () => {
      const result = (await runCode(`
        kore angka = [1, 2, 3];
        angka[0] = 99;
        angka[0];
      `)) as NumberValue;
      expect(result.type).toBe("number");
      expect(result.value).toBe(99);
    });

    it("harus mendukung akses karakter string dengan indeks []", async () => {
      const result = (await runCode(`
        kore kata = "Wibu";
        kata[0];
      `)) as StringValue;
      expect(result.type).toBe("string");
      expect(result.value).toBe("W");
    });

    it("harus mendukung akses properti objek dengan bracket dinamis obj[kunci]", async () => {
      const result = (await runCode(`
        kore waifu = { nama: "Megumin", elemen: "Explosion" };
        kore prop = "elemen";
        waifu[prop];
      `)) as StringValue;
      expect(result.type).toBe("string");
      expect(result.value).toBe("Explosion");
    });
  });

  describe("Operator Logika (&&, ||, !) & Uner (-)", () => {
    it("harus mengevaluasi operator AND (&&)", async () => {
      const result1 = (await runCode("hontou && hontou;")) as BooleanValue;
      expect(result1.value).toBe(true);

      const result2 = (await runCode("hontou && uso;")) as BooleanValue;
      expect(result2.value).toBe(false);
    });

    it("harus mengevaluasi operator OR (||)", async () => {
      const result1 = (await runCode("uso || hontou;")) as BooleanValue;
      expect(result1.value).toBe(true);

      const result2 = (await runCode("uso || uso;")) as BooleanValue;
      expect(result2.value).toBe(false);
    });

    it("harus mengevaluasi operator NOT (!) dan unary minus (-)", async () => {
      const notUso = (await runCode("!uso;")) as BooleanValue;
      expect(notUso.value).toBe(true);

      const notHon = (await runCode("!hontou;")) as BooleanValue;
      expect(notHon.value).toBe(false);

      const minusVal = (await runCode("-42;")) as NumberValue;
      expect(minusVal.value).toBe(-42);
    });
  });

  describe("Template Literals / String Interpolation", () => {
    it("harus mendukung template literal dengan interpolasi ${...}", async () => {
      const result = (await runCode(`
        kore nama = "Aqua";
        kore level = 100;
        kore pesan = \`Halo \${nama}, kekuatanmu \${level}!\`;
        pesan;
      `)) as StringValue;
      expect(result.type).toBe("string");
      expect(result.value).toBe("Halo Aqua, kekuatanmu 100!");
    });

    it("harus mendukung template literal sederhana tanpa interpolasi", async () => {
      const result = (await runCode("`Teks biasa dalam backtick`;")) as StringValue;
      expect(result.type).toBe("string");
      expect(result.value).toBe("Teks biasa dalam backtick");
    });
  });

  describe("Try-Catch Statement (4 Dialek Mutlak)", () => {
    it("harus menangani galat pada dialek Jepang Murni (kokoromi ... yurusu)", async () => {
      const result = (await runCode(`
        kore status = "awal";
        kokoromi {
          10 / 0;
          status = "tidak sampai sini";
        } yurusu (err) {
          status = "tertangani";
        }
        status;
      `)) as StringValue;
      expect(result.value).toBe("tertangani");
    });

    it("harus menangani galat pada dialek Jepang Singkat (koko ... yuru)", async () => {
      const result = (await runCode(`
        ko status = "awal";
        koko {
          10 / 0;
        } yuru (e) {
          status = "aman";
        }
        status;
      `)) as StringValue;
      expect(result.value).toBe("aman");
    });

    it("harus menangani galat pada dialek Wibu Absurd (cobaDuluBanh ... santaiAja)", async () => {
      const result = (await runCode(`
        siImut hasil = "aman";
        cobaDuluBanh {
          10 / 0;
        } santaiAja (err) {
          hasil = "santai";
        }
        hasil;
      `)) as StringValue;
      expect(result.value).toBe("santai");
    });

    it("harus menangani galat pada dialek Meme Rongawi (ragnamok ... amanBos)", async () => {
      const result = (await runCode(`
        pokmipokmi hasil = "tes";
        ragnamok {
          10 / 0;
        } amanBos (err) {
          hasil = "selamet";
        }
        hasil;
      `)) as StringValue;
      expect(result.value).toBe("selamet");
    });
  });

  describe("Pustaka Standar Tambahan: JSON, Barisan, Matematika", () => {
    it("harus menguraikan JSON (kanjiNi) dan membungkus kembali (kanjiMojiretsu)", async () => {
      const result = (await runCode(`
        kore jsonTeks = "{\\"karakter\\": \\"Kazuma\\", \\"duit\\": 500}";
        kore data = kanjiNi(jsonTeks);
        kore nama = data.karakter;
        nama;
      `)) as StringValue;
      expect(result.value).toBe("Kazuma");

      const stringified = (await runCode(`
        kore obj = { kota: "Axel", rank: 1 };
        kanjiMojiretsu(obj);
      `)) as StringValue;
      expect(stringified.value).toContain('"kota":"Axel"');
    });

    it("harus memetakan elemen barisan dengan utsusu (map)", async () => {
      const result = (await runCode(`
        kore angka = [1, 2, 3];
        jutsu kaliDua(x) { kaesu x * 2; }
        kore hasil = utsusu(angka, kaliDua);
        hasil[2];
      `)) as NumberValue;
      expect(result.value).toBe(6);
    });

    it("harus menyaring elemen barisan dengan erabu (filter)", async () => {
      const result = (await runCode(`
        kore angka = [10, 25, 30, 5];
        jutsu lebihDariSepuluh(x) { kaesu x > 10; }
        kore hasil = erabu(angka, lebihDariSepuluh);
        nagasa(hasil);
      `)) as NumberValue;
      expect(result.value).toBe(2);
    });

    it("harus mencari elemen barisan dengan mitsukeru (find)", async () => {
      const result = (await runCode(`
        kore angka = [10, 25, 30];
        jutsu cariGenap(x) { kaesu x == 25; }
        mitsukeru(angka, cariGenap);
      `)) as NumberValue;
      expect(result.value).toBe(25);
    });

    it("harus melakukan perhitungan matematika (ruuto, zettaichi, kiriSute, kiriAge)", async () => {
      const sqrt = (await runCode("ruuto(49);")) as NumberValue;
      expect(sqrt.value).toBe(7);

      const abs = (await runCode("zettaichi(-99);")) as NumberValue;
      expect(abs.value).toBe(99);

      const floor = (await runCode("kiriSute(7.9);")) as NumberValue;
      expect(floor.value).toBe(7);

      const ceil = (await runCode("kiriAge(7.1);")) as NumberValue;
      expect(ceil.value).toBe(8);
    });
  });

  describe("Dialect Auto-Converter & JavaScript Transpiler", () => {
    it("harus mengonversi antar-dialek tanpa merusak string dan komentar", () => {
      const codeMurni = `
        // Komentar kore zettai
        kore waifu = "siImut Megumin";
        moshi (hontou) {
          mite(waifu);
        }
      `;
      const convertedRongawi = convertDialect(codeMurni, "rongawi");
      expect(convertedRongawi).toContain("pokmipokmi waifu =");
      expect(convertedRongawi).toContain('"siImut Megumin"'); // String tidak boleh berubah
      expect(convertedRongawi).toContain("// Komentar kore zettai"); // Komentar tidak boleh berubah
      expect(convertedRongawi).toContain("izintampil (unjukkebolehan)");
      expect(convertedRongawi).toContain("salamkenal(waifu)");

      const convertedSingkat = convertDialect(codeMurni, "singkat");
      expect(convertedSingkat).toContain("ko waifu =");
      expect(convertedSingkat).toContain("mo (hon)");
      expect(convertedSingkat).toContain("mi(waifu)");
    });

    it("harus mengompilasi WibuScript ke JavaScript yang valid", () => {
      const wibuCode = `
        kore a = 10;
        kore b = [1, 2, 3];
        moshi (a > 5) {
          mite(b[0]);
        }
      `;
      const js = transpileToJS(wibuCode);
      expect(js).toContain("let a = 10;");
      expect(js).toContain("let b = [1, 2, 3];");
      expect(js).toContain("if ((a > 5))");
      expect(js).toContain("console.log(b[0]);");
    });
  });
});

