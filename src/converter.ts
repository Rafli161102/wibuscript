// File: src/converter.ts
// ============================================================================
// WIBUSCRIPT DIALECT AUTO-CONVERTER
// Mengonversi kode sumber WibuScript antar 4 Dialek Mutlak:
// 1. murni    (Jepang Murni)
// 2. singkat  (Jepang Singkat)
// 3. wibu     (Wibu Absurd)
// 4. rongawi  (Meme Rongawi)
// ============================================================================

export type Dialect = "murni" | "singkat" | "wibu" | "rongawi";

export interface DialectMapping {
  // Kata Kunci Alur & Deklarasi
  kore: [string, string, string, string];
  zettai: [string, string, string, string];
  munashi: [string, string, string, string];
  hontou: [string, string, string, string];
  uso: [string, string, string, string];
  moshi: [string, string, string, string];
  soretomo: [string, string, string, string];
  hoka: [string, string, string, string];
  zutto: [string, string, string, string];
  yame: [string, string, string, string];
  tsugi: [string, string, string, string];
  jutsu: [string, string, string, string];
  kaesu: [string, string, string, string];
  mite: [string, string, string, string];
  matte: [string, string, string, string];
  kokoromi: [string, string, string, string];
  yurusu: [string, string, string, string];
  subete: [string, string, string, string];
  no: [string, string, string, string];

  // OOP & Modul
  sekte: [string, string, string, string];
  tanjou: [string, string, string, string];
  atarashii: [string, string, string, string];
  keishou: [string, string, string, string];
  jibun: [string, string, string, string];
  koukai: [string, string, string, string];
  toriyoseru: [string, string, string, string];
  kara: [string, string, string, string];

  // Pustaka Standar
  kuchiMite: [string, string, string, string];
  shibaraku: [string, string, string, string];
  imaJikan: [string, string, string, string];
  nagasa: [string, string, string, string];
  suji: [string, string, string, string];
  shurui: [string, string, string, string];
  beki: [string, string, string, string];
  marume: [string, string, string, string];
  ireta: [string, string, string, string];
  toru: [string, string, string, string];
  kiru: [string, string, string, string];
  ookiku: [string, string, string, string];
  chiisaku: [string, string, string, string];
  randamu: [string, string, string, string];
  shikei: [string, string, string, string];
  retsu: [string, string, string, string];
  yomu: [string, string, string, string];
  kaku: [string, string, string, string];
  yobu: [string, string, string, string];
  ukeru: [string, string, string, string];
  kanjiNi: [string, string, string, string];
  kanjiMojiretsu: [string, string, string, string];
  utsusu: [string, string, string, string];
  erabu: [string, string, string, string];
  mitsukeru: [string, string, string, string];
  ruuto: [string, string, string, string];
  zettaichi: [string, string, string, string];
  kiriSute: [string, string, string, string];
  kiriAge: [string, string, string, string];
  bunri: [string, string, string, string];
  tsunagu: [string, string, string, string];
  okikae: [string, string, string, string];
  kiri: [string, string, string, string];
  fukumu: [string, string, string, string];
  narabikae: [string, string, string, string];
  kirinuki: [string, string, string, string];
  gacha: [string, string, string, string];
}

// Tabel Indeks: 0 = Murni, 1 = Singkat, 2 = Wibu, 3 = Rongawi
export const DIALECT_TABLE: Record<string, [string, string, string, string]> = {
  // Keywords
  kore: ["kore", "ko", "siImut", "pokmipokmi"],
  zettai: ["zettai", "ze", "hargaMati", "bundarahma"],
  munashi: ["munashi", "mu", "maafLancang", "blukutuk"],
  hontou: ["hontou", "hon", "menyalaAbkuh", "unjukkebolehan"],
  uso: ["uso", "uso", "ladehBanh", "keracunanmbg"],
  moshi: ["moshi", "mo", "whenYh", "izintampil"],
  soretomo: ["soretomo", "sore", "kaloGakGitu", "wowok"],
  hoka: ["hoka", "ho", "yaudahlahYa", "woijawa"],
  zutto: ["zutto", "zu", "gasSampePagi", "nyawit"],
  yame: ["yame", "ya", "ampunSepuh", "bijisatu"],
  tsugi: ["tsugi", "tsu", "lanjutPart2", "ambatukam"],
  jutsu: ["jutsu", "ju", "mybini", "fufufafa"],
  kaesu: ["kaesu", "kae", "kasihPaham", "kandabahlil"],
  mite: ["mite", "mi", "teriakAmba", "salamkenal"],
  matte: ["matte", "mat", "sabarBanh", "admindatang"],
  kokoromi: ["kokoromi", "koko", "cobaDuluBanh", "gasTesLur"],
  yurusu: ["yurusu", "yuru", "santaiAja", "amanBos"],
  subete: ["subete", "sube", "sikatSemua", "gilisemua"],
  no: ["no", "no", "dari", "soko"],

  // OOP & Modul
  sekte: ["sekte", "sek", "paguyuban", "perkumpulan"],
  tanjou: ["tanjou", "tan", "lahiran", "mbrojol"],
  atarashii: ["atarashii", "ata", "bikinBaru", "anyaran"],
  keishou: ["keishou", "kei", "turunanDari", "warisanSoko"],
  jibun: ["jibun", "ji", "siAing", "awakku"],
  koukai: ["koukai", "kou", "sebarJutsu", "pamerke"],
  toriyoseru: ["toriyoseru", "tori", "summonJutsu", "jupukno"],
  kara: ["kara", "kra", "dari", "soko"],

  // Pustaka Standar
  kuchiMite: ["kuchiMite", "km", "bacotAmba", "cawapresin"],
  shibaraku: ["shibaraku", "siba", "santuyDulu", "nungguinLu"],
  imaJikan: ["imaJikan", "ima", "jamBerapaBanh", "cekJamLur"],
  nagasa: ["nagasa", "naga", "seginiDoang", "itungPanjangLur"],
  suji: ["suji", "suj", "jadiAngkaBanh", "ubahJadiDuit"],
  shurui: ["shurui", "shu", "iniApaan", "bendaApaanLur"],
  beki: ["beki", "bek", "angkatin", "naikinPangkat"],
  marume: ["marume", "maru", "buletinBanh", "ratainLur"],
  ireta: ["ireta", "ire", "masukinSini", "masukPakEko"],
  toru: ["toru", "to", "buangAja", "singkirkanLur"],
  kiru: ["kiru", "ki", "potongBanh", "gorokLur"],
  ookiku: ["ookiku", "ooki", "bikinGede", "gedeinLur"],
  chiisaku: ["chiisaku", "chii", "bikinKecil", "kecilinLur"],
  randamu: ["randamu", "ran", "acakBanh", "kocokLur"],
  shikei: ["shikei", "shi", "matiinProgram", "udahKelarinAja"],
  retsu: ["retsu", "ret", "bikinBarisan", "kumpulinJawa"],
  yomu: ["yomu", "yo", "bacainBerkas", "bukaBerkasLur"],
  kaku: ["kaku", "ka", "tulisinBerkas", "coretBerkasLur"],
  yobu: ["yobu", "yoB", "panggilBerkas", "sikatBanh"],
  ukeru: ["ukeru", "uke", "ambilDataBanh", "SepongMas"],
  kanjiNi: ["kanjiNi", "kn", "jadiObjekBanh", "uraiJsonLur"],
  kanjiMojiretsu: ["kanjiMojiretsu", "kmj", "jadiTeksBanh", "bungkusJsonLur"],
  utsusu: ["utsusu", "utu", "petainBanh", "petainLur"],
  erabu: ["erabu", "era", "saringBanh", "saringLur"],
  mitsukeru: ["mitsukeru", "mitu", "cariinBanh", "golekLur"],
  ruuto: ["ruuto", "ru", "akarPangkat", "akarLur"],
  zettaichi: ["zettaichi", "zet", "mutlakBanh", "mutlakLur"],
  kiriSute: ["kiriSute", "ks", "bawahinBanh", "bawahLur"],
  kiriAge: ["kiriAge", "kia", "atasinBanh", "atasLur"],
  bunri: ["bunri", "bu", "pecahKata", "bedahno"],
  tsunagu: ["tsunagu", "tsuna", "lemKata", "gandengen"],
  okikae: ["okikae", "oki", "sulapKata", "gantinen"],
  kiri: ["kiri", "kri", "pangkas", "potongen"],
  fukumu: ["fukumu", "fuku", "punyaGak", "onora"],
  narabikae: ["narabikae", "nara", "rapihin", "urutno"],
  kirinuki: ["kirinuki", "kinu", "potongSebagian", "cuplikno"],
  gacha: ["gacha", "gac", "tarikGacha", "mputerNasib"],
};

// Buat peta terbalik: sembarang token -> grup canonical -> indeks dialek
const WORD_TO_CANONICAL: Map<string, string> = new Map();

for (const [canonical, variants] of Object.entries(DIALECT_TABLE)) {
  for (const variant of variants) {
    WORD_TO_CANONICAL.set(variant, canonical);
  }
}

const DIALECT_INDEX: Record<Dialect, number> = {
  murni: 0,
  singkat: 1,
  wibu: 2,
  rongawi: 3,
};

/**
 * Mengonversi kode sumber WibuScript ke dialek yang diinginkan.
 * Mempertahankan komentar, literal string, whitespace, dan format indentasi.
 */
export function convertDialect(sourceCode: string, targetDialect: Dialect): string {
  const targetIdx = DIALECT_INDEX[targetDialect];
  if (targetIdx === undefined) {
    throw new Error(`[Converter Error] Dialek tujuan tidak valid: '${targetDialect}'. Pilihan: murni, singkat, wibu, rongawi.`);
  }

  // Gunakan regex token matching yang melindungi string, komentar, dan angka dari penghilangan
  const tokenRegex =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\[\s\S]|[^`])*`|"(?:\\.|[^"\r\n])*"|'(?:\\.|[^'\r\n])*'|\b\d+(?:\.\d+)?\b|[a-zA-Z_]\w*|[^\s\w"'`]+|\s+|["'`])/g;

  let converted = "";
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(sourceCode)) !== null) {
    const chunk = match[0];

    // Jika merupakan komentar atau literal string, jangan diubah
    if (
      chunk.startsWith("//") ||
      chunk.startsWith("/*") ||
      chunk.startsWith('"') ||
      chunk.startsWith("'") ||
      chunk.startsWith("`")
    ) {
      converted += chunk;
      continue;
    }

    // Jika merupakan kata identifier / keyword
    const canonical = WORD_TO_CANONICAL.get(chunk);
    if (canonical) {
      const variants = DIALECT_TABLE[canonical];
      if (variants) {
        converted += variants[targetIdx];
        continue;
      }
    }

    converted += chunk;
  }

  return converted;
}
