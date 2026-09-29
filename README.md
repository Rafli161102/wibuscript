<!-- File: README.md -->
<div align="center">

  <img src="https://media.tenor.com/7H-O7N7m4q0AAAAi/anime-typing.gif" width="180" alt="Petualang Mengetik Mantra" />

# WibuScript: Grimoire Esolang Dunia Isekai

<a href="https://github.com/Rafli161102/wibuscript">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3500&pause=1000&color=CB3837&center=true&vCenter=true&width=700&lines=Selamat+Datang+di+Guild+WibuScript;Bahasa+Pemrograman+Esoterik+Rasa+JRPG;Satu+Mantra+Runtime,+Empat+Faksi+Dialek;Kompilasi+AST+Tanpa+Bikin+UI+Freeze;npm+install+-g+wibuscript" alt="WibuScript Typing Banner" />
</a>

<br/>

[![npm version](https://img.shields.io/npm/v/wibuscript.svg?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/wibuscript)
[![npm downloads](https://img.shields.io/npm/dm/wibuscript.svg?style=for-the-badge&logo=npm&logoColor=white&color=2088FF)](https://www.npmjs.com/package/wibuscript)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing%2096%2F96-729B1B?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Status](https://img.shields.io/badge/Status-Stable%20v1.9.1-brightgreen?style=for-the-badge)](https://github.com/Rafli161102/wibuscript/releases)
[![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](https://github.com/Rafli161102/wibuscript/blob/main/LICENSE)

<p align="center">
  <b>Faksi Jepang Murni | Faksi Jepang Singkat | Faksi Wibu Absurd | Faksi Meme Rongawi</b>
</p>

<p align="center">
  <a href="#prolog-dunia-wibuscript">Prolog</a> |
  <a href="#pilih-faksi-karakter-sistem-4-dialek-mutlak">Pilih Faksi</a> |
  <a href="#grimoire-mantra-bawaan-pustaka-standar">Grimoire Mantra</a> |
  <a href="#simulasi-dungeon-battle-contoh-kode">Dungeon Battle</a> |
  <a href="#quest-memulai-petualangan-instalasi--cli">Quest Log</a>
</p>

---

</div>

## Prolog: Dunia WibuScript

Pernah kepikiran ngoding tapi suasananya berasa lagi ngerapal sihir bareng party di game JRPG jadul? WibuScript lahir buat itu. Ini adalah bahasa pemrograman esoterik berbasis TypeScript dengan arsitektur Tree-Walking Interpreter sungguhan. 

Bukan sekadar proyek lelucon biasa, WibuScript punya arsitektur solid yang membagi tugas antara Core Engine universal (aman running di browser tanpa modul OS aneh-aneh) dan CLI Runner berbasis Node.js buat eksekusi file script langsung di terminal PC lu.

<img src="https://media.tenor.com/fA15L6yUks0AAAAi/anime-glasses.gif" width="140" align="right" alt="Kacamata Analisis Strategi" />

### Blueprint Mesin Kompilasi
Struktur direktori WibuScript dibangun modular biar gampang dirawat pas party lagi leveling:

```text
wibuscript/
|-- src/
|   |-- ast.ts          # Definisi struktur pohon sintaks (AST)
|   |-- lexer.ts        # Scanner mantra dan resolusi 4 Faksi Dialek
|   |-- parser.ts       # Recursive Descent Parser pengubah token ke AST
|   |-- runtime.ts      # Tree-Walking Evaluator dan Grimoire Pustaka
|   |-- index.ts        # Entry point browser-safe untuk Web Playground
|   `-- cli.ts          # Terminal runner untuk file berekstensi .wibu
|-- app/                # Arena Web Playground berbasis Next.js App Router
|-- contoh.wibu         # Skrip uji coba dungeon
`-- README.md           # Peta panduan petualang
```

<div style="clear: both;"></div>

## Pilih Faksi Karakter: Sistem 4 Dialek Mutlak

Di dunia WibuScript, gak ada kata kunci bahasa Inggris konvensional kayak `let`, `if`, atau `while`. Semuanya sudah diganti total lewat Sistem 4 Dialek Mutlak. Lu bebas milih gaya penulisan sesuai faksi karakter yang lu mainkan:

- **Jepang Murni**: Kelas Paladin/Mage elegan. Menggunakan istilah Romaji standar yang tertata rapi.
- **Jepang Singkat**: Kelas Assassin/Ninja. Dibuat serba minimalis buat speedrun ngetik mantra kilat.
- **Wibu Absurd**: Kelas Isekai Adventurer. Gaya bahasa wibu internet lokal yang cringe dan hiperbolis.
- **Meme Rongawi**: Kelas Berserker Otentik. Mengadopsi kosakata kultural internet paling liar.

Kerennya lagi, mesin Lexer memetakan keempat dialek ini ke Token Type yang sama di belakang layar. Lu bahkan bisa bikin kode campur aduk antar-faksi tanpa bikin parser meledak.

### Tabel Mantra Inti (Core Syntax)

| Kategori Mantra | Faksi Jepang Murni | Faksi Jepang Singkat | Faksi Wibu Absurd | Faksi Meme Rongawi | Fungsi Logika |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Simpan Variabel** | `kore` | `ko` | `iniDesu` | `pokmipokmi` | Simpan data yang nilainya bisa berubah sewaktu-waktu. |
| **Kunci Tetapan** | `zettai` | `ze` | `zettaiDa` | `bundarahma` | Kunci nilai absolut, haram hukumnya diubah. |
| **Ketiadaan (Null)** | `munashi` | `mu` | `naniKore` | `blukutuk` | Menandakan slot inventaris atau variabel kosong melompong. |
| **Kondisi Valid** | `hontou` | `hon` | `hontouNi` | `unjukkebolehan` | Nilai kebenaran boolean (True). |
| **Kondisi Palsu** | `uso` | `uso` | `chigauYo` | `keracunanmbg` | Nilai kepalsuan boolean (False). |
| **Percabangan (If)** | `moshi` | `mo` | `moShiKalo` | `izintampil` | Cek kondisi, lanjut eksekusi kalau status valid. |
| **Alternatif (Else If)** | `soretomo` | `sore` | `soredemoNe` | `wowok` | Jalur alternatif kalau kondisi pertama gagal. |
| **Mentok (Else)** | `hoka` | `ho` | `shoganaiNe` | `woijawa` | Rute cadangan terakhir saat semua cabang buntu. |
| **Looping (While)** | `zutto` | `zu` | `zuttoLoop` | `nyawit` | Grinding kode terus-menerus selama syarat terpenuhi. |
| **Keluar Loop** | `yame` | `ya` | `yameteKure` | `bijisatu` | Berhenti paksa dari perulangan dungeon. |
| **Lanjut Loop** | `tsugi` | `tsu` | `tsugiNe` | `ambatukam` | Skip sisa putaran saat ini, langsung tancap gas ke iterasi berikutnya. |
| **Segel Jurus (Func)** | `jutsu` | `ju` | `watashiJutsu` | `fufufafa` | Bungkus logika jadi fungsi sakti yang bisa dipanggil ulang. |
| **Lempar Hasil** | `kaesu` | `kae` | `haiBeri` | `kandabahlil` | Kembalikan hasil olahan jurus ke pemanggil. |
| **Teriak Console** | `mite` | `mi` | `iuYo` | `salamkenal` | Cetak pesan atau hasil mantra ke layar konsol terminal. |
| **Jeda Asinkronus** | `matte` | `mat` | `matteNe` | `admindatang` | Tahan eksekusi proses nungguin tugas async kelar. |
| **Tes Bahaya (Try)** | `kokoromi` | `koko` | `yatteMiyo` | `ragnamok` | Masuk ke blok rawan galat tanpa takut game over. |
| **Atasi Galat (Catch)** | `yurusu` | `yuru` | `gomennasai` | `amanBos` | Tangkap error dan pulihkan kondisi sistem. |
| **Buka Party (Class)** | `sekte` | `sek` | `nakama` | `sektejomok` | Deklarasi cetak biru objek atau guild karakter. |
| **Lahir Objek** | `tanjou` | `tan` | `umareta` | `ambatunat` | Inisialisasi status dasar saat anggota party baru diciptakan. |
| **Summon Instansi** | `atarashii` | `ata` | `atarashiiNe` | `ambatumbas` | Buat instansi nyata dari cetak biru kelas. |
| **Warisan Guild** | `keishou` | `kei` | `kouhaiDesu` | `jalurhukum` | Turunkan jurus dan status dari kelas induk ke anak. |
| **Status Diri** | `jibun` | `ji` | `oreSama` | `lanangmas` | Akses properti milik instansi karakter itu sendiri. |

## Grimoire Mantra Bawaan (Pustaka Standar)

<img src="https://media.tenor.com/K_l082wA3m8AAAAi/magic-anime.gif" width="130" align="left" alt="Anime Magic Syntax" style="margin-right: 15px;" />

WibuScript menyediakan Grimoire mantra bawaan biar lu gak perlu repot bikin fungsi dasar dari nol saat bertualang. Mengusung prinsip satu implementasi internal untuk empat faksi sintaks, semua fungsi ini punya perilaku runtime yang identik di balik layar.

Perbedaan faksi cuma ada di cara manggil mantranya, bukan di efek sihirnya.

<div style="clear: both;"></div>

### Daftar Mantra Pustaka Unggulan

| Efek Sihir | Faksi Jepang Murni | Faksi Jepang Singkat | Faksi Wibu Absurd | Faksi Meme Rongawi | Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kirim Pesan** | `kuchiMite(teks)` | `km(teks)` | `omaeWaIu(teks)` | `cawapresin(teks)` | `Null` |
| **Meditasi (Delay)** | `shibaraku(ms)` | `siba(ms)` | `matteNeSikit(ms)` | `nungguinLu(ms)` | `Null` |
| **Cek Waktu Realtime** | `imaJikan()` | `ima()` | `nanjiDesu()` | `kopihitam()` | `String` |
| **Ukur Kapasitas** | `nagasa(target)` | `naga(target)` | `doreKurai(target)` | `panjangberurat(target)` | `Number` |
| **Gacha Nasib (RNG)** | `randamu(min, max)` | `ran(min, max)` | `unmeiGacha(min, max)` | `rudalmentah(min, max)` | `Number` |
| **Bentuk Pasukan** | `retsu(...)` | `ret(...)` | `nakamaTachi(...)` | `budakhitam(...)` | `Array` |
| **Tarik Anggota (Push)** | `ireta(arr, item)` | `ire(arr, item)` | `haireNe(arr, item)` | `priaotot(arr, item)` | `Array` |

> [!NOTE]
> Grimoire lengkap mencakup pengolahan JSON, kalkulasi akar/pangkat, pemotongan teks, sampai sistem I/O berkas untuk mode CLI.

## Simulasi Dungeon Battle: Contoh Kode

<img align="right" width="160" src="https://media.tenor.com/jNgKSlUpmkEAAAAM/typing-laptop.gif" alt="Cat Coding" />

Di bawah ini adalah simulasi pertempuran mini yang ditulis pake gaya campuran antar-faksi. Ini bukti nyata kalau arsitektur kompilator WibuScript fleksibel dan membebaskan gaya koding lu:

```javascript
// Mempersiapkan Status Karakter Pahlawan
kore pahlawan = {
  nama: "Ksatria Kegelapan",
  level: 1,
  hp: 100
};

zettai namaKeren = ookiku(pahlawan.nama);
kuchiMite("Pahlawan yang terpilih: " + namaKeren);
km("Waktu mulai raid: " + ima());

// Membentuk Inventaris Skill Memakai Faksi Wibu Absurd
iniDesu kantongSkill = nakamaTachi("Tebasan Angin", "Pelindung Bayangan");
haireNe(kantongSkill, "Mantra Darurat");
omaeWaIu("Jumlah skill yang siap dipakai: " + doreKurai(kantongSkill));

// Simulasi Pertarungan Looping Campuran Faksi Rongawi dan Jepang
pokmipokmi ronde = 0;
zutto (ronde < 5) {
  ronde = ronde + 1;

  moshi (ronde == 2) {
    cawapresin("Ronde 2 musuh kabur sebentar, skip giliran!");
    tsugi;
  }

  kuchiMite("Menyerang monster di ronde ke-" + ronde);

  moShiKalo (ronde == 4) {
    kuchiMite("Mana karakter habis, batalkan raid!");
    bijisatu;
  }
}

kuchiMite("Ekspedisi dungeon selesai dengan damai.");
```

<div style="clear: both;"></div>

## Quest Memulai Petualangan: Instalasi & CLI

<img src="https://media.tenor.com/-wZAi-4EXugAAAAM/anime-keyboard.gif" width="140" align="right" alt="Anime Hacker Typing" />

Lu gak perlu repot ritual berbelit-belit buat mulai jalanin skrip WibuScript di komputer lu. Semua perkakas baris perintah sudah dipaketkan rapi di npm global.

Mau coba instan tanpa perlu instalasi lokal? Langsung panggil via npx:

```bash
npx wibuscript --help
```

### Kebutuhan Perangkat Petualang
- **Node.js**: Versi 18.0.0 atau yang lebih baru.
- **npm**: Versi 9.0.0 atau yang lebih baru.

### Perintah Mantra CLI (Command Center)

```bash
# 1. Pasang paket petualang secara global
npm install -g wibuscript

# 2. Buka konsol sihir interaktif (REPL)
wibu

# 3. Jalankan skrip petualangan file .wibu
wibu run quest_pertama.wibu

# 4. Transpile mantra WibuScript ke JavaScript modern
wibu build quest_pertama.wibu -o hasil_mantra.js

# 5. Konversi otomatis gaya penulisan ke faksi Rongawi
wibu convert quest_pertama.wibu --to rongawi -o versi_rongawi.wibu
```

<div style="clear: both;"></div>

---

<div align="center">
  <img src="https://media.tenor.com/mN-2yFvFO8UAAAAM/anime-sleep-sleepy.gif" width="200" alt="Anime Sleeping Exhausted" />
  <p><i>Kompilator selesai dieksekusi... Saatnya party beristirahat di inn terdekat.</i></p>
</div>