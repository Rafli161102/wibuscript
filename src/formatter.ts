/**
 * Conservative WibuScript formatter.
 * The first release normalizes indentation only and preserves all non-leading
 * source text, including dialect spelling, comments, and string literals.
 */
export interface FormatOptions {
  indentSize?: number;
  indentStyle?: "spaces" | "tabs";
}

interface ScanState {
  blockComment: boolean;
  quote: "'" | '"' | "\`" | null;
  escaped: boolean;
}

function scanLine(line: string, state: ScanState): number {
  let delta = 0;
  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    const next = line[i + 1];
    if (state.quote) {
      if (state.escaped) state.escaped = false;
      else if (char === "\\") state.escaped = true;
      else if ((state.quote === "single" && char === "'") || (state.quote === "double" && char === '"') || (state.quote === "template" && char === "`")) state.quote = null;
      continue;
    }
    if (state.blockComment) {
      if (char === "*" && next === "/") {
        state.blockComment = false;
        i++;
      }
      continue;
    }
    if (char === "/" && next === "/") break;
    if (char === "/" && next === "*") {
      state.blockComment = true;
      i++;
      continue;
    }
    if (char === "'" || char === '"' || char === "\`") {
      state.quote = char === "'" ? "single" : char === '"' ? "double" : "template";
      continue;
    }
    if (char === "{") delta++;
    else if (char === "}") delta--;
  }
  return delta;
}

function leadingClosingBraces(line: string): number {
  let rest = line.trimStart();
  let count = 0;
  while (rest.startsWith("}")) {
    count++;
    rest = rest.slice(1).trimStart();
  }
  return count;
}

/**
 * Format WibuScript block indentation. Defaults to two spaces.
 * Lines inside multiline comments and template literals are preserved verbatim.
 */
export function formatSource(source: string, options: FormatOptions = {}): string {
  const indentSize = options.indentSize ?? 2;
  if (!Number.isInteger(indentSize) || indentSize < 0 || indentSize > 8) {
    throw new RangeError("indentSize harus berupa bilangan bulat antara 0 dan 8.");
  }
  const newline = source.includes("\r\n") ? "\r\n" : source.includes("\r") && !source.includes("\n") ? "\r" : "\n";
  const lines = source.split(/\r\n|\n|\r/);
  const state: ScanState = { blockComment: false, quote: null, escaped: false };
  let depth = 0;

  const result = lines.map((line) => {
    if (line.trim().length === 0) return "";
    const preserveIndent = state.blockComment || state.quote === "\`";
    const lineDepth = Math.max(0, depth - leadingClosingBraces(line));
    const formatted = preserveIndent
      ? line
      : indentUnit.repeat(lineDepth) + line.trimStart();
    depth = Math.max(0, depth + scanLine(line, state));
    return formatted;
  });
  return result.join(newline);
}
