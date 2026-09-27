// File: src/lexer.ts
// ============================================================================
// WIBUSCRIPT LEXER (TOKENIZER)
// Mengubah teks kode sumber WibuScript menjadi aliran token terstruktur.
// Mengadopsi Sistem 4 Dialek Mutlak:
// 1. Jepang Murni
// 2. Jepang Singkat
// 3. Wibu Absurd
// 4. Meme Rongawi
// ============================================================================

export enum TokenType {
    // Keywords Dasar (4 Dialek Mutlak)
    Var,
    Let = Var,
    Const = Var,
    Print,
    If,
    Else,
    ElseIf = Else,
    True,
    False,
    Null,
    Loop,
    While = Loop,
    Break,
    Continue,
    Function,
    Return,
    Await,

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
    Dot,            // .
    Colon,          // :

    // Akhir Berkas
    EOF             // End of File
}

export interface Token {
    value: string;
    type: TokenType;
    line: number;
    column: number;
}

// Sistem 4 Dialek Mutlak WibuScript
// Memetakan kosakata 4 dialek (Jepang Murni, Jepang Singkat, Wibu Absurd, Meme Rongawi) ke TokenType internal
export const KEYWORDS: Record<string, TokenType> = {
    // Variabel (LET)
    "kore": TokenType.Var,
    "ko": TokenType.Var,
    "siImut": TokenType.Var,
    "pokmipokmi": TokenType.Var,

    // Tetapan (CONST)
    "zettai": TokenType.Const,
    "ze": TokenType.Const,
    "hargaMati": TokenType.Const,
    "bundarahma": TokenType.Const,

    // Kosong (NULL)
    "munashi": TokenType.Null,
    "mu": TokenType.Null,
    "maafLancang": TokenType.Null,
    "blukutuk": TokenType.Null,

    // Benar (TRUE)
    "hontou": TokenType.True,
    "hon": TokenType.True,
    "menyalaAbkuh": TokenType.True,
    "unjukkebolehan": TokenType.True,

    // Salah (FALSE) - 'uso' dipakai ganda untuk Jepang Murni dan Singkat
    "uso": TokenType.False,
    "ladehBanh": TokenType.False,
    "keracunanmbg": TokenType.False,

    // Jika (IF)
    "moshi": TokenType.If,
    "mo": TokenType.If,
    "whenYh": TokenType.If,
    "izintampil": TokenType.If,

    // Selain Jika (ELSE IF)
    "soretomo": TokenType.ElseIf,
    "sore": TokenType.ElseIf,
    "kaloGakGitu": TokenType.ElseIf,
    "wowok": TokenType.ElseIf,

    // Selainnya (ELSE)
    "hoka": TokenType.Else,
    "ho": TokenType.Else,
    "yaudahlahYa": TokenType.Else,
    "woijawa": TokenType.Else,

    // Perulangan (WHILE)
    "zutto": TokenType.Loop,
    "zu": TokenType.Loop,
    "gasSampePagi": TokenType.Loop,
    "nyawit": TokenType.Loop,

    // Berhenti (BREAK)
    "yame": TokenType.Break,
    "ya": TokenType.Break,
    "ampunSepuh": TokenType.Break,
    "bijisatu": TokenType.Break,

    // Lanjut (CONTINUE)
    "tsugi": TokenType.Continue,
    "tsu": TokenType.Continue,
    "lanjutPart2": TokenType.Continue,
    "ambatukam": TokenType.Continue,

    // Fungsi (FUNCTION)
    "jutsu": TokenType.Function,
    "ju": TokenType.Function,
    "mybini": TokenType.Function,
    "fufufafa": TokenType.Function,

    // Kembalikan (RETURN)
    "kaesu": TokenType.Return,
    "kae": TokenType.Return,
    "kasihPaham": TokenType.Return,
    "kandabahlil": TokenType.Return,

    // Tampilkan (PRINT)
    "mite": TokenType.Print,
    "mi": TokenType.Print,
    "teriakAmba": TokenType.Print,
    "salamkenal": TokenType.Print,

    // Tunggu (AWAIT)
    "matte": TokenType.Await,
    "mat": TokenType.Await,
    "sabarBanh": TokenType.Await,
    "admindatang": TokenType.Await,
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

        if (current === ".") {
            tokens.push({ type: TokenType.Dot, value: src.shift() as string, line: currentLine, column: currentCol });
            column++;
            continue;
        }

        if (current === ":") {
            tokens.push({ type: TokenType.Colon, value: src.shift() as string, line: currentLine, column: currentCol });
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