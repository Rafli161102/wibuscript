<div align="center">

# WibuScript Language Support
### *Official Visual Studio Code Extension for WibuScript (.wibu)*

<a href="https://github.com/Rafli161102/wibuscript">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&duration=3000&pause=1000&color=007ACC&center=true&vCenter=true&width=550&lines=Visual+Studio+Code+Language+Support;Syntax+Highlighting+for+WibuScript;Full+Support+for+4+Absolute+Dialects" alt="VS Code Extension Typing Animation" />
</a>

<br/>

[![Version](https://img.shields.io/badge/version-1.9.1-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://github.com/Rafli161102/wibuscript)
[![NPM Version](https://img.shields.io/npm/v/wibuscript.svg?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/wibuscript)
[![VS Code Engine](https://img.shields.io/badge/VS%20Code-%3E%3D%201.80.0-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](https://github.com/Rafli161102/wibuscript/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Rafli161102/wibuscript/pulls)

<p align="center">
  <b>Ekstensi resmi Visual Studio Code untuk bahasa pemrograman WibuScript (<code>.wibu</code>)</b><br>
  <i>Menyediakan pewarnaan sintaksis berpresisi tinggi berbasis Sistem 4 Dialek Mutlak.</i>
</p>

<p align="center">
  <a href="#fitur-unggulan">Fitur</a> •
  <a href="#dukungan-sistem-4-dialek-mutlak">4 Dialek Mutlak</a> •
  <a href="#panduan-instalasi">Instalasi</a> •
  <a href="#contoh-kode">Contoh Kode</a> •
  <a href="#tautan-resmi">Tautan Resmi</a>
</p>

---

</div>

> [!TIP]
> **Otomatis Aktif**: Begitu berkas dengan ekstensi `.wibu` dibuka di VS Code, ekstensi ini langsung mendeteksi bahasa dan menerapkan pewarnaan sintaksis tanpa konfigurasi tambahan.

---

## Fitur Unggulan

- **Pewarnaan Sintaksis Menyeluruh (*Full Syntax Highlighting*)**:
  - Kata kunci alur kendali (`moshi`, `zutto`, `shougo`, dll.)
  - Deklarasi variabel & tetapan (`kore`, `zettai`, `iniDesu`, `pokmipokmi`, dll.)
  - Pemrograman Berorientasi Objek / OOP (`sekte`, `tanjou`, `keishou`, `jibun`, dll.)
  - Modul & Ekspor Impor (`koukai`, `toriyoseru`, `kara`, dll.)
  - Pattern Matching & Destructuring (`shougo`, `baai`, `hyoujun`, `...`)
  - Pustaka Standar Bawaan (*Standard Library*) di seluruh 4 dialek
  - Literal string, template string interpolasi (<code>\`...\${...}\`</code>), angka, dan komentar baris ganda (`//`).
- **Ringan & Cepat**: Dibangun dengan TextMate Grammar JSON murni tanpa proses background yang memberatkan editor.
- **Dukungan Bersilang**: Menghighlight kode yang mencampurkan keempat dialek dalam satu berkas secara mulus tanpa konflik.

---

## Dukungan Sistem 4 Dialek Mutlak

Ekstensi ini mendukung penyorotan sintaksis untuk **Sistem 4 Dialek Mutlak**:

| Dialek | Badge | Karakteristik | Contoh Kata Kunci |
| :--- | :---: | :--- | :--- |
| **Jepang Murni** | ![Murni](https://img.shields.io/badge/Dialek-Jepang%20Murni-007ACC?style=flat-square) | Romaji standar, elegan, dan ekspresif | `kore`, `zettai`, `moshi`, `zutto`, `sekte`, `shougo` |
| **Jepang Singkat** | ![Singkat](https://img.shields.io/badge/Dialek-Jepang%20Singkat-FF6B6B?style=flat-square) | Shorthand suku kata minimalis untuk efisiensi | `ko`, `ze`, `mo`, `zu`, `sek`, `sho` |
| **Wibu Absurd** | ![Wibu](https://img.shields.io/badge/Dialek-Wibu%20Absurd-FF69B4?style=flat-square) | Slang wibu cringe khas internet Indo-Jepang | `iniDesu`, `zettaiDa`, `moShiKalo`, `zuttoLoop`, `nakama` |
| **Meme Rongawi** | ![Rongawi](https://img.shields.io/badge/Dialek-Meme%20Rongawi-8A2BE2?style=flat-square) | Slang otentik kultur Ngawiverse & Thugposting | `pokmipokmi`, `bundarahma`, `nyawit`, `sektejomok` |

---

---

## Fitur Language Server Protocol (LSP)

Ekstensi WibuScript kini dilengkapi dengan klien LSP bawaan mandiri yang terhubung langsung ke `wibu lsp`:

1. **Diagnostik Galat Real-Time (*Real-Time Diagnostics*)**:
   - Menampilkan garis bawah merah dan daftar galat sintaksis langsung di tab **Problems** saat Anda mengetik, baik galat Lexer (karakter asing, string tidak ditutup) maupun galat Parser (token hilang, tanda kurung tidak berpasangan).
2. **Penyelesaian Otomatis 4 Dialek Mutlak (*IntelliSense / Autocomplete*)**:
   - Mendukung seluruh 341+ kata kunci dari 4 Dialek Mutlak (Jepang Murni, Jepang Singkat, Wibu Absurd, Meme Rongawi).
   - Saran otomatis untuk fungsi bawaan, konstruktor tipe modern (`seikou`, `shippai`, `aru`, `nai`, `ok`, `error`, dll.), serta metode berantai (`unwrap`, `unwrapOr`, `map`, `andThen`).
   - Dilengkapi template snippet cerdas untuk blok kontrol alur dan deklarasi kelas/fungsi.
3. **Dokumentasi Sorot (*Hover Documentation*)**:
   - Menampilkan penjelasan detail berbahasa Indonesia dan dokumentasi fungsi/kata kunci saat kursor didekatkan ke simbol kode.
4. **Navigasi Simbol Dokumen (*Document Symbols / Outline*)**:
   - Mendukung panel Outline VS Code serta pintasan <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> (<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> pada macOS) untuk melompat langsung ke deklarasi fungsi, kelas, metode, atau variabel.

---

## Panduan Menyambungkan LSP ke Visual Studio Code

Ekstensi ini menyertakan `extension.js` tanpa dependensi eksternal yang secara otomatis meluncurkan proses latar belakang `wibu lsp` melalui Standard I/O (stdin/stdout).

### 1. Prasyarat Sistem

Pastikan CLI WibuScript terpasang secara global di sistem:
```bash
npm install -g wibuscript
```
Atau jika berada di repositori lokal pengembangan:
```bash
npm run core:build
```

### 2. Opsi Konfigurasi (Opsional)

Jika perintah `wibu` berada di lokasi khusus di luar PATH sistem, Anda dapat mengaturnya di berkas `settings.json` VS Code:
```json
{
  "wibuscript.lsp.executablePath": "/usr/local/bin/wibu"
}
```

---

## Pengujian Manual Sederhana

Untuk memverifikasi integrasi Language Server berjalan dengan benar:

### Uji 1: Uji Komunikasi Terminal (JSON-RPC)

Jalankan perintah pengujian inisialisasi berikut di terminal:
```bash
printf "Content-Length: 64\r\n\r\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\",\"params\":{}}" | wibu lsp
```
Hasil yang diharapkan: LSP mengembalikan JSON respons dengan `capabilities` (`textDocumentSync`, `completionProvider`, `hoverProvider`, `documentSymbolProvider`).

### Uji 2: Uji Interaktif di VS Code (Extension Development Host)

1. Buka folder `wibuscript` atau `vscode-extension` di Visual Studio Code.
2. Buka berkas `vscode-extension/extension.js`.
3. Tekan <kbd>F5</kbd> untuk membuka jendela baru **[Extension Development Host]**.
4. Di jendela baru tersebut, buat berkas baru dengan nama `coba.wibu`.
5. **Uji Diagnostik Real-Time**:
   - Ketik `kore nilai = ;`
   - Perhatikan bahwa garis bawah merah bergelombang langsung muncul di bawah tanda titik koma, dan pesan kesalahan muncul di panel **Problems** (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd>).
   - Ubah baris tersebut menjadi `kore nilai = 42;`. Garis bawah merah akan langsung hilang secara otomatis.
6. **Uji Autocomplete**:
   - Ketik `mo` lalu tekan <kbd>Ctrl</kbd> + <kbd>Space</kbd>. Daftar saran akan menampilkan `moshi`, `mo`, `moShiKalo`, dan snippet terkait.
   - Ketik `sei` lalu tekan <kbd>Enter</kbd>. Editor akan otomatis menyisipkan konstruktor `seikou()` dengan kursor di dalam tanda kurung.
7. **Uji Hover Documentation**:
   - Arahkan kursor tetikus ke atas kata `moshi` atau `seikou`. Jendela sembulan kecil (*popup*) akan menampilkan dokumentasi Markdown resmi WibuScript.

---

## Panduan Instalasi Ekstensi

### Opsi 1: Pasang via Berkas VSIX
1. Buka Visual Studio Code.
2. Tekan pintasan papan ketik:
   - **macOS**: <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
   - **Windows / Linux**: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
3. Ketik dan pilih: **`Extensions: Install from VSIX...`**
4. Pilih berkas `.vsix` dari folder `vscode-extension/`.

### Opsi 2: Instalasi Manual (Development Mode / Symlink)
Tautkan direktori `vscode-extension` ke folder ekstensi pengguna VS Code:
- **macOS / Linux**:
  ```bash
  ln -s "$(pwd)/vscode-extension" ~/.vscode/extensions/wibuscript-lang
  ```
- **Windows (PowerShell)**:
  ```powershell
  Copy-Item -Recurse .\vscode-extension $HOME\.vscode\extensions\wibuscript-lang
  ```

---

## Contoh Kode

Buat berkas dengan nama `halo.wibu` dan masukkan kode berikut:

```javascript
// Dialek Wibu Absurd
iniDesu pesan = "Konnichiwa Dunia!";
omaeWaIu(pesan);

// Dialek Rongawi Otentik
pokmipokmi hitung = 0;
nyawit (hitung < 3) {
  hitung = hitung + 1;
  cawapresin("Hitungan Ngawi: " + hitung);
}

// Dialek Jepang Murni (OOP)
sekte Pahlawan {
  tanjou(nama) {
    jibun.nama = nama;
  }
}
kore hero = atarashii Pahlawan("Sora");
kuchiMite("Pahlawan: " + hero.nama);
```

---

## Tautan Resmi

- **NPM Package**: [https://www.npmjs.com/package/wibuscript](https://www.npmjs.com/package/wibuscript)
- **GitHub Repository**: [https://github.com/Rafli161102/wibuscript](https://github.com/Rafli161102/wibuscript)
- **Web Playground**: Jalankan kode langsung via peramban web
- **Lisensi**: [MIT License](https://github.com/Rafli161102/wibuscript/blob/main/LICENSE)

<div align="center">
  <sub>Dibuat untuk komunitas pengembang WibuScript oleh para kontributor.</sub>
</div>
