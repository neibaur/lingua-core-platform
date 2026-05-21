import type { QueryPipelineDiagnostic } from "../shared/query-pipeline-types";
import type {
  ExecuteQueryPipelineInput,
  ExecuteQueryPipelineResult,
  QueryPipelineMetadata,
  QueryPipelineStageResult,
} from "../shared/query-pipeline-types";
import { executeQuery } from "../../query-engine";
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
    return createPipelineResult({
      rawQuery: input.rawQuery,
      lexemes,
      ast: parseResult.ast,
      plan: null,
      executionQuery: null,
      diagnostics: parseDiagnostics,
      parseStageResult,
      compileResult: null,
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
    return createPipelineResult({
      rawQuery: input.rawQuery,
      lexemes,
      ast: parseResult.ast,
      plan: compileResult.plan,
      executionQuery: compileResult.query,
      diagnostics: compileDiagnostics,
      parseStageResult,
      compileResult,
      executionResult: null,
    });
  }

  const executionResult = executeQuery(
    input.corpus.invertedIndex,
    compileResult.query,
  );

  return createPipelineResult({
    rawQuery: input.rawQuery,
    lexemes,
    ast: parseResult.ast,
    plan: compileResult.plan,
    executionQuery: compileResult.query,
    diagnostics: [],
    parseStageResult,
    compileResult,
    executionResult,
  });
}

function createPipelineResult(input: {
  readonly rawQuery: string;
  readonly lexemes: readonly QueryLexeme[];
  readonly ast: QueryPipelineMetadata["ast"];
  readonly plan: QueryPipelineMetadata["plan"];
  readonly executionQuery: QueryPipelineMetadata["executionQuery"];
  readonly diagnostics: readonly QueryPipelineDiagnostic[];
  readonly parseStageResult: QueryPipelineStageResult<"parse">;
  readonly compileResult: CompileQueryResult | null;
  readonly executionResult: ExecuteQueryPipelineResult["executionResult"];
}): ExecuteQueryPipelineResult {
  return Object.freeze({
    success: input.diagnostics.length === 0,
    diagnostics: Object.freeze([...input.diagnostics]),
    metadata: Object.freeze({
      rawQuery: input.rawQuery,
      lexemes: Object.freeze([...input.lexemes]),
      ast: input.ast,
      plan: input.plan,
      executionQuery: input.executionQuery,
    }),
    parseResult: input.parseStageResult,
    compileResult: input.compileResult,
    executionResult: input.executionResult,
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
