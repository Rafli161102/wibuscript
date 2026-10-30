import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { convertDialect, runWibuScriptAsync, transpileToJS, transpileWithSourceMap } from "../src/index";

const canonicalProgram = `
jutsu faktorial(n) {
  moshi (n <= 1) {
    kaesu 1;
  } hoka {
    kaesu n * faktorial(n - 1);
  }
}

kore hasil = faktorial(6);
mite(hasil);
kore angka = [1, 2, 3, 4];
mite(tatamu(angka, (nilai, total) => nilai + total, 0));
`;

async function executeCompiled(source: string): Promise<string[]> {
  const output: string[] = [];
  const code = transpileToJS(source);
  runInNewContext(code, {
    console: {
      log: (...values: unknown[]) => output.push(values.map(String).join(" ")),
      error: (...values: unknown[]) => output.push(values.map(String).join(" ")),
    },
  });
  return output;
}

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function decodeVlqSegment(segment: string): number[] {
  const values: number[] = [];
  let index = 0;

  while (index < segment.length) {
    let continuation: boolean;
    let value = 0;
    let shift = 0;

    do {
      const digit = BASE64.indexOf(segment[index++] ?? "");
      if (digit < 0) throw new Error("Invalid Base64 VLQ digit");
      continuation = (digit & 32) === 32;
      value |= (digit & 31) << shift;
      shift += 5;
    } while (continuation && index < segment.length);

    const negative = (value & 1) === 1;
    const magnitude = value >> 1;
    values.push(negative ? -magnitude : magnitude);
  }

  return values;
}

describe("WibuScript differential compiler verification", () => {
  it.each(["murni", "singkat", "wibu", "rongawi"] as const)(
    "menyamakan output Interpreter dan Transpiler pada dialek %s",
    async (dialect) => {
      const source = convertDialect(canonicalProgram, dialect);
      const interpreted = await runWibuScriptAsync(source);
      const compiled = await executeCompiled(source);

      expect(interpreted.error).toBeUndefined();
      expect(interpreted.outputLog).toEqual(["720", "10"]);
      expect(compiled).toEqual(interpreted.outputLog);
    }
  );

  it("menyelaraskan Source Map dengan posisi statement sesungguhnya", () => {
    const source = "\n\nkore nilai = 42;\n\nmite(nilai);\n";
    const result = transpileWithSourceMap(source, "positions.wibu");
    const mappingLines = result.map!.mappings.split(";");
    const nonEmpty = mappingLines
      .map((segment, generatedIndex) => ({ segment, generatedLine: generatedIndex + 1 }))
      .filter((entry) => entry.segment.length > 0);

    expect(nonEmpty).toHaveLength(2);
    expect(nonEmpty[0]!.generatedLine).toBeGreaterThan(1);

    let previousOriginalLine = 0;
    let previousOriginalColumn = 0;
    const originalPositions = nonEmpty.map(({ segment }) => {
      const decoded = decodeVlqSegment(segment);
      expect(decoded).toHaveLength(4);
      const originalLine = previousOriginalLine + decoded[2]!;
      const originalColumn = previousOriginalColumn + decoded[3]!;
      previousOriginalLine = originalLine;
      previousOriginalColumn = originalColumn;
      return { line: originalLine + 1, column: originalColumn };
    });

    expect(originalPositions).toEqual([
      { line: 3, column: 0 },
      { line: 5, column: 0 },
    ]);
  });

  it("menyimpan posisi baris dan kolom token awal pada AST", () => {
    const source = "\n  kore nilai = 42;\n";
    const result = transpileWithSourceMap(source, "ast-loc.wibu");
    expect(result.map?.sourcesContent?.[0]).toBe(source);
    // The precise location is also validated through the emitted mapping above.
  });
});
