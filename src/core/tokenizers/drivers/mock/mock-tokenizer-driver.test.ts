import { describe, expect, it } from "vitest";

import { MockTokenizerDriver } from "./mock-tokenizer-driver";

describe("MockTokenizerDriver", () => {
  it("returns stable tokens with precise offsets relative to the original text", async () => {
    const driver = new MockTokenizerDriver();

    const result = await driver.tokenize("กิน ข้าว test");

    expect(driver.languageCode).toBe("th");
    expect(result).toMatchObject({
      originalText: "กิน ข้าว test",
      tokens: [
        { surface: "กิน", startOffset: 0, endOffset: 3 },
        { surface: "ข้าว", startOffset: 4, endOffset: 8 },
        { surface: "test", startOffset: 9, endOffset: 13 },
      ],
    });
  });

  it("preserves offsets when the source text contains repeated space gaps", async () => {
    const driver = new MockTokenizerDriver();

    const result = await driver.tokenize("กิน  ข้าว   test");

    expect(result.tokens).toEqual([
      { surface: "กิน", startOffset: 0, endOffset: 3 },
      { surface: "ข้าว", startOffset: 5, endOffset: 9 },
      { surface: "test", startOffset: 12, endOffset: 16 },
    ]);
  });

  it("lowercases Latin characters during normalization", () => {
    const driver = new MockTokenizerDriver();

    expect(driver.normalizeToken("Test")).toEqual({
      original: "Test",
      normalized: "test",
    });
  });

  it("produces deterministic search projection arrays", async () => {
    const driver = new MockTokenizerDriver({
      romanizationByToken: {
        กิน: "kin",
        ข้าว: "khao",
      },
    });
    const result = await driver.tokenize("กิน ข้าว test");

    expect(driver.generateSearchIndex(result)).toEqual({
      surfaceForms: ["กิน", "ข้าว", "test"],
      normalizedForms: ["กิน", "ข้าว", "test"],
      romanizedForms: ["kin", "khao"],
    });
  });

  it("excludes undefined and empty romanized values from search projection", async () => {
    const driver = new MockTokenizerDriver({
      romanizationByToken: {
        กิน: "kin",
        ข้าว: "",
      },
    });
    const result = await driver.tokenize("กิน ข้าว test");

    expect(driver.generateSearchIndex(result).romanizedForms).toEqual(["kin"]);
  });
});
