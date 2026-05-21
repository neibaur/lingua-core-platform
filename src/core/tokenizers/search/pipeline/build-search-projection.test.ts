import { describe, expect, it } from "vitest";

import { DictionaryTokenizerDriver } from "../../drivers/dictionary";
import { buildSearchProjection } from "./build-search-projection";
import { extractOriginalSpan } from "../utils/extract-original-span";
import { validateProjectionOffsets } from "../utils/validate-projection-offsets";

describe("buildSearchProjection", () => {
  it("projects Thai-only dictionary tokens with stable original offsets", async () => {
    const result = await buildSearchProjection(
      "กินข้าวหรือยัง",
      new DictionaryTokenizerDriver(),
    );

    expect(result.records).toEqual([
      {
        token: "กิน",
        normalizedStart: 0,
        normalizedEnd: 3,
        originalStart: 0,
        originalEnd: 3,
        tokenType: "term",
        position: 0,
      },
      {
        token: "ข้าว",
        normalizedStart: 3,
        normalizedEnd: 7,
        originalStart: 3,
        originalEnd: 7,
        tokenType: "term",
        position: 1,
      },
      {
        token: "หรือยัง",
        normalizedStart: 7,
        normalizedEnd: 14,
        originalStart: 7,
        originalEnd: 14,
        tokenType: "term",
        position: 2,
      },
    ]);
    expect(
      validateProjectionOffsets(
        result.records,
        result.normalizedText,
        result.normalization.indexMap,
      ),
    ).toEqual({ isValid: true, errors: [] });
  });

  it("keeps mixed Thai and English projection ordering deterministic", async () => {
    const result = await buildSearchProjection(
      "กิน rice",
      new DictionaryTokenizerDriver(),
    );

    expect(result.records.map((record) => record.token)).toEqual([
      "กิน",
      "r",
      "i",
      "c",
      "e",
    ]);
    expect(result.records.map((record) => record.position)).toEqual([
      0, 1, 2, 3, 4,
    ]);
    expect(result.records.map((record) => record.originalStart)).toEqual([
      0, 4, 5, 6, 7,
    ]);
  });

  it("projects Thai numerals through normalized Arabic digit records", async () => {
    const result = await buildSearchProjection(
      "ปี ๒๕๖๗",
      new DictionaryTokenizerDriver(),
    );

    expect(result.normalizedText).toBe("ปี 2567");
    expect(result.normalization.indexMap).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(result.records.map((record) => record.token)).toEqual([
      "ป",
      "ี",
      "2",
      "5",
      "6",
      "7",
    ]);
    expect(
      result.records.slice(2).map((record) => record.originalStart),
    ).toEqual([3, 4, 5, 6]);
    expect(
      result.records
        .slice(2)
        .map((record) => extractOriginalSpan(result.originalText, record)),
    ).toEqual(["๒", "๕", "๖", "๗"]);
  });

  it("collapses repeated whitespace without projecting whitespace records", async () => {
    const result = await buildSearchProjection(
      "กิน   ข้าว",
      new DictionaryTokenizerDriver(),
    );

    expect(result.normalizedText).toBe("กิน ข้าว");
    expect(result.normalization.indexMap).toEqual([0, 1, 2, 3, 6, 7, 8, 9]);
    expect(result.records).toEqual([
      {
        token: "กิน",
        normalizedStart: 0,
        normalizedEnd: 3,
        originalStart: 0,
        originalEnd: 3,
        tokenType: "term",
        position: 0,
      },
      {
        token: "ข้าว",
        normalizedStart: 4,
        normalizedEnd: 8,
        originalStart: 6,
        originalEnd: 10,
        tokenType: "term",
        position: 1,
      },
    ]);
  });

  it("preserves unknown-token fallback records and source spans", async () => {
    const result = await buildSearchProjection(
      "กิน?",
      new DictionaryTokenizerDriver(),
    );
    const unknownRecord = result.records[1];

    expect(unknownRecord).toEqual({
      token: "?",
      normalizedStart: 3,
      normalizedEnd: 4,
      originalStart: 3,
      originalEnd: 4,
      tokenType: "term",
      position: 1,
    });
    expect(extractOriginalSpan(result.originalText, unknownRecord)).toBe("?");
  });

  it("trims boundary whitespace while preserving original token spans", async () => {
    const result = await buildSearchProjection(
      "  กินข้าว  ",
      new DictionaryTokenizerDriver(),
    );

    expect(result.normalizedText).toBe("กินข้าว");
    expect(result.normalization.indexMap).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(
      result.records.map((record) =>
        extractOriginalSpan(result.originalText, record),
      ),
    ).toEqual(["กิน", "ข้าว"]);
    expect(result.records.map((record) => record.originalStart)).toEqual([
      2, 5,
    ]);
  });
});
