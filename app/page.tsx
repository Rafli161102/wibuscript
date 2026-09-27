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
  Layers,
  FileCode,
  ShieldAlert,
  Sparkles,
  Brackets,
} from "lucide-react";
import {
  tokenize,
  TokenType,
  type Token,
  Parser,
  evaluate,
  createGlobalEnvironment,
  unwrapSignal,
  convertDialect,
  type Dialect,
  transpileToJS,
} from "../src/index";

// Kumpulan template kode WibuScript bawaan
const CODE_PRESETS: Record<string, string> = {
  default: `// Program Demonstrasi WibuScript (Tema RPG / Isekai - 4 Dialek Mutlak)
kore namaKsatria = "Ren"
zettai level = 99
kore statusIsekai = hontou
kore inventaris = ["Pedang Cahaya", "Ramuan Mana", "Batu Sihir"]

mite(\`Memulai petualangan di dunia baru bersama \${namaKsatria}...\`)
mite(\`Item pertama di tas: \${inventaris[0]}\`)

moshi (statusIsekai == hontou && level >= 50) {
  mite("Status petualang: MENYALA! Siap menaklukkan dungeon tingkat S.")
} hoka {
  mite("Peringatan: Persiapan belum memenuhi syarat guild!")
}

jutsu kalkulasiDayaSerang(lvl, senjata) {
  kaesu (lvl * 15) + nagasa(senjata)
}

kore totalSerangan = kalkulasiDayaSerang(level, inventaris[0])
mite(\`Total daya serang kalkulasi: \${totalSerangan}\`)
mite("Simulasi sistem petualangan selesai.")`,

  dialekDemo: `// Demonstrasi Sistem 4 Dialek Mutlak WibuScript
// 1. Jepang Murni (kore, zettai, hontou, moshi, hoka, jutsu, kaesu, mite)
kore nama = "Megumin"
zettai elemen = "Explosion"

// 2. Jepang Singkat (ko, ze, hon, mo, ho, ju, kae, mi)
ko level = 99
ze aktif = hon

// 3. Wibu Absurd (siImut, hargaMati, menyalaAbkuh, whenYh, yaudahlahYa, mybini, kasihPaham, teriakAmba)
siImut waifu = "Aqua"
teriakAmba(\`Karakter aktif: \${nama} | Waifu: \${waifu}\`)

// 4. Meme Rongawi (pokmipokmi, bundarahma, unjukkebolehan, izintampil, woijawa, fufufafa, kandabahlil, salamkenal)
pokmipokmi mana = 9999
salamkenal(\`Kekuatan Mana: \${mana}\`)

moshi (aktif == hon) {
  mi("Status pertarungan: MENYALA ABKUH!")
}`,

  tryCatchDemo: `// Demonstrasi Penanganan Galat (Try-Catch) - 4 Dialek
mite("=== PENGUJIAN PENANGANAN GALAT ===")

// Jepang Murni: kokoromi ... yurusu
kokoromi {
  mite("Mencoba operasi pembagian berbahaya...")
  kore hasil = 100 / 0
  mite("Baris ini tidak akan dieksekusi")
} yurusu (kesalahan) {
  mite(\`Tertangkap (Jepang Murni): \${kesalahan}\`)
}

// Wibu Absurd: cobaDuluBanh ... santaiAja
cobaDuluBanh {
  mite("Mencoba akses indeks di luar batas...")
  kore arr = [1, 2]
  arr[99] = 100
} santaiAja (err) {
  mite(\`Tertangkap (Wibu Absurd): \${err}\`)
}

mite("Seluruh penanganan galat berhasil diselesaikan dengan anggun!")`,

  arrayDanJson: `// Demonstrasi Literal Array [], Indeks, & Operasi JSON
mite("=== OPERASI ARRAY & JSON ===")

// 1. Array Literals & Indeks
kore angka = [10, 20, 30, 40, 50]
mite(\`Panjang array: \${nagasa(angka)}\`)
mite(\`Elemen ke-2: \${angka[2]}\`)

angka[0] = 999
mite(\`Elemen pertama setelah diubah: \${angka[0]}\`)

// 2. Fungsi Tingkat Tinggi: utsusu (Map) & erabu (Filter)
jutsu kuadrat(x) { kaesu x * x; }
kore hasilKuadrat = utsusu([1, 2, 3, 4], kuadrat)
mite(\`Hasil pemetaan (kuadrat): \${kanjiMojiretsu(hasilKuadrat)}\`)

jutsu genap(x) { kaesu (x > 20); }
kore tersaring = erabu(angka, genap)
mite(\`Hasil saringan (> 20): \${kanjiMojiretsu(tersaring)}\`)

// 3. Penguraian JSON: kanjiNi
kore jsonString = "{\\"guild\\": \\"Crimson Demon\\", \\"anggota\\": 42}"
kore dataObjek = kanjiNi(jsonString)
mite(\`Nama Guild dari JSON: \${dataObjek.guild}\`)`,

  gameTebakAngka: `// Mini Game Simulasi: Pertarungan RPG Dadu
kore nyawaMusuh = 50
kore giliran = 1

mite("Musuh Monster Isekai muncul! Nyawa musuh: " + nyawaMusuh)

zutto (nyawaMusuh > 0 && giliran <= 5) {
  kore serangan = 15
  nyawaMusuh = nyawaMusuh - serangan
  mite(\`Giliran ke-\${giliran}: Menyerang monster dengan daya \${serangan}!\`)

  moshi (nyawaMusuh <= 0) {
    mite("Monster berhasil dikalahkan! Kemenangan mutlak!")
    yame
  }

  mite(\`Sisa nyawa monster: \${nyawaMusuh}\`)
  giliran = giliran + 1
}

moshi (nyawaMusuh > 0) {
  mite("Pertarungan berakhir imbang! Monster melarikan diri.")
}`,
};

// Data kartu referensi untuk Panel Panduan Cepat (4 Dialek Mutlak)
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
    title: "Variabel & Tetapan",
    category: "LET / CONST",
    icon: Variable,
    description: "Deklarasi variabel dan konstanta di 4 dialek.",
    codeSnippet: `// 1. Murni: kore / zettai
kore nama = "Ren"
zettai pi = 3.14

// 2. Singkat: ko / ze
ko umur = 17

// 3. Wibu: siImut / hargaMati
siImut waifu = "Rem"

// 4. Rongawi: pokmipokmi / bundarahma
pokmipokmi saldo = 50000`,
  },
  {
    id: "print",
    title: "Cetak & Template",
    category: "PRINT / STRING",
    icon: Terminal,
    description: "Cetak output dan template literal ${...}",
    codeSnippet: `// Cetak Output 4 Dialek:
// mite | mi | teriakAmba | salamkenal
mite("Halo Dunia!")

// Template Literals (Interpolasi Ekspresi)
kore nama = "Aqua"
kore level = 99
mite(\`Nama: \${nama}, Level: \${level + 1}\`)`,
  },
  {
    id: "array",
    title: "Array & Indeks [ ]",
    category: "ARRAY / INDEX",
    icon: Brackets,
    description: "Literal barisan [ ] dan pengindeksan kurung siku.",
    codeSnippet: `// Literal barisan
kore angka = [10, 20, 30]

// Akses indeks elemen
kore pertama = angka[0]

// Penugasan nilai indeks
angka[1] = 999

// Akses karakter string
kore huruf = "Wibu"[0]`,
  },
  {
    id: "trycatch",
    title: "Penanganan Galat",
    category: "TRY / CATCH",
    icon: ShieldAlert,
    description: "Menangani eksepsi galat pada 4 dialek.",
    codeSnippet: `// 1. Murni: kokoromi ... yurusu
kokoromi {
  kore hasil = 10 / 0
} yurusu (err) {
  mite("Galat: " + err)
}

// 2. Singkat: koko ... yuru
// 3. Wibu: cobaDuluBanh ... santaiAja
// 4. Rongawi: gasTesLur ... amanBos`,
  },
  {
    id: "condition",
    title: "Logika Percabangan",
    category: "IF / ELSE IF / ELSE",
    icon: GitFork,
    description: "Percabangan kondisi logika serta operator &&, ||, !",
    codeSnippet: `// Operator Logika: &&, ||, !
moshi (skor >= 90 && !gagal) {
  mite("Peringkat S")
} soretomo moshi (skor >= 70 || adaBonus) {
  mite("Peringkat A")
} hoka {
  mite("Coba Lagi")
}

// Singkat: mo, sore, ho
// Wibu: whenYh, kaloGakGitu, yaudahlahYa
// Rongawi: izintampil, wowok, woijawa`,
  },
  {
    id: "function",
    title: "Fungsi & Nilai Balik",
    category: "FUNCTION / RETURN",
    icon: Zap,
    description: "Deklarasi subrutin/fungsi dan nilai balikan.",
    codeSnippet: `// 1. Murni: jutsu & kaesu
jutsu tambah(a, b) {
  kaesu a + b
}

// 2. Singkat: ju & kae
ju kali(a, b) {
  kae a * b
}

// 3. Wibu: mybini & kasihPaham
// 4. Rongawi: fufufafa & kandabahlil`,
  },
  {
    id: "jsonmath",
    title: "Pustaka JSON & Math",
    category: "STDLIB",
    icon: Sparkles,
    description: "Operasi JSON, Array Map/Filter, dan Matematika.",
    codeSnippet: `// JSON: kanjiNi (parse) & kanjiMojiretsu (stringify)
kore data = kanjiNi('{"waifu": "Rem"}')
kore teksJson = kanjiMojiretsu(data)

// Array Functional: utsusu (map) & erabu (filter)
kore dikali = utsusu([1, 2, 3], jutsu(x) { kaesu x * 2; })

// Matematika: ruuto (sqrt), zettaichi (abs), kiriSute, kiriAge
kore akar = ruuto(64) // 8`,
  },
  {
    id: "loop",
    title: "Perulangan & Kontrol",
    category: "WHILE / BREAK / CONT",
    icon: Cpu,
    description: "Perulangan while serta kontrol break dan continue.",
    codeSnippet: `// 1. Murni: zutto, yame, tsugi
kore i = 0
zutto (i < 5) {
  i = i + 1
  moshi (i == 2) { tsugi; }
  moshi (i == 4) { yame; }
  mite("Putaran: " + i)
}

// 2. Singkat: zu, ya, tsu
// 3. Wibu: gasSampePagi, ampunSepuh, lanjutPart2
// 4. Rongawi: nyawit, bijisatu, ambatukam`,
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

function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(atob(str));
  } catch {
    return atob(str);
  }
}

function handleEditorWillMount(monaco: Monaco): void {
  monaco.languages.register({ id: "wibuscript" });

  monaco.languages.setMonarchTokensProvider("wibuscript", {
    defaultToken: "",
    ignoreCase: false,

    // Kata kunci kontrol alur (4 Dialek Mutlak)
    controlKeywords: [
      "moshi", "mo", "whenYh", "izintampil",
      "soretomo", "sore", "kaloGakGitu", "wowok",
      "hoka", "ho", "yaudahlahYa", "woijawa",
      "zutto", "zu", "gasSampePagi", "nyawit",
      "yame", "ya", "ampunSepuh", "bijisatu",
      "tsugi", "tsu", "lanjutPart2", "ambatukam",
      "matte", "mat", "sabarBanh", "admindatang",
      "kokoromi", "koko", "cobaDuluBanh", "gasTesLur",
      "yurusu", "yuru", "santaiAja", "amanBos",
    ],

    // Kata kunci deklarasi & subrutin (4 Dialek Mutlak)
    declarationKeywords: [
      "kore", "ko", "siImut", "pokmipokmi",
      "zettai", "ze", "hargaMati", "bundarahma",
      "jutsu", "ju", "mybini", "fufufafa",
      "kaesu", "kae", "kasihPaham", "kandabahlil",
    ],

    // Fungsi pendukung dan pustaka standar
    supportFunctions: [
      "mite", "mi", "teriakAmba", "salamkenal",
      "kuchiMite", "km", "bacotAmba", "cawapresin",
      "shibaraku", "siba", "santuyDulu", "nungguinLu",
      "imaJikan", "ima", "jamBerapaBanh", "cekJamLur",
      "nagasa", "naga", "seginiDoang", "itungPanjangLur",
      "suji", "suj", "jadiAngkaBanh", "ubahJadiDuit",
      "shurui", "shu", "iniApaan", "bendaApaanLur",
      "beki", "bek", "angkatin", "naikinPangkat",
      "marume", "maru", "buletinBanh", "ratainLur",
      "ireta", "ire", "masukinSini", "masukPakEko",
      "toru", "to", "buangAja", "singkirkanLur",
      "kiru", "ki", "potongBanh", "gorokLur",
      "ookiku", "ooki", "bikinGede", "gedeinLur",
      "chiisaku", "chii", "bikinKecil", "kecilinLur",
      "randamu", "ran", "acakBanh", "kocokLur",
      "shikei", "shi", "matiinProgram", "udahKelarinAja",
      "retsu", "ret", "bikinBarisan", "kumpulinJawa",
      "yomu", "yo", "bacainBerkas", "bukaBerkasLur",
      "kaku", "ka", "tulisinBerkas", "coretBerkasLur",
      "yobu", "yoB", "panggilBerkas", "sikatBanh",
      "ukeru", "uke", "ambilDataBanh", "SepongMas",
      "kanjiNi", "kn", "jadiObjekBanh", "uraiJsonLur",
      "kanjiMojiretsu", "kmj", "jadiTeksBanh", "bungkusJsonLur",
      "utsusu", "utu", "petainBanh", "petainLur",
      "erabu", "era", "saringBanh", "saringLur",
      "mitsukeru", "mitu", "cariinBanh", "golekLur",
      "ruuto", "ru", "akarPangkat", "akarLur",
      "zettaichi", "zet", "mutlakBanh", "mutlakLur",
      "kiriSute", "ks", "bawahinBanh", "bawahLur",
      "kiriAge", "kia", "atasinBanh", "atasLur",
    ],

    // Konstanta bahasa (4 Dialek Mutlak)
    constantLanguage: [
      "hontou", "hon", "menyalaAbkuh", "unjukkebolehan",
      "uso", "ladehBanh", "keracunanmbg",
      "munashi", "mu", "maafLancang", "blukutuk",
    ],

    // Operator
    operators: [
      "==", "!=", "<=", ">=", "<", ">",
      "&&", "||", "!",
      "+", "-", "*", "/", "%", "=",
    ],

    symbols: /[=><!~?:&|+\-*/^%]+/,

    tokenizer: {
      root: [
        [/\/\/.*$/, "comment.line.double-slash"],
        [/\/\*/, "comment.block", "@comment_block"],

        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string.quoted.double", "@string_double"],

        [/'([^'\\]|\\.)*$/, "string.invalid"],
        [/'/, "string", "@string_single"],

        [/`([^`\\]|\\.)*$/, "string.invalid"],
        [/`/, "string.quoted.double", "@string_backtick"],

        [/\b\d+(\.\d+)?\b/, "number"],

        [/[a-zA-Z_]\w*/, {
          cases: {
            "@controlKeywords": "keyword.control",
            "@declarationKeywords": "keyword.declaration",
            "@supportFunctions": "support.function",
            "@constantLanguage": "constant.language",
            "@default": "identifier",
          },
        }],

        [/@symbols/, {
          cases: {
            "@operators": "operator",
            "@default": "",
          },
        }],

        [/[{}()[\]]/, "@brackets"],
        [/[;,.]/, "delimiter"],
      ],

      comment_block: [
        [/[^/*]+/, "comment.block"],
        [/\*\//, "comment.block", "@pop"],
        [/[/*]/, "comment.block"],
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

      string_backtick: [
        [/\$\{[^}]*\}/, "variable.parameter"],
        [/[^\\`$]+/, "string.quoted.double"],
        [/\\./, "string.escape"],
        [/`/, "string.quoted.double", "@pop"],
      ],
    },
  });

  monaco.languages.setLanguageConfiguration("wibuscript", {
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
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
      { open: "`", close: "`" },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: "`", close: "`" },
    ],
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

  // Fitur Baru: Inspeksi & Dialek
  const [activeTab, setActiveTab] = useState<"terminal" | "tokens" | "ast" | "js">("terminal");
  const [tokensList, setTokensList] = useState<Token[]>([]);
  const [astJson, setAstJson] = useState<string>("");
  const [transpiledJs, setTranspiledJs] = useState<string>("");
  const [currentDialect, setCurrentDialect] = useState<Dialect>("murni");
  const [tokenFilter, setTokenFilter] = useState<string>("");

  const terminalEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (activeTab === "terminal") {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [outputLog, activeTab]);

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

  const handleInsertSnippet = (snippet: string) => {
    setCode((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
  };

  const handleSwitchDialect = (target: Dialect) => {
    try {
      const converted = convertDialect(code, target);
      setCode(converted);
      setCurrentDialect(target);
      setStatusMessage(`Dialek dikonversi ke ${target.toUpperCase()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Gagal konversi dialek: ${msg}`);
    }
  };

  const handleRunCode = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setOutputLog([]);
    setStatusMessage("Menjalankan...");
    const startTime = performance.now();

    try {
      // 1. Lexer (Tokenisasi)
      const tokens = tokenize(code);
      setTokensList(tokens);
      setTokenCount(tokens.length);

      // 2. Parser (AST)
      const parser = new Parser();
      const program = parser.produceAST(tokens);
      setAstJson(JSON.stringify(program, null, 2));

      // 3. Transpilasi ke JS
      try {
        setTranspiledJs(transpileToJS(code));
      } catch {
        setTranspiledJs("// Gagal mengompilasi ke JavaScript");
      }

      // 4. Runtime & Evaluator
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

  const handleEditorChange = (value: string | undefined) => {
    setCode(value ?? "");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Aplikasi */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50" />
            <h1 className="text-sm font-bold tracking-wide uppercase text-slate-200">
              WibuScript Playground
            </h1>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
            v{packageJson.version}
          </span>

          {/* Dialect Switcher Interaktif */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5 ml-2">
            <span className="text-[10px] text-slate-400 px-1.5 font-medium uppercase">Dialek:</span>
            {(["murni", "singkat", "wibu", "rongawi"] as Dialect[]).map((d) => (
              <button
                key={d}
                onClick={() => handleSwitchDialect(d)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  currentDialect === d
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
                title={`Konversi seluruh kode editor ke dialek ${d}`}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            onChange={(e) => handlePresetChange(e.target.value)}
            defaultValue="default"
            className="bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="default">Preset: RPG Quest Isekai (Array &amp; Template)</option>
            <option value="dialekDemo">Preset: 4 Dialek Mutlak</option>
            <option value="tryCatchDemo">Preset: Penanganan Galat (Try-Catch)</option>
            <option value="arrayDanJson">Preset: Operasi Array &amp; JSON</option>
            <option value="gameTebakAngka">Preset: Mini RPG Pertarungan Dadu</option>
          </select>

          <button
            onClick={() => void handleShareCode()}
            className="px-3 py-1.5 rounded text-xs border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors active:scale-95"
            title="Bagikan tautan kode WibuScript via Base64 URL"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Tautan Tersalin!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                Bagikan
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
                Jalankan (Ctrl+Enter)
              </>
            )}
          </button>
        </div>
      </header>

      {/* Konten Utama 3 Kolom: Panduan Cepat, Editor Monaco, dan Panel Tab Multifungsi */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-6 overflow-hidden">
        {/* Kolom 1: Panel Panduan Cepat (Quick Guide) */}
        <aside className="lg:col-span-3 flex flex-col rounded-lg border border-slate-800 bg-slate-900 shadow-sm overflow-hidden min-h-[420px] max-h-[calc(100vh-140px)]">
          <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Panduan Cepat</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {GUIDE_CARDS.length} Modul
            </span>
          </div>

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

          <div className="bg-slate-900/90 border-t border-slate-800 px-3 py-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Sistem 4 Dialek Mutlak</span>
            <span className="font-mono text-slate-400">WibuScript v1.3.0</span>
          </div>
        </aside>

        {/* Kolom 2: Area Editor Monaco */}
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
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
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
              }}
            />
          </div>

          <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Bahasa: WibuScript (Monarch Tokenizer)</span>
            <span>Tab = 2 spasi</span>
          </div>
        </section>

        {/* Kolom 3: Area Panel Tab Multifungsi (Terminal / Tokens / AST / JavaScript) */}
        <section className="lg:col-span-4 flex flex-col rounded-lg border border-slate-800 bg-slate-950 shadow-sm overflow-hidden font-mono min-h-[420px] max-h-[calc(100vh-140px)]">
          {/* Header Panel Tab Navigasi */}
          <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("terminal")}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === "terminal"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Terminal</span>
              </button>

              <button
                onClick={() => setActiveTab("tokens")}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === "tokens"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Token</span>
              </button>

              <button
                onClick={() => setActiveTab("ast")}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === "ast"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AST</span>
              </button>

              <button
                onClick={() => setActiveTab("js")}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === "js"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JS</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  statusMessage === "Menjalankan..."
                    ? "bg-amber-950 text-amber-400 border border-amber-800"
                    : statusMessage === "Selesai"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : statusMessage.startsWith("Gagal") || statusMessage === "Terjadi Kesalahan"
                    ? "bg-red-950 text-red-400 border border-red-800"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {statusMessage}
              </span>
              {activeTab === "terminal" && (
                <button
                  onClick={handleClearOutput}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Bersihkan log output terminal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Isi Konten Berdasarkan Tab yang Aktif */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1.5 text-xs text-slate-300 min-h-[380px]">
            {/* Tab 1: Terminal Log (stdout) */}
            {activeTab === "terminal" && (
              <>
                {outputLog.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 select-none py-16">
                    <Terminal className="w-8 h-8 mb-2 stroke-[1.5] text-slate-700" />
                    <p>[Terminal Siap]</p>
                    <p className="text-[11px] mt-1 text-center">
                      Klik tombol &quot;Jalankan&quot; untuk mengevaluasi kode program.
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
              </>
            )}

            {/* Tab 2: Token Inspector */}
            {activeTab === "tokens" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] text-slate-400">Total: {tokensList.length} token</span>
                  <input
                    type="text"
                    placeholder="Saring token..."
                    value={tokenFilter}
                    onChange={(e) => setTokenFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {tokensList.length === 0 ? (
                  <p className="text-center text-slate-600 py-12">
                    Jalankan kode untuk melihat daftar token yang dihasilkan Lexer.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {tokensList
                      .filter((t) =>
                        tokenFilter ? t.value.toLowerCase().includes(tokenFilter.toLowerCase()) : true
                      )
                      .map((tok, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-slate-900/60 border border-slate-800 px-2 py-1 rounded hover:border-slate-700 text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono w-6 text-right select-none">{idx + 1}</span>
                            <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 font-mono border border-cyan-800/50">
                              {TokenType[tok.type]}
                            </span>
                            <span className="text-slate-200 font-mono font-semibold">
                              {JSON.stringify(tok.value)}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[10px]">
                            B:{tok.line} K:{tok.column}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: AST Syntax Tree */}
            {activeTab === "ast" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="text-[11px] text-slate-400">Abstract Syntax Tree (JSON)</span>
                  {astJson && (
                    <button
                      onClick={() => navigator.clipboard.writeText(astJson)}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin JSON</span>
                    </button>
                  )}
                </div>

                {!astJson ? (
                  <p className="text-center text-slate-600 py-12">
                    Jalankan kode untuk melihat representasi AST.
                  </p>
                ) : (
                  <pre className="text-[11px] leading-relaxed text-cyan-300/90 whitespace-pre overflow-x-auto bg-slate-900/40 p-2 rounded">
                    {astJson}
                  </pre>
                )}
              </div>
            )}

            {/* Tab 4: JavaScript Transpiled */}
            {activeTab === "js" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="text-[11px] text-slate-400">Hasil Transpilasi JavaScript ES2022+</span>
                  {transpiledJs && (
                    <button
                      onClick={() => navigator.clipboard.writeText(transpiledJs)}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin JS</span>
                    </button>
                  )}
                </div>

                {!transpiledJs ? (
                  <p className="text-center text-slate-600 py-12">
                    Jalankan kode untuk mengompilasi WibuScript ke JavaScript.
                  </p>
                ) : (
                  <pre className="text-[11px] leading-relaxed text-emerald-300/90 whitespace-pre overflow-x-auto bg-slate-900/40 p-2 rounded">
                    {transpiledJs}
                  </pre>
                )}
              </div>
            )}
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
