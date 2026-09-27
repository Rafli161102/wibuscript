<!-- File: .github/PULL_REQUEST_TEMPLATE.md -->
## Konteks Perubahan (Deskripsi)
<!-- Jelaskan secara rinci perubahan teknis yang diajukan, motivasi arsitektural, dan konteks implementasi. -->

### Referensi Isu Terkait
<!-- Tautkan issue yang diselesaikan oleh PR ini (contoh: Closes #123, Fixes #456). -->
Closes #

---

## Tipe PR
<!-- Tandai opsi yang relevan dengan tanda [x]: -->
- [ ] **Fitur** (Penambahan sintaks baru, modul, atau kapabilitas runtime baru)
- [ ] **Bugfix** (Perbaikan error kompilator, parser, lexer, atau runtime)
- [ ] **Refaktor** (Restrukturisasi kode tanpa mengubah perilaku fungsional atau AST)
- [ ] **Breaking Change** (Perubahan yang memengaruhi backward compatibility atau API publik)

---

## Checklist Mutlak
<!-- Pastikan seluruh kriteria kepatuhan berikut telah terpenuhi sebelum mengajukan review: -->
- [ ] Lulus 100% Vitest (`npm test`) secara absolut di lingkungan lokal tanpa kegagalan.
- [ ] Mempertahankan arsitektur 4 Dialek Mutlak (Jepang Murni, Jepang Singkat, Wibu Absurd, Meme Rongawi).
- [ ] Tidak melanggar Pustaka Standar serta menjaga backward compatibility untuk alias kata kunci.
- [ ] Tidak ada konflik ambiguitas token pada Parser (`src/parser.ts`) dan Lexer (`src/lexer.ts`).
- [ ] Kompilasi dan verifikasi tipe data TypeScript berhasil tanpa error (`npm run build`).
- [ ] Branch kerja dibuat dari branch `main` terbaru menggunakan konvensi penamaan (`feature/`, `fix/`, `chore/`).
- [ ] Tidak melakukan direct push ke branch `main`.

---

## Bukti Pengujian Mandiri
<!-- Cantumkan salinan log eksekusi lokal dari terminal (misal: ringkasan npm test atau npm run core:test). -->
```text

```

---

## Catatan Tambahan (Opsional)
<!-- Tambahkan informasi relevan mengenai dependensi baru, kinerja, atau panduan migrasi jika diperlukan. -->
