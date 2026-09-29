<!-- File: README.md -->
<div align="center">

  <img src="https://raw.githubusercontent.com/Rafli161102/wibuscript/main/assets/images/header-typing.gif" width="180" alt="Animasi Mengetik Cepat" />

# WibuScript

<a href="https://github.com/Rafli161102/wibuscript">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3500&pause=1000&color=CB3837&center=true&vCenter=true&width=700&lines=Bahasa+Pemrograman+Esoterik+Modern;Sistem+4+Dialek+Mutlak;Tree-Walking+Interpreter+Berbasis+TypeScript;npm+install+-g+wibuscript" alt="WibuScript Typing Banner" />
</a>

<br/>

[![npm version](https://img.shields.io/npm/v/wibuscript.svg?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/wibuscript)
[![npm total downloads](https://img.shields.io/npm/dt/wibuscript.svg?style=for-the-badge&logo=npm&logoColor=white&color=2088FF&label=total%20downloads)](https://www.npmjs.com/package/wibuscript)
[![npm monthly downloads](https://img.shields.io/npm/dm/wibuscript.svg?style=for-the-badge&logo=npm&logoColor=white&color=007ACC&label=downloads%2Fbulan)](https://www.npmjs.com/package/wibuscript)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing%20121%2F121-729B1B?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Status](https://img.shields.io/badge/Status-Stable%20v2.2.0-brightgreen?style=for-the-badge)](https://github.com/Rafli161102/wibuscript/releases)
[![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](https://github.com/Rafli161102/wibuscript/blob/main/LICENSE)

<p align="center">
  <b>Jepang Murni | Jepang Singkat | Wibu Absurd | Meme Rongawi</b>
</p>

<p align="center">
  <a href="#tentang-wibuscript">Tentang</a> |
  <a href="#arsitektur-sistem">Arsitektur</a> |
  <a href="#sistem-4-dialek-mutlak">4 Dialek Mutlak</a> |
  <a href="#pustaka-standar">Pustaka Standar</a> |
  <a href="#contoh-kode">Contoh Kode</a> |
  <a href="#instalasi-dan-cli">Instalasi</a> |
  <a href="#log-pembaruan">Log Pembaruan</a>
</p>

---

</div>

## Tentang WibuScript

WibuScript adalah bahasa pemrograman esoterik yang dibuat di atas TypeScript dengan arsitektur v2.0 Compiler Pipeline (JS Target ES2022+) dan Tree-Walking Interpreter bawaan untuk REPL interaktif. Konsep utamanya sederhana: menyediakan sintaks pemrograman yang unik lewat Sistem 4 Dialek Mutlak, mulai dari Romaji Jepang rapi sampai meme internet lokal.

Meskipun pembawaannya santai dan absurd, proyek ini dirancang dengan standar teknis yang serius. Mesin kompilasinya modular, aman dijalankan langsung di browser untuk Web Playground dalam lingkungan Web Worker Sandbox terisolasi, dan dilengkapi CLI berbasis Node.js untuk eksekusi file script secara lokal.

<img src="https://raw.githubusercontent.com/Rafli161102/wibuscript/main/assets/images/tech-glasses.gif" width="140" align="right" alt="Analisis Teknis" />

## Arsitektur Sistem

Struktur direktori WibuScript memisahkan logika kompilasi inti dengan antarmuka pengguna:

```text
wibuscript/
|-- src/
|   |-- ast.ts                  # Struktur Abstract Syntax Tree (AST)
|   |-- lexer.ts                # Scanner token dan resolusi 4 dialek
|   |-- parser.ts               # Recursive Descent Parser ke bentuk AST
|   |-- transpiler.ts           # JS Transpiler (ES2022+) & Source Map v3
|   |-- sandbox.ts              # Web Worker & Worker Threads Sandbox Runner
|   |-- dialect-definitions.ts  # Single Source of Truth Dialect Grammar
|   |-- runtime.ts              # Tree-Walking Evaluator dan Pustaka Standar
|   |-- index.ts                # Entry point inti mesin WibuScript
|   `-- cli.ts                  # Eksekutor baris perintah Node.js
|-- scripts/
|   `-- generate-grammars.ts    # Generator TextMate & Monarch Tokenizer
|-- tests/
|   `-- dialect_snapshot.test.ts # Suite pengujian snapshot parity 4 dialek
|-- app/                        # Web Playground berbasis Next.js App Router
|-- vscode-extension/           # Ekstensi resmi TextMate VS Code
`-- README.md                   # Dokumentasi teknis proyek
```

### Komponen Utama
- **Lexer**: Mengurai baris teks program menjadi token secara konsisten. Mendukung literal string, angka desimal, ekspresi logika, sampai pelacakan posisi baris dan kolom.
- **Parser**: Membangun pohon sintaksis bertipe kuat menggunakan metode Recursive Descent Parsing yang murni independen dari target eksekusi.
- **Transpiler (Jalur Utama v2.0)**: Mengompilasi seluruh simpul AST ke JavaScript modern (ES2022+) berkecepatan tinggi dengan pemetaan runtime pustaka standar dan Source Map v3 resmi.
- **Sandbox Runner**: Lapisan proteksi terisolasi menggunakan Web Worker (browser) dan Worker Threads (Node.js) dengan batas waktu eksekusi (timeout 5000 ms), limit memori, dan keamanan *default-deny*.
- **Runtime Interpreter**: Mengeksekusi simpul AST secara asinkronus untuk kebutuhan interaktif REPL dan debugging.
- **Web Playground**: Editor interaktif berbasis Next.js dan Tailwind CSS yang mengeksekusi kode langsung di browser pengguna dalam sandbox Web Worker tanpa server eksternal.

<div style="clear: both;"></div>

## Sistem 4 Dialek Mutlak

Di WibuScript, tidak ada sintaks bahasa Inggris bawaan seperti `let`, `if`, atau `while`. Semuanya dipecah ke dalam empat dialek yang bisa dipakai bergantian atau bahkan dicampur dalam satu file:

- **Jepang Murni**: Menggunakan kosakata Romaji standar yang tertata rapi.
- **Jepang Singkat**: Singkatan kata ringkas untuk kamu yang ingin menulis kode dengan cepat.
- **Wibu Absurd**: Slang internet wibu Indonesia yang ekspresif.
- **Meme Rongawi**: Istilah meme kultural lokal yang santai dan tidak biasa.

Keempat dialek ini dipetakan ke Token Type yang sama di dalam Lexer, jadi perilaku programnya tetap identik.

### Tabel Pemetaan Kata Kunci

| Kategori | Jepang Murni | Jepang Singkat | Wibu Absurd | Meme Rongawi | Penjelasan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Variabel (LET)** | `kore` | `ko` | `iniDesu` | `pokmipokmi` | Deklarasi variabel yang nilainya bisa diubah. |
| **Tetapan (CONST)** | `zettai` | `ze` | `zettaiDa` | `bundarahma` | Nilai tetap yang tidak bisa diubah kembali. |
| **Kosong (NULL)** | `munashi` | `mu` | `naniKore` | `blukutuk` | Representasi data yang belum atau tidak bernilai. |
| **Benar (TRUE)** | `hontou` | `hon` | `hontouNi` | `unjukkebolehan` | Nilai boolean benar. |
| **Salah (FALSE)** | `uso` | `uso` | `chigauYo` | `keracunanmbg` | Nilai boolean salah. |
| **Percabangan (IF)** | `moshi` | `mo` | `moShiKalo` | `izintampil` | Menjalankan blok kode jika syarat terpenuhi. |
| **Selain Jika (ELSE IF)** | `soretomo` | `sore` | `soredemoNe` | `wowok` | Opsi kondisi kedua jika syarat pertama gagal. |
| **Selainnya (ELSE)** | `hoka` | `ho` | `shoganaiNe` | `woijawa` | Blok fallback jika semua kondisi di atas tidak terpenuhi. |
| **Perulangan (WHILE)** | `zutto` | `zu` | `zuttoLoop` | `nyawit` | Mengulang blok kode selama syarat masih benar. |
| **Hentikan Loop** | `yame` | `ya` | `yameteKure` | `bijisatu` | Menghentikan putaran loop secara paksa. |
| **Lanjutkan Loop** | `tsugi` | `tsu` | `tsugiNe` | `ambatukam` | Melewati sisa baris dan lanjut ke putaran berikutnya. |
| **Fungsi (FUNCTION)** | `jutsu` | `ju` | `watashiJutsu` | `fufufafa` | Membuat fungsi yang bisa dipanggil kembali. |
| **Kembalikan (RETURN)** | `kaesu` | `kae` | `haiBeri` | `kandabahlil` | Mengembalikan nilai hasil kalkulasi fungsi. |
| **Cetak (PRINT)** | `mite` | `mi` | `iuYo` | `salamkenal` | Menampilkan teks atau nilai ke layar konsol. |
| **Tunggu (AWAIT)** | `matte` | `mat` | `matteNe` | `admindatang` | Menunggu proses asinkronus selesai berjalan. |
| **Coba (TRY)** | `kokoromi` | `koko` | `yatteMiyo` | `ragnamok` | Menjalankan kode yang berisiko memicu galat. |
| **Tangkap (CATCH)** | `yurusu` | `yuru` | `gomennasai` | `amanBos` | Menangani pesan galat tanpa membuat aplikasi crash. |
| **Kelas (CLASS)** | `sekte` | `sek` | `nakama` | `sektejomok` | Deklarasi cetak biru objek atau class. |
| **Konstruktor** | `tanjou` | `tan` | `umareta` | `ambatunat` | Fungsi inisialisasi awal saat objek dibuat. |
| **Objek Baru (NEW)** | `atarashii` | `ata` | `atarashiiNe` | `ambatumbas` | Membuat instance baru dari suatu kelas. |
| **Pewarisan** | `keishou` | `kei` | `kouhaiDesu` | `jalurhukum` | Mewariskan metode dan properti dari kelas induk. |
| **Instance (THIS)** | `jibun` | `ji` | `oreSama` | `lanangmas` | Merujuk pada instance aktif saat ini. |
| **Ekspor (EXPORT)** | `koukai` | `kou` | `sebarJutsu` | `umpansilang` | Mengekspor simbol keluar modul. |
| **Impor (IMPORT)** | `toriyoseru` | `tori` | `summonJutsu` | `begalbaju` | Mengimpor simbol dari modul lain. |
| **Sumber Modul (FROM)** | `kara` | `kra` | `dari` | `ngawiland` | Jalur asal berkas impor. |
| **Pencocokan Pola (MATCH)** | `shougo` | `sho` | `cocokkan` | `persimpangan` | Struktur switch/case eksklusif untuk pencocokan nilai. |
| **Kasus Pola (CASE)** | `baai` | `baa` | `kaloPas` | `kenaben` | Cabang kondisi nilai yang dicocokkan. |
| **Kasus Standar (DEFAULT)** | `hyoujun` | `hyo` | `sisaan` | `yappingtolol` | Cabang fallback jika tidak ada kasus yang cocok. |
| **Iterasi Koleksi (FOR)** | `subete` | `sube` | `zenbuNe` | `thugshaker` | Perulangan untuk menjelajahi elemen barisan. |
| **Partikel Koleksi (IN)** | `no` | `no` | `dari` | `alasdaun` | Kata penghubung elemen terhadap koleksi data. |

## Pustaka Standar

WibuScript menyediakan fungsi bawaan untuk mempermudah manipulasi data tanpa perlu menulis logika dasar dari nol. Satu implementasi runtime internal digunakan untuk melayani empat nama panggilan yang berbeda di masing-masing dialek.

Perbedaan antardialek hanya ada pada penamaan fungsi, sementara hasil eksekusinya tetap persis sama.

### Contoh Fungsi Populer

| Kemampuan | Jepang Murni | Jepang Singkat | Wibu Absurd | Meme Rongawi | Tipe Return |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Output Terminal** | `kuchiMite(pesan)` | `km(pesan)` | `omaeWaIu(pesan)` | `cawapresin(pesan)` | `Null` |
| **Jeda Waktu** | `shibaraku(ms)` | `siba(ms)` | `matteNeSikit(ms)` | `nungguinLu(ms)` | `Null` |
| **Waktu Sistem** | `imaJikan()` | `ima()` | `nanjiDesu()` | `kopihitam()` | `String` |
| **Panjang Data** | `nagasa(data)` | `naga(data)` | `doreKurai(data)` | `panjangberurat(data)` | `Number` |
| **Angka Acak** | `randamu(min, max)` | `ran(min, max)` | `unmeiGacha(min, max)` | `rudalmentah(min, max)` | `Number` |
| **Buat Barisan** | `retsu(...)` | `ret(...)` | `nakamaTachi(...)` | `budakhitam(...)` | `Array` |
| **Tambah ke Array** | `ireta(arr, item)` | `ire(arr, item)` | `haireNe(arr, item)` | `priaotot(arr, item)` | `Array` |

> [!NOTE]
> Fungsi lain yang tersedia mencakup pengurai JSON, pemotongan teks, perhitungan akar, pembulatan angka, dan pembacaan berkas lokal pada mode CLI.

## Contoh Kode

<img align="right" width="160" src="https://raw.githubusercontent.com/Rafli161102/wibuscript/main/assets/images/cat-coding.gif" alt="Cat Coding" />

Berikut adalah contoh program sederhana yang menggabungkan manipulasi objek, array, dan kontrol loop dengan beberapa dialek sekaligus:

```javascript
// Deklarasi data profil
kore profil = {
  nama: "Sora",
  divisi: "Kompilator",
  level: 1
};

zettai namaBesar = ookiku(profil.nama);
kuchiMite("Nama terdaftar: " + namaBesar);
km("Waktu mulai: " + ima());

// Mengelola array daftar tugas
iniDesu daftarTugas = nakamaTachi("Cek Lexer", "Bangun AST");
haireNe(daftarTugas, "Uji Runtime");
omaeWaIu("Jumlah tugas aktif: " + doreKurai(daftarTugas));

// Perulangan hitungan tugas
pokmipokmi nomor = 0;
zutto (nomor < 5) {
  nomor = nomor + 1;

  moshi (nomor == 2) {
    cawapresin("Nomor 2 dilewati sejenak");
    tsugi;
  }

  kuchiMite("Memproses tugas ke-" + nomor);

  moShiKalo (nomor == 4) {
    kuchiMite("Batas harian tercapai, berhenti sekarang");
    bijisatu;
  }
}

kuchiMite("Seluruh proses berhasil dijalankan.");
```

<div style="clear: both;"></div>

## Instalasi dan CLI

<img src="https://raw.githubusercontent.com/Rafli161102/wibuscript/main/assets/images/fast-keyboard.gif" width="140" align="right" alt="Animasi Mengetik Cepat" />

Kamu bisa langsung mencoba WibuScript tanpa instalasi menggunakan npx:

```bash
npx wibuscript --help
```

### Kebutuhan Dasar
- **Node.js**: Versi 18.0.0 atau yang lebih baru.
- **npm**: Versi 9.0.0 atau yang lebih baru.

### Perintah Baris Perintah (CLI)

```bash
# Instalasi global melalui npm
npm install -g wibuscript

# Masuk ke REPL interaktif
wibu

# Menjalankan berkas kode WibuScript
wibu run skrip_kamu.wibu

# Mengompilasi kode WibuScript ke JavaScript modern
wibu build skrip_kamu.wibu -o output.js

# Mengonversi sintaks antar-dialek secara otomatis
wibu convert skrip_kamu.wibu --to rongawi -o hasil_rongawi.wibu

# Memasang pustaka pihak ketiga via Wibu Package Manager
wibu add matematika-wibu

# Menjalankan Language Server Protocol (LSP) mandiri
wibu lsp
```

<div style="clear: both;"></div>

---

## Log Pembaruan

### v2.2.0
- Penguatan interoperabilitas npm (FFI): kemampuan mengimpor langsung paket JavaScript npm asli (seperti lodash) dan mengeksekusi fungsinya secara mulus di seluruh 4 dialek.
- Penyempurnaan Wibu Package Manager (src/pm.ts): normalisasi prefiks 'npm:', resolusi mode ganda (modul .wibu vs modul JavaScript JS), serta penanganan galat instalasi yang informatif dan aman.
- Peningkatan Transpiler ES2022 (src/transpiler.ts) untuk menghasilkan sintaks import ES standar tanpa prefiks 'npm:'.
- Penambahan skrip contoh interoperabilitas (examples/interop_npm.wibu) dan rangkaian pengujian unit vitest (tests/npm_interop.test.ts) dengan 121 tes lulus 100%.

### v2.1.0
- Implementasi Wibu Package Manager (src/pm.ts) untuk instalasi paket via perintah 'wibu add' dan resolusi modul 'npm:nama-paket'.
- Implementasi Language Server Protocol mandiri (src/lsp.ts) berbasis JSON-RPC melalui I/O standar untuk diagnostik real-time dan penyelesaian otomatis 4 dialek.
- Penambahan argumen CLI 'wibu add <paket>' dan 'wibu lsp'.

### v2.0.1
- Pembaruan aset animasi GIF dokumentasi menggunakan penyimpanan lokal persisten di folder assets/images/ dan tautan raw GitHub resmi untuk keandalan tampilan di GitHub dan web npmjs.com.

### v2.0.0
- Transisi resmi ke Arsitektur Compiler Pipeline & JS Target ES2022+ sebagai jalur eksekusi utama.
- Single Source of Truth Dialect Grammar (src/dialect-definitions.ts) untuk Monaco Editor dan VS Code TextMate.
- Web Worker Sandbox Runner (src/sandbox.ts) isomorfik dengan timeout default 5000 ms, memory limit, dan default-deny security.
- Transpiler JavaScript teroptimasi dengan dukungan penuh Source Map v3 (Base64 VLQ mapping).
- Dialect Parity Snapshot Test Suite (tests/dialect_snapshot.test.ts) dengan verifikasi 100% AST identik dan output identik di seluruh 4 dialek (107/107 tes lulus).

### v1.9.1
- Publikasi resmi WibuScript ke registry npm global publik.
- Integrasi alur kerja publikasi otomatis ke GitHub Packages.
- Sinkronisasi penanda versi CLI dan pembuatan tag rilis repositori.

### v1.9.0
- Redesign total dialek Wibu Absurd agar lebih mengalir dengan gaya internet Indo-Jepang natural.
- Standardisasi kosakata Meme Rongawi otentik tanpa akhiran yang repetitif.
- Pembersihan dan penguatan kompatibilitas mundur untuk skrip yang dibuat pada versi sebelumnya.
- Penyelesaian 96 pengujian otomatis Vitest dengan hasil lulus 100%.

### v1.8.0
- Penambahan fitur Pattern Matching dengan dukungan ekspresi bersyarat 4 dialek.
- Integrasi Destructuring untuk barisan dan objek kamus.
- Implementasi operator Spread untuk penggabungan array dan string.
- Peningkatan keamanan Web Playground dengan pembatas memori dan pencegahan UI freeze.

### v1.7.0
- Implementasi Pemrograman Berorientasi Objek (Class, Constructor, Instance, Inheritance, dan This).
- Penambahan sistem modul lokal (Export dan Import) dengan registry virtual.
- Sinkronisasi transpiler ke standar JavaScript ES2022.

---

<div align="center">
  <img src="https://raw.githubusercontent.com/Rafli161102/wibuscript/main/assets/images/sleepy-footer.gif" width="200" alt="Animasi Istirahat" />
  <p><i>Proses kompilasi selesai. Selamat bereksplorasi dengan WibuScript!</i></p>
</div>