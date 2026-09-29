// File: src/modules/server.ts
// ============================================================================
// MODUL DOMAIN SERVER WIBUSCRIPT (wibuscript/server)
// Wrapper fungsi tipis ke http Node.js untuk server HTTP sederhana.
// Mendukung eksekusi di Node.js (http server asli) dan Browser (simulasi memori).
// Mematuhi kesetaraan Sistem 4 Dialek Mutlak WibuScript.
// ============================================================================

export interface WibuRequest {
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string>;
  body: any;
  rawRequest?: any;
}

export interface WibuResponse {
  status: (code: number) => WibuResponse;
  setHeader: (name: string, value: string) => WibuResponse;
  send: (data: any, statusCode?: number) => void;
  json: (data: any, statusCode?: number) => void;

  // Alias 4 Dialek Mutlak
  kaesu: (data: any, statusCode?: number) => void;
  kae: (data: any, statusCode?: number) => void;
  kirimBalik: (data: any, statusCode?: number) => void;
  balasmas: (data: any, statusCode?: number) => void;

  kanjiKaesu: (data: any, statusCode?: number) => void;
  kjKae: (data: any, statusCode?: number) => void;
  kirimJson: (data: any, statusCode?: number) => void;
  balasjson: (data: any, statusCode?: number) => void;

  rawResponse?: any;
}

export type HttpHandler = (req: WibuRequest, res: WibuResponse) => void | Promise<void>;

export class WibuServer {
  public rawServer: any = null;
  private handler: HttpHandler;
  private isListening: boolean = false;
  private port: number = 0;

  constructor(handler?: HttpHandler) {
    this.handler = handler ?? ((_req, res) => res.send("OK", 200));
    this.initNativeServer();
  }

  private initNativeServer(): void {
    if (typeof process !== "undefined" && process.versions?.node) {
      try {
        // Impor http Node.js secara dinamis agar aman di lingkungan bundler browser
        const http = require("node:http");
        this.rawServer = http.createServer(async (req: any, res: any) => {
          let bodyRaw = "";
          req.on("data", (chunk: Buffer) => {
            bodyRaw += chunk.toString("utf-8");
          });

          req.on("end", async () => {
            let parsedBody: any = bodyRaw;
            if (bodyRaw) {
              try {
                parsedBody = JSON.parse(bodyRaw);
              } catch {
                parsedBody = bodyRaw;
              }
            }

            const parsedUrl = new URL(req.url ?? "/", "http://localhost");
            const query: Record<string, string> = {};
            parsedUrl.searchParams.forEach((v, k) => {
              query[k] = v;
            });

            const wReq: WibuRequest = {
              url: req.url ?? "/",
              method: (req.method ?? "GET").toUpperCase(),
              headers: req.headers ?? {},
              query,
              body: parsedBody,
              rawRequest: req
            };

            let currentStatus = 200;

            const sendData = (data: any, statusCode?: number) => {
              if (res.writableEnded) return;
              if (statusCode !== undefined) currentStatus = statusCode;
              res.statusCode = currentStatus;
              if (!res.getHeader("Content-Type")) {
                res.setHeader("Content-Type", "text/html; charset=utf-8");
              }
              const output = typeof data === "object" && data !== null ? JSON.stringify(data) : String(data ?? "");
              res.end(output);
            };

            const sendJson = (data: any, statusCode?: number) => {
              if (res.writableEnded) return;
              if (statusCode !== undefined) currentStatus = statusCode;
              res.statusCode = currentStatus;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify(data));
            };

            const wRes: WibuResponse = {
              status: (code: number) => {
                currentStatus = code;
                return wRes;
              },
              setHeader: (name: string, value: string) => {
                res.setHeader(name, value);
                return wRes;
              },
              send: sendData,
              json: sendJson,

              // 4 Dialek Alias
              kaesu: sendData,
              kae: sendData,
              kirimBalik: sendData,
              balasmas: sendData,

              kanjiKaesu: sendJson,
              kjKae: sendJson,
              kirimJson: sendJson,
              balasjson: sendJson,

              rawResponse: res
            };

            try {
              await this.handler(wReq, wRes);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              if (!res.writableEnded) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ error: msg }));
              }
            }
          });
        });

        this.rawServer.on("error", (_err: any) => {
          // Mencegah uncaught exception bila terjadi kegagalan socket atau port bentrok
        });
      } catch {
        // Fallback untuk runtime non-Node
      }
    }
  }

  public listen(port: number, hostOrCallback?: string | Function, callback?: Function): WibuServer {
    this.port = port;
    this.isListening = true;

    let cb: Function | undefined;
    let host: string | undefined;

    if (typeof hostOrCallback === "function") {
      cb = hostOrCallback;
    } else if (typeof hostOrCallback === "string") {
      host = hostOrCallback;
      cb = callback;
    }

    if (this.rawServer && typeof this.rawServer.listen === "function") {
      if (host) {
        this.rawServer.listen(port, host, () => {
          if (cb) cb();
        });
      } else {
        this.rawServer.listen(port, () => {
          if (cb) cb();
        });
      }
    } else if (cb) {
      setTimeout(() => cb!(), 1);
    }

    return this;
  }

  public close(callback?: Function): WibuServer {
    this.isListening = false;
    if (this.rawServer && typeof this.rawServer.close === "function") {
      this.rawServer.close(callback);
    } else if (callback) {
      setTimeout(() => callback(), 1);
    }
    return this;
  }

  /**
   * Mensimulasikan pemanggilan request tanpa perlu membuka port fisik.
   * Sangat berguna untuk pengujian unit dan lingkungan sandbox peramban.
   */
  public async simulate(
    url: string = "/",
    method: string = "GET",
    body: any = null,
    headers: Record<string, string> = {}
  ): Promise<{ status: number; body: string; headers: Record<string, string>; json?: any }> {
    let currentStatus = 200;
    const responseHeaders: Record<string, string> = {};
    let responseBody = "";

    const parsedUrl = new URL(url, "http://localhost");
    const query: Record<string, string> = {};
    parsedUrl.searchParams.forEach((v, k) => {
      query[k] = v;
    });

    const wReq: WibuRequest = {
      url,
      method: method.toUpperCase(),
      headers: { ...headers },
      query,
      body
    };

    const sendData = (data: any, statusCode?: number) => {
      if (statusCode !== undefined) currentStatus = statusCode;
      responseBody = typeof data === "object" && data !== null ? JSON.stringify(data) : String(data ?? "");
    };

    const sendJson = (data: any, statusCode?: number) => {
      if (statusCode !== undefined) currentStatus = statusCode;
      responseHeaders["content-type"] = "application/json; charset=utf-8";
      responseBody = JSON.stringify(data);
    };

    const wRes: WibuResponse = {
      status: (code: number) => {
        currentStatus = code;
        return wRes;
      },
      setHeader: (name: string, value: string) => {
        responseHeaders[name.toLowerCase()] = value;
        return wRes;
      },
      send: sendData,
      json: sendJson,

      kaesu: sendData,
      kae: sendData,
      kirimBalik: sendData,
      balasmas: sendData,

      kanjiKaesu: sendJson,
      kjKae: sendJson,
      kirimJson: sendJson,
      balasjson: sendJson
    };

    await this.handler(wReq, wRes);

    let parsedJson: any = undefined;
    if (responseHeaders["content-type"]?.includes("json")) {
      try {
        parsedJson = JSON.parse(responseBody);
      } catch {
        // Abaikan
      }
    }

    return {
      status: currentStatus,
      body: responseBody,
      headers: responseHeaders,
      json: parsedJson
    };
  }

  // Alias 4 Dialek Mutlak pada Instance Server
  public kiku(port: number, cb?: Function): WibuServer {
    return this.listen(port, cb);
  }
  public ki(port: number, cb?: Function): WibuServer {
    return this.listen(port, cb);
  }
  public dengerin(port: number, cb?: Function): WibuServer {
    return this.listen(port, cb);
  }
  public pasangkuping(port: number, cb?: Function): WibuServer {
    return this.listen(port, cb);
  }

  public yame(cb?: Function): WibuServer {
    return this.close(cb);
  }
  public ya(cb?: Function): WibuServer {
    return this.close(cb);
  }
  public tutupBanh(cb?: Function): WibuServer {
    return this.close(cb);
  }
  public kelarngawi(cb?: Function): WibuServer {
    return this.close(cb);
  }
}

/**
 * Membuat instance HTTP Server sederhana WibuScript.
 */
export function createServer(handler?: HttpHandler): WibuServer {
  return new WibuServer(handler);
}

// ============================================================================
// ALIAS KESETARAAN 4 DIALEK MUTLAK WIBUSCRIPT
// ============================================================================

// 1. Jepang Murni (Formal & Presisi)
export const sabahTsukuru = createServer;

// 2. Jepang Singkat (Minimalis Shorthand)
export const saaTsu = createServer;

// 3. Wibu Absurd (Slang Otaku)
export const bikinServer = createServer;

// 4. Meme Rongawi (Kultur Ngawiverse)
export const pabrikserver = createServer;

// 5. Universal & Standar
export const buatServer = createServer;

export default {
  createServer,
  buatServer,
  sabahTsukuru,
  saaTsu,
  bikinServer,
  pabrikserver,
  WibuServer
};
