import type { SearchCorpus } from "../../index-primitives";
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

export interface ExecuteQueryPipelineInput {
  readonly rawQuery: string;
  readonly corpus: SearchCorpus;
}

export type QueryPipelineStage = "lex" | "parse" | "compile" | "execute";

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

export type QueryPipelineDiagnostic =
  | LexQueryPipelineDiagnostic
  | ParseQueryPipelineDiagnostic
  | CompileQueryPipelineDiagnostic
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
  readonly executionQuery: Query | null;
}

export interface ExecuteQueryPipelineResult {
  readonly success: boolean;
  readonly diagnostics: readonly QueryPipelineDiagnostic[];
  readonly metadata: QueryPipelineMetadata;
  readonly parseResult: QueryPipelineStageResult<"parse">;
  readonly compileResult: CompileQueryResult | null;
  readonly executionResult: QueryExecutionResult | null;
}
