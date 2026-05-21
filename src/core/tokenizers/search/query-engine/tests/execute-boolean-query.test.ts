import { describe, expect, it } from "vitest";

import type { InvertedIndex, PostingRecord } from "../../index-primitives";
import {
  executeBooleanQuery,
  executeQuery,
} from "../pipeline/execute-boolean-query";

describe("executeBooleanQuery", () => {
  it("intersects AND query document criteria deterministically", () => {
    const result = executeBooleanQuery(buildBooleanIndex(), {
      kind: "boolean",
      operator: "AND",
      queries: [
        { kind: "token", token: "กิน" },
        { kind: "token", token: "ข้าว" },
      ],
    });

    expect(result.matches.map((match) => match.documentId)).toEqual([
      "doc-1",
      "doc-3",
    ]);
    expect(result.matches[0]).toEqual({
      documentId: "doc-1",
      tokenPositions: [0, 1],
      spans: [
        {
          normalizedStart: 0,
          normalizedEnd: 3,
          originalStart: 0,
          originalEnd: 3,
        },
        {
          normalizedStart: 3,
          normalizedEnd: 7,
          originalStart: 3,
          originalEnd: 7,
        },
      ],
    });
  });

  it("unions OR query matches with stable document ordering", () => {
    const result = executeBooleanQuery(buildBooleanIndex(), {
      kind: "boolean",
      operator: "OR",
      queries: [
        { kind: "token", token: "หรือยัง" },
        { kind: "token", token: "ข้าว" },
      ],
    });

    expect(result.matches.map((match) => match.documentId)).toEqual([
      "doc-1",
      "doc-2",
      "doc-3",
    ]);
    expect(result.matches.map((match) => match.tokenPositions)).toEqual([
      [1],
      [0],
      [1, 2],
    ]);
  });

  it("supports nested boolean query trees with phrase criteria", () => {
    const result = executeQuery(buildBooleanIndex(), {
      kind: "boolean",
      operator: "AND",
      queries: [
        { kind: "phrase", tokens: ["กิน", "ข้าว"] },
        {
          kind: "boolean",
          operator: "OR",
          queries: [
            { kind: "token", token: "หรือยัง" },
            { kind: "token", token: "ทดสอบ" },
          ],
        },
      ],
    });

    expect(result.matches.map((match) => match.documentId)).toEqual(["doc-3"]);
    expect(result.matches[0]?.tokenPositions).toEqual([0, 1, 2]);
  });

  it("returns empty results for unmet AND criteria and empty query lists", () => {
    expect(
      executeBooleanQuery(buildBooleanIndex(), {
        kind: "boolean",
        operator: "AND",
        queries: [
          { kind: "token", token: "กิน" },
          { kind: "token", token: "missing" },
        ],
      }),
    ).toEqual({ matches: [] });

    expect(
      executeBooleanQuery(buildBooleanIndex(), {
        kind: "boolean",
        operator: "OR",
        queries: [],
      }),
    ).toEqual({ matches: [] });
  });

  it("does not mutate the underlying index or boolean query", () => {
    const index = buildBooleanIndex();
    const query = {
      kind: "boolean",
      operator: "OR",
      queries: [{ kind: "token", token: "กิน" }],
    } as const;
    const beforeIndex = structuredClone(index);
    const beforeQuery = structuredClone(query);

    executeBooleanQuery(index, query);

    expect(index).toEqual(beforeIndex);
    expect(query).toEqual(beforeQuery);
  });
});

function buildBooleanIndex(): InvertedIndex {
  return {
    กิน: [posting("doc-1", 0, 0, 3, 0, 3), posting("doc-3", 0, 0, 3, 0, 3)],
    ข้าว: [
      posting("doc-1", 1, 3, 7, 3, 7),
      posting("doc-2", 0, 0, 4, 0, 4),
      posting("doc-3", 1, 3, 7, 3, 7),
    ],
    หรือยัง: [posting("doc-3", 2, 7, 14, 7, 14)],
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
