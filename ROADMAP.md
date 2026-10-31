# WibuScript Roadmap

Dokumen ini adalah peta pengembangan teknis WibuScript. Status mengacu pada implementasi di repositori, bukan sekadar rencana atau eksperimen. Item berstatus **Planned** belum boleh dianggap tersedia hingga kode, pengujian, dokumentasi, dan CI terkait selesai.

## Prinsip pengembangan

1. **Compatibility first** — perubahan compiler/runtime harus menjaga empat dialek dan perilaku kode yang sudah ada.
2. **Correctness before optimization** — setiap optimasi harus disertai uji parity terhadap interpreter dan transpiler.
3. **Safe defaults** — CLI tidak menimpa file tanpa opsi eksplisit; eksekusi kode tidak tepercaya harus memakai isolasi OS/container.
4. **One source of truth** — grammar, metadata dialek, dokumentasi, dan editor tooling harus diselaraskan.
5. **Evidence-based release** — versi hanya siap rilis setelah typecheck, test, build, paket tarball, extension validation, dan sandbox CI lulus.

## Status milestone

| Milestone | Status | Cakupan |
| --- | --- | --- |
| P0 — Reliability & Release Foundation | **Completed** | Node engine contract, CLI version source, ESM HTTP server fix, real HTTP regression test, npm tarball smoke test, CI package/container checks |
| P1 — Developer Experience | **Completed (initial)** | Syntax diagnostics API, CLI `check`, conservative formatter API, CLI `format`, `--check`, idempotency and source-preservation tests |
| P2 — Editor Integration | **Completed (initial)** | LSP document formatting capability, VS Code Format Document provider, spaces/tabs support, extension metadata aligned with core 2.8.0 |
| P3 — Static Analysis & Diagnostics | **Planned** | Multi-error parser recovery, warnings/hints, unused symbol checks, unreachable code checks, undefined-name and scope diagnostics |
| P4 — Formatter & Code Actions | **Planned** | Grammar-aware spacing and line wrapping, dialect-aware style configuration, safe quick-fixes, organize imports, formatter range support |
| P5 — Semantic Model & Compiler IR | **Planned** | Explicit symbol table and scope model, semantic/type checking, stable HIR and MIR contracts, IR validation and snapshot tests |
| P6 — Optimizer & Execution Backends | **Planned** | Constant folding, dead-code elimination, control-flow simplification, benchmark suite, optional bytecode/VM backend after measured need |
| P7 — Debugging & Profiling | **Planned** | Source-level breakpoints, stepping, variable inspection, execution trace, CPU/memory profiling hooks |
| P8 — Package & Module Ecosystem | **Planned** | Lockfile integrity, reproducible installs, dependency policy, module resolution diagnostics, package provenance and compatibility matrix |
| P9 — Release & Ecosystem Maturity | **Planned** | Stable public API policy, semver automation, signed provenance where available, VS Code Marketplace publication, compatibility docs and contributor governance |

## P0 — Reliability & Release Foundation

**Completed.** The repository now reads the CLI version from package metadata, declares the Node.js minimum required by the dependency/toolchain contract, covers the native HTTP server listener with a regression test, and exercises npm tarball installation plus package exports during CI. Core CI also validates the Playground build, VS Code extension scripts, and container runner.

## P1 — Developer Experience

**Completed (initial implementation).**

- `validateSource(source)` performs syntax validation without executing the program and returns structured diagnostics with source coordinates and suggestions.
- `wibu check <file.wibu>` exposes syntax checking from the CLI.
- `formatSource(source, options)` normalizes block indentation. The first formatter intentionally preserves non-leading source text rather than guessing at grammar-sensitive rewrites.
- `wibu format <file.wibu>` prints formatted output by default. `-o` writes to a new file, `--write` opts into updating the input, and `--check` supports CI verification.
- Formatter tests cover idempotency, syntax preservation, comments, string literals, CRLF, multiline template content, and spaces/tabs.

**Known limitation:** the formatter is an indentation formatter, not yet a full opinionated formatter. It does not normalize operator spacing, line breaks, quote style, or dialect keyword spellings.

## P2 — Editor Integration

**Completed (initial implementation).** The LSP advertises `textDocument/formatting`, applies the same formatter used by the CLI, and honors VS Code indentation preferences. The extension exposes the standard Format Document command and documents format-on-save configuration.

## P3 — Static Analysis & Diagnostics

**Acceptance criteria:**

- Recover from a syntax error and continue parsing later statements where safe; never emit cascaded or misleading diagnostics.
- Support multiple diagnostics with severity, source range, code, and optional related information.
- Add semantic scope tracking for declarations, parameters, imports, and class members.
- Report undefined names, duplicate declarations, unused symbols, unreachable statements, and suspicious comparisons as configurable warnings.
- Keep behavior parity across all four dialects.
- Include negative and positive tests for every diagnostic family.

## P4 — Formatter & Code Actions

**Acceptance criteria:**

- Replace brace-count formatting with a grammar-aware formatter using tokens/AST plus trivia preservation.
- Preserve comments, template literal interpolation, strings, and all four dialect spellings.
- Support line range formatting and stable output across LF/CRLF.
- Add LSP quick fixes only when the source edit is unambiguous.
- Validate that formatting is idempotent and AST-equivalent before enabling broader rewrites.

## P5 — Semantic Model & Compiler IR

**Acceptance criteria:**

- Introduce a dedicated symbol table and lexical scope model independent of runtime execution.
- Define HIR and MIR data contracts with explicit ownership, source mapping, and validation rules.
- Lower AST to HIR/MIR deterministically; add golden tests and dialect parity tests.
- Implement a static type/semantic checker without changing the default runtime behavior.
- Document the IR schema and compatibility policy before exposing it as public API.

## P6 — Optimizer & Execution Backends

**Acceptance criteria:**

- Start with opt-in, semantics-preserving passes: constant folding, dead-code elimination, and control-flow simplification.
- Run differential tests between unoptimized interpreter/transpiler and optimized output for all four dialects.
- Establish reproducible benchmarks before changing performance-sensitive code.
- Evaluate bytecode/VM only after benchmarks show a meaningful use case; keep JavaScript transpilation as a supported backend.

## P7 — Debugging & Profiling

**Acceptance criteria:**

- Map runtime and transpiled errors back to source positions.
- Add pause/continue, step over/into/out, breakpoints, and local variable inspection.
- Expose bounded execution traces and profiling hooks.
- Ensure debugger transport remains separate from LSP stdout framing.

## P8 — Package & Module Ecosystem

**Acceptance criteria:**

- Define deterministic dependency resolution and lockfile format.
- Verify package integrity and compatibility before executing package code.
- Improve version/range conflict diagnostics and support reproducible installs.
- Publish clear Node.js/browser compatibility matrices and package security guidance.

## P9 — Release & Ecosystem Maturity

**Acceptance criteria:**

- Define supported public API and deprecation policy.
- Require release CI evidence and keep npm, GitHub Packages, GitHub Release, and extension versions synchronized.
- Publish the VS Code extension to the Marketplace only after packaging/signing and publisher ownership are verified.
- Maintain contributor guides, security reporting, support policy, and migration notes.

## Definition of done for every milestone

A milestone is complete only when all of the following are true:

- Implementation is merged into `main` without an unrequested branch.
- Unit/integration/regression tests cover new behavior and important failure cases.
- Typecheck and production build pass.
- Package artifact and relevant editor/container smoke tests pass.
- `README.md`, `README.en.md`, and this changelog are updated; roadmap status is updated in this file.
- Any limitation, migration impact, or release requirement is documented.
