<!-- File: CONTRIBUTING.md -->
# Panduan Kontribusi WibuScript

Terima kasih atas ketertarikan Anda untuk berkontribusi pada proyek open-source WibuScript! Dokumen ini berisi pedoman dan instruksi langkah demi langkah bagi pengembang yang ingin mengajukan perbaikan bug, penambahan fitur, pembaruan dokumentasi, atau peningkatan kinerja pada ekosistem WibuScript.

---

## 1. Alur Kerja Pengembangan (Workflow)

### A. Melakukan Fork dan Kloning Repositori
1. Lakukan **Fork** pada repositori resmi WibuScript ke akun GitHub pribadi Anda.
2. Gandakan (*clone*) repositori hasil *fork* tersebut ke lingkungan lokal:
   ```bash
   git clone https://github.com/<USERNAME_ANDA>/wibuscript.git
   cd wibuscript
   ```
3. Tambahkan repositori hulu (*upstream*) untuk memudahkan sinkronisasi:
   ```bash
   git remote add upstream https://github.com/Rafli161102/wibuscript.git
   ```

### B. Membuat Branch Fitur
Buat *branch* kerja baru dengan nama yang deskriptif dari branch `main`:
```bash
git checkout -b feat/penambahan-fitur-baru
# atau untuk perbaikan bug:
git checkout -b fix/perbaikan-lexer-newline
```

---

## 2. Persiapan Lingkungan dan Instalasi Dependensi

Pastikan perangkat Anda telah terpasang **Node.js (>= v18.0.0)** dan **npm (>= v9.0.0)**. Pasang seluruh dependensi proyek dengan menjalankan:

```bash
npm install
```

---

## 3. Menjalankan Pengujian Otomatis (Unit Testing)

Setiap perubahan pada modul inti (*Lexer*, *Parser*, *Runtime*, atau *Pustaka Standar*) wajib disertai atau diverifikasi dengan pengujian otomatis menggunakan **Vitest**:

```bash
# Menjalankan unit test secara menyeluruh
npm test

# Menjalankan unit test dalam mode interaktif (watch mode)
npx vitest

# Menguji skrip demonstrasi langsung via CLI lokal
npm run core:test
```

Pastikan seluruh rangkaian pengujian (*test suite*) berstatus **PASS** sebelum mengajukan *commit*.

---

## 4. Konvensi Pesan Commit (Conventional Commits)

Proyek ini menerapkan standar **Conventional Commits** yang bersih dan terstruktur untuk menjaga keterbacaan riwayat git. Format penamaan commit yang diwajibkan:

```text
<tipe>: <deskripsi singkat dalam bahasa yang jelas>
```

### Daftar Tipe yang Diterima:
- `feat:` Penambahan fitur baru pada bahasa, runtime, atau Web Playground.
- `fix:` Perbaikan bug pada interpretasi sintaks, parsing, atau eksekusi runtime.
- `docs:` Pembaruan atau penambahan dokumentasi teknis (README, panduan kontribusi, dll.).
- `test:` Penambahan atau perbaikan unit test pada modul `tests/`.
- `refactor:` Restrukturisasi kode tanpa mengubah fungsionalitas eksternal.
- `style:` Pembaruan format kode atau styling UI (Tailwind CSS) tanpa memengaruhi logika bahasa.
- `chore:` Pemeliharaan dependensi, konfigurasi build, atau skrip rilis.

**Contoh Commit:**
```bash
git commit -m "feat: tambahkan fungsi matematika trigonometri ke pustaka standar"
git commit -m "fix: tangani escape sequence pada parsing string literal"
git commit -m "docs: perbarui spesifikasi sintaks untuk sistem alias"
```

---

## 5. Mengajukan Pull Request (PR)

1. Sinkronkan branch Anda dengan branch `main` repositori hulu:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. Unggah perubahan ke repositori fork Anda:
   ```bash
   git push origin feat/nama-fitur
   ```
3. Buka repositori utama di GitHub dan ajukan **Pull Request**.
4. Isi templat Pull Request yang disediakan secara lengkap, jelaskan perubahan yang dibuat, dan pastikan seluruh ceklis verifikasi telah terpenuhi.
5. Tunggu proses peninjauan (*code review*) dari *maintainer*. Tanggapi masukan atau revisi yang diberikan secara konstruktif.
