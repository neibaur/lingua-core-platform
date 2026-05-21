import type { Query, QueryExecutionResult } from "../../query-engine";
import type {
  QueryExecutionPlan,
  QueryExecutionPlanNode,
} from "../../query-ir";
import type {
  CompileQueryPipelineDiagnostic,
  ExecuteQueryPipelineResult,
  ParseQueryPipelineDiagnostic,
  QueryPipelineDiagnostic,
  QueryPipelineStage,
} from "../../query-pipeline";
import type {
  CompiledQueryPlan,
  QueryAstNode,
  QueryLexeme,
  SourceSpan,
} from "../../query-parser";
import type {
  QueryExecutionTraceMetadata,
  QueryExecutionTraceStatus,
  QueryExplanation,
  QueryExplanationArtifact,
  QueryExplanationArtifactType,
  QueryExplanationStage,
} from "../shared/query-tracing-types";
import { copySourceSpan, deepFreeze } from "../shared/serialization-safe";

const STAGE_ORDER: readonly QueryPipelineStage[] = [
  "lex",
  "parse",
  "compile",
  "plan",
  "execute",
];

export function buildQueryExplanation(
  input: Readonly<ExecuteQueryPipelineResult>,
): QueryExplanation {
  const artifacts = buildArtifacts(input);
  const stages = STAGE_ORDER.filter((stage) => didReachStage(stage, input)).map(
    (stage) => buildStage(stage, input, artifacts),
  );

  return deepFreeze({
    formatVersion: "query-explanation-v1" as const,
    success: input.success,
    stages,
    artifacts,
    diagnostics: input.diagnostics,
  });
}

function buildArtifacts(
  input: Readonly<ExecuteQueryPipelineResult>,
): readonly QueryExplanationArtifact[] {
  const artifacts: QueryExplanationArtifact[] = [
    createArtifact(
      0,
      "lex-result-summary",
      "lex",
      getLexSourceSpan(input.metadata.lexemes),
      summarizeLexemes(input.metadata.lexemes),
    ),
    createArtifact(
      1,
      "parse-result-summary",
      "parse",
      input.metadata.ast?.sourceSpan ?? null,
      {
        success: input.parseResult.success,
        diagnosticCount: input.parseResult.diagnostics.length,
        hasAst: input.metadata.ast !== null,
      },
    ),
  ];

  if (input.metadata.ast !== null) {
    artifacts.push(
      createArtifact(
        artifacts.length,
        "ast-summary",
        "parse",
        input.metadata.ast.sourceSpan,
        summarizeAst(input.metadata.ast),
      ),
    );
  }

  if (didReachStage("compile", input)) {
    artifacts.push(
      createArtifact(
        artifacts.length,
        "compile-result-summary",
        "compile",
        input.metadata.plan?.sourceSpan ??
          input.metadata.ast?.sourceSpan ??
          null,
        {
          success: input.compileResult?.success ?? false,
          diagnosticCount: input.compileResult?.diagnostics.length ?? 0,
          hasCompiledPlan: input.metadata.plan !== null,
          hasExecutionQuery: input.metadata.executionQuery !== null,
          planNodeCount:
            input.metadata.plan === null
              ? 0
              : countCompiledPlanNodes(input.metadata.plan),
        },
      ),
    );
  }

  if (input.metadata.executionQuery !== null) {
    artifacts.push(
      createArtifact(
        artifacts.length,
        "execution-query-summary",
        "compile",
        input.metadata.plan?.sourceSpan ?? null,
        summarizeExecutionQuery(input.metadata.executionQuery),
      ),
    );
  }

  if (didReachStage("plan", input)) {
    artifacts.push(
      createArtifact(
        artifacts.length,
        "execution-plan-summary",
        "plan",
        input.metadata.executionPlan?.metadata.sourceSpan ??
          input.metadata.plan?.sourceSpan ??
          null,
        summarizeExecutionPlan(input.metadata.executionPlan),
      ),
    );
  }

  if (didReachStage("execute", input)) {
    artifacts.push(
      createArtifact(
        artifacts.length,
        "execution-result-summary",
        "execute",
        input.metadata.executionPlan?.metadata.sourceSpan ?? null,
        summarizeExecutionResult(input.executionResult),
      ),
    );
  }

  artifacts.push(
    createArtifact(
      artifacts.length,
      "diagnostics-summary",
      getLastReachedStage(input),
      getDiagnosticSourceSpan(input.diagnostics),
      summarizeDiagnostics(input.diagnostics),
    ),
  );

  return artifacts;
}

function buildStage(
  stage: QueryPipelineStage,
  input: Readonly<ExecuteQueryPipelineResult>,
  artifacts: readonly QueryExplanationArtifact[],
): QueryExplanationStage {
  const diagnostics = input.diagnostics.filter(
    (diagnostic) => diagnostic.stage === stage,
  );

  return {
    stage,
    status: getStageStatus(stage, input, diagnostics),
    diagnosticCount: diagnostics.length,
    artifactTypes: artifacts
      .filter((artifact) => artifact.stage === stage)
      .map((artifact) => artifact.type),
    sourceSpan: getStageSourceSpan(stage, input),
  };
}

function createArtifact(
  index: number,
  type: QueryExplanationArtifactType,
  stage: QueryPipelineStage,
  sourceSpan: SourceSpan | null,
  data: QueryExecutionTraceMetadata,
): QueryExplanationArtifact {
  return {
    artifactId: `query-explanation-artifact-${String(index)}`,
    type,
    stage,
    sourceSpan: sourceSpan === null ? null : copySourceSpan(sourceSpan),
    data,
  };
}

function didReachStage(
  stage: QueryPipelineStage,
  input: Readonly<ExecuteQueryPipelineResult>,
): boolean {
  switch (stage) {
    case "lex":
    case "parse":
      return true;
    case "compile":
      return (
        input.compileResult !== null || hasStageDiagnostic(input, "compile")
      );
    case "plan":
      return (
        input.executionPlanResult !== null || hasStageDiagnostic(input, "plan")
      );
    case "execute":
      return (
        input.executionResult !== null || hasStageDiagnostic(input, "execute")
      );
  }
}

function hasStageDiagnostic(
  input: Readonly<ExecuteQueryPipelineResult>,
  stage: QueryPipelineStage,
): boolean {
  return input.diagnostics.some((diagnostic) => diagnostic.stage === stage);
}

function getStageStatus(
  stage: QueryPipelineStage,
  input: Readonly<ExecuteQueryPipelineResult>,
  diagnostics: readonly QueryPipelineDiagnostic[],
): QueryExecutionTraceStatus {
  if (diagnostics.length > 0) {
    return "diagnostic";
  }

  if (stage === "parse" && !input.parseResult.success) {
    return "diagnostic";
  }

  if (stage === "compile" && input.compileResult?.success === false) {
    return "diagnostic";
  }

  if (stage === "plan" && input.executionPlanResult?.success === false) {
    return "diagnostic";
  }

  return "success";
}

function getStageSourceSpan(
  stage: QueryPipelineStage,
  input: Readonly<ExecuteQueryPipelineResult>,
): SourceSpan | null {
  switch (stage) {
    case "lex":
      return getLexSourceSpan(input.metadata.lexemes);
    case "parse":
      return (
        input.metadata.ast?.sourceSpan ??
        getDiagnosticSourceSpan(input.diagnostics)
      );
    case "compile":
      return (
        input.metadata.plan?.sourceSpan ??
        input.metadata.ast?.sourceSpan ??
        null
      );
    case "plan":
      return (
        input.metadata.executionPlan?.metadata.sourceSpan ??
        input.metadata.plan?.sourceSpan ??
        null
      );
    case "execute":
      return input.metadata.executionPlan?.metadata.sourceSpan ?? null;
  }
}

function getLastReachedStage(
  input: Readonly<ExecuteQueryPipelineResult>,
): QueryPipelineStage {
  return (
    [...STAGE_ORDER].reverse().find((stage) => didReachStage(stage, input)) ??
    "parse"
  );
}

function getLexSourceSpan(lexemes: readonly QueryLexeme[]): SourceSpan | null {
  if (lexemes.length === 0) {
    return null;
  }

  return {
    start: lexemes[0].rawSpan.start,
    end: lexemes[lexemes.length - 1].rawSpan.end,
  };
}

function getDiagnosticSourceSpan(
  diagnostics: readonly QueryPipelineDiagnostic[],
): SourceSpan | null {
  const diagnostic = diagnostics.find(
    (
      item,
    ): item is ParseQueryPipelineDiagnostic | CompileQueryPipelineDiagnostic =>
      item.stage === "parse" || item.stage === "compile",
  );

  if (diagnostic === undefined) {
    return null;
  }

  if ("span" in diagnostic.diagnostic) {
    return diagnostic.diagnostic.span;
  }

  return diagnostic.diagnostic.sourceSpan;
}

function summarizeLexemes(
  lexemes: readonly QueryLexeme[],
): QueryExecutionTraceMetadata {
  return {
    lexemeCount: lexemes.length,
    lexemeTypes: lexemes.map((lexeme) => lexeme.type),
    lexemes: lexemes.map((lexeme) => ({
      type: lexeme.type,
      value: lexeme.value,
      rawSpan: summarizeSourceSpan(lexeme.rawSpan),
      normalizedSpan: summarizeSourceSpan(lexeme.normalizedSpan),
    })),
  };
}

function summarizeAst(ast: QueryAstNode): QueryExecutionTraceMetadata {
  switch (ast.type) {
    case "TOKEN":
      return {
        type: ast.type,
        token: ast.token,
        sourceSpan: summarizeSourceSpan(ast.sourceSpan),
      };
    case "PHRASE":
      return {
        type: ast.type,
        phrase: ast.phrase,
        sourceSpan: summarizeSourceSpan(ast.sourceSpan),
      };
    case "BOOLEAN":
      return {
        type: ast.type,
        operator: ast.operator,
        clauseCount: ast.clauses.length,
        sourceSpan: summarizeSourceSpan(ast.sourceSpan),
        clauses: ast.clauses.map((clause) => summarizeAst(clause)),
      };
    case "GROUP":
      return {
        type: ast.type,
        sourceSpan: summarizeSourceSpan(ast.sourceSpan),
        expression: summarizeAst(ast.expression),
      };
  }
}

function summarizeExecutionQuery(query: Query): QueryExecutionTraceMetadata {
  switch (query.kind) {
    case "token":
      return {
        kind: query.kind,
        token: query.token,
      };
    case "phrase":
      return {
        kind: query.kind,
        tokenCount: query.tokens.length,
        tokens: query.tokens,
      };
    case "boolean":
      return {
        kind: query.kind,
        operator: query.operator,
        queryCount: query.queries.length,
        queries: query.queries.map((childQuery) =>
          summarizeExecutionQuery(childQuery),
        ),
      };
  }
}

function summarizeExecutionPlan(
  executionPlan: QueryExecutionPlan | null,
): QueryExecutionTraceMetadata {
  if (executionPlan === null) {
    return {
      hasExecutionPlan: false,
      nodeCount: 0,
    };
  }

  return {
    hasExecutionPlan: true,
    formatVersion: executionPlan.formatVersion,
    nodeCount: executionPlan.metadata.nodeCount,
    sourceSpan: summarizeSourceSpan(executionPlan.metadata.sourceSpan),
    root: summarizeExecutionPlanNode(executionPlan.root),
  };
}

function summarizeExecutionPlanNode(
  node: QueryExecutionPlanNode,
): QueryExecutionTraceMetadata {
  switch (node.type) {
    case "token":
      return {
        type: node.type,
        id: node.id,
        term: node.term,
        normalizedTerm: node.normalizedTerm,
        sourceSpan: summarizeSourceSpan(node.sourceSpan),
      };
    case "phrase":
      return {
        type: node.type,
        id: node.id,
        terms: node.terms,
        normalizedTerms: node.normalizedTerms,
        sourceSpan: summarizeSourceSpan(node.sourceSpan),
      };
    case "boolean":
      return {
        type: node.type,
        id: node.id,
        operator: node.operator,
        childCount: node.children.length,
        sourceSpan: summarizeSourceSpan(node.sourceSpan),
        children: node.children.map((childNode) =>
          summarizeExecutionPlanNode(childNode),
        ),
      };
  }
}

function summarizeExecutionResult(
  executionResult: QueryExecutionResult | null,
): QueryExecutionTraceMetadata {
  if (executionResult === null) {
    return {
      matchCount: 0,
      documentIds: [],
    };
  }

  return {
    matchCount: executionResult.matches.length,
    documentIds: executionResult.matches.map((match) => match.documentId),
    matches: executionResult.matches.map((match) => ({
      documentId: match.documentId,
      tokenPositions: match.tokenPositions,
      spanCount: match.spans.length,
      spans: match.spans.map((span) => ({
        normalizedStart: span.normalizedStart,
        normalizedEnd: span.normalizedEnd,
        originalStart: span.originalStart,
        originalEnd: span.originalEnd,
      })),
    })),
  };
}

function summarizeDiagnostics(
  diagnostics: readonly QueryPipelineDiagnostic[],
): QueryExecutionTraceMetadata {
  return {
    diagnosticCount: diagnostics.length,
    diagnostics: diagnostics.map((diagnostic) => ({
      stage: diagnostic.stage,
      code: diagnostic.code,
      severity: diagnostic.severity,
      message: diagnostic.message,
    })),
  };
}

function countCompiledPlanNodes(plan: CompiledQueryPlan): number {
  return (
    1 +
    plan.children.reduce(
      (nodeCount, childPlan) => nodeCount + countCompiledPlanNodes(childPlan),
      0,
    )
  );
}

function summarizeSourceSpan(
  sourceSpan: SourceSpan,
): QueryExecutionTraceMetadata {
  return {
    start: sourceSpan.start,
    end: sourceSpan.end,
  };
}
