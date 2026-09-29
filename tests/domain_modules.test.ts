// Berkas: tests/domain_modules.test.ts
// ============================================================================
// PENGUJIAN UNIT PRIORITAS 4: MODUL DOMAIN DASAR (web DAN server)
// Memverifikasi fungsionalitas fetch, DOM virtual/asli, HTTP server,
// serta kesetaraan 100% pada 4 Dialek Mutlak WibuScript.
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import webDefault, {
  fetchData,
  selectElement,
  createElement,
  appendElement,
  setText,
  getText,
  setHtml,
  onEvent,
  virtualDocument,
  VirtualDOMElement,
  tsunagari,
  youso,
  yousoTsukuru,
  yousoTsukeru,
  mojiOkikae,
  mojiToru,
  htmlOkikae,
  dekigoto,
  tsu,
  you,
  youTsu,
  youTsuke,
  moOki,
  moTo,
  htOki,
  deki,
  tarikData,
  comotElemen,
  bikinElemen,
  tempelElemen,
  gantiTeks,
  ambilTeks,
  gantiHtml,
  pasangEvent,
  sedotdata,
  cidukunsur,
  cetakunsur,
  tempelunsur,
  salintulisan,
  bacatulisan,
  salinhtml,
  tunggukenak,
} from "../src/modules/web";

import serverDefault, {
  createServer,
  WibuServer,
  sabahTsukuru,
  saaTsu,
  bikinServer,
  pabrikserver,
  buatServer,
} from "../src/modules/server";

import { runWibuScriptAsync } from "../src/index";

describe("WibuScript v2.5.0 - Prioritas 4: Modul Domain Dasar (web & server)", () => {
  // --------------------------------------------------------------------------
  // 1. MODUL DOMAIN WEB (wibuscript/web)
  // --------------------------------------------------------------------------
  describe("1. Modul Domain Web (src/modules/web.ts)", () => {
    beforeEach(() => {
      virtualDocument.reset();
    });

    describe("Manipulasi DOM dan Virtual DOM", () => {
      it("membuat dan memanipulasi elemen DOM dengan atribut dan hierarki", () => {
        const div = createElement("div", { id: "kontainer", class: "wadah utama" });
        expect(div).toBeInstanceOf(VirtualDOMElement);
        expect(div.tagName).toBe("DIV");
        expect(div.attributes["id"]).toBe("kontainer");
        expect(div.attributes["class"]).toBe("wadah utama");

        const p = createElement("p");
        setText(p, "Halo WibuScript");
        expect(getText(p)).toBe("Halo WibuScript");

        setHtml(p, "<span>Teks Tebal</span>");
        expect(p.innerHTML).toBe("<span>Teks Tebal</span>");

        appendElement(div, p);
        expect(div.children.length).toBe(1);
        expect(div.children[0]).toBe(p);
        expect(p.parent).toBe(div);
      });

      it("mencari elemen dengan querySelector id, class, dan tag name", () => {
        const body = selectElement("body");
        expect(body).toBeDefined();

        const section = createElement("section", { id: "hero", class: "banner" });
        const h1 = createElement("h1");
        setText(h1, "Judul Utama");
        appendElement(section, h1);
        appendElement(body, section);

        expect(selectElement("#hero")).toBe(section);
        expect(selectElement(".banner")).toBe(section);
        expect(selectElement("h1")).toBe(h1);
        expect(selectElement("#tidak-ada")).toBeNull();
      });

      it("menangani pendengar peristiwa (event listener) dan pengiriman aksi", () => {
        const tombol = createElement("button");
        let klikCount = 0;
        let eventPayload: any = null;

        onEvent(tombol, "click", (e: any) => {
          klikCount++;
          eventPayload = e;
        });

        tombol.dispatchEvent("click", { tombolId: "btn-1" });
        expect(klikCount).toBe(1);
        expect(eventPayload).toEqual({ tombolId: "btn-1" });

        tombol.dispatchEvent("click", { tombolId: "btn-1" });
        expect(klikCount).toBe(2);
      });
    });

    describe("Kesetaraan Alias 4 Dialek Mutlak pada Modul Web", () => {
      it("memastikan alias fungsi identik dengan fungsi kanonikal", () => {
        // Fetch
        expect(tsunagari).toBe(fetchData);
        expect(tsu).toBe(fetchData);
        expect(tarikData).toBe(fetchData);
        expect(sedotdata).toBe(fetchData);

        // Select
        expect(youso).toBe(selectElement);
        expect(you).toBe(selectElement);
        expect(comotElemen).toBe(selectElement);
        expect(cidukunsur).toBe(selectElement);

        // Create
        expect(yousoTsukuru).toBe(createElement);
        expect(youTsu).toBe(createElement);
        expect(bikinElemen).toBe(createElement);
        expect(cetakunsur).toBe(createElement);

        // Append
        expect(yousoTsukeru).toBe(appendElement);
        expect(youTsuke).toBe(appendElement);
        expect(tempelElemen).toBe(appendElement);
        expect(tempelunsur).toBe(appendElement);

        // Text & HTML
        expect(mojiOkikae).toBe(setText);
        expect(moOki).toBe(setText);
        expect(gantiTeks).toBe(setText);
        expect(salintulisan).toBe(setText);

        expect(mojiToru).toBe(getText);
        expect(moTo).toBe(getText);
        expect(ambilTeks).toBe(getText);
        expect(bacatulisan).toBe(getText);

        expect(htmlOkikae).toBe(setHtml);
        expect(htOki).toBe(setHtml);
        expect(gantiHtml).toBe(setHtml);
        expect(salinhtml).toBe(setHtml);

        // Events
        expect(dekigoto).toBe(onEvent);
        expect(deki).toBe(onEvent);
        expect(pasangEvent).toBe(onEvent);
        expect(tunggukenak).toBe(onEvent);
      });

      it("menyediakan seluruh fungsi pada objek ekspor default", () => {
        expect(webDefault.fetchData).toBe(fetchData);
        expect(webDefault.tsunagari).toBe(fetchData);
        expect(webDefault.tsu).toBe(fetchData);
        expect(webDefault.tarikData).toBe(fetchData);
        expect(webDefault.sedotdata).toBe(fetchData);
        expect(webDefault.selectElement).toBe(selectElement);
        expect(webDefault.virtualDocument).toBe(virtualDocument);
      });
    });

    describe("Pengambilan Data HTTP (Fetch API)", () => {
      const originalFetch = globalThis.fetch;

      afterEach(() => {
        globalThis.fetch = originalFetch;
      });

      it("mengambil data JSON melalui fetchData", async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
          url: "https://api.wibuscript.org/data",
          text: async () => JSON.stringify({ pesan: "WibuScript Web" }),
          json: async () => ({ pesan: "WibuScript Web" }),
        };

        globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

        const res = await fetchData("https://api.wibuscript.org/data");
        expect(res.ok).toBe(true);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json).toEqual({ pesan: "WibuScript Web" });

        const text = await res.text();
        expect(text).toBe(JSON.stringify({ pesan: "WibuScript Web" }));
      });
    });
  });

  // --------------------------------------------------------------------------
  // 2. MODUL DOMAIN SERVER (wibuscript/server)
  // --------------------------------------------------------------------------
  describe("2. Modul Domain Server (src/modules/server.ts)", () => {
    describe("Pembuatan Server dan Penanganan Request/Response", () => {
      it("membuat instance server dan menjalankan simulasi penanganan request", async () => {
        const server = createServer((req, res) => {
          if (req.url === "/halo") {
            res.send("Halo dari WibuScript Server", 200);
          } else if (req.url === "/api/json") {
            res.json({ status: "aktif", versi: "2.5.0" }, 200);
          } else {
            res.status(404).send("Tidak Ditemukan");
          }
        });

        expect(server).toBeInstanceOf(WibuServer);

        // Simulasi GET /halo
        const sim1 = await server.simulate("/halo", "GET");
        expect(sim1.status).toBe(200);
        expect(sim1.body).toBe("Halo dari WibuScript Server");

        // Simulasi GET /api/json
        const sim2 = await server.simulate("/api/json", "GET");
        expect(sim2.status).toBe(200);
        expect(sim2.json).toEqual({ status: "aktif", versi: "2.5.0" });

        // Simulasi 404
        const sim3 = await server.simulate("/bukan-halaman", "GET");
        expect(sim3.status).toBe(404);
        expect(sim3.body).toBe("Tidak Ditemukan");
      });

      it("mendukung parsing query params dan body pada request", async () => {
        let capturedQuery: any = null;
        let capturedBody: any = null;

        const server = createServer((req, res) => {
          capturedQuery = req.query;
          capturedBody = req.body;
          res.json({ diterima: true });
        });

        await server.simulate(
          "/uji?kategori=wibu&halaman=2",
          "POST",
          { nama: "Antigravity" },
          { "content-type": "application/json" }
        );

        expect(capturedQuery).toEqual({ kategori: "wibu", halaman: "2" });
        expect(capturedBody).toEqual({ nama: "Antigravity" });
      });
    });

    describe("Kesetaraan Alias 4 Dialek Mutlak pada Modul Server", () => {
      it("memastikan alias fungsi pembuat server identik", () => {
        expect(sabahTsukuru).toBe(createServer);
        expect(saaTsu).toBe(createServer);
        expect(bikinServer).toBe(createServer);
        expect(pabrikserver).toBe(createServer);
        expect(buatServer).toBe(createServer);
      });

      it("mendukung alias respons 4 dialek (kaesu, kae, kirimBalik, balasmas)", async () => {
        const server = createServer((req, res) => {
          if (req.url === "/murni") res.kaesu("Murni Respon", 201);
          if (req.url === "/singkat") res.kae("Singkat Respon", 202);
          if (req.url === "/wibu") res.kirimBalik("Wibu Respon", 203);
          if (req.url === "/rongawi") res.balasmas("Rongawi Respon", 204);
        });

        const r1 = await server.simulate("/murni");
        expect(r1.status).toBe(201);
        expect(r1.body).toBe("Murni Respon");

        const r2 = await server.simulate("/singkat");
        expect(r2.status).toBe(202);
        expect(r2.body).toBe("Singkat Respon");

        const r3 = await server.simulate("/wibu");
        expect(r3.status).toBe(203);
        expect(r3.body).toBe("Wibu Respon");

        const r4 = await server.simulate("/rongawi");
        expect(r4.status).toBe(204);
        expect(r4.body).toBe("Rongawi Respon");
      });

      it("mendukung alias respons JSON 4 dialek (kanjiKaesu, kjKae, kirimJson, balasjson)", async () => {
        const server = createServer((req, res) => {
          if (req.url === "/murni") res.kanjiKaesu({ dialek: "murni" }, 200);
          if (req.url === "/singkat") res.kjKae({ dialek: "singkat" }, 200);
          if (req.url === "/wibu") res.kirimJson({ dialek: "wibu" }, 200);
          if (req.url === "/rongawi") res.balasjson({ dialek: "rongawi" }, 200);
        });

        const r1 = await server.simulate("/murni");
        expect(r1.json).toEqual({ dialek: "murni" });

        const r2 = await server.simulate("/singkat");
        expect(r2.json).toEqual({ dialek: "singkat" });

        const r3 = await server.simulate("/wibu");
        expect(r3.json).toEqual({ dialek: "wibu" });

        const r4 = await server.simulate("/rongawi");
        expect(r4.json).toEqual({ dialek: "rongawi" });
      });

      it("mendukung alias listen dan close pada 4 dialek", () => {
        const server = createServer();
        expect(typeof server.kiku).toBe("function");
        expect(typeof server.ki).toBe("function");
        expect(typeof server.dengerin).toBe("function");
        expect(typeof server.pasangkuping).toBe("function");

        expect(typeof server.yame).toBe("function");
        expect(typeof server.ya).toBe("function");
        expect(typeof server.tutupBanh).toBe("function");
        expect(typeof server.kelarngawi).toBe("function");
      });

      it("menyediakan seluruh fungsi pada objek ekspor default server", () => {
        expect(serverDefault.createServer).toBe(createServer);
        expect(serverDefault.sabahTsukuru).toBe(createServer);
        expect(serverDefault.saaTsu).toBe(createServer);
        expect(serverDefault.bikinServer).toBe(createServer);
        expect(serverDefault.pabrikserver).toBe(createServer);
        expect(serverDefault.WibuServer).toBe(WibuServer);
      });
    });

    describe("Node.js HTTP Server Real Socket Lifecycle", () => {
      it("memulai dan menutup server HTTP asli Node.js pada port dinamis", async () => {
        const server = createServer((req, res) => {
          res.send("Panggilan Berhasil", 200);
        });

        await new Promise<void>((resolve) => {
          server.listen(0, () => {
            resolve();
          });
        });

        await new Promise<void>((resolve) => {
          server.close(() => {
            resolve();
          });
        });
      });
    });
  });

  // --------------------------------------------------------------------------
  // 3. INTEGRASI EKSEKUSI RUNTIME WIBUSCRIPT
  // --------------------------------------------------------------------------
  describe("3. Integrasi Eksekusi Kode WibuScript dengan Modul Domain", () => {
    it("mengeksekusi manipulasi DOM WibuScript menggunakan modul web", async () => {
      const wibuCode = `
        toriyoseru { youso, yousoTsukuru, yousoTsukeru, mojiOkikae, mojiToru } kara "web";

        kore wadah = youso("body");
        kore judul = yousoTsukuru("h2");
        mojiOkikae(judul, "Integrasi Web WibuScript");
        yousoTsukeru(wadah, judul);

        mite("TEKS_DITEMUKAN:" + mojiToru(judul));
      `;

      const result = await runWibuScriptAsync(wibuCode);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toContain("TEKS_DITEMUKAN:Integrasi Web WibuScript");
    });

    it("mengeksekusi konfigurasi HTTP Server WibuScript menggunakan modul server", async () => {
      const wibuCode = `
        toriyoseru { sabahTsukuru } kara "server";

        kore server = sabahTsukuru((req, res) => {
          res.json({ pesan: "Server Berjalan", path: req.url }, 200);
        });

        server.simulate("/api/cek", "GET");
        mite("SERVER_SELESAI_DIKONFIGURASI");
      `;

      const result = await runWibuScriptAsync(wibuCode);
      expect(result.error).toBeUndefined();
      expect(result.outputLog).toContain("SERVER_SELESAI_DIKONFIGURASI");
    });
  });
});
