#!/usr/bin/env node
// File: src/cli.ts
// ============================================================================
// WIBUSCRIPT CLI RUNNER
// Eksekutor Command Line Interface untuk menjalankan berkas .wibu
// melalui terminal Node.js. Didaftarkan sebagai perintah global "wibu"
// via field "bin" pada package.json.
// ============================================================================

import * as fs from "node:fs";
import * as path from "node:path";
import { runWibuScript } from "./index";

const WIBU_VERSION = "1.3.0";

function printUsage(): void {
  console.log(`WibuScript CLI v${WIBU_VERSION}`);
  console.log("Bahasa Pemrograman Esoterik dengan Sistem Alias Indo-Jepang\n");
  console.log("Penggunaan:");
  console.log("  wibu run <berkas.wibu>    Menjalankan berkas WibuScript");
  console.log("  wibu <berkas.wibu>        Menjalankan berkas WibuScript (pintasan)");
  console.log("  wibu --version            Menampilkan versi CLI");
  console.log("  wibu --help               Menampilkan bantuan ini\n");
  console.log("Contoh:");
  console.log("  wibu run contoh.wibu");
  console.log("  wibu contoh.wibu");
}

function printVersion(): void {
  console.log(`wibuscript v${WIBU_VERSION}`);
}

async function executeFile(filePath: string): Promise<void> {
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`[Error] Berkas tidak ditemukan: ${resolvedPath}`);
    process.exit(1);
  }

  const extension = path.extname(resolvedPath).toLowerCase();
  if (extension !== ".wibu") {
    console.error(
      `[Error] Ekstensi berkas tidak valid: "${extension}". Gunakan ekstensi .wibu`
    );
    process.exit(1);
  }

  try {
    const sourceCode = fs.readFileSync(resolvedPath, "utf-8");
    await runWibuScript(sourceCode);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(`[Runtime Error] ${errorMessage}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    return;
  }

  const firstArg = args[0];

  if (!firstArg) {
    printUsage();
    return;
  }

  switch (firstArg) {
    case "--version":
    case "-v":
      printVersion();
      return;

    case "--help":
    case "-h":
      printUsage();
      return;

    case "run": {
      const targetFile = args[1];
      if (!targetFile) {
        console.error("[Error] Argumen berkas target diperlukan setelah 'run'.");
        console.error("Penggunaan: wibu run <berkas.wibu>");
        process.exit(1);
      }
      await executeFile(targetFile);
      return;
    }

    default: {
      // Pintasan langsung: wibu <berkas.wibu>
      if (firstArg.startsWith("-")) {
        console.error(`[Error] Opsi tidak dikenal: ${firstArg}`);
        console.error("Jalankan 'wibu --help' untuk melihat opsi yang tersedia.");
        process.exit(1);
      }
      await executeFile(firstArg);
      return;
    }
  }
}

void main();
