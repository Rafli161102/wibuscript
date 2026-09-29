import { describe, it, expect } from "vitest";
import { runWibuScriptAsync, transpileToJS } from "../src/index";

describe("WibuScript v2.3.0 - Prioritas 2: Tipe Data Modern (Hasil & Opsional)", () => {
  describe("1. Hasil<T,E> (Result Type)", () => {
    it("dapat membuat Hasil berhasil (Ok) dan membuka nilainya dengan unwrap", async () => {
      const code = `
        kore res = seikou(42);
        kuchiMite(res.isOk);
        kuchiMite(res.isError);
        kuchiMite(res.unwrap());
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["true", "false", "42"]);
    });

    it("dapat membuat Hasil gagal (Error) dan menyediakan nilai cadangan via unwrapOr", async () => {
      const code = `
        kore res = shippai("koneksi terputus");
        kuchiMite(res.isOk);
        kuchiMite(res.isError);
        kuchiMite(res.unwrapOr("nilai cadangan"));
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["false", "true", "nilai cadangan"]);
    });

    it("melempar runtime error jika unwrap dipanggil pada Hasil yang gagal (Error)", async () => {
      const code = `
        kore res = shippai("galat fatal");
        res.unwrap();
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Gagal membuka Hasil (Result is Error): galat fatal");
    });

    it("mendukung transformasi nilai via map pada Hasil yang berhasil", async () => {
      const code = `
        kore res = seikou(10).map(x => x * 3);
        kuchiMite(res.unwrap());
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["30"]);
    });

    it("tidak menjalankan callback map jika Hasil berstatus gagal (Error)", async () => {
      const code = `
        kore res = shippai("gagal").map(x => x * 3);
        kuchiMite(res.isError);
        kuchiMite(res.unwrapOr("tetap gagal"));
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["true", "tetap gagal"]);
    });

    it("mendukung perantaian andThen (monadic bind / flatMap)", async () => {
      const code = `
        kore validasiGenap = x => {
          moshi (x % 2 == 0) {
            kaesu seikou(x / 2);
          } hoka {
            kaesu shippai("Harus angka genap");
          }
        };

        kore resSukses = seikou(20).andThen(validasiGenap);
        kuchiMite(resSukses.unwrap());

        kore resGagal = seikou(21).andThen(validasiGenap);
        kuchiMite(resGagal.unwrapOr("Gagal Validasi"));
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["10", "Gagal Validasi"]);
    });
  });

  describe("2. Opsional<T> (Option Type)", () => {
    it("dapat membuat Opsional berisi (Some) dan membuka nilainya", async () => {
      const code = `
        kore opt = aru("WibuScript Modern");
        kuchiMite(opt.isSome);
        kuchiMite(opt.isNone);
        kuchiMite(opt.unwrap());
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["true", "false", "WibuScript Modern"]);
    });

    it("dapat membuat Opsional kosong (None) dan membuka nilai cadangan via unwrapOr", async () => {
      const code = `
        kore opt = nai();
        kuchiMite(opt.isSome);
        kuchiMite(opt.isNone);
        kuchiMite(opt.unwrapOr("bawaan"));
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["false", "true", "bawaan"]);
    });

    it("melempar runtime error jika unwrap dipanggil pada Opsional kosong (None)", async () => {
      const code = `
        kore opt = nai();
        opt.unwrap();
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Gagal membuka Opsional (Option is None)");
    });

    it("mendukung transformasi map dan perantaian andThen pada Opsional", async () => {
      const code = `
        kore opt1 = aru(5).map(x => x + 10);
        kuchiMite(opt1.unwrap());

        kore opt2 = opt1.andThen(x => aru(x * 2));
        kuchiMite(opt2.unwrap());

        kore opt3 = opt2.andThen(x => nai());
        kuchiMite(opt3.unwrapOr("Hasil None"));
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["15", "30", "Hasil None"]);
    });
  });

  describe("3. Integrasi Pattern Matching (shougo)", () => {
    it("dapat mencocokkan Hasil langsung dengan string tag (ok / error)", async () => {
      const code = `
        kore r1 = seikou("Data Berhasil");
        kore r2 = shippai("Koneksi Error");

        shougo (r1) {
          baai "ok": {
            kuchiMite("Hasil 1 OK");
          }
          baai "error": {
            kuchiMite("Hasil 1 Error");
          }
        }

        shougo (r2) {
          baai "ok": {
            kuchiMite("Hasil 2 OK");
          }
          baai "error": {
            kuchiMite("Hasil 2 Error");
          }
        }
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["Hasil 1 OK", "Hasil 2 Error"]);
    });

    it("dapat mencocokkan Opsional langsung dengan string tag (some / none)", async () => {
      const code = `
        kore o1 = aru(99);
        kore o2 = nai();

        shougo (o1) {
          baai "some": {
            kuchiMite("Ada 1");
          }
          baai "none": {
            kuchiMite("Kosong 1");
          }
        }

        shougo (o2) {
          baai "some": {
            kuchiMite("Ada 2");
          }
          baai "none": {
            kuchiMite("Kosong 2");
          }
        }
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["Ada 1", "Kosong 2"]);
    });

    it("dapat mencocokkan langsung menggunakan simbol fungsi konstruktor", async () => {
      const code = `
        kore r = seikou("Berhasil");
        kore o = nai();

        shougo (r) {
          baai seikou: {
            kuchiMite("Cocok Seikou");
          }
          baai shippai: {
            kuchiMite("Cocok Shippai");
          }
        }

        shougo (o) {
          baai aru: {
            kuchiMite("Cocok Aru");
          }
          baai nai: {
            kuchiMite("Cocok Nai");
          }
        }
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["Cocok Seikou", "Cocok Nai"]);
    });
  });

  describe("4. Kesetaraan Gaya Bahasa di 4 Dialek Mutlak", () => {
    it("Dialek 1: Jepang Murni (seikou, shippai, aru, nai, hiraku, utsusu, tsugiSuru)", async () => {
      const code = `
        kore res = seikou(10).utsusu(x => x + 5);
        kore opt = aru("Murni").tsugiSuru(x => aru(x + " Desu"));
        kuchiMite(res.hiraku());
        kuchiMite(opt.hiraku());
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["15", "Murni Desu"]);
    });

    it("Dialek 2: Jepang Singkat (sei, sip, ar, na, hira, utu, tsuSuru)", async () => {
      const code = `
        ko res = sei(10).utu(x => x + 5);
        ko opt = ar("Singkat").tsuSuru(x => ar(x + " Desu"));
        km(res.hira());
        km(opt.hira());
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["15", "Singkat Desu"]);
    });

    it("Dialek 3: Wibu Absurd (hokiBanh, zonkBanh, adaBanh, gaadaBanh, bukaBanh, henshinSuru, lanjutBanh)", async () => {
      const code = `
        iniDesu res = hokiBanh(10).henshinSuru(x => x + 5);
        iniDesu opt = adaBanh("Wibu").lanjutBanh(x => adaBanh(x + " Desu"));
        omaeWaIu(res.bukaBanh());
        omaeWaIu(opt.bukaBanh());
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["15", "Wibu Desu"]);
    });

    it("Dialek 4: Meme Rongawi (menyalaAbangku, rugidong, adamas, habismas, jebolmas, predikbola, gaspolmas)", async () => {
      const code = `
        pokmipokmi res = menyalaAbangku(10).predikbola(x => x + 5);
        pokmipokmi opt = adamas("Rongawi").gaspolmas(x => adamas(x + " Desu"));
        cawapresin(res.jebolmas());
        cawapresin(opt.jebolmas());
      `;
      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["15", "Rongawi Desu"]);
    });
  });

  describe("5. Transpilasi JavaScript ES2022 untuk Hasil & Opsional", () => {
    it("menghasilkan kode ES2022 yang valid dan mengeksekusi metode dengan benar", () => {
      const code = `
        kore r = seikou(7).map(x => x * 7);
        kore o = aru(100);
        kuchiMite(r.unwrap());
        kuchiMite(o.unwrap());
      `;
      const js = transpileToJS(code);
      expect(js).toContain("__ok(7)");
      expect(js).toContain("__some(100)");
      expect(js).toContain(".map(");
    });

    it("menghasilkan pattern matching transpilasi dengan __matchVal", () => {
      const code = `
        kore r = seikou(1);
        shougo (r) {
          baai seikou: {
            mite("OK");
          }
          hyoujun: {
            mite("LAIN");
          }
        }
      `;
      const js = transpileToJS(code);
      expect(js).toContain("switch (__matchVal(r))");
      expect(js).toContain("case __matchVal(__ok):");
    });
  });
});
