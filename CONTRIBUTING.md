<!-- File: CONTRIBUTING.md -->
# Panduan Kontribusi Standar Enterprise WibuScript

Dokumen ini menetapkan standar kontribusi, tata kelola cabang (*branching strategy*), dan alur kerja integrasi berkelanjutan (*CI/CD*) untuk pengembangan ekosistem WibuScript. Seluruh kontributor diwajibkan mematuhi panduan ini guna memastikan stabilitas, integritas arsitektur, dan kompatibilitas jangka panjang.

---

## 1. Kebijakan Proteksi Branch Utama

Proyek WibuScript menerapkan **Strict Branching Strategy** setingkat Enterprise. 

- **Dilarang keras melakukan direct push ke branch `main` (`git push origin main`).**
- Branch `main` merupakan cabang produksi yang dilindungi (*protected branch*).
- Setiap pembaruan kode mutlak harus diajukan melalui mekanisme **Pull Request (PR)** yang telah tervalidasi penuh oleh pipeline otomatis GitHub Actions.
- Penggabungan (*merge*) hanya dapat dilakukan setelah status check CI berstatus hijau (*passed*) dan disetujui oleh *maintainer*.

---

## 2. Konvensi Penamaan Branch

Seluruh pekerjaan baru wajib diisolasi dalam branch terpisah yang dicabangkan langsung dari versi terbaru `main`. Gunakan konvensi penamaan standar industri dengan awalan (*prefix*) berikut:

| Tipe Branch | Format Penamaan | Deskripsi Penggunaan |
| :--- | :--- | :--- |
| **Feature** | `feature/nama-fitur` | Penambahan sintaks baru, modul, atau kapabilitas runtime baru |
| **Bugfix** | `fix/nama-bug` | Perbaikan error kompilator, parser, lexer, atau runtime |
| **Chore** | `chore/nama-tugas` | Pembaruan dependensi, dokumentasi, konfigurasi tooling, atau skrip build |

Contoh penamaan yang valid:
- `feature/array-filter-method`
- `fix/parser-newline-conflict`
- `chore/upgrade-vitest-v2`

---

## 3. Alur Standar Pengembangan (Enterprise Workflow)

Setiap kontribusi wajib mengikuti alur kerja enam tahap:

```text
Branch -> Commit -> Push -> Pull Request -> CI Check -> Merge
```

### Tahap 1: Branch (Pembuatan Cabang Terisolasi)
Pastikan branch `main` lokal Anda sinkron dengan repositori hulu sebelum mencabangkan:

```bash
git checkout main
git pull origin main
git checkout -b feature/nama-fitur
```

### Tahap 2: Commit (Penerapan Conventional Commits)
Gunakan pesan commit yang terstruktur dan bermakna sesuai standar Conventional Commits:

```bash
# Format: <tipe>: <deskripsi perubahan>
git commit -m "feat: tambahkan operator modulo pada dialek wibu absurd"
git commit -m "fix: tangani token newline berulang pada lexer"
git commit -m "chore: perbarui dependensi typescript ke versi terbaru"
```

### Tahap 3: Push (Unggah Branch Kerja ke Remote)
Unggah branch kerja Anda ke remote repository:

```bash
git push origin feature/nama-fitur
```
*Catatan: Jangan pernah menjalankan `git push origin main`.*

### Tahap 4: Pull Request (Pengajuan PR Terstruktur)
1. Buka antarmuka repositori di GitHub dan klik **Compare & pull request**.
2. Pastikan target branch tujuan adalah `main` dan sumber branch adalah branch kerja Anda.
3. Isi seluruh bagian pada templat Pull Request (`.github/PULL_REQUEST_TEMPLATE.md`):
   - Deskripsi Perubahan teknis dan konteks implementasi.
   - Penandaan Tipe PR (`Feature`, `Bugfix`, `Refactor`, `Breaking Change`).
   - Pemenuhan seluruh poin pada Checklist Validasi.

### Tahap 5: CI Check (Validasi Otomatis Status Check)
Setelah PR diajukan, GitHub Actions akan secara otomatis menjalankan workflow `Enterprise PR Validation` pada runner `ubuntu-latest` dengan tahapan berurutan:
1. `npm ci` : Pemasangan dependensi bersih dan deterministik berdasarkan `package-lock.json`.
2. `npm run build` : Pemeriksaan tipe data TypeScript (*type checking*) dan kompilasi modul inti.
3. `npm run test` : Validasi unit test secara absolut menggunakan Vitest (seluruh test suite wajib lolos 100%).

Status check `enterprise-validation` mutlak harus berwarna hijau (*passed*) sebelum PR diizinkan untuk di-merge.

### Tahap 6: Merge (Penggabungan ke Main)
Setelah tinjauan kode disetujui (*code review approved*) dan seluruh status check CI berhasil, PR akan digabungkan ke `main` menggunakan metode *Squash and Merge* atau *Rebase and Merge* oleh maintainer untuk menjaga riwayat git tetap rapi.

---

## 4. Persiapan Lingkungan dan Verifikasi Mandiri Lokal

Sebelum mengajukan Pull Request, kontributor diwajibkan menjalankan verifikasi mandiri di lingkungan lokal:

### Prasyarat Perangkat Lunak
- Node.js (>= v18.0.0 atau v20.0.0)
- npm (>= v9.0.0)

### Instalasi Dependensi
```bash
npm install
```

### Eksekusi Pengujian Mandiri
```bash
# Menjalankan seluruh pengujian unit otomatis
npm test

# Menjalankan kompilasi TypeScript dan build proyek
npm run build

# Menguji eksekusi skrip wibuscript secara langsung melalui CLI lokal
npm run core:test
```

Pastikan tidak ada kegagalan pengujian (*zero test failures*) dan tidak ada peringatan kompilasi TypeScript sebelum melakukan push.

---

## 5. Kepatuhan Arsitektur dan Dialek WibuScript

WibuScript memiliki aturan arsitektur ketat yang wajib dipatuhi:

1. **Pelestarian 4 Dialek Mutlak**:
   Setiap perubahan pada Lexer (`src/lexer.ts`) dan Parser (`src/parser.ts`) wajib mempertahankan kesetaraan semantik pada keempat dialek resmi:
   - Jepang Murni
   - Jepang Singkat
   - Wibu Absurd
   - Meme Rongawi
2. **Backward Compatibility**:
   Kata kunci terdahulu dan alias pustaka standar tidak boleh dihapus tanpa persetujuan RFC major version. Seluruh alias yang tercatat pada `README.md` harus tetap berfungsi.
3. **Bebas Ambiguitas Token**:
   Hindari penugasan kata kunci yang saling menimpa (*collision*) pada pemetaan token lexer.
