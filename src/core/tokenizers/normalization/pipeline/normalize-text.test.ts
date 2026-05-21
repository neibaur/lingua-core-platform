import { describe, expect, it } from "vitest";

import { DictionaryTokenizerDriver } from "../../drivers/dictionary";
import { tokenizeText } from "../../pipeline/tokenize-text";
import type { NormalizationRule } from "../shared/normalization-rule";
import { normalizeText } from "./normalize-text";

describe("normalizeText", () => {
  it("preserves identity text with one-to-one index mapping", () => {
    const result = normalizeText("กินข้าว test 123");

    expect(result).toEqual({
      originalText: "กินข้าว test 123",
      normalizedText: "กินข้าว test 123",
      indexMap: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      appliedRules: [],
    });
  });

  it("normalizes Thai numerals to ASCII digits without shifting offsets", () => {
    const result = normalizeText("ปี ๒๕๖๗");

    expect(result.normalizedText).toBe("ปี 2567");
    expect(result.indexMap).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(result.appliedRules).toEqual(["thai-digit-normalization"]);
  });

  it("collapses duplicate whitespace to the first retained source index", () => {
    const result = normalizeText("กิน   ข้าว");

    expect(result.normalizedText).toBe("กิน ข้าว");
    expect(result.indexMap).toEqual([0, 1, 2, 3, 6, 7, 8, 9]);
    expect(result.indexMap[3]).toBe(3);
    expect(result.appliedRules).toEqual(["collapse-whitespace"]);
  });

  it("trims boundary whitespace while preserving retained source indices", () => {
    const result = normalizeText("  กิน  ");

    expect(result.normalizedText).toBe("กิน");
    expect(result.indexMap).toEqual([2, 3, 4]);
    expect(result.appliedRules).toEqual([
      "collapse-whitespace",
      "trim-boundary-whitespace",
    ]);
  });

  it("keeps mixed Thai, English, and numeric strings aligned", () => {
    const result = normalizeText("\tกิน  ๑๒ apples\n");

    expect(result.normalizedText).toBe("กิน 12 apples");
    expect(result.indexMap).toEqual([
      1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    ]);
    expect(result.appliedRules).toEqual([
      "thai-digit-normalization",
      "collapse-whitespace",
      "trim-boundary-whitespace",
    ]);
  });

  it("preserves normalized-to-original mappings after multiple rule passes", () => {
    const result = normalizeText("  ๑  กิน\t\tข้าว  ");

    expect(result.normalizedText).toBe("1 กิน ข้าว");
    expect(result.indexMap).toEqual([2, 3, 5, 6, 7, 8, 10, 11, 12, 13]);
    expect(result.normalizedText[result.indexMap.indexOf(8)]).toBe(" ");
    expect(result.indexMap[5]).toBe(8);
  });

  it("applies rules in the supplied order", () => {
    const appendRule: NormalizationRule = {
      id: "append",
      apply(input) {
        return {
          text: `${input.text}!`,
          indexMap: [...input.indexMap, input.indexMap.at(-1) ?? 0],
        };
      },
    };
    const prefixRule: NormalizationRule = {
      id: "prefix",
      apply(input) {
        return {
          text: `>${input.text}`,
          indexMap: [input.indexMap[0] ?? 0, ...input.indexMap],
        };
      },
    };

    const result = normalizeText("กิน", [appendRule, prefixRule]);

    expect(result.normalizedText).toBe(">กิน!");
    expect(result.indexMap).toEqual([0, 0, 1, 2, 2]);
    expect(result.appliedRules).toEqual(["append", "prefix"]);
  });

  it("returns an empty result for empty input", () => {
    expect(normalizeText("")).toEqual({
      originalText: "",
      normalizedText: "",
      indexMap: [],
      appliedRules: [],
    });
  });

  it("passes normalized text into the tokenizer pipeline deterministically", async () => {
    const normalized = normalizeText("  กินข้าวหรือยัง  ");
    const driver = new DictionaryTokenizerDriver();

    const result = await tokenizeText(driver, normalized.normalizedText);

    expect(normalized.normalizedText).toBe("กินข้าวหรือยัง");
    expect(result.tokens).toEqual([
      { surface: "กิน", startOffset: 0, endOffset: 3 },
      { surface: "ข้าว", startOffset: 3, endOffset: 7 },
      { surface: "หรือยัง", startOffset: 7, endOffset: 14 },
    ]);
  });
});
