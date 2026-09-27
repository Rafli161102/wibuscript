// File: app/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  tokenize,
  Parser,
  evaluate,
  createGlobalEnvironment,
  unwrapSignal,
} from "../src/index";

// Kumpulan template kode WibuScript bawaan
const CODE_PRESETS: Record<string, string> = {
  default: `// Program Demonstrasi WibuScript (Tema RPG / Isekai)
kore namaKsatria = "Ren"
kore level = 99
kore statusIsekai = majiBener

kasihMite("Memulai simulasi petualangan dunia baru...")
tungguBentar(400)

moshi (statusIsekai == maji) {
  mite("Karakter petualang: " + namaKsatria)
  mite("Tingkat kekuatan awal: " + level)
} chigau {
  mite("Peringatan: Karakter belum terdaftar di guild!")
}

bikinJutsu kalkulasiDayaSerang(lvl) {
  moshi (lvl >= 50) {
    balikinDesu lvl * 15
  }
  balikinDesu lvl * 5
}

kore totalSerangan = kalkulasiDayaSerang(level)
tungguBentar(300)
kasihMite("Total daya serang kalkulasi: " + totalSerangan)
kasihMite("Simulasi sistem petualangan selesai.")`,

  aliasDemo: `// Demonstrasi Sistem Alias (Versi Ekstensi vs Shorthand)
// Versi Ekstensi (Indo-Jepang)
koreWa ksatriaApi = "Ignis"
koreWa statusKoneksi = majiBener

// Versi Shorthand (Romaji Murni)
kore ksatriaEs = "Glacies"
kore statusBuff = uso

kaloMoshi (statusKoneksi == maji) {
  kasihMite("[Ekstensi] Server terhubung. Ksatria aktif: " + ksatriaApi)
}

moshi (statusBuff == uso) {
  mite("[Shorthand] Status proteksi belum aktif untuk: " + ksatriaEs)
}`,

  asyncLoop: `// Demonstrasi Async Delay dengan tungguBentar
mite("Mengisi energi kristal sihir:")

kore persentase = 3
ulangZutto (persentase > 0) {
  mite("Mengisi daya kristal... level " + persentase)
  tungguBentar(400)
  persentase = persentase - 1
}

kasihMite("Pengisian selesai! Kristal siap digunakan.")`,

  objekDanLoop: `// Demonstrasi Tipe Data Objek dan Kontrol Perulangan
kore pahlawan = { 
  nama: "Ksatria", 
  elemen: "Cahaya", 
  level: 1 
};

mite("Karakter: " + pahlawan.nama + " | Elemen: " + pahlawan.elemen);
mite("Memulai simulasi grinding...");

kore hitung = 0;
ulangZutto (hitung < 5) {
  hitung = hitung + 1;

  moshi (hitung == 2) {
    mite("Sesi 2 dilewati (Memicu tsugi / Continue)");
    tsugi;
  }

  mite("Menyelesaikan sesi ke-" + hitung);

  moshi (hitung == 4) {
    mite("Stamina habis! (Memicu tomare / Break)");
    tomare;
  }
}

mite("Simulasi selesai.");`,
};

// Fungsi utilitas konversi Base64 yang aman untuk UTF-8
function encodeBase64(str: string): string {
  try {
    return btoa(encodeURIComponent(str));
  } catch {
    return btoa(str);
  }
}

function decodeBase64(base64: string): string {
  try {
    const binary = atob(base64);
    try {
      return decodeURIComponent(binary);
    } catch {
      return binary;
    }
  } catch {
    return "";
  }
}

export default function WibuScriptPlayground() {
  const [code, setCode] = useState<string>(CODE_PRESETS.default ?? "");
  const [outputLog, setOutputLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Siap");
  const [tokenCount, setTokenCount] = useState<number | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Membaca parameter ?code= dari URL saat pertama kali dimuat di browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get("code");
      if (codeParam) {
        const decoded = decodeBase64(codeParam);
        if (decoded) {
          setCode(decoded);
        }
      }
    }
  }, []);

  // Auto-scroll terminal virtual saat ada output baru
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outputLog]);

  // Menyalin URL lengkap berisi parameter Base64 ke clipboard pengguna
  const handleShareCode = async () => {
    if (typeof window === "undefined") return;

    try {
      const encoded = encodeBase64(code);
      const url = new URL(window.location.href);
      url.searchParams.set("code", encoded);
      await navigator.clipboard.writeText(url.toString());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback jika API clipboard diblokir lingkungan
      setIsCopied(false);
    }
  };

  // Eksekusi kode WibuScript di sisi klien (Client-Side Rendering)
  const handleRunCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setOutputLog([]);
    setStatusMessage("Menjalankan...");
    const startTime = performance.now();

    try {
      // 1. Tahap Lexer (Tokenisasi)
      const tokens = tokenize(code);
      setTokenCount(tokens.length);

      // 2. Tahap Parser (Penyusunan AST)
      const parser = new Parser();
      const program = parser.produceAST(tokens);

      // 3. Tahap Runtime & Evaluator dengan Real-Time Output Streaming
      const env = createGlobalEnvironment({
        outputHandler: (lineMessage: string) => {
          setOutputLog((prev) => [...prev, lineMessage]);
        },
      });

      const rawResult = await evaluate(program, env);
      unwrapSignal(rawResult);

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setExecutionTime(duration);
      setStatusMessage("Selesai");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setOutputLog((prev) => [...prev, `[Sistem Error] ${errorMessage}`]);
      setStatusMessage("Terjadi Kesalahan");
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearOutput = () => {
    setOutputLog([]);
    setExecutionTime(null);
    setStatusMessage("Siap");
  };

  const handlePresetChange = (presetKey: string) => {
    const selected = CODE_PRESETS[presetKey];
    if (selected) {
      setCode(selected);
      handleClearOutput();
    }
  };

  // Dukungan tombol Tab pada text editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void handleRunCode();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Utama */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center font-mono font-bold text-white text-sm shadow">
            WS
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              WibuScript Web Playground
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                v1.0.0-MVP
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Browser Engine untuk Bahasa Pemrograman Esoterik WibuScript
            </p>
          </div>
        </div>

        {/* Toolbar & Kontrol Preset */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Template:</label>
          <select
            aria-label="Pilih Template Kode"
            onChange={(e) => handlePresetChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="default">Program Lengkap</option>
            <option value="aliasDemo">Sistem Alias (Ekstensi vs Shorthand)</option>
            <option value="asyncLoop">Async Delay (tungguBentar)</option>
            <option value="objekDanLoop">Objek &amp; Kontrol Loop</option>
          </select>

          <button
            onClick={() => void handleShareCode()}
            className="px-3 py-1.5 rounded text-xs font-semibold shadow transition-all bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 flex items-center gap-1.5"
            title="Salin tautan berbagi ke clipboard"
          >
            {isCopied ? "Tautan Tersalin!" : "Bagikan Kode"}
          </button>

          <button
            onClick={() => void handleRunCode()}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded text-xs font-semibold shadow transition-all flex items-center gap-2 ${
              isRunning
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95"
            }`}
          >
            {isRunning ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                Mengeksekusi...
              </>
            ) : (
              <>Jalankan Kode (Ctrl+Enter)</>
            )}
          </button>
        </div>
      </header>

      {/* Konten Utama: 2 Kolom Editor & Terminal */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 lg:p-6 overflow-hidden">
        {/* Kolom 1: Area Editor */}
        <section className="flex flex-col rounded-lg border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
          <div className="bg-slate-800/60 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Editor Kode sumber (*.wibu)</span>
            <span>{code.split("\n").length} baris | {code.length} karakter</span>
          </div>

          <div className="relative flex-1 bg-slate-900">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder="Tulis kode WibuScript Anda di sini..."
              aria-label="Area Editor Kode WibuScript"
              className="w-full h-full min-h-[420px] p-4 bg-transparent text-slate-200 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-cyan-900/50"
            />
          </div>

          <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Dukungan Sintaks: koreWa / kore, mite, moshi, chigau, tungguBentar</span>
            <span>Tab = 2 spasi</span>
          </div>
        </section>

        {/* Kolom 2: Area Terminal Virtual */}
        <section className="flex flex-col rounded-lg border border-slate-800 bg-slate-950 shadow-sm overflow-hidden font-mono">
          {/* Header Terminal */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-slate-300 font-semibold">
                Terminal Virtual (stdout)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                  statusMessage === "Menjalankan..."
                    ? "bg-amber-950 text-amber-400 border border-amber-800"
                    : statusMessage === "Selesai"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : statusMessage === "Terjadi Kesalahan"
                    ? "bg-red-950 text-red-400 border border-red-800"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                Status: {statusMessage}
              </span>
              <button
                onClick={handleClearOutput}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors underline"
              >
                Bersihkan
              </button>
            </div>
          </div>

          {/* Body Terminal */}
          <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs text-slate-300 min-h-[420px] max-h-[70vh]">
            {outputLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 select-none py-16">
                <p>[Terminal Siap]</p>
                <p className="text-[11px] mt-1">
                  Klik tombol &quot;Jalankan Kode&quot; untuk memulai evaluasi program.
                </p>
              </div>
            ) : (
              outputLog.map((line, index) => {
                const isError = line.startsWith("[Sistem Error]") || line.startsWith("[Lexer Error]") || line.startsWith("[Parser Error]") || line.startsWith("[Runtime Error]");
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2 leading-relaxed ${
                      isError ? "text-red-400 bg-red-950/20 px-1 rounded" : "text-slate-200"
                    }`}
                  >
                    <span className="text-slate-600 select-none">&gt;</span>
                    <pre className="whitespace-pre-wrap break-all font-mono">
                      {line}
                    </pre>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Footer Terminal (Metrik Eksekusi) */}
          <div className="bg-slate-900/60 border-t border-slate-800/80 px-4 py-2 text-[11px] text-slate-500 flex justify-between items-center">
            <span>
              {executionTime !== null
                ? `Waktu Eksekusi: ${executionTime} ms`
                : "Menunggu eksekusi..."}
            </span>
            <span>
              {tokenCount !== null ? `Total Token: ${tokenCount}` : ""}
            </span>
          </div>
        </section>
      </main>

      {/* Footer Hak Cipta */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 text-center text-xs text-slate-600">
        WibuScript Core Engine &amp; Web Playground. Arsitektur Kompiler Berbasis TypeScript.
      </footer>
    </div>
  );
}
