import type { ExecuteQueryPipelineResult } from "../query-pipeline";
import type { QueryExecutionPlan } from "../query-ir";
import type { QueryExecutionTrace, QueryExplanation } from "../query-tracing";

export const QUERY_SNAPSHOT_SCHEMA_VERSION =
  "lingua-core-platform:query-snapshot@phase9";

export type QuerySnapshotSchemaVersion = typeof QUERY_SNAPSHOT_SCHEMA_VERSION;

export type QuerySnapshotArtifactKind =
  | "query-pipeline-result"
  | "execution-plan"
  | "query-explanation"
  | "query-execution-trace";

export type QuerySnapshotId = `query-snapshot-${number}`;

export interface QuerySnapshotEnvelope<
  TArtifactKind extends QuerySnapshotArtifactKind,
  TArtifact,
> {
  readonly schemaVersion: QuerySnapshotSchemaVersion;
  readonly artifactKind: TArtifactKind;
  readonly snapshotId: QuerySnapshotId;
  readonly artifact: TArtifact;
}

export type QueryPipelineSnapshot = QuerySnapshotEnvelope<
  "query-pipeline-result",
  ExecuteQueryPipelineResult
>;

export type ExecutionPlanSnapshot = QuerySnapshotEnvelope<
  "execution-plan",
  QueryExecutionPlan
>;

export type QueryExplanationSnapshot = QuerySnapshotEnvelope<
  "query-explanation",
  QueryExplanation
>;

export type QueryExecutionTraceSnapshot = QuerySnapshotEnvelope<
  "query-execution-trace",
  QueryExecutionTrace
>;

export type QueryReplaySnapshot =
  | QueryPipelineSnapshot
  | ExecutionPlanSnapshot
  | QueryExplanationSnapshot
  | QueryExecutionTraceSnapshot;

export interface QuerySnapshotBundle {
  readonly schemaVersion: QuerySnapshotSchemaVersion;
  readonly snapshots: readonly QueryReplaySnapshot[];
}

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type JsonObject = { readonly [key: string]: JsonValue };

export type QueryReplayCompatibilityClassification =
  | "compatible"
  | "incompatible";

export type QueryReplayDiffClassification =
  | "equivalent"
  | "different"
  | "incompatible";

export type QueryReplayDiffKind =
  | "schema-version"
  | "artifact-kind"
  | "snapshot-id"
  | "provenance"
  | "structural";

export type QueryReplayDiffValue =
  | {
      readonly present: true;
      readonly value: JsonValue;
    }
  | {
      readonly present: false;
    };

export interface QueryReplayDiffEntry {
  readonly path: string;
  readonly kind: QueryReplayDiffKind;
  readonly left: QueryReplayDiffValue;
  readonly right: QueryReplayDiffValue;
}

export interface QueryReplayDiffResult {
  readonly classification: QueryReplayDiffClassification;
  readonly equivalent: boolean;
  readonly compatible: boolean;
  readonly serializedLeft: string;
  readonly serializedRight: string;
  readonly diffs: readonly QueryReplayDiffEntry[];
}

export interface QueryReplayCompatibilityResult {
  readonly classification: QueryReplayCompatibilityClassification;
  readonly compatible: boolean;
  readonly schemaVersionCompatible: boolean;
  readonly artifactKindCompatible: boolean;
  readonly migrationRequired: boolean;
}

export type ReplayDiffSeverity = "none" | "warning" | "error";

export type ReplayDiffSummaryStage =
  | "envelope"
  | "artifact"
  | "provenance"
  | "compatibility";

export interface ReplayDiffStatistics {
  readonly totalDiffCount: number;
  readonly envelopeDiffCount: number;
  readonly artifactDiffCount: number;
  readonly provenanceMismatchCount: number;
  readonly incompatibilityCount: number;
}

export interface ReplayDiffStageSummary {
  readonly stage: ReplayDiffSummaryStage;
  readonly severity: ReplayDiffSeverity;
  readonly diffCount: number;
  readonly paths: readonly string[];
}

export interface ReplayCompatibilitySummary {
  readonly compatible: boolean;
  readonly severity: ReplayDiffSeverity;
  readonly schemaVersionCompatible: boolean;
  readonly artifactKindCompatible: boolean;
  readonly migrationRequired: boolean;
}

export interface ReplayDiffSummary {
  readonly classification: QueryReplayDiffClassification;
  readonly severity: ReplayDiffSeverity;
  readonly equivalent: boolean;
  readonly compatible: boolean;
  readonly statistics: ReplayDiffStatistics;
  readonly stageSummaries: readonly ReplayDiffStageSummary[];
  readonly compatibilitySummary: ReplayCompatibilitySummary;
}

export type ReplayAggregationStage =
  | "validation"
  | "compatibility"
  | "diff"
  | "provenance";

export type ReplayAggregationArtifact =
  | "snapshot-envelope"
  | QuerySnapshotArtifactKind;

export interface ReplayDiagnosticGroup {
  readonly stage: ReplayAggregationStage;
  readonly artifact: ReplayAggregationArtifact;
  readonly diagnostics: readonly JsonObject[];
}

export interface ReplayAggregationSummary {
  readonly stage: ReplayAggregationStage;
  readonly diagnosticCount: number;
  readonly artifactCount: number;
  readonly severity: ReplayDiffSeverity;
}

export interface ReplayDiagnosticAggregate {
  readonly totalDiagnosticCount: number;
  readonly severity: ReplayDiffSeverity;
  readonly summaries: readonly ReplayAggregationSummary[];
  readonly diagnostics: readonly JsonObject[];
}

export type ReplayArtifactValidationTarget =
  | "snapshot-envelope"
  | "query-pipeline-result"
  | "execution-plan"
  | "query-explanation"
  | "query-execution-trace";

export interface ReplayValidatorQueryAstNodeShape {
  readonly kind: string;
  readonly sourceSpan: {
    readonly start: number;
    readonly end: number;
  };
  readonly nodes?: readonly unknown[];
}

export interface ReplayValidatorCompiledExecutionPlanShape {
  readonly planId: string;
  readonly sequentialNodes: readonly unknown[];
  readonly artifactKind: "EXECUTION_PLAN";
}

export interface ReplayValidatorQueryExecutionTraceShape {
  readonly traceId: string;
  readonly steps: readonly unknown[];
  readonly stepCount: number;
}

export interface ReplayValidatorQueryExplanationShape {
  readonly artifactKind: "QUERY_EXPLANATION";
  readonly formatVersion: "query-explanation-v1";
  readonly success: boolean;
  readonly stages: readonly unknown[];
  readonly artifacts: readonly unknown[];
  readonly diagnostics: readonly unknown[];
}

export interface ReplayValidatorQueryPipelineResultShape {
  readonly artifactKind: "QUERY_PIPELINE_RESULT";
  readonly query: string;
  readonly lexemes: readonly string[];
  readonly astJson: string;
  readonly executionPlanId: string;
  readonly traceId: string;
  readonly explanationId: string;
}

export interface ReplayArtifactValidatorDispatch {
  readonly target: ReplayArtifactValidationTarget;
  readonly artifact: unknown;
}
