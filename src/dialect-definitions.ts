// File: src/dialect-definitions.ts
// ============================================================================
// WIBUSCRIPT SINGLE SOURCE OF TRUTH DIALECT GRAMMAR DEFINITIONS
// Mendefinisikan metadata resmi 4 dialek (Jepang Murni, Jepang Singkat,
// Wibu Absurd, Meme Rongawi) beserta pengelompokan token visual resmi
// untuk Monaco Monarch Tokenizer dan VS Code TextMate Grammar.
// Sesuai Dokumen Resmi ROADMAP-wibuscript.pdf (Sintaks 4 Dialek Dibekukan).
// ============================================================================

export type DialectId = "murni" | "singkat" | "wibu" | "rongawi";

export interface DialectMetadata {
  id: DialectId;
  name: string;
  nativeName: string;
  description: string;
  index: number;
}

export const DIALECTS: Record<DialectId, DialectMetadata> = {
  murni: {
    id: "murni",
    name: "Jepang Murni",
    nativeName: "Nihongo Murni (Romaji)",
    description: "Dialek elegan bernuansa bahasa Jepang formal dan presisi.",
    index: 0,
  },
  singkat: {
    id: "singkat",
    name: "Jepang Singkat",
    nativeName: "Shorthand Romaji",
    description: "Dialek ringkas berkecepatan tinggi untuk competitive coding.",
    index: 1,
  },
  wibu: {
    id: "wibu",
    name: "Wibu Absurd",
    nativeName: "Anime Wibu Indo",
    description: "Dialek kultur pop anime dan komunitas otaku Indonesia.",
    index: 2,
  },
  rongawi: {
    id: "rongawi",
    name: "Meme Rongawi",
    nativeName: "Rongawi Shitpost Meme",
    description: "Dialek sarkas dan humor kultur internet Rongawi.",
    index: 3,
  },
};

export type VisualTokenCategory =
  | "controlKeywords"
  | "declarationKeywords"
  | "supportFunctions"
  | "constantLanguage"
  | "operators";

export interface CategoryColorTheme {
  category: VisualTokenCategory;
  name: string;
  colorUsual: string;
  scopeName: string;
}

export const OFFICIAL_VISUAL_THEME: Record<VisualTokenCategory, CategoryColorTheme> = {
  controlKeywords: {
    category: "controlKeywords",
    name: "Keyword Kontrol",
    colorUsual: "Magenta sakura (#ff79c6)",
    scopeName: "keyword.control",
  },
  declarationKeywords: {
    category: "declarationKeywords",
    name: "Deklarasi",
    colorUsual: "Ungu neon (#bd93f9)",
    scopeName: "keyword.declaration",
  },
  supportFunctions: {
    category: "supportFunctions",
    name: "Fungsi Bawaan",
    colorUsual: "Cyan (#8be9fd)",
    scopeName: "support.function",
  },
  constantLanguage: {
    category: "constantLanguage",
    name: "Literal dan Boolean",
    colorUsual: "Oranye (#ffb86c)",
    scopeName: "constant.language",
  },
  operators: {
    category: "operators",
    name: "Operator dan Simbol",
    colorUsual: "Putih redup (#f8f8f2)",
    scopeName: "keyword.operator",
  },
};

// Tabel Kanonikal 4 Dialek Mutlak: [Murni, Singkat, Wibu, Rongawi]
export const CANONICAL_KEYWORDS_CONTROL: Record<string, [string, string, string, string]> = {
  moshi: ["moshi", "mo", "moShiKalo", "izintampil"],
  soretomo: ["soretomo", "sore", "soredemoNe", "wowok"],
  hoka: ["hoka", "ho", "shoganaiNe", "woijawa"],
  zutto: ["zutto", "zu", "zuttoLoop", "nyawit"],
  yame: ["yame", "ya", "yameteKure", "bijisatu"],
  tsugi: ["tsugi", "tsu", "tsugiNe", "ambatukam"],
  matte: ["matte", "mat", "matteNe", "admindatang"],
  kokoromi: ["kokoromi", "koko", "yatteMiyo", "ragnamok"],
  yurusu: ["yurusu", "yuru", "gomennasai", "amanBos"],
  subete: ["subete", "sube", "zenbuNe", "thugshaker"],
  no: ["no", "no", "dari", "alasdaun"],
  toriyoseru: ["toriyoseru", "tori", "summonJutsu", "begalbaju"],
  kara: ["kara", "kra", "dari", "ngawiland"],
  koukai: ["koukai", "kou", "sebarJutsu", "umpansilang"],
  shougo: ["shougo", "sho", "cocokkan", "persimpangan"],
  baai: ["baai", "baa", "kaloPas", "kenaben"],
  hyoujun: ["hyoujun", "hyo", "sisaan", "yappingtolol"],
};

export const CANONICAL_KEYWORDS_DECLARATION: Record<string, [string, string, string, string]> = {
  kore: ["kore", "ko", "iniDesu", "pokmipokmi"],
  zettai: ["zettai", "ze", "zettaiDa", "bundarahma"],
  jutsu: ["jutsu", "ju", "mybini", "fufufafa"],
  kaesu: ["kaesu", "kae", "haiBeri", "kandabahlil"],
  sekte: ["sekte", "sek", "nakama", "sektejomok"],
  tanjou: ["tanjou", "tan", "umareta", "ambatunat"],
  atarashii: ["atarashii", "ata", "atarashiiNe", "ambatumbas"],
  keishou: ["keishou", "kei", "kouhaiDesu", "jalurhukum"],
  jibun: ["jibun", "ji", "oreSama", "lanangmas"],
};

export const CANONICAL_CONSTANTS: Record<string, [string, string, string, string]> = {
  hontou: ["hontou", "hon", "hontouNi", "unjukkebolehan"],
  uso: ["uso", "uso", "chigauYo", "keracunanmbg"],
  munashi: ["munashi", "mu", "naniKore", "blukutuk"],
};

export const CANONICAL_SUPPORT_FUNCTIONS: Record<string, [string, string, string, string]> = {
  mite: ["mite", "mi", "iuYo", "salamkenal"],
  kuchiMite: ["kuchiMite", "km", "omaeWaIu", "cawapresin"],
  shibaraku: ["shibaraku", "siba", "matteNeSikit", "nungguinLu"],
  imaJikan: ["imaJikan", "ima", "nanjiDesu", "kopihitam"],
  nagasa: ["nagasa", "naga", "doreKurai", "panjangberurat"],
  suji: ["suji", "suj", "suujiNi", "ubahJadiDuit"],
  shurui: ["shurui", "shu", "naniTypeNe", "omagot"],
  beki: ["beki", "bek", "tsuyokuNare", "naikinPangkat"],
  marume: ["marume", "maru", "maneNi", "shakerbot"],
  ireta: ["ireta", "ire", "haireNe", "priaotot"],
  toru: ["toru", "to", "deteike", "danaterbakar"],
  kiru: ["kiru", "ki", "kiriteNe", "kertaslecek"],
  ookiku: ["ookiku", "ooki", "ookiVoice", "gakhabisgila"],
  chiisaku: ["chiisaku", "chii", "chiisaiVoice", "monyetbanyumas"],
  randamu: ["randamu", "ran", "unmeiGacha", "rudalmentah"],
  shikei: ["shikei", "shi", "shineeeYo", "udahKelarinAja"],
  retsu: ["retsu", "ret", "nakamaTachi", "budakhitam"],
  yomu: ["yomu", "yo", "yomimasuNe", "ototkawat"],
  kaku: ["kaku", "ka", "kakimasuNe", "teksusang"],
  yobu: ["yobu", "yoB", "mottekite", "sikatBanh"],
  ukeru: ["ukeru", "uke", "tottekiteNe", "SepongMas"],
  kanjiNi: ["kanjiNi", "kn", "wakattaYo", "salintempel"],
  kanjiMojiretsu: ["kanjiMojiretsu", "kmj", "oshieteNe", "copascaption"],
  utsusu: ["utsusu", "utu", "henshinSuru", "predikbola"],
  erabu: ["erabu", "era", "senbatsuNe", "morebullets"],
  mitsukeru: ["mitsukeru", "mitu", "mitsuketaYo", "fesnuker"],
  ruuto: ["ruuto", "ru", "heihoukon", "robogor"],
  zettaichi: ["zettaichi", "zet", "zettaiChi", "ironiman"],
  kiriSute: ["kiriSute", "ks", "shitaKiri", "hutanselatan"],
  kiriAge: ["kiriAge", "kia", "ueKiri", "menaracukur"],
  bunri: ["bunri", "bu", "barabara", "pecahkepala"],
  tsunagu: ["tsunagu", "tsuna", "isshoNi", "lendirmurni"],
  okikae: ["okikae", "oki", "irekaeruNe", "akuntumbal"],
  kiri: ["kiri", "kri", "kireeNi", "cukurfade"],
  fukumu: ["fukumu", "fuku", "hairuKana", "monyetijo"],
  narabikae: ["narabikae", "nara", "narabeteNe", "goyangpantat"],
  kirinuki: ["kirinuki", "kinu", "sukoshiDake", "pedangdaging"],
  gacha: ["gacha", "gac", "tarikGacha", "weeklypass"],
  seikou: ["seikou", "sei", "hokiBanh", "menyalaAbangku"],
  shippai: ["shippai", "sip", "zonkBanh", "rugidong"],
  aru: ["aru", "ar", "adaBanh", "adamas"],
  nai: ["nai", "na", "gaadaBanh", "habismas"],
};

export const OPERATORS: string[] = [
  "==", "!=", "<=", ">=", "=>", "<", ">",
  "&&", "||", "!",
  "...", "+", "-", "*", "/", "%", "=",
];

// Alias historis untuk kompatibilitas tokenizer dan highlighters
export const HISTORICAL_ALIASES: Record<VisualTokenCategory, string[]> = {
  controlKeywords: ["whenYh", "kaloGakGitu", "yaudahlahYa", "gasSampePagi", "ampunSepuh", "lanjutPart2", "sabarBanh", "cobaDuluBanh", "gasTesLur", "santaiAja", "sikatSemua", "karaNe"],
  declarationKeywords: ["siImut", "hargaMati", "watashiJutsu", "kasihPaham", "paguyuban", "lahiran", "bikinBaru", "turunanDari", "siAing"],
  supportFunctions: ["teriakAmba", "bacotAmba", "matteNeSikit", "jamBerapaBanh", "cekJamLur", "seginiDoang", "tolongCekNagasa", "cekUkuran", "jadiAngkaBanh", "bikinJadiSuji", "akarPangkat", "akarLur", "mutlakBanh", "mutlakLur", "bawahinBanh", "bawahLur", "atasinBanh", "atasLur", "bikinBarisan", "kumpulinBocah", "kumpulinJawa", "uraiJsonLur", "bungkusJsonLur", "petainBanh", "saringBanh", "cariinBanh", "pecahKata", "bedahno", "pecahin", "lemKata", "gandengen", "lemin", "sulapKata", "gantinen", "tumbalkan", "pangkas", "potongen", "cukur", "punyaGak", "onora", "adaGak", "rapihin", "urutno", "barisin", "potongSebagian", "cuplikno", "comot", "mputerNasib", "spinZeus", "ok", "error", "some", "none", "berhasilBanh", "gagalBanh", "untungmas", "hancurmas", "kosongBanh", "zonktolol"],
  constantLanguage: ["menyalaAbkuh", "ladehBanh", "maafLancang", "maji", "majiBener", "usoBanget", "kosongZannen"],
  operators: [],
};

/**
 * Mengambil metadata resmi dialek.
 */
export function getDialectMetadata(dialect: DialectId): DialectMetadata {
  const meta = DIALECTS[dialect];
  if (!meta) {
    throw new Error(`Dialek tidak dikenal: ${dialect}`);
  }
  return meta;
}

/**
 * Mengambil daftar keyword unik berdasarkan kategori dan dialek tertentu (atau semua dialek).
 */
export function getKeywordsByCategory(
  category: VisualTokenCategory,
  dialect?: DialectId,
  includeHistorical = true
): string[] {
  let table: Record<string, [string, string, string, string]>;

  switch (category) {
    case "controlKeywords":
      table = CANONICAL_KEYWORDS_CONTROL;
      break;
    case "declarationKeywords":
      table = CANONICAL_KEYWORDS_DECLARATION;
      break;
    case "supportFunctions":
      table = CANONICAL_SUPPORT_FUNCTIONS;
      break;
    case "constantLanguage":
      table = CANONICAL_CONSTANTS;
      break;
    case "operators":
      return [...OPERATORS];
  }

  const set = new Set<string>();

  if (dialect) {
    const idx = DIALECTS[dialect].index;
    for (const row of Object.values(table)) {
      const keyword = row[idx];
      if (keyword) {
        set.add(keyword);
      }
    }
  } else {
    for (const row of Object.values(table)) {
      for (const item of row) {
        set.add(item);
      }
    }
    if (includeHistorical && HISTORICAL_ALIASES[category]) {
      for (const item of HISTORICAL_ALIASES[category]) {
        set.add(item);
      }
    }
  }

  return Array.from(set);
}

/**
 * Mengambil seluruh kata kunci yang sah untuk satu dialek spesifik.
 */
export function getAllKeywordsForDialect(dialect: DialectId): string[] {
  const categories: VisualTokenCategory[] = [
    "controlKeywords",
    "declarationKeywords",
    "supportFunctions",
    "constantLanguage",
  ];
  const set = new Set<string>();
  for (const cat of categories) {
    for (const kw of getKeywordsByCategory(cat, dialect, false)) {
      set.add(kw);
    }
  }
  return Array.from(set);
}

/**
 * Mengambil seluruh kata kunci gabungan dari 4 dialek.
 */
export function getAllKeywords(): string[] {
  const set = new Set<string>();
  for (const d of (Object.keys(DIALECTS) as DialectId[])) {
    for (const kw of getAllKeywordsForDialect(d)) {
      set.add(kw);
    }
  }
  return Array.from(set);
}

/**
 * Menghasilkan objek RegExp yang mencocokkan kata kunci pada batas kata (\b).
 */
export function getRegexForCategory(
  category: VisualTokenCategory,
  dialect?: DialectId
): RegExp {
  if (category === "operators") {
    const escaped = OPERATORS.map((op) =>
      op.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    ).sort((a, b) => b.length - a.length);
    return new RegExp(`(${escaped.join("|")})`);
  }

  const keywords = getKeywordsByCategory(category, dialect);
  const sorted = keywords.sort((a, b) => b.length - a.length);
  return new RegExp(`\\b(${sorted.join("|")})\\b`);
}

/**
 * Menghasilkan konfigurasi Monaco Monarch Tokenizer yang siap digunakan pada Web Playground.
 */
export function generateMonarchTokensProvider(): Record<string, unknown> {
  return {
    defaultToken: "",
    ignoreCase: false,

    controlKeywords: getKeywordsByCategory("controlKeywords"),
    declarationKeywords: getKeywordsByCategory("declarationKeywords"),
    supportFunctions: getKeywordsByCategory("supportFunctions"),
    constantLanguage: getKeywordsByCategory("constantLanguage"),
    operators: OPERATORS,

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

        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              "@controlKeywords": "keyword.control",
              "@declarationKeywords": "keyword.declaration",
              "@supportFunctions": "support.function",
              "@constantLanguage": "constant.language",
              "@default": "identifier",
            },
          },
        ],

        [
          /@symbols/,
          {
            cases: {
              "@operators": "operator",
              "@default": "",
            },
          },
        ],

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
        [/[^\\`$]+/, "string.quoted.double"],
        [/\\./, "string.escape"],
        [/\$\{/, "variable.parameter", "@interpolation"],
        [/`/, "string.quoted.double", "@pop"],
      ],

      interpolation: [
        [/\}/, "variable.parameter", "@pop"],
        { include: "root" },
      ],
    },
  };
}

/**
 * Menghasilkan struktur objek TextMate Grammar (JSON) untuk ekstensi VS Code.
 */
export function generateTextMateGrammar(): Record<string, unknown> {
  const buildPattern = (category: VisualTokenCategory) => {
    const list = getKeywordsByCategory(category).sort(
      (a, b) => b.length - a.length
    );
    return `\\b(${list.join("|")})\\b`;
  };

  const escapedOps = OPERATORS.map((op) =>
    op.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  )
    .sort((a, b) => b.length - a.length)
    .join("|");

  return {
    $schema:
      "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
    name: "WibuScript",
    scopeName: "source.wibuscript",
    fileTypes: ["wibu"],
    patterns: [
      { include: "#comments" },
      { include: "#strings" },
      { include: "#numbers" },
      { include: "#constants" },
      { include: "#keywords-control" },
      { include: "#keywords-declaration" },
      { include: "#support-functions" },
      { include: "#operators" },
    ],
    repository: {
      comments: {
        patterns: [
          {
            name: "comment.line.double-slash",
            match: "//.*$",
          },
          {
            name: "comment.block",
            begin: "/\\*",
            end: "\\*/",
          },
        ],
      },
      strings: {
        patterns: [
          {
            name: "string.quoted.double",
            begin: '"',
            end: '"',
            patterns: [
              {
                name: "constant.character.escape",
                match: "\\\\.",
              },
            ],
          },
          {
            name: "string.quoted.single",
            begin: "'",
            end: "'",
            patterns: [
              {
                name: "constant.character.escape",
                match: "\\\\.",
              },
            ],
          },
          {
            name: "string.quoted.backtick",
            begin: "`",
            end: "`",
            patterns: [
              {
                name: "constant.character.escape",
                match: "\\\\.",
              },
              {
                name: "variable.parameter",
                match: "\\$\\{[^}]*\\}",
              },
            ],
          },
        ],
      },
      numbers: {
        patterns: [
          {
            name: "constant.numeric",
            match: "\\b[0-9]+(\\.[0-9]+)?\\b",
          },
        ],
      },
      constants: {
        patterns: [
          {
            name: "constant.language",
            match: buildPattern("constantLanguage"),
          },
        ],
      },
      "keywords-control": {
        patterns: [
          {
            name: "keyword.control",
            match: buildPattern("controlKeywords"),
          },
        ],
      },
      "keywords-declaration": {
        patterns: [
          {
            name: "keyword.declaration",
            match: buildPattern("declarationKeywords"),
          },
        ],
      },
      "support-functions": {
        patterns: [
          {
            name: "support.function",
            match: buildPattern("supportFunctions"),
          },
        ],
      },
      operators: {
        patterns: [
          {
            name: "keyword.operator",
            match: `(${escapedOps})`,
          },
        ],
      },
    },
  };
}
