import { describe, expect, it } from "vitest";

import { CorpusIndexer } from "../../index-primitives";
import type { SearchCorpus } from "../../index-primitives";
import { executeQueryPipeline } from "../pipeline/execute-query-pipeline";

const GIN = "\u0e01\u0e34\u0e19";
const KHAO = "\u0e02\u0e49\u0e32\u0e27";
const RUE_YANG = "\u0e2b\u0e23\u0e37\u0e2d\u0e22\u0e31\u0e07";

describe("executeQueryPipeline", () => {
  it("executes token queries end to end", () => {
    const result = executeQueryPipeline({
      rawQuery: GIN,
      corpus: buildCorpus(),
    });

    expect(result.success).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.metadata.executionQuery).toEqual({
      kind: "token",
      token: GIN,
    });
    expect(result.metadata.executionPlan?.root).toEqual({
      type: "token",
      id: "plan-node-0",
      term: GIN,
      normalizedTerm: GIN,
      sourceSpan: { start: 0, end: 3 },
    });
    expect(
      result.executionResult?.matches.map((match) => match.documentId),
    ).toEqual(["doc-1", "doc-2"]);
  });

  it("executes phrase queries end to end", () => {
    const result = executeQueryPipeline({
      rawQuery: `"${GIN} ${KHAO}"`,
      corpus: buildCorpus(),
    });

    expect(result.success).toBe(true);
    expect(result.metadata.executionQuery).toEqual({
      kind: "phrase",
      tokens: [GIN, KHAO],
    });
    expect(result.metadata.executionPlan?.root).toMatchObject({
      type: "phrase",
      id: "plan-node-0",
      terms: [GIN, KHAO],
      normalizedTerms: [GIN, KHAO],
    });
    expect(
      result.executionResult?.matches.map((match) => match.documentId),
    ).toEqual(["doc-1", "doc-2"]);
  });

  it("executes boolean AND and OR queries end to end", () => {
    const corpus = buildCorpus();
    const andResult = executeQueryPipeline({
      rawQuery: `${GIN} AND ${RUE_YANG}`,
      corpus,
    });
    const orResult = executeQueryPipeline({
      rawQuery: `${GIN} OR ${RUE_YANG}`,
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
      rawQuery: `(${GIN} OR ${RUE_YANG}) AND ${KHAO}`,
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
    expect(result.executionPlanResult).toEqual({
      stage: "plan",
      success: true,
      diagnostics: [],
    });
    expect(result.metadata.executionPlan?.root).toMatchObject({
      type: "boolean",
      id: "plan-node-0",
      operator: "AND",
      sourceSpan: { start: 0, end: 25 },
    });
    expect(
      result.executionResult?.matches.map((match) => match.documentId),
    ).toEqual(["doc-1", "doc-2"]);
  });

  it("short-circuits parse diagnostics before planning and execution", () => {
    const result = executeQueryPipeline({
      rawQuery: `${GIN} ${KHAO}`,
      corpus: buildCorpus(),
    });

    expect(result.success).toBe(false);
    expect(result.metadata.ast).toBeNull();
    expect(result.metadata.plan).toBeNull();
    expect(result.metadata.executionPlan).toBeNull();
    expect(result.metadata.executionQuery).toBeNull();
    expect(result.compileResult).toBeNull();
    expect(result.executionPlanResult).toBeNull();
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
      rawQuery: `${GIN} OR ${RUE_YANG}`,
      corpus,
    });
    const secondResult = executeQueryPipeline({
      rawQuery: `${GIN} OR ${RUE_YANG}`,
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
        projection(GIN, 0, 0, 3, 0, 3),
        projection(KHAO, 1, 3, 7, 3, 7),
        projection(RUE_YANG, 2, 7, 14, 7, 14),
      ],
    })
    .addDocument({
      documentId: "doc-2",
      identifier: "/doc-2",
      sourceLength: 7,
      projections: [
        projection(GIN, 0, 0, 3, 0, 3),
        projection(KHAO, 1, 3, 7, 3, 7),
      ],
    })
    .addDocument({
      documentId: "doc-3",
      identifier: "/doc-3",
      sourceLength: 7,
      projections: [projection(RUE_YANG, 0, 0, 7, 0, 7)],
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
