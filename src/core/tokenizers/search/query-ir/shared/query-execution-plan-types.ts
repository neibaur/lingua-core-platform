import type { SourceSpan } from "../../query-parser";

export const QUERY_EXECUTION_PLAN_FORMAT_VERSION = "query-execution-plan-v1";

export type QueryExecutionPlanNodeType = "token" | "phrase" | "boolean";

export type QueryExecutionPlanNode =
  | {
      readonly type: "token";
      readonly id: string;
      readonly term: string;
      readonly normalizedTerm: string;
      readonly sourceSpan: SourceSpan;
    }
  | {
      readonly type: "phrase";
      readonly id: string;
      readonly terms: readonly string[];
      readonly normalizedTerms: readonly string[];
      readonly sourceSpan: SourceSpan;
    }
  | {
      readonly type: "boolean";
      readonly id: string;
      readonly operator: "AND" | "OR";
      readonly children: readonly QueryExecutionPlanNode[];
      readonly sourceSpan: SourceSpan;
    };

export type TokenExecutionPlanNode = Extract<
  QueryExecutionPlanNode,
  { readonly type: "token" }
>;

export type PhraseExecutionPlanNode = Extract<
  QueryExecutionPlanNode,
  { readonly type: "phrase" }
>;

export type BooleanExecutionPlanNode = Extract<
  QueryExecutionPlanNode,
  { readonly type: "boolean" }
>;

export interface QueryExecutionPlanMetadata {
  readonly formatVersion: typeof QUERY_EXECUTION_PLAN_FORMAT_VERSION;
  readonly nodeCount: number;
  readonly sourceSpan: SourceSpan;
}

export interface QueryExecutionPlanDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly severity: "error";
  readonly sourceSpan: SourceSpan;
}

export interface QueryExecutionPlan {
  readonly formatVersion: typeof QUERY_EXECUTION_PLAN_FORMAT_VERSION;
  readonly root: QueryExecutionPlanNode;
  readonly metadata: QueryExecutionPlanMetadata;
  readonly diagnostics: readonly QueryExecutionPlanDiagnostic[];
}
