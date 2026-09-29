// File: vscode-extension/extension.js
// ============================================================================
// WibuScript Visual Studio Code Language Client
// Menyambungkan Visual Studio Code ke Wibu Language Server Protocol (wibu lsp)
// secara native melalui Standard I/O (stdin/stdout) tanpa dependensi eksternal.
// ============================================================================

const vscode = require("vscode");
const cp = require("child_process");
const path = require("path");
const fs = require("fs");

let lspProcess = null;
let diagnosticCollection = null;
let requestId = 1;
const pendingRequests = new Map();
let messageBuffer = Buffer.alloc(0);

/**
 * Mencari executable LSP WibuScript di sistem.
 */
function resolveLspCommand(context) {
  const config = vscode.workspace.getConfiguration("wibuscript");
  const configuredPath = config.get("lsp.executablePath");
  if (configuredPath && typeof configuredPath === "string" && configuredPath.trim()) {
    return { command: configuredPath, args: ["lsp"] };
  }

  // Cek apakah proyek lokal memiliki dist/cli.js
  const localCliPath = path.resolve(context.extensionPath, "../dist/cli.js");
  if (fs.existsSync(localCliPath)) {
    return { command: process.execPath, args: [localCliPath, "lsp"] };
  }

  // Fallback ke perintah global 'wibu'
  return { command: "wibu", args: ["lsp"] };
}

/**
 * Mengirimkan pesan JSON-RPC ke Wibu LSP melalui stdin.
 */
function sendJsonRpc(proc, message) {
  if (!proc || !proc.stdin || proc.stdin.destroyed) {
    return;
  }
  const payload = JSON.stringify(message);
  const buf = Buffer.from(payload, "utf-8");
  const headers = `Content-Length: ${buf.length}\r\n\r\n`;
  proc.stdin.write(headers);
  proc.stdin.write(buf);
}

/**
 * Mengirim permintaan request dan mengembalikan Promise hasil JSON-RPC.
 */
function requestLsp(proc, method, params) {
  return new Promise((resolve, reject) => {
    if (!proc || !proc.stdin || proc.stdin.destroyed) {
      return reject(new Error("LSP Process tidak aktif."));
    }
    const id = requestId++;
    pendingRequests.set(id, { resolve, reject });
    sendJsonRpc(proc, {
      jsonrpc: "2.0",
      id,
      method,
      params
    });
  });
}

function handleLspMessage(msg) {
  // 1. Tangani response dari request
  if (msg.id !== undefined && msg.id !== null) {
    const pending = pendingRequests.get(msg.id);
    if (pending) {
      pendingRequests.delete(msg.id);
      if (msg.error) {
        pending.reject(new Error(msg.error.message || "LSP Error"));
      } else {
        pending.resolve(msg.result);
      }
    }
    return;
  }

  // 2. Tangani notifikasi diagnostik real-time dari server
  if (msg.method === "textDocument/publishDiagnostics" && msg.params) {
    const { uri, diagnostics } = msg.params;
    if (!diagnosticCollection || !uri) return;

    const targetUri = vscode.Uri.parse(uri);
    const vscodeDiagnostics = (diagnostics || []).map((d) => {
      const range = new vscode.Range(
        new vscode.Position(d.range.start.line, d.range.start.character),
        new vscode.Position(d.range.end.line, d.range.end.character)
      );
      const diag = new vscode.Diagnostic(range, d.message, vscode.DiagnosticSeverity.Error);
      diag.source = d.source || "wibuscript";
      return diag;
    });

    diagnosticCollection.set(targetUri, vscodeDiagnostics);
  }
}

/**
 * Mengaktifkan ekstensi WibuScript Language Client.
 */
function activate(context) {
  const { command, args } = resolveLspCommand(context);

  try {
    lspProcess = cp.spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      shell: process.platform === "win32"
    });
  } catch (err) {
    console.warn("[Wibu LSP] Gagal memulai Wibu LSP process:", err);
    return;
  }

  diagnosticCollection = vscode.languages.createDiagnosticCollection("wibuscript");
  context.subscriptions.push(diagnosticCollection);

  // Buffer chunk parser JSON-RPC dari stdout LSP
  lspProcess.stdout.on("data", (chunk) => {
    messageBuffer = Buffer.concat([messageBuffer, chunk]);

    while (true) {
      const headerSeparator = messageBuffer.indexOf("\r\n\r\n");
      if (headerSeparator === -1) break;

      const headerText = messageBuffer.slice(0, headerSeparator).toString("utf-8");
      const match = headerText.match(/Content-Length:\s*(\d+)/i);
      if (!match || !match[1]) {
        messageBuffer = messageBuffer.slice(headerSeparator + 4);
        continue;
      }

      const contentLength = parseInt(match[1], 10);
      const bodyStartIndex = headerSeparator + 4;
      const totalMessageLength = bodyStartIndex + contentLength;

      if (messageBuffer.length < totalMessageLength) break;

      const bodyBuffer = messageBuffer.slice(bodyStartIndex, totalMessageLength);
      messageBuffer = messageBuffer.slice(totalMessageLength);

      try {
        const parsed = JSON.parse(bodyBuffer.toString("utf-8"));
        handleLspMessage(parsed);
      } catch (e) {
        console.error("[Wibu LSP Parse Error]", e);
      }
    }
  });

  lspProcess.stderr.on("data", (errChunk) => {
    console.error(`[Wibu LSP stderr] ${errChunk.toString()}`);
  });

  lspProcess.on("exit", (code) => {
    console.log(`[Wibu LSP] Server keluar dengan kode: ${code}`);
  });

  // Kirim handshake inisialisasi
  sendJsonRpc(lspProcess, {
    jsonrpc: "2.0",
    id: requestId++,
    method: "initialize",
    params: {
      processId: process.pid,
      rootUri: null,
      capabilities: {}
    }
  });

  // Sinkronisasi dokumen saat dibuka
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (doc.languageId !== "wibuscript") return;
      sendJsonRpc(lspProcess, {
        jsonrpc: "2.0",
        method: "textDocument/didOpen",
        params: {
          textDocument: {
            uri: doc.uri.toString(),
            version: doc.version,
            text: doc.getText()
          }
        }
      });
    })
  );

  // Sinkronisasi dokumen saat diubah (real-time diagnostics)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.languageId !== "wibuscript") return;
      sendJsonRpc(lspProcess, {
        jsonrpc: "2.0",
        method: "textDocument/didChange",
        params: {
          textDocument: {
            uri: event.document.uri.toString(),
            version: event.document.version
          },
          contentChanges: [{ text: event.document.getText() }]
        }
      });
    })
  );

  // Sinkronisasi dokumen saat ditutup
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      if (doc.languageId !== "wibuscript") return;
      sendJsonRpc(lspProcess, {
        jsonrpc: "2.0",
        method: "textDocument/didClose",
        params: {
          textDocument: { uri: doc.uri.toString() }
        }
      });
    })
  );

  // Validasi seluruh dokumen yang sudah terbuka saat ekstensi aktif
  vscode.workspace.textDocuments.forEach((doc) => {
    if (doc.languageId === "wibuscript") {
      sendJsonRpc(lspProcess, {
        jsonrpc: "2.0",
        method: "textDocument/didOpen",
        params: {
          textDocument: {
            uri: doc.uri.toString(),
            version: doc.version,
            text: doc.getText()
          }
        }
      });
    }
  });

  // Provider Autocomplete (Completion)
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "wibuscript",
      {
        async provideCompletionItems(doc, pos) {
          try {
            const result = await requestLsp(lspProcess, "textDocument/completion", {
              textDocument: { uri: doc.uri.toString() },
              position: { line: pos.line, character: pos.character }
            });

            if (!Array.isArray(result)) return [];

            return result.map((item) => {
              const comp = new vscode.CompletionItem(item.label);
              comp.detail = item.detail;
              if (item.documentation) {
                comp.documentation = new vscode.MarkdownString(item.documentation);
              }
              if (item.insertText) {
                comp.insertText = item.insertTextFormat === 2
                  ? new vscode.SnippetString(item.insertText)
                  : item.insertText;
              }
              return comp;
            });
          } catch {
            return [];
          }
        }
      },
      ".", " ", "(", ":"
    )
  );

  // Provider Hover
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("wibuscript", {
      async provideHover(doc, pos) {
        try {
          const result = await requestLsp(lspProcess, "textDocument/hover", {
            textDocument: { uri: doc.uri.toString() },
            position: { line: pos.line, character: pos.character }
          });
          if (result && result.contents && result.contents.value) {
            return new vscode.Hover(new vscode.MarkdownString(result.contents.value));
          }
          return null;
        } catch {
          return null;
        }
      }
    })
  );

  // Provider Document Symbols
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider("wibuscript", {
      async provideDocumentSymbols(doc) {
        try {
          const result = await requestLsp(lspProcess, "textDocument/documentSymbol", {
            textDocument: { uri: doc.uri.toString() }
          });
          if (!Array.isArray(result)) return [];

          const mapSymbol = (s) => {
            const range = new vscode.Range(
              new vscode.Position(s.range.start.line, s.range.start.character),
              new vscode.Position(s.range.end.line, s.range.end.character)
            );
            const selectionRange = new vscode.Range(
              new vscode.Position(s.selectionRange.start.line, s.selectionRange.start.character),
              new vscode.Position(s.selectionRange.end.line, s.selectionRange.end.character)
            );
            const sym = new vscode.DocumentSymbol(s.name, s.detail || "", vscode.SymbolKind.Variable, range, selectionRange);
            if (s.children && Array.isArray(s.children)) {
              sym.children = s.children.map(mapSymbol);
            }
            return sym;
          };

          return result.map(mapSymbol);
        } catch {
          return [];
        }
      }
    })
  );
}

/**
 * Menonaktifkan ekstensi.
 */
function deactivate() {
  if (lspProcess) {
    try {
      sendJsonRpc(lspProcess, {
        jsonrpc: "2.0",
        id: requestId++,
        method: "shutdown",
        params: {}
      });
      sendJsonRpc(lspProcess, {
        jsonrpc: "2.0",
        method: "exit",
        params: {}
      });
      lspProcess.kill();
    } catch {
      // Abaikan jika proses sudah ditutup
    }
    lspProcess = null;
  }
  if (diagnosticCollection) {
    diagnosticCollection.clear();
    diagnosticCollection.dispose();
  }
}

module.exports = {
  activate,
  deactivate
};
