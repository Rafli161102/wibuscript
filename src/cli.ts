// File: src/cli.ts
// ============================================================================
// WIBUSCRIPT CLI RUNNER
// Eksekutor Command Line Interface untuk menjalankan berkas .wibu,
// memulai REPL interaktif, mengompilasi ke JavaScript, mengonversi antar-dialek,
// memasang dependensi (Wibu PM), serta menjalankan Language Server (LSP).
// ============================================================================

import * as fs from "node:fs";
import * as path from "node:path";
import {
  runWibuScript,
  transpileToJS,
  convertDialect,
  type Dialect,
  transpileDOM,
  generateBrowserHTML,
} from "./index";
import { startREPL } from "./repl";
import { installPackage } from "./pm";
import { startLanguageServer } from "./lsp";
import { validateSource } from "./diagnostics";
import { formatSource } from "./formatter";

const packageMetadata = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as { version: string };
const WIBU_VERSION = packageMetadata.version;

function printUsage(): void {
  console.log(`WibuScript CLI v${WIBU_VERSION}`);
  console.log("Bahasa Pemrograman Modern Berbasis Sistem 4 Dialek Mutlak\n");
  console.log("Penggunaan:");
  console.log("  wibu                          Memulai REPL interaktif");
  console.log("  wibu repl                     Memulai REPL interaktif");
  console.log("  wibu run <berkas.wibu>        Menjalankan berkas WibuScript");
  console.log("  wibu web <berkas.wibu>        Kompilasi web browser/DOM (opsi: -o <output.html>, --title <judul>)");
  console.log("  wibu <berkas.wibu>            Menjalankan berkas WibuScript (pintasan)");
  console.log("  wibu build <berkas.wibu>      Kompilasi berkas ke JavaScript (opsi: -o <output.js>, --dom)");
  console.log("  wibu check <berkas.wibu>      Periksa sintaks tanpa menjalankan program");
  console.log("  wibu format <berkas.wibu>     Rapikan indentasi (opsi: -o <output.wibu>, --write, --check)");
  console.log("  wibu convert <berkas> --to <dialek>  Konversi antar-dialek (murni, singkat, wibu, rongawi)");
  console.log("  wibu add <paket>              Mengunduh pustaka pihak ketiga ke node_modules");
  console.log("  wibu lsp                      Menjalankan Wibu Language Server Protocol (LSP)");
  console.log("  wibu --version, -v            Menampilkan versi CLI");
  console.log("  wibu --help, -h               Menampilkan bantuan ini\n");
  console.log("Contoh:");
  console.log("  wibu");
  console.log("  wibu run kode.wibu");
  console.log("  wibu build kode.wibu -o hasil.js");
  console.log("  wibu format kode.wibu");
  console.log("  wibu convert kode.wibu --to rongawi");
  console.log("  wibu add matematika-wibu");
  console.log("  wibu lsp");
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
  const isDom = args.includes("--dom");
  const filteredArgs = args.filter((a) => a !== "--dom");
  const targetFile = filteredArgs[0];
  if (!targetFile) {
    console.error("[Error] Berkas target .wibu diperlukan untuk 'build'.");
    console.error("Penggunaan: wibu build <berkas.wibu> [-o output.js] [--dom]");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`[Error] Berkas tidak ditemukan: ${resolvedPath}`);
    process.exit(1);
  }

  let outputPath = resolvedPath.replace(/\.wibu$/i, ".js");
  const oIdx = filteredArgs.indexOf("-o");
  if (oIdx !== -1 && filteredArgs[oIdx + 1]) {
    outputPath = path.resolve(process.cwd(), filteredArgs[oIdx + 1]!);
  }

  try {
    const sourceCode = fs.readFileSync(resolvedPath, "utf-8");
    const jsCode = isDom
      ? transpileDOM(sourceCode, { wrapInIIFE: true, waitForDOM: true })
      : transpileToJS(sourceCode);
    fs.writeFileSync(outputPath, jsCode, "utf-8");
    console.log(
      `[Build Sukses] Sukses mengompilasi '${targetFile}' ke '${path.basename(outputPath)}'${isDom ? " (DOM Mode)" : ""}`
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Build Error] ${msg}`);
    process.exit(1);
  }
}

function handleWeb(args: string[]): void {
  const targetFile = args[0];
  if (!targetFile || targetFile.startsWith("-")) {
    console.error("[Error] Berkas target .wibu diperlukan untuk 'web'.");
    console.error("Penggunaan: wibu web <berkas.wibu> [-o output.html] [--title <judul>]");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`[Error] Berkas tidak ditemukan: ${resolvedPath}`);
    process.exit(1);
  }

  let title = "WibuScript Frontend Application";
  const titleIdx = args.indexOf("--title");
  if (titleIdx !== -1 && args[titleIdx + 1]) {
    title = args[titleIdx + 1]!;
  }

  let outputPath = resolvedPath.replace(/\.wibu$/i, ".html");
  const oIdx = args.indexOf("-o");
  if (oIdx !== -1 && args[oIdx + 1]) {
    outputPath = path.resolve(process.cwd(), args[oIdx + 1]!);
  }

  try {
    const sourceCode = fs.readFileSync(resolvedPath, "utf-8");
    const isJsTarget = outputPath.endsWith(".js");
    const content = isJsTarget
      ? transpileDOM(sourceCode, { wrapInIIFE: true, waitForDOM: true })
      : generateBrowserHTML(sourceCode, { title });
    fs.writeFileSync(outputPath, content, "utf-8");
    console.log(
      `[Web Sukses] Berkas web frontend berhasil dihasilkan di '${path.basename(outputPath)}'`
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Web Error] ${msg}`);
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
      console.log(`[Convert Sukses] Sukses mengonversi dialek ke '${targetDialect}' pada '${path.basename(outputPath)}'`);
    } else {
      console.log(convertedCode);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Convert Error] ${msg}`);
    process.exit(1);
  }
}

function handleCheck(args: string[]): void {
  const targetFile = args[0];
  if (!targetFile || targetFile.startsWith("-")) {
    console.error("[Error] Berkas target .wibu diperlukan untuk 'check'.");
    console.error("Penggunaan: wibu check <berkas.wibu>");
    process.exit(1);
  }
  const resolvedPath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`[Error] Berkas tidak ditemukan: ${resolvedPath}`);
    process.exit(1);
  }
  if (path.extname(resolvedPath).toLowerCase() !== ".wibu") {
    console.error("[Error] Ekstensi berkas tidak valid. Gunakan ekstensi .wibu");
    process.exit(1);
  }
  const diagnostics = validateSource(fs.readFileSync(resolvedPath, "utf-8"));
  if (diagnostics.length === 0) {
    console.log(`[Check Sukses] ${targetFile}: sintaks valid.`);
    return;
  }
  for (const diagnostic of diagnostics) {
    console.error(`[WibuScript ${diagnostic.phase} Error] ${targetFile}:${diagnostic.line}:${diagnostic.column}`);
    console.error(`  ${diagnostic.message}`);
    if (diagnostic.sourceLine) {
      console.error(`  ${diagnostic.sourceLine}`);
      console.error(`  ${" ".repeat(Math.max(0, diagnostic.column - 1))}^`);
    }
    if (diagnostic.suggestion) console.error(`  Saran: ${diagnostic.suggestion}`);
  }
  process.exitCode = 1;
}


function handleFormat(args: string[]): void {
  const targetFile = args[0];
  if (!targetFile || targetFile.startsWith("-")) {
    console.error("[Error] Berkas target .wibu diperlukan untuk 'format'.");
    console.error("Penggunaan: wibu format <berkas.wibu> [-o output.wibu | --write | --check]");
    process.exit(1);
  }
  const resolvedPath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error("[Error] Berkas tidak ditemukan: " + resolvedPath);
    process.exit(1);
  }
  if (path.extname(resolvedPath).toLowerCase() !== ".wibu") {
    console.error("[Error] Ekstensi berkas tidak valid. Gunakan ekstensi .wibu");
    process.exit(1);
  }
  const writeInPlace = args.includes("--write");
  const checkOnly = args.includes("--check");
  const outputIndex = args.indexOf("-o");
  if ((writeInPlace && outputIndex !== -1) || (checkOnly && (writeInPlace || outputIndex !== -1))) {
    console.error("[Error] Pilih satu mode: --write, --check, atau -o.");
    process.exit(1);
  }
  if (outputIndex !== -1 && !args[outputIndex + 1]) {
    console.error("[Error] Jalur output setelah -o diperlukan.");
    process.exit(1);
  }
  try {
    const source = fs.readFileSync(resolvedPath, "utf-8");
    const formatted = formatSource(source);
    if (checkOnly) {
      if (formatted === source) {
        console.log("[Format Check] " + targetFile + " sudah rapi.");
      } else {
        console.error("[Format Check] " + targetFile + " belum diformat. Jalankan: wibu format " + targetFile + " --write");
        process.exitCode = 1;
      }
    } else if (writeInPlace) {
      fs.writeFileSync(resolvedPath, formatted, "utf-8");
      console.log("[Format Sukses] " + targetFile + " diperbarui.");
    } else if (outputIndex !== -1) {
      const outputPath = path.resolve(process.cwd(), args[outputIndex + 1]!);
      fs.writeFileSync(outputPath, formatted, "utf-8");
      console.log("[Format Sukses] Hasil ditulis ke '" + path.basename(outputPath) + "'.");
    } else {
      process.stdout.write(formatted);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Format Error] " + message);
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

    case "web":
      handleWeb(args.slice(1));
      return;

    case "build":
      handleBuild(args.slice(1));
      return;

    case "check":
      handleCheck(args.slice(1));
      return;

    case "format":
      handleFormat(args.slice(1));
      return;

    case "convert":
      handleConvert(args.slice(1));
      return;

    case "add": {
      const targetPkg = args[1];
      if (!targetPkg) {
        console.error("[Error] Nama paket pihak ketiga diperlukan setelah 'add'.");
        console.error("Penggunaan: wibu add <nama-paket>");
        process.exit(1);
      }
      const success = installPackage(targetPkg);
      if (!success) {
        process.exit(1);
      }
      return;
    }

    case "lsp":
      startLanguageServer();
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
