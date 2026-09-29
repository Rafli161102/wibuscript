// File: scripts/generate-grammars.ts
// ============================================================================
// WIBUSCRIPT GRAMMAR GENERATOR SCRIPT
// Membaca definisi dialek dari Single Source of Truth (src/dialect-definitions.ts)
// dan menghasilkan konfigurasi grammar untuk:
// 1. VS Code TextMate Grammar (vscode-extension/syntaxes/wibuscript.tmLanguage.json)
// 2. Monaco Monarch Tokenizer Configuration (Web Playground)
// Sesuai Roadmap Bagian 4.3 & 12 (v2.0 Compiler Pipeline).
// ============================================================================

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateTextMateGrammar,
  generateMonarchTokensProvider,
  DIALECTS,
  type DialectId,
  getKeywordsByCategory,
} from "../src/dialect-definitions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

export function buildGrammars(): {
  textMatePath: string;
  textMateContent: string;
  monarchConfig: Record<string, unknown>;
} {
  const textMateGrammar = generateTextMateGrammar();
  const monarchConfig = generateMonarchTokensProvider();

  const textMatePath = path.join(
    ROOT_DIR,
    "vscode-extension",
    "syntaxes",
    "wibuscript.tmLanguage.json"
  );

  const textMateContent = JSON.stringify(textMateGrammar, null, 2) + "\n";

  // Pastikan folder target tersedia
  const dir = path.dirname(textMatePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Tulis berkas TextMate Grammar
  fs.writeFileSync(textMatePath, textMateContent, "utf-8");

  return {
    textMatePath,
    textMateContent,
    monarchConfig,
  };
}

// Eksekusi langsung jika dipanggil via CLI
if (
  process.argv[1] &&
  (process.argv[1].endsWith("generate-grammars.ts") ||
    process.argv[1].endsWith("generate-grammars.js"))
) {
  try {
    const { textMatePath, monarchConfig } = buildGrammars();
    const relPath = path.relative(ROOT_DIR, textMatePath);

    process.stdout.write(`Grammar berhasil dihasilkan dari single source of truth.\n`);
    process.stdout.write(`1. TextMate Grammar ditulis ke: ${relPath}\n`);
    process.stdout.write(
      `2. Monaco Monarch Tokenizer siap untuk Web Playground (${
        (monarchConfig.controlKeywords as string[]).length
      } keyword kontrol, ${
        (monarchConfig.declarationKeywords as string[]).length
      } deklarasi, ${
        (monarchConfig.supportFunctions as string[]).length
      } fungsi bawaan).\n`
    );

    for (const d of Object.keys(DIALECTS) as DialectId[]) {
      const meta = DIALECTS[d];
      const ctrl = getKeywordsByCategory("controlKeywords", d, false).length;
      const decl = getKeywordsByCategory("declarationKeywords", d, false).length;
      const fn = getKeywordsByCategory("supportFunctions", d, false).length;
      process.stdout.write(
        `   - Dialek [${meta.id.toUpperCase()}] ${meta.name}: ${ctrl} kontrol, ${decl} deklarasi, ${fn} fungsi.\n`
      );
    }
  } catch (err) {
    process.stderr.write(`Gagal menghasilkan grammar: ${String(err)}\n`);
    process.exit(1);
  }
}
