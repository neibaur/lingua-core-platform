import { describe, expect, it } from "vitest";

import type { SearchProjectionRecord } from "../../shared/search-projection-record";
import { CorpusIndexer } from "../pipeline/corpus-indexer";

describe("CorpusIndexer", () => {
  it("builds deterministic token-key ordering and statistics", () => {
    const corpus = new CorpusIndexer()
      .addDocument({
        documentId: "doc-b",
        identifier: "/b",
        sourceLength: 8,
        projections: [
          projection("ข้าว", 0, 4, 8, 4, 8),
          projection("กิน", 1, 0, 3, 0, 3),
        ],
      })
      .addDocument({
        documentId: "doc-a",
        identifier: "/a",
        sourceLength: 3,
        projections: [projection("กิน", 0, 0, 3, 0, 3)],
      })
      .build();

    expect(Object.keys(corpus.documents)).toEqual(["doc-a", "doc-b"]);
    expect(Object.keys(corpus.invertedIndex)).toEqual(["กิน", "ข้าว"]);
    expect(corpus.statistics).toEqual({
      documentCount: 2,
      totalDistinctTokens: 2,
      totalTokenOccurrences: 3,
    });
  });

  it("appends repeated tokens across single and multiple documents", () => {
    const corpus = new CorpusIndexer()
      .addDocument({
        documentId: "lesson-1",
        identifier: "/lessons/1",
        sourceLength: 15,
        projections: [
          projection("กิน", 0, 0, 3, 0, 3),
          projection("ข้าว", 1, 3, 7, 3, 7),
          projection("กิน", 2, 8, 11, 8, 11),
        ],
      })
      .addDocument({
        documentId: "lesson-2",
        identifier: "/lessons/2",
        sourceLength: 3,
        projections: [projection("กิน", 0, 0, 3, 0, 3)],
      })
      .build();

    expect(corpus.invertedIndex["กิน"]).toEqual([
      {
        documentId: "lesson-1",
        position: 0,
        normalizedStart: 0,
        normalizedEnd: 3,
        originalStart: 0,
        originalEnd: 3,
      },
      {
        documentId: "lesson-1",
        position: 2,
        normalizedStart: 8,
        normalizedEnd: 11,
        originalStart: 8,
        originalEnd: 11,
      },
      {
        documentId: "lesson-2",
        position: 0,
        normalizedStart: 0,
        normalizedEnd: 3,
        originalStart: 0,
        originalEnd: 3,
      },
    ]);
  });

  it("preserves normalized-to-original offsets in posting records", () => {
    const corpus = new CorpusIndexer()
      .addDocument({
        documentId: "lesson-1",
        identifier: "/lessons/1",
        sourceLength: 10,
        projections: [projection("ข้าว", 7, 4, 8, 6, 10)],
      })
      .build();

    expect(corpus.invertedIndex["ข้าว"]).toEqual([
      {
        documentId: "lesson-1",
        position: 0,
        normalizedStart: 4,
        normalizedEnd: 8,
        originalStart: 6,
        originalEnd: 10,
      },
    ]);
  });

  it("excludes whitespace-only tokens while assigning contiguous index positions", () => {
    const corpus = new CorpusIndexer()
      .addDocument({
        documentId: "lesson-1",
        identifier: "/lessons/1",
        sourceLength: 8,
        projections: [
          projection("กิน", 0, 0, 3, 0, 3),
          projection(" ", 1, 3, 4, 3, 4),
          projection("ข้าว", 2, 4, 8, 4, 8),
        ],
      })
      .build();

    expect(Object.keys(corpus.invertedIndex)).toEqual(["กิน", "ข้าว"]);
    expect(corpus.invertedIndex["ข้าว"].at(0)?.position).toBe(1);
    expect(corpus.statistics.totalTokenOccurrences).toBe(2);
  });

  it("builds an empty corpus without indexed layouts", () => {
    const corpus = new CorpusIndexer().build();

    expect(corpus.documents).toEqual({});
    expect(corpus.invertedIndex).toEqual({});
    expect(corpus.statistics).toEqual({
      documentCount: 0,
      totalDistinctTokens: 0,
      totalTokenOccurrences: 0,
    });
  });

  it("does not mutate incoming projection records", () => {
    const projections = [projection("กิน", 5, 0, 3, 0, 3)];
    const before = structuredClone(projections);

    new CorpusIndexer()
      .addDocument({
        documentId: "lesson-1",
        identifier: "/lessons/1",
        sourceLength: 3,
        projections,
      })
      .build();

    expect(projections).toEqual(before);
    expect(projections[0]?.position).toBe(5);
  });

  it("rejects duplicate document IDs and identifiers", () => {
    const indexer = new CorpusIndexer().addDocument({
      documentId: "lesson-1",
      identifier: "/lessons/1",
      sourceLength: 3,
      projections: [],
    });

    expect(() =>
      indexer.addDocument({
        documentId: "lesson-1",
        identifier: "/lessons/2",
        sourceLength: 3,
        projections: [],
      }),
    ).toThrow("Duplicate corpus document ID: lesson-1");

    expect(() =>
      indexer.addDocument({
        documentId: "lesson-2",
        identifier: "/lessons/1",
        sourceLength: 3,
        projections: [],
      }),
    ).toThrow("Duplicate corpus document identifier: /lessons/1");
  });
});

function projection(
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
