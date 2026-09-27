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
| **Coba (TRY)** | `kokoromi` | `koko` | `yatteMiyo` | `ragnamok` | `TokenType.Try` | Blok penanganan eksepsi berpotensi galat. |
| **Tangani (CATCH)** | `yurusu` | `yuru` | `santaiAja` | `amanBos` | `TokenType.Catch` | Blok tangkapan dan pemulihan galat runtime. |
| **Iterasi (FOR-IN)** | `subete` | `sube` | `sikatSemua` | `thugshaker` | `TokenType.ForEach` | Perulangan melintasi seluruh elemen koleksi barisan atau teks. |
| **Penghubung (IN)** | `no` | `no` | `dari` | `alasdaun` | `TokenType.In` | Partikel penghubung variabel elemen dan koleksi. |
| **Kelas (CLASS)** | `sekte` | `sek` | `paguyuban` | `sektejomok` | `TokenType.Class` | Deklarasi cetak biru objek / kelas sekte. |
| **Konstruktor (CONSTRUCTOR)** | `tanjou` | `tan` | `lahiran` | `ambatunat` | `TokenType.Constructor` | Metode inisialisasi instansi objek sekte. |
| **Objek Baru (NEW)** | `atarashii` | `ata` | `bikinBaru` | `ambatumbas` | `TokenType.New` | Membuat instansi objek baru dari sekte/kelas. |
| **Pewarisan (EXTENDS)** | `keishou` | `kei` | `turunanDari` | `jalurhukum` | `TokenType.Extends` | Menurunkan properti dan metode dari sekte induk. |
| **Diri Sendiri (THIS)** | `jibun` | `ji` | `siAing` | `lanangmas` | `TokenType.This` | Mengakses dan memodifikasi anggota instansi objek aktif. |
| **Ekspor (EXPORT)** | `koukai` | `kou` | `sebarJutsu` | `umpansilang` | `TokenType.Export` | Mengekspor simbol dan fungsi ke luar berkas modul. |
| **Impor (IMPORT)** | `toriyoseru` | `tori` | `summonJutsu` | `begalbaju` | `TokenType.Import` | Mengimpor simbol atau pustaka dari berkas/modul lain. |
| **Asal Modul (FROM)** | `kara` | `kra` | `dari` | `ngawiland` | `TokenType.From` | Menentukan lokasi berkas/sumber modul yang diimpor. |
| **Pola Cocok (MATCH)** | `shougo` | `sho` | `cocokkan` | `persimpangan` | `TokenType.Match` | Percabangan pencocokan pola nilai jamak (Switch/Match). |
| **Kasus (CASE)** | `baai` | `baa` | `kaloPas` | `kenaben` | `TokenType.Case` | Cabang pencocokan kasus nilai spesifik. |
| **Bawaan (DEFAULT)** | `hyoujun` | `hyo` | `sisaan` | `yappingtolol` | `TokenType.Default` | Cabang fallback jika tidak ada kasus yang cocok. |

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
| Waktu | `imaJikan()` | `ima()` | `nanjiDesu()` | `kopihitam()` | `String` | Mengambil waktu sistem saat program dijalankan. |
| Panjang | `nagasa(nilai)` | `naga(nilai)` | `seginiDoang(nilai)` | `panjangberurat(nilai)` | `Number` | Menghitung panjang teks atau jumlah elemen koleksi. |
| Konversi Angka | `suji(teks)` | `suj(teks)` | `jadiAngkaBanh(teks)` | `ubahJadiDuit(teks)` | `Number` | Mengubah teks numerik menjadi angka. |
| Jenis Nilai | `shurui(nilai)` | `shu(nilai)` | `naniTypeNe(nilai)` | `omagot(nilai)` | `String` | Mengambil jenis nilai runtime. |
| Pangkat | `beki(a, b)` | `bek(a, b)` | `angkatin(a, b)` | `naikinPangkat(a, b)` | `Number` | Menghitung perpangkatan dua angka. |
| Pembulatan | `marume(angka)` | `maru(angka)` | `bulatinBanh(angka)` | `rapihinAngka(angka)` | `Number` | Membulatkan angka desimal ke bilangan bulat terdekat. |
| Tambah Array | `ireta(array, nilai)` | `ire(array, nilai)` | `haireNe(array, nilai)` | `priaotot(array, nilai)` | `Array` | Menambahkan elemen ke akhir array. |
| Ambil Array | `toru(array)` | `tor(array)` | `ambilBelakang(array)` | `keluarinBarang(array)` | `RuntimeValue` | Menghapus dan mengembalikan elemen terakhir array. |
| Potong Teks | `kiru(teks, mulai, akhir)` | `kir(teks, mulai, akhir)` | `potongSini(teks, mulai, akhir)` | `cuilTeks(teks, mulai, akhir)` | `String` | Mengambil bagian tertentu dari sebuah teks. |
| Huruf Kapital | `ookiku(teks)` | `ook(teks)` | `gedeinHuruf(teks)` | `besarinSemua(teks)` | `String` | Mengubah teks menjadi huruf kapital. |
| Huruf Kecil | `chiisaku(teks)` | `chi(teks)` | `kecilinHuruf(teks)` | `kecilinSemua(teks)` | `String` | Mengubah teks menjadi huruf kecil. |
| Angka Acak | `randamu(min, max)` | `ran(min, max)` | `gachaBanh(min, max)` | `kocokAngka(min, max)` | `Number` | Menghasilkan bilangan bulat acak dalam rentang tertentu. |
| Hentikan Program | `shikei(pesan)` | `shi(pesan)` | `matiinProgram(pesan)` | `udahKelarinAja(pesan)` | `Never` | Menghentikan program dengan kesalahan runtime. |
| Buat Array | `retsu(...)` | `ret(...)` | `bikinBarisan(...)` | `budakhitam(...)` | `Array` | Membuat array dari sejumlah nilai. |
| Baca Berkas | `yomu(lokasi)` | `yo(lokasi)` | `yomimasuNe(lokasi)` | `ototkawat(lokasi)` | `String` | Membaca isi berkas teks pada lingkungan CLI. |
| Tulis Berkas | `kaku(lokasi, isi)` | `ka(lokasi, isi)` | `kakimasuNe(lokasi, isi)` | `teksusang(lokasi, isi)` | `Null` | Menulis teks ke berkas pada lingkungan CLI. |
| Muat Modul | `yobu(lokasi)` | `yoB(lokasi)` | `panggilBerkas(lokasi)` | `sikatBanh(lokasi)` | `RuntimeValue` | Memuat dan menjalankan berkas .wibu lain. |
| Ambil Data | `ukeru(url)` | `uke(url)` | `ambilDataBanh(url)` | `SepongMas(url)` | `String` | Mengambil data menggunakan HTTP GET. |
| Urai JSON | `kanjiNi(teks)` | `kn(teks)` | `wakattaYo(teks)` | `salintempel(teks)` | `Object/Array` | Mengurai string format JSON menjadi objek atau barisan. |
| Bungkus JSON | `kanjiMojiretsu(nilai)` | `kmj(nilai)` | `oshieteNe(nilai)` | `copascaption(nilai)` | `String` | Mengonversi nilai runtime menjadi teks string JSON. |
| Petakan Barisan | `utsusu(arr, fn)` | `utu(arr, fn)` | `henshinSuru(arr, fn)` | `predikbola(arr, fn)` | `Array` | Memetakan setiap elemen barisan melalui fungsi callback (Map). |
| Saring Barisan | `erabu(arr, fn)` | `era(arr, fn)` | `senbatsuNe(arr, fn)` | `morebullets(arr, fn)` | `Array` | Menyaring elemen barisan yang memenuhi kondisi predikat (Filter). |
| Cari Elemen | `mitsukeru(arr, fn)` | `mitu(arr, fn)` | `cariinBanh(arr, fn)` | `fesnuker(arr, fn)` | `RuntimeValue` | Mencari elemen pertama yang memenuhi kriteria pencarian (Find). |
| Akar Kuadrat | `ruuto(angka)` | `ru(angka)` | `heihoukon(angka)` | `robogor(angka)` | `Number` | Menghitung akar kuadrat dari sebuah angka (Sqrt). |
| Nilai Mutlak | `zettaichi(angka)` | `zet(angka)` | `zettaiChi(angka)` | `ironiman(angka)` | `Number` | Menghitung nilai mutlak / absolut sebuah bilangan (Abs). |
| Bulat Bawah | `kiriSute(angka)` | `ks(angka)` | `shitaKiri(angka)` | `hutanselatan(angka)` | `Number` | Membulatkan pecahan ke bilangan bulat di bawahnya (Floor). |
| Bulat Atas | `kiriAge(angka)` | `kia(angka)` | `ueKiri(angka)` | `menaracukur(angka)` | `Number` | Membulatkan pecahan ke bilangan bulat di atasnya (Ceil). |
| Pecah Teks | `bunri(teks, pemisah)` | `bu(teks, pemisah)` | `pecahKata(teks, pemisah)` | `pecahkepala(teks, pemisah)` | `Array` | Memecah teks menjadi barisan string berdasarkan pemisah (Split). |
| Gabung Teks | `tsunagu(arr, pemisah)` | `tsuna(arr, pemisah)` | `lemKata(arr, pemisah)` | `lendirmurni(arr, pemisah)` | `String` | Menggabungkan elemen barisan menjadi satu teks (Join). |
| Ganti Teks | `okikae(teks, cari, ganti)` | `oki(teks, cari, ganti)` | `sulapKata(teks, cari, ganti)` | `akuntumbal(teks, cari, ganti)` | `String` | Mengganti seluruh kemunculan substring dalam teks (Replace). |
| Pangkas Spasi | `kiri(teks)` | `kri(teks)` | `pangkas(teks)` | `cukurfade(teks)` | `String` | Menghapus spasi di awal dan akhir teks (Trim). |
| Cek Elemen | `fukumu(koleksi, item)` | `fuku(koleksi, item)` | `punyaGak(koleksi, item)` | `monyetijo(koleksi, item)` | `Boolean` | Memeriksa apakah elemen ada dalam barisan atau teks (Includes). |
| Urutkan Barisan | `narabikae(arr, fn?)` | `nara(arr, fn?)` | `rapihin(arr, fn?)` | `goyangpantat(arr, fn?)` | `Array` | Mengurutkan elemen barisan (Sort default ascending atau via fungsi). |
| Irisan Koleksi | `kirinuki(arr, awal, akhir?)` | `kinu(arr, awal, akhir?)` | `potongSebagian(arr, awal, akhir?)` | `pedangdaging(arr, awal, akhir?)` | `Array/String` | Mengambil irisan barisan atau teks berdasarkan indeks (Slice). |
| Undian Gacha | `gacha(daftar, bobot?)` | `gac(daftar, bobot?)` | `tarikGacha(daftar, bobot?)` | `weeklypass(daftar, bobot?)` | `RuntimeValue` | Mengundi item secara seragam atau probabilistik berbobot (Gacha RNG). |

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
omaeWaIu("Halo " + nama);
iniDesu panjang = doreKurai(nama);
omaeWaIu("Panjang nama: " + panjang);
```

#### Meme Rongawi
```javascript
pokmipokmi nama = "Sora";
cawapresin("Halo " + nama);
pokmipokmi panjang = panjangberurat(nama);
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
omaeWaIu ──────┼──→ PRINT_RUNTIME
cawapresin ─────┘

nagasa ─────────┐
naga ───────────┤
doreKurai ─────┼──→ LENGTH_RUNTIME
panjangberurat ─┘
```

Dengan pendekatan tersebut, perubahan pada implementasi internal cukup dilakukan satu kali. Misalnya algoritma `nagasa()` diperbaiki, maka seluruh bentuk dialek otomatis mendapatkan perubahan yang sama:

```text
Jepang Murni    → nagasa()
Jepang Singkat  → naga()
Wibu Absurd     → doreKurai()
Meme Rongawi    → panjangberurat()
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

### 5. Penggunaan Perintah Baris Perintah (CLI)
WibuScript CLI menyediakan fungsionalitas menyeluruh untuk pengembangan lokal:

```bash
# 1. Memulai REPL Interaktif (Read-Eval-Print Loop)
npm run repl
# atau jika diinstal secara global:
wibu

# 2. Menjalankan berkas kode sumber .wibu
npx wibu run contoh.wibu

# 3. Mengompilasi kode WibuScript ke JavaScript modern (ES2022+)
npx wibu build contoh.wibu -o hasil.js

# 4. Mengonversi kode sumber secara otomatis antar-4 dialek
npx wibu convert contoh.wibu --to rongawi -o rongawi.wibu
```

## Log Pembaruan (Changelog)

### v1.8.0 (Upgrade Phase 3: Pattern Matching, Destructuring & Bug Fixes)
- **Analisis & Perbaikan Bug Sistem**:
  - **Operator Modulo (`%`)**: Diintegrasikan secara penuh pada Lexer, Parser, dan Evaluator runtime termasuk penanganan pembagian modulo nol.
  - **Akses Properti Panjang String**: Perbaikan akses properti `.nagasa`, `.naga`, `.length`, `.panjang`, dan `.dawa` pada tipe data string tanpa menimbulkan galat runtime.
  - **Instansiasi Objek Tanpa Kurung**: Mengizinkan instansiasi kelas `atarashii NamaKelas` tanpa keharusan menyertakan tanda kurung `()`.
  - **Ketahanan Semicolon Stray (`;`)**: Mengatasi galat parser pada titik koma kosong di antara pernyataan program maupun di dalam badan definisi sekte/kelas.
  - **Transpilasi Aman Member Access**: Memastikan penambahan tanda kurung aman `(new Kelas()).metode()` pada hasil kompilasi JavaScript.
- **Pencocokan Pola / Pattern Matching (`shougo`) 4 Dialek Mutlak**:
  - Jepang Murni: `shougo (diskriminan) { baai nilai: { ... } hyoujun: { ... } }`.
  - Jepang Singkat (Singkatan Otentik): `sho (diskriminan) { baa nilai: { ... } hyo: { ... } }` (`shougo` -> `sho`, `baai` -> `baa`, `hyoujun` -> `hyo`).
  - Wibu Absurd: `cocokkan (diskriminan) { kaloPas nilai: { ... } sisaan: { ... } }`.
  - Meme Rongawi: `persimpangan (diskriminan) { kenaben nilai: { ... } yappingtolol: { ... } }`.
  - Fleksibilitas Eksekusi: Berfungsi sebagai pernyataan blok maupun sebagai ekspresi pencocokan pola (*match expression*).
- **Destructuring & Spread Operator (`...`)**:
  - Array Destructuring: Deklarasi variabel `kore [a, b, ...sisa] = [...]` dan penugasan pertukaran nilai (*variable swapping*) `[a, b] = [b, a]`.
  - Object Destructuring: Deklarasi variabel `kore { nama, klan: marga } = {...}` dengan dukungan alias target variabel.
  - Operator Spread (`...`): Menggabungkan barisan literal `[1, ...arr, 2]` dan dekonstruksi karakter teks string `[... "Hai"]`.
- **Sinkronisasi Ekosistem & Web Playground**:
  - **Keamanan & Performa Playground**: Proteksi batas kedalaman rekursi (`maxCallStackDepth: 1000`), batas putaran loop (`maxLoopIterations: 50000`), timeout eksekusi (`timeoutMs: 10000`), tombol penghenti darurat interaktif (*Stop Button*), serta *output buffer streaming* anti-lag.
  - **Pencegahan UI Freeze**: *Cooperative event loop yielding* pada runtime evaluator sehingga browser tidak akan pernah *freeze* pada loop berat.
  - **Koreksi Tokenizer Monaco**: Penyelarasan penuh pewarnaan sintaksis dan penambahan preset demonstrasi Meme Rongawi.
  - **Pemutakhiran Dialek Meme Rongawi**: Standardisasi 100% menggunakan kosakata otentik komunitas thugposting dan Ngawiverse (`pokmipokmi`, `bundarahma`, `thugshaker`, `alasdaun`, `sektejomok`, `ambatunat`, `ambatumbas`, `jalurhukum`, `lanangmas`, `umpansilang`, `begalbaju`, `ngawiland`, `persimpangan`, `kenaben`, `yappingtolol`, `panjangberurat`, `weeklypass`).
  - Pembaruan Dialect Auto-Converter untuk kata kunci `shougo`, `baai`, dan `hyoujun`.
  - JavaScript Transpiler diperbarui mendukung ES6 Destructuring dan percabangan `switch`.
  - TextMate Grammar VS Code dan Monaco Editor Tokenizer disinkronkan.
  - Penambahan berkas demonstrasi [examples/rongawi_meme.wibu](file:///Users/macbookpro/Web/wibuscript/examples/rongawi_meme.wibu).

### v1.7.0 (Upgrade Phase 2: OOP & Module System)
- **Pemrograman Berorientasi Objek (OOP)**:
  - Deklarasi Kelas/Sekte: `sekte` (Murni) / `sek` (Singkat) / `nakama` (Wibu) / `sektejomok` (Rongawi).
  - Metode Konstruktor: `tanjou` (Murni) / `tan` (Singkat) / `umareta` (Wibu) / `ambatunat` (Rongawi).
  - Instansiasi Objek: `atarashii` (Murni) / `ata` (Singkat) / `atarashiiNe` (Wibu) / `ambatumbas` (Rongawi).
  - Pewarisan Kelas: `keishou` (Murni) / `kei` (Singkat) / `kouhaiDesu` (Wibu) / `jalurhukum` (Rongawi).
  - Referensi Diri (This): `jibun` (Murni) / `ji` (Singkat) / `oreSama` (Wibu) / `lanangmas` (Rongawi) untuk pembacaan dan penugasan properti instansi.
- **Sistem Modul Asli (Export & Import)**:
  - Ekspor Simbol: `koukai` (Murni) / `kou` (Singkat) / `sebarJutsu` (Wibu) / `umpansilang` (Rongawi).
  - Impor Modul: `toriyoseru` (Murni) / `tori` (Singkat) / `summonJutsu` (Wibu) / `begalbaju` (Rongawi).
  - Partikel Asal Modul: `kara` (Murni) / `kra` (Singkat) / `dari` (Wibu) / `ngawiland` (Rongawi).
  - Registry Virtual Modul untuk keamanan eksekusi di lingkungan Web Browser dan Playground.
- **Shorthand Jepang Otentik**: Menegakkan singkatan suku kata bahasa Jepang otentik untuk seluruh kata kunci singkatan baru (`sek`, `tan`, `ata`, `kei`, `ji`, `kou`, `tori`, `kra`).
- **Tooling & Transpiler ES2022**:
  - Dukungan transpilasi ES6 `class`, `constructor`, `extends`, `this`, `export`, dan `import`.
  - Ekstensi VS Code TextMate grammar disinkronkan.
  - Kartu panduan cepat dan preset baru pada Web Playground.

### v1.6.0
- **Perulangan Iterasi Koleksi (For-In / For-Each)**: Dukungan perulangan langsung melintasi elemen array, karakter string, dan kunci objek menggunakan 4 dialek: `subete (item no koleksi)` (Murni), `sube (item no koleksi)` (Singkat), `zenbuNe (item dari koleksi)` (Wibu), dan `thugshaker (item alasdaun koleksi)` (Rongawi). Dilengkapi dukungan penuh `yame` (break) dan `tsugi` (continue).
- **Fungsi Sebaris Lambda / Arrow (=>)**: Dukungan penulisan ekspresi fungsi ringkas kelas satu `(x, y) => x + y`, `x => x * x`, `() => nilai`, dan bentuk blok `(x) => { ... }`. Dapat dipanggil secara instan (IIFE) atau disalurkan langsung sebagai callback pada metode tingkat tinggi (`utsusu`, `erabu`, `mitsukeru`).
- **Ekspansi Pustaka Standar (Manipulasi Teks, Barisan & Gacha)**:
  - Manipulasi String: `bunri` (split teks), `tsunagu` (join array), `okikae` (replace substring), `kiri` (trim spasi).
  - Utilitas Koleksi: `fukumu` (includes / contains), `narabikae` (sort dengan komparator kustom), `kirinuki` (slice).
  - Mesin Gacha Probabilistik: `gacha` / `tarikGacha` untuk pengundian seragam maupun seleksi item berbobot (*weighted RNG*).
- **Sinkronisasi Tooling & Web Playground**: Pembaruan Dialect Auto-Converter, JavaScript Transpiler, VS Code Extension TextMate grammar, kartu panduan cepat, dan preset petualangan isekai v1.6.0 pada Web Playground.

### v1.5.0
- **Penanganan Galat (Try-Catch)**: Penambahan blok penanganan eksepsi `kokoromi ... yurusu` (Murni), `koko ... yuru` (Singkat), `cobaDuluBanh ... santaiAja` (Wibu), dan `ragnamok ... amanBos` (Rongawi).
- **Literal Array & Pengindeksan Kurung Siku**: Dukungan literal barisan `[1, 2, 3]`, pengindeksan `arr[0]`, penugasan `arr[0] = nilai`, akses dinamis properti objek `obj[kunci]`, dan indeks string `"wibu"[0]`.
- **Operator Logika & Uner**: Dukungan operator logika berprioritas standar (`&&`, `||`, `!`) dengan evaluasi *short-circuit*, serta operator numerik uner (`-`).
- **Template String / Interpolasi**: Dukungan literal string backtick dengan interpolasi ekspresi dinamis `` `Halo ${nama}!` ``.
- **Ekspansi Pustaka Standar**:
  - Manipulasi JSON: `kanjiNi` (parse) dan `kanjiMojiretsu` (stringify).
  - Metode Barisan Tingkat Tinggi: `utsusu` (map), `erabu` (filter), dan `mitsukeru` (find).
  - Matematika Tingkat Lanjut: `ruuto` (sqrt), `zettaichi` (abs), `kiriSute` (floor), dan `kiriAge` (ceil).
- **Developer Experience & Tooling**:
  - Interactive REPL (`wibu repl` / `wibu`).
  - Dialect Auto-Converter (`wibu convert <file> --to <dialek>`).
  - JavaScript Transpiler (`wibu build <file> -o output.js`).
- **Pembaruan Web Playground**: Dialect switcher real-time, panel multi-tab (Terminal, Token Inspector, AST Tree Viewer, JavaScript Transpiled), dan Monaco Tokenizer diperbarui.

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