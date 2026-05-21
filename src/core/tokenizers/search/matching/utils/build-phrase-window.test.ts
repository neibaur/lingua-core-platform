import { describe, expect, it } from "vitest";

import type { SearchProjectionRecord } from "../../shared/search-projection-record";
import { buildPhraseWindow } from "./build-phrase-window";
import { isContiguousMatch } from "./is-contiguous-match";

describe("buildPhraseWindow", () => {
  it("extracts deterministic phrase spans across whitespace gaps", () => {
    const window = buildPhraseWindow(
      [record("กิน", 0, 0, 3, 0, 3), record("ข้าว", 1, 4, 8, 6, 10)],
      0,
      2,
    );

    expect(window).toMatchObject({
      phraseText: "กิน ข้าว",
      normalizedStart: 0,
      normalizedEnd: 8,
      originalStart: 0,
      originalEnd: 10,
      tokenPositions: [0, 1],
    });
  });

  it("rejects non-contiguous projection ranges", () => {
    const projections = [
      record("a", 0, 0, 1, 0, 1),
      record("b", 2, 1, 2, 1, 2),
    ];

    expect(isContiguousMatch(projections)).toBe(false);
    expect(buildPhraseWindow(projections, 0, 2)).toBeUndefined();
  });
});

function record(
  token: string,
  position: number,
  normalizedStart: number,
  normalizedEnd: number,
  originalStart: number,
  originalEnd: number,
): SearchProjectionRecord {
  return {
    token,
    position,
    normalizedStart,
    normalizedEnd,
    originalStart,
    originalEnd,
    tokenType: "term",
  };
}
