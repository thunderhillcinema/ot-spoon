import { applyInstanceAccent, isValidAccent } from "./accent";

describe("isValidAccent", () => {
  it("accepts hex colors (3/6/8 digit)", () => {
    expect(isValidAccent("#F2690D")).toBe(true);
    expect(isValidAccent("#fff")).toBe(true);
    expect(isValidAccent("#11223344")).toBe(true);
  });

  it("accepts rgb/rgba/hsl/hsla functions", () => {
    expect(isValidAccent("rgb(242, 105, 13)")).toBe(true);
    expect(isValidAccent("rgba(242,105,13,0.5)")).toBe(true);
    expect(isValidAccent("hsl(24, 90%, 50%)")).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    expect(isValidAccent("  #F2690D  ")).toBe(true);
  });

  it("rejects empty, nullish, and garbage (PeerTube's field is admin-typed and often blank)", () => {
    expect(isValidAccent("")).toBe(false);
    expect(isValidAccent(undefined)).toBe(false);
    expect(isValidAccent(null)).toBe(false);
    expect(isValidAccent("not-a-color")).toBe(false);
    expect(isValidAccent("orange")).toBe(false); // named colors deliberately not trusted
  });
});

describe("applyInstanceAccent", () => {
  const base = { dark: true, colors: { theme500: "#D97706", theme600: "#F59E0B", background: "#0B0D0E" } };

  it("overrides ONLY theme500 with a valid instance color, leaving the rest untouched", () => {
    const out = applyInstanceAccent(base, "#F2690D");
    expect(out.colors.theme500).toBe("#F2690D");
    expect(out.colors.theme600).toBe("#F59E0B");
    expect(out.colors.background).toBe("#0B0D0E");
    expect(out.dark).toBe(true);
  });

  it("trims the accent value", () => {
    expect(applyInstanceAccent(base, "  #F2690D ").colors.theme500).toBe("#F2690D");
  });

  it("returns the base theme UNCHANGED (same reference) when the color is absent/invalid", () => {
    expect(applyInstanceAccent(base, "")).toBe(base);
    expect(applyInstanceAccent(base, undefined)).toBe(base);
    expect(applyInstanceAccent(base, "garbage")).toBe(base);
  });
});
