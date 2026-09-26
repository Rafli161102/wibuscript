# WibuScript

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Status](https://img.shields.io/badge/Status-In_Development-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

WibuScript adalah bahasa pemrograman esoterik yang diinterpretasikan (*interpreted language*), dibangun menggunakan Node.js dan TypeScript. Bahasa ini merestrukturisasi sintaks pemrograman standar menjadi perpaduan *slang* keseharian dan Romaji Jepang, memberikan pengalaman penulisan kode yang terlokalisasi secara unik.

## Konsep Inti: Sistem Alias

WibuScript mengimplementasikan **Sistem Alias** pada tingkat Analisis Leksikal (*Lexer*). Pengembang dapat menulis kode menggunakan **Versi Ekstensi** (gabungan Indo-Jepang) atau **Versi Shorthand** (Romaji Murni). 

Mesin *Lexer* akan memetakan kedua varian tersebut ke dalam *Abstract Syntax Tree* (AST) yang sama, sehingga keduanya dapat digunakan secara bergantian dalam satu basis kode tanpa mengorbankan performa.

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
jutsu cekLatensi(angka) {
    moshi (angka > 100) {
        kaesu uso
    }
    kaesu maji
}

zutto (kore i = 1; i <= 3; i = i + 1) {
    mite("Mencoba menghubungkan ulang ke-" + i)
}
```

## Arsitektur Mesin

WibuScript dirancang sebagai *Tree-Walking Interpreter*. Arsitektur mesin ini terdiri dari tiga fase utama:
1. **Lexer (Tokenizer):** Membaca input *string* mentah dan mengubahnya menjadi aliran token WibuScript yang valid dengan mengabaikan *whitespace*.
2. **Parser:** Mengambil token dan menyusunnya menjadi *Abstract Syntax Tree* (AST) berdasarkan aturan tata bahasa (Grammar) WibuScript.
3. **Evaluator:** Menjelajahi pohon AST dan mengeksekusi operasi terkait menggunakan lingkungan tuan rumah (*Host Environment*) di Node.js.

## Peta Jalan Pengembangan (Roadmap)

- [x] Desain dan spesifikasi tata bahasa
- [ ] Implementasi Lexical Analyzer (Lexer)
- [ ] Implementasi AST Parser
- [ ] Integrasi CLI / REPL (*Read-Eval-Print Loop*)
- [ ] Ekstensi *Syntax Highlighting* untuk VS Code

## Kontribusi

WibuScript adalah proyek *open-source*. Kami menyambut kontribusi dari komunitas pengembang, baik untuk penyempurnaan *Core Engine*, pembuatan dokumentasi, maupun pengembangan modul standar. Silakan lakukan *Fork* pada repositori ini dan kirimkan *Pull Request* (PR) Anda.

## Lisensi

Proyek ini didistribusikan di bawah [MIT License](LICENSE).