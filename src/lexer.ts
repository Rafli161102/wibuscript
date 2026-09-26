// ============================================================================
// WIBUSCRIPT LEXER (TOKENIZER)
// Mengubah teks kode sumber WibuScript menjadi aliran token terstruktur.
// Mendukung Sistem Alias (Versi Ekstensi Indo-Jepang dan Shorthand Romaji Murni)
// serta operator perbandingan ganda (==, !=, <=, >=).
// ============================================================================

export enum TokenType {
    // Keywords Dasar (Sistem Alias)
    Var,
    Print,
    If,
    Else,
    True,
    False,
    Null,
    Loop,
    Function,
    Return,

    // Tipe Data & Identifier
    Identifier,
    Number,
    String,

    // Operator Penugasan & Perbandingan
    Equals,         // =
    DoubleEquals,   // ==
    NotEquals,      // !=
    LessThan,       // <
    LessEquals,     // <=
    GreaterThan,    // >
    GreaterEquals,  // >=

    // Operator Aritmatika
    Plus,           // +
    Minus,          // -
    Multiply,       // *
    Divide,         // /

    // Simbol & Delimiter
    OpenParen,      // (
    CloseParen,     // )
    OpenBrace,      // {
    CloseBrace,     // }
    Comma,          // ,
    Semicolon,      // ;

    // Akhir Berkas
    EOF             // End of File
}

export interface Token {
    value: string;
    type: TokenType;
    line: number;
    column: number;
}

// Sistem Alias WibuScript (Memetakan versi panjang & shorthand ke TokenType yang sama)
export const KEYWORDS: Record<string, TokenType> = {
    // Variabel
    "koreWa": TokenType.Var,
    "kore": TokenType.Var,

    // Output Standar
    "kasihMite": TokenType.Print,
    "mite": TokenType.Print,

    // Percabangan
    "kaloMoshi": TokenType.If,
    "moshi": TokenType.If,

    "chigauDong": TokenType.Else,
    "chigau": TokenType.Else,

    // Boolean Literals
    "majiBener": TokenType.True,
    "maji": TokenType.True,

    "usoBanget": TokenType.False,
    "uso": TokenType.False,

    // Null Literal
    "kosongZannen": TokenType.Null,
    "kara": TokenType.Null,

    // Perulangan
    "ulangZutto": TokenType.Loop,
    "zutto": TokenType.Loop,

    // Fungsi
    "bikinJutsu": TokenType.Function,
    "jutsu": TokenType.Function,

    // Pengembalian Nilai (Return)
    "balikinDesu": TokenType.Return,
    "kaesu": TokenType.Return,
};

/**
 * Mengubah kode sumber mentah menjadi array Token WibuScript.
 */
export function tokenize(sourceCode: string): Token[] {
    const tokens: Token[] = [];
    const src: string[] = sourceCode.split("");

    let line = 1;
    let column = 1;

    const isAlpha = (char: string): boolean => /^[a-zA-Z_]$/.test(char);
    const isInt = (char: string): boolean => /^[0-9]$/.test(char);
    const isSkippable = (char: string): boolean => char === " " || char === "\n" || char === "\t" || char === "\r";

    while (src.length > 0) {
        const current = src[0] as string;
        const currentLine = line;
        const currentCol = column;

        // 1. Abaikan Whitespace (Spasi, Tab, Enter)
        if (isSkippable(current)) {
            const char = src.shift() as string;
            if (char === "\n") {
                line++;
                column = 1;
            } else {
                column++;
            }
            continue;
        }

        // 2. Pembagian dan Komentar
        if (current === "/") {
            if (src[1] === "/") {
                // Komentar satu baris
                src.shift() as string; // '/'
                src.shift() as string; // '/'
                column += 2;
                while (src.length > 0 && src[0] !== "\n") {
                    src.shift() as string;
                    column++;
                }
                continue;
            }

            if (src[1] === "*") {
                // Komentar multi-baris
                src.shift() as string; // '/'
                src.shift() as string; // '*'
                column += 2;
                while (src.length > 0) {
                    const c = src.shift() as string;
                    if (c === "\n") {
                        line++;
                        column = 1;
                    } else if (c === "*" && src[0] === "/") {
                        src.shift() as string; // '/'
                        column++;
                        break;
                    } else {
                        column++;
                    }
                }
                continue;
            }

            // Operator Bagi '/'
            tokens.push({ type: TokenType.Divide, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        // 3. Operator Perbandingan Ganda & Penugasan (==, !=, <=, >=, =, <, >)
        if (current === "=") {
            src.shift() as string;
            column++;
            if (src.length > 0 && src[0] === "=") {
                src.shift() as string;
                column++;
                tokens.push({ type: TokenType.DoubleEquals, value: "==", line: currentLine, column: currentCol });
            } else {
                tokens.push({ type: TokenType.Equals, value: "=", line: currentLine, column: currentCol });
            }
            continue;
        }

        if (current === "!") {
            src.shift() as string;
            column++;
            if (src.length > 0 && src[0] === "=") {
                src.shift() as string;
                column++;
                tokens.push({ type: TokenType.NotEquals, value: "!=", line: currentLine, column: currentCol });
            } else {
                throw new Error(`[Lexer Error] Karakter '!' tunggal tidak didukung pada baris ${currentLine}, kolom ${currentCol}. Gunakan '!='.`);
            }
            continue;
        }

        if (current === "<") {
            src.shift() as string;
            column++;
            if (src.length > 0 && src[0] === "=") {
                src.shift() as string;
                column++;
                tokens.push({ type: TokenType.LessEquals, value: "<=", line: currentLine, column: currentCol });
            } else {
                tokens.push({ type: TokenType.LessThan, value: "<", line: currentLine, column: currentCol });
            }
            continue;
        }

        if (current === ">") {
            src.shift() as string;
            column++;
            if (src.length > 0 && src[0] === "=") {
                src.shift() as string;
                column++;
                tokens.push({ type: TokenType.GreaterEquals, value: ">=", line: currentLine, column: currentCol });
            } else {
                tokens.push({ type: TokenType.GreaterThan, value: ">", line: currentLine, column: currentCol });
            }
            continue;
        }

        // 4. Operator Aritmatika (+, -, *, /)
        if (current === "+") {
            tokens.push({ type: TokenType.Plus, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        if (current === "-") {
            tokens.push({ type: TokenType.Minus, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        if (current === "*") {
            tokens.push({ type: TokenType.Multiply, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        // 5. Simbol dan Delimiter
        if (current === "(") {
            tokens.push({ type: TokenType.OpenParen, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        if (current === ")") {
            tokens.push({ type: TokenType.CloseParen, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        if (current === "{") {
            tokens.push({ type: TokenType.OpenBrace, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        if (current === "}") {
            tokens.push({ type: TokenType.CloseBrace, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        if (current === ",") {
            tokens.push({ type: TokenType.Comma, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        if (current === ";") {
            tokens.push({ type: TokenType.Semicolon, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        // 6. Deteksi Literal String ("..." atau '...')
        if (current === '"' || current === "'") {
            const quoteType = src.shift() as string;
            column++;
            let str = "";

            while (src.length > 0 && src[0] !== quoteType) {
                if (src[0] === "\n") {
                    line++;
                    column = 1;
                    str += src.shift() as string;
                } else if (src[0] === "\\") {
                    src.shift() as string; // Lewati backslash
                    column++;
                    if (src.length === 0) break;
                    const esc = src.shift() as string;
                    column++;
                    if (esc === "n") str += "\n";
                    else if (esc === "t") str += "\t";
                    else if (esc === "r") str += "\r";
                    else if (esc === "\\") str += "\\";
                    else if (esc === '"') str += '"';
                    else if (esc === "'") str += "'";
                    else str += esc;
                } else {
                    str += src.shift() as string;
                    column++;
                }
            }

            if (src.length === 0) {
                throw new Error(`[Lexer Error] Literal string belum ditutup sebelum akhir berkas pada baris ${currentLine}, kolom ${currentCol}.`);
            }

            src.shift() as string; // Buang tanda kutip penutup
            column++;
            tokens.push({ type: TokenType.String, value: str, line: currentLine, column: currentCol });
            continue;
        }

        // 7. Deteksi Literal Numerik (Integer & Desimal)
        if (isInt(current)) {
            let num = "";
            while (src.length > 0 && isInt(src[0]!)) {
                num += src.shift() as string;
                column++;
            }

            if (src[0] === "." && src.length > 1 && isInt(src[1]!)) {
                num += src.shift() as string; // tanda titik '.'
                column++;
                while (src.length > 0 && isInt(src[0]!)) {
                    num += src.shift() as string;
                    column++;
                }
            }

            tokens.push({ type: TokenType.Number, value: num, line: currentLine, column: currentCol });
            continue;
        }

        // 8. Deteksi Kata (Identifier atau Kata Kunci)
        if (isAlpha(current)) {
            let ident = "";
            while (src.length > 0 && (isAlpha(src[0]!) || isInt(src[0]!))) {
                ident += src.shift() as string;
                column++;
            }

            const reserved = KEYWORDS[ident];
            if (typeof reserved === "number") {
                tokens.push({ type: reserved, value: ident, line: currentLine, column: currentCol });
            } else {
                tokens.push({ type: TokenType.Identifier, value: ident, line: currentLine, column: currentCol });
            }
            continue;
        }

        // Karakter Tidak Dikenali
        const badChar = src.shift() as string;
        throw new Error(`[Lexer Error] Karakter tidak dikenali: '${badChar}' pada baris ${currentLine}, kolom ${currentCol}.`);
    }

    tokens.push({
        type: TokenType.EOF,
        value: "EndOfFile",
        line,
        column,
    });

    return tokens;
}

// ============================================================================
// AREA UJI COBA (Jalankan file ini untuk mengetes)
// ============================================================================
const kodeUjiCoba = `
  kore mc = "Aria"
  moshi (mc == "Aria") {
      mite(mc)
  }
`;

if (typeof process !== "undefined" && process.argv && (process.argv[1]?.endsWith("lexer.ts") || process.argv[1]?.endsWith("lexer.js"))) {
    console.log("[WibuScript Lexer] Membaca kode pengujian...");
    for (const token of tokenize(kodeUjiCoba)) {
        console.log(token);
    }
}