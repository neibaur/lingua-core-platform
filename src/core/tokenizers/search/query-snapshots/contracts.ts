import type { ExecuteQueryPipelineResult } from "../query-pipeline";
import type { QueryExecutionPlan } from "../query-ir";
import type { QueryExecutionTrace, QueryExplanation } from "../query-tracing";

export const QUERY_SNAPSHOT_SCHEMA_VERSION = "query-snapshot-v1";

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
