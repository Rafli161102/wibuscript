# WibuScript

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Status](https://img.shields.io/badge/Status-Selesai%20%2F%20MVP-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

WibuScript adalah bahasa pemrograman esoterik yang diinterpretasikan (*interpreted language*), dibangun menggunakan Node.js dan TypeScript. Bahasa ini merestrukturisasi sintaks pemrograman standar menjadi perpaduan *slang* keseharian dan Romaji Jepang, memberikan pengalaman penulisan kode yang terlokalisasi secara unik.

## Konsep Inti: Sistem Alias

WibuScript mengimplementasikan **Sistem Alias** pada tingkat Analisis Leksikal (*Lexer*). Pengembang dapat menulis kode menggunakan **Versi Ekstensi** (gabungan Indo-Jepang) atau **Versi Shorthand** (Romaji Murni). 

Mesin *Lexer* akan memetakan kedua varian tersebut ke dalam representasi token yang sama, sehingga keduanya dapat digunakan secara bergantian dalam satu basis kode tanpa mengorbankan performa saat diproses oleh Parser dan Evaluator.

## Spesifikasi Bahasa

### 1. Sintaks Fundamental
| Keyword Standar | Versi Ekstensi | Versi Shorthand | Deskripsi |
| :--- | :--- | :--- | :--- |
| `let` / `var` | `koreWa` | `kore` | Deklarasi variabel atau memori. |
| `print()` | `kasihMite()` | `mite()` | Standar output ke terminal (*console.log*). |
| `true` | `majiBener` | `maji` | Tipe data *Boolean True*. |
| `false` | `usoBanget` | `uso` | Tipe data *Boolean False*. |
| `null` | `kosongZannen` | `kara` | Representasi nilai kosong/tidak terdefinisi. |

### 2. Kontrol Alur & Logika (Control Flow)
| Keyword Standar | Versi Ekstensi | Versi Shorthand | Deskripsi |
| :--- | :--- | :--- | :--- |
| `if` | `kaloMoshi` | `moshi` | Percabangan kondisi. |
| `else` | `chigauDong` | `chigau` | Percabangan alternatif. |
| `for` / `while` | `ulangZutto` | `zutto` | Perulangan atau iterasi. |

### 3. Fungsi & Modul
| Keyword Standar | Versi Ekstensi | Versi Shorthand | Deskripsi |
| :--- | :--- | :--- | :--- |
| `function` | `bikinJutsu` | `jutsu` | Deklarasi blok fungsi. |
| `return` | `balikinDesu` | `kaesu` | Mengembalikan nilai dari fungsi. |
| `import` | `panggilSenpai` | `yobu` | Memanggil modul atau *file* eksternal. |

## Contoh Penggunaan (Versi Shorthand)

**1. Operasi Variabel & Logika Dasar**
```javascript
kore statusServer = maji
kore ping = 15

moshi (statusServer == maji) {
    mite("Koneksi stabil. Memulai program...")
} chigau {
    mite("Terjadi kesalahan jaringan.")
}
```

**2. Deklarasi Fungsi dan Perulangan**
```javascript
bikinJutsu cekLatensi(angka) {
    moshi (angka > 100) {
        balikinDesu uso
    }
    balikinDesu maji
}

kore hasil = cekLatensi(45)
mite("Status latensi stabil: " + hasil)
```

## Arsitektur Mesin

WibuScript dirancang sebagai *Tree-Walking Interpreter*. Arsitektur mesin ini terdiri dari tiga fase utama:
1. **Lexer (Tokenizer):** Membaca input string mentah dan mengubahnya menjadi aliran token WibuScript yang valid dengan mengabaikan whitespace dan komentar.
2. **Parser:** Mengambil token dan menyusunnya menjadi *Abstract Syntax Tree* (AST) berdasarkan aturan tata bahasa WibuScript.
3. **Evaluator (Runtime):** Menjelajahi pohon AST dan mengeksekusi operasi terkait menggunakan lingkungan tuan rumah (*Host Environment*) di Node.js.

## Struktur Berkas Proyek

```text
wibuscript/
├── src/
│   ├── ast.ts          # Definisi node Abstract Syntax Tree (AST)
│   ├── lexer.ts        # Lexical Analyzer (Tokenizer) dengan Sistem Alias
│   ├── parser.ts       # Syntactic Analyzer (Parser AST)
│   ├── runtime.ts      # Evaluator & Environment Execution Engine
│   └── index.ts        # Titik masuk eksekusi CLI (*.wibu)
├── contoh.wibu         # Contoh program kode sumber WibuScript
├── package.json        # Konfigurasi dependensi dan scripts runner
├── tsconfig.json       # Konfigurasi TypeScript compiler strict mode
└── README.md           # Dokumentasi teknis proyek
```

## Menjalankan Program WibuScript

Pastikan dependensi telah terpasang dengan menjalankan `npm install`.

**1. Menjalankan Berkas Kode Sumber (.wibu):**
```bash
# Menggunakan npm runner
npm test

# Atau menggunakan tsx secara langsung
npx tsx src/index.ts contoh.wibu

# Atau mengompilasi dan mengeksekusi via Node.js
npm run build
node dist/index.js contoh.wibu
```

**2. Menjalankan Demonstrasi Bawaan:**
```bash
npm start
# atau
npx tsx src/index.ts
```

## Kontribusi

WibuScript adalah proyek *open-source*. Kami menyambut kontribusi dari komunitas pengembang, baik untuk penyempurnaan *Core Engine*, pembuatan dokumentasi, maupun pengembangan modul standar. Silakan lakukan *Fork* pada repositori ini dan kirimkan *Pull Request* (PR) Anda.

## Lisensi

Proyek ini didistribusikan di bawah [MIT License](LICENSE).

## Log Pembaruan (Changelog)

### Versi 1.0.0 (Rilis Core Engine & MVP)
- Core Engine Selesai: Lexer, Parser, dan Evaluator (Runtime) telah diimplementasikan penuh dan terintegrasi secara modular.
- Perbaikan Lexer: Dukungan penuh operator pembanding ganda (`==`, `!=`, `<=`, `>=`), operator aritmatika (`+`, `-`, `*`, `/`), string dengan escape sequence, dan perbaikan kompatibilitas TypeScript Strict Mode (`noUncheckedIndexedAccess`).
- Implementasi Sistem Alias: Pemetaan kata kunci versi panjang (gabungan Indo-Jepang) dan versi pendek (Romaji Murni) ke dalam `TokenType` yang identik.
- Implementasi Parser & AST: Rekonstruksi token menjadi AST untuk deklarasi variabel (`kore` / `koreWa`), pemanggilan fungsi (`mite` / `kasihMite`), percabangan kondisi (`moshi` / `chigau`), fungsi (`jutsu` / `bikinJutsu`), pengembalian nilai (`kaesu` / `balikinDesu`), dan blok kode.
- Implementasi Runtime: Tree-Walking Interpreter dengan Environment berantai (*scope chain*) dan fungsi output terminal bawaan.
- CLI Runner: Titik masuk `src/index.ts` untuk membaca dan mengeksekusi berkas kode `.wibu` langsung dari terminal.