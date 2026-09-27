<!-- File: README.md -->
<div align="center">

  <img src="https://media.tenor.com/7H-O7N7m4q0AAAAi/anime-typing.gif" width="180" alt="Coding Furiously" />

# WibuScript

<a href="https://github.com/Rafli161102/wibuscript">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3500&pause=1000&color=CB3837&center=true&vCenter=true&width=700&lines=Bahasa+Pemrograman+Paling+Absurd+di+Bumi;Kompilator+AST+Skala+Korporat+Ngawiverse;Satu+Kemampuan+Runtime,+Empat+Dialek+Mutlak;Ditulis+Sambil+Merenungi+Nasib;npm+install+-g+wibuscript" alt="WibuScript Typing Animation" />
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
  <b>Jepang Murni | Jepang Singkat | Wibu Absurd | Meme Rongawi</b>
</p>

<p align="center">
  <a href="#arsitektur-sistem">Arsitektur</a> |
  <a href="#spesifikasi-sintaks-sistem-4-dialek-mutlak">4 Dialek Mutlak</a> |
  <a href="#pustaka-standar-standard-library">Pustaka Standar</a> |
  <a href="#contoh-program-wibuscript">Contoh Kode</a> |
  <a href="#panduan-penggunaan-dan-instalasi">Instalasi</a> |
  <a href="#log-pembaruan-changelog">Changelog</a>
</p>

---

</div>

WibuScript adalah bahasa pemrograman esoterik yang diimplementasikan menggunakan TypeScript dan berjalan di atas arsitektur Tree-Walking Interpreter. Bahasa ini mengabstraksi konstruksi sintaks pemrograman melalui arsitektur Sistem 4 Dialek Mutlak (Jepang Murni, Jepang Singkat, Wibu Absurd Cringe Indo-Jepang, dan Meme Rongawi Otentik Ngawiverse). Proyek ini tersedia secara publik di npm (`npm install -g wibuscript`) dan GitHub Packages, dilengkapi modul inti (Core Engine) yang sepenuhnya universal dan aman untuk peramban, serta antarmuka Web Playground interaktif berbasis Next.js App Router untuk eksekusi kode secara client-side.

> [!NOTE]
> WibuScript dirancang sebagai bahasa pemrograman universal dengan pemisahan tegas antara mesin inti yang aman untuk peramban web dan CLI Runner berbasis Node.js.

## Arsitektur Sistem

Struktur direktori proyek dirancang secara modular dengan pemisahan tegas antara logika mesin kompilasi, eksekutor baris perintah, dan antarmuka web interaktif:

```text
wibuscript/
├── src/
│   ├── ast.ts          # Definisi tipe dan struktur Abstract Syntax Tree (AST)
│   ├── lexer.ts        # Analisis leksikal, tokenisasi, dan resolusi 4 Dialek Mutlak
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
- **Lexer (`src/lexer.ts`)**: Mengurai kode sumber mentah menjadi rangkaian token secara deterministik. Mendukung literal string, numerik, operator aritmatika, operator relasional, akses titik, pelacakan posisi baris/kolom, serta resolusi 4 Dialek Mutlak.
- **Parser (`src/parser.ts`)**: Menerapkan metode Recursive Descent Parsing berbasis prioritas operator untuk menghasilkan pohon sintaksis abstrak bertipe kuat.
- **Runtime & Evaluator (`src/runtime.ts`)**: Mengeksekusi simpul AST secara asinkronus menggunakan arsitektur Environment bertingkat.
- **Browser-Safe Core (`src/index.ts`)**: Menyediakan ekspor API mesin kompilasi yang sepenuhnya steril dari modul internal sistem operasi, memungkinkan eksekusi langsung di lingkungan peramban.

### 2. Frontend Web Playground
- Dibangun di atas Next.js App Router dan Tailwind CSS v4.
- Evaluasi kode dilakukan secara murni di sisi peramban pengguna.
- Menyediakan editor kode berbasis teks dengan dukungan indentasi tab, metrik waktu eksekusi, penghitung token, virtual terminal interaktif, dan fitur Shareable URL.

## Spesifikasi Sintaks (Sistem 4 Dialek Mutlak)

WibuScript menerapkan standardisasi kosakata berarsitektur **"Sistem 4 Dialek Mutlak"** secara eksklusif pada seluruh lapisan mesin kompilator. Setiap instruksi inti bahasa diakomodasi oleh 4 dialek yang saling kompatibel dan dapat digunakan secara bersilangan.

### Tabel Pemetaan 4 Dialek Mutlak

| Kategori Token | Jepang Murni | Jepang Singkat | Wibu Absurd | Meme Rongawi | TokenType | Deskripsi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Variabel (LET)** | `kore` | `ko` | `iniDesu` | `pokmipokmi` | `TokenType.Var` | Alokasi variabel baru dalam lingkup aktif. |
| **Tetapan (CONST)** | `zettai` | `ze` | `zettaiDa` | `bundarahma` | `TokenType.Const` | Alokasi konstanta / tetapan nilai memori. |
| **Kosong (NULL)** | `munashi` | `mu` | `naniKore` | `blukutuk` | `TokenType.Null` | Representasi ketiadaan nilai (null). |
| **Benar (TRUE)** | `hontou` | `hon` | `hontouNi` | `unjukkebolehan` | `TokenType.True` | Nilai boolean benar (true). |
| **Salah (FALSE)** | `uso` | `uso` | `chigauYo` | `keracunanmbg` | `TokenType.False` | Nilai boolean salah (false). |
| **Jika (IF)** | `moshi` | `mo` | `moShiKalo` | `izintampil` | `TokenType.If` | Percabangan kondisi kondisional. |
| **Selain Jika (ELSE IF)** | `soretomo` | `sore` | `soredemoNe` | `wowok` | `TokenType.ElseIf` | Cabang alternatif bersyarat berikutnya. |
| **Selainnya (ELSE)** | `hoka` | `ho` | `shoganaiNe` | `woijawa` | `TokenType.Else` | Blok alternatif jika seluruh kondisi tidak terpenuhi. |
| **Perulangan (WHILE)** | `zutto` | `zu` | `zuttoLoop` | `nyawit` | `TokenType.Loop` | Pengulangan blok selama predikat bernilai truthy. |
| **Berhenti (BREAK)** | `yame` | `ya` | `yameteKure` | `bijisatu` | `TokenType.Break` | Menghentikan eksekusi perulangan saat ini. |
| **Lanjut (CONTINUE)** | `tsugi` | `tsu` | `tsugiNe` | `ambatukam` | `TokenType.Continue` | Melompati iterasi perulangan ke putaran berikutnya. |
| **Fungsi (FUNCTION)** | `jutsu` | `ju` | `watashiJutsu` | `fufufafa` | `TokenType.Function` | Deklarasi subrutin / fungsi berparameter. |
| **Kembalikan (RETURN)** | `kaesu` | `kae` | `haiBeri` | `kandabahlil` | `TokenType.Return` | Menghentikan fungsi dan mengembalikan nilai. |
| **Tampilkan (PRINT)** | `mite` | `mi` | `iuYo` | `salamkenal` | `TokenType.Print` | Mencetak pesan ke konsol terminal. |
| **Tunggu (AWAIT)** | `matte` | `mat` | `matteNe` | `admindatang` | `TokenType.Await` | Penanda jeda waktu atau eksekusi asinkronus. |
| **Coba (TRY)** | `kokoromi` | `koko` | `yatteMiyo` | `ragnamok` | `TokenType.Try` | Blok penanganan eksepsi berpotensi galat. |
| **Tangani (CATCH)** | `yurusu` | `yuru` | `gomennasai` | `amanBos` | `TokenType.Catch` | Blok tangkapan dan pemulihan galat runtime. |
| **Iterasi (FOR-IN)** | `subete` | `sube` | `zenbuNe` | `thugshaker` | `TokenType.ForEach` | Perulangan melintasi seluruh elemen koleksi barisan atau teks. |
| **Penghubung (IN)** | `no` | `no` | `karaNe` | `alasdaun` | `TokenType.In` | Partikel penghubung variabel elemen dan koleksi. |
| **Kelas (CLASS)** | `sekte` | `sek` | `nakama` | `sektejomok` | `TokenType.Class` | Deklarasi cetak biru objek / kelas sekte. |
| **Konstruktor (CONSTRUCTOR)** | `tanjou` | `tan` | `umareta` | `ambatunat` | `TokenType.Constructor` | Metode inisialisasi instansi objek sekte. |
| **Objek Baru (NEW)** | `atarashii` | `ata` | `atarashiiNe` | `ambatumbas` | `TokenType.New` | Membuat instansi objek baru dari sekte/kelas. |
| **Pewarisan (EXTENDS)** | `keishou` | `kei` | `kouhaiDesu` | `jalurhukum` | `TokenType.Extends` | Menurunkan properti dan metode dari sekte induk. |
| **Diri Sendiri (THIS)** | `jibun` | `ji` | `oreSama` | `lanangmas` | `TokenType.This` | Mengakses dan memodifikasi anggota instansi objek aktif. |
| **Ekspor (EXPORT)** | `koukai` | `kou` | `sebarJutsu` | `umpansilang` | `TokenType.Export` | Mengekspor simbol dan fungsi ke luar berkas modul. |
| **Impor (IMPORT)** | `toriyoseru` | `tori` | `summonJutsu` | `begalbaju` | `TokenType.Import` | Mengimpor simbol atau pustaka dari berkas/modul lain. |

## Pustaka Standar (Standard Library)

WibuScript menyediakan Pustaka Standar sebagai kumpulan fungsi bawaan yang dapat digunakan tanpa membuat implementasi fungsi tersebut secara manual.

Pustaka Standar dirancang mengikuti prinsip utama WibuScript:
> Satu kemampuan runtime, empat bentuk sintaks.

Keempat dialek tidak memiliki implementasi pustaka yang terpisah. Setiap nama fungsi pada masing-masing dialek hanya merupakan nama permukaan yang dipetakan menuju fungsi internal yang sama.

Dengan demikian:
```text
Jepang Murni ─────┐
Jepang Singkat ───┤
Wibu Absurd ──────┼──→ Fungsi Runtime yang sama
Meme Rongawi ─────┘
```

Perbedaan dialek hanya berada pada cara programmer memanggil fungsi, bukan pada perilaku fungsi tersebut.

### Prinsip Pustaka
Pustaka Standar mengikuti beberapa aturan:
1. Setiap fungsi memiliki satu fungsi internal.
2. Setiap dialek memiliki satu nama khusus untuk fungsi tersebut.
3. Tidak terdapat alias tambahan dalam dialek yang sama.
4. Nama fungsi pustaka tidak boleh menggunakan kata yang telah ditetapkan sebagai kata kunci inti (seperti mite, iuYo, dsb).
5. Fungsi yang sama harus menghasilkan perilaku runtime yang sama pada seluruh dialek.
6. Penamaan pustaka tidak mengubah struktur AST maupun evaluator.

### Daftar Fungsi Pustaka Utama

| Kemampuan | Jepang Murni | Jepang Singkat | Wibu Absurd | Meme Rongawi | Balikan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Output** | `kuchiMite(pesan)` | `km(pesan)` | `omaeWaIu(pesan)` | `cawapresin(pesan)` | `Null` |
| **Jeda** | `shibaraku(ms)` | `siba(ms)` | `matteNeSikit(ms)` | `nungguinLu(ms)` | `Null` |
| **Waktu** | `imaJikan()` | `ima()` | `nanjiDesu()` | `kopihitam()` | `String` |
| **Panjang** | `nagasa(nilai)` | `naga(nilai)` | `doreKurai(nilai)` | `panjangberurat(nilai)` | `Number` |
| **Angka Acak** | `randamu(min, max)` | `ran(min, max)` | `unmeiGacha(min, max)` | `rudalmentah(min, max)` | `Number` |
| **Buat Array** | `retsu(...)` | `ret(...)` | `nakamaTachi(...)` | `budakhitam(...)` | `Array` |

> [!NOTE]
> Untuk daftar lengkap Pustaka Standar (termasuk fungsi Array, Manipulasi String, I/O Berkas, dan Operasi Matematika), silakan merujuk pada berkas dokumentasi internal di repositori WibuScript.

## Contoh Program WibuScript

<img align="right" width="160" src="https://media.tenor.com/jNgKSlUpmkEAAAAM/typing-laptop.gif" alt="Cat Coding" />

Berikut adalah contoh program lengkap yang mendemonstrasikan integrasi Sistem 4 Dialek Mutlak dengan manipulasi teks, array, objek kamus, dan kontrol loop. Kode ini ditulis menggunakan campuran dialek untuk memperlihatkan kebebasan kompilator.

```javascript
// Demonstrasi Tipe Data Objek, Sistem 4 Dialek Mutlak, dan Kontrol Perulangan
kore pahlawan = { 
  nama: "Ksatria", 
  elemen: "Cahaya", 
  level: 1 
};

zettai namaBesar = ookiku(pahlawan.nama);
ko namaKecil = chiisaku(pahlawan.nama);
kuchiMite("Karakter Kapital: " + namaBesar + " | Huruf Kecil: " + namaKecil);
km("Waktu eksekusi: " + ima());

iniDesu daftarSkill = nakamaTachi("Tebasan Cahaya", "Perisai Suci");
haireNe(daftarSkill, "Penyembuhan");
omaeWaIu("Jumlah skill aktif: " + doreKurai(daftarSkill));

pokmipokmi hitung = 0;
zutto (hitung < 5) {
  hitung = hitung + 1;

  moshi (hitung == 2) {
    cawapresin("Sesi 2 dilewati (tsugi)");
    tsugi;
  }

  kuchiMite("Menyelesaikan sesi ke-" + hitung);

  moShiKalo (hitung == 4) {
    kuchiMite("Stamina habis! (yame)");
    bijisatu;
  }
}

kuchiMite("Simulasi selesai.");
```

## Panduan Penggunaan dan Instalasi

> [!TIP]
> Paket CLI resmi WibuScript dapat dijalankan langsung tanpa instalasi lokal menggunakan npx:
> ```bash
> npx wibuscript --help
> ```

### 1. Kebutuhan Sistem
- **Node.js**: Versi 18.0.0 atau lebih baru.
- **npm**: Versi 9.0.0 atau lebih baru.

### 2. Penggunaan Baris Perintah (CLI)
WibuScript CLI menyediakan fungsionalitas menyeluruh untuk pengembangan lokal:

```bash
# 0. Instalasi Global via NPM
npm install -g wibuscript

# 1. Memulai REPL Interaktif
wibu

# 2. Menjalankan berkas kode sumber
wibu run contoh.wibu

# 3. Mengompilasi ke JavaScript modern
wibu build contoh.wibu -o hasil.js

# 4. Mengonversi otomatis antar-4 dialek
wibu convert contoh.wibu --to rongawi -o rongawi.wibu
```

---

## Log Pembaruan (Changelog)

Catatan rilis lengkap dan riwayat perubahan versi WibuScript dapat dilihat pada berkas [CHANGELOG.md](CHANGELOG.md).