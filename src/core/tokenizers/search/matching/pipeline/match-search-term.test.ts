import { describe, expect, it } from "vitest";

import { DictionaryTokenizerDriver } from "../../../drivers/dictionary";
import type { SearchProjectionRecord } from "../../shared/search-projection-record";
import { buildSearchProjection } from "../../pipeline/build-search-projection";
import { extractMatchSpan } from "../utils/extract-match-span";
import { matchSearchTerm } from "./match-search-term";

describe("matchSearchTerm", () => {
  it("matches Thai-only tokens with source-coordinate traceability", async () => {
    const projection = await buildSearchProjection(
      "กินข้าวหรือยัง",
      new DictionaryTokenizerDriver(),
    );

    const matches = matchSearchTerm(projection.records, "ข้าว");

    expect(matches).toEqual([
      {
        matchedText: "ข้าว",
        normalizedStart: 3,
        normalizedEnd: 7,
        originalStart: 3,
        originalEnd: 7,
        tokenPositions: [1],
        matchedTokens: ["ข้าว"],
      },
    ]);
    expect(extractMatchSpan(projection.originalText, matches[0])).toBe("ข้าว");
  });

  it("matches mixed Thai and English phrases across normalized gaps", async () => {
    const projection = await buildSearchProjection(
      "กิน rice",
      new DictionaryTokenizerDriver(),
    );

    const matches = matchSearchTerm(projection.records, "กิน rice");

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      matchedText: "กิน rice",
      normalizedStart: 0,
      normalizedEnd: 8,
      originalStart: 0,
      originalEnd: 8,
      tokenPositions: [0, 1, 2, 3, 4],
      matchedTokens: ["กิน", "r", "i", "c", "e"],
    });
    expect(extractMatchSpan(projection.originalText, matches[0])).toBe(
      "กิน rice",
    );
  });

  it("matches Thai numeral queries against normalized Arabic digit projections", async () => {
    const projection = await buildSearchProjection(
      "ปี ๒๕๖๗",
      new DictionaryTokenizerDriver(),
    );

    const matches = matchSearchTerm(projection.records, "๒๕๖๗");

    expect(matches).toEqual([
      {
        matchedText: "2567",
        normalizedStart: 3,
        normalizedEnd: 7,
        originalStart: 3,
        originalEnd: 7,
        tokenPositions: [2, 3, 4, 5],
        matchedTokens: ["2", "5", "6", "7"],
      },
    ]);
    expect(extractMatchSpan(projection.originalText, matches[0])).toBe("๒๕๖๗");
  });

  it("normalizes repeated whitespace in queries before phrase matching", async () => {
    const projection = await buildSearchProjection(
      "กิน   ข้าว",
      new DictionaryTokenizerDriver(),
    );

    const matches = matchSearchTerm(projection.records, "กิน      ข้าว");

    expect(matches).toEqual([
      {
        matchedText: "กิน ข้าว",
        normalizedStart: 0,
        normalizedEnd: 8,
        originalStart: 0,
        originalEnd: 10,
        tokenPositions: [0, 1],
        matchedTokens: ["กิน", "ข้าว"],
      },
    ]);
    expect(extractMatchSpan(projection.originalText, matches[0])).toBe(
      "กิน   ข้าว",
    );
  });

  it("matches unknown-token fallback sequences deterministically", async () => {
    const projection = await buildSearchProjection(
      "กิน??",
      new DictionaryTokenizerDriver(),
    );

    const matches = matchSearchTerm(projection.records, "??");

    expect(matches).toEqual([
      {
        matchedText: "??",
        normalizedStart: 3,
        normalizedEnd: 5,
        originalStart: 3,
        originalEnd: 5,
        tokenPositions: [1, 2],
        matchedTokens: ["?", "?"],
      },
    ]);
  });

  it("returns no matches when the normalized query is absent", async () => {
    const projection = await buildSearchProjection(
      "กินข้าว",
      new DictionaryTokenizerDriver(),
    );

    expect(matchSearchTerm(projection.records, "หรือยัง")).toEqual([]);
    expect(matchSearchTerm(projection.records, "   ")).toEqual([]);
  });

  it("preserves overlapping phrase matches in appearance order", () => {
    const projections = buildCharacterProjection("aaaa");

    const matches = matchSearchTerm(projections, "aa");

    expect(matches.map((match) => match.tokenPositions)).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
    expect(matches.map((match) => match.originalStart)).toEqual([0, 1, 2]);
  });

  it("returns repeated phrase occurrences deterministically", async () => {
    const projection = await buildSearchProjection(
      "กินข้าวกินข้าว",
      new DictionaryTokenizerDriver(),
    );

    const matches = matchSearchTerm(projection.records, "กินข้าว");

    expect(matches.map((match) => match.tokenPositions)).toEqual([
      [0, 1],
      [2, 3],
    ]);
    expect(matches.map((match) => match.originalStart)).toEqual([0, 7]);
    expect(
      matches.map((match) => extractMatchSpan(projection.originalText, match)),
    ).toEqual(["กินข้าว", "กินข้าว"]);
  });
});

function buildCharacterProjection(input: string): SearchProjectionRecord[] {
  return Array.from(input, (token, position) => ({
    token,
    normalizedStart: position,
    normalizedEnd: position + 1,
    originalStart: position,
    originalEnd: position + 1,
    tokenType: "term",
    position,
  }));
}
