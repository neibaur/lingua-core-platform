import type {
  JsonObject,
  ReplayAggregationArtifact,
  ReplayAggregationStage,
  ReplayAggregationSummary,
  ReplayDiagnosticAggregate,
  ReplayDiagnosticGroup,
  ReplayDiffSeverity,
} from "./contracts";

const AGGREGATION_STAGE_ORDER: readonly ReplayAggregationStage[] = [
  "validation",
  "compatibility",
  "diff",
  "provenance",
];

const AGGREGATION_ARTIFACT_ORDER: readonly ReplayAggregationArtifact[] = [
  "snapshot-envelope",
  "query-pipeline-result",
  "execution-plan",
  "query-explanation",
  "query-execution-trace",
];

export function aggregateReplayDiagnostics(
  groups: readonly ReplayDiagnosticGroup[],
): ReplayDiagnosticAggregate {
  const orderedGroups = orderDiagnosticGroups(groups);
  const diagnostics = orderedGroups.flatMap((group) =>
    group.diagnostics.map((diagnostic) =>
      freezeJsonObject({
        stage: group.stage,
        artifact: group.artifact,
        ...diagnostic,
      }),
    ),
  );
  const summaries = AGGREGATION_STAGE_ORDER.map((stage) =>
    summarizeAggregationStage(stage, orderedGroups),
  );

  return Object.freeze({
    totalDiagnosticCount: diagnostics.length,
    severity: diagnostics.length > 0 ? "error" : "none",
    summaries: Object.freeze(summaries),
    diagnostics: Object.freeze(diagnostics),
  });
}

function summarizeAggregationStage(
  stage: ReplayAggregationStage,
  groups: readonly ReplayDiagnosticGroup[],
): ReplayAggregationSummary {
  const stageGroups = groups.filter((group) => group.stage === stage);
  const diagnosticCount = stageGroups.reduce(
    (count, group) => count + group.diagnostics.length,
    0,
  );
  const artifactCount = stageGroups.filter(
    (group) => group.diagnostics.length > 0,
  ).length;

  return Object.freeze({
    stage,
    diagnosticCount,
    artifactCount,
    severity: classifyAggregationSeverity(diagnosticCount),
  });
}

function orderDiagnosticGroups(
  groups: readonly ReplayDiagnosticGroup[],
): readonly ReplayDiagnosticGroup[] {
  return Object.freeze(
    [...groups].sort((left, right) => {
      const stageComparison =
        getStageOrder(left.stage) - getStageOrder(right.stage);

      if (stageComparison !== 0) {
        return stageComparison;
      }

      return getArtifactOrder(left.artifact) - getArtifactOrder(right.artifact);
    }),
  );
}

function classifyAggregationSeverity(
  diagnosticCount: number,
): ReplayDiffSeverity {
  return diagnosticCount > 0 ? "error" : "none";
}

function getStageOrder(stage: ReplayAggregationStage): number {
  return AGGREGATION_STAGE_ORDER.indexOf(stage);
}

function getArtifactOrder(artifact: ReplayAggregationArtifact): number {
  return AGGREGATION_ARTIFACT_ORDER.indexOf(artifact);
}

function freezeJsonObject(value: JsonObject): JsonObject {
  const entries = Object.entries(value).map(([key, entryValue]) => {
    if (
      Array.isArray(entryValue) ||
      (entryValue !== null && typeof entryValue === "object")
    ) {
      return [key, freezeJsonObject(entryValue as JsonObject)] as const;
    }

    return [key, entryValue] as const;
  });

  return Object.freeze(Object.fromEntries(entries)) as JsonObject;
}
