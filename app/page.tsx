// File: app/page.tsx
"use client";

import packageJson from "../package.json";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import {
  BookOpen,
  Terminal,
  Code,
  Cpu,
  Play,
  Share2,
  Copy,
  Check,
  Trash2,
  Zap,
  Variable,
  GitFork,
} from "lucide-react";
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

// Data kartu referensi untuk Panel Panduan Cepat
interface GuideCard {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  description: string;
  codeSnippet: string;
}

const GUIDE_CARDS: GuideCard[] = [
  {
    id: "variable",
    title: "Deklarasi Variabel",
    category: "Variabel",
    icon: Variable,
    description: "Alokasi variabel baru dalam memori lingkup aktif.",
    codeSnippet: `// Shorthand (Romaji)
kore nama = "Ren"
kore level = 99

// Ekstensi (Indo-Jepang)
koreWa aktif = majiBener`,
  },
  {
    id: "print",
    title: "Cetak Output",
    category: "I/O Konsol",
    icon: Terminal,
    description: "Mencetak teks ke terminal virtual (stdout).",
    codeSnippet: `// Shorthand
mite("Selamat datang!")

// Ekstensi
kasihMite("Pesan sistem")`,
  },
  {
    id: "condition",
    title: "Logika Percabangan",
    category: "Kontrol Alur",
    icon: GitFork,
    description: "Percabangan kondisi logika if-else bersarang.",
    codeSnippet: `moshi (level >= 50) {
  mite("Tingkat Tinggi")
} chigau {
  mite("Pemula")
}`,
  },
  {
    id: "function",
    title: "Fungsi / Jutsu",
    category: "Subrutin",
    icon: Zap,
    description: "Deklarasi fungsi berparameter dan nilai balikan.",
    codeSnippet: `// Ekstensi
bikinJutsu tambah(a, b) {
  balikinDesu a + b
}

// Shorthand
jutsu kali(a, b) {
  kaesu a * b
}`,
  },
  {
    id: "loop",
    title: "Perulangan & Kontrol",
    category: "Iterasi",
    icon: Cpu,
    description: "Pengulangan while serta kontrol break dan continue.",
    codeSnippet: `kore i = 0
ulangZutto (i < 5) {
  i = i + 1
  moshi (i == 2) { tsugi; }
  moshi (i == 4) { tomare; }
  mite("Putaran: " + i)
}`,
  },
  {
    id: "stdlib",
    title: "Pustaka Standar Populer",
    category: "Standard Lib",
    icon: Code,
    description: "Kumpulan fungsi utilitas bawaan bahasa.",
    codeSnippet: `// Panjang: nagasa(val)
kore p = nagasa("Wibu")

// Konversi: sujiNi(str)
kore n = sujiNi("100")

// Waktu: ima() / waktuSekarang()
mite("Jam: " + ima())`,
  },
];

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

// Registrasi bahasa kustom WibuScript ke Monaco Editor sebelum render
function handleEditorWillMount(monaco: Monaco): void {
  // Daftarkan identitas bahasa
  monaco.languages.register({ id: "wibuscript" });

  // Definisikan Monarch Tokenizer untuk pewarnaan sintaks
  monaco.languages.setMonarchTokensProvider("wibuscript", {
    defaultToken: "",
    ignoreCase: false,

    // Kata kunci kontrol alur (Ekstensi dan Shorthand)
    controlKeywords: [
      "moshi", "kaloMoshi", "soreTomo", "tomo", "hokaNo", "hoka",
      "ulangZutto", "zutto",
      "berhentiDuluKudasai", "tomare",
      "lanjutAksiSugi", "tsugi",
    ],

    // Kata kunci deklarasi
    declarationKeywords: [
      "koreWa", "kore",
    ],

    // Fungsi pendukung dan pustaka standar
    supportFunctions: [
      "kasihMite", "mite",
      "bikinJutsu", "jutsu",
      "balikInDesu", "balikinDesu", "kaesu", "modoru",
      "imaDesu", "ima", "imaJikan",
      "gacha",
      "nagasa",
      "sujiNi",
      "dekaku",
      "chiisaku",
      "tsuika",
      "sakujo",
      "tungguBentarKudasai", "tungguBentar", "mate",
      "sekarangImaDesu", "waktuSekarang",
      "tolongCekNagasa", "cekNagasa", "panjangTeks",
      "bikinJadiSuji", "jadiSuji", "ubahAngka",
      "apaTipeKoreWa", "tipeNani", "shurui",
      "kalkulasiPangkatSuji", "pangkatSuji", "beki",
      "bikinBulatSuji", "bulatSuji", "marume",
      "masukinKeRetsu", "isiRetsu",
      "keluarinDariRetsu", "buangRetsu",
      "bikinRetsu", "retsu",
      "potongKoreNagasa", "potongTeks", "kiru",
      "bikinGedeKore", "bikinKecilKore",
      "gachaPull",
      "yameteKudasai", "yamete",
      "tolongBacaBerkas", "yomu", "bacaBerkas",
      "tolongTulisBerkas", "kaku", "tulisBerkas",
      "tolongPanggilModul", "yobu", "panggilModul",
      "tolongAmbilData", "totte", "ambilData",
      "print",
    ],

    // Konstanta bahasa
    constantLanguage: [
      "majiBener", "maji",
      "chigauBener", "chigau",
      "karappo", "mu",
      "usoBanget", "uso",
      "kosongZannen", "kara",
    ],

    // Operator perbandingan dan aritmatika
    operators: [
      "==", "!=", "<=", ">=", "<", ">",
      "+", "-", "*", "/", "%", "=",
    ],

    symbols: /[=><!~?:&|+\-*/^%]+/,

    tokenizer: {
      root: [
        // Deteksi komentar yang dimulai dengan //
        [/\/\/.*$/, "comment.line.double-slash"],

        // Deteksi string diapit tanda kutip ganda
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string.quoted.double", "@string_double"],

        // Deteksi string diapit tanda kutip tunggal
        [/'([^'\\]|\\.)*$/, "string.invalid"],
        [/'/, "string", "@string_single"],

        // Angka (desimal dan bulat)
        [/\b\d+(\.\d+)?\b/, "number"],

        // Identifier dan aturan kata kunci Sistem Alias
        [/[a-zA-Z_]\w*/, {
          cases: {
            "@controlKeywords": "keyword.control",
            "@declarationKeywords": "keyword.declaration",
            "@supportFunctions": "support.function",
            "@constantLanguage": "constant.language",
            "@default": "identifier",
          },
        }],

        // Operator
        [/@symbols/, {
          cases: {
            "@operators": "operator",
            "@default": "",
          },
        }],

        // Tanda kurung, kurung siku, kurung kurawal
        [/[{}()[\]]/, "@brackets"],

        // Pemisah
        [/[;,.]/, "delimiter"],
      ],

      string_double: [
        [/[^\\"]+/, "string.quoted.double"],
        [/\\./, "string.escape"],
        [/"/, "string.quoted.double", "@pop"],
      ],

      string_single: [
        [/[^\\']+/, "string"],
        [/\\./, "string.escape"],
        [/'/, "string", "@pop"],
      ],
    },
  });

  // Konfigurasi fitur bahasa (auto-closing brackets, komentar, dll.)
  monaco.languages.setLanguageConfiguration("wibuscript", {
    comments: {
      lineComment: "//",
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    folding: {
      markers: {
        start: /\{/,
        end: /\}/,
      },
    },
    indentationRules: {
      increaseIndentPattern: /\{[^}]*$/,
      decreaseIndentPattern: /^\s*\}/,
    },
  });
}

export default function WibuScriptPlayground() {
  const [code, setCode] = useState<string>(CODE_PRESETS.default ?? "");
  const [outputLog, setOutputLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Siap");
  const [tokenCount, setTokenCount] = useState<number | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

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
      setIsCopied(false);
    }
  };

  // Menyalin snippet kode dari kartu panduan
  const handleCopySnippet = async (cardId: string, snippet: string) => {
    if (typeof window === "undefined") return;

    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippetId(cardId);
      setTimeout(() => setCopiedSnippetId(null), 1800);
    } catch {
      setCopiedSnippetId(null);
    }
  };

  // Menempelkan snippet panduan langsung ke editor
  const handleInsertSnippet = (snippet: string) => {
    setCode((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
  };

  // Eksekusi kode WibuScript di sisi klien (Client-Side Rendering)
  const handleRunCode = useCallback(async () => {
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
  }, [code, isRunning]);

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

  // Handler perubahan teks dari Monaco Editor
  const handleEditorChange = (value: string | undefined) => {
    setCode(value ?? "");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Utama */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center font-mono font-bold text-white text-sm shadow">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              WibuScript Web Playground
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {`v${packageJson.version}`}
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
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Tautan Tersalin!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                Bagikan Kode
              </>
            )}
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
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Jalankan Kode (Ctrl+Enter)
              </>
            )}
          </button>
        </div>
      </header>

      {/* Konten Utama: 3 Kolom Responsif (Panduan Cepat, Editor, Terminal) */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-6 overflow-hidden">
        {/* Kolom 1: Panel Panduan Cepat (Quick Guide) */}
        <aside className="lg:col-span-3 flex flex-col rounded-lg border border-slate-800 bg-slate-900 shadow-sm overflow-hidden min-h-[420px] max-h-[calc(100vh-140px)]">
          {/* Header Panduan */}
          <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Panduan Cepat</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Sintaksis
            </span>
          </div>

          {/* Isi Kartu Panduan */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {GUIDE_CARDS.map((card) => {
              const IconComponent = card.icon;
              const isSnippetCopied = copiedSnippetId === card.id;

              return (
                <div
                  key={card.id}
                  className="rounded-md border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs">
                      <IconComponent className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{card.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                      {card.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug mb-2">
                    {card.description}
                  </p>

                  <div className="relative group rounded bg-slate-900 border border-slate-800/90 p-2 font-mono text-[11px] text-slate-300">
                    <pre className="whitespace-pre-wrap overflow-x-auto leading-relaxed text-cyan-300/90">
                      {card.codeSnippet}
                    </pre>

                    <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleCopySnippet(card.id, card.codeSnippet)}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-all"
                        title="Salin sintaks ke clipboard"
                      >
                        {isSnippetCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleInsertSnippet(card.codeSnippet)}
                        className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 flex items-center gap-1 transition-all"
                        title="Tambahkan ke editor kode"
                      >
                        <Code className="w-3 h-3" />
                        <span>Sisipkan</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Panduan */}
          <div className="bg-slate-900/90 border-t border-slate-800 px-3 py-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Sistem Alias Ekstensi &amp; Shorthand</span>
            <span className="font-mono text-slate-400">{GUIDE_CARDS.length} Modul</span>
          </div>
        </aside>

        {/* Kolom 2: Area Editor (Monaco dengan Monarch Tokenizer WibuScript) */}
        <section className="lg:col-span-5 flex flex-col rounded-lg border border-slate-800 bg-slate-900 shadow-sm overflow-hidden min-h-[420px] max-h-[calc(100vh-140px)]">
          <div className="bg-slate-800/60 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>Editor Kode (*.wibu)</span>
            </div>
            <span>{code.split("\n").length} baris | {code.length} karakter</span>
          </div>

          <div className="relative flex-1 min-h-[380px]">
            <Editor
              height="100%"
              defaultLanguage="wibuscript"
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              beforeMount={handleEditorWillMount}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, 'Courier New', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                automaticLayout: true,
                lineNumbersMinChars: 3,
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: "gutter",
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true, indentation: true },
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                contextmenu: true,
                folding: true,
                lineDecorationsWidth: 8,
              }}
            />
          </div>

          <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Monaco Editor | Bahasa: WibuScript (Monarch Tokenizer)</span>
            <span>Tab = 2 spasi</span>
          </div>
        </section>

        {/* Kolom 3: Area Terminal Virtual */}
        <section className="lg:col-span-4 flex flex-col rounded-lg border border-slate-800 bg-slate-950 shadow-sm overflow-hidden font-mono min-h-[420px] max-h-[calc(100vh-140px)]">
          {/* Header Terminal */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-semibold">
                Terminal Virtual (stdout)
              </span>
            </div>

            <div className="flex items-center gap-2">
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
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Bersihkan log output terminal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body Terminal */}
          <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs text-slate-300 min-h-[380px]">
            {outputLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 select-none py-16">
                <Terminal className="w-8 h-8 mb-2 stroke-[1.5] text-slate-700" />
                <p>[Terminal Siap]</p>
                <p className="text-[11px] mt-1 text-center">
                  Klik tombol &quot;Jalankan Kode&quot; untuk memulai evaluasi program.
                </p>
              </div>
            ) : (
              outputLog.map((line, index) => {
                const isError =
                  line.startsWith("[Sistem Error]") ||
                  line.startsWith("[Lexer Error]") ||
                  line.startsWith("[Parser Error]") ||
                  line.startsWith("[Runtime Error]");

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2 leading-relaxed ${
                      isError
                        ? "text-red-400 bg-red-950/20 px-1 rounded"
                        : "text-slate-200"
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
