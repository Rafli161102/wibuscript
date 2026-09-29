# WibuScript Official Release Notes
Dokumen Catatan Rilis Resmi WibuScript (v1.0.0 - v2.6.2)

Semua riwayat pembaruan, evolusi arsitektur, dan catatan rilis resmi untuk ekosistem bahasa pemrograman WibuScript didokumentasikan di sini secara kronologis dari versi awal hingga versi terbaru.

---

## [v2.6.2] - 2026-09-29

### Added
- **Pendaftaran GitHub Linguist & Pewarnaan Sintaks Repositori**:
  - Konfigurasi .gitattributes di root repositori untuk memetakan seluruh berkas *.wibu ke penyorot sintaks GitHub Linguist (linguist-language=JavaScript, linguist-detectable=true). Seluruh berkas WibuScript kini tampil berwarna rapi dan nyaman dipandang pada UI GitHub.
  - Pembuatan manifes pendaftaran resmi .github/linguist/wibuscript.yml untuk pendaftaran bahasa upstream ke github-linguist/linguist.
- **Suite Pengujian Otomatis Berkas Contoh (tests/examples.test.ts)**:
  - 10 pengujian integrasi baru yang memverifikasi seluruh berkas contoh (examples/kalkulator.wibu, examples/utama.wibu, examples/oop_sekte.wibu, examples/rongawi_meme.wibu, examples/interop_npm.wibu, examples/http_server.wibu, examples/web_fetch_dom.wibu, contoh.wibu, uji.wibu) serta kompatibilitas sintaks historis berjalan dengan sukses 100% tanpa galat.
  - Jumlah pengujian unit terverifikasi meningkat dari 179 menjadi 189 pengujian di 11 berkas uji tanpa satupun kegagalan.

### Fixed
- **Kompatibilitas Penuh Sintaks Historis v1.0**:
  - Restorasi alias kata kunci warisan pada Lexer (src/lexer.ts): koreWa (Var), bikinJutsu (Function), balikinDesu (Return), chigau (Else), dan kasihMite (Print). Memperbaiki kegagalan penguraian pada modul kalkulator dan berkas berbasis sintaks lama tanpa mengubah kesetaraan kanonikal 4 dialek utama.
- **Ketahanan Socket & Port Server**:
  - Penambahan penangan event galat (rawServer.on('error')) pada WibuServer di src/modules/server.ts guna menangani pengecualian level socket seperti EADDRINUSE secara anggun tanpa mematikan proses utama.
  - Penyesuaian port dinamis bebas bentrok pada berkas examples/http_server.wibu untuk eksekusi paralel yang sepenuhnya stabil.

---

## [v2.6.0] - 2026-09-29

### Added
- **Dokumentasi Internasional Lengkap (README.en.md)**:
  - Seluruh dokumentasi proyek kini tersedia dalam versi bahasa Inggris (README.en.md) yang tersinkronisasi 100% dengan README.md utama.
  - Mencakup penjelasan filosofi WibuScript, diagram arsitektur sistem, tabel referensi kata kunci 4 Dialek Mutlak, fungsi populer pustaka standar, tipe fungsional modern (Hasil/Opsional), modul domain dasar (web dan server), contoh program multi-dialek, serta panduan lengkap instalasi dan perintah CLI.
- **Navigasi Dwibahasa Lintas Dokumen**:
  - Penambahan tautan pengalih bahasa (language switcher) bolak-balik antara Bahasa Indonesia (README.md) dan Bahasa Inggris (README.en.md) pada bagian atas dokumen.
- **Verifikasi Kualitas & Konsistensi Ekosistem**:
  - Sinkronisasi penomoran versi 2.6.0 pada package.json, src/cli.ts, dan ekstensi editor vscode-extension/package.json.
  - Verifikasi otomatis seluruh 179 skenario pengujian unit Vitest lulus 100% tanpa regresi.

---

## [v2.5.0] - 2026-09-29

### Added
- **Modul Domain Web Dasar (src/modules/web.ts, wibuscript/web)**:
  - Wrapper fungsi tipis untuk pengambilan data HTTP via Fetch API (fetchData / fetch) dengan parsing teks dan JSON.
  - Abstraksi manipulasi DOM isomorfik: menggunakan DOM peramban asli jika dijalankan di Web Browser, atau Virtual DOM (VirtualDOMElement dan virtualDocument) jika dijalankan di Node.js, CLI, atau SSR tanpa peramban.
  - Fungsi bantuan elemen DOM: selectElement (pencarian tag, #id, .class), createElement (pembuatan elemen dengan atribut), appendElement (penyusunan hierarki induk-anak), setText/getText (pengaturan dan pembacaan teks elemen), setHtml (pengaturan HTML internal), dan onEvent (pemasangan listener aksi peristiwa).
  - Kesetaraan 100% pada 4 Dialek Mutlak:
    - Pengambilan Data: tsunagari (Murni), tsu (Singkat), tarikData (Wibu), sedotdata (Rongawi).
    - Pencarian Elemen: youso (Murni), you (Singkat), comotElemen (Wibu), cidukunsur (Rongawi).
    - Pembuatan Elemen: yousoTsukuru (Murni), youTsu (Singkat), bikinElemen (Wibu), cetakunsur (Rongawi).
    - Penempelan Elemen: yousoTsukeru (Murni), youTsuke (Singkat), tempelElemen (Wibu), tempelunsur (Rongawi).
    - Manipulasi Teks: mojiOkikae/mojiToru (Murni), moOki/moTo (Singkat), gantiTeks/ambilTeks (Wibu), salintulisan/bacatulisan (Rongawi).
    - Manipulasi HTML: htmlOkikae (Murni), htOki (Singkat), gantiHtml (Wibu), salinhtml (Rongawi).
    - Penanganan Event: dekigoto (Murni), deki (Singkat), pasangEvent (Wibu), tunggukenak (Rongawi).
- **Modul Domain Server Dasar (src/modules/server.ts, wibuscript/server)**:
  - Wrapper HTTP Server mandiri tipis berbasis modul http standar Node.js (createServer / WibuServer).
  - Abstraksi objek request WibuRequest (url, method, headers, query, body, rawRequest).
  - Abstraksi objek response WibuResponse dengan fungsi berantai status(), setHeader(), serta metode pengiriman respons:
    - Respons umum: send() dengan alias 4 dialek: kaesu (Murni), kae (Singkat), kirimBalik (Wibu), balasmas (Rongawi).
    - Respons JSON: json() dengan alias 4 dialek: kanjiKaesu (Murni), kjKae (Singkat), kirimJson (Wibu), balasjson (Rongawi).
  - Metode siklus hidup server dengan alias 4 dialek:
    - Listen: listen() (kiku, ki, dengerin, pasangkuping).
    - Close: close() (yame, ya, tutupBanh, kelarngawi).
    - Alias fungsi pembuat server: sabahTsukuru (Murni), saaTsu (Singkat), bikinServer (Wibu), pabrikserver (Rongawi).
  - Fungsi pengujian simulasi permintaan in-memory (simulate) untuk eksekusi cepat di unit test atau sandbox peramban tanpa alokasi port soket jaringan.
- **Ekspor dan Integrasi Runtime (package.json, src/runtime.ts, src/transpiler.ts, scripts/fix-esm-imports.cjs)**:
  - Ekspor subpath paket: "./web" dan "./server" pada package.json.
  - Dukungan pelindung referensi sirkular (circular reference guard) dan preservasi identitas objek native (nativeRef) pada runtime WibuScript saat memanipulasi hierarki pohon DOM.
  - Pemanggilan fungsi callback WibuScript dari sisi native JavaScript (runtimeValueToJsValue meneruskan eksekusi ke invokeFunction).
  - Pembaruan skrip kompilasi ESM scripts/fix-esm-imports.cjs dengan penelusuran rekursif direktori dist/modules/.
- **Skrip Contoh Program**:
  - examples/web_fetch_dom.wibu: Demonstrasi pengambilan data dan perakitan komponen kartu DOM.
  - examples/http_server.wibu: Demonstrasi pembuatan HTTP server, routing bersyarat, dan pengembalian respons JSON.
- **Suite Pengujian Unit & Kesetaraan Dialek**:
  - Berkas pengujian unit tests/domain_modules.test.ts (16 skenario pengujian) mencakup modul web, modul server, alias 4 dialek, siklus soket, dan eksekusi runtime.
  - Kasus Logika 6 pada tests/dialect_snapshot.test.ts memvalidasi 100% AST Parity dan output kesetaraan di seluruh 4 dialek.
  - Total pengujian unit otomatis meningkat menjadi 179/179 tes lulus 100%.

---

## [v2.4.0] - 2026-09-29

### Added
- **Penyempurnaan Language Server Protocol (src/lsp.ts)**:
  - Mesin diagnostik real-time berpresisi tinggi (validateWibuScript): mendeteksi galat Lexer dan Parser dengan penentuan baris dan kolom 0-indexed yang akurat.
  - Penyelesaian otomatis (autocomplete) terintegrasi (buildDialectCompletionItems): mengekstraksi seluruh 341+ kata kunci dari 4 Dialek Mutlak langsung dari src/dialect-definitions.ts, fungsi pustaka standar dengan format snippet parameter otomatis, seluruh alias historis, konstruktor dan metode berantai tipe modern Hasil/Opsional, properti status, serta template snippet blok kontrol alur untuk keempat dialek.
  - Penyedia hover interaktif (textDocument/hover): menyajikan dokumentasi Markdown berbahasa Indonesia lengkap untuk setiap kata kunci atau simbol.
  - Navigasi simbol dokumen (textDocument/documentSymbol): mengekstraksi hierarki AST untuk fungsi, kelas, konstruktor, metode, dan variabel/konstanta agar terindeks di panel Outline editor.
  - Struktur kelas mandiri WibuLanguageServer yang memisahkan logika penanganan JSON-RPC dan mendukung pengujian unit tanpa proses I/O fisik.
- **Klien Visual Studio Code Mandiri (vscode-extension/extension.js)**:
  - Klien ekstensi native tanpa dependensi eksternal yang menghubungkan editor VS Code ke proses wibu lsp melalui Standard I/O (stdin/stdout).
  - Sinkronisasi dokumen otomatis dan penerjemahan diagnostik ke vscode.DiagnosticCollection.
  - Registrasi provider VS Code untuk Completion, Hover, dan Document Symbols.
- **Dokumentasi & Pengujian**:
  - Panduan lengkap arsitektur LSP, koneksi editor, dan langkah pengujian manual pada vscode-extension/README.md.
  - Suite pengujian unit komprehensif tests/lsp.test.ts (19 skenario pengujian). Total pengujian otomatis meningkat menjadi 161/161 tes lulus 100%.

---

## [v2.3.0] - 2026-09-29

### Added
- **Tipe Data Fungsional Modern Hasil<T, E> & Opsional<T> (src/runtime.ts, src/transpiler.ts, src/dialect-definitions.ts, src/converter.ts)**:
  - Implementasi tipe data modern Hasil (Result) dengan varian ok dan error, serta Opsional (Option) dengan varian some dan none pada runtime WibuScript dan transpiler ES2022.
  - Konstruktor tipe 4 Dialek Mutlak:
    - Hasil: seikou/shippai (Jepang Murni), sei/sip (Jepang Singkat), hokiBanh/zonkBanh (Wibu Absurd), menyalaAbangku/rugidong (Meme Rongawi), serta alias universal ok/error.
    - Opsional: aru/nai (Jepang Murni), ar/na (Jepang Singkat), adaBanh/gaadaBanh (Wibu Absurd), adamas/habismas (Meme Rongawi), serta alias universal some/none.
  - Metode berantai fungsional: unwrap(), unwrapOr(defaultValue), map(fn), andThen(fn).
  - Properti pemeriksa status: isOk, isError, isSome, isNone, value, error.
  - Integrasi pencocokan pola (Pattern Matching shougo) menggunakan tag diskriminan dan simbol konstruktor.
- **Pengujian & Verifikasi**:
  - Berkas pengujian unit komprehensif tests/result_option.test.ts (19 skenario pengujian).
  - Penambahan Kasus Logika 5 pada tests/dialect_snapshot.test.ts yang memvalidasi AST parity 100% dan kesetaraan output eksekusi di seluruh 4 dialek. Total pengujian: 142/142 tes lulus 100%.

---

## [v2.2.0] - 2026-09-29

### Added
- **Interoperabilitas NPM / Foreign Function Interface (src/runtime.ts)**:
  - Dukungan pemanggilan fungsi pustaka JavaScript npm asli secara dua arah (WibuScript to JS dan JS to WibuScript).
  - Pembungkusan otomatis fungsi JavaScript menjadi nilai native WibuScript (MK_NATIVE_FN) sehingga dapat dipanggil dengan sintaks fungsi standar WibuScript.
  - Resolusi properti modul berstruktur fungsi (seperti lodash) yang menyimpan fungsi utilitas pada objek callable.
  - Dukungan impor paket npm lintas 4 Dialek Mutlak: toriyoseru ... kara (Murni), tori ... kra (Singkat), summonJutsu ... dari (Wibu), dan begalbaju ... ngawiland (Rongawi).
  - Dukungan wildcard import (*) dari pustaka npm.
- **Penyempurnaan Wibu Package Manager (src/pm.ts)**:
  - Penambahan fungsi normalizePackageName untuk menangani format npm:nama-paket, scoped packages (@scope/pkg), dan whitespace.
  - Resolusi paket mode ganda: mendeteksi modul .wibu murni atau pustaka JavaScript FFI (.js).
  - Penanganan galat instalasi informatif untuk berbagai skenario kesalahan npm.
- **Transpiler ES2022 (src/transpiler.ts)**:
  - Pembersihan otomatis prefiks npm: pada impor modul untuk menghasilkan pernyataan import standar ES2022.
- **Contoh & Pengujian**:
  - Berkas contoh nyata examples/interop_npm.wibu (lodash chunk, capitalize, difference, compact).
  - Suite pengujian unit tests/npm_interop.test.ts (14 pengujian).

---

## [v2.1.0] - 2026-09-29

### Added
- **Wibu Package Manager (src/pm.ts)**:
  - Modul mandiri untuk manajemen dependensi pihak ketiga dan resolusi modul eksternal via child_process.execSync.
  - Sistem resolusi modul cerdas untuk sintaks toriyoseru "npm:nama-paket".
- **Wibu Language Server Protocol (src/lsp.ts)**:
  - Server mandiri berbasis standar JSON-RPC melalui antarmuka Standard I/O (stdin/stdout).
  - Pemantau dokumen real-time dan diagnostik galat sintaks langsung dengan Lexer dan Parser.
  - Penyedia autocomplete (textDocument/completion) untuk seluruh 341 kata kunci 4 Dialek Mutlak.
- **Ekspansi CLI (src/cli.ts)**:
  - Perintah baru wibu add <paket> dan wibu lsp.

---

## [v2.0.1] - 2026-09-29

### Fixed
- **Pembaruan Aset Animasi GIF Dokumentasi**:
  - Memperbaiki tautan eksternal animasi GIF pada README.md yang sempat mengalami galat dari penyedia pihak ketiga.
  - Memigrasikan seluruh 5 aset animasi langsung ke repositori lokal pada direktori assets/images/.
  - Menggunakan tautan raw GitHub resmi berkecepatan tinggi agar tampilan animasi GIF selalu aktif di GitHub dan web npmjs.com.
  - Menyertakan folder assets ke dalam distribusi paket npm (files array pada package.json).

---

## [v2.0.0] - 2026-09-29

### Added
- **Arsitektur Compiler Pipeline & JS Target Modern (ES2022+)**:
  - Implementasi kompilasi penuh simpul AST ke JavaScript modern.
  - Pemetaan panggilan fungsi Pustaka Standar langsung ke runtime JavaScript teroptimasi.
  - Penghasil Source Map v3 resmi (data:application/json;charset=utf-8;base64,...) dengan Base64 VLQ encoding.
- **Single Source of Truth Dialect Grammar (src/dialect-definitions.ts)**:
  - Definisi tunggal metadata resmi 4 dialek (Jepang Murni, Jepang Singkat, Wibu Absurd, Meme Rongawi).
  - Skrip otomatisasi generator (scripts/generate-grammars.ts) untuk Monaco Monarch Tokenizer dan VS Code TextMate Grammar.
- **Web Worker Sandbox Runner (src/sandbox.ts)**:
  - Eksekusi terisolasi isomorfik menggunakan node:worker_threads (Node.js) dan Web Worker (peramban).
  - Proteksi batas waktu eksekusi default 5000 ms, pembatas memori, dan keamanan default-deny.
- **Dialect Parity & Snapshot Test Suite (tests/dialect_snapshot.test.ts)**:
  - Pengujian parity komprehensif untuk 4 program logika kompleks pada 4 dialek berbeda.
  - Verifikasi asersi mutlak: 100% AST identik dan 100% output eksekusi identik di seluruh dialek (107/107 tes lulus).

---

## [v1.9.1] - 2026-09-28

### Added
- **Publikasi Resmi ke NPM Global**:
  - Paket wibuscript secara resmi dirilis dan dipublikasikan ke registry npm global (https://www.npmjs.com/package/wibuscript).
  - Dukungan npm install -g wibuscript, npx wibuscript, dan npm install wibuscript.
- **Integrasi GitHub Packages Registry**: Workflow otomatisasi .github/workflows/publish-package.yml.
- **Git Tagging & Release**: Penandaan git tag resmi v1.9.1.
- **Sinkronisasi Versi CLI**: Memperbarui konstanta versi di src/cli.ts ke 1.9.1.

---

## [v1.9.0] - 2026-09-28

### Added
- **Redesign Dialek Wibu Absurd**: Kosakata alur, deklarasi, OOP, modul, dan pustaka standar bergaya internet otaku Indo-Jepang natural.
- **Pembersihan Kosakata Meme Rongawi**: Standardisasi 100% kosakata Meme Rongawi otentik tanpa istilah buatan.
- **Suite Pengujian Unit Vitest**: 96/96 pengujian otomatis lulus 100%.

---

## [v1.8.0] - 2026-09-27

### Added
- **Pencocokan Pola (Pattern Matching shougo) di 4 Dialek Mutlak**: Murni (shougo/baai/hyoujun), Singkat (sho/baa/hyo), Wibu (cocokkan/kaloPas/sisaan), Rongawi (persimpangan/kenaben/yappingtolol).
- **Destructuring & Spread Operator (...)**: Array & Object Destructuring dengan alias target, serta spread operator.
- **Keamanan & Performa Web Playground**: Proteksi kedalaman call stack, loop timeout, dan streaming buffer anti-freeze.

---

## [v1.7.0] - 2026-09-26

### Added
- **Pemrograman Berorientasi Objek (OOP)**: sekte (Class), tanjou (Constructor), atarashii (New), keishou (Extends), jibun (This).
- **Sistem Modul Asli**: koukai (Export), toriyoseru (Import), kara (From).
- **Shorthand Jepang Otentik**: sek, tan, ata, kei, ji, kou, tori, kra.

---

## [v1.6.0] - 2026-09-25

### Added
- Perulangan iterasi koleksi (subete ... no).
- Fungsi sebaris lambda / arrow (=>).
- Utilitas manipulasi string & koleksi: bunri, tsunagu, okikae, kiri, fukumu, narabikae, kirinuki, gacha.

---

## [v1.5.0] - 2026-09-24

### Added
- Penanganan galat (kokoromi ... yurusu / Try-Catch).
- Literal array, pengindeksan kurung siku arr[0], operator logika (&&, ||, !), template string interpolasi.
- Interactive REPL, Dialect Converter, dan JS Transpiler.

---

## [v1.0.0] - 2026-09-22

### Added
- Rilis awal Core Engine WibuScript (Lexer, Parser, Interpreter).
- Sistem 4 Dialek Mutlak WibuScript.
- Next.js Web Playground interaktif.
