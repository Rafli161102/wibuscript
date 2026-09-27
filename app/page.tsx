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
  Square,
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
  registerVirtualModule,
} from "../src/index";

// Inisialisasi Modul Virtual bawaan untuk Web Playground
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

// Kumpulan template kode WibuScript bawaan
const CODE_PRESETS: Record<string, string> = {
  patternMatchingDemo: `// Demonstrasi Pattern Matching (shougo) & Destructuring (v1.8.0)
mite("=== 1. ARRAY & OBJECT DESTRUCTURING ===")
// Array destructuring dengan rest operator (...)
kore [ketua, wakil, ...anggota] = ["Naruto", "Sasuke", "Sakura", "Kakashi", "Sai"]
mite(\`Ketua: \${ketua}, Wakil: \${wakil}\`)
mite(\`Anggota Lainnya: \${tsunagu(anggota, ", ")}\`)

// Object destructuring
kore { nama, klan: marga } = { nama: "Itachi", klan: "Uchiha" }
mite(\`Nama: \${nama}, Marga: \${marga}\`)

// Pertukaran nilai variabel (Swapping)
kore [a, b] = [100, 200]
mite(\`Sebelum tukar: a=\${a}, b=\${b}\`)
[a, b] = [b, a]
mite(\`Sesudah tukar: a=\${a}, b=\${b}\`)

// Spread operator (...) pada barisan
kore ganjil = [1, 3, 5]
kore gabungan = [0, ...ganjil, 7, 9]
mite(\`Gabungan array spread: \${tsunagu(gabungan, "-")}\`)

mite("\\n=== 2. PATTERN MATCHING (SHOUGO) ===")
// 4 Dialek Pattern Matching:
// Jepang Murni: shougo (nilai) { baai ...: { ... } hyoujun: { ... } }
// Jepang Singkat: sho (nilai) { baa ...: { ... } hyo: { ... } }
// Wibu Absurd: cocokkan (nilai) { kaloPas ...: { ... } sisaan: { ... } }
// Meme Rongawi: persimpangan (nilai) { kenaben ...: { ... } yappingtolol: { ... } }

kore role = "Hokage"
shougo (role) {
  baai "Genin": {
    mite("Tugas: Misi D-Rank")
  }
  baai "Chunin": {
    mite("Tugas: Misi C/B-Rank")
  }
  baai "Hokage": {
    mite("Tugas: Memimpin Desa Konoha")
  }
  hyoujun: {
    mite("Tugas: Warga Sipil")
  }
}`,

  oopModulDemo: `// Demonstrasi OOP (Sekte), Konstruktor, & Sistem Modul (v1.7.0)
// Impor fungsi dan sekte dari modul virtual:
toriyoseru { jurusBayangan, Senjata } kara "./ninja.wibu"

mite("=== PEMANGGILAN DARI MODUL ===")
mite(jurusBayangan(5))
kore shuriken = atarashii Senjata("Shuriken Bayangan")
mite(shuriken.lempar())

mite("\\n=== PENDEFINISIAN SEKTE & PEWARISAN ===")
// Deklarasi Sekte/Kelas: sekte (Murni) / sek (Singkat) / paguyuban (Wibu) / sektejomok (Rongawi)
sekte Pendekar {
  // Konstruktor: tanjou / tan / lahiran / ambatunat
  tanjou(nama, klan) {
    // Referensi Diri: jibun / ji / siAing / lanangmas
    jibun.nama = nama
    jibun.klan = klan
    jibun.tenaga = 100
  }

  status() {
    kaesu \`[Pendekar: \${jibun.nama} | Klan: \${jibun.klan} | Tenaga: \${jibun.tenaga}]\`
  }
}

// Pewarisan: keishou / kei / turunanDari / jalurhukum
sekte PendekarApi keishou Pendekar {
  jurusApi() {
    jibun.tenaga = jibun.tenaga - 20
    mite(\`\${jibun.nama} menyemburkan Naga Api! Sisa tenaga: \${jibun.tenaga}\`)
  }
}

// Instansiasi Baru: atarashii / ata / bikinBaru / ambatumbas
kore sasuke = atarashii PendekarApi("Sasuke", "Uchiha")
mite(sasuke.status())
sasuke.jurusApi()
mite(sasuke.status())`,

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

  iterasiDanGacha: `// Demonstrasi Iterasi Koleksi (subete), Lambda (=>), & Mesin Gacha (v1.6.0)
mite("=== SISTEM PETUALANGAN ISEKAI v1.6.0 ===")

// 1. Perulangan Iterasi Koleksi (subete ... no)
kore anggota = ["Megumin", "Aqua", "Darkness", "Kazuma"]
mite("Daftar Anggota Tim Petualang:")
subete (nama no anggota) {
  mite("- Hero: " + nama)
}

// 2. Fungsi Lambda / Arrow Function (=>) dengan utsusu & erabu
kore skorDadu = [12, 45, 88, 30, 95]
kore skorBonus = utsusu(skorDadu, x => x + 5)
kore lulus = erabu(skorBonus, s => s >= 50)
mite(\`Jumlah hero lolos kualifikasi: \${nagasa(lulus)}\`)

// 3. Mesin Gacha Probabilistik (RNG berbobot)
kore daftarHadiah = ["SSR: Pedang Excalibur", "SR: Tongkat Sihir", "R: Ranting Kayu"]
kore bobot = [10, 30, 60] // Peluang: 10% SSR, 30% SR, 60% R
kore hasilGacha = gacha(daftarHadiah, bobot)
mite(\`Hasil Tarik Gacha: \${hasilGacha}\`)

// 4. Utilitas Teks & String Baru: kiri, bunri, tsunagu, fukumu
kore kalimat = "   isekai wibu script   "
kore bersih = kiri(kalimat)
kore kataArray = bunri(bersih, " ")
kore slogan = tsunagu(kataArray, " -> ")
mite(\`Slogan Terhubung: \${slogan}\`)
mite(\`Apakah mengandung 'script'? \${fukumu(bersih, "script")}\`)`,
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
    id: "match-destructuring",
    title: "Pattern Matching & Destructuring (v1.8.0)",
    category: "MATCH / DESTRUCT",
    icon: Sparkles,
    description: "Pencocokan pola (shougo) dan pemecahan struktur array/object (destructuring) serta spread operator (...).",
    codeSnippet: `// 1. Destructuring & Rest (...):
kore [a, b, ...sisa] = [10, 20, 30, 40]
kore { nama, klan: marga } = { nama: "Itachi", klan: "Uchiha" }
[a, b] = [b, a] // Tukar nilai variabel

// 2. Pattern Matching (4 Dialek Mutlak):
// Murni:   shougo (x) { baai 1: { ... } hyoujun: { ... } }
// Singkat: sho (x) { baa 1: { ... } hyo: { ... } }
// Wibu:    cocokkan (x) { kaloPas 1: { ... } sisaan: { ... } }
// Rongawi: persimpangan (x) { kenaben 1: { ... } yappingtolol: { ... } }
shougo (a) {
  baai 20: { mite("Dua puluh!") }
  hyoujun: { mite("Lainnya") }
}`,
  },
  {
    id: "oop",
    title: "OOP & Sekte (Class)",
    category: "OOP / CLASS",
    icon: Layers,
    description: "Deklarasi kelas (sekte), konstruktor (tanjou), instansiasi (atarashii), dan pewarisan (keishou).",
    codeSnippet: `// 1. Murni: sekte, tanjou, atarashii, keishou, jibun
sekte Ninja {
  tanjou(nama) {
    jibun.nama = nama
  }
  salam() {
    mite("Shinobi: " + jibun.nama)
  }
}
kore n = atarashii Ninja("Naruto")
n.salam()

// 2. Singkat: sek, tan, ata, kei, ji
// 3. Wibu: paguyuban, lahiran, bikinBaru, turunanDari, siAing
// 4. Rongawi: sektejomok, ambatunat, ambatumbas, jalurhukum, lanangmas`,
  },
  {
    id: "modules",
    title: "Sistem Modul",
    category: "EXPORT / IMPORT",
    icon: FileCode,
    description: "Ekspor (koukai) dan Impor (toriyoseru ... kara) kode antar modul.",
    codeSnippet: `// 1. Ekspor simbol (4 Dialek):
// koukai | kou | sebarJutsu | umpansilang
koukai jutsu tambah(a, b) { kaesu a + b; }
koukai { item1, SekteBaru }

// 2. Impor modul (4 Dialek):
// toriyoseru { ... } kara "..."
// tori { ... } kra "..."
// summonJutsu { ... } dari "..."
// begalbaju { ... } ngawiland "..."
toriyoseru { jurusBayangan } kara "./ninja.wibu"
mite(jurusBayangan(3))`,
  },
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
    id: "iteration",
    title: "Iterasi Koleksi & Lambda",
    category: "FOR-IN / ARROW =>",
    icon: Sparkles,
    description: "Perulangan subete (For-In) dan fungsi lambda sebaris (=>)",
    codeSnippet: `// 1. Loop subete (4 Dialek):
// Murni: subete (x no list)
// Singkat: sube (x no list)
// Wibu: sikatSemua (x dari list)
// Rongawi: thugshaker (x alasdaun list)
kore tim = ["Megumin", "Aqua", "Kazuma"]
subete (hero no tim) {
  mite("Karakter: " + hero)
}

// 2. Fungsi Lambda Sebaris (Arrow =>):
kore kuadrat = x => x * x
kore lipat = utsusu([1, 2, 3], x => x * 10)

// 3. Pustaka Baru:
// bunri (split), tsunagu (join), okikae (replace)
// kiri (trim), fukumu (contains), gacha (RNG item)`,
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

// Fungsi utilitas konversi Base64 yang aman untuk UTF-8 dan URL Query Parameters
function encodeBase64Url(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b !== undefined) {
        binary += String.fromCharCode(b);
      }
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch {
    return "";
  }
}

function decodeBase64Url(str: string): string {
  if (!str) return "";
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    try {
      return decodeURIComponent(atob(str));
    } catch {
      return "";
    }
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
      "subete", "sube", "sikatSemua", "thugshaker",
      "no", "dari", "alasdaun",
      "toriyoseru", "tori", "summonJutsu", "begalbaju",
      "kara", "kra", "ngawiland", "koukai", "kou", "sebarJutsu", "umpansilang",
      "shougo", "sho", "cocokkan", "persimpangan",
      "baai", "baa", "kaloPas", "kenaben",
      "hyoujun", "hyo", "sisaan", "yappingtolol",
    ],

    // Kata kunci deklarasi & subrutin (4 Dialek Mutlak)
    declarationKeywords: [
      "kore", "ko", "siImut", "pokmipokmi",
      "zettai", "ze", "hargaMati", "bundarahma",
      "jutsu", "ju", "mybini", "fufufafa",
      "kaesu", "kae", "kasihPaham", "kandabahlil",
      "sekte", "sek", "paguyuban", "sektejomok",
      "tanjou", "tan", "lahiran", "ambatunat",
      "atarashii", "ata", "bikinBaru", "ambatumbas",
      "keishou", "kei", "turunanDari", "jalurhukum",
      "jibun", "ji", "siAing", "lanangmas",
    ],

    // Fungsi pendukung dan pustaka standar
    supportFunctions: [
      "mite", "mi", "teriakAmba", "salamkenal",
      "kuchiMite", "km", "bacotAmba", "cawapresin",
      "shibaraku", "siba", "santuyDulu", "nungguinLu",
      "imaJikan", "ima", "jamBerapaBanh", "cekJamLur",
      "nagasa", "naga", "seginiDoang", "panjangberurat",
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
      "retsu", "ret", "bikinBarisan", "budakhitam",
      "yomu", "yo", "bacainBerkas", "bukaBerkasLur",
      "kaku", "ka", "tulisinBerkas", "coretBerkasLur",
      "yobu", "yoB", "panggilBerkas", "sikatBanh",
      "ukeru", "uke", "ambilDataBanh", "SepongMas",
      "kanjiNi", "kn", "jadiObjekBanh", "uraiJsonLur",
      "kanjiMojiretsu", "kmj", "jadiTeksBanh", "bungkusJsonLur",
      "utsusu", "utu", "petainBanh", "petainLur",
      "erabu", "era", "saringBanh", "saringLur",
      "mitsukeru", "mitu", "cariinBanh", "fesnuker",
      "ruuto", "ru", "akarPangkat", "akarLur",
      "zettaichi", "zet", "mutlakBanh", "mutlakLur",
      "kiriSute", "ks", "bawahinBanh", "bawahLur",
      "kiriAge", "kia", "atasinBanh", "atasLur",
      "bunri", "bu", "pecahKata", "pecahkepala",
      "tsunagu", "tsuna", "lemKata", "lendirmurni",
      "okikae", "oki", "sulapKata", "akuntumbal",
      "kiri", "kri", "pangkas", "cukurfade",
      "fukumu", "fuku", "punyaGak", "monyetijo",
      "narabikae", "nara", "rapihin", "goyangpantat",
      "kirinuki", "kinu", "potongSebagian", "pedangdaging",
      "gacha", "gac", "tarikGacha", "weeklypass",
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
  const isCancelledRef = useRef<boolean>(false);
  const logBufferRef = useRef<string[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleRunCodeRef = useRef<() => void>(() => {});

  const flushLogs = useCallback(() => {
    if (logBufferRef.current.length === 0) return;
    const newItems = [...logBufferRef.current];
    logBufferRef.current = [];
    setOutputLog((prev) => {
      const combined = [...prev, ...newItems];
      if (combined.length > 1000) {
        return combined.slice(combined.length - 1000);
      }
      return combined;
    });
  }, []);

  const pushLog = useCallback((line: string) => {
    logBufferRef.current.push(line);
    if (!flushTimeoutRef.current) {
      flushTimeoutRef.current = setTimeout(() => {
        flushTimeoutRef.current = null;
        flushLogs();
      }, 25);
    }
  }, [flushLogs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get("code");
      if (codeParam) {
        const decoded = decodeBase64Url(codeParam);
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
      const encoded = encodeBase64Url(code);
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

  const handleStopExecution = useCallback(() => {
    if (!isRunning) return;
    isCancelledRef.current = true;
    setStatusMessage("Menghentikan...");
    pushLog("[Sistem] Menghentikan eksekusi atas permintaan pengguna...");
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
    flushLogs();
  }, [isRunning, pushLog, flushLogs]);

  const handleRunCode = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    isCancelledRef.current = false;
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
    logBufferRef.current = [];
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

      // 4. Runtime & Evaluator dengan pengaman kecepatan dan keamanan
      const env = createGlobalEnvironment({
        outputHandler: (lineMessage: string) => {
          pushLog(lineMessage);
        },
        maxLoopIterations: 50_000,
        maxCallStackDepth: 1000,
        timeoutMs: 10_000,
        isCancelledRef: isCancelledRef,
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
      pushLog(`[Sistem Error] ${errorMessage}`);
      setStatusMessage("Terjadi Kesalahan");
    } finally {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
      flushLogs();
      setIsRunning(false);
    }
  }, [code, isRunning, pushLog, flushLogs]);

  useEffect(() => {
    handleRunCodeRef.current = handleRunCode;
  }, [handleRunCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCodeRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClearOutput = () => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
    logBufferRef.current = [];
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
            <option value="patternMatchingDemo">Preset: Pattern Matching &amp; Destructuring (v1.8.0)</option>
            <option value="oopModulDemo">Preset: OOP (Sekte) &amp; Modul (v1.7.0)</option>
            <option value="dialekDemo">Preset: 4 Dialek Mutlak</option>
            <option value="tryCatchDemo">Preset: Penanganan Galat (Try-Catch)</option>
            <option value="iterasiDanGacha">Preset: Iterasi Koleksi, Lambda &amp; Gacha</option>
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

          {isRunning ? (
            <button
              onClick={handleStopExecution}
              className="px-4 py-1.5 rounded text-xs font-semibold shadow transition-all flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white active:scale-95 animate-pulse"
              title="Hentikan eksekusi kode saat ini"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Hentikan (Stop)
            </button>
          ) : (
            <button
              onClick={() => void handleRunCode()}
              className="px-4 py-1.5 rounded text-xs font-semibold shadow transition-all flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95"
              title="Jalankan kode (Ctrl+Enter / Cmd+Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Jalankan (Ctrl+Enter)
            </button>
          )}
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
            <span className="font-mono text-slate-400">WibuScript v{packageJson.version}</span>
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
              onMount={(editor, monaco) => {
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                  handleRunCodeRef.current();
                });
              }}
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
