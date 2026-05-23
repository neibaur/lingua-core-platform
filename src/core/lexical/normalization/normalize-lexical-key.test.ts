import { describe, expect, it } from "vitest";

import { normalizeLexicalKey } from "./normalize-lexical-key";

describe("normalizeLexicalKey", () => {
  it("returns the same string for input already in canonical form", () => {
    expect(normalizeLexicalKey("กินข้าว")).toBe("กินข้าว");
  });

  it("produces the same canonical key for NFC and NFD forms of the same Thai string", () => {
    const nfc = "กินข้าว".normalize("NFC");
    const nfd = "กินข้าว".normalize("NFD");

    // NFD form may differ from NFC in byte representation but must round-trip
    // to the same canonical key.
    expect(normalizeLexicalKey(nfc)).toBe(normalizeLexicalKey(nfd));
  });

  it("normalizes Thai digits to Arabic digits", () => {
    expect(normalizeLexicalKey("ปี๒๕")).toBe("ปี25");
  });

  it("applies NFC before digit normalization (rule ordering is stable)", () => {
    const withDigit = "ข้าว๑";
    expect(normalizeLexicalKey(withDigit)).toBe("ข้าว1");
  });

  it("returns NFC-normalized output for pure ASCII input", () => {
    expect(normalizeLexicalKey("hello")).toBe("hello");
  });

  it("throws on leading whitespace", () => {
    expect(() => normalizeLexicalKey(" กิน")).toThrow("[lexical invariant]");
  });

  it("throws on trailing whitespace", () => {
    expect(() => normalizeLexicalKey("กิน ")).toThrow("[lexical invariant]");
  });

  it("throws on interior whitespace", () => {
    expect(() => normalizeLexicalKey("กิน ข้าว")).toThrow(
      "[lexical invariant]",
    );
  });

  it("returns empty string for empty input", () => {
    expect(normalizeLexicalKey("")).toBe("");
  });

  it("produces identical output on repeated calls with the same input (determinism)", () => {
    const key = "ข้าว";
    expect(normalizeLexicalKey(key)).toBe(normalizeLexicalKey(key));
  });
});
