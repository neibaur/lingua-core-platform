import type {
  QueryReplayCompatibilityResult,
  QueryReplayDiffEntry,
  QueryReplayDiffKind,
  QueryReplayDiffResult,
  ReplayCompatibilitySummary,
  ReplayDiffSeverity,
  ReplayDiffStageSummary,
  ReplayDiffStatistics,
  ReplayDiffSummary,
  ReplayDiffSummaryStage,
} from "./contracts";

const DIFF_SUMMARY_STAGE_ORDER: readonly ReplayDiffSummaryStage[] = [
  "envelope",
  "artifact",
  "provenance",
  "compatibility",
];

export function summarizeReplayDiff(
  diffResult: QueryReplayDiffResult,
  compatibilityResult?: QueryReplayCompatibilityResult,
): ReplayDiffSummary {
  const compatibilitySummary = summarizeReplayCompatibility(
    compatibilityResult ?? createCompatibilityFromDiff(diffResult),
  );
  const statistics = summarizeDiffStatistics(diffResult);
  const stageSummaries = DIFF_SUMMARY_STAGE_ORDER.map((stage) =>
    summarizeStage(stage, diffResult.diffs, compatibilitySummary),
  );
  const severity = classifySummarySeverity(diffResult, statistics);

  return Object.freeze({
    classification: diffResult.classification,
    severity,
    equivalent: diffResult.equivalent,
    compatible: diffResult.compatible,
    statistics,
    stageSummaries: Object.freeze(stageSummaries),
    compatibilitySummary,
  });
}

export function summarizeReplayCompatibility(
  compatibilityResult: QueryReplayCompatibilityResult,
): ReplayCompatibilitySummary {
  return Object.freeze({
    compatible: compatibilityResult.compatible,
    severity: compatibilityResult.compatible ? "none" : "error",
    schemaVersionCompatible: compatibilityResult.schemaVersionCompatible,
    artifactKindCompatible: compatibilityResult.artifactKindCompatible,
    migrationRequired: compatibilityResult.migrationRequired,
  });
}

function summarizeDiffStatistics(
  diffResult: QueryReplayDiffResult,
): ReplayDiffStatistics {
  const envelopeDiffCount = countDiffs(diffResult.diffs, (diff) =>
    isEnvelopeDiffKind(diff.kind),
  );
  const provenanceMismatchCount = countDiffs(
    diffResult.diffs,
    (diff) => diff.kind === "provenance",
  );
  const artifactDiffCount =
    diffResult.diffs.length - envelopeDiffCount - provenanceMismatchCount;
  const incompatibilityCount = countDiffs(diffResult.diffs, (diff) =>
    isIncompatibilityDiffKind(diff.kind),
  );

  return Object.freeze({
    totalDiffCount: diffResult.diffs.length,
    envelopeDiffCount,
    artifactDiffCount,
    provenanceMismatchCount,
    incompatibilityCount,
  });
}

function summarizeStage(
  stage: ReplayDiffSummaryStage,
  diffs: readonly QueryReplayDiffEntry[],
  compatibilitySummary: ReplayCompatibilitySummary,
): ReplayDiffStageSummary {
  const stageDiffs = diffs.filter((diff) => getDiffStage(diff) === stage);
  const diffCount =
    stage === "compatibility" && !compatibilitySummary.compatible
      ? 1
      : stageDiffs.length;

  return Object.freeze({
    stage,
    severity: classifyStageSeverity(stage, stageDiffs, compatibilitySummary),
    diffCount,
    paths: Object.freeze(stageDiffs.map((diff) => diff.path)),
  });
}

function classifySummarySeverity(
  diffResult: QueryReplayDiffResult,
  statistics: ReplayDiffStatistics,
): ReplayDiffSeverity {
  if (!diffResult.compatible || statistics.incompatibilityCount > 0) {
    return "error";
  }

  if (statistics.totalDiffCount > 0) {
    return "warning";
  }

  return "none";
}

function classifyStageSeverity(
  stage: ReplayDiffSummaryStage,
  diffs: readonly QueryReplayDiffEntry[],
  compatibilitySummary: ReplayCompatibilitySummary,
): ReplayDiffSeverity {
  if (stage === "compatibility") {
    return compatibilitySummary.severity;
  }

  if (diffs.some((diff) => isIncompatibilityDiffKind(diff.kind))) {
    return "error";
  }

  if (diffs.length > 0) {
    return "warning";
  }

  return "none";
}

function createCompatibilityFromDiff(
  diffResult: QueryReplayDiffResult,
): QueryReplayCompatibilityResult {
  return Object.freeze({
    classification: diffResult.compatible ? "compatible" : "incompatible",
    compatible: diffResult.compatible,
    schemaVersionCompatible: !diffResult.diffs.some(
      (diff) => diff.kind === "schema-version",
    ),
    artifactKindCompatible: !diffResult.diffs.some(
      (diff) => diff.kind === "artifact-kind",
    ),
    migrationRequired: false,
  });
}

function getDiffStage(diff: QueryReplayDiffEntry): ReplayDiffSummaryStage {
  if (diff.kind === "provenance") {
    return "provenance";
  }

  if (isEnvelopeDiffKind(diff.kind)) {
    return "envelope";
  }

  return "artifact";
}

function countDiffs(
  diffs: readonly QueryReplayDiffEntry[],
  predicate: (diff: QueryReplayDiffEntry) => boolean,
): number {
  return diffs.filter(predicate).length;
}

function isEnvelopeDiffKind(kind: QueryReplayDiffKind): boolean {
  return (
    kind === "schema-version" ||
    kind === "artifact-kind" ||
    kind === "snapshot-id"
  );
}

function isIncompatibilityDiffKind(kind: QueryReplayDiffKind): boolean {
  return kind === "schema-version" || kind === "artifact-kind";
}
