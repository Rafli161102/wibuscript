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
- **Lexer (`src/lexer.ts`)**: Mengurai kode sumber mentah menjadi rangkaian token secara deterministik. Mendukung literal string, numerik (bilangan bulat dan desimal), operator aritmatika, operator relasional ganda (`==`, `!=`, `<=`, `>=`), pelacakan posisi baris/kolom, serta resolusi Sistem Alias kata kunci.
- **Parser (`src/parser.ts`)**: Menerapkan metode *Recursive Descent Parsing* berbasis prioritas operator (*precedence*) untuk menghasilkan pohon sintaksis abstrak (*AST*) bertipe kuat (*strongly typed*).
- **Runtime & Evaluator (`src/runtime.ts`)**: Mengeksekusi simpul AST secara asinkronus menggunakan arsitektur *Environment* bertingkat (*lexical scoping*). Dilengkapi *hook* penangkap output (*output streaming*), evaluasi *Promise*, dan manajemen *Return Signal*.
- **Browser-Safe Core (`src/index.ts`)**: Menyediakan ekspor API mesin kompilasi yang sepenuhnya steril dari modul internal sistem operasi (`node:fs`, `node:path`), memungkinkan eksekusi langsung di lingkungan *browser* tanpa konflik *bundling*.

### 2. Frontend Web Playground
- Dibangun di atas Next.js App Router dan Tailwind CSS v4.
- Evaluasi kode dilakukan secara murni di sisi peramban pengguna (*Client-Side Execution*).
- Menyediakan editor kode berbasis teks dengan dukungan indentasi tab, pintasan keyboard (`Ctrl+Enter`), metrik waktu eksekusi (milidetik), penghitung token, dan terminal virtual interaktif.

## Spesifikasi Sintaks (Sistem Alias)

WibuScript menyediakan arsitektur Sistem Alias ganda pada seluruh lapisan sintaks bahasa dan Pustaka Standar. Setiap instruksi memiliki padanan antara varian ekspresif (Versi Ekstensi Indo-Jepang) dan varian ringkas (Versi Shorthand Romaji murni) yang terikat pada eksekutor identik.

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

### 3. Subrutin (Fungsi)
| Kata Kunci Standar | Versi Ekstensi | Versi Shorthand | Token Kategori | Penjelasan |
| :--- | :--- | :--- | :--- | :--- |
| `function` | `bikinJutsu` | `jutsu` | `TokenType.Function` | Deklarasi fungsi pengguna berparameter. |
| `return` | `balikinDesu` | `kaesu` | `TokenType.Return` | Menghentikan fungsi dan mengembalikan nilai. |

### 4. Pustaka Standar (Standard Library Alias)
| Fitur Standar | Versi Ekstensi | Versi Shorthand | Tipe Balikan | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| Output Konsol | `kasihMite(pesan)` | `mite(pesan)` | `Null` | Mencetak pesan ke *stdout* atau virtual terminal. |
| Asynchronous Delay | `tungguBentar(ms)` | `tungguBentar(ms)` | `Null` | Menunda eksekusi selama `ms` milidetik (Promise). |
| Waktu Lokal | `sekarangImaDesu()` | `imaDesu()` | `String` | Mengambil representasi string waktu lokal terkini. |
| Hitung Panjang | `tolongCekNagasa(arg)` | `cekNagasa(arg)` | `Number` | Menghitung jumlah karakter teks string atau elemen list/array. |
| Konversi ke Angka | `bikinJadiSuji(teks)` | `jadiSuji(teks)` | `Number` | Mengonversi teks string numerik menjadi tipe angka. |
| Generator Acak / RNG | `gachaPull(min, max)` | `gacha(min, max)` | `Number` | Menghasilkan bilangan bulat acak di antara min dan max. |
| Pengecek Tipe (Typeof) | `apaTipeKoreWa(arg)` | `tipeNani(arg)` | `String` | Mengembalikan nama tipe data ("angka", "teks", "array", dll). |
| Force Panic / Throw | `yameteKudasai(pesan)` | `yamete(pesan)` | `Never` | Melempar eksepsi runtime fatal untuk menghentikan program. |
| Pangkat Matematika | `kalkulasiPangkatSuji(a, b)` | `pangkatSuji(a, b)` | `Number` | Menghitung nilai angka `a` dipangkatkan eksponen `b`. |
| Pembulatan Matematika | `bikinBulatSuji(angka)` | `bulatSuji(angka)` | `Number` | Membulatkan angka desimal ke bilangan bulat terdekat. |
| Array Push | `masukinKeRetsu(arr, val)` | `isiRetsu(arr, val)` | `Array` | Menambahkan elemen baru ke akhir barisan/array list. |
| Array Pop | `keluarinDariRetsu(arr)` | `buangRetsu(arr)` | `RuntimeValue` | Menghapus dan mengembalikan elemen terakhir dari array. |
| Pemotongan Teks | `potongKoreNagasa(s, m, a)` | `potongTeks(s, m, a)` | `String` | Memotong bagian string mulai dari indeks `m` hingga `a`. |
| Inisialisasi Array | `bikinRetsu(...)` | `retsu(...)` | `Array` | Membuat barisan/array baru dari argumen yang diberikan. |

## Contoh Program WibuScript

Berikut adalah contoh program lengkap yang mendemonstrasikan integrasi Sistem Alias Pustaka Standar, manipulasi array, matematika lanjutan, pemotongan string, dan penanganan kondisi fatal:

```javascript
// Demonstrasi Sistem Alias & Pustaka Standar Lengkap WibuScript
koreWa namaKsatria = "Ren-The-Dragon-Knight"
kore levelAwal = jadiSuji("80.75")
kore levelBulat = bulatSuji(levelAwal)
kore dayaPangkat = pangkatSuji(levelBulat, 2)

kasihMite("[" + imaDesu() + "] Menginisialisasi sistem petualangan...")
mite("Level dasar asli: " + levelAwal)
mite("Level hasil pembulatan: " + levelBulat)
mite("Kalkulasi kuadrat level: " + dayaPangkat)

// Pemotongan string (substring)
kore namaPendek = potongTeks(namaKsatria, 0, 3)
mite("Nama panggilan ksatria: " + namaPendek)

// Manipulasi barisan / array (retsu)
kore daftarItem = retsu("Pedang Kayu", "Potion Kecil")
isiRetsu(daftarItem, "Perisai Besi")
mite("Isi inventory ksatria: " + daftarItem)
mite("Jumlah item tersimpan: " + cekNagasa(daftarItem))

// Menghapus elemen terakhir array
kore itemDibuang = buangRetsu(daftarItem)
mite("Item yang dikeluarkan dari inventory: " + itemDibuang)
mite("Inventory setelah update: " + daftarItem)

// Gacha RNG dan validasi tipe
kore bonusGacha = gachaPull(50, 100)
mite("Bonus gacha harian: " + bonusGacha)

kore tipeBonus = apaTipeKoreWa(bonusGacha)
kaloMoshi (tipeBonus != "angka") {
  yameteKudasai("Terjadi anomali tipe data pada bonus gacha!")
}

kasihMite("Sistem petualangan siap digunakan.")
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
- Ekspansi Pustaka Standar untuk manipulasi Array, Math, dan String dengan dukungan Sistem Alias ganda.
- Penambahan fungsi matematika: `kalkulasiPangkatSuji` / `pangkatSuji` (pangkat) dan `bikinBulatSuji` / `bulatSuji` (pembulatan).
- Penambahan fungsi manipulasi barisan/array: `masukinKeRetsu` / `isiRetsu` (push), `keluarinDariRetsu` / `buangRetsu` (pop), dan konstruktor `bikinRetsu` / `retsu`.
- Penambahan fungsi manipulasi string: `potongKoreNagasa` / `potongTeks` (substring).
- Integrasi dukungan tipe data `"array"` pada evaluator dan fungsi `apaTipeKoreWa` / `tipeNani` serta `tolongCekNagasa` / `cekNagasa`.

### v1.2.0
- Implementasi Sistem Alias ganda pada Standard Library dan penambahan fitur tipe data serta penanganan panic.
- Penambahan fungsi pengecekan tipe data: `apaTipeKoreWa(arg)` (Ekstensi) vs `tipeNani(arg)` (Shorthand).
- Penambahan fungsi pemaksaan panic/eksepsi fatal: `yameteKudasai(pesan)` (Ekstensi) vs `yamete(pesan)` (Shorthand).
- Standardisasi Sistem Alias ganda untuk seluruh pustaka bawaan: `sekarangImaDesu` / `imaDesu`, `tolongCekNagasa` / `cekNagasa`, `bikinJadiSuji` / `jadiSuji`, dan `gachaPull` / `gacha`.

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