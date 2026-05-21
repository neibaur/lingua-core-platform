import { describe, expect, it } from "vitest";

import { CorpusIndexer } from "../pipeline/corpus-indexer";
import {
  SEARCH_CORPUS_FORMAT_VERSION,
  type SearchCorpus,
} from "../shared/index-types";
import {
  deserializeSearchCorpus,
  serializeSearchCorpus,
} from "../utils/index-serializer";

describe("index serializer", () => {
  it("serializes inverted-index keys in stable alphabetical order", () => {
    const serializedCorpus = serializeSearchCorpus({
      formatVersion: SEARCH_CORPUS_FORMAT_VERSION,
      documents: {},
      invertedIndex: {
        ข้าว: [
          {
            documentId: "doc-1",
            position: 1,
            normalizedStart: 3,
            normalizedEnd: 7,
            originalStart: 3,
            originalEnd: 7,
          },
        ],
        กิน: [
          {
            documentId: "doc-1",
            position: 0,
            normalizedStart: 0,
            normalizedEnd: 3,
            originalStart: 0,
            originalEnd: 3,
          },
        ],
      },
      statistics: {
        documentCount: 0,
        totalDistinctTokens: 2,
        totalTokenOccurrences: 2,
      },
    });

    expect(serializedCorpus.indexOf('"กิน"')).toBeLessThan(
      serializedCorpus.indexOf('"ข้าว"'),
    );
    expect(serializedCorpus.endsWith("\n")).toBe(true);
  });

  it("roundtrips complete corpus structures through JSON", () => {
    const corpus = new CorpusIndexer()
      .addDocument({
        documentId: "lesson-1",
        identifier: "/lessons/1",
        sourceLength: 7,
        projections: [
          {
            token: "กิน",
            position: 0,
            normalizedStart: 0,
            normalizedEnd: 3,
            originalStart: 0,
            originalEnd: 3,
            tokenType: "term",
          },
          {
            token: "ข้าว",
            position: 1,
            normalizedStart: 3,
            normalizedEnd: 7,
            originalStart: 3,
            originalEnd: 7,
            tokenType: "term",
          },
        ],
      })
      .build();

    expect(deserializeSearchCorpus(serializeSearchCorpus(corpus))).toEqual(
      corpus,
    );
  });

  it("recomputes statistics from canonicalized payload content", () => {
    const corpus = deserializeSearchCorpus(
      JSON.stringify({
        formatVersion: SEARCH_CORPUS_FORMAT_VERSION,
        documents: {
          "doc-1": {
            documentId: "doc-1",
            identifier: "/doc-1",
            sourceLength: 3,
          },
        },
        invertedIndex: {},
        statistics: {
          documentCount: 99,
          totalDistinctTokens: 99,
          totalTokenOccurrences: 99,
        },
      } satisfies SearchCorpus),
    );

    expect(corpus.statistics).toEqual({
      documentCount: 1,
      totalDistinctTokens: 0,
      totalTokenOccurrences: 0,
    });
  });

  it("throws an explicit error for unsupported schema layout versions", () => {
    expect(() =>
      deserializeSearchCorpus(
        JSON.stringify({
          formatVersion: "future-layout",
          documents: {},
          invertedIndex: {},
          statistics: {
            documentCount: 0,
            totalDistinctTokens: 0,
            totalTokenOccurrences: 0,
          },
        }),
      ),
    ).toThrow("Unsupported search corpus format version: future-layout");
  });

  it("roundtrips empty corpus structures", () => {
    const corpus = new CorpusIndexer().build();

    expect(deserializeSearchCorpus(serializeSearchCorpus(corpus))).toEqual({
      formatVersion: SEARCH_CORPUS_FORMAT_VERSION,
      documents: {},
      invertedIndex: {},
      statistics: {
        documentCount: 0,
        totalDistinctTokens: 0,
        totalTokenOccurrences: 0,
      },
    });
  });
});
