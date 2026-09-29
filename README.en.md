<!-- File: README.en.md -->
<div align="center">

  <img src="https://raw.githubusercontent.com/Rafli161102/wibuscript/main/assets/images/header-typing.gif" width="180" alt="Fast Typing Animation" />

# WibuScript

<a href="https://github.com/Rafli161102/wibuscript">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3500&pause=1000&color=CB3837&center=true&vCenter=true&width=700&lines=Modern+Esoteric+Programming+Language;4+Absolute+Dialects+System;TypeScript-Based+Tree-Walking+Interpreter;npm+install+-g+wibuscript" alt="WibuScript Typing Banner" />
</a>

<br/>

[![npm version](https://img.shields.io/npm/v/wibuscript.svg?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/wibuscript)
[![npm total downloads](https://img.shields.io/npm/dt/wibuscript.svg?style=for-the-badge&logo=npm&logoColor=white&color=2088FF&label=total%20downloads)](https://www.npmjs.com/package/wibuscript)
[![npm monthly downloads](https://img.shields.io/npm/dm/wibuscript.svg?style=for-the-badge&logo=npm&logoColor=white&color=007ACC&label=downloads%2Fmonth)](https://www.npmjs.com/package/wibuscript)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing%20189%2F189-729B1B?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Status](https://img.shields.io/badge/Status-Stable%20v2.6.1-brightgreen?style=for-the-badge)](https://github.com/Rafli161102/wibuscript/releases)
[![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](https://github.com/Rafli161102/wibuscript/blob/main/LICENSE)

<p align="center">
  <b>Pure Japanese | Short Japanese | Absurd Weeb | Meme Rongawi</b>
</p>

<p align="center">
  <a href="README.md">Bahasa Indonesia</a> | <b>English</b>
</p>

<p align="center">
  <a href="#about-wibuscript">About</a> |
  <a href="#system-architecture">Architecture</a> |
  <a href="#the-4-absolute-dialects-system">4 Absolute Dialects</a> |
  <a href="#standard-library">Standard Library</a> |
  <a href="#domain-modules-web--server">Domain Modules</a> |
  <a href="#code-examples">Code Examples</a> |
  <a href="#installation-and-cli">Installation</a> |
  <a href="#changelog">Changelog</a>
</p>

---

</div>

## About WibuScript

WibuScript is an esoteric programming language built on top of TypeScript featuring a modern v2.0 Compiler Pipeline architecture (JavaScript ES2022+ Target) alongside a built-in Tree-Walking Interpreter for interactive REPL. The core philosophy is straightforward: provide unique programming syntaxes through the **4 Absolute Dialects System**, ranging from neat Japanese Romaji to expressive internet meme culture.

Despite its humorous and unconventional flavor, WibuScript is engineered with rigorous technical standards. Its compiler pipeline is completely modular, safely runs in browser clients inside isolated Web Worker Sandboxes for the Web Playground, and ships with a robust Node.js CLI for local file execution, package management, and Language Server Protocol (LSP) tooling.

<img src="https://raw.githubusercontent.com/Rafli161102/wibuscript/main/assets/images/tech-glasses.gif" width="140" align="right" alt="Technical Analysis" />

## System Architecture

The WibuScript directory structure separates the core compiler engine from user tooling:

```text
wibuscript/
|-- src/
|   |-- ast.ts                  # Abstract Syntax Tree (AST) definitions
|   |-- lexer.ts                # Token scanner and 4-dialect token mapping
|   |-- parser.ts               # Recursive Descent Parser producing AST
|   |-- transpiler.ts           # JS Transpiler (ES2022+) & Source Map v3
|   |-- sandbox.ts              # Web Worker & Worker Threads Sandbox Runner
|   |-- dialect-definitions.ts  # Single Source of Truth Dialect Grammar
|   |-- runtime.ts              # Tree-Walking Evaluator & Standard Library
|   |-- pm.ts                   # Wibu Package Manager (npm interop & FFI)
|   |-- lsp.ts                  # Language Server Protocol engine (JSON-RPC)
|   |-- modules/
|   |   |-- web.ts              # Web domain module (fetch & Virtual DOM)
|   |   `-- server.ts           # Server domain module (HTTP server wrapper)
|   |-- index.ts                # Core engine entry point
|   `-- cli.ts                  # Node.js command-line interface
|-- scripts/
|   |-- generate-grammars.ts    # TextMate & Monarch Tokenizer generator
|   `-- fix-esm-imports.cjs     # Recursive ESM distribution post-builder
|-- tests/
|   |-- dialect_snapshot.test.ts # 4-dialect AST and execution parity suite
|   |-- domain_modules.test.ts  # Web & Server domain module unit tests
|   |-- lsp.test.ts             # Language Server Protocol test suite
|   `-- npm_interop.test.ts     # NPM FFI and package manager test suite
|-- app/                        # Next.js App Router Web Playground
|-- vscode-extension/           # Official VS Code extension client
`-- README.md                   # Project documentation
```

### Core Components
- **Lexer**: Deterministically breaks source code lines into tokens. Supports string interpolation, floating point numbers, logical operators, and precise line/column tracking.
- **Parser**: Builds a strongly typed Abstract Syntax Tree using Recursive Descent Parsing independently from runtime execution targets.
- **Transpiler (Primary v2.0 Pipeline)**: Compiles all AST nodes into optimized modern JavaScript (ES2022+) with runtime standard library bindings and official Source Map v3 support.
- **Sandbox Runner**: An isolated execution layer utilizing Web Workers (Browser) and Worker Threads (Node.js) featuring strict execution timeouts (5000 ms), memory ceilings, and default-deny security.
- **Runtime Interpreter**: Evaluates AST nodes asynchronously for interactive REPL and debugging sessions.
- **Package Manager (`wibu add`)**: Enables seamless Foreign Function Interface (FFI) integration with native npm libraries.
- **Language Server (`wibu lsp`)**: Standalone JSON-RPC LSP engine providing real-time diagnostics, semantic hover documentation, document symbol outlines, and autocomplete across all 4 dialects.

<div style="clear: both;"></div>

## The 4 Absolute Dialects System

In WibuScript, standard English keywords like `let`, `if`, or `while` are absent by design. All control structures and declarations belong to four distinct dialects that can be used interchangeably or mixed within the same file:

- **Pure Japanese**: Formal, tidy Japanese Romaji vocabulary.
- **Short Japanese**: Compact shorthand abbreviations for rapid coding.
- **Absurd Weeb**: Expressive Indonesian anime and otaku internet slang.
- **Meme Rongawi**: Casual, creative Indonesian local internet meme vocabulary.

All four dialects map to identical token types within the Lexer, guaranteeing 100% syntactic and semantic AST parity.

### Keyword Mapping Table

| Category | Pure Japanese | Short Japanese | Absurd Weeb | Meme Rongawi | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Variable (LET)** | `kore` | `ko` | `iniDesu` | `pokmipokmi` | Mutable variable declaration. |
| **Constant (CONST)** | `zettai` | `ze` | `zettaiDa` | `bundarahma` | Immutable constant declaration. |
| **Null (NULL)** | `munashi` | `mu` | `naniKore` | `blukutuk` | Representation of empty or nonexistent values. |
| **Boolean True** | `hontou` | `hon` | `hontouNi` | `unjukkebolehan` | Boolean true literal. |
| **Boolean False** | `uso` | `uso` | `chigauYo` | `keracunanmbg` | Boolean false literal. |
| **Conditional (IF)** | `moshi` | `mo` | `moShiKalo` | `izintampil` | Executes block if condition evaluates to true. |
| **Else If** | `soretomo` | `sore` | `soredemoNe` | `wowok` | Secondary condition branch. |
| **Else** | `hoka` | `ho` | `shoganaiNe` | `woijawa` | Fallback branch if no condition matched. |
| **Loop (WHILE)** | `zutto` | `zu` | `zuttoLoop` | `nyawit` | Loops as long as condition remains true. |
| **Break Loop** | `yame` | `ya` | `yameteKure` | `bijisatu` | Immediately terminates the enclosing loop. |
| **Continue Loop** | `tsugi` | `tsu` | `tsugiNe` | `ambatukam` | Skips to the next iteration of the loop. |
| **Function** | `jutsu` | `ju` | `watashiJutsu` | `fufufafa` | Declares a reusable function. |
| **Return** | `kaesu` | `kae` | `haiBeri` | `kandabahlil` | Returns a computed value from a function. |
| **Print (PRINT)** | `mite` | `mi` | `iuYo` | `salamkenal` | Prints values or strings to output console. |
| **Await (AWAIT)** | `matte` | `mat` | `matteNe` | `admindatang` | Awaits asynchronous execution resolution. |
| **Try (TRY)** | `kokoromi` | `koko` | `yatteMiyo` | `ragnamok` | Executes code prone to throwing errors. |
| **Catch (CATCH)** | `yurusu` | `yuru` | `gomennasai` | `amanBos` | Catches and handles caught runtime errors. |
| **Class (CLASS)** | `sekte` | `sek` | `nakama` | `sektejomok` | Object blueprint declaration. |
| **Constructor** | `tanjou` | `tan` | `umareta` | `ambatunat` | Initialization constructor method. |
| **New (NEW)** | `atarashii` | `ata` | `atarashiiNe` | `ambatumbas` | Instantiates a class object. |
| **Inheritance** | `keishou` | `kei` | `kouhaiDesu` | `jalurhukum` | Extends properties from a parent class. |
| **Self (THIS)** | `jibun` | `ji` | `oreSama` | `lanangmas` | Refers to current object instance. |
| **Export (EXPORT)** | `koukai` | `kou` | `sebarJutsu` | `umpansilang` | Exports symbols out of module scope. |
| **Import (IMPORT)** | `toriyoseru` | `tori` | `summonJutsu` | `begalbaju` | Imports symbols from another module. |
| **Module Source** | `kara` | `kra` | `dari` | `ngawiland` | Source origin file or package specifier. |
| **Pattern Match** | `shougo` | `sho` | `cocokkan` | `persimpangan` | Pattern matching conditional structure. |
| **Pattern Case** | `baai` | `baa` | `kaloPas` | `kenaben` | Specific matching branch pattern. |
| **Default Case** | `hyoujun` | `hyo` | `sisaan` | `yappingtolol` | Fallback branch when no case matches. |
| **For-Each Loop** | `subete` | `sube` | `zenbuNe` | `thugshaker` | Iterates over collection elements. |
| **In Particle** | `no` | `no` | `dari` | `alasdaun` | Collection membership particle. |

## Standard Library

WibuScript provides built-in utilities to facilitate standard data operations without writing boilerplate from scratch. A unified runtime implementation supports four distinct naming conventions per function.

### Selected Standard Functions

| Capability | Pure Japanese | Short Japanese | Absurd Weeb | Meme Rongawi | Return Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Terminal Output** | `kuchiMite(msg)` | `km(msg)` | `omaeWaIu(msg)` | `cawapresin(msg)` | `Null` |
| **Sleep / Delay** | `shibaraku(ms)` | `siba(ms)` | `matteNeSikit(ms)` | `nungguinLu(ms)` | `Null` |
| **System Timestamp** | `imaJikan()` | `ima()` | `nanjiDesu()` | `kopihitam()` | `String` |
| **Length** | `nagasa(data)` | `naga(data)` | `doreKurai(data)` | `panjangberurat(data)` | `Number` |
| **Random Integer** | `randamu(min, max)` | `ran(min, max)` | `unmeiGacha(min, max)` | `rudalmentah(min, max)` | `Number` |
| **Create Array** | `retsu(...)` | `ret(...)` | `nakamaTachi(...)` | `budakhitam(...)` | `Array` |
| **Append Array** | `ireta(arr, item)` | `ire(arr, item)` | `haireNe(arr, item)` | `priaotot(arr, item)` | `Array` |

### Modern Functional Types: Result & Option

WibuScript features modern algebraic types for safe error and optional value handling:
- **Result (`Hasil<T, E>`)**: Constructors `seikou(val)` (Ok) and `shippai(err)` (Error).
- **Option (`Opsional<T>`)**: Constructors `aru(val)` (Some) and `nai()` (None).
- **Chaining Methods**: `.unwrap()`, `.unwrapOr(defaultVal)`, `.map(fn)`, and `.andThen(fn)`.
- Seamlessly integrates with pattern matching (`shougo`) across all 4 dialects.

## Domain Modules (web & server)

WibuScript provides lightweight, consistent domain wrappers across all 4 Absolute Dialects:

### 1. Web Domain Module (`wibuscript/web` or `"web"`)
Isomorphic data fetching and DOM manipulation supporting Browser runtime (native DOM) and Node.js / CLI / SSR (in-memory Virtual DOM):
- Fetch data: `fetchData` / `tsunagari` / `tsu` / `tarikData` / `sedotdata`.
- Query elements: `selectElement` / `youso` / `you` / `comotElemen` / `cidukunsur`.
- Create elements: `createElement` / `yousoTsukuru` / `youTsu` / `bikinElemen` / `cetakunsur`.
- Append elements: `appendElement` / `yousoTsukeru` / `youTsuke` / `tempelElemen` / `tempelunsur`.
- Modify text: `setText` / `mojiOkikae` and `getText` / `mojiToru`.
- Event listeners: `onEvent` / `dekigoto` / `deki` / `pasangEvent` / `tunggukenak`.

### 2. Server Domain Module (`wibuscript/server` or `"server"`)
Thin, standalone HTTP Server wrapper built on top of Node.js `node:http`:
- Create server: `createServer` / `sabahTsukuru` / `saaTsu` / `bikinServer` / `pabrikserver`.
- Send response: `res.send()` (`kaesu`, `kae`, `kirimBalik`, `balasmas`).
- Send JSON response: `res.json()` (`kanjiKaesu`, `kjKae`, `kirimJson`, `balasjson`).
- Server lifecycle: `server.listen()` (`kiku`, `ki`, `dengerin`, `pasangkuping`) and `server.close()` (`yame`, `ya`, `tutupBanh`, `kelarngawi`).
- In-memory simulation: `server.simulate(url, method, body, headers)` for instant test execution without socket port allocation.

## Code Examples

<img align="right" width="160" src="https://raw.githubusercontent.com/Rafli161102/wibuscript/main/assets/images/cat-coding.gif" alt="Cat Coding" />

### Multi-Dialect Script Example

```javascript
// Profile data declaration
kore profil = {
  nama: "Sora",
  divisi: "Compiler",
  level: 1
};

zettai namaBesar = ookiku(profil.nama);
kuchiMite("Registered Name: " + namaBesar);
km("Start Time: " + ima());

// Manage task list array
iniDesu daftarTugas = nakamaTachi("Check Lexer", "Build AST");
haireNe(daftarTugas, "Run Unit Tests");
omaeWaIu("Active tasks count: " + doreKurai(daftarTugas));

// Task count iteration loop
pokmipokmi nomor = 0;
zutto (nomor < 5) {
  nomor = nomor + 1;

  moshi (nomor == 2) {
    cawapresin("Task 2 skipped momentarily");
    tsugi;
  }

  kuchiMite("Processing task #" + nomor);

  moShiKalo (nomor == 4) {
    kuchiMite("Daily ceiling reached, stopping now");
    bijisatu;
  }
}

kuchiMite("All procedures executed successfully.");
```

### Web DOM & Server Examples

```javascript
// Web Domain Example:
toriyoseru { youso, yousoTsukuru, yousoTsukeru, mojiOkikae } kara "web";
kore wadah = youso("body");
kore judul = yousoTsukuru("h1");
mojiOkikae(judul, "WibuScript Web");
yousoTsukeru(wadah, judul);

// Server Domain Example:
toriyoseru { sabahTsukuru } kara "server";
kore server = sabahTsukuru((req, res) => {
  res.json({ status: "active", version: "2.6.0" }, 200);
});
server.listen(3000, () => {
  mite("Server listening on http://localhost:3000");
});
```

<div style="clear: both;"></div>

## Installation and CLI

<img src="https://raw.githubusercontent.com/Rafli161102/wibuscript/main/assets/images/fast-keyboard.gif" width="140" align="right" alt="Fast Typing Animation" />

Try WibuScript instantly without installation using npx:

```bash
npx wibuscript --help
```

### Prerequisites
- **Node.js**: Version 18.0.0 or later.
- **npm**: Version 9.0.0 or later.

### Command-Line Interface (CLI)

```bash
# Global installation via npm
npm install -g wibuscript

# Launch interactive REPL session
wibu

# Execute a WibuScript script file
wibu run your_script.wibu

# Compile WibuScript code to modern JavaScript (ES2022+)
wibu build your_script.wibu -o output.js

# Convert syntax between dialects automatically
wibu convert your_script.wibu --to rongawi -o output_rongawi.wibu

# Install third-party packages via Wibu Package Manager
wibu add your-package-name

# Start the standalone Language Server Protocol (LSP)
wibu lsp
```

<div style="clear: both;"></div>

---

## Changelog

### v2.6.1
- **GitHub Linguist Registration & Code Syntax Highlighting**: Configured `.gitattributes` to map all `*.wibu` files to GitHub Linguist syntax highlighter (`linguist-language=JavaScript`, `linguist-detectable=true`) for rich, readable code presentation on GitHub. Provided language specification manifest `.github/linguist/wibuscript.yml`.
- **Deep Code Stabilization & Example Test Suite (`tests/examples.test.ts`)**: Added 10 automated test cases verifying that all example scripts (`examples/kalkulator.wibu`, `examples/utama.wibu`, `examples/oop_sekte.wibu`, `examples/rongawi_meme.wibu`, `examples/interop_npm.wibu`, `examples/http_server.wibu`, `examples/web_fetch_dom.wibu`, `contoh.wibu`, `uji.wibu`) run cleanly without error. Total test suite expanded to 189 passing tests.
- **Historical v1.0 Syntax Backward Compatibility**: Restored legacy keyword aliases in Lexer (`koreWa`, `bikinJutsu`, `balikinDesu`, `chigau`, `kasihMite`) for seamless legacy code execution.
- **Server Socket Resilience**: Added socket error handling on internal `http.Server` (`src/modules/server.ts`) and dynamic port binding in `examples/http_server.wibu`.

### v2.6.0
- **International Documentation**: Full English documentation (`README.en.md`) covering the 4 Absolute Dialects System, keyword reference tables, standard library, modern functional types, web and server domain modules, and CLI guide.
- **Bilingual Navigation**: Bidirectional language switcher badges between Indonesian (`README.md`) and English (`README.en.md`).
- **Engine Verification**: Comprehensive test suite with 179/179 automated Vitest tests passing with 100% success rate.

### v2.5.0
- **Web Domain Module (`wibuscript/web`)**: Thin wrapper for HTTP data fetching via Fetch API and isomorphic DOM manipulation (native Browser DOM or in-memory Virtual DOM for Node.js/CLI/SSR) with 100% parity across 4 Absolute Dialects.
- **Server Domain Module (`wibuscript/server`)**: Standalone HTTP Server wrapper based on Node.js `node:http` with request/response abstractions, JSON responses, socket lifecycle methods, in-memory simulation (`simulate`), and 4-dialect aliases.
- **Example Scripts**: Added `examples/web_fetch_dom.wibu` (fetch & DOM component assembly) and `examples/http_server.wibu` (HTTP server and routing).
- **Package Subpath Exports**: Registered `"./web"` and `"./server"` subpaths in `package.json`, recursive ESM post-build resolution, and circular DOM reference safeguards.
- **Test Suite Expansion**: Added `tests/domain_modules.test.ts` (16 test cases) and Logic Case 6 in `tests/dialect_snapshot.test.ts`.

### v2.4.0
- **Language Server Protocol (`src/lsp.ts`)**: Real-time diagnostic engine detecting Lexer and Parser errors with 0-indexed line and column precision. Autocomplete across all 341+ dialect keywords, standard functions, and snippets. Interactive hover documentation and document symbol outlines.
- **Official VS Code Extension (`vscode-extension/`)**: Zero-dependency extension client connecting to `wibu lsp` over standard I/O (stdin/stdout).
- **Unit Test Suite**: Added `tests/lsp.test.ts` (19 test cases) validating language server features.

### v2.3.0
- **Modern Functional Types Result & Option**: Implemented `Hasil<T, E>` (`seikou`/`shippai`) and `Opsional<T>` (`aru`/`nai`) across all 4 dialects with chaining methods (`unwrap`, `unwrapOr`, `map`, `andThen`) and direct pattern matching integration.
- **Test Suite**: Added `tests/result_option.test.ts` (19 test cases) and Logic Case 5 in `tests/dialect_snapshot.test.ts`.

### v2.2.0
- **NPM Interoperability / FFI**: Seamlessly import native JavaScript npm packages and execute their exported functions across all 4 dialects.
- **Wibu Package Manager (`src/pm.ts`)**: Dual-mode module resolution (`.wibu` scripts and JS npm packages) with informative installation error handling.

### v2.1.0
- Introduced Wibu Package Manager foundations and standalone Language Server Protocol foundation.
- Added CLI commands: `wibu add <package>` and `wibu lsp`.

### v2.0.0
- Official transition to Compiler Pipeline & JavaScript ES2022+ Target as primary execution path.
- Single Source of Truth Dialect Grammar (`src/dialect-definitions.ts`).
- Web Worker Sandbox Runner (`src/sandbox.ts`) with timeout, memory limit, and default-deny security.
- Source Map v3 support (Base64 VLQ).

---

<div align="center">
  <img src="https://raw.githubusercontent.com/Rafli161102/wibuscript/main/assets/images/sleepy-footer.gif" width="200" alt="Rest Animation" />
  <p><i>Compilation complete. Enjoy exploring WibuScript!</i></p>
</div>
