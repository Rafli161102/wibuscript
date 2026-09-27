<!-- File: README.md -->
# WibuScript

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

WibuScript adalah bahasa pemrograman esoterik (*esoteric programming language*) yang diimplementasikan menggunakan TypeScript dan berjalan di atas arsitektur *Tree-Walking Interpreter*. Bahasa ini mengabstraksi konstruksi sintaks pemrograman melalui arsitektur Sistem 4 Dialek Mutlak (Jepang Murni, Jepang Singkat, Wibu Absurd, dan Meme Rongawi). Proyek ini dilengkapi modul inti (*Core Engine*) yang sepenuhnya universal dan aman untuk peramban, serta antarmuka Web Playground interaktif berbasis Next.js App Router untuk eksekusi kode secara *client-side*.

## Arsitektur Sistem

Struktur direktori proyek dirancang secara modular dengan pemisahan tegas antara logika mesin kompilasi, eksekutor baris perintah (*CLI*), dan antarmuka web interaktif:

```
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
- **Lexer (`src/lexer.ts`)**: Mengurai kode sumber mentah menjadi rangkaian token secara deterministik. Mendukung literal string, numerik (bilangan bulat dan desimal), operator aritmatika, operator relasional ganda (`==`, `!=`, `<=`, `>=`), pasangan kunci objek (`:`), akses titik (`.`), pelacakan posisi baris/kolom, serta resolusi 4 Dialek Mutlak kata kunci.
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
4. Nama fungsi pustaka tidak boleh menggunakan kata yang telah ditetapkan sebagai kata kunci inti (seperti mite, teriakAmba, dsb).
5. Fungsi yang sama harus menghasilkan perilaku runtime yang sama pada seluruh dialek.
6. Fungsi yang membutuhkan kemampuan Node.js hanya tersedia pada lingkungan CLI.
7. Fungsi yang aman untuk browser dapat digunakan pada Web Playground.
8. Penamaan pustaka tidak mengubah struktur AST maupun evaluator.

### Daftar Fungsi Pustaka

| Kemampuan | Jepang Murni | Jepang Singkat | Wibu Absurd | Meme Rongawi | Balikan | Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Output | `kuchiMite(pesan)` | `km(pesan)` | `bacotAmba(pesan)` | `cawapresin(pesan)` | `Null` | Menampilkan nilai atau pesan ke terminal. |
| Jeda | `shibaraku(ms)` | `siba(ms)` | `santuyDulu(ms)` | `nungguinLu(ms)` | `Null` | Menghentikan sementara eksekusi selama milidetik tertentu. |
| Waktu | `imaJikan()` | `ima(ms)` | `jamBerapaBanh()` | `cekJamLur()` | `String` | Mengambil waktu sistem saat program dijalankan. |
| Panjang | `nagasa(nilai)` | `naga(nilai)` | `seginiDoang(nilai)` | `itungPanjangLur(nilai)` | `Number` | Menghitung panjang teks atau jumlah elemen koleksi. |
| Konversi Angka | `suji(teks)` | `suj(teks)` | `jadiAngkaBanh(teks)` | `ubahJadiDuit(teks)` | `Number` | Mengubah teks numerik menjadi angka. |
| Jenis Nilai | `shurui(nilai)` | `shu(nilai)` | `iniApaan(nilai)` | `bendaApaanLur(nilai)` | `String` | Mengambil jenis nilai runtime. |
| Pangkat | `beki(a, b)` | `bek(a, b)` | `angkatin(a, b)` | `naikinPangkat(a, b)` | `Number` | Menghitung perpangkatan dua angka. |
| Pembulatan | `marume(angka)` | `maru(angka)` | `bulatinBanh(angka)` | `rapihinAngka(angka)` | `Number` | Membulatkan angka desimal ke bilangan bulat terdekat. |
| Tambah Array | `ireta(array, nilai)` | `ire(array, nilai)` | `masukinLur(array, nilai)` | `tambahBarang(array, nilai)` | `Array` | Menambahkan elemen ke akhir array. |
| Ambil Array | `toru(array)` | `tor(array)` | `ambilBelakang(array)` | `keluarinBarang(array)` | `RuntimeValue` | Menghapus dan mengembalikan elemen terakhir array. |
| Potong Teks | `kiru(teks, mulai, akhir)` | `kir(teks, mulai, akhir)` | `potongSini(teks, mulai, akhir)` | `cuilTeks(teks, mulai, akhir)` | `String` | Mengambil bagian tertentu dari sebuah teks. |
| Huruf Kapital | `ookiku(teks)` | `ook(teks)` | `gedeinHuruf(teks)` | `besarinSemua(teks)` | `String` | Mengubah teks menjadi huruf kapital. |
| Huruf Kecil | `chiisaku(teks)` | `chi(teks)` | `kecilinHuruf(teks)` | `kecilinSemua(teks)` | `String` | Mengubah teks menjadi huruf kecil. |
| Angka Acak | `randamu(min, max)` | `ran(min, max)` | `gachaBanh(min, max)` | `kocokAngka(min, max)` | `Number` | Menghasilkan bilangan bulat acak dalam rentang tertentu. |
| Hentikan Program | `shikei(pesan)` | `shi(pesan)` | `matiinProgram(pesan)` | `udahKelarinAja(pesan)` | `Never` | Menghentikan program dengan kesalahan runtime. |
| Buat Array | `retsu(...)` | `ret(...)` | `bikinBarisan(...)` | `kumpulinJawa(...)` | `Array` | Membuat array dari sejumlah nilai. |
| Baca Berkas | `yomu(lokasi)` | `yo(lokasi)` | `bacainBerkas(lokasi)` | `bukaBerkasLur(lokasi)` | `String` | Membaca isi berkas teks pada lingkungan CLI. |
| Tulis Berkas | `kaku(lokasi, isi)` | `ka(lokasi, isi)` | `tulisinBerkas(lokasi, isi)` | `coretBerkasLur(lokasi, isi)` | `Null` | Menulis teks ke berkas pada lingkungan CLI. |
| Muat Modul | `yobu(lokasi)` | `yoB(lokasi)` | `panggilBerkas(lokasi)` | `sikatBanh(lokasi)` | `RuntimeValue` | Memuat dan menjalankan berkas .wibu lain. |
| Ambil Data | `ukeru(url)` | `uke(url)` | `ambilDataBanh(url)` | `SepongMas(url)` | `String` | Mengambil data menggunakan HTTP GET. |

> **Catatan:** Nama-nama di atas merupakan nama permukaan masing-masing dialek. Implementasi runtime tetap menggunakan satu fungsi internal untuk setiap kemampuan.

### Contoh Penggunaan Pustaka

#### Jepang Murni
```javascript
kore nama = "Sora";
kuchiMite("Halo " + nama);
kore panjang = nagasa(nama);
kuchiMite("Panjang nama: " + panjang);
```

#### Jepang Singkat
```javascript
ko nama = "Sora";
km("Halo " + nama);
ko panjang = naga(nama);
km("Panjang nama: " + panjang);
```

#### Wibu Absurd
```javascript
siImut nama = "Sora";
bacotAmba("Halo " + nama);
siImut panjang = seginiDoang(nama);
bacotAmba("Panjang nama: " + panjang);
```

#### Meme Rongawi
```javascript
pokmipokmi nama = "Sora";
cawapresin("Halo " + nama);
pokmipokmi panjang = itungPanjangLur(nama);
cawapresin("Panjang nama: " + panjang);
```

Keempat contoh tersebut memiliki semantik yang sama. Perbedaannya hanya terletak pada kosakata dialek yang digunakan.

### Pembagian Lingkungan Pustaka

Tidak seluruh fungsi dapat dijalankan pada setiap lingkungan.

#### Browser / Web Playground
Fungsi yang tidak membutuhkan akses langsung terhadap sistem operasi dapat dijalankan secara aman di browser, seperti:
`kuchiMite()`, `shibaraku()`, `imaJikan()`, `nagasa()`, `suji()`, `shurui()`, `beki()`, `marume()`, `ireta()`, `toru()`, `kiru()`, `ookiku()`, `chiisaku()`, `randamu()`, `retsu()`

#### CLI / Node.js
Fungsi yang membutuhkan akses sistem operasi dibatasi hanya pada CLI:
`yomu()`, `kaku()`, `yobu()`

Fungsi jaringan seperti pengambilan data juga mengikuti kemampuan lingkungan eksekusi yang digunakan.

### Arsitektur Internal

Pemetaan pustaka tidak dilakukan dengan membuat empat implementasi berbeda. Secara konseptual:

```text
kuchiMite ──────┐
km ─────────────┤
bacotAmba ──────┼──→ PRINT_RUNTIME
cawapresin ─────┘

nagasa ─────────┐
naga ───────────┤
seginiDoang ────┼──→ LENGTH_RUNTIME
itungPanjangLur ┘
```

Dengan pendekatan tersebut, perubahan pada implementasi internal cukup dilakukan satu kali. Misalnya algoritma `nagasa()` diperbaiki, maka seluruh bentuk dialek otomatis mendapatkan perubahan yang sama:

```text
Jepang Murni    → nagasa()
Jepang Singkat  → naga()
Wibu Absurd     → seginiDoang()
Meme Rongawi    → itungPanjangLur()
                         │
                         ▼
                  LENGTH_RUNTIME
```

Hal ini menjaga konsistensi antara empat dialek sekaligus mencegah terjadinya perbedaan perilaku antarversi sintaks.

## Contoh Program WibuScript

Berikut adalah contoh program lengkap yang mendemonstrasikan integrasi Sistem 4 Dialek Mutlak dengan manipulasi teks, array, objek kamus, dan kontrol loop:

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

siImut daftarSkill = retsu("Tebasan Cahaya", "Perisai Suci");
ireta(daftarSkill, "Penyembuhan");
bacotAmba("Jumlah skill aktif: " + nagasa(daftarSkill));

pokmipokmi hitung = 0;
zutto (hitung < 5) {
  hitung = hitung + 1;

  moshi (hitung == 2) {
    cawapresin("Sesi 2 dilewati (tsugi)");
    tsugi;
  }

  kuchiMite("Menyelesaikan sesi ke-" + hitung);

  moshi (hitung == 4) {
    kuchiMite("Stamina habis! (yame)");
    yame;
  }
}

kuchiMite("Simulasi selesai.");
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
- **Standarisasi Sistem 4 Dialek Mutlak**: Refaktor penuh Lexer, Tokenizer, dan Pustaka Standar ke dalam arsitektur 4 dialek (Jepang Murni, Jepang Singkat, Wibu Absurd, Meme Rongawi) untuk seluruh token inti dan fungsi bawaan.
- **Pembersihan Keyword Ekosistem**: Menghapus seluruh kata kunci bahasa Inggris konvensional (`let`, `const`, `if`, `while`, dsb.) dan konsep alias lama dari mesin kompilator dan dokumentasi.
- **Pembaruan Web Playground & Dokumentasi**: Memperbarui kartu Panduan Cepat, preset demonstrasi, dan pewarnaan sintaksis Monaco Editor berbasis 4 dialek.

### v1.3.0
- Refaktor Pustaka Standar: Penyelarasan kosakata Romaji Jepang murni untuk menjaga konsistensi ekosistem.
- Penambahan fungsi manipulasi teks bawaan (`dekaku` dan `chiisaku`).

### v1.2.0
- Eksperimental: Dukungan HTTP Fetch API dan utilitas waktu.
- Implementasi Tipe Data Objek (Dictionary) dan Member Access.
- Implementasi Kontrol Perulangan (Break dan Continue).
- Penambahan fitur Shareable URL berbasis kompresi Base64 pada Web Playground.

### v1.1.0
- Dukungan File System I/O dan Sistem Impor Modul untuk pengembangan multi-file.
- Ekspansi Pustaka Standar (*Standard Library*): Menambahkan fungsi bawaan operasi matematika, manipulasi string, dan operasi array.
- Restrukturisasi Core Engine: Pemisahan tegas antara modul universal (`src/index.ts`) dan CLI runner (`src/cli.ts`) untuk menjamin kompatibilitas total dengan Turbopack dan browser runtime.
- Penambahan Root Layout (`app/layout.tsx`) dan konfigurasi styling Tailwind CSS v4 (`app/globals.css`).
- Pembersihan referensi spesifik menjadi tema RPG/Isekai generik pada template antarmuka Web Playground.

### v1.0.0-MVP
- Rilis perdana modul Core Engine (Lexer, Recursive Descent Parser, dan Tree-Walking Interpreter).
- Implementasi arsitektur dialek untuk format kata kunci.
- Implementasi penundaan asinkronus berbasis `Promise`.
- Implementasi Web Playground modern berbasis Next.js App Router dengan *client-side rendering* dan *real-time output streaming*.
- Penegakan TypeScript *Strict Mode* penuh di seluruh kode sumber.