# WibuScript

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

WibuScript adalah bahasa pemrograman esoterik (*esoteric programming language*) yang diimplementasikan menggunakan TypeScript dan berjalan di atas arsitektur *Tree-Walking Interpreter*. Bahasa ini mengabstraksi konstruksi sintaks pemrograman menjadi perpaduan terminologi informal dwibahasa (Indonesia-Jepang) dan Romaji murni. Proyek ini dilengkapi dengan modul inti (*Core Engine*) yang sepenuhnya universal dan aman untuk peramban, serta antarmuka Web Playground interaktif berbasis Next.js App Router untuk eksekusi kode secara *client-side*.

## Arsitektur Sistem

Struktur direktori proyek dirancang secara modular dengan pemisahan tegas antara logika mesin kompilasi, eksekutor baris perintah (*CLI*), dan antarmuka web interaktif:

```
wibuscript/
├── src/
│   ├── ast.ts          # Definisi tipe dan struktur Abstract Syntax Tree (AST)
│   ├── lexer.ts        # Analisis leksikal, tokenisasi, dan resolusi Sistem Alias
│   ├── parser.ts       # Analisis sintaksis (Recursive Descent Parsing ke AST)
│   ├── runtime.ts      # Tree-Walking Evaluator, Environment hierarkis, dan Standard Library
│   ├── index.ts        # Entry point Core Engine (ekspor modul universal & browser-safe)
│   └── cli.ts          # Eksekutor baris perintah (CLI) untuk berkas .wibu via Node.js
├── app/
│   ├── layout.tsx      # Root Layout Next.js App Router
│   ├── page.tsx        # Antarmuka Web Playground dan virtual terminal emulator
│   └── globals.css     # Konfigurasi Tailwind CSS v4
├── contoh.wibu         # Berkas demonstrasi kode program WibuScript
├── package.json        # Konfigurasi dependensi dan skrip proyek
├── tsconfig.json       # Konfigurasi kompilator TypeScript (Strict Mode)
└── README.md           # Dokumentasi teknis proyek
```

### 1. Core Engine
- **Lexer (`src/lexer.ts`)**: Mengurai kode sumber mentah menjadi rangkaian token secara deterministik. Mendukung literal string, numerik (bilangan bulat dan desimal), operator aritmatika, operator relasional ganda (`==`, `!=`, `<=`, `>=`), pelacakan posisi baris/kolom, serta kanonisasi Sistem Alias.
- **Parser (`src/parser.ts`)**: Menerapkan metode *Recursive Descent Parsing* berbasis prioritas operator (*precedence*) untuk menghasilkan pohon sintaksis abstrak (*AST*) bertipe kuat (*strongly typed*).
- **Runtime & Evaluator (`src/runtime.ts`)**: Mengeksekusi simpul AST secara asinkronus menggunakan arsitektur *Environment* bertingkat (*lexical scoping*). Dilengkapi *hook* penangkap output (*output streaming*) dan manajemen *Return Signal*.
- **Browser-Safe Core (`src/index.ts`)**: Menyediakan ekspor API mesin kompilasi yang sepenuhnya steril dari modul internal sistem operasi (`node:fs`, `node:path`), memungkinkan eksekusi langsung di lingkungan *browser* tanpa *bundling conflict*.

### 2. Standard Library (Pustaka Standar Bawaan)
Pustaka bawaan terdaftar langsung di dalam *Global Environment* dan dapat dipanggil kapan saja:
- `mite(arg)` / `kasihMite(arg)`: Mencetak nilai atau pesan ke *stdout* atau terminal virtual.
- `tungguBentar(ms)`: Menunda eksekusi secara asinkronus selama `ms` milidetik (membungkus `Promise`).
- `gacha(min, max)`: Generator angka acak (*Random Number Generator*) dalam rentang inklusif `[min, max]`.
- `waktuSekarang()`: Mengembalikan representasi string waktu lokal saat fungsi dieksekusi.
- `panjangTeks(teks)`: Menghitung dan mengembalikan jumlah karakter dari nilai string yang diberikan.
- `ubahAngka(teks)`: Mengonversi teks string numerik menjadi tipe data angka (*Number*).

### 3. Frontend Web Playground
- Dibangun di atas Next.js App Router dan Tailwind CSS v4.
- Evaluasi kode dilakukan secara murni di sisi peramban pengguna (*Client-Side Execution*).
- Menyediakan editor kode berbasis teks dengan dukungan indentasi tab, pintasan keyboard (`Ctrl+Enter`), metrik waktu eksekusi (milidetik), penghitung token, dan terminal virtual interaktif.

## Spesifikasi Sintaks (Sistem Alias)

WibuScript menyediakan Sistem Alias pada tahap leksikal. Pengguna dapat memilih antara varian ekspresif (Versi Ekstensi) atau varian ringkas (Versi Shorthand):

### 1. Deklarasi dan Nilai Literal
| Kata Kunci Standar | Versi Ekstensi | Versi Shorthand | Token Kategori | Penjelasan |
| :--- | :--- | :--- | :--- | :--- |
| `let` / `var` | `koreWa` | `kore` | `TokenType.Var` | Alokasi variabel baru dalam memori lingkup aktif. |
| `print(...)` | `kasihMite(...)` | `mite(...)` | `TokenType.Print` | Mencetak argumen ke konsol atau virtual terminal. |
| `true` | `majiBener` | `maji` | `TokenType.True` | Nilai boolean benar. |
| `false` | `usoBanget` | `uso` | `TokenType.False` | Nilai boolean salah. |
| `null` | `kosongZannen` | `kara` | `TokenType.Null` | Representasi ketiadaan nilai (null). |

### 2. Kontrol Alur (Control Flow)
| Kata Kunci Standar | Versi Ekstensi | Versi Shorthand | Token Kategori | Penjelasan |
| :--- | :--- | :--- | :--- | :--- |
| `if` | `kaloMoshi` | `moshi` | `TokenType.If` | Percabangan kondisi kondisional. |
| `else` | `chigauDong` | `chigau` | `TokenType.Else` | Blok alternatif jika kondisi bernilai salah. |
| `while` | `ulangZutto` | `zutto` | `TokenType.Loop` | Pengulangan blok selama predikat bernilai *truthy*. |

### 3. Subrutin (Fungsi)
| Kata Kunci Standar | Versi Ekstensi | Versi Shorthand | Token Kategori | Penjelasan |
| :--- | :--- | :--- | :--- | :--- |
| `function` | `bikinJutsu` | `jutsu` | `TokenType.Function` | Deklarasi fungsi pengguna berparameter. |
| `return` | `balikinDesu` | `kaesu` | `TokenType.Return` | Menghentikan fungsi dan mengembalikan nilai. |

### 4. Pustaka Standar Bawaan (Native Functions)
| Fungsi | Parameter | Tipe Kembalian | Deskripsi |
| :--- | :--- | :--- | :--- |
| `gacha(min, max)` | `Number`, `Number` | `Number` | Menghasilkan bilangan bulat acak di antara `min` dan `max`. |
| `waktuSekarang()` | *(tanpa argumen)* | `String` | Mengambil teks waktu lokal saat pemanggilan. |
| `panjangTeks(teks)`| `String` | `Number` | Menghitung total karakter string. |
| `ubahAngka(teks)` | `String` | `Number` | Mem-parsing teks string menjadi tipe angka. |
| `tungguBentar(ms)` | `Number` | `Null` | Menunda eksekusi selama `ms` milidetik (asinkronus). |

## Contoh Program WibuScript

Berikut adalah contoh program lengkap yang mendemonstrasikan kombinasi deklarasi variabel, pemanggilan fungsi pustaka standar, percabangan logika, subrutin, dan penundaan asinkronus:

```javascript
// Demonstrasi Sistem WibuScript
kore namaKsatria = "Ren"
kore levelAwal = ubahAngka("85")
kore statusIsekai = majiBener

kasihMite("[" + waktuSekarang() + "] Menginisialisasi sistem petualangan...")
tungguBentar(300)

// Pengecekan status menggunakan operator relasional
moshi (statusIsekai == maji) {
  mite("Ksatria terdaftar: " + namaKsatria)
  mite("Panjang nama karakter: " + panjangTeks(namaKsatria) + " karakter")
  mite("Tingkat kekuatan awal: " + levelAwal)
} chigau {
  mite("Karakter tidak valid.")
}

// Deklarasi subrutin kalkulasi dengan gacha RNG
bikinJutsu kalkulasiKekuatan(lvl) {
  kore faktorAcak = gacha(10, 25)
  mite("Faktor acak diperoleh: " + faktorAcak)
  balikinDesu lvl + faktorAcak
}

kore dayaTempur = kalkulasiKekuatan(levelAwal)
kasihMite("Total daya tempur akhir: " + dayaTempur)
```

## Panduan Penggunaan dan Instalasi

### 1. Kebutuhan Sistem
- **Node.js**: Versi 18.0.0 atau lebih baru.
- **npm**: Versi 9.0.0 atau lebih baru.

### 2. Instalasi Dependensi
Jalankan perintah berikut di direktori proyek:

```bash
npm install
```

### 3. Menjalankan Web Playground
Jalankan server pengembangan lokal:

```bash
npm run dev
```

Buka peramban web pada alamat `http://localhost:3000`.

### 4. Membangun Bundle Produksi
Untuk melakukan kompilasi proyek sebelum deployment (misalnya ke Vercel atau server mandiri):

```bash
npm run build
npm run start
```

### 5. Eksekusi Berkas Melalui CLI
Untuk mengeksekusi berkas kode sumber `.wibu` secara langsung di terminal tanpa peramban:

```bash
npx tsx src/cli.ts contoh.wibu
```

## Log Pembaruan (Changelog)

### v1.1.0
- Ekspansi Pustaka Standar (*Standard Library*): Menambahkan fungsi bawaan `gacha(min, max)`, `waktuSekarang()`, `panjangTeks(teks)`, dan `ubahAngka(teks)`.
- Restrukturisasi Core Engine: Pemisahan tegas antara modul universal (`src/index.ts`) dan CLI runner (`src/cli.ts`) untuk menjamin kompatibilitas total dengan Turbopack dan browser runtime.
- Penambahan Root Layout (`app/layout.tsx`) dan konfigurasi styling Tailwind CSS v4 (`app/globals.css`).
- Pembersihan referensi spesifik menjadi tema RPG/Isekai generik pada template antarmuka Web Playground.

### v1.0.0-MVP
- Rilis perdana modul Core Engine (Lexer, Recursive Descent Parser, dan Tree-Walking Interpreter).
- Implementasi Sistem Alias penuh untuk format kata kunci Ekstensi dan Shorthand.
- Implementasi penundaan asinkronus `tungguBentar` berbasis `Promise`.
- Implementasi Web Playground modern berbasis Next.js App Router dengan *client-side rendering* dan *real-time output streaming*.
- Penegakan TypeScript *Strict Mode* penuh di seluruh kode sumber.