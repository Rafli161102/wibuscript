import { describe, it, expect, beforeEach } from "vitest";
import {
  runWibuScriptAsync,
  convertDialect,
  transpileToJS,
  registerVirtualModule,
  clearVirtualModules,
  type InstanceValue,
  type ClassValue,
} from "../src/index";

describe("WibuScript v1.7.0 - Phase 2: OOP & Module System", () => {
  beforeEach(() => {
    clearVirtualModules();
  });

  describe("1. OOP - Dialek Jepang Murni", () => {
    it("dapat mendefinisikan sekte (class), konstruktor (tanjou), dan instansiasi (atarashii)", async () => {
      const code = `
        sekte Ninja {
          tanjou(nama, klan) {
            jibun.nama = nama
            jibun.klan = klan
          }

          salam() {
            mite("Watashi wa " + jibun.nama + " dari klan " + jibun.klan)
          }
        }

        kore naruto = atarashii Ninja("Naruto", "Uzumaki")
        naruto.salam()
        mite(naruto.nama)
        naruto.nama
      `;

      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual([
        "Watashi wa Naruto dari klan Uzumaki",
        "Naruto",
      ]);
      expect(result.lastValue.type).toBe("string");
      expect((result.lastValue as any).value).toBe("Naruto");
    });

    it("mendukung pewarisan sekte (keishou) dan akses metode induk", async () => {
      const code = `
        sekte Karakter {
          tanjou(nama) {
            jibun.nama = nama
            jibun.darah = 100
          }

          info() {
            kaesu jibun.nama + " (HP: " + jibun.darah + ")"
          }
        }

        sekte Hokage keishou Karakter {
          taraf() {
            kaesu "Taraf: Pemimpin Desa"
          }
        }

        kore tsunade = atarashii Hokage("Tsunade")
        mite(tsunade.info())
        mite(tsunade.taraf())
      `;

      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual([
        "Tsunade (HP: 100)",
        "Taraf: Pemimpin Desa",
      ]);
    });
  });

  describe("2. OOP - Dialek Jepang Singkat (Singkatan Otentik)", () => {
    it("dapat mengeksekusi sek, tan, ata, ji secara mulus", async () => {
      const code = `
        sek Shinobi {
          tan(n) {
            ji.n = n
          }
          tampil() {
            mi("Shinobi: " + ji.n)
          }
        }

        ko s = ata Shinobi("Sasuke")
        s.tampil()
      `;

      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["Shinobi: Sasuke"]);
    });

    it("mendukung pewarisan singkat dengan 'kei'", async () => {
      const code = `
        sek Induk {
          tan() {
            ji.skor = 99
          }
        }

        sek Anak kei Induk {
          getSkor() {
            kae ji.skor
          }
        }

        ko a = ata Anak()
        mi(a.getSkor())
      `;

      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["99"]);
    });
  });

  describe("3. OOP - Dialek Wibu Absurd & Meme Rongawi", () => {
    it("dapat mengeksekusi paguyuban, lahiran, bikinBaru, siAing (Wibu Absurd)", async () => {
      const code = `
        paguyuban WibuGanteng {
          lahiran(nama) {
            siAing.nama = nama
          }
          pamer() {
            teriakAmba("Keren nih: " + siAing.nama)
          }
        }

        siImut w = bikinBaru WibuGanteng("Megumin")
        w.pamer()
      `;

      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["Keren nih: Megumin"]);
    });

    it("dapat mengeksekusi perkumpulan, mbrojol, anyaran, awakku, warisanSoko (Meme Rongawi)", async () => {
      const code = `
        perkumpulan WongJowo {
          mbrojol(asal) {
            awakku.asal = asal
          }
          sopo() {
            salamkenal("Asal: " + awakku.asal)
          }
        }

        perkumpulan Pendekar warisanSoko WongJowo {
          jurus() {
            salamkenal("Gebugan maut soko " + awakku.asal)
          }
        }

        pokmipokmi p = anyaran Pendekar("Solo")
        p.sopo()
        p.jurus()
      `;

      const result = await runWibuScriptAsync(code);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual([
        "Asal: Solo",
        "Gebugan maut soko Solo",
      ]);
    });
  });

  describe("4. Sistem Modul (Export / Import)", () => {
    it("dapat mengekspor dan mengimpor fungsi dan sekte dengan dialek Jepang Murni", async () => {
      registerVirtualModule(
        "./ninja_module.wibu",
        `
          koukai jutsu hitungChakra(tingkat) {
            kaesu tingkat * 50
          }

          koukai sekte Senjata {
            tanjou(jenis) {
              jibun.jenis = jenis
            }
            ambil() {
              kaesu "Senjata: " + jibun.jenis
            }
          }
        `
      );

      const mainCode = `
        toriyoseru { hitungChakra, Senjata } kara "./ninja_module.wibu"

        kore c = hitungChakra(3)
        mite(c)

        kore kunai = atarashii Senjata("Kunai")
        mite(kunai.ambil())
      `;

      const result = await runWibuScriptAsync(mainCode);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["150", "Senjata: Kunai"]);
    });

    it("dapat mengekspor dan mengimpor dengan dialek Singkat (kou, tori, kra)", async () => {
      registerVirtualModule(
        "./calc.wibu",
        `
          ko perkalian = 42
          kou { perkalian }
        `
      );

      const mainCode = `
        tori { perkalian } kra "./calc.wibu"
        mi(perkalian)
      `;

      const result = await runWibuScriptAsync(mainCode);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["42"]);
    });

    it("dapat mengekspor dan mengimpor dengan dialek Wibu Absurd (sebarJutsu, summonJutsu, dari)", async () => {
      registerVirtualModule(
        "./wibu_mod.wibu",
        `
          sebarJutsu mybini sapaan() {
            kasihPaham("Halo Otaku!")
          }
        `
      );

      const mainCode = `
        summonJutsu { sapaan } dari "./wibu_mod.wibu"
        teriakAmba(sapaan())
      `;

      const result = await runWibuScriptAsync(mainCode);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["Halo Otaku!"]);
    });

    it("dapat mengekspor dan mengimpor dengan dialek Rongawi (pamerke, jupukno, soko)", async () => {
      registerVirtualModule(
        "./rongawi_mod.wibu",
        `
          pamerke fufufafa tambah(a, b) {
            kandabahlil a + b
          }
        `
      );

      const mainCode = `
        jupukno { tambah } soko "./rongawi_mod.wibu"
        salamkenal(tambah(10, 20))
      `;

      const result = await runWibuScriptAsync(mainCode);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["30"]);
    });

    it("dapat mengimpor semua ekspor menggunakan wildcard '*'", async () => {
      registerVirtualModule(
        "./wildcard.wibu",
        `
          koukai kore val1 = 100
          koukai kore val2 = 200
        `
      );

      const mainCode = `
        toriyoseru * kara "./wildcard.wibu"
        mite(val1 + val2)
      `;

      const result = await runWibuScriptAsync(mainCode);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toEqual(["300"]);
    });
  });

  describe("5. Dialect Auto-Converter", () => {
    it("mengonversi kata kunci OOP dan Modul dari Murni ke Singkat (singkatan Jepang)", () => {
      const source = `
        sekte Kucing keishou Hewan {
          tanjou(nama) {
            jibun.nama = nama
          }
        }
        koukai { Kucing }
        toriyoseru { Anjing } kara "./hewan.wibu"
        kore k = atarashii Kucing("Mimi")
      `;

      const converted = convertDialect(source, "singkat");
      expect(converted).toContain("sek Kucing kei Hewan");
      expect(converted).toContain("tan(nama)");
      expect(converted).toContain("ji.nama = nama");
      expect(converted).toContain("kou { Kucing }");
      expect(converted).toContain('tori { Anjing } kra "./hewan.wibu"');
      expect(converted).toContain('ko k = ata Kucing("Mimi")');
    });

    it("mengonversi kata kunci OOP dan Modul dari Singkat ke Wibu & Rongawi", () => {
      const source = `
        sek Ninja {
          tan(n) {
            ji.n = n
          }
        }
        kou { Ninja }
        tori { Katana } kra "./senjata.wibu"
      `;

      const wibu = convertDialect(source, "wibu");
      expect(wibu).toContain("paguyuban Ninja");
      expect(wibu).toContain("lahiran(n)");
      expect(wibu).toContain("siAing.n = n");
      expect(wibu).toContain("sebarJutsu { Ninja }");
      expect(wibu).toContain('summonJutsu { Katana } dari "./senjata.wibu"');

      const rongawi = convertDialect(source, "rongawi");
      expect(rongawi).toContain("perkumpulan Ninja");
      expect(rongawi).toContain("mbrojol(n)");
      expect(rongawi).toContain("awakku.n = n");
      expect(rongawi).toContain("pamerke { Ninja }");
      expect(rongawi).toContain('jupukno { Katana } soko "./senjata.wibu"');
    });
  });

  describe("6. JavaScript Transpiler", () => {
    it("mentranspilasi deklarasi kelas, konstruktor, metode, new, this, dan pewarisan", () => {
      const source = `
        sekte Mobil keishou Kendaraan {
          tanjou(merk) {
            jibun.merk = merk
          }
          gas() {
            mite("Ngebut: " + jibun.merk)
          }
        }
        kore m = atarashii Mobil("Honda")
        m.gas()
      `;

      const js = transpileToJS(source);
      expect(js).toContain("class Mobil extends Kendaraan {");
      expect(js).toContain("constructor(merk) {");
      expect(js).toContain("this.merk = merk;");
      expect(js).toContain("gas() {");
      expect(js).toContain('console.log(("Ngebut: " + this.merk));');
      expect(js).toContain('let m = new Mobil("Honda");');
      expect(js).toContain("m.gas();");
    });

    it("mentranspilasi export dan import ES module", () => {
      const source = `
        koukai kore pi = 3.14
        koukai { Mobil }
        toriyoseru { Mesin, Roda } kara "./komponen.js"
      `;

      const js = transpileToJS(source);
      expect(js).toContain("export let pi = 3.14;");
      expect(js).toContain("export { Mobil };");
      expect(js).toContain('import { Mesin, Roda } from "./komponen.js";');
    });
  });
});
