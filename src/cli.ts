// ============================================================================
// WIBUSCRIPT CLI RUNNER
// Menangani eksekusi berkas .wibu melalui terminal Node.js.
// ============================================================================

import * as fs from "node:fs";
import * as path from "node:path";
import { runWibuScript } from "./index";

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Penggunaan: npx tsx src/cli.ts <berkas.wibu>");
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
  await runWibuScript(sourceCode);
}

void main();
