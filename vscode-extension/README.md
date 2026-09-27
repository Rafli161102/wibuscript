# WibuScript Language Support for VS Code

Ekstensi resmi Visual Studio Code untuk bahasa pemrograman **WibuScript** (`.wibu`).

Menyediakan penyorotan sintaksis (*syntax highlighting*) berpresisi tinggi untuk seluruh arsitektur **Sistem 4 Dialek Mutlak**:
1. **Jepang Murni** (`kore`, `zettai`, `moshi`, `zutto`, `sekte`, `shougo`, dll.)
2. **Jepang Singkat** (`ko`, `ze`, `mo`, `zu`, `sek`, `sho`, dll.)
3. **Wibu Absurd** (`iniDesu`, `zettaiDa`, `moShiKalo`, `zuttoLoop`, `nakama`, `cocokkan`, dll.)
4. **Meme Rongawi** (`pokmipokmi`, `bundarahma`, `izintampil`, `nyawit`, `sektejomok`, `persimpangan`, dll.)

---

## Fitur Utama

- **Pewarnaan Sintaksis Menyeluruh**: Mendukung pengenalan kata kunci, tetapan, operator logika/aritmatika, string literal, template string, bilangan bulat & desimal, fungsi standar, metode OOP, dan pola destructuring.
- **Dukungan Berkas `.wibu`**: Otomatis mendeteksi dan mengaktifkan bahasa WibuScript saat membuka berkas dengan ekstensi `.wibu`.
- **4 Dialek Kompatibel Penuh**: Menyorot seluruh kosakata dari keempat dialek tanpa konflik.

---

## Cara Memasang

### Opsi 1: Pasang via Berkas VSIX
1. Unduh berkas `wibuscript-lang-1.0.0.vsix` dari direktori `vscode-extension/`.
2. Buka VS Code, tekan `Cmd+Shift+P` (macOS) atau `Ctrl+Shift+P` (Windows/Linux).
3. Ketik dan pilih **"Extensions: Install from VSIX..."**.
4. Pilih berkas `.vsix` tersebut.

### Opsi 2: Manual (Development Mode)
Salin folder `vscode-extension` ke direktori ekstensi VS Code Anda:
- **macOS/Linux**: `~/.vscode/extensions/wibuscript-lang`
- **Windows**: `%USERPROFILE%\.vscode\extensions\wibuscript-lang`

---

## Tautan Terkait

- **NPM Package**: [https://www.npmjs.com/package/wibuscript](https://www.npmjs.com/package/wibuscript)
- **Repositori GitHub**: [https://github.com/Rafli161102/wibuscript](https://github.com/Rafli161102/wibuscript)
- **Lisensi**: MIT
