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

## Spesifikasi Sintaks (Sistem 4 Dialek Mutlak)

WibuScript menerapkan standardisasi kosakata berarsitektur **"Sistem 4 Dialek Mutlak"** secara eksklusif pada seluruh lapisan mesin kompilator. Setiap instruksi inti bahasa diakomodasi oleh 4 dialek yang saling kompatibel dan dapat digunakan secara bersilangan:
1. **Jepang Murni**: Terminologi Romaji standar yang elegan dan ekspresif.
2. **Jepang Singkat**: Singkatan suku kata minimalis untuk efisiensi pengetikan cepat.
3. **Wibu Absurd**: Dialek hiperbolik khas komunitas anime dan jejepangan Indonesia.
4. **Meme Rongawi**: Istilah kultural kontemporer dan bahasa gaul internet lokal.

Seluruh kata kunci bahasa Inggris konvensional (`let`, `const`, `if`, `while`, dsb.) dan alias lama telah dihapus sepenuhnya demi menjaga integritas esoterik WibuScript.

### Tabel Pemetaan 4 Dialek Mutlak

| Kategori Token | Jepang Murni | Jepang Singkat | Wibu Absurd | Meme Rongawi | TokenType | Deskripsi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Variabel (LET)** | `kore` | `ko` | `siImut` | `pokmipokmi` | `TokenType.Var` | Alokasi variabel baru dalam lingkup aktif. |
| **Tetapan (CONST)** | `zettai` | `ze` | `hargaMati` | `bundarahma` | `TokenType.Const` | Alokasi konstanta / tetapan nilai memori. |
| **Kosong (NULL)** | `munashi` | `mu` | `maafLancang` | `blukutuk` | `TokenType.Null` | Representasi ketiadaan nilai (*null*). |
| **Benar (TRUE)** | `hontou` | `hon` | `menyalaAbkuh` | `unjukkebolehan` | `TokenType.True` | Nilai boolean benar (*true*). |
| **Salah (FALSE)** | `uso` | `uso` | `ladehBanh` | `keracunanmbg` | `TokenType.False` | Nilai boolean salah (*false*). |
| **Jika (IF)** | `moshi` | `mo` | `whenYh` | `izintampil` | `TokenType.If` | Percabangan kondisi kondisional. |
| **Selain Jika (ELSE IF)** | `soretomo` | `sore` | `kaloGakGitu` | `wowok` | `TokenType.ElseIf` | Cabang alternatif bersyarat berikutnya. |
| **Selainnya (ELSE)** | `hoka` | `ho` | `yaudahlahYa` | `woijawa` | `TokenType.Else` | Blok alternatif jika seluruh kondisi tidak terpenuhi. |
| **Perulangan (WHILE)** | `zutto` | `zu` | `gasSampePagi` | `nyawit` | `TokenType.Loop` | Pengulangan blok selama predikat bernilai *truthy*. |
| **Berhenti (BREAK)** | `yame` | `ya` | `ampunSepuh` | `bijisatu` | `TokenType.Break` | Menghentikan eksekusi perulangan saat ini. |
| **Lanjut (CONTINUE)** | `tsugi` | `tsu` | `lanjutPart2` | `ambatukam` | `TokenType.Continue` | Melompati iterasi perulangan ke putaran berikutnya. |
| **Fungsi (FUNCTION)** | `jutsu` | `ju` | `mybini` | `fufufafa` | `TokenType.Function` | Deklarasi subrutin / fungsi berparameter. |
| **Kembalikan (RETURN)** | `kaesu` | `kae` | `kasihPaham` | `kandabahlil` | `TokenType.Return` | Menghentikan fungsi dan mengembalikan nilai. |
| **Tampilkan (PRINT)** | `mite` | `mi` | `teriakAmba` | `salamkenal` | `TokenType.Print` | Mencetak pesan ke konsol terminal (*stdout*). |
| **Tunggu (AWAIT)** | `matte` | `mat` | `sabarBanh` | `admindatang` | `TokenType.Await` | Penanda jeda waktu atau eksekusi asinkronus. |

### Pustaka Standar (Standard Library)

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
| HTTP Fetch (GET) | `tolongAmbilData(url)` | `totte(url)` | `String` | Mengambil data dari internet via HTTP GET secara sinkronus internal (mengembalikan teks/JSON). |
| Waktu Sistem | `waktuSekarang()` | `imaJikan()` | `String` | Mengambil representasi string waktu sistem saat ini. |

## Contoh Program WibuScript

Berikut adalah contoh program lengkap yang mendemonstrasikan integrasi Sistem 4 Dialek Mutlak dengan manipulasi teks, array, objek kamus, dan kontrol loop:

```javascript
// Demonstrasi Tipe Data Objek, Sistem 4 Dialek Mutlak, dan Kontrol Perulangan
kore pahlawan = { 
  nama: "Ksatria", 
  elemen: "Cahaya", 
  level: 1 
};

zettai namaBesar = dekaku(pahlawan.nama);
ko namaKecil = chiisaku(pahlawan.nama);
mite("Karakter Kapital: " + namaBesar + " | Huruf Kecil: " + namaKecil);
mi("Waktu eksekusi: " + ima());

siImut daftarSkill = retsu("Tebasan Cahaya", "Perisai Suci");
tsuika(daftarSkill, "Penyembuhan");
teriakAmba("Jumlah skill aktif: " + nagasa(daftarSkill));

pokmipokmi hitung = 0;
zutto (hitung < 5) {
  hitung = hitung + 1;

  moshi (hitung == 2) {
    salamkenal("Sesi 2 dilewati (tsugi)");
    tsugi;
  }

  mite("Menyelesaikan sesi ke-" + hitung);

  moshi (hitung == 4) {
    mite("Stamina habis! (yame)");
    yame;
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

### v1.4.0
- **Standarisasi Sistem 4 Dialek Mutlak**: Refaktor penuh Lexer dan Tokenizer ke dalam sistem 4 dialek (Jepang Murni, Jepang Singkat, Wibu Absurd, Meme Rongawi) untuk 15 kategori token utama.
- **Pembersihan Keyword Ekosistem**: Menghapus seluruh kata kunci bahasa Inggris konvensional (`let`, `const`, `if`, `while`, dsb.) dan alias ganda lama dari mesin kompilator.
- **Pembaruan Web Playground & Dokumentasi**: Memperbarui kartu Panduan Cepat, preset demonstrasi, dan pewarnaan sintaksis Monaco Editor berbasis 4 dialek.

### v1.3.0
- Refaktor besar-besaran Pustaka Standar: Versi Shorthand kini menggunakan 100% kosakata Romaji Jepang murni untuk menjaga konsistensi ekosistem.
- Penambahan fungsi manipulasi teks bawaan (dekaku dan chiisaku).

### v1.2.0
- Eksperimental: Dukungan HTTP Fetch API dan utilitas waktu.
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