import { describe, expect, it } from "vitest";
import { formatSource } from "../src/formatter";
import { validateSource } from "../src/diagnostics";

describe("WibuScript formatter", () => {
  it("normalizes block indentation without rewriting syntax", () => {
    const source = 'jutsu sapa(){\nmite("halo");\n}\n';
    expect(formatSource(source)).toBe('jutsu sapa(){\n  mite("halo");\n}\n');
  });

  it("is idempotent and keeps formatted code syntactically valid", () => {
    const source = "jutsu hitung(){\nkore angka=10;\nmoshi(angka>0){\nkaesu angka;\n}\n}\n";
    const once = formatSource(source);
    expect(formatSource(once)).toBe(once);
    expect(validateSource(once)).toEqual([]);
  });

  it("ignores braces in strings and line comments", () => {
    const source = 'jutsu tampil(){\n// } is only a comment\nmite("teks { literal }");\n}\n';
    expect(formatSource(source)).toBe('jutsu tampil(){\n  // } is only a comment\n  mite("teks { literal }");\n}\n');
  });

  it("preserves indentation inside multiline comments", () => {
    const source = "jutsu demo(){\n/* start\n    keep this } exactly\nend */\nmite(1);\n}\n";
    expect(formatSource(source)).toBe("jutsu demo(){\n  /* start\n    keep this } exactly\nend */\n  mite(1);\n}\n");
  });

  it("supports configurable indentation and rejects invalid sizes", () => {
    expect(formatSource("jutsu x(){\nmite(1);\n}", { indentSize: 4 })).toBe("jutsu x(){\n    mite(1);\n}");
    expect(() => formatSource("x", { indentSize: 9 })).toThrow(RangeError);
  });
});
