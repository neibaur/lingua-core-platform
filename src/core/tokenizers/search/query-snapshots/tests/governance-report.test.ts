import { describe, expect, it } from "vitest";

import { aggregateReplayDiagnostics } from "../aggregation";
import {
  buildReplayGovernanceReport,
  REPLAY_GOVERNANCE_REPORT_SCHEMA_VERSION,
} from "../governance-report";
import { stableJsonStringify } from "../stable-json";
import type {
  QueryReplayCompatibilityResult,
  QueryReplayDiffResult,
} from "../contracts";
import {
  createQuerySnapshotDiagnostic,
  createQuerySnapshotFailure,
  createQuerySnapshotSuccess,
} from "../diagnostics";
import { summarizeReplayDiff } from "../summary";

describe("replay governance reports", () => {
  it("constructs a clean perfect-match governance report", () => {
    const diff = createPerfectDiff();
    const report = buildReplayGovernanceReport({
      validationBlocks: [
        {
          stageTrackingIndex: 0,
          artifactTarget: "snapshot-envelope",
          result: createQuerySnapshotSuccess({}),
        },
        {
          stageTrackingIndex: 1,
          artifactTarget: "execution-plan",
          result: createQuerySnapshotSuccess({}),
        },
      ],
      compatibilityResult: createQuerySnapshotSuccess(createCompatibleResult()),
      diffResult: createQuerySnapshotSuccess(diff),
      diffSummary: summarizeReplayDiff(diff),
    });

    expect(report).toEqual({
      schemaVersion: REPLAY_GOVERNANCE_REPORT_SCHEMA_VERSION,
      evaluationTimestamp: null,
      generatedFrom: "replay-governance-report",
      isValid: true,
      compatibility: "PERFECT_MATCH",
      summary: {
        verifiedBlockCount: 2,
        totalDiagnostics: 0,
        totalMismatches: 0,
      },
      artifactSummary: [
        {
          stageTrackingIndex: 0,
          artifactTarget: "snapshot-envelope",
          isValid: true,
          diagnosticCount: 0,
        },
        {
          stageTrackingIndex: 1,
          artifactTarget: "execution-plan",
          isValid: true,
          diagnosticCount: 0,
        },
      ],
      diagnostics: [],
      mismatches: [],
    });
    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.artifactSummary)).toBe(true);
  });

  it("compounds diagnostics and mismatches into a deterministic breaking report", () => {
    const diff = createBreakingDiff();
    const report = buildReplayGovernanceReport({
      validationBlocks: [
        {
          stageTrackingIndex: 2,
          artifactTarget: "query-execution-trace",
          result: createQuerySnapshotFailure([
            createQuerySnapshotDiagnostic(
              "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
              "$.traceId",
              "traceId must be a string.",
            ),
          ]),
        },
        {
          stageTrackingIndex: 0,
          artifactTarget: "snapshot-envelope",
          result: createQuerySnapshotFailure([
            createQuerySnapshotDiagnostic(
              "SNAPSHOT_INVALID_SCHEMA_VERSION",
              "$.schemaVersion",
              "Snapshot schemaVersion must be query-snapshot-v1.",
            ),
          ]),
        },
      ],
      compatibilityResult: createQuerySnapshotSuccess({
        classification: "incompatible",
        compatible: false,
        schemaVersionCompatible: false,
        artifactKindCompatible: true,
        migrationRequired: false,
      }),
      diffResult: createQuerySnapshotSuccess(diff),
      diffSummary: summarizeReplayDiff(diff),
    });

    expect(report.isValid).toBe(false);
    expect(report.compatibility).toBe("BREAKING_MISMATCH");
    expect(report.summary).toEqual({
      verifiedBlockCount: 2,
      totalDiagnostics: 2,
      totalMismatches: 2,
    });
    expect(report.diagnostics.map((diagnostic) => diagnostic.path)).toEqual([
      ["$", "schemaVersion"],
      ["$", "traceId"],
    ]);
    expect(report.mismatches.map((mismatch) => mismatch.code)).toEqual([
      "REPLAY_MISMATCH_PROVENANCE",
      "REPLAY_MISMATCH_SCHEMA_VERSION",
    ]);
  });

  it("sorts diagnostics and mismatches by stage index, path, and code", () => {
    const report = buildReplayGovernanceReport({
      validationBlocks: [
        {
          stageTrackingIndex: 1,
          artifactTarget: "execution-plan",
          result: createQuerySnapshotFailure([
            createQuerySnapshotDiagnostic(
              "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
              "$.b",
              "b",
            ),
            createQuerySnapshotDiagnostic(
              "SNAPSHOT_INVALID_SCHEMA_VERSION",
              "$.a",
              "a",
            ),
          ]),
        },
        {
          stageTrackingIndex: 0,
          artifactTarget: "snapshot-envelope",
          result: createQuerySnapshotFailure([
            createQuerySnapshotDiagnostic(
              "SNAPSHOT_INVALID_SNAPSHOT_ID",
              "$.z",
              "z",
            ),
          ]),
        },
      ],
      diffResult: createQuerySnapshotSuccess({
        classification: "different",
        equivalent: false,
        compatible: true,
        serializedLeft: "{}",
        serializedRight: "{}",
        diffs: [
          {
            path: "$.z",
            kind: "structural",
            left: { present: true, value: 1 },
            right: { present: true, value: 2 },
          },
          {
            path: "$.a",
            kind: "snapshot-id",
            left: { present: true, value: "query-snapshot-0" },
            right: { present: true, value: "query-snapshot-1" },
          },
        ],
      }),
    });

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SNAPSHOT_INVALID_SNAPSHOT_ID",
      "SNAPSHOT_INVALID_SCHEMA_VERSION",
      "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
    ]);
    expect(report.mismatches.map((mismatch) => mismatch.code)).toEqual([
      "REPLAY_MISMATCH_SNAPSHOT_ID",
      "REPLAY_MISMATCH_STRUCTURAL",
    ]);
  });

  it("preserves exact structure across JSON roundtrip", () => {
    const report = buildReplayGovernanceReport({
      validationBlocks: [
        {
          stageTrackingIndex: 0,
          artifactTarget: "query-explanation",
          result: createQuerySnapshotSuccess({}),
        },
      ],
      diffResult: createQuerySnapshotSuccess(createPerfectDiff()),
    });

    expect(JSON.parse(JSON.stringify(report))).toEqual(report);
    expect(stableJsonStringify(JSON.parse(JSON.stringify(report)))).toBe(
      stableJsonStringify(report),
    );
  });

  it("composes diff summary totals when explicit diff entries are absent", () => {
    const report = buildReplayGovernanceReport({
      validationBlocks: [
        {
          stageTrackingIndex: 0,
          artifactTarget: "query-pipeline-result",
          result: createQuerySnapshotSuccess({}),
        },
      ],
      diffSummary: summarizeReplayDiff({
        classification: "different",
        equivalent: false,
        compatible: true,
        serializedLeft: "{}",
        serializedRight: "{}",
        diffs: [
          {
            path: "$.artifact.query",
            kind: "structural",
            left: { present: true, value: "thai" },
            right: { present: true, value: "english" },
          },
        ],
      }),
    });

    expect(report.isValid).toBe(false);
    expect(report.compatibility).toBe("FORWARD_COMPATIBLE");
    expect(report.summary.totalMismatches).toBe(1);
    expect(report.mismatches).toEqual([]);
  });

  it("produces equivalent reports for equivalent validation inputs", () => {
    const first = buildReplayGovernanceReport({
      validationBlocks: [
        {
          stageTrackingIndex: 0,
          artifactTarget: "execution-plan",
          result: createQuerySnapshotSuccess({ a: 1, b: 2 }),
        },
      ],
      diffResult: createQuerySnapshotSuccess(createPerfectDiff()),
    });
    const second = buildReplayGovernanceReport({
      validationBlocks: [
        {
          stageTrackingIndex: 0,
          artifactTarget: "execution-plan",
          result: createQuerySnapshotSuccess({ b: 2, a: 1 }),
        },
      ],
      diffResult: createQuerySnapshotSuccess(createPerfectDiff()),
    });

    expect(first).toEqual(second);
    expect(stableJsonStringify(first)).toBe(stableJsonStringify(second));
  });

  it("does not mutate input records while composing reports", () => {
    const validationBlocks = [
      {
        stageTrackingIndex: 1,
        artifactTarget: "execution-plan" as const,
        result: createQuerySnapshotFailure([
          createQuerySnapshotDiagnostic(
            "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
            "$.planId",
            "planId must be a string.",
          ),
        ]),
      },
    ];
    const before = structuredClone(validationBlocks);

    buildReplayGovernanceReport({
      validationBlocks,
      diffResult: createQuerySnapshotSuccess(createPerfectDiff()),
    });

    expect(validationBlocks).toEqual(before);
  });

  it("can include aggregate diagnostics in stable report order", () => {
    const aggregate = aggregateReplayDiagnostics([
      {
        stage: "validation",
        artifact: "execution-plan",
        diagnostics: [
          {
            code: "PLAN_INVALID",
            path: "$.planId",
            message: "Plan invalid.",
          },
        ],
      },
    ]);
    const report = buildReplayGovernanceReport({
      validationBlocks: [],
      diagnosticAggregate: aggregate,
    });

    expect(report.summary.totalDiagnostics).toBe(1);
    expect(report.diagnostics).toEqual([
      {
        stageTrackingIndex: 2,
        artifactTarget: "diff",
        code: "PLAN_INVALID",
        message: "Plan invalid.",
        path: ["$", "planId"],
      },
    ]);
  });
});

function createCompatibleResult(): QueryReplayCompatibilityResult {
  return {
    classification: "compatible",
    compatible: true,
    schemaVersionCompatible: true,
    artifactKindCompatible: true,
    migrationRequired: false,
  };
}

function createPerfectDiff(): QueryReplayDiffResult {
  return {
    classification: "equivalent",
    equivalent: true,
    compatible: true,
    serializedLeft: '{"a":1}',
    serializedRight: '{"a":1}',
    diffs: [],
  };
}

function createBreakingDiff(): QueryReplayDiffResult {
  return {
    classification: "incompatible",
    equivalent: false,
    compatible: false,
    serializedLeft: '{"schemaVersion":"query-snapshot-v1"}',
    serializedRight: '{"schemaVersion":"query-snapshot-v2"}',
    diffs: [
      {
        path: "$.schemaVersion",
        kind: "schema-version",
        left: { present: true, value: "query-snapshot-v1" },
        right: { present: true, value: "query-snapshot-v2" },
      },
      {
        path: "$.artifact.metadata.sourceSpan.end",
        kind: "provenance",
        left: { present: true, value: 12 },
        right: { present: true, value: 13 },
      },
    ],
  };
}
