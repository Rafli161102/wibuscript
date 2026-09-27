// File: src/repl.ts
// ============================================================================
// WIBUSCRIPT INTERACTIVE REPL
// Antarmuka baris perintah interaktif (Read-Eval-Print Loop) untuk mengeksekusi
// kode WibuScript baris-demi-baris dengan lingkungan persisten.
// ============================================================================

import * as readline from "node:readline";
import {
  tokenize,
  Parser,
  evaluate,
  createGlobalEnvironment,
  unwrapSignal,
  formatRuntimeValue,
  type Environment,
} from "./index";

export function startREPL(): void {
  console.log("==================================================");
  console.log("🌸 WibuScript REPL v1.3.0 (4 Dialek Mutlak)");
  console.log("Ketik ekspresi atau pernyataan WibuScript langsung.");
  console.log("Perintah: .exit (keluar) | .clear (bersihkan layar)");
  console.log("==================================================\n");

  const env: Environment = createGlobalEnvironment({
    outputHandler: (msg: string) => console.log(msg),
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "wibu> ",
  });

  rl.prompt();

  rl.on("line", async (line: string) => {
    const trimmed = line.trim();

    if (!trimmed) {
      rl.prompt();
      return;
    }

    if (trimmed === ".exit") {
      console.log("Sayonara! 👋");
      process.exit(0);
    }

    if (trimmed === ".clear") {
      console.clear();
      rl.prompt();
      return;
    }

    if (trimmed === ".help") {
      console.log("Contoh kode:");
      console.log('  kore x = [1, 2, 3];');
      console.log('  mite(`Hasil: ${x[0] + 10}`);');
      console.log('  utsusu(x, jutsu(n) { kaesu n * 10; });');
      rl.prompt();
      return;
    }

    try {
      const tokens = tokenize(trimmed);
      const parser = new Parser();
      const program = parser.produceAST(tokens);
      const rawResult = await evaluate(program, env);
      const finalValue = unwrapSignal(rawResult);

      if (finalValue.type !== "null") {
        console.log(`\x1b[36m=>\x1b[0m ${formatRuntimeValue(finalValue)}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`\x1b[31m${errMsg}\x1b[0m`);
    }

    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\nSayonara! 👋");
    process.exit(0);
  });
}
