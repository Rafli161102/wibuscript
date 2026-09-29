#!/usr/bin/env node
// File: src/cli.ts
// ============================================================================
// WIBUSCRIPT CLI RUNNER
// Eksekutor Command Line Interface untuk menjalankan berkas .wibu,
// memulai REPL interaktif, mengompilasi ke JavaScript, dan mengonversi antar-dialek.
// ============================================================================

import * as fs from "node:fs";
import * as path from "node:path";
import { runWibuScript, transpileToJS, convertDialect, type Dialect } from "./index";
import { startREPL } from "./repl";

const WIBU_VERSION = "2.0.1";

function printUsage(): void {
  console.log(`WibuScript CLI v${WIBU_VERSION}`);
  console.log("Bahasa Pemrograman Modern Berbasis Sistem 4 Dialek Mutlak\n");
  console.log("Penggunaan:");
  console.log("  wibu                          Memulai REPL interaktif");
  console.log("  wibu repl                     Memulai REPL interaktif");
  console.log("  wibu run <berkas.wibu>        Menjalankan berkas WibuScript");
  console.log("  wibu <berkas.wibu>            Menjalankan berkas WibuScript (pintasan)");
  console.log("  wibu build <berkas.wibu>      Kompilasi berkas ke JavaScript (opsi: -o <output.js>)");
  console.log("  wibu convert <berkas> --to <dialek>  Konversi antar-dialek (murni, singkat, wibu, rongawi)");
  console.log("  wibu --version, -v            Menampilkan versi CLI");
  console.log("  wibu --help, -h               Menampilkan bantuan ini\n");
  console.log("Contoh:");
  console.log("  wibu");
  console.log("  wibu run kode.wibu");
  console.log("  wibu build kode.wibu -o hasil.js");
  console.log("  wibu convert kode.wibu --to rongawi");
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

function handleBuild(args: string[]): void {
  const targetFile = args[0];
  if (!targetFile) {
    console.error("[Error] Berkas target .wibu diperlukan untuk 'build'.");
    console.error("Penggunaan: wibu build <berkas.wibu> [-o output.js]");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`[Error] Berkas tidak ditemukan: ${resolvedPath}`);
    process.exit(1);
  }

  let outputPath = resolvedPath.replace(/\.wibu$/i, ".js");
  const oIdx = args.indexOf("-o");
  if (oIdx !== -1 && args[oIdx + 1]) {
    outputPath = path.resolve(process.cwd(), args[oIdx + 1]!);
  }

  try {
    const sourceCode = fs.readFileSync(resolvedPath, "utf-8");
    const jsCode = transpileToJS(sourceCode);
    fs.writeFileSync(outputPath, jsCode, "utf-8");
    console.log(`✨ Sukses mengompilasi '${targetFile}' ke '${path.basename(outputPath)}'`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Build Error] ${msg}`);
    process.exit(1);
  }
}

function handleConvert(args: string[]): void {
  const targetFile = args[0];
  if (!targetFile) {
    console.error("[Error] Berkas target diperlukan untuk 'convert'.");
    console.error("Penggunaan: wibu convert <berkas.wibu> --to <murni|singkat|wibu|rongawi> [-o output.wibu]");
    process.exit(1);
  }

  const toIdx = args.indexOf("--to");
  if (toIdx === -1 || !args[toIdx + 1]) {
    console.error("[Error] Opsi '--to <dialek>' diperlukan. Pilihan: murni, singkat, wibu, rongawi.");
    process.exit(1);
  }

  const targetDialect = args[toIdx + 1]!.toLowerCase() as Dialect;
  if (!["murni", "singkat", "wibu", "rongawi"].includes(targetDialect)) {
    console.error(`[Error] Dialek tidak valid: '${targetDialect}'. Pilihan: murni, singkat, wibu, rongawi.`);
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`[Error] Berkas tidak ditemukan: ${resolvedPath}`);
    process.exit(1);
  }

  const oIdx = args.indexOf("-o");
  const outputPath = oIdx !== -1 && args[oIdx + 1] ? path.resolve(process.cwd(), args[oIdx + 1]!) : null;

  try {
    const sourceCode = fs.readFileSync(resolvedPath, "utf-8");
    const convertedCode = convertDialect(sourceCode, targetDialect);

    if (outputPath) {
      fs.writeFileSync(outputPath, convertedCode, "utf-8");
      console.log(`✨ Sukses mengonversi dialek ke '${targetDialect}' pada '${path.basename(outputPath)}'`);
    } else {
      console.log(convertedCode);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Convert Error] ${msg}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    startREPL();
    return;
  }

  const firstArg = args[0];
  if (!firstArg) {
    startREPL();
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

    case "repl":
      startREPL();
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

    case "build":
      handleBuild(args.slice(1));
      return;

    case "convert":
      handleConvert(args.slice(1));
      return;

    default: {
      if (firstArg.startsWith("-")) {
        console.error(`[Error] Opsi tidak dikenal: ${firstArg}`);
        console.error("Jalankan 'wibu --help' untuk melihat panduan penggunaan.");
        process.exit(1);
      }
      await executeFile(firstArg);
      return;
    }
  }
}

void main();
