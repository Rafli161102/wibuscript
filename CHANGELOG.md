# Changelog WibuScript

Semua pembaruan penting dan catatan rilis untuk proyek **WibuScript** didokumentasikan di sini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mematuhi [Semantic Versioning](https://semver.org/).

---

## [v2.0.1] - 2026-09-29

### Fixed
- **Pembaruan Aset Animasi GIF Dokumentasi**:
  - Memperbaiki tautan eksternal animasi GIF pada README.md yang sempat mengalami 404 (Not Found) dari penyedia CDN pihak ketiga.
  - Memigrasikan seluruh 5 aset animasi (header-typing, tech-glasses, cat-coding, fast-keyboard, sleepy-footer) langsung ke repositori lokal pada direktori `assets/images/`.
  - Menggunakan tautan raw GitHub resmi berkecepatan tinggi agar tampilan animasi GIF dijamin selalu aktif, tajam, dan tidak pernah rusak baik pada repositori GitHub maupun di portal web npmjs.com.
  - Menyertakan folder `assets` ke dalam distribusi paket npm (`files` array pada `package.json`).

---

## [v2.0.0] - 2026-09-29

### Added
- **Arsitektur Compiler Pipeline & JS Target Modern (ES2022+)**:
  - Implementasi kompilasi penuh simpul AST ke JavaScript modern (`let`, `const`, deklarasi fungsi, blok bersarang, perulangan `while` dengan `break`/`continue`).
  - Pemetaan panggilan fungsi Pustaka Standar (seluruh 4 dialek) langsung ke runtime JavaScript teroptimasi.
  - Penghasil Source Map v3 resmi (`data:application/json;charset=utf-8;base64,...`) dengan Base64 VLQ encoding untuk kemudahan pelacakan debugging di Node.js dan browser.
- **Single Source of Truth Dialect Grammar (`src/dialect-definitions.ts`)**:
  - Definisi tunggal metadata resmi 4 dialek (Jepang Murni, Jepang Singkat, Wibu Absurd, Meme Rongawi).
  - Skrip otomatisasi generator (`scripts/generate-grammars.ts`) untuk memproduksi Monaco Monarch Tokenizer (Web Playground) dan VS Code TextMate Grammar (`vscode-extension/syntaxes/wibuscript.tmLanguage.json`).
- **Web Worker Sandbox Runner (`src/sandbox.ts`)**:
  - Eksekusi terisolasi isomorfik menggunakan `node:worker_threads` pada lingkungan Node.js dan Web Worker pada peramban.
  - Proteksi resource limit: batas waktu eksekusi default 5000 ms (auto-termination pada infinite loop), pembatas memori, dan keamanan *default-deny* terhadap modul berbahaya.
  - Komunikasi dua arah (message passing) untuk pengiriman kode sumber dan streaming output terminal (`stdout`/`stderr`).
- **Dialect Parity & Snapshot Test Suite (`tests/dialect_snapshot.test.ts`)**:
  - Pengujian parity komprehensif untuk 4 program logika kompleks (Faktorial, Manipulasi Array, Pattern Matching, Destructuring) yang ditulis dalam 4 dialek berbeda.
  - Verifikasi asersi mutlak: 100% AST identik dan 100% output eksekusi identik di seluruh dialek.
  - Total pengujian otomatis Vitest meningkat menjadi 107/107 tes (lulus 100%).

---

## [v1.9.1] - 2026-09-28

### Added
- **Publikasi Resmi ke NPM Global**: Paket `wibuscript` secara resmi dirilis dan dipublikasikan ke registry npm global ([https://www.npmjs.com/package/wibuscript](https://www.npmjs.com/package/wibuscript)).
  - `npm install -g wibuscript` (CLI global)
  - `npx wibuscript --help` (eksekusi instan)
  - `npm install wibuscript` (dependensi modul library)
- **Integrasi GitHub Packages Registry**: Menambahkan workflow otomatisasi GitHub Actions (`.github/workflows/publish-package.yml`) untuk rilis otomatis paket `@rafli161102/wibuscript` ke GitHub Packages.
- **Git Tagging & Release**: Penandaan git tag resmi `v1.9.1` pada repositori GitHub.

### Changed
- **Sinkronisasi Versi CLI**: Memperbarui konstanta versi di `src/cli.ts` ke `1.9.1` sehingga output perintah `wibu -v` dan `wibu --help` sinkron dengan `package.json`.

---

## [v1.9.0] - 2026-09-28

### Added
- **Redesign Dialek Wibu Absurd (Slang Cringe Indo-Jepang Internet)**:
  - Kosakata alur & deklarasi baru: `iniDesu` (var), `zettaiDa` (const), `naniKore` (null), `hontouNi` (true), `chigauYo` (false), `moShiKalo` (if), `soredemoNe` (else if), `shoganaiNe` (else), `zuttoLoop` (while), `yameteKure` (break), `tsugiNe` (continue), `watashiJutsu`/`mybini` (function), `haiBeri` (return), `iuYo` (print), `matteNe` (await), `yatteMiyo` (try), `gomennasai` (catch), `zenbuNe` (for-in), `karaNe`/`dari` (in).
  - OOP & Modul: `nakama` (class), `umareta` (constructor), `atarashiiNe` (new), `kouhaiDesu` (extends), `oreSama` (this), `sebarJutsu` (export), `summonJutsu` (import).
  - Pustaka Standar Wibu: `omaeWaIu`, `matteNeSikit`, `nanjiDesu`, `doreKurai`, `suujiNi`, `naniTypeNe`, `tsuyokuNare`, `maneNi`, `haireNe`, `deteike`, `kiriteNe`, `ookiVoice`, `chiisaiVoice`, `unmeiGacha`, `shineeeYo`, `nakamaTachi`, `yomimasuNe`, `kakimasuNe`, `mottekite`, `tottekiteNe`, `wakattaYo`, `oshieteNe`, `henshinSuru`, `senbatsuNe`, `mitsuketaYo`, `heihoukon`, `zettaiChi`, `shitaKiri`, `ueKiri`, `barabara`, `isshoNi`, `irekaeruNe`, `kireeNi`, `hairuKana`, `narabeteNe`, `sukoshiDake`.

- **Pembersihan Kosakata Rongawi Otentik (Ngawiverse & Thugposting)**:
  - Standardisasi 100% kosakata Meme Rongawi tanpa ada istilah buatan atau akhiran "-lur": `kopihitam` (waktu), `panjangberurat` (panjang), `priaotot` (push), `danaterbakar` (pop), `kertaslecek` (substring), `gakhabisgila` (uppercase), `monyetbanyumas` (lowercase), `rudalmentah` (random), `robogor` (sqrt), `ironiman` (abs), `hutanselatan` (floor), `menaracukur` (ceil), `salintempel` (JSON.parse), `copascaption` (JSON.stringify), `predikbola` (map), `morebullets` (filter), `fesnuker` (find), `ragnamok` (try), `omagot` (typeof), `ototkawat` (readFile), `teksusang` (writeFile).

- **Suite Pengujian Unit Vitest**:
  - 96/96 automated unit & integration tests lulus tanpa peringatan atau kegagalan.

### Deprecated
- Seluruh alias lama dari dialek Wibu dan Rongawi tetap dipertahankan di runtime untuk menjamin *backward compatibility* total dengan kode lawas.

---

## [v1.8.0] - 2026-09-27

### Added
- **Pencocokan Pola (Pattern Matching `shougo`) di 4 Dialek Mutlak**:
  - Murni: `shougo ... baai ... hyoujun`
  - Singkat: `sho ... baa ... hyo`
  - Wibu: `cocokkan ... kaloPas ... sisaan`
  - Rongawi: `persimpangan ... kenaben ... yappingtolol`
- **Destructuring & Spread Operator (`...`)**:
  - Array & Object Destructuring dengan alias target
  - Operator Spread (`...`) pada array literal dan dekonstruksi string
- **Keamanan & Performa Web Playground**:
  - Proteksi call stack depth, loop timeout, dan streaming buffer anti-freeze.

### Fixed
- Operator Modulo (`%`) di Lexer, Parser, dan Evaluator.
- Akses properti panjang string (`.nagasa`, `.naga`, `.length`).
- Instansiasi objek tanpa tanda kurung (`atarashii Kelas`).
- Toleransi titik koma kosong / stray semicolons (`;`).

---

## [v1.7.0] - 2026-09-26

### Added
- **Pemrograman Berorientasi Objek (OOP)**:
  - `sekte` (Class), `tanjou` (Constructor), `atarashii` (New), `keishou` (Extends), `jibun` (This).
- **Sistem Modul Asli**:
  - `koukai` (Export), `toriyoseru` (Import), `kara` (From).
- **Shorthand Jepang Otentik**: `sek`, `tan`, `ata`, `kei`, `ji`, `kou`, `tori`, `kra`.

---

## [v1.6.0] - 2026-09-25
- Perulangan iterasi koleksi (`subete ... no`).
- Fungsi sebaris lambda / arrow (`=>`).
- Utilitas manipulasi string & koleksi: `bunri`, `tsunagu`, `okikae`, `kiri`, `fukumu`, `narabikae`, `kirinuki`, `gacha`.

---

## [v1.5.0] - 2026-09-24
- Penanganan galat (`kokoromi ... yurusu` / Try-Catch).
- Literal array, pengindeksan kurung siku `arr[0]`, operator logika (`&&`, `||`, `!`), template string interpolasi.
- Interactive REPL, Dialect Converter, dan JS Transpiler.

---

## [v1.0.0] - 2026-09-22
- Rilis awal Core Engine WibuScript (Lexer, Parser, Interpreter).
- Sistem 4 Dialek Mutlak.
- Next.js Web Playground.
