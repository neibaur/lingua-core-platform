import { describe, expect, it } from "vitest";

import { tokenizeText } from "../../pipeline/tokenize-text";
import { DictionaryTokenizerDriver } from "./dictionary-tokenizer-driver";

describe("DictionaryTokenizerDriver", () => {
  it("segments Thai text deterministically with the fixture dictionary", async () => {
    const driver = new DictionaryTokenizerDriver();

    const result = await driver.tokenize("กินข้าวหรือยัง");

    expect(driver.languageCode).toBe("th");
    expect(result.tokens.map((token) => token.surface)).toEqual([
      "กิน",
      "ข้าว",
      "หรือยัง",
    ]);
  });

  it("prefers the longest dictionary match at the current offset", async () => {
    const driver = new DictionaryTokenizerDriver();

    const result = await driver.tokenize("หรือยัง");

    expect(result.tokens).toEqual([
      { surface: "หรือยัง", startOffset: 0, endOffset: 7 },
    ]);
  });

  it("emits a single-character unknown token when no dictionary match exists", async () => {
    const driver = new DictionaryTokenizerDriver();

    const result = await driver.tokenize("กินxข้าว");

    expect(result.tokens).toEqual([
      { surface: "กิน", startOffset: 0, endOffset: 3 },
      { surface: "x", startOffset: 3, endOffset: 4 },
      { surface: "ข้าว", startOffset: 4, endOffset: 8 },
    ]);
  });

  it("preserves exact offsets for every emitted token", async () => {
    const driver = new DictionaryTokenizerDriver();

    const result = await driver.tokenize("กินข้าวหรือยัง");

    expect(result.tokens).toEqual([
      { surface: "กิน", startOffset: 0, endOffset: 3 },
      { surface: "ข้าว", startOffset: 3, endOffset: 7 },
      { surface: "หรือยัง", startOffset: 7, endOffset: 14 },
    ]);
  });

  it("returns an empty tokenization result for empty input", async () => {
    const driver = new DictionaryTokenizerDriver();

    await expect(driver.tokenize("")).resolves.toEqual({
      originalText: "",
      tokens: [],
      normalizedTokens: [],
    });
  });

  it("is compatible with the shared tokenizeText pipeline", async () => {
    const driver = new DictionaryTokenizerDriver();

    const result = await tokenizeText(driver, "กินข้าวหรือยัง");

    expect(result.originalText).toBe("กินข้าวหรือยัง");
    expect(result.normalizedTokens).toEqual([
      { original: "กิน", normalized: "กิน", romanized: "kin" },
      { original: "ข้าว", normalized: "ข้าว", romanized: "khao" },
      {
        original: "หรือยัง",
        normalized: "หรือยัง",
        romanized: "rue yang",
      },
    ]);
  });

  it("projects normalized and fixture-local romanized forms for search", async () => {
    const driver = new DictionaryTokenizerDriver();
    const result = await driver.tokenize("กินข้าวหรือยัง?");

    expect(driver.generateSearchIndex(result)).toEqual({
      surfaceForms: ["กิน", "ข้าว", "หรือยัง", "?"],
      normalizedForms: ["กิน", "ข้าว", "หรือยัง", "?"],
      romanizedForms: ["kin", "khao", "rue yang"],
    });
  });
});
