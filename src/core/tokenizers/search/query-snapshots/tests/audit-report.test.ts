import { describe, expect, it } from "vitest";

import { aggregateReplayDiagnostics } from "../aggregation";
import {
  composeReplayAuditReport,
  REPLAY_AUDIT_REPORT_KIND,
  verifyAuditReportOrderingInvariants,
  type ReplayAuditReport,
} from "../audit-report";
import type {
  QueryReplayCompatibilityResult,
  QueryReplayDiffResult,
} from "../contracts";
import {
  createQuerySnapshotDiagnostic,
  createQuerySnapshotFailure,
  createQuerySnapshotSuccess,
} from "../diagnostics";
import {
  buildReplayGovernanceReport,
  type ReplayGovernanceReport,
} from "../governance-report";
import { stableJsonStringify } from "../stable-json";
import { summarizeReplayDiff } from "../summary";

describe("replay audit reports", () => {
  it("composes deterministic equivalent envelopes for equivalent inputs", () => {
    const governanceReport = createGovernanceReport();
    const first = composeReplayAuditReport({
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      composedAtSequence: 7,
      governanceReport,
    });
    const second = composeReplayAuditReport({
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      composedAtSequence: 7,
      governanceReport,
    });

    expect(first).toEqual(second);
    expect(stableJsonStringify(first)).toBe(stableJsonStringify(second));
  });

  it("honors caller-supplied deterministic audit IDs", () => {
    const auditReport = composeReplayAuditReport({
      auditId: "audit:manual:query-snapshot-0:query-snapshot-1:3",
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      composedAtSequence: 3,
      governanceReport: createGovernanceReport(),
    });

    expect(auditReport).toMatchObject({
      auditId: "audit:manual:query-snapshot-0:query-snapshot-1:3",
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      reportKind: REPLAY_AUDIT_REPORT_KIND,
      composedAtSequence: 3,
    });
  });

  it("uses canonical composite audit IDs when no audit ID is supplied", () => {
    const auditReport = composeReplayAuditReport({
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      composedAtSequence: 9,
      governanceReport: createGovernanceReport(),
    });

    expect(auditReport.auditId).toBe(
      "replay-audit-report:query-snapshot-0:query-snapshot-1:9",
    );
  });

  it("keeps composedAtSequence as the caller-provided deterministic sequence", () => {
    const first = composeReplayAuditReport({
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      composedAtSequence: 1,
      governanceReport: createGovernanceReport(),
    });
    const second = composeReplayAuditReport({
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      composedAtSequence: 2,
      governanceReport: createGovernanceReport(),
    });

    expect(first.composedAtSequence).toBe(1);
    expect(second.composedAtSequence).toBe(2);
    expect(first.auditId).not.toBe(second.auditId);
  });

  it("rejects invalid audit composition sequence coordinates", () => {
    expect(() =>
      composeReplayAuditReport({
        sourceSnapshotId: "query-snapshot-0",
        targetSnapshotId: "query-snapshot-1",
        composedAtSequence: -1,
        governanceReport: createGovernanceReport(),
      }),
    ).toThrow(
      "Replay audit composedAtSequence must be a non-negative integer primitive.",
    );
    expect(() =>
      composeReplayAuditReport({
        sourceSnapshotId: "query-snapshot-0",
        targetSnapshotId: "query-snapshot-1",
        composedAtSequence: 1.5,
        governanceReport: createGovernanceReport(),
      }),
    ).toThrow(
      "Replay audit composedAtSequence must be a non-negative integer primitive.",
    );
  });

  it("defensively freezes the audit envelope and nested collection buffers", () => {
    const auditReport = composeReplayAuditReport({
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      composedAtSequence: 4,
      governanceReport: createGovernanceReport(),
    });

    expect(Object.isFrozen(auditReport)).toBe(true);
    expect(Object.isFrozen(auditReport.governanceReport)).toBe(true);
    expect(Object.isFrozen(auditReport.governanceReport.artifactSummary)).toBe(
      true,
    );
    expect(Object.isFrozen(auditReport.governanceReport.diagnostics)).toBe(
      true,
    );
    expect(Object.isFrozen(auditReport.governanceReport.mismatches)).toBe(true);
    expect(
      Object.isFrozen(auditReport.governanceReport.diagnostics[0]?.path),
    ).toBe(true);
  });

  it("preserves exact structure across JSON roundtrip", () => {
    const auditReport = composeReplayAuditReport({
      auditId: "audit:stable-roundtrip",
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      composedAtSequence: 5,
      governanceReport: createGovernanceReport(),
    });
    const roundTripped = JSON.parse(
      JSON.stringify(auditReport),
    ) as ReplayAuditReport;

    expect(roundTripped).toEqual(auditReport);
    expect(stableJsonStringify(roundTripped)).toBe(
      stableJsonStringify(auditReport),
    );
  });

  it("verifies deterministic ordering invariants for governance collections", () => {
    const auditReport = composeReplayAuditReport({
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      composedAtSequence: 6,
      governanceReport: createGovernanceReport(),
    });

    expect(verifyAuditReportOrderingInvariants(auditReport)).toBe(true);
  });

  it("rejects diagnostics that violate stage, path, and code ordering", () => {
    const governanceReport = createGovernanceReport();
    const unsortedReport: ReplayAuditReport = {
      auditId: "audit:unsorted-diagnostics",
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      reportKind: REPLAY_AUDIT_REPORT_KIND,
      composedAtSequence: 6,
      governanceReport: {
        ...governanceReport,
        diagnostics: [...governanceReport.diagnostics].reverse(),
      },
    };

    expect(verifyAuditReportOrderingInvariants(unsortedReport)).toBe(false);
  });

  it("preserves compatibility aggregation inside the wrapped report", () => {
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
    const governanceReport = buildReplayGovernanceReport({
      validationBlocks: [],
      diagnosticAggregate: aggregate,
    });
    const auditReport = composeReplayAuditReport({
      sourceSnapshotId: "query-snapshot-0",
      targetSnapshotId: "query-snapshot-1",
      composedAtSequence: 8,
      governanceReport,
    });

    expect(auditReport.governanceReport.summary.totalDiagnostics).toBe(1);
    expect(auditReport.governanceReport.compatibility).toBe(
      "BREAKING_MISMATCH",
    );
    expect(auditReport.governanceReport.diagnostics).toEqual([
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

function createGovernanceReport(): ReplayGovernanceReport {
  const diff = createDiff();

  return buildReplayGovernanceReport({
    validationBlocks: [
      {
        stageTrackingIndex: 1,
        artifactTarget: "execution-plan",
        result: createQuerySnapshotFailure([
          createQuerySnapshotDiagnostic(
            "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
            "$.planId",
            "planId must be a string.",
          ),
          createQuerySnapshotDiagnostic(
            "SNAPSHOT_INVALID_SCHEMA_VERSION",
            "$.artifactKind",
            "artifactKind must be execution-plan.",
          ),
        ]),
      },
      {
        stageTrackingIndex: 0,
        artifactTarget: "snapshot-envelope",
        result: createQuerySnapshotSuccess({}),
      },
    ],
    compatibilityResult: createQuerySnapshotSuccess(createCompatibleResult()),
    diffResult: createQuerySnapshotSuccess(diff),
    diffSummary: summarizeReplayDiff(diff),
  });
}

function createCompatibleResult(): QueryReplayCompatibilityResult {
  return {
    classification: "compatible",
    compatible: true,
    schemaVersionCompatible: true,
    artifactKindCompatible: true,
    migrationRequired: false,
  };
}

function createDiff(): QueryReplayDiffResult {
  return {
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
  };
}
