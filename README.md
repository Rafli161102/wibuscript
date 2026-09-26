# WibuScript

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Status](https://img.shields.io/badge/Status-MVP-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

WibuScript adalah bahasa pemrograman esoterik (*esoteric programming language*) yang diimplementasikan menggunakan TypeScript dan berjalan di atas arsitektur *Tree-Walking Interpreter*. Bahasa ini mengabstraksi konstruksi sintaks standar menjadi perpaduan terminologi informal dwibahasa (Indonesia-Jepang) dan Romaji murni, terintegrasi langsung dengan antarmuka Web Playground berbasis Next.js untuk evaluasi kode secara *client-side*.

## Arsitektur Sistem

Sistem dirancang secara modular dengan pemisahan tegas antara mesin inti (*Core Engine*) dan antarmuka interaktif (*Frontend*):

```
wibuscript/
├── src/
│   ├── ast.ts          # Definisi tipe simpul Abstract Syntax Tree (AST)
│   ├── lexer.ts        # Analisis leksikal dan tokenisasi dengan Sistem Alias
│   ├── parser.ts       # Analisis sintaksis (penyusunan AST)
│   ├── runtime.ts      # Tree-Walking Evaluator, Environment, dan Standard Library
│   └── index.ts        # Gerbang ekspor modul dan CLI runner
├── app/
│   └── page.tsx        # Antarmuka Web Playground berbasis Next.js App Router
├── contoh.wibu         # Berkas contoh kode sumber WibuScript
├── package.json        # Manifest proyek dan konfigurasi skrip
├── tsconfig.json       # Konfigurasi kompilator TypeScript
└── README.md           # Dokumentasi teknis proyek
```

### 1. Core Engine
- **Lexer (`src/lexer.ts`)**: Mengurai kode sumber mentah menjadi aliran token secara deterministik. Menangani literal string, numerik (integer dan desimal), operator aritmatika, operator relasional ganda (`==`, `!=`, `<=`, `>=`), serta resolusi Sistem Alias.
- **Parser (`src/parser.ts`)**: Menerapkan teknik *Recursive Descent Parsing* dengan *operator precedence* untuk mengubah aliran token menjadi simpul AST bertipe kuat (*strongly-typed*).
- **Runtime (`src/runtime.ts`)**: Mengeksekusi simpul AST secara asinkronus dengan isolasi lingkungan hierarkis (*lexical scoping*). Mendukung penangkapan aliran output secara *real-time* serta fungsi pustaka standar `tungguBentar` berbasis `Promise`.

### 2. Frontend Playground
- Dibangun di atas Next.js App Router (`app/page.tsx`) dan Tailwind CSS.
- Mengeksekusi tahapan kompilasi dan interpretasi secara murni pada *runtime* peramban pengguna (*Client-Side Evaluation*).
- Menampilkan output eksekusi secara berurutan dan *real-time* melalui terminal virtual.

## Spesifikasi Sintaks (Sistem Alias)

WibuScript menerapkan Sistem Alias pada lapisan analisis leksikal. Varian kata kunci panjang (Versi Ekstensi) dan varian pendek (Versi Shorthand) dipetakan ke dalam representasi `TokenType` identik, menjamin performa parsing dan evaluasi yang seragam.

### 1. Deklarasi dan Nilai Literal
| Keyword Standar | Versi Ekstensi | Versi Shorthand | Token Kategori | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `let` / `var` | `koreWa` | `kore` | `TokenType.Var` | Deklarasi alokasi memori variabel. |
| `print()` | `kasihMite()` | `mite()` | `TokenType.Print` | Pencetakan nilai ke standar output. |
| `true` | `majiBener` | `maji` | `TokenType.True` | Literal logika bernilai benar. |
| `false` | `usoBanget` | `uso` | `TokenType.False` | Literal logika bernilai salah. |
| `null` | `kosongZannen` | `kara` | `TokenType.Null` | Nilai kosong tak terdefinisi. |

### 2. Kontrol Alur (Control Flow)
| Keyword Standar | Versi Ekstensi | Versi Shorthand | Token Kategori | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `if` | `kaloMoshi` | `moshi` | `TokenType.If` | Percabangan kondisi kondisional. |
| `else` | `chigauDong` | `chigau` | `TokenType.Else` | Cabang alternatif dari kondisi. |
| `while` / `for` | `ulangZutto` | `zutto` | `TokenType.Loop` | Blok iterasi berbasis predikat boolean. |

### 3. Subrutin dan Pustaka Standar
| Keyword Standar | Versi Ekstensi | Versi Shorthand | Token Kategori | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `function` | `bikinJutsu` | `jutsu` | `TokenType.Function` | Deklarasi subrutin atau fungsi. |
| `return` | `balikinDesu` | `kaesu` | `TokenType.Return` | Mengembalikan nilai dari fungsi. |
| `delay(ms)` | `tungguBentar` | `tungguBentar` | `Builtin / Native` | Penundaan asinkronus berbasis milidetik. |

## Contoh Kode Program

```javascript
// Deklarasi variabel
kore batasIterasi = 3
koreWa statusAktif = majiBener

kasihMite("Memulai simulasi sistem...")

// Percabangan kondisional
kaloMoshi (statusAktif == maji) {
  mite("Status sistem terverifikasi aktif.")
} chigauDong {
  mite("Status sistem tidak valid.")
}

// Subrutin fungsi
bikinJutsu kalibrasi(nilai) {
  balikinDesu nilai * 10
}

// Iterasi dengan penundaan asinkronus
ulangZutto (batasIterasi > 0) {
  mite("Iterasi tersisa: " + batasIterasi)
  tungguBentar(300)
  batasIterasi = batasIterasi - 1
}

kore hasilAkhir = kalibrasi(5)
kasihMite("Hasil kalibrasi akhir: " + hasilAkhir)
```

## Panduan Penggunaan

### 1. Instalasi Dependensi
Pastikan Node.js (v18.0.0 atau lebih tinggi) terpasang, kemudian pasang seluruh dependensi proyek:

```bash
npm install
```

### 2. Menjalankan Server Lokal (Web Playground)
Jalankan server pengembangan Next.js:

```bash
npm run dev
```

Akses aplikasi pada alamat `http://localhost:3000`.

### 3. Membangun Proyek untuk Produksi
Gunakan skrip kompilasi Next.js sebelum melakukan deployment (contoh: Vercel):

```bash
npm run build
npm run start
```

### 4. Menjalankan CLI Core Engine (Opsional)
Untuk mengeksekusi berkas kode `.wibu` langsung melalui terminal:

```bash
npm run core:test
# atau
npx tsx src/index.ts contoh.wibu
```

## Log Pembaruan (Changelog)

### v1.0.0-MVP
- Rilis perdana modul Core Engine yang mencakup Lexer deterministik, Recursive Descent Parser, dan Tree-Walking Interpreter.
- Implementasi Sistem Alias penuh untuk kompatibilitas varian sintaks Ekstensi dan Shorthand.
- Implementasi pustaka standar asinkronus `tungguBentar` yang terintegrasi dengan siklus evaluasi `Promise`.
- Implementasi Web Playground modern berbasis Next.js App Router (`app/page.tsx`) dan Tailwind CSS dengan kapabilitas *Client-Side Evaluation* dan *real-time terminal streaming*.
- Konfigurasi TypeScript *Strict Mode* tanpa peringatan tipe data.