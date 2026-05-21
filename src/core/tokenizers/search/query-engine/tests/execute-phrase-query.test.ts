import { describe, expect, it } from "vitest";

import type { InvertedIndex, PostingRecord } from "../../index-primitives";
import { executePhraseQuery } from "../pipeline/execute-phrase-query";
import { reconstructQuerySpan } from "../utils/reconstruct-query-span";

describe("executePhraseQuery", () => {
  it("matches contiguous phrases across multiple documents", () => {
    const result = executePhraseQuery(buildPhraseIndex(), {
      kind: "phrase",
      tokens: ["กิน", "ข้าว"],
    });

    expect(result.matches).toEqual([
      {
        documentId: "doc-1",
        tokenPositions: [0, 1, 3, 4],
        spans: [
          {
            normalizedStart: 0,
            normalizedEnd: 7,
            originalStart: 0,
            originalEnd: 7,
          },
          {
            normalizedStart: 12,
            normalizedEnd: 19,
            originalStart: 12,
            originalEnd: 19,
          },
        ],
      },
      {
        documentId: "doc-2",
        tokenPositions: [0, 1],
        spans: [
          {
            normalizedStart: 0,
            normalizedEnd: 7,
            originalStart: 0,
            originalEnd: 7,
          },
        ],
      },
    ]);
  });

  it("rejects non-contiguous phrase boundaries", () => {
    const result = executePhraseQuery(
      {
        กิน: [posting("doc-1", 0, 0, 3, 0, 3)],
        ข้าว: [posting("doc-1", 2, 8, 12, 8, 12)],
      },
      { kind: "phrase", tokens: ["กิน", "ข้าว"] },
    );

    expect(result).toEqual({ matches: [] });
  });

  it("supports repeated token phrases and overlapping phrase windows", () => {
    const result = executePhraseQuery(
      {
        a: [
          posting("doc-1", 0, 0, 1, 0, 1),
          posting("doc-1", 1, 1, 2, 1, 2),
          posting("doc-1", 2, 2, 3, 2, 3),
          posting("doc-1", 3, 3, 4, 3, 4),
        ],
      },
      { kind: "phrase", tokens: ["a", "a"] },
    );

    expect(result.matches).toEqual([
      {
        documentId: "doc-1",
        tokenPositions: [0, 1, 2, 3],
        spans: [
          {
            normalizedStart: 0,
            normalizedEnd: 2,
            originalStart: 0,
            originalEnd: 2,
          },
          {
            normalizedStart: 1,
            normalizedEnd: 3,
            originalStart: 1,
            originalEnd: 3,
          },
          {
            normalizedStart: 2,
            normalizedEnd: 4,
            originalStart: 2,
            originalEnd: 4,
          },
        ],
      },
    ]);
  });

  it("preserves source coordinates when reconstructing a phrase span", () => {
    expect(
      reconstructQuerySpan([
        posting("doc-1", 0, 0, 3, 2, 5),
        posting("doc-1", 1, 4, 8, 8, 12),
      ]),
    ).toEqual({
      normalizedStart: 0,
      normalizedEnd: 8,
      originalStart: 2,
      originalEnd: 12,
    });
  });

  it("returns empty results for empty phrases or missing tokens", () => {
    expect(
      executePhraseQuery(buildPhraseIndex(), { kind: "phrase", tokens: [] }),
    ).toEqual({ matches: [] });
    expect(
      executePhraseQuery(buildPhraseIndex(), {
        kind: "phrase",
        tokens: ["ไม่มี"],
      }),
    ).toEqual({ matches: [] });
  });

  it("does not mutate the underlying index or phrase query", () => {
    const index = buildPhraseIndex();
    const query = { kind: "phrase", tokens: ["กิน", "ข้าว"] } as const;
    const beforeIndex = structuredClone(index);
    const beforeQuery = structuredClone(query);

    executePhraseQuery(index, query);

    expect(index).toEqual(beforeIndex);
    expect(query).toEqual(beforeQuery);
  });
});

function buildPhraseIndex(): InvertedIndex {
  return {
    กิน: [
      posting("doc-1", 0, 0, 3, 0, 3),
      posting("doc-1", 3, 12, 15, 12, 15),
      posting("doc-2", 0, 0, 3, 0, 3),
    ],
    ข้าว: [
      posting("doc-1", 1, 3, 7, 3, 7),
      posting("doc-1", 4, 15, 19, 15, 19),
      posting("doc-2", 1, 3, 7, 3, 7),
    ],
  };
}

function posting(
  documentId: string,
  position: number,
  normalizedStart: number,
  normalizedEnd: number,
  originalStart: number,
  originalEnd: number,
): PostingRecord {
  return {
    documentId,
    position,
    normalizedStart,
    normalizedEnd,
    originalStart,
    originalEnd,
  };
}
