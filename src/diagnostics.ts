import { tokenize } from "./lexer";
import { Parser } from "./parser";

export interface WibuDiagnostic {
  phase: "Lexer" | "Parser";
  message: string;
  line: number;
  column: number;
  sourceLine: string;
  suggestion?: string;
}

function extractLocation(message: string): { line: number; column: number } {
  const match = message.match(/baris (\d+), kolom (\d+)/i);
  return match ? { line: Number(match[1]), column: Number(match[2]) } : { line: 1, column: 1 };
}

function suggest(message: string): string | undefined {
  if (/Karakter tidak dikenali/.test(message)) return "Periksa kembali operator atau karakter tersebut. WibuScript mendukung operator seperti +, -, *, /, %, ==, !=, <, >, &&, dan ||.";
  if (/belum ditutup/.test(message)) return "Pastikan tanda pembuka dan penutup komentar atau literal string berpasangan.";
  if (/Batas kedalaman penguraian terlampaui/.test(message)) return "Kurangi tingkat blok atau ekspresi yang bersarang.";
  if (/Ditemukan 'EndOfFile'/.test(message) || /akhir berkas/i.test(message)) return "Periksa apakah ekspresi, blok, atau pemanggilan fungsi sudah ditutup dengan delimiter yang sesuai.";
  return undefined;
}

/** Validates WibuScript syntax without executing the program. */
export function validateSource(source: string): WibuDiagnostic[] {
  try {
    new Parser().produceAST(tokenize(source));
    return [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const phase = message.startsWith("[Lexer Error]") ? "Lexer" : "Parser";
    const { line, column } = extractLocation(message);
    const diagnostic: WibuDiagnostic = {
      phase,
      message: message.replace(/^\[(?:Lexer|Parser) Error\]\s*/, ""),
      line,
      column,
      sourceLine: source.split(/\r?\n/)[line - 1] ?? "",
    };
    const suggestion = suggest(message);
    if (suggestion) diagnostic.suggestion = suggestion;
    return [diagnostic];
  }
}
