// File: tests/v27_features.test.ts
// ============================================================================
// UJI OTOMATIS: WIBUSCRIPT v2.7.0 FITUR BARU & PENINGKATAN SISTEM
// - Dukungan Operasi Asinkronus: AwaitExpression (matte / mat / matteNe / admindatang)
// - Fungsi Tingkat Tinggi Barisan: tatamu (reduce) di 4 Dialek Mutlak
// - Pustaka Matematika Ekstensi: saishou (min) & saidai (max) di 4 Dialek Mutlak
// - Transpiler Web DOM & Generator Browser HTML
// - Kesetaraan Konversi 4 Dialek Mutlak (Dialect Converter Parity)
// ============================================================================

import { describe, it, expect } from "vitest";
import {
  tokenize,
  Parser,
  evaluate,
  createGlobalEnvironment,
  unwrapSignal,
  convertDialect,
  transpileToJS,
  transpileDOM,
  generateBrowserHTML,
  type NumberValue,
} from "../src/index";

async function runWibu(code: string, outputCapture?: string[]) {
  const tokens = tokenize(code);
  const parser = new Parser();
  const program = parser.produceAST(tokens);
  const env = createGlobalEnvironment((msg) => {
    if (outputCapture) outputCapture.push(msg);
  });
  return unwrapSignal(await evaluate(program, env));
}

describe("WibuScript v2.7.0 - AwaitExpression (matte / mat / matteNe / admindatang)", () => {
  it("Parser menghasilkan simpul AwaitExpression dengan tepat", () => {
    const code = "kore data = matte ambilData();";
    const tokens = tokenize(code);
    const parser = new Parser();
    const ast = parser.produceAST(tokens);

    expect(ast.body.length).toBe(1);
    const decl = ast.body[0] as any;
    expect(decl.kind).toBe("VariableDeclaration");
    expect(decl.value.kind).toBe("AwaitExpression");
    expect(decl.value.argument.kind).toBe("CallExpression");
  });

  it("Runtime mengevaluasi matte dengan operasi asinkronus", async () => {
    const out: string[] = [];
    const code = `
      jutsu jeda() {
        matte shibaraku(10);
        kaesu 42;
      }
      kore hasil = matte jeda();
      mite(hasil);
    `;
    await runWibu(code, out);
    expect(out).toEqual(["42"]);
  });

  it("Dukungan 4 dialek kata kunci await (matte, mat, matteNe, admindatang)", async () => {
    const out: string[] = [];
    const codeMurni = "kore a = matte shibaraku(5); mite(1);";
    const codeSingkat = "ko b = mat siba(5); mi(2);";
    const codeWibu = "iniDesu c = matteNe matteNeSikit(5); iuYo(3);";
    const codeRongawi = "pokmipokmi d = admindatang nungguinLu(5); salamkenal(4);";

    await runWibu(codeMurni, out);
    await runWibu(codeSingkat, out);
    await runWibu(codeWibu, out);
    await runWibu(codeRongawi, out);

    expect(out).toEqual(["1", "2", "3", "4"]);
  });

  it("Transpiler mengompilasi matte menjadi ekspresi await JavaScript", () => {
    const code = "kore resp = matte fetchApi();";
    const js = transpileToJS(code);
    expect(js).toContain("await fetchApi()");
  });
});

describe("WibuScript v2.7.0 - tatamu (reduce) di 4 Dialek Mutlak", () => {
  it("tatamu menjumlahkan elemen barisan dengan nilai awal", async () => {
    const out: string[] = [];
    const code = `
      kore angka = [1, 2, 3, 4, 5];
      kore total = tatamu(angka, (acc, n) => acc + n, 0);
      mite(total);
    `;
    await runWibu(code, out);
    expect(out).toEqual(["15"]);
  });

  it("tatamu menjumlahkan elemen barisan tanpa nilai awal", async () => {
    const out: string[] = [];
    const code = `
      kore angka = [10, 20, 30];
      kore total = tatamu(angka, (acc, n) => acc + n);
      mite(total);
    `;
    await runWibu(code, out);
    expect(out).toEqual(["60"]);
  });

  it("tatamu melempar galat jika barisan kosong tanpa nilai awal", async () => {
    const code = `kore err = tatamu([], (acc, n) => acc + n);`;
    await expect(runWibu(code)).rejects.toThrow("barisan kosong tanpa nilai awal");
  });

  it("Dukungan 4 dialek untuk tatamu (tatamu, tat, lipatBanh, gulungJawa)", async () => {
    const out: string[] = [];
    const codeMurni = "mite(tatamu([1, 2, 3], (a, b) => a * b, 1));";
    const codeSingkat = "mi(tat([1, 2, 3], (a, b) => a * b, 1));";
    const codeWibu = "iuYo(lipatBanh([1, 2, 3], (a, b) => a * b, 1));";
    const codeRongawi = "salamkenal(gulungJawa([1, 2, 3], (a, b) => a * b, 1));";

    await runWibu(codeMurni, out);
    await runWibu(codeSingkat, out);
    await runWibu(codeWibu, out);
    await runWibu(codeRongawi, out);

    expect(out).toEqual(["6", "6", "6", "6"]);
  });

  it("Transpiler mengompilasi tatamu menjadi pemanggilan __tatamu", () => {
    const code = "kore hsl = tatamu([1, 2, 3], (a, b) => a + b, 0);";
    const js = transpileToJS(code);
    expect(js).toContain("__tatamu");
  });
});

describe("WibuScript v2.7.0 - saishou (min) & saidai (max) di 4 Dialek Mutlak", () => {
  it("saishou mencari angka minimum dari daftar argumen dan barisan", async () => {
    const out: string[] = [];
    const code = `
      mite(saishou(10, 5, 20, 2, 8));
      mite(saishou([15, 3, 9, 27]));
    `;
    await runWibu(code, out);
    expect(out).toEqual(["2", "3"]);
  });

  it("saidai mencari angka maksimum dari daftar argumen dan barisan", async () => {
    const out: string[] = [];
    const code = `
      mite(saidai(10, 5, 20, 2, 8));
      mite(saidai([15, 3, 9, 27]));
    `;
    await runWibu(code, out);
    expect(out).toEqual(["20", "27"]);
  });

  it("Dukungan 4 dialek untuk saishou (saishou, sai, palingKecilBanh, kurapika)", async () => {
    const out: string[] = [];
    const codeMurni = "mite(saishou(4, 9, 1));";
    const codeSingkat = "mi(sai(4, 9, 1));";
    const codeWibu = "iuYo(palingKecilBanh(4, 9, 1));";
    const codeRongawi = "salamkenal(kurapika(4, 9, 1));";

    await runWibu(codeMurni, out);
    await runWibu(codeSingkat, out);
    await runWibu(codeWibu, out);
    await runWibu(codeRongawi, out);

    expect(out).toEqual(["1", "1", "1", "1"]);
  });

  it("Dukungan 4 dialek untuk saidai (saidai, dai, palingGedeBanh, megatron)", async () => {
    const out: string[] = [];
    const codeMurni = "mite(saidai(4, 9, 1));";
    const codeSingkat = "mi(dai(4, 9, 1));";
    const codeWibu = "iuYo(palingGedeBanh(4, 9, 1));";
    const codeRongawi = "salamkenal(megatron(4, 9, 1));";

    await runWibu(codeMurni, out);
    await runWibu(codeSingkat, out);
    await runWibu(codeWibu, out);
    await runWibu(codeRongawi, out);

    expect(out).toEqual(["9", "9", "9", "9"]);
  });

  it("Transpiler mengompilasi saishou dan saidai dengan benar", () => {
    const code = "kore mn = saishou(1, 2); kore mx = saidai(1, 2);";
    const js = transpileToJS(code);
    expect(js).toContain("__saishou(1, 2)");
    expect(js).toContain("__saidai(1, 2)");
  });
});

describe("WibuScript v2.7.0 - Web DOM & HTML Generator", () => {
  it("transpileDOM mentranspilasi kata kunci DOM dan asinkronus", () => {
    const wibuCode = `
      hargaMati tombol = culikId("btn");
      siImut hitung = 0;
      tombol.kaloDisentuh("click", mybini() {
        hitung = hitung + 1;
        culikId("counter").isiHati = hitung;
      });
      hargaMati ambil = admindatang fetch("https://api.example.com");
    `;
    const js = transpileDOM(wibuCode);
    expect(js).toContain("document.getElementById(\"btn\")");
    expect(js).toContain("addEventListener(\"click\"");
    expect(js).toContain("innerHTML = hitung");
    expect(js).toContain("await fetch(");
  });

  it("generateBrowserHTML menghasilkan berkas dokumen HTML lengkap", () => {
    const wibuCode = `
      hargaMati judul = culikId("judul");
      judul.isiHati = "Halo Dunia WibuScript!";
    `;
    const html = generateBrowserHTML(wibuCode, {
      title: "Halaman Uji",
      extraHtml: "<h1 id=\"judul\"></h1>",
    });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<title>Halaman Uji</title>");
    expect(html).toContain("<h1 id=\"judul\"></h1>");
    expect(html).toContain("document.addEventListener(\"DOMContentLoaded\"");
    expect(html).toContain("document.getElementById(\"judul\")");
  });
});

describe("WibuScript v2.7.0 - Dialect Converter Parity", () => {
  it("mengonversi tatamu antar-dialek dengan presisi", () => {
    const murni = "tatamu(data, fn, 0);";
    const singkat = convertDialect(murni, "singkat");
    const wibu = convertDialect(murni, "wibu");
    const rongawi = convertDialect(murni, "rongawi");

    expect(singkat).toContain("tat(");
    expect(wibu).toContain("lipatBanh(");
    expect(rongawi).toContain("gulungJawa(");
  });

  it("mengonversi saishou dan saidai antar-dialek dengan presisi", () => {
    const murni = "kore mn = saishou(1, 2); kore mx = saidai(3, 4);";
    const wibu = convertDialect(murni, "wibu");
    const rongawi = convertDialect(murni, "rongawi");

    expect(wibu).toContain("palingKecilBanh(");
    expect(wibu).toContain("palingGedeBanh(");
    expect(rongawi).toContain("kurapika(");
    expect(rongawi).toContain("megatron(");
  });
});
