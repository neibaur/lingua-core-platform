import { describe, expect, it } from "vitest";

import { CorpusIndexer } from "../../index-primitives";
import type { SearchCorpus } from "../../index-primitives";
import { executeQueryPipeline } from "../../query-pipeline";
import type {
  ExecutionPlanSnapshot,
  QueryExecutionTraceSnapshot,
} from "../contracts";
import { aggregateReplayDiagnostics } from "../aggregation";
import {
  validateExecutionPlanArtifact,
  validateQueryExecutionTraceArtifact,
  validateReplayArtifactByKind,
  validateSnapshotEnvelopeArtifact,
} from "../artifact-validators";
import { diffJsonValues, diffQueryReplaySnapshots } from "../diff";
import { evaluateQueryReplayCompatibility } from "../compatibility";
import { verifyCanonicalStructuralEquivalence } from "../equivalence";
import {
  createQueryReplaySnapshot,
  createQuerySnapshotBundle,
  deserializeQueryReplaySnapshot,
  deserializeQuerySnapshotBundle,
  reconstructQueryReplaySnapshot,
  replayQuerySnapshotBundle,
} from "../reconstruction";
import { stableJsonStringify } from "../stable-json";
import { summarizeReplayDiff } from "../summary";
import {
  validateQueryReplaySnapshot,
  validateQueryReplaySnapshotWithArtifacts,
  validateQuerySnapshotBundle,
} from "../validate";

const GIN = "\u0e01\u0e34\u0e19";
const KHAO = "\u0e02\u0e49\u0e32\u0e27";

describe("query snapshots", () => {
  it("validates deterministic replay snapshot envelopes", () => {
    const snapshot = buildExecutionPlanSnapshot();
    const result = validateQueryReplaySnapshot(snapshot);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.snapshotId).toBe("query-snapshot-0");
      expect(result.data.artifactKind).toBe("execution-plan");
    }
  });

  it("rejects malformed snapshots with deterministic diagnostics", () => {
    const result = validateQueryReplaySnapshot({
      schemaVersion: "query-snapshot-v0",
      artifactKind: "optimizer-plan",
      snapshotId: "snapshot-runtime",
      artifact: [],
    });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_INVALID_SCHEMA_VERSION",
          severity: "error",
          path: "$.schemaVersion",
          message: "Snapshot schemaVersion must be query-snapshot-v1.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_KIND",
          severity: "error",
          path: "$.artifactKind",
          message: "Snapshot artifactKind is not supported.",
        },
        {
          code: "SNAPSHOT_INVALID_SNAPSHOT_ID",
          severity: "error",
          path: "$.snapshotId",
          message:
            "Snapshot snapshotId must use the query-snapshot-{number} format.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT",
          severity: "error",
          path: "$.artifact",
          message: "Snapshot artifact must be a plain object.",
        },
      ],
    });
  });

  it("rejects non-json-safe structures without throwing", () => {
    const result = validateQueryReplaySnapshot({
      schemaVersion: "query-snapshot-v1",
      artifactKind: "execution-plan",
      snapshotId: "query-snapshot-0",
      artifact: {
        invalid: Number.POSITIVE_INFINITY,
      },
    });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_NON_JSON_SAFE",
          severity: "error",
          path: "$.artifact.invalid",
          message: "Snapshot value must be a finite JSON number.",
        },
      ],
    });
  });

  it("rejects circular structures deterministically", () => {
    const circularValue: Record<string, unknown> = {
      schemaVersion: "query-snapshot-v1",
      artifactKind: "execution-plan",
      snapshotId: "query-snapshot-0",
      artifact: {},
    };
    circularValue.self = circularValue;

    const result = validateQueryReplaySnapshot(circularValue);

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_NON_JSON_SAFE",
          severity: "error",
          path: "$.self",
          message: "Snapshot value must not contain circular references.",
        },
      ],
    });
  });

  it("preserves canonical serialization order while preserving array order", () => {
    const serialized = stableJsonStringify({
      z: [{ b: 2, a: 1 }],
      a: {
        d: 4,
        c: 3,
      },
    });

    expect(serialized).toBe('{"a":{"c":3,"d":4},"z":[{"a":1,"b":2}]}');
  });

  it("reconstructs immutable snapshots from canonical serialized data", () => {
    const snapshot = buildExecutionPlanSnapshot();
    const serialized = stableJsonStringify(snapshot);
    const reconstructed = deserializeQueryReplaySnapshot(serialized);

    expect(reconstructed.success).toBe(true);
    if (reconstructed.success) {
      expect(reconstructed.data.artifactKind).toBe("execution-plan");
      if (reconstructed.data.artifactKind !== "execution-plan") {
        return;
      }

      expect(reconstructed.data).toEqual(snapshot);
      expect(Object.isFrozen(reconstructed.data)).toBe(true);
      expect(Object.isFrozen(reconstructed.data.artifact)).toBe(true);
      expect(reconstructed.data.artifact.metadata.sourceSpan).toEqual({
        start: 0,
        end: 12,
      });
    }
  });

  it("returns deterministic serialization diagnostics during deserialization", () => {
    const result = deserializeQueryReplaySnapshot("{");

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_INVALID_SERIALIZATION",
          severity: "error",
          path: "$",
          message:
            "Serialized snapshot input must be valid canonical JSON-safe data.",
        },
      ],
    });
  });

  it("validates and replays snapshot bundles in stable order", () => {
    const planSnapshot = buildExecutionPlanSnapshot();
    const traceSnapshot = buildTraceSnapshot();
    const bundleResult = createQuerySnapshotBundle([
      planSnapshot,
      traceSnapshot,
    ]);

    expect(bundleResult.success).toBe(true);
    if (!bundleResult.success) {
      return;
    }

    const serialized = stableJsonStringify(bundleResult.data);
    const deserialized = deserializeQuerySnapshotBundle(serialized);

    expect(validateQuerySnapshotBundle(bundleResult.data).success).toBe(true);
    expect(deserialized.success).toBe(true);
    if (deserialized.success) {
      const replayed = replayQuerySnapshotBundle(deserialized.data);

      expect(replayed.success).toBe(true);
      if (replayed.success) {
        expect(
          replayed.data.snapshots.map((snapshot) => snapshot.snapshotId),
        ).toEqual(["query-snapshot-0", "query-snapshot-1"]);
      }
    }
  });

  it("verifies canonical structural equivalence as bit-for-bit serialization", () => {
    const result = verifyCanonicalStructuralEquivalence(
      {
        b: 2,
        a: {
          d: 4,
          c: 3,
        },
      },
      {
        a: {
          c: 3,
          d: 4,
        },
        b: 2,
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.equivalent).toBe(true);
      expect(result.data.serializedLeft).toBe('{"a":{"c":3,"d":4},"b":2}');
      expect(result.data.serializedRight).toBe('{"a":{"c":3,"d":4},"b":2}');
    }
  });

  it("rejects canonical structural non-equivalence deterministically", () => {
    const result = verifyCanonicalStructuralEquivalence({ a: 1 }, { a: 2 });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_NOT_EQUIVALENT",
          severity: "error",
          path: "$",
          message: "Canonical snapshot serialization outputs differ.",
        },
      ],
    });
  });

  it("reconstructs already parsed snapshots without mutating provenance", () => {
    const snapshot = buildExecutionPlanSnapshot();
    const reconstructed = reconstructQueryReplaySnapshot(snapshot);

    expect(reconstructed.success).toBe(true);
    if (reconstructed.success) {
      expect(reconstructed.data.artifactKind).toBe("execution-plan");
      if (reconstructed.data.artifactKind !== "execution-plan") {
        return;
      }

      expect(reconstructed.data.artifact.root.sourceSpan).toEqual({
        start: 0,
        end: 12,
      });
      expect(snapshot.artifact.root.sourceSpan).toEqual({
        start: 0,
        end: 12,
      });
    }
  });

  it("produces deterministic replay diffs for structural provenance changes", () => {
    const left = buildExecutionPlanSnapshot();
    const right = {
      ...left,
      artifact: {
        ...left.artifact,
        metadata: {
          ...left.artifact.metadata,
          sourceSpan: {
            start: 0,
            end: 13,
          },
        },
      },
    };

    const result = diffQueryReplaySnapshots(left, right);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.classification).toBe("different");
      expect(result.data.equivalent).toBe(false);
      expect(result.data.compatible).toBe(true);
      expect(result.data.diffs).toEqual([
        {
          path: "$.artifact.metadata.sourceSpan.end",
          kind: "provenance",
          left: {
            present: true,
            value: 12,
          },
          right: {
            present: true,
            value: 13,
          },
        },
      ]);
      expect(Object.isFrozen(result.data)).toBe(true);
      expect(Object.isFrozen(result.data.diffs)).toBe(true);
      expect(JSON.parse(JSON.stringify(result.data))).toEqual(result.data);
    }
  });

  it("classifies schema and artifact-kind mismatches as incompatible diffs", () => {
    const left = buildExecutionPlanSnapshot();
    const right = {
      ...left,
      artifactKind: "query-execution-trace",
      schemaVersion: "query-snapshot-v2",
      snapshotId: "query-snapshot-1",
    };

    const result = diffQueryReplaySnapshots(left, right);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.classification).toBe("incompatible");
      expect(result.data.compatible).toBe(false);
      expect(result.data.diffs.map((diff) => [diff.path, diff.kind])).toEqual([
        ["$.artifactKind", "artifact-kind"],
        ["$.schemaVersion", "schema-version"],
        ["$.snapshotId", "snapshot-id"],
      ]);
    }
  });

  it("evaluates replay compatibility without migration side effects", () => {
    const compatible = evaluateQueryReplayCompatibility(
      buildExecutionPlanSnapshot(),
      buildExecutionPlanSnapshot(),
    );
    const incompatible = evaluateQueryReplayCompatibility(
      buildExecutionPlanSnapshot(),
      buildTraceSnapshot(),
    );

    expect(compatible).toEqual({
      success: true,
      data: {
        classification: "compatible",
        compatible: true,
        schemaVersionCompatible: true,
        artifactKindCompatible: true,
        migrationRequired: false,
      },
    });
    expect(incompatible).toEqual({
      success: true,
      data: {
        classification: "incompatible",
        compatible: false,
        schemaVersionCompatible: true,
        artifactKindCompatible: false,
        migrationRequired: false,
      },
    });
  });

  it("runs artifact-specific validation orchestration explicitly", () => {
    const validResult = validateQueryReplaySnapshotWithArtifacts(
      buildExecutionPlanSnapshot(),
    );
    const invalidResult = validateQueryReplaySnapshotWithArtifacts({
      schemaVersion: "query-snapshot-v1",
      artifactKind: "execution-plan",
      snapshotId: "query-snapshot-0",
      artifact: {
        formatVersion: "query-execution-plan-v1",
      },
    });

    expect(validResult.success).toBe(true);
    expect(invalidResult).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.artifact.root",
          message: "Snapshot artifact is missing required root property.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.artifact.metadata",
          message: "Snapshot artifact is missing required metadata property.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.artifact.diagnostics",
          message:
            "Snapshot artifact is missing required diagnostics property.",
        },
      ],
    });
  });

  it("produces deterministic JSON value diffs with sorted object keys", () => {
    const result = diffJsonValues(
      {
        z: 1,
        a: 2,
      },
      {
        z: 3,
        b: 4,
      },
    );

    expect(result).toEqual({
      success: true,
      data: [
        {
          path: "$.a",
          kind: "structural",
          left: {
            present: true,
            value: 2,
          },
          right: {
            present: false,
          },
        },
        {
          path: "$.b",
          kind: "structural",
          left: {
            present: false,
          },
          right: {
            present: true,
            value: 4,
          },
        },
        {
          path: "$.z",
          kind: "structural",
          left: {
            present: true,
            value: 1,
          },
          right: {
            present: true,
            value: 3,
          },
        },
      ],
    });
  });

  it("summarizes replay diffs with deterministic stage ordering", () => {
    const left = buildExecutionPlanSnapshot();
    const right = {
      ...left,
      artifact: {
        ...left.artifact,
        metadata: {
          ...left.artifact.metadata,
          sourceSpan: {
            start: 0,
            end: 13,
          },
        },
      },
    };
    const diffResult = diffQueryReplaySnapshots(left, right);

    expect(diffResult.success).toBe(true);
    if (!diffResult.success) {
      return;
    }

    const summary = summarizeReplayDiff(diffResult.data);

    expect(summary).toEqual({
      classification: "different",
      severity: "warning",
      equivalent: false,
      compatible: true,
      statistics: {
        totalDiffCount: 1,
        envelopeDiffCount: 0,
        artifactDiffCount: 0,
        provenanceMismatchCount: 1,
        incompatibilityCount: 0,
      },
      stageSummaries: [
        {
          stage: "envelope",
          severity: "none",
          diffCount: 0,
          paths: [],
        },
        {
          stage: "artifact",
          severity: "none",
          diffCount: 0,
          paths: [],
        },
        {
          stage: "provenance",
          severity: "warning",
          diffCount: 1,
          paths: ["$.artifact.metadata.sourceSpan.end"],
        },
        {
          stage: "compatibility",
          severity: "none",
          diffCount: 0,
          paths: [],
        },
      ],
      compatibilitySummary: {
        compatible: true,
        severity: "none",
        schemaVersionCompatible: true,
        artifactKindCompatible: true,
        migrationRequired: false,
      },
    });
    expect(Object.isFrozen(summary)).toBe(true);
    expect(Object.isFrozen(summary.stageSummaries)).toBe(true);
    expect(JSON.parse(JSON.stringify(summary))).toEqual(summary);
  });

  it("summarizes replay incompatibility with stable severity", () => {
    const left = buildExecutionPlanSnapshot();
    const right = {
      ...left,
      artifactKind: "query-execution-trace",
      schemaVersion: "query-snapshot-v2",
      snapshotId: "query-snapshot-1",
    };
    const diffResult = diffQueryReplaySnapshots(left, right);

    expect(diffResult.success).toBe(true);
    if (!diffResult.success) {
      return;
    }

    const summary = summarizeReplayDiff(diffResult.data);

    expect(summary.severity).toBe("error");
    expect(summary.compatibilitySummary).toEqual({
      compatible: false,
      severity: "error",
      schemaVersionCompatible: false,
      artifactKindCompatible: false,
      migrationRequired: false,
    });
    expect(summary.statistics).toEqual({
      totalDiffCount: 3,
      envelopeDiffCount: 3,
      artifactDiffCount: 0,
      provenanceMismatchCount: 0,
      incompatibilityCount: 2,
    });
  });

  it("aggregates replay diagnostics in deterministic stage and artifact order", () => {
    const aggregate = aggregateReplayDiagnostics([
      {
        stage: "diff",
        artifact: "query-execution-trace",
        diagnostics: [
          {
            code: "TRACE_DIFF",
            path: "$.trace",
            message: "Trace mismatch.",
          },
        ],
      },
      {
        stage: "validation",
        artifact: "execution-plan",
        diagnostics: [
          {
            code: "PLAN_INVALID",
            path: "$.plan",
            message: "Plan invalid.",
          },
        ],
      },
      {
        stage: "validation",
        artifact: "snapshot-envelope",
        diagnostics: [
          {
            code: "ENVELOPE_INVALID",
            path: "$",
            message: "Envelope invalid.",
          },
        ],
      },
      {
        stage: "provenance",
        artifact: "execution-plan",
        diagnostics: [
          {
            code: "SOURCE_SPAN_MISMATCH",
            path: "$.artifact.root.sourceSpan.end",
            message: "Source span mismatch.",
          },
        ],
      },
    ]);

    expect(aggregate).toEqual({
      totalDiagnosticCount: 4,
      severity: "error",
      summaries: [
        {
          stage: "validation",
          diagnosticCount: 2,
          artifactCount: 2,
          severity: "error",
        },
        {
          stage: "compatibility",
          diagnosticCount: 0,
          artifactCount: 0,
          severity: "none",
        },
        {
          stage: "diff",
          diagnosticCount: 1,
          artifactCount: 1,
          severity: "error",
        },
        {
          stage: "provenance",
          diagnosticCount: 1,
          artifactCount: 1,
          severity: "error",
        },
      ],
      diagnostics: [
        {
          artifact: "snapshot-envelope",
          code: "ENVELOPE_INVALID",
          message: "Envelope invalid.",
          path: "$",
          stage: "validation",
        },
        {
          artifact: "execution-plan",
          code: "PLAN_INVALID",
          message: "Plan invalid.",
          path: "$.plan",
          stage: "validation",
        },
        {
          artifact: "query-execution-trace",
          code: "TRACE_DIFF",
          message: "Trace mismatch.",
          path: "$.trace",
          stage: "diff",
        },
        {
          artifact: "execution-plan",
          code: "SOURCE_SPAN_MISMATCH",
          message: "Source span mismatch.",
          path: "$.artifact.root.sourceSpan.end",
          stage: "provenance",
        },
      ],
    });
    expect(Object.isFrozen(aggregate)).toBe(true);
    expect(Object.isFrozen(aggregate.summaries)).toBe(true);
  });

  it("serializes replay diagnostic aggregates bit-for-bit canonically", () => {
    const first = aggregateReplayDiagnostics([
      {
        stage: "provenance",
        artifact: "execution-plan",
        diagnostics: [
          {
            path: "$.artifact.root.sourceSpan.end",
            message: "Source span mismatch.",
            code: "SOURCE_SPAN_MISMATCH",
          },
        ],
      },
      {
        stage: "compatibility",
        artifact: "snapshot-envelope",
        diagnostics: [
          {
            message: "Schema mismatch.",
            code: "SCHEMA_MISMATCH",
            path: "$.schemaVersion",
          },
        ],
      },
    ]);
    const second = aggregateReplayDiagnostics([
      {
        stage: "compatibility",
        artifact: "snapshot-envelope",
        diagnostics: [
          {
            path: "$.schemaVersion",
            code: "SCHEMA_MISMATCH",
            message: "Schema mismatch.",
          },
        ],
      },
      {
        stage: "provenance",
        artifact: "execution-plan",
        diagnostics: [
          {
            code: "SOURCE_SPAN_MISMATCH",
            message: "Source span mismatch.",
            path: "$.artifact.root.sourceSpan.end",
          },
        ],
      },
    ]);

    expect(stableJsonStringify(first)).toBe(stableJsonStringify(second));
    expect(stableJsonStringify(first)).toBe(
      '{"diagnostics":[{"artifact":"snapshot-envelope","code":"SCHEMA_MISMATCH","message":"Schema mismatch.","path":"$.schemaVersion","stage":"compatibility"},{"artifact":"execution-plan","code":"SOURCE_SPAN_MISMATCH","message":"Source span mismatch.","path":"$.artifact.root.sourceSpan.end","stage":"provenance"}],"severity":"error","summaries":[{"artifactCount":0,"diagnosticCount":0,"severity":"none","stage":"validation"},{"artifactCount":1,"diagnosticCount":1,"severity":"error","stage":"compatibility"},{"artifactCount":0,"diagnosticCount":0,"severity":"none","stage":"diff"},{"artifactCount":1,"diagnosticCount":1,"severity":"error","stage":"provenance"}],"totalDiagnosticCount":2}',
    );
  });

  it("accepts valid snapshot envelope artifacts through explicit dispatch", () => {
    const snapshot = buildExecutionPlanSnapshot();
    const directResult = validateSnapshotEnvelopeArtifact(snapshot);
    const dispatchResult = validateReplayArtifactByKind({
      target: "snapshot-envelope",
      artifact: snapshot,
    });

    expect(directResult.success).toBe(true);
    expect(dispatchResult.success).toBe(true);
    expect(Object.isFrozen(directResult)).toBe(true);
    expect(JSON.parse(JSON.stringify(dispatchResult))).toEqual(dispatchResult);
  });

  it("rejects malformed snapshot envelope artifacts deterministically", () => {
    const result = validateReplayArtifactByKind({
      target: "snapshot-envelope",
      artifact: {
        schemaVersion: "query-snapshot-v1",
        artifactKind: "execution-plan",
        snapshotId: "runtime-id",
        artifact: {},
      },
    });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_INVALID_SNAPSHOT_ID",
          severity: "error",
          path: "$.snapshotId",
          message:
            "Snapshot snapshotId must use the query-snapshot-{number} format.",
        },
      ],
    });
  });

  it("accepts compiled execution plan artifacts with stable sequential nodes", () => {
    const plan = buildCompiledExecutionPlanArtifact();
    const result = validateReplayArtifactByKind({
      target: "execution-plan",
      artifact: plan,
    });

    expect(result).toEqual({
      success: true,
      data: plan,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("rejects compiled execution plan invariant violations in field order", () => {
    const result = validateExecutionPlanArtifact({
      planId: 7,
      artifactKind: "QUERY_PLAN",
      sequentialNodes: [
        {
          sequenceId: 1,
          sourceSpan: {
            start: 4,
            end: 2,
          },
        },
        "not-a-node",
      ],
    });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.planId",
          message: "planId must be a string.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.artifactKind",
          message: "artifactKind must be EXECUTION_PLAN.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.sequentialNodes[0].sourceSpan.end",
          message: "sourceSpan.end must be greater than or equal to start.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.sequentialNodes[0].sequenceId",
          message: "Execution plan node sequenceId must match its array index.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.sequentialNodes[1]",
          message: "Execution plan node must be a plain object.",
        },
      ],
    });
  });

  it("accepts query execution trace artifacts with consistent step counts", () => {
    const trace = buildTraceArtifact();
    const result = validateReplayArtifactByKind({
      target: "query-execution-trace",
      artifact: trace,
    });

    expect(result).toEqual({
      success: true,
      data: trace,
    });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("rejects query execution trace step count and ordering violations", () => {
    const result = validateQueryExecutionTraceArtifact({
      traceId: "query-trace-0",
      stepCount: 3,
      steps: [
        {
          stepId: "query-trace-step-1",
        },
        "not-a-step",
      ],
    });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.stepCount",
          message: "Query execution trace stepCount must match steps length.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.steps[0].stepId",
          message:
            "Query execution trace stepId must match deterministic step order.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          severity: "error",
          path: "$.steps[1]",
          message: "Query execution trace step must be a plain object.",
        },
      ],
    });
  });

  it("feeds validator diagnostics into deterministic aggregation", () => {
    const invalidPlan = validateExecutionPlanArtifact({
      planId: "plan-0",
      artifactKind: "EXECUTION_PLAN",
      sequentialNodes: [
        {
          sequenceId: 0,
          sourceSpan: {
            start: 2,
            end: 1,
          },
        },
      ],
    });

    expect(invalidPlan.success).toBe(false);
    if (invalidPlan.success) {
      return;
    }

    const aggregate = aggregateReplayDiagnostics([
      {
        stage: "validation",
        artifact: "execution-plan",
        diagnostics: invalidPlan.diagnostics.map((diagnostic) => ({
          code: diagnostic.code,
          severity: diagnostic.severity,
          path: diagnostic.path,
          message: diagnostic.message,
        })),
      },
    ]);

    expect(stableJsonStringify(aggregate)).toBe(
      '{"diagnostics":[{"artifact":"execution-plan","code":"SNAPSHOT_INVALID_ARTIFACT_SHAPE","message":"sourceSpan.end must be greater than or equal to start.","path":"$.sequentialNodes[0].sourceSpan.end","severity":"error","stage":"validation"}],"severity":"error","summaries":[{"artifactCount":1,"diagnosticCount":1,"severity":"error","stage":"validation"},{"artifactCount":0,"diagnosticCount":0,"severity":"none","stage":"compatibility"},{"artifactCount":0,"diagnosticCount":0,"severity":"none","stage":"diff"},{"artifactCount":0,"diagnosticCount":0,"severity":"none","stage":"provenance"}],"totalDiagnosticCount":1}',
    );
  });
});

function buildExecutionPlanSnapshot(): ExecutionPlanSnapshot {
  const result = executeQueryPipeline({
    rawQuery: `${GIN} AND ${KHAO}`,
    corpus: buildCorpus(),
    options: { explain: true, trace: true },
  });
  const snapshot = createQueryReplaySnapshot(
    "execution-plan",
    result.metadata.executionPlan,
    0,
  );

  if (!snapshot.success) {
    throw new Error("Test fixture snapshot must be valid.");
  }

  return snapshot.data as ExecutionPlanSnapshot;
}

function buildTraceSnapshot(): QueryExecutionTraceSnapshot {
  const result = executeQueryPipeline({
    rawQuery: `${GIN} AND ${KHAO}`,
    corpus: buildCorpus(),
    options: { explain: true, trace: true },
  });
  const snapshot = createQueryReplaySnapshot(
    "query-execution-trace",
    result.executionTrace,
    1,
  );

  if (!snapshot.success) {
    throw new Error("Test fixture snapshot must be valid.");
  }

  return snapshot.data as QueryExecutionTraceSnapshot;
}

function buildCompiledExecutionPlanArtifact() {
  return {
    planId: "compiled-plan-0",
    artifactKind: "EXECUTION_PLAN" as const,
    sequentialNodes: [
      {
        sequenceId: 0,
        sourceSpan: {
          start: 0,
          end: 3,
        },
      },
      {
        sequenceId: 1,
        sourceSpan: {
          start: 4,
          end: 8,
        },
      },
    ],
  };
}

function buildTraceArtifact() {
  return {
    traceId: "query-trace-0",
    stepCount: 2,
    steps: [
      {
        stepId: "query-trace-step-0",
      },
      {
        stepId: "query-trace-step-1",
      },
    ],
  };
}

function buildCorpus(): SearchCorpus {
  return new CorpusIndexer()
    .addDocument({
      documentId: "doc-1",
      identifier: "/doc-1",
      sourceLength: 8,
      projections: [
        projection(GIN, 0, 0, 3, 0, 3),
        projection(KHAO, 1, 3, 8, 3, 8),
      ],
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
