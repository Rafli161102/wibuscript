import { stdin, stdout } from "node:process";
import { formatRuntimeValue, runWibuScriptAsync } from "../dist/index.js";

const MAX_INPUT_BYTES = 4_100_000;
let input = "";
let inputTooLarge = false;
stdin.setEncoding("utf8");
for await (const chunk of stdin) {
  input += chunk;
  if (Buffer.byteLength(input, "utf8") > MAX_INPUT_BYTES) {
    inputTooLarge = true;
    break;
  }
}

if (inputTooLarge) {
  stdout.write(JSON.stringify({
    success: false,
    output: [],
    error: "Payload runner melebihi batas input container.",
  }));
  process.exitCode = 1;
} else try {
  const payload = JSON.parse(input);
  if (typeof payload.source !== "string") {
    throw new Error("Field source wajib berupa string.");
  }

  const startedAt = Date.now();
  const result = await runWibuScriptAsync(payload.source, {
    allowFs: false,
    maxLoopIterations: 100_000,
    maxCallStackDepth: 500,
    timeoutMs: Math.max(100, Math.min(Number(payload.timeoutMs) || 10_000, 60_000)),
  });

  const response = {
    success: !result.error,
    output: result.outputLog,
    result: formatRuntimeValue(result.lastValue),
    error: result.error,
    executionTimeMs: Date.now() - startedAt,
  };
  stdout.write(JSON.stringify(response));
  if (result.error) process.exitCode = 1;
} catch (error) {
  stdout.write(JSON.stringify({
    success: false,
    output: [],
    error: error instanceof Error ? error.message : String(error),
    executionTimeMs: 0,
  }));
  process.exitCode = 1;
}
