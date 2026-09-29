# Changelog WibuScript

Semua pembaruan penting dan catatan rilis untuk proyek **WibuScript** didokumentasikan di sini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mematuhi [Semantic Versioning](https://semver.org/).

## [v2.5.0] - 2026-09-29

### Added
- **Modul Domain Web Dasar (`src/modules/web.ts`, `wibuscript/web`)**:
  - Wrapper fungsi tipis untuk pengambilan data HTTP via Fetch API (`fetchData` / `fetch`) dengan parsing teks dan JSON.
  - Abstraksi manipulasi DOM isomorfik: menggunakan DOM peramban asli jika dijalankan di Web Browser, atau Virtual DOM (`VirtualDOMElement` dan `virtualDocument`) jika dijalankan di Node.js, CLI, atau SSR tanpa peramban.
  - Fungsi bantuan elemen DOM: `selectElement` (pencarian tag, #id, .class), `createElement` (pembuatan elemen dengan atribut), `appendElement` (penyusunan hierarki induk-anak), `setText`/`getText` (pengaturan dan pembacaan teks elemen), `setHtml` (pengaturan HTML internal), dan `onEvent` (pemasangan listener aksi peristiwa).
  - Kesetaraan 100% pada 4 Dialek Mutlak:
    - Pengambilan Data: `tsunagari` (Murni), `tsu` (Singkat), `tarikData` (Wibu), `sedotdata` (Rongawi).
    - Pencarian Elemen: `youso` (Murni), `you` (Singkat), `comotElemen` (Wibu), `cidukunsur` (Rongawi).
    - Pembuatan Elemen: `yousoTsukuru` (Murni), `youTsu` (Singkat), `bikinElemen` (Wibu), `cetakunsur` (Rongawi).
    - Penempelan Elemen: `yousoTsukeru` (Murni), `youTsuke` (Singkat), `tempelElemen` (Wibu), `tempelunsur` (Rongawi).
    - Manipulasi Teks: `mojiOkikae`/`mojiToru` (Murni), `moOki`/`moTo` (Singkat), `gantiTeks`/`ambilTeks` (Wibu), `salintulisan`/`bacatulisan` (Rongawi).
    - Manipulasi HTML: `htmlOkikae` (Murni), `htOki` (Singkat), `gantiHtml` (Wibu), `salinhtml` (Rongawi).
    - Penanganan Event: `dekigoto` (Murni), `deki` (Singkat), `pasangEvent` (Wibu), `tunggukenak` (Rongawi).
- **Modul Domain Server Dasar (`src/modules/server.ts`, `wibuscript/server`)**:
  - Wrapper HTTP Server mandiri tipis berbasis modul `http` standar Node.js (`createServer` / `WibuServer`).
  - Abstraksi objek request `WibuRequest` (`url`, `method`, `headers`, `query`, `body`, `rawRequest`).
  - Abstraksi objek response `WibuResponse` dengan fungsi berantai `status()`, `setHeader()`, serta metode pengiriman respons:
    - Respons umum: `send()` dengan alias 4 dialek: `kaesu` (Murni), `kae` (Singkat), `kirimBalik` (Wibu), `balasmas` (Rongawi).
    - Respons JSON: `json()` dengan alias 4 dialek: `kanjiKaesu` (Murni), `kjKae` (Singkat), `kirimJson` (Wibu), `balasjson` (Rongawi).
  - Metode siklus hidup server dengan alias 4 dialek:
    - Listen: `listen()` (`kiku`, `ki`, `dengerin`, `pasangkuping`).
    - Close: `close()` (`yame`, `ya`, `tutupBanh`, `kelarngawi`).
    - Alias fungsi pembuat server: `sabahTsukuru` (Murni), `saaTsu` (Singkat), `bikinServer` (Wibu), `pabrikserver` (Rongawi).
  - Fungsi pengujian simulasi permintaan in-memory (`simulate`) untuk eksekusi cepat di unit test atau sandbox peramban tanpa alokasi port soket jaringan.
- **Ekspor dan Integrasi Runtime (`package.json`, `src/runtime.ts`, `src/transpiler.ts`, `scripts/fix-esm-imports.cjs`)**:
  - Ekspor subpath paket: `"./web"` dan `"./server"` pada `package.json`.
  - Dukungan pelindung referensi sirkular (circular reference guard) dan preservasi identitas objek native (`nativeRef`) pada runtime WibuScript saat memanipulasi hierarki pohon DOM.
  - Pemanggilan fungsi callback WibuScript dari sisi native JavaScript (`runtimeValueToJsValue` meneruskan eksekusi ke `invokeFunction`).
  - Pembaruan skrip kompilasi ESM `scripts/fix-esm-imports.cjs` dengan penelusuran rekursif direktori `dist/modules/`.
- **Skrip Contoh Program**:
  - `examples/web_fetch_dom.wibu`: Demonstrasi pengambilan data dan perakitan komponen kartu DOM.
  - `examples/http_server.wibu`: Demonstrasi pembuatan HTTP server, routing bersyarat, dan pengembalian respons JSON.
- **Suite Pengujian Unit & Kesetaraan Dialek**:
  - Berkas pengujian unit `tests/domain_modules.test.ts` (16 skenario pengujian) mencakup modul web, modul server, alias 4 dialek, siklus soket, dan eksekusi runtime.
  - Kasus Logika 6 pada `tests/dialect_snapshot.test.ts` memvalidasi 100% AST Parity dan output kesetaraan di seluruh 4 dialek.
  - Total pengujian unit otomatis meningkat menjadi 179/179 tes lulus 100%.

---

## [v2.4.0] - 2026-09-29

### Added
- **Penyempurnaan Language Server Protocol (`src/lsp.ts`)**:
  - Mesin diagnostik real-time berpresisi tinggi (`validateWibuScript`): mendeteksi galat Lexer (karakter ilegal, string tidak tertutup) dan Parser (token tidak diharapkan, kurung tidak seimbang, konstruksi tidak lengkap) dengan penentuan baris dan kolom 0-indexed yang akurat serta perluasan rentang token bermasalah.
  - Penyelesaian otomatis (autocomplete) terintegrasi (`buildDialectCompletionItems`): mengekstraksi seluruh 341+ kata kunci dari 4 Dialek Mutlak langsung dari `src/dialect-definitions.ts`, fungsi pustaka standar dengan format snippet parameter otomatis (`insertTextFormat: 2`), seluruh alias historis, konstruktor dan metode berantai tipe modern `Hasil`/`Opsional`, properti status, serta template snippet blok kontrol alur untuk keempat dialek.
  - Penyedia hover interaktif (`textDocument/hover`): menyajikan dokumentasi Markdown berbahasa Indonesia lengkap untuk setiap kata kunci atau simbol saat kursor diarahkan ke kode.
  - Navigasi simbol dokumen (`textDocument/documentSymbol`): mengekstraksi hierarki AST untuk fungsi, kelas, konstruktor, metode, dan variabel/konstanta agar terindeks di panel Outline editor.
  - Struktur kelas mandiri `WibuLanguageServer` yang memisahkan logika penanganan JSON-RPC dan mendukung pengujian unit tanpa proses I/O fisik.
- **Klien Visual Studio Code Mandiri (`vscode-extension/extension.js`)**:
  - Klien ekstensi native tanpa dependensi eksternal (zero-dependency) yang menghubungkan editor VS Code ke proses `wibu lsp` melalui Standard I/O (stdin/stdout).
  - Sinkronisasi dokumen otomatis (`textDocument/didOpen`, `textDocument/didChange`, `textDocument/didClose`) dan penerjemahan diagnostik ke `vscode.DiagnosticCollection`.
  - Registrasi provider VS Code untuk Completion, Hover, dan Document Symbols.
  - Dukungan konfigurasi opsi `wibuscript.lsp.executablePath` pada `settings.json` dan pelacakan fallback CLI otomatis.
- **Dokumentasi & Pengujian**:
  - Panduan lengkap arsitektur LSP, koneksi editor, dan langkah pengujian manual sederhana di terminal dan Extension Development Host pada `vscode-extension/README.md`.
  - Suite pengujian unit komprehensif `tests/lsp.test.ts` (19 skenario pengujian) mencakup validasi kode, autocomplete 4 dialek, ekstraksi outline simbol, dan siklus hidup pesan JSON-RPC.
  - Total pengujian otomatis meningkat menjadi 161/161 tes Vitest lulus 100%.

---

## [v2.3.0] - 2026-09-29

### Added
- **Tipe Data Fungsional Modern Hasil<T, E> & Opsional<T> (`src/runtime.ts`, `src/transpiler.ts`, `src/dialect-definitions.ts`, `src/converter.ts`)**:
  - Implementasi tipe data modern `Hasil` (Result) dengan varian `ok` dan `error`, serta `Opsional` (Option) dengan varian `some` dan `none` pada runtime WibuScript dan transpiler ES2022.
  - Konstruktor tipe 4 Dialek Mutlak:
    - `Hasil`: `seikou`/`shippai` (Jepang Murni), `sei`/`sip` (Jepang Singkat), `hokiBanh`/`zonkBanh` (Wibu Absurd), `menyalaAbangku`/`rugidong` (Meme Rongawi), serta alias universal `ok`/`error`.
    - `Opsional`: `aru`/`nai` (Jepang Murni), `ar`/`na` (Jepang Singkat), `adaBanh`/`gaadaBanh` (Wibu Absurd), `adamas`/`habismas` (Meme Rongawi), serta alias universal `some`/`none`.
  - Metode berantai fungsional (chainable helper methods):
    - `unwrap()` (alias 4 dialek: `hiraku`, `hira`, `bukaBanh`, `jebolmas`).
    - `unwrapOr(defaultValue)`.
    - `map(fn)` (alias 4 dialek: `utsusu`, `utu`, `henshinSuru`, `predikbola`).
    - `andThen(fn)` (alias 4 dialek: `tsugiSuru`, `tsuSuru`, `lanjutBanh`, `gaspolmas`).
    - Properti pemeriksa status: `isOk`, `isError`, `isSome`, `isNone`, `value`, `error`.
  - Integrasi pencocokan pola (Pattern Matching):
    - Dukungan pencocokan nilai `Hasil` dan `Opsional` di blok `shougo` / `sho` / `cocokkan` / `persimpangan` menggunakan tag string (`"ok"`, `"error"`, `"some"`, `"none"`, dan varian dialek) maupun simbol fungsi konstruktor langsung.
    - Penanganan cerdas di `src/transpiler.ts` melalui inspeksi `isModernTypeMatch` sehingga sintaks `switch` standar tetap dipertahankan untuk kasus ekspresi non-modern demi menjaga kompatibilitas mundur 100%.
- **Dialect Converter & Grammar Definitions (`src/converter.ts`, `src/dialect-definitions.ts`)**:
  - Pendaftaran konstruktor `seikou`, `shippai`, `aru`, `nai` ke dalam kamus `CANONICAL_SUPPORT_FUNCTIONS`, `HISTORICAL_ALIASES.supportFunctions`, dan `DIALECT_TABLE`.
  - Dukungan penuh konversi kode otomatis lintas 4 dialek untuk konstruktor `Hasil` dan `Opsional`.
- **Pengujian & Verifikasi**:
  - Berkas pengujian unit komprehensif `tests/result_option.test.ts` (19 skenario pengujian) yang mencakup konstruksi, eksekusi metode fungsional, dan pencocokan pola.
  - Penambahan Kasus Logika 5 pada `tests/dialect_snapshot.test.ts` yang memvalidasi AST parity 100% dan kesetaraan output eksekusi di seluruh 4 dialek.
  - Peningkatan total pengujian unit otomatis menjadi 142/142 tes lulus 100%.

---

## [v2.2.0] - 2026-09-29

### Added
- **Interoperabilitas NPM / Foreign Function Interface (`src/runtime.ts`)**:
  - Dukungan pemanggilan fungsi pustaka JavaScript npm asli secara dua arah (WibuScript to JS dan JS to WibuScript).
  - Pembungkusan otomatis fungsi JavaScript menjadi nilai native WibuScript (`MK_NATIVE_FN`) sehingga dapat dipanggil dengan sintaks fungsi standar WibuScript.
  - Resolusi properti modul berstruktur fungsi (seperti `lodash`) yang menyimpan fungsi utilitas pada objek callable.
  - Dukungan impor paket npm lintas 4 Dialek Mutlak: `toriyoseru ... kara` (Jepang Murni), `tori ... kra` (Jepang Singkat), `summonJutsu ... dari` (Wibu Absurd), dan `begalbaju ... ngawiland` (Meme Rongawi).
  - Dukungan wildcard import (`*`) dari pustaka npm ke dalam ruang lingkup variabel skrip pemanggil.
- **Penyempurnaan Wibu Package Manager (`src/pm.ts`)**:
  - Penambahan fungsi `normalizePackageName` untuk menangani format `npm:nama-paket`, scoped packages (`@scope/pkg`), dan whitespace secara konsisten.
  - Resolusi paket mode ganda: mendeteksi apakah paket merupakan modul WibuScript murni (`.wibu`) atau pustaka JavaScript FFI (`.js`).
  - Pemanggilan modul JS via `createRequire` dengan pelacakan hierarkis direktori `node_modules`.
  - Penanganan galat instalasi informatif untuk kasus: nama paket tidak valid, paket tidak ditemukan di registry npm (404/E404), versi tidak kompatibel (ETARGET), dan kegagalan koneksi jaringan (ENOTFOUND/ETIMEDOUT).
  - Penambahan anotasi komentar `turbopackIgnore` dan pemeriksaan lingkungan Node.js untuk kompatibilitas kompilasi bundler Turbopack Next.js.
- **Transpiler ES2022 (`src/transpiler.ts`)**:
  - Pembersihan otomatis prefiks `npm:` pada impor modul agar menghasilkan pernyataan `import` standar ES2022 (misalnya `import { chunk } from "lodash";`).
- **Contoh & Pengujian**:
  - Berkas contoh nyata `examples/interop_npm.wibu` yang mengimpor paket `lodash` dan menggunakan fungsi `chunk`, `capitalize`, `difference`, dan `compact`.
  - Suite pengujian unit `tests/npm_interop.test.ts` (14 pengujian) yang memverifikasi manajemen paket, interop runtime 4 dialek, wildcard import, transpiler ES2022, dan penanganan galat.

---

## [v2.1.0] - 2026-09-29

### Added
- **Wibu Package Manager (`src/pm.ts`)**:
  - Modul mandiri untuk manajemen dependensi pihak ketiga dan resolusi modul eksternal.
  - Implementasi fungsi `installPackage(packageName)` berbasis `child_process.execSync` untuk instalasi otomatis pustaka npm ke direktori `node_modules/`.
  - Sistem resolusi modul cerdas untuk sintaks impor eksternal `toriyoseru "npm:nama-paket"` yang mencari berkas `.wibu` di dalam direktori `node_modules/nama-paket/` (meliputi inspeksi `package.json`, `index.wibu`, `main.wibu`, dan subpath modul).
- **Wibu Language Server Protocol (`src/lsp.ts`)**:
  - Server mandiri berbasis standar JSON-RPC melalui antarmuka Standard I/O (stdin/stdout) tanpa dependensi eksternal.
  - Pemantau dokumen real-time (`textDocument/didOpen`, `textDocument/didChange`, `textDocument/didClose`).
  - Integrasi diagnostik galat sintaks langsung dengan Lexer dan Parser WibuScript yang menghasilkan array Diagnostic standar LSP untuk menampilkan garis bawah merah di editor teks seperti VS Code.
  - Penyedia penyelesaian otomatis (`textDocument/completion`) yang memuat seluruh 341 kata kunci dari 4 Dialek Mutlak (Jepang Murni, Jepang Singkat, Wibu Absurd, Meme Rongawi) beserta dokumentasi terintegrasi.
- **Ekspansi Antarmuka Baris Perintah CLI (`src/cli.ts`)**:
  - Perintah baru `wibu add <paket>` untuk memasang paket eksternal langsung dari terminal.
  - Perintah baru `wibu lsp` untuk mengaktifkan Language Server di latar belakang untuk koneksi ekstensi editor.

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
