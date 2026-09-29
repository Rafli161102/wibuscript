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
  shougo: [string, string, string, string];
  baai: [string, string, string, string];
  hyoujun: [string, string, string, string];

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
  seikou: [string, string, string, string];
  shippai: [string, string, string, string];
  aru: [string, string, string, string];
  nai: [string, string, string, string];
}

// Tabel Indeks: 0 = Murni, 1 = Singkat, 2 = Wibu, 3 = Rongawi
export const DIALECT_TABLE: Record<string, [string, string, string, string]> = {
  // Keywords
  kore: ["kore", "ko", "iniDesu", "pokmipokmi"],
  zettai: ["zettai", "ze", "zettaiDa", "bundarahma"],
  munashi: ["munashi", "mu", "naniKore", "blukutuk"],
  hontou: ["hontou", "hon", "hontouNi", "unjukkebolehan"],
  uso: ["uso", "uso", "chigauYo", "keracunanmbg"],
  moshi: ["moshi", "mo", "moShiKalo", "izintampil"],
  soretomo: ["soretomo", "sore", "soredemoNe", "wowok"],
  hoka: ["hoka", "ho", "shoganaiNe", "woijawa"],
  zutto: ["zutto", "zu", "zuttoLoop", "nyawit"],
  yame: ["yame", "ya", "yameteKure", "bijisatu"],
  tsugi: ["tsugi", "tsu", "tsugiNe", "ambatukam"],
  jutsu: ["jutsu", "ju", "mybini", "fufufafa"],
  kaesu: ["kaesu", "kae", "haiBeri", "kandabahlil"],
  mite: ["mite", "mi", "iuYo", "salamkenal"],
  matte: ["matte", "mat", "matteNe", "admindatang"],
  kokoromi: ["kokoromi", "koko", "yatteMiyo", "ragnamok"],
  yurusu: ["yurusu", "yuru", "gomennasai", "amanBos"],
  subete: ["subete", "sube", "zenbuNe", "thugshaker"],
  no: ["no", "no", "dari", "alasdaun"],
  shougo: ["shougo", "sho", "cocokkan", "persimpangan"],
  baai: ["baai", "baa", "kaloPas", "kenaben"],
  hyoujun: ["hyoujun", "hyo", "sisaan", "yappingtolol"],

  // OOP & Modul
  sekte: ["sekte", "sek", "nakama", "sektejomok"],
  tanjou: ["tanjou", "tan", "umareta", "ambatunat"],
  atarashii: ["atarashii", "ata", "atarashiiNe", "ambatumbas"],
  keishou: ["keishou", "kei", "kouhaiDesu", "jalurhukum"],
  jibun: ["jibun", "ji", "oreSama", "lanangmas"],
  koukai: ["koukai", "kou", "sebarJutsu", "umpansilang"],
  toriyoseru: ["toriyoseru", "tori", "summonJutsu", "begalbaju"],
  kara: ["kara", "kra", "dari", "ngawiland"],

  // Pustaka Standar
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

// Buat peta terbalik: sembarang token -> grup canonical -> indeks dialek
const WORD_TO_CANONICAL: Map<string, string> = new Map();

for (const [canonical, variants] of Object.entries(DIALECT_TABLE)) {
  for (const variant of variants) {
    if (!WORD_TO_CANONICAL.has(variant)) {
      WORD_TO_CANONICAL.set(variant, canonical);
    }
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
