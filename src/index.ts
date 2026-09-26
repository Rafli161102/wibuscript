// ============================================================================
// WIBUSCRIPT CLI ENTRY POINT
// Titik masuk utama untuk mengeksekusi berkas kode sumber WibuScript (*.wibu).
// ============================================================================

import * as fs from "node:fs";
import * as path from "node:path";
import { tokenize } from "./lexer.js";
import { Parser } from "./parser.js";
import { createGlobalEnvironment, evaluate } from "./runtime.js";

/**
 * Menjalankan kode sumber WibuScript langsung dalam runtime.
 */
export function runWibuScript(sourceCode: string): void {
  try {
    const tokens = tokenize(sourceCode);
    const parser = new Parser();
    const program = parser.produceAST(tokens);
    const environment = createGlobalEnvironment();
    evaluate(program, environment);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("[Fatal Error] Terjadi kesalahan sistem:", error);
    }
    process.exit(1);
  }
}

/**
 * Titik masuk CLI.
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("================================================================================");
    console.log("WibuScript Runtime Engine - Versi MVP");
    console.log("================================================================================");
    console.log("Penggunaan CLI:");
    console.log("  npx tsx src/index.ts <berkas.wibu>");
    console.log("  node dist/index.js <berkas.wibu>");
    console.log("\nMenjalankan demonstrasi internal kode bawaan:");

    const sampleCode = `
      // Demonstrasi Sintaks WibuScript
      kore mc = "Aria"
      koreWa status = majiBener

      moshi (mc == "Aria") {
        mite("Karakter terverifikasi: " + mc)
        kasihMite("Status aktif: " + status)
      } chigau {
        mite("Karakter tidak dikenal.")
      }

      bikinJutsu kaliDua(angka) {
        balikinDesu angka * 2
      }

      kore hasil = kaliDua(21)
      mite("Hasil perhitungan fungsi: " + hasil)
    `;

    console.log("--------------------------------------------------------------------------------");
    console.log(sampleCode.trim());
    console.log("--------------------------------------------------------------------------------");
    console.log("Output Eksekusi:");
    runWibuScript(sampleCode);
    console.log("================================================================================");
    return;
  }

  const targetFile = args[0];
  if (!targetFile) {
    console.error("[Error] Berkas target tidak ditemukan.");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), targetFile);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`[Error] Berkas tidak ditemukan: ${resolvedPath}`);
    process.exit(1);
  }

  const sourceCode = fs.readFileSync(resolvedPath, "utf-8");
  runWibuScript(sourceCode);
}

main();
