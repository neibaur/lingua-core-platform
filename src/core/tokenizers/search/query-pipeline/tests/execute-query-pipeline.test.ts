import { describe, expect, it } from "vitest";

import { CorpusIndexer } from "../../index-primitives";
import type { SearchCorpus } from "../../index-primitives";
import { executeQueryPipeline } from "../pipeline/execute-query-pipeline";

describe("executeQueryPipeline", () => {
  it("executes token queries end to end", () => {
    const result = executeQueryPipeline({
      rawQuery: "กิน",
      corpus: buildCorpus(),
    });

    expect(result.success).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.metadata.executionQuery).toEqual({
      kind: "token",
      token: "กิน",
    });
    expect(
      result.executionResult?.matches.map((match) => match.documentId),
    ).toEqual(["doc-1", "doc-2"]);
  });

  it("executes phrase queries end to end", () => {
    const result = executeQueryPipeline({
      rawQuery: '"กิน ข้าว"',
      corpus: buildCorpus(),
    });

    expect(result.success).toBe(true);
    expect(result.metadata.executionQuery).toEqual({
      kind: "phrase",
      tokens: ["กิน", "ข้าว"],
    });
    expect(
      result.executionResult?.matches.map((match) => match.documentId),
    ).toEqual(["doc-1", "doc-2"]);
  });

  it("executes boolean AND and OR queries end to end", () => {
    const corpus = buildCorpus();
    const andResult = executeQueryPipeline({
      rawQuery: "กิน AND หรือยัง",
      corpus,
    });
    const orResult = executeQueryPipeline({
      rawQuery: "กิน OR หรือยัง",
      corpus,
    });

    expect(
      andResult.executionResult?.matches.map((match) => match.documentId),
    ).toEqual(["doc-1"]);
    expect(
      orResult.executionResult?.matches.map((match) => match.documentId),
    ).toEqual(["doc-1", "doc-2", "doc-3"]);
  });

  it("executes grouped and nested queries without collapsing stage metadata", () => {
    const result = executeQueryPipeline({
      rawQuery: "(กิน OR หรือยัง) AND ข้าว",
      corpus: buildCorpus(),
    });

    expect(result.success).toBe(true);
    expect(result.metadata.lexemes.map((lexeme) => lexeme.type)).toEqual([
      "LPAREN",
      "TEXT",
      "OR",
      "TEXT",
      "RPAREN",
      "AND",
      "TEXT",
    ]);
    expect(result.metadata.ast?.type).toBe("BOOLEAN");
    expect(result.metadata.plan?.sourceSpan).toEqual({ start: 0, end: 25 });
    expect(
      result.executionResult?.matches.map((match) => match.documentId),
    ).toEqual(["doc-1", "doc-2"]);
  });

  it("short-circuits parse diagnostics before compilation and execution", () => {
    const result = executeQueryPipeline({
      rawQuery: "กิน ข้าว",
      corpus: buildCorpus(),
    });

    expect(result.success).toBe(false);
    expect(result.metadata.ast).toBeNull();
    expect(result.metadata.plan).toBeNull();
    expect(result.metadata.executionQuery).toBeNull();
    expect(result.compileResult).toBeNull();
    expect(result.executionResult).toBeNull();
    expect(result.diagnostics).toEqual([
      {
        stage: "parse",
        code: "ADJACENT_TERMS",
        message: "Adjacent terms must be connected by AND or OR.",
        severity: "error",
        diagnostic: {
          code: "ADJACENT_TERMS",
          message: "Adjacent terms must be connected by AND or OR.",
          severity: "error",
          span: { start: 4, end: 8 },
        },
      },
    ]);
  });

  it("preserves deterministic output and does not mutate the corpus", () => {
    const corpus = buildCorpus();
    const before = structuredClone(corpus);
    const firstResult = executeQueryPipeline({
      rawQuery: "กิน OR หรือยัง",
      corpus,
    });
    const secondResult = executeQueryPipeline({
      rawQuery: "กิน OR หรือยัง",
      corpus,
    });

    expect(firstResult).toEqual(secondResult);
    expect(corpus).toEqual(before);
  });
});

function buildCorpus(): SearchCorpus {
  return new CorpusIndexer()
    .addDocument({
      documentId: "doc-1",
      identifier: "/doc-1",
      sourceLength: 14,
      projections: [
        projection("กิน", 0, 0, 3, 0, 3),
        projection("ข้าว", 1, 3, 7, 3, 7),
        projection("หรือยัง", 2, 7, 14, 7, 14),
      ],
    })
    .addDocument({
      documentId: "doc-2",
      identifier: "/doc-2",
      sourceLength: 7,
      projections: [
        projection("กิน", 0, 0, 3, 0, 3),
        projection("ข้าว", 1, 3, 7, 3, 7),
      ],
    })
    .addDocument({
      documentId: "doc-3",
      identifier: "/doc-3",
      sourceLength: 7,
      projections: [projection("หรือยัง", 0, 0, 7, 0, 7)],
    })
    .build();
}

function projection(
  token: string,
  position: number,
  normalizedStart: number,
  normalizedEnd: number,
  originalStart: number,
  originalEnd: number,
) {
  return {
    token,
    position,
    normalizedStart,
    normalizedEnd,
    originalStart,
    originalEnd,
    tokenType: "term" as const,
  };
}
