import type { SearchCorpus } from "../../index-primitives";
import type { QueryExecutionPlan } from "../../query-ir";
import type {
  CompiledQueryPlan,
  CompileQueryResult,
  QueryCompileDiagnostic,
  QueryLexeme,
  QueryParserDiagnostic,
  QueryAstNode,
  QueryParserDiagnosticSeverity,
} from "../../query-parser";
import type { Query, QueryExecutionResult } from "../../query-engine";
import type {
  QueryExecutionTrace,
  QueryExplanation,
} from "../../query-tracing";

export interface ExecuteQueryPipelineInput {
  readonly rawQuery: string;
  readonly corpus: SearchCorpus;
  readonly options?: ExecuteQueryPipelineOptions;
}

export interface ExecuteQueryPipelineOptions {
  readonly explain?: boolean;
  readonly trace?: boolean;
  readonly traceId: string;
}

export type QueryPipelineStage =
  | "lex"
  | "parse"
  | "compile"
  | "plan"
  | "execute";

export interface QueryPipelineDiagnosticBase {
  readonly stage: QueryPipelineStage;
  readonly code: string;
  readonly message: string;
  readonly severity: QueryParserDiagnosticSeverity;
}

export interface LexQueryPipelineDiagnostic extends QueryPipelineDiagnosticBase {
  readonly stage: "lex";
}

export interface ParseQueryPipelineDiagnostic extends QueryPipelineDiagnosticBase {
  readonly stage: "parse";
  readonly diagnostic: QueryParserDiagnostic;
}

export interface CompileQueryPipelineDiagnostic extends QueryPipelineDiagnosticBase {
  readonly stage: "compile";
  readonly diagnostic: QueryCompileDiagnostic;
}

export interface ExecuteQueryPipelineDiagnostic extends QueryPipelineDiagnosticBase {
  readonly stage: "execute";
}

export interface PlanQueryPipelineDiagnostic extends QueryPipelineDiagnosticBase {
  readonly stage: "plan";
}

export type QueryPipelineDiagnostic =
  | LexQueryPipelineDiagnostic
  | ParseQueryPipelineDiagnostic
  | CompileQueryPipelineDiagnostic
  | PlanQueryPipelineDiagnostic
  | ExecuteQueryPipelineDiagnostic;

export interface QueryPipelineStageResult<TStage extends QueryPipelineStage> {
  readonly stage: TStage;
  readonly success: boolean;
  readonly diagnostics: readonly QueryPipelineDiagnostic[];
}

export interface QueryPipelineMetadata {
  readonly rawQuery: string;
  readonly lexemes: readonly QueryLexeme[];
  readonly ast: QueryAstNode | null;
  readonly plan: CompiledQueryPlan | null;
  readonly executionPlan: QueryExecutionPlan | null;
  readonly executionQuery: Query | null;
}

export interface ExecuteQueryPipelineResult {
  readonly success: boolean;
  readonly diagnostics: readonly QueryPipelineDiagnostic[];
  readonly metadata: QueryPipelineMetadata;
  readonly parseResult: QueryPipelineStageResult<"parse">;
  readonly compileResult: CompileQueryResult | null;
  readonly executionPlanResult: QueryPipelineStageResult<"plan"> | null;
  readonly executionResult: QueryExecutionResult | null;
  readonly queryExplanation?: QueryExplanation;
  readonly executionTrace?: QueryExecutionTrace;
}
