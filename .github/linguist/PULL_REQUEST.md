# Pull Request: Add support for WibuScript

### Language Information
- **Language**: WibuScript
- **Type**: programming
- **File Extension**: `.wibu`
- **Color**: `#ff79c6`
- **Aliases**: `wibu`, `wibuscript`
- **TextMate Scope**: `source.wibuscript`
- **Ace Mode**: `text`
- **CodeMirror Mode**: `javascript`

### Grammar Source
- **Upstream Repository**: https://github.com/Rafli161102/wibuscript
- **Grammar Path**: `vscode-extension/syntaxes/wibuscript.tmLanguage.json`
- **License**: MIT (Open Source, OSI-approved)

### Changes in `languages.yml`
```yaml
WibuScript:
  type: programming
  color: "#ff79c6"
  aliases:
    - wibu
    - wibuscript
  extensions:
    - .wibu
  tm_scope: source.wibuscript
  ace_mode: text
  codemirror_mode: javascript
  codemirror_mime_type: text/javascript
```

### Samples
1. `samples/WibuScript/utama.wibu`: Demonstrates variable declarations, function invocations, module imports (`yobu`), and file I/O (`kaku`, `yomu`).
2. `samples/WibuScript/oop_sekte.wibu`: Demonstrates Object-Oriented Programming (classes via `sekte`, constructors via `tanjou`, inheritance via `keishou`, instance referencing via `jibun`, object instantiation via `atarashii`, and exports via `koukai`).

### Checklist
- [x] Language entry added to `lib/linguist/languages.yml` in alphabetical order
- [x] Grammar is open source under an MIT license
- [x] Representative samples included in `samples/WibuScript/`
- [x] All samples accurately showcase real syntax without being a trivial hello world
