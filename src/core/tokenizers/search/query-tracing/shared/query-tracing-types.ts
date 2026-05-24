import type { SourceSpan } from "../../query-parser";
import type {
  QueryPipelineDiagnostic,
  QueryPipelineStage,
} from "../../query-pipeline";

export type QueryExecutionTraceStage = QueryPipelineStage;

export type QueryExecutionTraceStatus = "success" | "diagnostic";

export type QueryTraceMetadataPrimitive = string | number | boolean;

export type QueryExecutionTraceMetadata =
  | QueryTraceMetadataPrimitive
  | readonly QueryExecutionTraceMetadata[]
  | { readonly [key: string]: QueryExecutionTraceMetadata };

export interface QueryExecutionTraceStep {
  readonly stepId: string;
  readonly stage: QueryExecutionTraceStage;
  readonly status: QueryExecutionTraceStatus;
  readonly timestamp: null;
  readonly metadata: { readonly [key: string]: QueryExecutionTraceMetadata };
}

export interface QueryExecutionTrace {
  readonly traceId: string;
  readonly stepCount: number;
  readonly steps: readonly QueryExecutionTraceStep[];
}

export type QueryExplanationArtifactType =
  | "lex-result-summary"
  | "parse-result-summary"
  | "ast-summary"
  | "compile-result-summary"
  | "execution-plan-summary"
  | "execution-query-summary"
  | "execution-result-summary"
  | "diagnostics-summary";

export interface QueryExplanationStage {
  readonly stage: QueryPipelineStage;
  readonly status: QueryExecutionTraceStatus;
  readonly diagnosticCount: number;
  readonly artifactTypes: readonly QueryExplanationArtifactType[];
  readonly sourceSpan: SourceSpan | null;
}

export interface QueryExplanationArtifact {
  readonly artifactId: string;
  readonly type: QueryExplanationArtifactType;
  readonly stage: QueryPipelineStage;
  readonly sourceSpan: SourceSpan | null;
  readonly data: QueryExecutionTraceMetadata;
}

export interface QueryExplanation {
  readonly formatVersion: "query-explanation-v1";
  readonly success: boolean;
  readonly stages: readonly QueryExplanationStage[];
  readonly artifacts: readonly QueryExplanationArtifact[];
  readonly diagnostics: readonly QueryPipelineDiagnostic[];
}
