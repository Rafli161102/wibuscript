// WibuScript Playground execution worker.
// Code is interpreted inside a dedicated worker, not on the UI thread.
import { tokenize } from "./lexer";
import { Parser } from "./parser";
import { createGlobalEnvironment, evaluate, registerVirtualModule, unwrapSignal } from "./runtime";
import { transpileToJS } from "./transpiler";

type ExecuteMessage = { type: "EXECUTE"; id: string; code: string };
type WorkerScope = {
  postMessage: (message: unknown) => void;
  addEventListener: (type: "message", listener: (event: MessageEvent<ExecuteMessage>) => void) => void;
};

const scope = self as unknown as WorkerScope;
const MAX_SOURCE_LENGTH = 1_000_000;
const MAX_OUTPUT_LINES = 1_000;
const MAX_OUTPUT_LINE_LENGTH = 10_000;

// Keep the built-in OOP demo available inside the worker's own virtual-module registry.
registerVirtualModule(
  "./ninja.wibu",
  `// Modul Virtual Ninja (Playground Demo)
koukai jutsu jurusBayangan(jumlah) {
  kaesu \`Muncul \${jumlah} kage bunshin!\`
}

koukai sekte Senjata {
  tanjou(nama) {
    jibun.nama = nama
  }
  lempar() {
    kaesu \`Melempar \${jibun.nama} kena sasaran!\`
  }
}`
);

// The Playground runner deliberately has no network, nested-worker, or browser-I/O APIs.
const deny = (name: string) => () => {
  throw new Error(`API ${name} dinonaktifkan di Playground WibuScript.`);
};
for (const name of [
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "Worker",
  "SharedWorker",
  "BroadcastChannel",
  "WebTransport",
  "RTCPeerConnection",
  "importScripts",
]) {
  try {
    Object.defineProperty(globalThis, name, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: deny(name),
    });
  } catch {
    // Some browser globals may be non-configurable already; the runtime still
    // exposes no direct JavaScript evaluation or host-object bridge to Wibu code.
  }
}

scope.addEventListener("message", async (event) => {
  const request = event.data;
  if (!request || request.type !== "EXECUTE") return;

  const { id, code } = request;
  const startedAt = Date.now();
  let outputCount = 0;
  let outputTruncated = false;
  const send = (type: string, payload: Record<string, unknown> = {}) =>
    scope.postMessage({ type, id, ...payload });
  const output = (line: string) => {
    if (outputCount < MAX_OUTPUT_LINES) {
      outputCount += 1;
      const safeLine = line.length > MAX_OUTPUT_LINE_LENGTH
        ? `${line.slice(0, MAX_OUTPUT_LINE_LENGTH)}… [baris dipotong]`
        : line;
      send("OUTPUT", { line: safeLine });
    } else if (!outputTruncated) {
      outputTruncated = true;
      send("OUTPUT", { line: "[Sistem] Output dibatasi hingga 1.000 baris." });
    }
  };

  try {
    if (typeof code !== "string" || code.length > MAX_SOURCE_LENGTH) {
      throw new Error("Ukuran kode melebihi batas Playground (maksimal 1 MB).");
    }

    const tokens = tokenize(code);
    send("TOKENS", { tokens, tokenCount: tokens.length });

    const program = new Parser(500).produceAST(tokens);
    send("AST", { astJson: JSON.stringify(program, null, 2) });

    try {
      send("TRANSPILED", { code: transpileToJS(code) });
    } catch {
      send("TRANSPILED", { code: "// Gagal mengompilasi ke JavaScript" });
    }

    const environment = createGlobalEnvironment({
      outputHandler: output,
      maxLoopIterations: 50_000,
      maxCallStackDepth: 500,
      timeoutMs: 9_000,
      allowFs: false,
    });

    await evaluate(program, environment).then(unwrapSignal);
    send("SUCCESS", { executionTimeMs: Date.now() - startedAt });
  } catch (error: unknown) {
    send("ERROR", {
      error: error instanceof Error ? error.message : String(error),
      executionTimeMs: Date.now() - startedAt,
    });
  }
});
