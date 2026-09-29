// File: src/dom-transpiler.ts
// ============================================================================
// WIBUSCRIPT FRONTEND DOM & WEB API TRANSPILER
// Mentranspilasi dialek Wibu/Cringe Indonesia ke JavaScript murni untuk
// manipulasi DOM dan pengembangan web interaktif di browser.
// Menggunakan arsitektur Lexical Masking untuk proteksi literal string & komentar.
// ============================================================================

export interface WibuDomTranspileOptions {
  /**
   * Menambahkan pembungkus fungsi IIFE (Immediately Invoked Function Expression)
   * agar variabel tidak mencemari cakupan global browser.
   */
  wrapInIIFE?: boolean;

  /**
   * Menyertakan skrip loader otomatis 'DOMContentLoaded' jika dijalankan di browser.
   */
  waitForDOM?: boolean;
}

/**
 * Mentranspilasi kode WibuScript berbasis Kamus Wibu-DOM ke kode JavaScript standar.
 * Menjamin literal string dan komentar tidak akan terdistorsi oleh penggantian kata kunci.
 */
export function transpile(wibuCode: string, options: WibuDomTranspileOptions = {}): string {
  if (typeof wibuCode !== "string") {
    throw new TypeError("[WibuScript Transpiler] Kode sumber harus berupa string.");
  }

  // --------------------------------------------------------------------------
  // TAHAP 1: ISOLASI LITERAL STRING & KOMENTAR (LEXICAL MASKING)
  // --------------------------------------------------------------------------
  const literalsPool: string[] = [];

  // Regex presisi untuk menangkap:
  // 1. Komentar satu baris (// ...)
  // 2. Komentar banyak baris (/* ... */)
  // 3. String tanda kutip ganda ("...", mendukung escape karakter)
  // 4. String tanda kutip tunggal ('...', mendukung escape karakter)
  // 5. Template literal backtick (`...`, mendukung escape karakter)
  const LITERAL_PRESERVER_REGEX = /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g;

  const maskedCode = wibuCode.replace(LITERAL_PRESERVER_REGEX, (match) => {
    const placeholder = `__WIBU_LITERAL_${literalsPool.length}__`;
    literalsPool.push(match);
    return placeholder;
  });

  let output = maskedCode;

  // --------------------------------------------------------------------------
  // TAHAP 2: TRANSFORMASI KAMUS WIBU-DOM (WEB API & DOM MANIPULATION)
  // --------------------------------------------------------------------------

  // 1. culikId("id") -> document.getElementById("id")
  output = output.replace(/\bculikId\b/g, "document.getElementById");

  // 2. pantauSatu(".class") -> document.querySelector(".class")
  output = output.replace(/\bpantauSatu\b/g, "document.querySelector");

  // 3. bikinWujud("div") -> document.createElement("div")
  output = output.replace(/\bbikinWujud\b/g, "document.createElement");

  // 4. isiHati -> innerHTML (elemen.isiHati = "..." -> elemen.innerHTML = "...")
  output = output.replace(/\bisiHati\b/g, "innerHTML");

  // 5. kaloDisentuh("click", fungsi) -> addEventListener("click", fungsi)
  output = output.replace(/\bkaloDisentuh\b/g, "addEventListener");

  // 6. masukinKeDunia(elemen) -> document.body.appendChild(elemen)
  //    wadah.masukinKeDunia(elemen) -> wadah.appendChild(elemen)
  //    Dukungan tingkat lanjut: menggantikan metode dan pemanggilan fungsi global
  //    secara presisi tanpa terpotong oleh tanda kurung bersarang
  output = output.replace(/\.masukinKeDunia\b/g, ".appendChild");
  output = output.replace(/\bmasukinKeDunia\b/g, "document.body.appendChild");

  // 7. gantiBaju -> className (elemen.gantiBaju = "..." -> elemen.className = "...")
  output = output.replace(/\bgantiBaju\b/g, "className");

  // 8. pindahIsekai("url") -> window.location.href = "url"
  //    Mendukung argumen ekspresi bersarang dengan pelacakan tanda kurung seimbang (balanced parentheses)
  let pindahIdx = 0;
  while ((pindahIdx = output.indexOf("pindahIsekai", pindahIdx)) !== -1) {
    if (pindahIdx > 0 && /[a-zA-Z0-9_$]/.test(output[pindahIdx - 1]!)) {
      pindahIdx += "pindahIsekai".length;
      continue;
    }
    const afterKeyword = output.slice(pindahIdx + "pindahIsekai".length);
    const matchOpen = afterKeyword.match(/^\s*\(/);
    if (matchOpen) {
      const openParen = pindahIdx + "pindahIsekai".length + (matchOpen[0].length - 1);
      let depth = 0;
      let closeParen = -1;
      for (let i = openParen; i < output.length; i++) {
        if (output[i] === "(") depth++;
        else if (output[i] === ")") {
          depth--;
          if (depth === 0) {
            closeParen = i;
            break;
          }
        }
      }
      if (closeParen !== -1) {
        const innerArgs = output.slice(openParen + 1, closeParen).trim();
        const replacement = `window.location.href = ${innerArgs}`;
        output = output.slice(0, pindahIdx) + replacement + output.slice(closeParen + 1);
        pindahIdx += replacement.length;
        continue;
      }
    }
    pindahIdx += "pindahIsekai".length;
  }

  // 9. peringatanSepuh("teks") -> alert("teks")
  output = output.replace(/\bperingatanSepuh\b/g, "alert");

  // 10. tungguBentar(fungsi, waktu) -> setTimeout(fungsi, waktu)
  output = output.replace(/\btungguBentar\b/g, "setTimeout");

  // 11. loopingMaut(fungsi, waktu) -> setInterval(fungsi, waktu)
  output = output.replace(/\bloopingMaut\b/g, "setInterval");

  // --------------------------------------------------------------------------
  // TAHAP 3: TRANSFORMASI SINTAKS DASAR (CORE LANGUAGE KEYWORDS)
  // --------------------------------------------------------------------------
  output = output.replace(/\bhargaMati\b/g, "const");
  output = output.replace(/\bsiImut\b/g, "let");
  output = output.replace(/\bkaloGakGitu\b/g, "else if");
  output = output.replace(/\byaudahlahYa\b/g, "else");
  output = output.replace(/\bwhenYh\b/g, "if");
  output = output.replace(/\bmybini\b/g, "function");
  output = output.replace(/\bkasihPaham\b/g, "return");
  output = output.replace(/\bmenyalaAbkuh\b/g, "true");
  output = output.replace(/\bmaafLancang\b/g, "false");
  output = output.replace(/\bteriakAmba\b/g, "console.log");

  // --------------------------------------------------------------------------
  // TAHAP 4: RESTORASI LITERAL STRING & KOMENTAR
  // --------------------------------------------------------------------------
  output = output.replace(/__WIBU_LITERAL_(\d+)__/g, (_, index) => {
    return literalsPool[Number(index)] ?? _;
  });

  // --------------------------------------------------------------------------
  // TAHAP 5: OPSIONAL PEMBUNGKUS EKSEKUSI BROWSER
  // --------------------------------------------------------------------------
  if (options.waitForDOM) {
    output = `document.addEventListener("DOMContentLoaded", () => {\n${indent(output, 2)}\n});`;
  }

  if (options.wrapInIIFE) {
    output = `(() => {\n${indent(output, 2)}\n})();`;
  }

  return output;
}

/**
 * Fungsi bantuan indentasi string kode sumber
 */
function indent(code: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return code
    .split("\n")
    .map((line) => (line.trim() ? `${pad}${line}` : line))
    .join("\n");
}

/**
 * Menghasilkan dokumen HTML lengkap yang menyertakan runtime transpiler
 * dan menjalankan kode WibuScript secara otomatis di browser.
 */
export function generateBrowserHTML(
  wibuCode: string,
  options: { title?: string; extraHtml?: string } = {}
): string {
  const title = options.title || "WibuScript Frontend Application";
  const extraHtml = options.extraHtml || '<div id="app"></div>';
  const compiledJS = transpile(wibuCode, { wrapInIIFE: true, waitForDOM: true });

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; }
    .card { background: #1e293b; border-radius: 8px; padding: 1.5rem; margin-top: 1rem; border: 1px solid #334155; }
    .btn { background: #ff79c6; color: #1e1e2e; font-weight: bold; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; }
    .btn:hover { background: #bd93f9; }
  </style>
</head>
<body>
  ${extraHtml}

  <script type="text/javascript">
${compiledJS}
  </script>
</body>
</html>`;
}
