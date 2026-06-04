import { describe, expect, it } from "vitest";

import { canonicalizeEnglishKey } from "./canonicalize-english-key";

describe("canonicalizeEnglishKey", () => {
  it("returns the same string for input already in canonical form", () => {
    expect(canonicalizeEnglishKey("to eat")).toBe("to eat");
  });

  it("lower-cases the phrase", () => {
    expect(canonicalizeEnglishKey("To Eat")).toBe("to eat");
  });

  it("collapses internal whitespace runs to a single space", () => {
    expect(canonicalizeEnglishKey("to   eat")).toBe("to eat");
  });

  it("trims boundary whitespace", () => {
    expect(canonicalizeEnglishKey("  to eat ")).toBe("to eat");
  });

  it("collapses, trims, and lower-cases irregular whitespace together", () => {
    expect(canonicalizeEnglishKey("  To   Eat ")).toBe("to eat");
  });

  it("returns a single-word key unchanged", () => {
    expect(canonicalizeEnglishKey("rice")).toBe("rice");
  });

  it("returns empty string for empty input", () => {
    expect(canonicalizeEnglishKey("")).toBe("");
  });

  it("produces identical output on repeated calls with the same input (determinism)", () => {
    const phrase = "  to   eat ";
    expect(canonicalizeEnglishKey(phrase)).toBe(canonicalizeEnglishKey(phrase));
  });
});
