import type { QueryPipelineDiagnostic } from "../shared/query-pipeline-types";
import type {
  ExecuteQueryPipelineInput,
  ExecuteQueryPipelineOptions,
  ExecuteQueryPipelineResult,
  QueryPipelineMetadata,
  QueryPipelineStageResult,
} from "../shared/query-pipeline-types";
import { executeQuery } from "../../query-engine";
import { buildQueryExecutionPlan } from "../../query-ir";
import {
  buildQueryExecutionTrace,
  buildQueryExplanation,
} from "../../query-tracing";
import type { CompileQueryResult } from "../../query-parser";
import { compileQueryAst, lexQuery, parseQuery } from "../../query-parser";
import type {
  QueryCompileDiagnostic,
  QueryLexeme,
  QueryParserDiagnostic,
} from "../../query-parser";

export function executeQueryPipeline(
  input: ExecuteQueryPipelineInput,
): ExecuteQueryPipelineResult {
  const lexemes = lexQuery(input.rawQuery);
  const parseResult = parseQuery(input.rawQuery);
  const parseDiagnostics = parseResult.diagnostics.map(createParseDiagnostic);
  const parseStageResult: QueryPipelineStageResult<"parse"> = Object.freeze({
    stage: "parse",
    success: parseDiagnostics.length === 0,
    diagnostics: Object.freeze(parseDiagnostics),
  });

  if (parseDiagnostics.length > 0 || parseResult.ast === null) {
    return createPipelineResult(input.options, {
      rawQuery: input.rawQuery,
      lexemes,
      ast: parseResult.ast,
      plan: null,
      executionPlan: null,
      executionQuery: null,
      diagnostics: parseDiagnostics,
      parseStageResult,
      compileResult: null,
      executionPlanResult: null,
      executionResult: null,
    });
  }

  const compileResult = compileQueryAst(parseResult.ast);
  const compileDiagnostics = compileResult.diagnostics.map(
    createCompileDiagnostic,
  );

  if (
    compileDiagnostics.length > 0 ||
    compileResult.plan === null ||
    compileResult.query === null
  ) {
    return createPipelineResult(input.options, {
      rawQuery: input.rawQuery,
      lexemes,
      ast: parseResult.ast,
      plan: compileResult.plan,
      executionPlan: null,
      executionQuery: compileResult.query,
      diagnostics: compileDiagnostics,
      parseStageResult,
      compileResult,
      executionPlanResult: null,
      executionResult: null,
    });
  }

  const executionPlan = buildQueryExecutionPlan(compileResult.plan);
  const executionPlanStageResult: QueryPipelineStageResult<"plan"> =
    Object.freeze({
      stage: "plan",
      success: executionPlan.diagnostics.length === 0,
      diagnostics: Object.freeze([]),
    });

  const executionResult = executeQuery(
    input.corpus.invertedIndex,
    compileResult.query,
  );

  return createPipelineResult(input.options, {
    rawQuery: input.rawQuery,
    lexemes,
    ast: parseResult.ast,
    plan: compileResult.plan,
    executionPlan,
    executionQuery: compileResult.query,
    diagnostics: [],
    parseStageResult,
    compileResult,
    executionPlanResult: executionPlanStageResult,
    executionResult,
  });
}

function createPipelineResult(
  options: ExecuteQueryPipelineOptions | undefined,
  input: {
    readonly rawQuery: string;
    readonly lexemes: readonly QueryLexeme[];
    readonly ast: QueryPipelineMetadata["ast"];
    readonly plan: QueryPipelineMetadata["plan"];
    readonly executionPlan: QueryPipelineMetadata["executionPlan"];
    readonly executionQuery: QueryPipelineMetadata["executionQuery"];
    readonly diagnostics: readonly QueryPipelineDiagnostic[];
    readonly parseStageResult: QueryPipelineStageResult<"parse">;
    readonly compileResult: CompileQueryResult | null;
    readonly executionPlanResult: QueryPipelineStageResult<"plan"> | null;
    readonly executionResult: ExecuteQueryPipelineResult["executionResult"];
  },
): ExecuteQueryPipelineResult {
  const result: ExecuteQueryPipelineResult = {
    success: input.diagnostics.length === 0,
    diagnostics: Object.freeze([...input.diagnostics]),
    metadata: Object.freeze({
      rawQuery: input.rawQuery,
      lexemes: Object.freeze([...input.lexemes]),
      ast: input.ast,
      plan: input.plan,
      executionPlan: input.executionPlan,
      executionQuery: input.executionQuery,
    }),
    parseResult: input.parseStageResult,
    compileResult: input.compileResult,
    executionPlanResult: input.executionPlanResult,
    executionResult: input.executionResult,
  };

  const baseResult = Object.freeze(result);

  if (options?.explain !== true && options?.trace !== true) {
    return baseResult;
  }

  return Object.freeze({
    ...baseResult,
    ...(options.explain === true
      ? { queryExplanation: buildQueryExplanation(baseResult) }
      : {}),
    ...(options.trace === true
      ? {
          executionTrace: buildQueryExecutionTrace({
            traceId: options.traceId ?? "pipeline-execution-trace",
            ...baseResult,
          }),
        }
      : {}),
  });
}

function createParseDiagnostic(
  diagnostic: QueryParserDiagnostic,
): QueryPipelineDiagnostic {
  return Object.freeze({
    stage: "parse",
    code: diagnostic.code,
    message: diagnostic.message,
    severity: diagnostic.severity,
    diagnostic,
  });
}

function createCompileDiagnostic(
  diagnostic: QueryCompileDiagnostic,
): QueryPipelineDiagnostic {
  return Object.freeze({
    stage: "compile",
    code: diagnostic.code,
    message: diagnostic.message,
    severity: diagnostic.severity,
    diagnostic,
  });
}
