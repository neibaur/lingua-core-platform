import { describe, expect, it } from "vitest";

import type { InvertedIndex } from "../../index-primitives";
import { executeTokenQuery } from "../pipeline/execute-token-query";

describe("executeTokenQuery", () => {
  it("retrieves exact token postings across multiple documents", () => {
    const index = buildIndex();

    expect(executeTokenQuery(index, { kind: "token", token: "กิน" })).toEqual({
      matches: [
        {
          documentId: "doc-1",
          tokenPositions: [0, 2],
          spans: [
            {
              normalizedStart: 0,
              normalizedEnd: 3,
              originalStart: 0,
              originalEnd: 3,
            },
            {
              normalizedStart: 8,
              normalizedEnd: 11,
              originalStart: 8,
              originalEnd: 11,
            },
          ],
        },
        {
          documentId: "doc-2",
          tokenPositions: [0],
          spans: [
            {
              normalizedStart: 0,
              normalizedEnd: 3,
              originalStart: 0,
              originalEnd: 3,
            },
          ],
        },
      ],
    });
  });

  it("returns an empty deterministic result for missing tokens", () => {
    expect(
      executeTokenQuery(buildIndex(), { kind: "token", token: "หรือยัง" }),
    ).toEqual({ matches: [] });
  });

  it("does not mutate the immutable index input", () => {
    const index = buildIndex();
    const before = structuredClone(index);

    executeTokenQuery(index, { kind: "token", token: "กิน" });

    expect(index).toEqual(before);
  });
});

function buildIndex(): InvertedIndex {
  return {
    กิน: [
      posting("doc-2", 0, 0, 3, 0, 3),
      posting("doc-1", 2, 8, 11, 8, 11),
      posting("doc-1", 0, 0, 3, 0, 3),
    ],
    ข้าว: [posting("doc-1", 1, 3, 7, 3, 7)],
  };
}

function posting(
  documentId: string,
  position: number,
  normalizedStart: number,
  normalizedEnd: number,
  originalStart: number,
  originalEnd: number,
) {
  return {
    documentId,
    position,
    normalizedStart,
    normalizedEnd,
    originalStart,
    originalEnd,
  };
}
