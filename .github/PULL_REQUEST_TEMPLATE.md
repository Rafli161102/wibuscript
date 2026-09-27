<!-- File: .github/PULL_REQUEST_TEMPLATE.md -->
## Ringkasan Perubahan (Summary)
<!-- Jelaskan secara ringkas perubahan apa yang Anda ajukan dan motivasi di balik perubahan tersebut. -->

## Tipe Perubahan (Type of Change)
<!-- Tandai dengan tanda [x] pada kotak yang sesuai: -->
- [ ] **Bugfix** (Perbaikan masalah yang tidak merusak kompatibilitas yang ada)
- [ ] **Feature** (Penambahan fungsionalitas baru yang tidak merusak kompatibilitas)
- [ ] **Breaking Change** (Perubahan yang menyebabkan fungsionalitas sebelumnya tidak berjalan semestinya)
- [ ] **Documentation** (Pembaruan atau penambahan dokumentasi)
- [ ] **Refactoring** (Penyusunan ulang kode tanpa mengubah perilaku eksternal)
- [ ] **Testing** (Penambahan atau perbaikan unit test)

## Masalah Terkait (Related Issues)
<!-- Tautkan issue yang diselesaikan oleh PR ini (contoh: Menutup #12 atau Mengatasi #34). -->
Closes #

## Ceklis Kesiapan (Pre-submission Checklist)
<!-- Pastikan seluruh item berikut telah diverifikasi sebelum meminta peninjauan: -->
- [ ] Kode saya telah mengikuti pedoman gaya dan standar penulisan kode proyek.
- [ ] Saya telah melakukan peninjauan mandiri (*self-review*) terhadap kode saya.
- [ ] Seluruh pengujian otomatis telah dijalankan dan berstatus lolos (`npm test`).
- [ ] Pengujian manual lokal dengan CLI WibuScript berjalan lancar (`npm run core:test`).
- [ ] Saya telah menambahkan unit test baru yang relevan untuk memvalidasi perubahan ini (jika berlaku).
- [ ] Dokumentasi yang relevan telah diperbarui sejalan dengan perubahan kode.
- [ ] Perubahan saya tidak memicu *warning* atau *error* baru pada kompilasi TypeScript (`npm run build`).

## Tangkapan Layar / Bukti Eksekusi (Opsional)
<!-- Sisipkan cuplikan terminal atau tangkapan layar jika ada perubahan pada antarmuka Web Playground atau output CLI. -->
