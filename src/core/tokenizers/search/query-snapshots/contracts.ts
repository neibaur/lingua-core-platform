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
