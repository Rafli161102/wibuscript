### Added
- **Operasi Asinkronus Mutlak (AwaitExpression)**:
  - Penambahan simpul AST `AwaitExpression` beserta integrasi menyeluruh pada Parser, Evaluator Tree-Walking Interpreter, dan Transpiler JavaScript ES2022+.
  - Dukungan kata kunci await pada seluruh 4 Dialek Mutlak: `matte` (Jepang Murni), `mat` (Romaji Singkat), `matteNe` (Wibu Absurd), dan `admindatang` (Meme Rongawi).
  - Penanganan Promise asli JavaScript secara transparan saat eksekusi runtime interaktif dan pemanggilan FFI.
- **Fungsi Tingkat Tinggi Barisan: `tatamu` (reduce / fold)**:
  - Penambahan pustaka pelipatan koleksi barisan dengan dukungan opsional nilai akumulator awal.
  - Kesetaraan 4 Dialek Mutlak: `tatamu` (Murni), `tat` (Singkat), `lipatBanh` (Wibu), dan `gulungJawa` (Rongawi).
  - Transpilasi optimal ke helper `__tatamu` berbasis `Array.prototype.reduce`.
- **Pustaka Matematika Ekstensi: `saishou` (min) & `saidai` (max)**:
  - Penambahan fungsi pencarian nilai minimum dan maksimum dengan fleksibilitas masukan deretan angka maupun barisan array.
  - Kesetaraan 4 Dialek Mutlak:
    - Minimum: `saishou` (Murni), `sai` (Singkat), `palingKecilBanh` (Wibu), dan `kurapika` (Rongawi).
    - Maksimum: `saidai` (Murni), `dai` (Singkat), `palingGedeBanh` (Wibu), dan `megatron` (Rongawi).
  - Transpilasi optimal ke helper `__saishou` dan `__saidai`.
- **Integrasi CLI Frontend Web & DOM (`wibu web` dan `wibu build --dom`)**:
  - Penambahan perintah `wibu web <berkas.wibu> [-o output.html] [--title <judul>]` untuk kompilasi kode frontend WibuScript langsung menjadi halaman HTML mandiri.
  - Penambahan opsi `--dom` pada `wibu build <berkas.wibu> [-o output.js]` untuk bundel JavaScript manipulasi DOM peramban berfitur lexical masking.
- **Suite Pengujian Unit Diperluas (`tests/v27_features.test.ts`)**:
  - Penambahan 18 skenario uji otomatis baru yang menguji seluruh fitur v2.7.0.
  - Total pengujian unit naik menjadi 250 tes yang lulus 100% dari 14 berkas uji.

### Changed
- **Penyempurnaan Alur Rilis CI/CD (`.github/workflows/release.yml`)**:
  - Penyesuaian judul rilis GitHub menjadi dinamis `v${VERSION} - WibuScript Official Release`.
  - Ekstraksi otomatis catatan rilis langsung dari `CHANGELOG.md` via `scripts/extract-changelog.cjs`.
