import type {
  QueryReplayCompatibilityResult,
  QueryReplayDiffEntry,
  QueryReplayDiffResult,
  ReplayArtifactValidationTarget,
  ReplayDiagnosticAggregate,
  ReplayDiffSummary,
} from "./contracts";
import type {
  QuerySnapshotDiagnostic,
  QuerySnapshotValidationResult,
} from "./diagnostics";

export const REPLAY_GOVERNANCE_REPORT_FORMAT_VERSION = "1.0.0";

export type ReplayGovernanceReportCompatibility =
  | "PERFECT_MATCH"
  | "FORWARD_COMPATIBLE"
  | "BREAKING_MISMATCH";

export interface ReplayGovernanceValidationBlock {
  readonly stageTrackingIndex: number;
  readonly artifactTarget: ReplayArtifactValidationTarget;
  readonly result: QuerySnapshotValidationResult<unknown>;
}

export interface BuildReplayGovernanceReportInput {
  readonly validationBlocks: readonly ReplayGovernanceValidationBlock[];
  readonly compatibilityResult?: QuerySnapshotValidationResult<QueryReplayCompatibilityResult>;
  readonly diffResult?: QuerySnapshotValidationResult<QueryReplayDiffResult>;
  readonly diffSummary?: ReplayDiffSummary;
  readonly diagnosticAggregate?: ReplayDiagnosticAggregate;
}

export interface ReplayGovernanceReportSummary {
  readonly verifiedBlockCount: number;
  readonly totalDiagnostics: number;
  readonly totalMismatches: number;
}

export interface ReplayGovernanceArtifactSummary {
  readonly stageTrackingIndex: number;
  readonly artifactTarget: ReplayArtifactValidationTarget;
  readonly isValid: boolean;
  readonly diagnosticCount: number;
}

export interface ReplayGovernanceDiagnosticItem {
  readonly stageTrackingIndex: number;
  readonly artifactTarget:
    | ReplayArtifactValidationTarget
    | "compatibility"
    | "diff";
  readonly code: string;
  readonly message: string;
  readonly path: readonly string[];
}

export interface ReplayGovernanceMismatchItem {
  readonly stageTrackingIndex: number;
  readonly code: string;
  readonly kind: QueryReplayDiffEntry["kind"];
  readonly path: readonly string[];
  readonly left: QueryReplayDiffEntry["left"];
  readonly right: QueryReplayDiffEntry["right"];
}

export interface ReplayGovernanceReport {
  readonly reportFormatVersion: typeof REPLAY_GOVERNANCE_REPORT_FORMAT_VERSION;
  readonly isValid: boolean;
  readonly compatibility: ReplayGovernanceReportCompatibility;
  readonly summary: ReplayGovernanceReportSummary;
  readonly artifactSummary: readonly ReplayGovernanceArtifactSummary[];
  readonly diagnostics: readonly ReplayGovernanceDiagnosticItem[];
  readonly mismatches: readonly ReplayGovernanceMismatchItem[];
}

export function buildReplayGovernanceReport(
  input: BuildReplayGovernanceReportInput,
): ReplayGovernanceReport {
  const artifactSummary = input.validationBlocks
    .map((block) => summarizeValidationBlock(block))
    .sort(compareArtifactSummary);
  const diagnostics = collectDiagnostics(input);
  const mismatches = collectMismatches(input);
  const totalMismatches = getTotalMismatchCount(input, mismatches.length);
  const compatibility = classifyReportCompatibility(
    input.compatibilityResult,
    input.diffResult,
    input.diffSummary,
    diagnostics.length,
    totalMismatches,
  );
  const isValid =
    diagnostics.length === 0 &&
    totalMismatches === 0 &&
    compatibility !== "BREAKING_MISMATCH";

  return deepFreeze({
    reportFormatVersion: REPLAY_GOVERNANCE_REPORT_FORMAT_VERSION,
    isValid,
    compatibility,
    summary: {
      verifiedBlockCount: input.validationBlocks.length,
      totalDiagnostics: diagnostics.length,
      totalMismatches,
    },
    artifactSummary,
    diagnostics,
    mismatches,
  });
}

function summarizeValidationBlock(
  block: ReplayGovernanceValidationBlock,
): ReplayGovernanceArtifactSummary {
  return {
    stageTrackingIndex: block.stageTrackingIndex,
    artifactTarget: block.artifactTarget,
    isValid: block.result.success,
    diagnosticCount: block.result.success ? 0 : block.result.diagnostics.length,
  };
}

function collectDiagnostics(
  input: BuildReplayGovernanceReportInput,
): readonly ReplayGovernanceDiagnosticItem[] {
  const diagnostics: ReplayGovernanceDiagnosticItem[] = [];

  input.validationBlocks.forEach((block) => {
    if (!block.result.success) {
      block.result.diagnostics.forEach((diagnostic) => {
        diagnostics.push(
          createDiagnosticItem(
            block.stageTrackingIndex,
            block.artifactTarget,
            diagnostic,
          ),
        );
      });
    }
  });

  const compatibilityStageIndex = getNextStageTrackingIndex(
    input.validationBlocks,
  );

  if (input.compatibilityResult?.success === false) {
    input.compatibilityResult.diagnostics.forEach((diagnostic) => {
      diagnostics.push(
        createDiagnosticItem(
          compatibilityStageIndex,
          "compatibility",
          diagnostic,
        ),
      );
    });
  }

  const diffStageIndex = compatibilityStageIndex + 1;

  if (input.diffResult?.success === false) {
    input.diffResult.diagnostics.forEach((diagnostic) => {
      diagnostics.push(
        createDiagnosticItem(diffStageIndex, "diff", diagnostic),
      );
    });
  }

  if (input.diagnosticAggregate !== undefined) {
    input.diagnosticAggregate.diagnostics.forEach((diagnostic, index) => {
      diagnostics.push({
        stageTrackingIndex: diffStageIndex + 1 + index,
        artifactTarget: "diff",
        code: getStringField(diagnostic, "code", "AGGREGATED_DIAGNOSTIC"),
        message: getStringField(
          diagnostic,
          "message",
          "Aggregated diagnostic.",
        ),
        path: parsePath(getStringField(diagnostic, "path", "$")),
      });
    });
  }

  return Object.freeze(diagnostics.sort(compareDiagnostics));
}

function collectMismatches(
  input: BuildReplayGovernanceReportInput,
): readonly ReplayGovernanceMismatchItem[] {
  if (input.diffResult?.success !== true) {
    return Object.freeze([]);
  }

  const diffStageIndex = getNextStageTrackingIndex(input.validationBlocks) + 1;

  return Object.freeze(
    input.diffResult.data.diffs
      .map((diff) => ({
        stageTrackingIndex: diffStageIndex,
        code: createMismatchCode(diff.kind),
        kind: diff.kind,
        path: parsePath(diff.path),
        left: diff.left,
        right: diff.right,
      }))
      .sort(compareMismatches),
  );
}

function classifyReportCompatibility(
  compatibilityResult:
    | QuerySnapshotValidationResult<QueryReplayCompatibilityResult>
    | undefined,
  diffResult: QuerySnapshotValidationResult<QueryReplayDiffResult> | undefined,
  diffSummary: ReplayDiffSummary | undefined,
  diagnosticCount: number,
  mismatchCount: number,
): ReplayGovernanceReportCompatibility {
  if (
    compatibilityResult?.success === false ||
    diffResult?.success === false ||
    compatibilityResult?.data.compatible === false ||
    diffResult?.data.compatible === false ||
    diffSummary?.compatible === false ||
    diagnosticCount > 0
  ) {
    return "BREAKING_MISMATCH";
  }

  if (
    diffResult?.success === true &&
    diffResult.data.equivalent &&
    mismatchCount === 0
  ) {
    return "PERFECT_MATCH";
  }

  if (diffSummary?.equivalent === true && mismatchCount === 0) {
    return "PERFECT_MATCH";
  }

  if (mismatchCount > 0) {
    return "FORWARD_COMPATIBLE";
  }

  return "PERFECT_MATCH";
}

function createDiagnosticItem(
  stageTrackingIndex: number,
  artifactTarget: ReplayGovernanceDiagnosticItem["artifactTarget"],
  diagnostic: QuerySnapshotDiagnostic,
): ReplayGovernanceDiagnosticItem {
  return {
    stageTrackingIndex,
    artifactTarget,
    code: diagnostic.code,
    message: diagnostic.message,
    path: parsePath(diagnostic.path),
  };
}

function getTotalMismatchCount(
  input: BuildReplayGovernanceReportInput,
  mismatchEntryCount: number,
): number {
  if (input.diffResult?.success === true) {
    return mismatchEntryCount;
  }

  return input.diffSummary?.statistics.totalDiffCount ?? mismatchEntryCount;
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

function getNextStageTrackingIndex(
  validationBlocks: readonly ReplayGovernanceValidationBlock[],
): number {
  if (validationBlocks.length === 0) {
    return 0;
  }

  return (
    validationBlocks.reduce(
      (maxStageTrackingIndex, block) =>
        Math.max(maxStageTrackingIndex, block.stageTrackingIndex),
      0,
    ) + 1
  );
}

function parsePath(path: string): readonly string[] {
  if (path === "$") {
    return Object.freeze(["$"]);
  }

  return Object.freeze(path.replaceAll("[", ".[").split("."));
}

function createMismatchCode(kind: QueryReplayDiffEntry["kind"]): string {
  switch (kind) {
    case "artifact-kind":
      return "REPLAY_MISMATCH_ARTIFACT_KIND";
    case "provenance":
      return "REPLAY_MISMATCH_PROVENANCE";
    case "schema-version":
      return "REPLAY_MISMATCH_SCHEMA_VERSION";
    case "snapshot-id":
      return "REPLAY_MISMATCH_SNAPSHOT_ID";
    case "structural":
      return "REPLAY_MISMATCH_STRUCTURAL";
  }
}

function getStringField(
  value: { readonly [key: string]: unknown },
  field: string,
  fallback: string,
): string {
  const fieldValue = value[field];

  return typeof fieldValue === "string" ? fieldValue : fallback;
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
