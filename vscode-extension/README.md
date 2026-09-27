<div align="center">

# 🌸 WibuScript Language Support
### *Official Visual Studio Code Extension for WibuScript (.wibu)*

[![Version](https://img.shields.io/badge/version-1.9.1-blue?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://github.com/Rafli161102/wibuscript)
[![NPM Version](https://img.shields.io/npm/v/wibuscript.svg?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/wibuscript)
[![VS Code Engine](https://img.shields.io/badge/VS%20Code-%3E%3D%201.80.0-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](https://github.com/Rafli161102/wibuscript/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge&logo=github)](https://github.com/Rafli161102/wibuscript/pulls)

<p align="center">
  <b>Ekstensi resmi Visual Studio Code untuk bahasa pemrograman WibuScript (<code>.wibu</code>)</b><br>
  <i>Menyediakan pewarnaan sintaksis berpresisi tinggi berbasis Sistem 4 Dialek Mutlak.</i>
</p>

<p align="center">
  <a href="#-fitur-unggulan">✨ Fitur</a> •
  <a href="#-dukungan-sistem-4-dialek-mutlak">🎭 4 Dialek</a> •
  <a href="#-panduan-instalasi">📦 Panduan Instalasi</a> •
  <a href="#-contoh-kode">💻 Contoh Kode</a> •
  <a href="#-tautan-resmi">🔗 Tautan Resmi</a>
</p>

---

</div>

> [!TIP]
> **Otomatis Aktif**: Begitu berkas dengan ekstensi `.wibu` dibuka di VS Code, ekstensi ini langsung mendeteksi bahasa dan menerapkan pewarnaan sintaksis tanpa konfigurasi tambahan!

---

## ✨ Fitur Unggulan

- 🎨 **Pewarnaan Sintaksis Menyeluruh (*Full Syntax Highlighting*)**:
  - 🔑 Kata kunci alur kendali (`moshi`, `zutto`, `shougo`, dll.)
  - 📦 Deklarasi variabel & tetapan (`kore`, `zettai`, `iniDesu`, `pokmipokmi`, dll.)
  - 🏛️ Pemrograman Berorientasi Objek / OOP (`sekte`, `tanjou`, `keishou`, `jibun`, dll.)
  - 📜 Modul & Ekspor Impor (`koukai`, `toriyoseru`, `kara`, dll.)
  - 🔍 Pattern Matching & Destructuring (`shougo`, `baai`, `hyoujun`, `...`)
  - 📚 Pustaka Standar Bawaan (*Standard Library*) di seluruh 4 dialek
  - 💬 Literal string, template string interpolasi (<code>\`...\${...}\`</code>), angka, dan komentar baris ganda (`//`).
- ⚡ **Ringan & Cepat**: Dibangun dengan TextMate Grammar JSON murni tanpa proses background yang memberatkan editor.
- 🌐 **Dukungan Bersilang**: Menghighlight kode yang mencampurkan keempat dialek dalam satu berkas secara mulus tanpa konflik.

---

## 🎭 Dukungan Sistem 4 Dialek Mutlak

Ekstensi ini mendukung penyorotan sintaksis untuk **Sistem 4 Dialek Mutlak**:

| Dialek | Badge | Karakteristik | Contoh Kata Kunci |
| :--- | :---: | :--- | :--- |
| **Jepang Murni** | ![Murni](https://img.shields.io/badge/Dialek-Jepang%20Murni-blue?style=flat-square) | Romaji standar, elegan, dan ekspresif | `kore`, `zettai`, `moshi`, `zutto`, `sekte`, `shougo` |
| **Jepang Singkat** | ![Singkat](https://img.shields.io/badge/Dialek-Jepang%20Singkat-orange?style=flat-square) | Shorthand suku kata minimalis untuk efisiensi | `ko`, `ze`, `mo`, `zu`, `sek`, `sho` |
| **Wibu Absurd** | ![Wibu](https://img.shields.io/badge/Dialek-Wibu%20Absurd-pink?style=flat-square) | Slang wibu cringe khas internet Indo-Jepang | `iniDesu`, `zettaiDa`, `moShiKalo`, `zuttoLoop`, `nakama` |
| **Meme Rongawi** | ![Rongawi](https://img.shields.io/badge/Dialek-Meme%20Rongawi-purple?style=flat-square) | Slang otentik kultur Ngawiverse & Thugposting | `pokmipokmi`, `bundarahma`, `nyawit`, `sektejomok` |

---

## 📦 Panduan Instalasi

### 🛠️ Opsi 1: Pasang via Berkas VSIX *(Paling Cepat)*

1. Unduh berkas `wibuscript-lang-1.0.0.vsix` dari folder `vscode-extension/`.
2. Buka Visual Studio Code.
3. Tekan pintasan papan ketik:
   - **macOS**: <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
   - **Windows / Linux**: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
4. Ketik dan pilih: **`Extensions: Install from VSIX...`**
5. Pilih berkas `.vsix` yang telah diunduh.
6. Selesai! VS Code akan langsung memuat penyorotan sintaksis WibuScript.

### 💻 Opsi 2: Instalasi Manual *(Development Mode)*

Tautkan atau salin direktori `vscode-extension` ke direktori ekstensi pengguna VS Code:

- **macOS / Linux**:
  ```bash
  ln -s "$(pwd)/vscode-extension" ~/.vscode/extensions/wibuscript-lang
  ```
- **Windows (PowerShell)**:
  ```powershell
  Copy-Item -Recurse .\vscode-extension $HOME\.vscode\extensions\wibuscript-lang
  ```

---

## 💻 Contoh Kode

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

## 🔗 Tautan Resmi

- 🌐 **NPM Package**: [https://www.npmjs.com/package/wibuscript](https://www.npmjs.com/package/wibuscript)
- 🐙 **GitHub Repository**: [https://github.com/Rafli161102/wibuscript](https://github.com/Rafli161102/wibuscript)
- 🎮 **Web Playground**: Jalankan kode langsung via peramban web
- 📄 **Lisensi**: [MIT License](https://github.com/Rafli161102/wibuscript/blob/main/LICENSE)

<div align="center">
  <sub>Dibuat dengan ❤️ untuk komunitas WibuScript oleh para kontributor.</sub>
</div>
