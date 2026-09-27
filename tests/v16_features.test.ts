import { describe, it, expect } from "vitest";
import {
  tokenize,
  Parser,
  evaluate,
  createGlobalEnvironment,
  unwrapSignal,
  convertDialect,
  transpileToJS,
} from "../src/index";
import type {
  NumberValue,
  StringValue,
  BooleanValue,
  ArrayValue,
  RuntimeValue,
} from "../src/runtime";

async function runCode(source: string, env = createGlobalEnvironment()): Promise<{ result: RuntimeValue; logs: string[] }> {
  const logs: string[] = [];
  const testEnv = createGlobalEnvironment({
    outputHandler: (msg) => logs.push(msg),
  });
  const tokens = tokenize(source);
  const parser = new Parser();
  const program = parser.produceAST(tokens);
  const result = unwrapSignal(await evaluate(program, testEnv));
  return { result, logs };
}

describe("WibuScript v1.6.0 Feature Expansion", () => {
  describe("Perulangan Iterasi Koleksi (subete / For-In Loop)", () => {
    it("harus mengiterasi array menggunakan dialek Jepang Murni (subete ... no)", async () => {
      const code = `
        kore total = 0
        kore angka = [10, 20, 30]
        subete (x no angka) {
          total = total + x
        }
        kaesu total
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(60);
    });

    it("harus mengiterasi array menggunakan dialek Jepang Singkat (sube ... no)", async () => {
      const code = `
        ko total = 0
        ko daftar = [1, 2, 3, 4]
        sube (n no daftar) {
          total = total + n
        }
        kae total
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(10);
    });

    it("harus mengiterasi array menggunakan dialek Wibu Absurd (sikatSemua ... dari)", async () => {
      const code = `
        siImut hasil = ""
        siImut karakter = ["Aqua", "Megumin", "Darkness"]
        sikatSemua (k dari karakter) {
          hasil = hasil + k + ";"
        }
        kasihPaham hasil
      `;
      const { result } = await runCode(code);
      expect((result as StringValue).value).toBe("Aqua;Megumin;Darkness;");
    });

    it("harus mengiterasi array menggunakan dialek Meme Rongawi (thugshaker ... alasdaun)", async () => {
      const code = `
        pokmipokmi jml = 0
        pokmipokmi list = [5, 15, 25]
        thugshaker (v alasdaun list) {
          jml = jml + v
        }
        kandabahlil jml
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(45);
    });

    it("harus mendukung penghentian perulangan (break / yame) di dalam subete", async () => {
      const code = `
        kore jumlah = 0
        kore data = [10, 20, 30, 40]
        subete (x no data) {
          moshi (x == 30) {
            yame
          }
          jumlah = jumlah + x
        }
        kaesu jumlah
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(30);
    });

    it("harus mendukung peloncatan iterasi (continue / tsugi) di dalam subete", async () => {
      const code = `
        kore total = 0
        kore data = [1, 2, 3, 4, 5]
        subete (x no data) {
          moshi (x == 3) {
            tsugi
          }
          total = total + x
        }
        kaesu total
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(12);
    });

    it("harus mendukung iterasi karakter string dengan subete", async () => {
      const code = `
        kore gabung = ""
        subete (huruf no "WIBU") {
          gabung = gabung + huruf + "-"
        }
        kaesu gabung
      `;
      const { result } = await runCode(code);
      expect((result as StringValue).value).toBe("W-I-B-U-");
    });
  });

  describe("Fungsi Lambda / Arrow Function (=>)", () => {
    it("harus mengeksekusi lambda satu parameter tanpa tanda kurung: x => expr", async () => {
      const code = `
        kore kuadrat = x => x * x
        kaesu kuadrat(7)
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(49);
    });

    it("harus mengeksekusi lambda banyak parameter dengan tanda kurung: (a, b) => expr", async () => {
      const code = `
        kore tambah = (a, b) => a + b
        kaesu tambah(15, 25)
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(40);
    });

    it("harus mengeksekusi lambda tanpa parameter: () => expr", async () => {
      const code = `
        kore getAngka = () => 999
        kaesu getAngka()
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(999);
    });

    it("harus mendukung lambda dengan blok kurung kurawal { ... }", async () => {
      const code = `
        kore kalkulasi = (x, y) => {
          kore temp = x * 2
          kaesu temp + y
        }
        kaesu kalkulasi(5, 3)
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(13);
    });

    it("harus dapat dipanggil langsung secara instan (IIFE): ((x) => x * 10)(4)", async () => {
      const code = `
        kore hasil = ((x) => x * 10)(4)
        kaesu hasil
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(40);
    });

    it("harus bekerja mulus sebagai callback fungsi tingkat tinggi utsusu (map)", async () => {
      const code = `
        kore angka = [1, 2, 3, 4]
        kore hasil = utsusu(angka, x => x * 2)
        kaesu hasil[2]
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(6);
    });

    it("harus bekerja mulus sebagai callback fungsi tingkat tinggi erabu (filter)", async () => {
      const code = `
        kore angka = [10, 25, 30, 45, 50]
        kore tersaring = erabu(angka, x => x > 25)
        kaesu nagasa(tersaring)
      `;
      const { result } = await runCode(code);
      expect((result as NumberValue).value).toBe(3);
    });

    it("harus bekerja mulus sebagai callback fungsi mitsukeru (find)", async () => {
      const code = `
        kore hero = ["Megumin", "Aqua", "Kazuma"]
        kore ketemu = mitsukeru(hero, h => h == "Aqua")
        kaesu ketemu
      `;
      const { result } = await runCode(code);
      expect((result as StringValue).value).toBe("Aqua");
    });
  });

  describe("Pustaka Standar Baru (Standard Library v1.6.0)", () => {
    it("harus memecah string menjadi array dengan bunri / bu / pecahKata / pecahkepala", async () => {
      const code1 = `kaesu bunri("apel,jeruk,mangga", ",")[1]`;
      const { result: res1 } = await runCode(code1);
      expect((res1 as StringValue).value).toBe("jeruk");

      const code2 = `kaesu bu("1-2-3", "-")[0]`;
      const { result: res2 } = await runCode(code2);
      expect((res2 as StringValue).value).toBe("1");

      const code3 = `kaesu pecahKata("wibu script", " ")[1]`;
      const { result: res3 } = await runCode(code3);
      expect((res3 as StringValue).value).toBe("script");
    });

    it("harus menggabungkan array menjadi string dengan tsunagu / tsuna / lemKata / lendirmurni", async () => {
      const code1 = `kaesu tsunagu(["Konosuba", "ReZero", "Overlord"], " | ")`;
      const { result: res1 } = await runCode(code1);
      expect((res1 as StringValue).value).toBe("Konosuba | ReZero | Overlord");

      const code2 = `kaesu tsuna(["A", "B", "C"], "")`;
      const { result: res2 } = await runCode(code2);
      expect((res2 as StringValue).value).toBe("ABC");

      const code3 = `kaesu lemKata(["1", "2"], "-")`;
      const { result: res3 } = await runCode(code3);
      expect((res3 as StringValue).value).toBe("1-2");
    });

    it("harus mengganti substring dengan okikae / oki / sulapKata / akuntumbal", async () => {
      const code1 = `kaesu okikae("baka anime baka", "baka", "sugoi")`;
      const { result: res1 } = await runCode(code1);
      expect((res1 as StringValue).value).toBe("sugoi anime sugoi");

      const code2 = `kaesu oki("halo dunia", "dunia", "isekai")`;
      const { result: res2 } = await runCode(code2);
      expect((res2 as StringValue).value).toBe("halo isekai");
    });

    it("harus memangkas spasi dengan kiri / kri / pangkas / cukurfade", async () => {
      const code1 = `kaesu kiri("   halo wibu   ")`;
      const { result: res1 } = await runCode(code1);
      expect((res1 as StringValue).value).toBe("halo wibu");

      const code2 = `kaesu kri("  senpai  ")`;
      const { result: res2 } = await runCode(code2);
      expect((res2 as StringValue).value).toBe("senpai");
    });

    it("harus memeriksa keberadaan elemen dengan fukumu / fuku / punyaGak / monyetijo", async () => {
      const codeArr = `kaesu fukumu(["Naruto", "Sasuke"], "Sasuke")`;
      const { result: resArr } = await runCode(codeArr);
      expect((resArr as BooleanValue).value).toBe(true);

      const codeStr = `kaesu fuku("WibuScript Mantap", "Script")`;
      const { result: resStr } = await runCode(codeStr);
      expect((resStr as BooleanValue).value).toBe(true);

      const codeFalse = `kaesu punyaGak([1, 2, 3], 99)`;
      const { result: resFalse } = await runCode(codeFalse);
      expect((resFalse as BooleanValue).value).toBe(false);
    });

    it("harus mengurutkan array dengan narabikae / nara / rapihin / goyangpantat", async () => {
      const codeAsc = `
        kore angka = [40, 10, 30, 20]
        kore rapi = narabikae(angka)
        kaesu rapi[0]
      `;
      const { result: resAsc } = await runCode(codeAsc);
      expect((resAsc as NumberValue).value).toBe(10);

      // Custom comparator menurun
      const codeDesc = `
        kore angka = [5, 20, 15]
        kore turun = narabikae(angka, (a, b) => b - a)
        kaesu turun[0]
      `;
      const { result: resDesc } = await runCode(codeDesc);
      expect((resDesc as NumberValue).value).toBe(20);
    });

    it("harus memotong sebagian array/string dengan kirinuki / kinu / potongSebagian / pedangdaging", async () => {
      const codeArr = `
        kore item = ["A", "B", "C", "D"]
        kore irisan = kirinuki(item, 1, 3)
        kaesu nagasa(irisan)
      `;
      const { result: resArr } = await runCode(codeArr);
      expect((resArr as NumberValue).value).toBe(2);

      const codeStr = `kaesu kinu("Kamehameha", 0, 4)`;
      const { result: resStr } = await runCode(codeStr);
      expect((resStr as StringValue).value).toBe("Kame");
    });

    it("harus mengeksekusi gacha item berbobot (weighted RNG)", async () => {
      // Bobot 100% pada SSR menjamin hasilnya selalu SSR
      const code = `
        kore hadiah = gacha(["SSR", "SR", "R"], [100, 0, 0])
        kaesu hadiah
      `;
      const { result } = await runCode(code);
      expect((result as StringValue).value).toBe("SSR");
    });
  });

  describe("Dialect Auto-Converter & JS Transpiler v1.6.0", () => {
    it("harus mengonversi perulangan subete dan pustaka baru antar 4 dialek", () => {
      const murniCode = `
        subete (item no daftar) {
          kore kata = bunri(item, ",")
          kore rapi = kiri(item)
        }
      `;
      const wibuCode = convertDialect(murniCode, "wibu");
      expect(wibuCode).toContain("zenbuNe");
      expect(wibuCode).toContain("dari");
      expect(wibuCode).toContain("barabara");
      expect(wibuCode).toContain("kireeNi");

      const rongawiCode = convertDialect(wibuCode, "rongawi");
      expect(rongawiCode).toContain("thugshaker");
      expect(rongawiCode).toContain("alasdaun");
      expect(rongawiCode).toContain("pecahkepala");
      expect(rongawiCode).toContain("cukurfade");
    });

    it("harus mentranspilasi subete, lambda arrow, dan stdlib baru ke JavaScript", () => {
      const source = `
        kore list = [1, 2, 3]
        subete (x no list) {
          mite(x)
        }
        kore fn = (a, b) => a + b
        kore kata = bunri("a,b", ",")
      `;
      const js = transpileToJS(source);
      expect(js).toContain("for (const x of list)");
      expect(js).toContain("((a, b) => (a + b))");
      expect(js).toContain("__bunri(");
    });
  });
});
