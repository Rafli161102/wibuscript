// File: tests/examples.test.ts
// ============================================================================
// WIBUSCRIPT EXAMPLE SCRIPTS & BACKWARD COMPATIBILITY TEST SUITE
// Memverifikasi seluruh berkas contoh (examples/*.wibu, contoh.wibu, uji.wibu)
// berjalan dengan sukses (exit code 0 / zero error) dan menjamin kompatibilitas
// sintaks historis (koreWa, bikinJutsu, balikinDesu, chigau, kasihMite).
// ============================================================================

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { runWibuScriptAsync } from "../src/index";

const ROOT_DIR = path.resolve(__dirname, "..");

describe("WibuScript Example Scripts Verification", () => {
  it("menjalankan uji.wibu tanpa error", async () => {
    const filePath = path.join(ROOT_DIR, "uji.wibu");
    const code = fs.readFileSync(filePath, "utf-8");
    const logs: string[] = [];

    const result = await runWibuScriptAsync(code, {
      outputHandler: (msg: string) => logs.push(msg),
    });

    expect(result.error).toBeUndefined();
    expect(logs.some((l) => l.includes("Status: Sukses"))).toBe(true);
  });

  it("menjalankan contoh.wibu tanpa error", async () => {
    const filePath = path.join(ROOT_DIR, "contoh.wibu");
    const code = fs.readFileSync(filePath, "utf-8");
    const logs: string[] = [];

    const result = await runWibuScriptAsync(code, {
      outputHandler: (msg: string) => logs.push(msg),
    });

    expect(result.error).toBeUndefined();
    expect(logs.some((l) => l.includes("Petualangan WibuScript berhasil dijalankan!"))).toBe(true);
  });

  it("menjalankan examples/kalkulator.wibu tanpa error", async () => {
    const filePath = path.join(ROOT_DIR, "examples", "kalkulator.wibu");
    const code = fs.readFileSync(filePath, "utf-8");
    const logs: string[] = [];

    const result = await runWibuScriptAsync(code, {
      outputHandler: (msg: string) => logs.push(msg),
    });

    expect(result.error).toBeUndefined();
  });

  it("menjalankan examples/utama.wibu dan membaca hasil kalkulator", async () => {
    const filePath = path.join(ROOT_DIR, "examples", "utama.wibu");
    const code = fs.readFileSync(filePath, "utf-8");
    const logs: string[] = [];

    const result = await runWibuScriptAsync(code, {
      outputHandler: (msg: string) => logs.push(msg),
    });

    expect(result.error).toBeUndefined();
    expect(logs.some((l) => l.includes("Program Selesai Dieksekusi"))).toBe(true);
  });

  it("menjalankan examples/oop_sekte.wibu tanpa error", async () => {
    const filePath = path.join(ROOT_DIR, "examples", "oop_sekte.wibu");
    const code = fs.readFileSync(filePath, "utf-8");
    const logs: string[] = [];

    const result = await runWibuScriptAsync(code, {
      outputHandler: (msg: string) => logs.push(msg),
    });

    expect(result.error).toBeUndefined();
    expect(logs.some((l) => l.includes("Ekspor selesai! WibuScript v1.7.0 OOP berjalan sempurna."))).toBe(true);
  });

  it("menjalankan examples/rongawi_meme.wibu tanpa error", async () => {
    const filePath = path.join(ROOT_DIR, "examples", "rongawi_meme.wibu");
    const code = fs.readFileSync(filePath, "utf-8");
    const logs: string[] = [];

    const result = await runWibuScriptAsync(code, {
      outputHandler: (msg: string) => logs.push(msg),
    });

    expect(result.error).toBeUndefined();
    expect(logs.some((l) => l.includes("EKSEKUSI RONGAWI SELESAI - MENYALA ABKUH!"))).toBe(true);
  });

  it("menjalankan examples/interop_npm.wibu tanpa error", async () => {
    const filePath = path.join(ROOT_DIR, "examples", "interop_npm.wibu");
    const code = fs.readFileSync(filePath, "utf-8");
    const logs: string[] = [];

    const result = await runWibuScriptAsync(code, {
      outputHandler: (msg: string) => logs.push(msg),
    });

    expect(result.error).toBeUndefined();
    expect(logs.some((l) => l.includes("Selesai Uji Interop NPM WibuScript"))).toBe(true);
  });

  it("menjalankan examples/http_server.wibu tanpa error", async () => {
    const filePath = path.join(ROOT_DIR, "examples", "http_server.wibu");
    const code = fs.readFileSync(filePath, "utf-8");
    const logs: string[] = [];

    const result = await runWibuScriptAsync(code, {
      outputHandler: (msg: string) => logs.push(msg),
    });

    expect(result.error).toBeUndefined();
    expect(logs.some((l) => l.includes("SERVER BERHASIL DIKONFIGURASI"))).toBe(true);
  });

  it("menjalankan examples/web_fetch_dom.wibu tanpa error", async () => {
    const filePath = path.join(ROOT_DIR, "examples", "web_fetch_dom.wibu");
    const code = fs.readFileSync(filePath, "utf-8");
    const logs: string[] = [];

    const result = await runWibuScriptAsync(code, {
      outputHandler: (msg: string) => logs.push(msg),
    });

    expect(result.error).toBeUndefined();
    expect(logs.some((l) => l.includes("MANIPULASI DOM SELESAI"))).toBe(true);
  });

  describe("Sintaks Historis v1.0 Backward Compatibility", () => {
    it("mendukung koreWa, bikinJutsu, balikinDesu, chigau, dan kasihMite", async () => {
      const code = `
        koreWa angka = 40
        bikinJutsu kalikan(a, b) {
          balikinDesu a * b
        }
        bikinJutsu cek(n) {
          moshi (n > 50) {
            balikinDesu "besar"
          } chigau {
            balikinDesu "kecil"
          }
        }
        koreWa total = kalikan(angka, 2)
        koreWa status = cek(total)
        kasihMite("Total: " + total + ", Status: " + status)
      `;

      const logs: string[] = [];
      const result = await runWibuScriptAsync(code, {
        outputHandler: (msg: string) => logs.push(msg),
      });

      expect(result.error).toBeUndefined();
      expect(logs).toContain("Total: 80, Status: besar");
    });
  });
});
