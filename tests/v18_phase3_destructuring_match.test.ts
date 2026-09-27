// File: tests/v18_phase3_destructuring_match.test.ts
// ============================================================================
// UJI OTOMATIS: BUG FIXES & UPGRADE PHASE 3 (v1.8.0)
// - Analisis & Perbaikan Bug: % modulo, string .nagasa, new tanpa kurung, semicolon
// - Destructuring Array & Object (Deklarasi & Penugasan Swapping)
// - Operator Spread & Rest (...)
// - Pattern Matching (shougo) di 4 Dialek Mutlak (sho, cocokkan, persimpangan)
// - Dialect Converter & JS Transpiler
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

describe("WibuScript v1.8.0 - Analisis & Perbaikan Bug", () => {
  it("Perbaikan Bug 1: Operator Modulo (%) berjalan akurat", async () => {
    const out: string[] = [];
    const code = `
      kore a = 17 % 5;
      kore b = 20 % 4;
      mite(a);
      mite(b);
    `;
    await runWibu(code, out);
    expect(out).toEqual(["2", "0"]);
  });

  it("Perbaikan Bug 1: Modulo dengan angka nol melempar galat runtime", async () => {
    const code = `kore err = 10 % 0;`;
    await expect(runWibu(code)).rejects.toThrow("modulo dengan angka nol");
  });

  it("Perbaikan Bug 2: Akses properti panjang string (.nagasa, .naga, .length)", async () => {
    const out: string[] = [];
    const code = `
      kore teks = "Konnichiwa";
      mite(teks.nagasa);
      mite(teks.naga);
      mite(teks.length);
      mite(teks.panjang);
      mite(teks.dawa);
    `;
    await runWibu(code, out);
    expect(out).toEqual(["10", "10", "10", "10", "10"]);
  });

  it("Perbaikan Bug 3: Instansiasi kelas 'atarashii' tanpa tanda kurung ()", async () => {
    const out: string[] = [];
    const code = `
      sekte Prajurit {
        tanjou() {
          jibun.pangkat = "Kopral";
        }
        lapor() {
          kaesu jibun.pangkat;
        }
      }
      kore p = atarashii Prajurit;
      mite(p.lapor());
    `;
    await runWibu(code, out);
    expect(out).toEqual(["Kopral"]);
  });

  it("Perbaikan Bug 4: Ketahanan terhadap semicolon kosong (;) di dalam pernyataan dan kelas", async () => {
    const out: string[] = [];
    const code = `
      ;
      ;;
      kore x = 10;
      ;
      sekte Ninja {
        ;
        tanjou() { ; }
        ;
        jurus() { kaesu "Rasengan"; }
        ;
      };
      ;;
      kore n = atarashii Ninja();
      mite(n.jurus());
    `;
    await runWibu(code, out);
    expect(out).toEqual(["Rasengan"]);
  });
});

describe("WibuScript v1.8.0 - Destructuring & Spread Operator (...)", () => {
  it("Array Destructuring: Deklarasi variabel dengan rest element", async () => {
    const out: string[] = [];
    const code = `
      kore [pertama, kedua, ...sisa] = ["Naruto", "Sasuke", "Sakura", "Kakashi"];
      mite(pertama);
      mite(kedua);
      mite(sisa.nagasa);
      mite(sisa[0]);
      mite(sisa[1]);
    `;
    await runWibu(code, out);
    expect(out).toEqual(["Naruto", "Sasuke", "2", "Sakura", "Kakashi"]);
  });

  it("Object Destructuring: Deklarasi variabel dan alias properti", async () => {
    const out: string[] = [];
    const code = `
      kore { nama, klan: marga, desa } = { nama: "Itachi", klan: "Uchiha", desa: "Konoha" };
      mite(nama);
      mite(marga);
      mite(desa);
    `;
    await runWibu(code, out);
    expect(out).toEqual(["Itachi", "Uchiha", "Konoha"]);
  });

  it("Assignment Destructuring: Pertukaran nilai variabel (Swapping)", async () => {
    const out: string[] = [];
    const code = `
      kore a = 10;
      kore b = 99;
      [a, b] = [b, a];
      mite(a);
      mite(b);
    `;
    await runWibu(code, out);
    expect(out).toEqual(["99", "10"]);
  });

  it("Spread Operator: Menggabungkan barisan literal dan string", async () => {
    const out: string[] = [];
    const code = `
      kore angka1 = [2, 3];
      kore gabungan = [1, ...angka1, 4];
      mite(gabungan.nagasa);
      mite(gabungan[0]);
      mite(gabungan[1]);
      mite(gabungan[2]);
      mite(gabungan[3]);

      kore huruf = [... "Hai"];
      mite(huruf.nagasa);
      mite(huruf[0]);
      mite(huruf[1]);
      mite(huruf[2]);
    `;
    await runWibu(code, out);
    expect(out).toEqual(["4", "1", "2", "3", "4", "3", "H", "a", "i"]);
  });
});

describe("WibuScript v1.8.0 - Pattern Matching (shougo) di 4 Dialek Mutlak", () => {
  it("Dialek 1 (Jepang Murni): shougo, baai, hyoujun", async () => {
    const out: string[] = [];
    const code = `
      kore kode = 2;
      shougo (kode) {
        baai 1: {
          mite("Satu");
        }
        baai 2: {
          mite("Dua (Murni)");
        }
        hyoujun: {
          mite("Lainnya");
        }
      }
    `;
    await runWibu(code, out);
    expect(out).toEqual(["Dua (Murni)"]);
  });

  it("Dialek 2 (Jepang Singkat): sho, baa, hyo (Singkatan Jepang Otentik)", async () => {
    const out: string[] = [];
    const code = `
      ko nilai = "b";
      sho (nilai) {
        baa "a": {
          mi("Kasus A");
        }
        baa "b": {
          mi("Kasus B (Singkat)");
        }
        hyo: {
          mi("Kasus Hyo");
        }
      }
    `;
    await runWibu(code, out);
    expect(out).toEqual(["Kasus B (Singkat)"]);
  });

  it("Dialek 3 (Wibu Absurd): cocokkan, kaloPas, sisaan", async () => {
    const out: string[] = [];
    const code = `
      siImut angka = 999;
      cocokkan (angka) {
        kaloPas 100: {
          teriakAmba("Seratus");
        }
        sisaan: {
          teriakAmba("Sisaan Wibu!");
        }
      }
    `;
    await runWibu(code, out);
    expect(out).toEqual(["Sisaan Wibu!"]);
  });

  it("Dialek 4 (Meme Rongawi): persimpangan, kenaben, yappingtolol", async () => {
    const out: string[] = [];
    const code = `
      pokmipokmi pangkat = "Admin";
      persimpangan (pangkat) {
        kenaben "Member": {
          salamkenal("Member Baru");
        }
        kenaben "Admin": {
          salamkenal("Admin Datang!");
        }
        yappingtolol: {
          salamkenal("Silent Reader");
        }
      }
    `;
    await runWibu(code, out);
    expect(out).toEqual(["Admin Datang!"]);
  });

  it("Pencocokan pola sebagai ekspresi yang mengembalikan nilai", async () => {
    const out: string[] = [];
    const code = `
      kore peringkat = 1;
      kore medali = shougo (peringkat) {
        baai 1: { kaesu "Emas"; }
        baai 2: { kaesu "Perak"; }
        hyoujun: { kaesu "Perunggu"; }
      };
      mite(medali);
    `;
    await runWibu(code, out);
    expect(out).toEqual(["Emas"]);
  });
});

describe("WibuScript v1.8.0 - Dialect Converter & Transpiler", () => {
  it("Dialect Converter mengonversi shougo / baai / hyoujun antar dialek", () => {
    const murni = `
      shougo (x) {
        baai 1: { mite("A"); }
        hyoujun: { mite("B"); }
      }
    `;
    const singkat = convertDialect(murni, "singkat");
    expect(singkat).toContain("sho (x)");
    expect(singkat).toContain("baa 1:");
    expect(singkat).toContain("hyo:");

    const wibu = convertDialect(murni, "wibu");
    expect(wibu).toContain("cocokkan (x)");
    expect(wibu).toContain("kaloPas 1:");
    expect(wibu).toContain("sisaan:");

    const rongawi = convertDialect(wibu, "rongawi");
    expect(rongawi).toContain("persimpangan (x)");
    expect(rongawi).toContain("kenaben 1:");
    expect(rongawi).toContain("yappingtolol:");
  });

  it("JS Transpiler: Menghasilkan kode JavaScript ES2022+ yang valid untuk destructuring & shougo", () => {
    const wibuCode = `
      kore [a, b, ...sisa] = [1, 2, 3, 4];
      kore { nama, klan: marga } = { nama: "Sasuke", klan: "Uchiha" };
      [a, b] = [b, a];
      kore gabung = [0, ...sisa];
      shougo (a) {
        baai 1: {
          mite("Satu");
        }
        hyoujun: {
          mite("Lain");
        }
      }
    `;
    const js = transpileToJS(wibuCode);
    expect(js).toContain("let [a, b, ...sisa] = [1, 2, 3, 4];");
    expect(js).toContain("let { nama, klan: marga } = { nama: \"Sasuke\", klan: \"Uchiha\" };");
    expect(js).toContain("[a, b] = [b, a]");
    expect(js).toContain("[0, ...sisa]");
    expect(js).toContain("switch (a)");
    expect(js).toContain("case 1:");
    expect(js).toContain("default:");
  });

  it("JS Transpiler: Memastikan parentesis aman pada member access setelah instansiasi (new)", () => {
    const code = `
      sekte Mobil {
        bunyi() { kaesu "Brum"; }
      }
      kore suara = atarashii Mobil().bunyi();
    `;
    const js = transpileToJS(code);
    expect(js).toContain("(new Mobil()).bunyi()");
  });
});
