<!-- File: README.md -->
# WibuScript

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

WibuScript adalah bahasa pemrograman esoterik (*esoteric programming language*) yang diimplementasikan menggunakan TypeScript dan berjalan di atas arsitektur *Tree-Walking Interpreter*. Bahasa ini mengabstraksi konstruksi sintaks pemrograman menjadi perpaduan terminologi informal dwibahasa (Indonesia-Jepang) dan Romaji murni melalui Sistem Alias ganda. Proyek ini dilengkapi modul inti (*Core Engine*) yang sepenuhnya universal dan aman untuk peramban, serta antarmuka Web Playground interaktif berbasis Next.js App Router untuk eksekusi kode secara *client-side*.

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
- **Lexer (`src/lexer.ts`)**: Mengurai kode sumber mentah menjadi rangkaian token secara deterministik. Mendukung literal string, numerik (bilangan bulat dan desimal), operator aritmatika, operator relasional ganda (`==`, `!=`, `<=`, `>=`), pasangan kunci objek (`:`), akses titik (`.`), pelacakan posisi baris/kolom, serta resolusi Sistem Alias kata kunci.
- **Parser (`src/parser.ts`)**: Menerapkan metode *Recursive Descent Parsing* berbasis prioritas operator (*precedence*) untuk menghasilkan pohon sintaksis abstrak (*AST*) bertipe kuat (*strongly typed*). Mendukung deklarasi variabel, percabangan, fungsi, perulangan, `BreakStatement`, `ContinueStatement`, `ObjectLiteral`, dan `MemberExpr`.
- **Runtime & Evaluator (`src/runtime.ts`)**: Mengeksekusi simpul AST secara asinkronus menggunakan arsitektur *Environment* bertingkat (*lexical scoping*). Dilengkapi *hook* penangkap output (*output streaming*), penanganan sinyal loop (`Break`/`Continue`), evaluasi objek kamus, manipulasi string, dan manajemen *Return Signal*.
- **Browser-Safe Core (`src/index.ts`)**: Menyediakan ekspor API mesin kompilasi yang sepenuhnya steril dari modul internal sistem operasi (`node:fs`, `node:path`), memungkinkan eksekusi langsung di lingkungan *browser* tanpa konflik *bundling*.

### 2. Frontend Web Playground
- Dibangun di atas Next.js App Router dan Tailwind CSS v4.
- Evaluasi kode dilakukan secara murni di sisi peramban pengguna (*Client-Side Execution*).
- Menyediakan editor kode berbasis teks dengan dukungan indentasi tab, pintasan keyboard (`Ctrl+Enter`), metrik waktu eksekusi (milidetik), penghitung token, virtual terminal interaktif, dan fitur *Shareable URL* berbasis kompresi Base64.

## Spesifikasi Sintaks (Sistem Alias)

WibuScript menyediakan arsitektur Sistem Alias ganda pada seluruh lapisan sintaks bahasa dan Pustaka Standar. Setiap instruksi memiliki padanan antara varian ekspresif (Versi Ekstensi Indo-Jepang) dan varian ringkas (Versi Shorthand 100% Romaji Jepang murni) yang terikat pada eksekutor identik.

### 1. Deklarasi dan Nilai Literal
| Kata Kunci Standar | Versi Ekstensi | Versi Shorthand | Token Kategori | Penjelasan |
| :--- | :--- | :--- | :--- | :--- |
| `let` / `var` | `koreWa` | `kore` | `TokenType.Var` | Alokasi variabel baru dalam memori lingkup aktif. |
| `true` | `majiBener` | `maji` | `TokenType.True` | Nilai boolean benar. |
| `false` | `usoBanget` | `uso` | `TokenType.False` | Nilai boolean salah. |
| `null` | `kosongZannen` | `kara` | `TokenType.Null` | Representasi ketiadaan nilai (null). |

### 2. Kontrol Alur (Control Flow)
| Kata Kunci Standar | Versi Ekstensi | Versi Shorthand | Token Kategori | Penjelasan |
| :--- | :--- | :--- | :--- | :--- |
| `if` | `kaloMoshi` | `moshi` | `TokenType.If` | Percabangan kondisi kondisional. |
| `else` | `chigauDong` | `chigau` | `TokenType.Else` | Blok alternatif jika kondisi bernilai salah. |
| `while` | `ulangZutto` | `zutto` | `TokenType.Loop` | Pengulangan blok selama predikat bernilai *truthy*. |
| `break` | `berhentiDuluKudasai` | `tomare` | `TokenType.Break` | Menghentikan eksekusi perulangan saat ini. |
| `continue` | `lanjutAksiSugi` | `tsugi` | `TokenType.Continue` | Melompati iterasi perulangan ke putaran berikutnya. |

### 3. Subrutin (Fungsi)
| Kata Kunci Standar | Versi Ekstensi | Versi Shorthand | Token Kategori | Penjelasan |
| :--- | :--- | :--- | :--- | :--- |
| `function` | `bikinJutsu` | `jutsu` | `TokenType.Function` | Deklarasi fungsi pengguna berparameter. |
| `return` | `balikinDesu` | `kaesu` | `TokenType.Return` | Menghentikan fungsi dan mengembalikan nilai. |

### 4. Pustaka Standar (Standard Library Alias)
| Fitur Standar | Versi Ekstensi | Versi Shorthand | Tipe Balikan | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| Output Konsol | `kasihMite(pesan)` | `mite(pesan)` | `Null` | Mencetak pesan ke *stdout* atau virtual terminal. |
| Asynchronous Delay | `tungguBentarKudasai(ms)` | `mate(ms)` | `Null` | Menunda eksekusi selama `ms` milidetik (Promise). |
| Waktu Lokal | `sekarangImaDesu()` | `ima()` | `String` | Mengambil representasi string waktu lokal terkini. |
| Hitung Panjang | `tolongCekNagasa(arg)` | `nagasa(arg)` | `Number` | Menghitung jumlah karakter teks string atau elemen array. |
| Konversi ke Angka | `bikinJadiSuji(teks)` | `sujiNi(teks)` | `Number` | Mengonversi teks string numerik menjadi tipe angka. |
| Tipe Data (Typeof) | `apaTipeKoreWa(arg)` | `shurui(arg)` | `String` | Mengembalikan nama tipe data ("angka", "teks", "array", "objek"). |
| Pangkat Matematika | `kalkulasiPangkatSuji(a, b)` | `beki(a, b)` | `Number` | Menghitung nilai angka `a` dipangkatkan eksponen `b`. |
| Pembulatan Matematika | `bikinBulatSuji(angka)` | `marume(angka)` | `Number` | Membulatkan angka desimal ke bilangan bulat terdekat. |
| Array Push | `masukinKeRetsu(arr, val)` | `tsuika(arr, val)` | `Array` | Menambahkan elemen baru ke akhir barisan/array list. |
| Array Pop | `keluarinDariRetsu(arr)` | `sakujo(arr)` | `RuntimeValue` | Menghapus dan mengembalikan elemen terakhir dari array. |
| Pemotongan Teks | `potongKoreNagasa(s, m, a)` | `kiru(s, m, a)` | `String` | Memotong bagian string mulai dari indeks `m` hingga `a`. |
| Huruf Kapital (Upper) | `bikinGedeKore(teks)` | `dekaku(teks)` | `String` | Mengonversi teks string menjadi huruf kapital (uppercase). |
| Huruf Kecil (Lower) | `bikinKecilKore(teks)` | `chiisaku(teks)` | `String` | Mengonversi teks string menjadi huruf kecil (lowercase). |
| Generator Acak / RNG | `gachaPull(min, max)` | `gacha(min, max)` | `Number` | Menghasilkan bilangan bulat acak di antara min dan max. |
| Force Panic / Throw | `yameteKudasai(pesan)` | `yamete(pesan)` | `Never` | Melempar eksepsi runtime fatal untuk menghentikan program. |
| Inisialisasi Array | `bikinRetsu(...)` | `retsu(...)` | `Array` | Membuat barisan/array baru dari argumen yang diberikan. |
| Baca Berkas | `tolongBacaBerkas(path)` | `yomu(path)` | `String` | Membaca isi berkas teks dari file system (Node.js/CLI). |
| Tulis Berkas | `tolongTulisBerkas(path, isi)` | `kaku(path, isi)` | `Null` | Menulis teks ke dalam berkas pada file system (Node.js/CLI). |
| Impor Modul | `tolongPanggilModul(path)` | `yobu(path)` | `RuntimeValue` | Membaca dan mengeksekusi berkas `.wibu` lain ke lingkup global (Node.js/CLI). |

## Contoh Program WibuScript

Berikut adalah contoh program lengkap yang mendemonstrasikan integrasi Sistem Alias Pustaka Standar dengan kosakata Romaji murni, manipulasi teks, array, objek kamus, dan kontrol loop:

```javascript
// Demonstrasi Tipe Data Objek, Shorthand Romaji Murni, dan Kontrol Perulangan
kore pahlawan = { 
  nama: "Ksatria", 
  elemen: "Cahaya", 
  level: 1 
};

kore namaBesar = dekaku(pahlawan.nama);
kore namaKecil = chiisaku(pahlawan.nama);
mite("Karakter Kapital: " + namaBesar + " | Huruf Kecil: " + namaKecil);
mite("Waktu eksekusi: " + ima());

kore daftarSkill = retsu("Tebasan Cahaya", "Perisai Suci");
tsuika(daftarSkill, "Penyembuhan");
mite("Jumlah skill aktif: " + nagasa(daftarSkill));

kore hitung = 0;
ulangZutto (hitung < 5) {
  hitung = hitung + 1;

  moshi (hitung == 2) {
    mite("Sesi 2 dilewati (tsugi)");
    tsugi;
  }

  mite("Menyelesaikan sesi ke-" + hitung);

  moshi (hitung == 4) {
    mite("Stamina habis! (tomare)");
    tomare;
  }
}

mite("Simulasi selesai.");
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

### v1.3.0
- Refaktor besar-besaran Pustaka Standar: Versi Shorthand kini menggunakan 100% kosakata Romaji Jepang murni untuk menjaga konsistensi ekosistem.
- Penambahan fungsi manipulasi teks bawaan (dekaku dan chiisaku).

### v1.2.0
- Implementasi Tipe Data Objek (Dictionary) dan Member Access.
- Implementasi Kontrol Perulangan (Break dan Continue) dengan dukungan Sistem Alias ganda.
- Penambahan fitur Shareable URL berbasis kompresi Base64 pada Web Playground.

### v1.1.0
- Dukungan File System I/O dan Sistem Impor Modul untuk pengembangan multi-file.
- Ekspansi Pustaka Standar (*Standard Library*): Menambahkan fungsi bawaan `gacha(min, max)`, `waktuSekarang()`, `panjangTeks(teks)`, `ubahAngka(teks)`, operasi matematika, manipulasi string, dan operasi array.
- Restrukturisasi Core Engine: Pemisahan tegas antara modul universal (`src/index.ts`) dan CLI runner (`src/cli.ts`) untuk menjamin kompatibilitas total dengan Turbopack dan browser runtime.
- Penambahan Root Layout (`app/layout.tsx`) dan konfigurasi styling Tailwind CSS v4 (`app/globals.css`).
- Pembersihan referensi spesifik menjadi tema RPG/Isekai generik pada template antarmuka Web Playground.

### v1.0.0-MVP
- Rilis perdana modul Core Engine (Lexer, Recursive Descent Parser, dan Tree-Walking Interpreter).
- Implementasi Sistem Alias penuh untuk format kata kunci Ekstensi dan Shorthand.
- Implementasi penundaan asinkronus `tungguBentar` berbasis `Promise`.
- Implementasi Web Playground modern berbasis Next.js App Router dengan *client-side rendering* dan *real-time output streaming*.
- Penegakan TypeScript *Strict Mode* penuh di seluruh kode sumber.