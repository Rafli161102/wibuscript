import { describe, expect, it } from "vitest";
import { analyzeSource } from "../src/analyzer";

describe("WibuScript semantic analysis", () => {
  it("reports unused variables without executing source", () => {
    expect(analyzeSource("kore nilai = 42;")).toContainEqual(expect.objectContaining({ code: "unused-variable", severity: "warning" }));
  });
  it("resolves local variables and function parameters", () => {
    const d = analyzeSource("jutsu jumlah(a, b) { kore hasil = a + b; kaesu hasil; } kore total = jumlah(2, 3); mite(total);");
    expect(d.filter(x => x.code === "undefined-name")).toEqual([]);
    expect(d.filter(x => x.code === "unused-variable")).toEqual([]);
  });
  it("reports duplicate declarations in the same scope", () => {
    expect(analyzeSource("kore angka = 1; kore angka = 2;").some(x => x.code === "duplicate-declaration" && x.severity === "error")).toBe(true);
  });
  it("reports unresolved names", () => {
    expect(analyzeSource("mite(tidakAda);").some(x => x.code === "undefined-name" && x.message.includes("tidakAda"))).toBe(true);
  });
  it("reports return and break outside valid contexts", () => {
    expect(analyzeSource("kaesu 1; yame;").filter(x => x.code === "control-flow-outside-context")).toHaveLength(2);
  });
  it("keeps foreach variables scoped to the loop", () => {
    const d = analyzeSource("subete (item no [1, 2]) { mite(item); } mite(item);");
    expect(d.filter(x => x.code === "undefined-name").some(x => x.message.includes("item"))).toBe(true);
  });
  it("does not flag standard library aliases", () => {
    const d = analyzeSource('kore teks = "hello"; mite(teks); kore n = suji("12"); mite(n);');
    expect(d.filter(x => x.code === "undefined-name")).toEqual([]);
  });
});
