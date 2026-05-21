import { describe, expect, it } from "vitest";

import { CorpusIndexer } from "../../index-primitives";
import type { SearchCorpus } from "../../index-primitives";
import { executeQueryPipeline } from "../../query-pipeline";
import { buildQueryExecutionTrace, buildQueryExplanation } from "../index";
import type { QueryExecutionTraceMetadata } from "../index";

const GIN = "\u0e01\u0e34\u0e19";
const KHAO = "\u0e02\u0e49\u0e32\u0e27";
const RUE_YANG = "\u0e2b\u0e23\u0e37\u0e2d\u0e22\u0e31\u0e07";

describe("query tracing", () => {
  it("builds deterministic explanations from pipeline output", () => {
    const firstResult = executeQueryPipeline({
      rawQuery: `${GIN} AND ${KHAO}`,
      corpus: buildCorpus(),
    });
    const secondResult = executeQueryPipeline({
      rawQuery: `${GIN} AND ${KHAO}`,
      corpus: buildCorpus(),
    });

    const firstExplanation = buildQueryExplanation(firstResult);
    const secondExplanation = buildQueryExplanation(secondResult);

    expect(firstExplanation).toEqual(secondExplanation);
    expect(firstExplanation.formatVersion).toBe("query-explanation-v1");
    expect(firstExplanation.stages.map((stage) => stage.stage)).toEqual([
      "lex",
      "parse",
      "compile",
      "plan",
      "execute",
    ]);
    expect(
      firstExplanation.artifacts.map((artifact) => artifact.artifactId),
    ).toEqual([
      "query-explanation-artifact-0",
      "query-explanation-artifact-1",
      "query-explanation-artifact-2",
      "query-explanation-artifact-3",
      "query-explanation-artifact-4",
      "query-explanation-artifact-5",
      "query-explanation-artifact-6",
      "query-explanation-artifact-7",
    ]);
    expect(Object.isFrozen(firstExplanation)).toBe(true);
    expect(Object.isFrozen(firstExplanation.artifacts[0].data)).toBe(true);
  });

  it("builds deterministic traces with stable order and sequential IDs", () => {
    const result = executeQueryPipeline({
      rawQuery: `${GIN} OR ${RUE_YANG}`,
      corpus: buildCorpus(),
    });

    const trace = buildQueryExecutionTrace(result);

    expect(trace).toEqual(buildQueryExecutionTrace(result));
    expect(trace.traceId).toBe("query-trace-0");
    expect(trace.steps).toEqual([
      {
        stepId: "query-trace-step-0",
        stage: "lex",
        status: "success",
        timestamp: null,
        metadata: {
          diagnosticCount: 0,
          lexemeCount: 3,
          lexemeTypes: ["TEXT", "OR", "TEXT"],
        },
      },
      {
        stepId: "query-trace-step-1",
        stage: "parse",
        status: "success",
        timestamp: null,
        metadata: {
          diagnosticCount: 0,
          success: true,
          hasAst: true,
        },
      },
      {
        stepId: "query-trace-step-2",
        stage: "compile",
        status: "success",
        timestamp: null,
        metadata: {
          diagnosticCount: 0,
          success: true,
          hasCompiledPlan: true,
          hasExecutionQuery: true,
        },
      },
      {
        stepId: "query-trace-step-3",
        stage: "plan",
        status: "success",
        timestamp: null,
        metadata: {
          diagnosticCount: 0,
          success: true,
          hasExecutionPlan: true,
          executionPlanNodeCount: 3,
        },
      },
      {
        stepId: "query-trace-step-4",
        stage: "execute",
        status: "success",
        timestamp: null,
        metadata: {
          diagnosticCount: 0,
          hasExecutionResult: true,
          matchCount: 3,
          documentIds: ["doc-1", "doc-2", "doc-3"],
        },
      },
    ]);
  });

  it("keeps explanation and trace artifacts serialization-safe", () => {
    const result = executeQueryPipeline({
      rawQuery: `${GIN} AND ${KHAO}`,
      corpus: buildCorpus(),
      options: { explain: true, trace: true },
    });

    expect(result.queryExplanation).toBeDefined();
    expect(result.executionTrace).toBeDefined();
    expect(JSON.parse(JSON.stringify(result.queryExplanation))).toEqual(
      result.queryExplanation,
    );
    expect(JSON.parse(JSON.stringify(result.executionTrace))).toEqual(
      result.executionTrace,
    );
    expect(
      result.executionTrace?.steps.every((step) =>
        Object.values(step.metadata).every(isTraceMetadataValue),
      ),
    ).toBe(true);
  });

  it("exposes optional pipeline artifacts without changing default results", () => {
    const input = {
      rawQuery: GIN,
      corpus: buildCorpus(),
    };

    const defaultResult = executeQueryPipeline(input);
    const explainedResult = executeQueryPipeline({
      ...input,
      options: { explain: true, trace: true },
    });

    expect(defaultResult.queryExplanation).toBeUndefined();
    expect(defaultResult.executionTrace).toBeUndefined();
    expect(explainedResult.queryExplanation?.success).toBe(true);
    expect(explainedResult.executionTrace?.steps).toHaveLength(5);
    expect({
      ...explainedResult,
      queryExplanation: undefined,
      executionTrace: undefined,
    }).toEqual({
      ...defaultResult,
      queryExplanation: undefined,
      executionTrace: undefined,
    });
  });

  it("generates diagnostic traces for parse short circuits", () => {
    const result = executeQueryPipeline({
      rawQuery: `${GIN} ${KHAO}`,
      corpus: buildCorpus(),
      options: { explain: true, trace: true },
    });

    expect(result.success).toBe(false);
    expect(result.executionTrace?.steps).toEqual([
      {
        stepId: "query-trace-step-0",
        stage: "lex",
        status: "success",
        timestamp: null,
        metadata: {
          diagnosticCount: 0,
          lexemeCount: 2,
          lexemeTypes: ["TEXT", "TEXT"],
        },
      },
      {
        stepId: "query-trace-step-1",
        stage: "parse",
        status: "diagnostic",
        timestamp: null,
        metadata: {
          diagnosticCount: 1,
          success: false,
          hasAst: false,
        },
      },
    ]);
    expect(result.queryExplanation?.stages).toEqual([
      {
        stage: "lex",
        status: "success",
        diagnosticCount: 0,
        artifactTypes: ["lex-result-summary"],
        sourceSpan: { start: 0, end: 8 },
      },
      {
        stage: "parse",
        status: "diagnostic",
        diagnosticCount: 1,
        artifactTypes: ["parse-result-summary", "diagnostics-summary"],
        sourceSpan: { start: 4, end: 8 },
      },
    ]);
  });

  it("preserves nested boolean explainability and grouped provenance", () => {
    const result = executeQueryPipeline({
      rawQuery: `(${GIN} OR ${RUE_YANG}) AND ${KHAO}`,
      corpus: buildCorpus(),
      options: { explain: true, trace: true },
    });

    const astArtifact = result.queryExplanation?.artifacts.find(
      (artifact) => artifact.type === "ast-summary",
    );
    const planArtifact = result.queryExplanation?.artifacts.find(
      (artifact) => artifact.type === "execution-plan-summary",
    );

    expect(astArtifact?.sourceSpan).toEqual({ start: 0, end: 25 });
    expect(astArtifact?.data).toMatchObject({
      type: "BOOLEAN",
      operator: "AND",
      clauseCount: 2,
      sourceSpan: { start: 0, end: 25 },
      clauses: [
        {
          type: "GROUP",
          sourceSpan: { start: 0, end: 16 },
          expression: {
            type: "BOOLEAN",
            operator: "OR",
            sourceSpan: { start: 1, end: 15 },
          },
        },
        {
          type: "TOKEN",
          token: KHAO,
          sourceSpan: { start: 21, end: 25 },
        },
      ],
    });
    expect(planArtifact?.data).toMatchObject({
      hasExecutionPlan: true,
      nodeCount: 5,
      root: {
        type: "boolean",
        id: "plan-node-0",
        operator: "AND",
        sourceSpan: { start: 0, end: 25 },
        children: [
          {
            type: "boolean",
            id: "plan-node-1",
            operator: "OR",
            sourceSpan: { start: 0, end: 16 },
          },
          {
            type: "token",
            id: "plan-node-4",
            sourceSpan: { start: 21, end: 25 },
          },
        ],
      },
    });
  });
});

function isTraceMetadataValue(
  value: unknown,
): value is QueryExecutionTraceMetadata {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isTraceMetadataValue);
  }

  if (value !== null && typeof value === "object") {
    return Object.values(value).every(isTraceMetadataValue);
  }

  return false;
}

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
