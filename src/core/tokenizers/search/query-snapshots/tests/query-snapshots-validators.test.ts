import { describe, expect, it } from "vitest";

import { aggregateReplayDiagnostics } from "../aggregation";
import {
  validateQueryExplanationArtifact,
  validateQueryExecutionTraceArtifact,
  validateQueryPipelineArtifact,
  validateReplayArtifactByKind,
} from "../artifact-validators";
import { stableJsonStringify } from "../stable-json";

describe("query snapshot artifact validators", () => {
  it("accepts valid query execution trace artifacts", () => {
    const trace = buildValidTrace();
    const result = validateQueryExecutionTraceArtifact(trace);

    expect(result).toEqual({
      success: true,
      data: trace,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("rejects a trace with missing stepCount", () => {
    const result = validateQueryExecutionTraceArtifact({
      traceId: "query-trace-0",
      steps: [
        {
          stepId: "query-trace-step-0",
          stage: "lex",
          status: "success",
          timestamp: null,
          metadata: { diagnosticCount: 0 },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }
    expect(
      result.diagnostics.some(
        (d) =>
          d.path === "$.stepCount" &&
          d.code === "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
      ),
    ).toBe(true);
  });

  it("rejects a trace where stepCount does not match steps.length", () => {
    const result = validateQueryExecutionTraceArtifact({
      traceId: "query-trace-0",
      stepCount: 99,
      steps: [
        {
          stepId: "query-trace-step-0",
          stage: "lex",
          status: "success",
          timestamp: null,
          metadata: { diagnosticCount: 0 },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }
    expect(
      result.diagnostics.some(
        (d) =>
          d.path === "$.stepCount" &&
          d.message ===
            "Query execution trace stepCount must match steps length.",
      ),
    ).toBe(true);
  });

  it("dispatches query-execution-trace target via validateReplayArtifactByKind", () => {
    const traceResult = validateReplayArtifactByKind({
      target: "query-execution-trace",
      artifact: buildValidTrace(),
    });

    expect(traceResult.success).toBe(true);
  });

  it("accepts valid query explanation artifacts", () => {
    const explanation = buildValidExplanation();
    const result = validateQueryExplanationArtifact(explanation);

    expect(result).toEqual({
      success: true,
      data: explanation,
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("rejects invalid query explanations with ordered diagnostics", () => {
    const result = validateQueryExplanationArtifact({
      formatVersion: "query-explanation-v1",
      success: true,
      stages: [
        {
          stage: "parse",
          status: "success",
          diagnosticCount: -1,
          artifactTypes: ["parse-result-summary", 7],
          sourceSpan: {
            start: 5,
            end: 3,
          },
        },
      ],
      artifacts: [
        {
          artifactId: "query-explanation-artifact-2",
          type: "parse-result-summary",
          stage: "parse",
          sourceSpan: {
            start: 2,
            end: 1,
          },
        },
      ],
      diagnostics: [],
    });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.stages[0].diagnosticCount",
          message:
            "Query explanation stage diagnosticCount must be a non-negative integer.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.stages[0].artifactTypes[1]",
          message:
            "Query explanation stage artifactTypes entries must be strings.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.stages[0].sourceSpan.end",
          message: "sourceSpan.end must be greater than or equal to start.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.artifacts[0].artifactId",
          message:
            "Query explanation artifactId must match deterministic artifact order.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.artifacts[0].sourceSpan.end",
          message: "sourceSpan.end must be greater than or equal to start.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.artifacts[0].data",
          message: "Query explanation artifact must include data.",
        },
      ],
    });
  });

  it("accepts valid query pipeline result artifacts", () => {
    const pipelineResult = buildValidPipelineResult();
    const result = validateQueryPipelineArtifact(pipelineResult);

    expect(result).toEqual({
      success: true,
      data: pipelineResult,
    });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("rejects invalid query pipeline results with stable diagnostics", () => {
    const result = validateQueryPipelineArtifact({
      artifactKind: "QUERY_PIPELINE_RESULT",
      query: "กิน",
      lexemes: ["TEXT", 12],
      astJson: "{",
      executionPlanId: "",
      traceId: "",
      explanationId: "",
    });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.lexemes[1]",
          message: "lexemes entries must be strings.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.astJson",
          message: "astJson must contain valid JSON.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.executionPlanId",
          message: "executionPlanId must be a non-empty string.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.traceId",
          message: "traceId must be a non-empty string.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.explanationId",
          message: "explanationId must be a non-empty string.",
        },
      ],
    });
  });

  it("dispatches query explanation and pipeline targets explicitly", () => {
    const explanationResult = validateReplayArtifactByKind({
      target: "query-explanation",
      artifact: buildValidExplanation(),
    });
    const pipelineResult = validateReplayArtifactByKind({
      target: "query-pipeline-result",
      artifact: buildValidPipelineResult(),
    });

    expect(explanationResult.success).toBe(true);
    expect(pipelineResult.success).toBe(true);
  });

  it("preserves validation behavior across JSON roundtrip", () => {
    const invalidPipeline = {
      artifactKind: "QUERY_PIPELINE_RESULT",
      query: "กิน",
      lexemes: ["TEXT"],
      astJson: "{",
      executionPlanId: "",
      traceId: "query-trace-0",
      explanationId: "query-explanation-0",
    };
    const first = validateQueryPipelineArtifact(invalidPipeline);
    const second = validateQueryPipelineArtifact(
      JSON.parse(JSON.stringify(invalidPipeline)),
    );

    expect(second).toEqual(first);
    expect(stableJsonStringify(first)).toBe(stableJsonStringify(second));
  });

  it("aggregates final target validator diagnostics deterministically", () => {
    const invalidExplanation = validateQueryExplanationArtifact({
      formatVersion: "query-explanation-v1",
      success: true,
      stages: [
        {
          stage: "execute",
          status: "success",
          diagnosticCount: -2,
          artifactTypes: [],
          sourceSpan: null,
        },
      ],
      artifacts: [],
      diagnostics: [],
    });

    expect(invalidExplanation.success).toBe(false);
    if (invalidExplanation.success) {
      return;
    }

    const aggregate = aggregateReplayDiagnostics([
      {
        stage: "validation",
        artifact: "query-explanation",
        diagnostics: invalidExplanation.diagnostics.map((diagnostic) => ({
          code: diagnostic.code,
          severity: diagnostic.severity,
          path: diagnostic.path,
          message: diagnostic.message,
        })),
      },
    ]);

    expect(stableJsonStringify(aggregate)).toBe(
      '{"diagnostics":[{"artifact":"query-explanation","code":"SNAPSHOT_INVALID_ARTIFACT_SHAPE","message":"Query explanation stage diagnosticCount must be a non-negative integer.","path":"$.stages[0].diagnosticCount","severity":"error","stage":"validation"}],"severity":"error","summaries":[{"artifactCount":1,"diagnosticCount":1,"severity":"error","stage":"validation"},{"artifactCount":0,"diagnosticCount":0,"severity":"none","stage":"compatibility"},{"artifactCount":0,"diagnosticCount":0,"severity":"none","stage":"diff"},{"artifactCount":0,"diagnosticCount":0,"severity":"none","stage":"provenance"}],"totalDiagnosticCount":1}',
    );
  });
});

function buildValidTrace() {
  return {
    traceId: "query-trace-0",
    stepCount: 1,
    steps: [
      {
        stepId: "query-trace-step-0",
        stage: "lex",
        status: "success",
        timestamp: null,
        metadata: { diagnosticCount: 0 },
      },
    ],
  };
}

function buildValidExplanation() {
  return {
    formatVersion: "query-explanation-v1",
    success: true,
    stages: [
      {
        stage: "parse",
        status: "success",
        diagnosticCount: 0,
        artifactTypes: ["parse-result-summary"],
        sourceSpan: {
          start: 0,
          end: 3,
        },
      },
    ],
    artifacts: [
      {
        artifactId: "query-explanation-artifact-0",
        type: "parse-result-summary",
        stage: "parse",
        sourceSpan: {
          start: 0,
          end: 3,
        },
        data: {
          success: true,
          diagnosticCount: 0,
          hasAst: true,
        },
      },
    ],
    diagnostics: [],
  };
}

function buildValidPipelineResult() {
  return {
    artifactKind: "QUERY_PIPELINE_RESULT" as const,
    query: "กิน",
    lexemes: ["TEXT"],
    astJson: '{"sourceSpan":{"end":3,"start":0},"type":"TOKEN"}',
    executionPlanId: "plan-node-0",
    traceId: "query-trace-0",
    explanationId: "query-explanation-artifact-0",
  };
}
