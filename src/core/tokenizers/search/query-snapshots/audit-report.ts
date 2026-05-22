import type {
  ReplayGovernanceArtifactSummary,
  ReplayGovernanceDiagnosticItem,
  ReplayGovernanceMismatchItem,
  ReplayGovernanceReport,
} from "./governance-report";

export const REPLAY_AUDIT_REPORT_KIND = "REPLAY_AUDIT_REPORT";

export interface ReplayAuditReport {
  readonly auditId: string;
  readonly sourceSnapshotId: string;
  readonly targetSnapshotId: string;
  readonly reportKind: typeof REPLAY_AUDIT_REPORT_KIND;
  readonly composedAtSequence: number;
  readonly governanceReport: ReplayGovernanceReport;
}

export interface ComposeReplayAuditReportInput {
  readonly auditId?: string;
  readonly sourceSnapshotId: string;
  readonly targetSnapshotId: string;
  readonly composedAtSequence: number;
  readonly governanceReport: ReplayGovernanceReport;
}

export function composeReplayAuditReport(
  input: ComposeReplayAuditReportInput,
): ReplayAuditReport {
  assertComposedAtSequence(input.composedAtSequence);

  return deepFreeze({
    auditId:
      input.auditId ??
      createCanonicalAuditId(
        input.sourceSnapshotId,
        input.targetSnapshotId,
        input.composedAtSequence,
      ),
    sourceSnapshotId: input.sourceSnapshotId,
    targetSnapshotId: input.targetSnapshotId,
    reportKind: REPLAY_AUDIT_REPORT_KIND,
    composedAtSequence: input.composedAtSequence,
    governanceReport: input.governanceReport,
  });
}

function assertComposedAtSequence(composedAtSequence: number): void {
  if (
    !Number.isFinite(composedAtSequence) ||
    !Number.isInteger(composedAtSequence) ||
    composedAtSequence < 0
  ) {
    throw new TypeError(
      "Replay audit composedAtSequence must be a non-negative integer primitive.",
    );
  }
}

export function verifyAuditReportOrderingInvariants(
  report: ReplayAuditReport,
): boolean {
  return (
    isArtifactSummaryOrdered(report.governanceReport.artifactSummary) &&
    isDiagnosticsOrdered(report.governanceReport.diagnostics) &&
    isMismatchesOrdered(report.governanceReport.mismatches)
  );
}

function createCanonicalAuditId(
  sourceSnapshotId: string,
  targetSnapshotId: string,
  composedAtSequence: number,
): string {
  return [
    "replay-audit-report",
    sourceSnapshotId,
    targetSnapshotId,
    String(composedAtSequence),
  ].join(":");
}

function isArtifactSummaryOrdered(
  items: readonly ReplayGovernanceArtifactSummary[],
): boolean {
  return isOrdered(items, compareArtifactSummary);
}

function isDiagnosticsOrdered(
  items: readonly ReplayGovernanceDiagnosticItem[],
): boolean {
  return isOrdered(items, compareDiagnostics);
}

function isMismatchesOrdered(
  items: readonly ReplayGovernanceMismatchItem[],
): boolean {
  return isOrdered(items, compareMismatches);
}

function isOrdered<TItem>(
  items: readonly TItem[],
  compareItems: (left: TItem, right: TItem) => number,
): boolean {
  return items.every((item, index) => {
    if (index === 0) {
      return true;
    }

    return compareItems(items[index - 1], item) <= 0;
  });
}

function compareArtifactSummary(
  left: ReplayGovernanceArtifactSummary,
  right: ReplayGovernanceArtifactSummary,
): number {
  const stageComparison = left.stageTrackingIndex - right.stageTrackingIndex;

  if (stageComparison !== 0) {
    return stageComparison;
  }

  return compareStrings(left.artifactTarget, right.artifactTarget);
}

function compareDiagnostics(
  left: ReplayGovernanceDiagnosticItem,
  right: ReplayGovernanceDiagnosticItem,
): number {
  return compareOrderedReportItems(
    left.stageTrackingIndex,
    left.path,
    left.code,
    right.stageTrackingIndex,
    right.path,
    right.code,
  );
}

function compareMismatches(
  left: ReplayGovernanceMismatchItem,
  right: ReplayGovernanceMismatchItem,
): number {
  return compareOrderedReportItems(
    left.stageTrackingIndex,
    left.path,
    left.code,
    right.stageTrackingIndex,
    right.path,
    right.code,
  );
}

function compareOrderedReportItems(
  leftStageTrackingIndex: number,
  leftPath: readonly string[],
  leftCode: string,
  rightStageTrackingIndex: number,
  rightPath: readonly string[],
  rightCode: string,
): number {
  const stageComparison = leftStageTrackingIndex - rightStageTrackingIndex;

  if (stageComparison !== 0) {
    return stageComparison;
  }

  const pathComparison = compareStrings(
    leftPath.join("."),
    rightPath.join("."),
  );

  if (pathComparison !== 0) {
    return pathComparison;
  }

  return compareStrings(leftCode, rightCode);
}

function compareStrings(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

function deepFreeze<T>(value: T): T {
  return freezeValue(value) as T;
}

function freezeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => freezeValue(item)));
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).map(([key, entryValue]) => {
      return [key, freezeValue(entryValue)] as const;
    });

    return Object.freeze(Object.fromEntries(entries));
  }

  return value;
}
