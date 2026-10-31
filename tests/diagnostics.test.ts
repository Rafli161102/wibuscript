import { describe, expect, it } from "vitest";
import { validateSource } from "../src/diagnostics";

describe("WibuScript syntax diagnostics", () => {
  it("accepts valid source without executing it", () => {
    expect(validateSource('kore nilai = 42; mite(nilai);')).toEqual([]);
  });

  it("reports lexer errors with source coordinates and a useful suggestion", () => {
    const [diagnostic] = validateSource("kore angka = 10 @ 20;");
    expect(diagnostic).toMatchObject({ phase: "Lexer", line: 1, column: 17, sourceLine: "kore angka = 10 @ 20;" });
    expect(diagnostic?.suggestion).toContain("Periksa kembali operator");
  });

  it("reports parser errors with a caret location", () => {
    const [diagnostic] = validateSource("kore angka = ;");
    expect(diagnostic).toMatchObject({ phase: "Parser", line: 1, column: 14 });
    expect(diagnostic?.message.length).toBeGreaterThan(0);
  });

  it("returns a structured diagnostic for unterminated strings", () => {
    const [diagnostic] = validateSource('kore teks = "belum selesai;');
    expect(diagnostic?.phase).toBe("Lexer");
    expect(diagnostic?.suggestion).toContain("tanda pembuka dan penutup");
  });
});
