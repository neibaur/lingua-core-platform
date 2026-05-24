import type {
  ExecuteQueryPipelineResult,
  QueryPipelineDiagnostic,
  QueryPipelineStage,
} from "../../query-pipeline";
import type {
  QueryExecutionTrace,
  QueryExecutionTraceMetadata,
  QueryExecutionTraceStep,
} from "../shared/query-tracing-types";
import { deepFreeze } from "../shared/serialization-safe";

const TRACE_STAGE_ORDER: readonly QueryPipelineStage[] = [
  "lex",
  "parse",
  "compile",
  "plan",
  "execute",
];

export function buildQueryExecutionTrace(
  input: { readonly traceId: string } & Readonly<ExecuteQueryPipelineResult>,
): QueryExecutionTrace {
  if (input.traceId.trim() === "") {
    throw new Error(
      "[query-tracing invariant] traceId must be a non-empty string",
    );
  }

  const steps = TRACE_STAGE_ORDER.filter((stage) =>
    didReachStage(stage, input),
  ).map((stage, index) => buildStep(index, stage, input));

  return deepFreeze({
    traceId: input.traceId,
    stepCount: steps.length,
    steps,
  });
}

function buildStep(
  index: number,
  stage: QueryPipelineStage,
  input: Readonly<ExecuteQueryPipelineResult>,
): QueryExecutionTraceStep {
  const diagnostics = input.diagnostics.filter(
    (diagnostic) => diagnostic.stage === stage,
  );

  return {
    stepId: `query-trace-step-${String(index)}`,
    stage,
    status: getStageStatus(stage, input, diagnostics),
    timestamp: null,
    metadata: buildMetadata(stage, input, diagnostics),
  };
}

function buildMetadata(
  stage: QueryPipelineStage,
  input: Readonly<ExecuteQueryPipelineResult>,
  diagnostics: readonly QueryPipelineDiagnostic[],
): { readonly [key: string]: QueryExecutionTraceMetadata } {
  const baseMetadata = {
    diagnosticCount: diagnostics.length,
  };

  switch (stage) {
    case "lex":
      return {
        ...baseMetadata,
        lexemeCount: input.metadata.lexemes.length,
        lexemeTypes: input.metadata.lexemes.map((lexeme) => lexeme.type),
      };
    case "parse":
      return {
        ...baseMetadata,
        success: input.parseResult.success,
        hasAst: input.metadata.ast !== null,
      };
    case "compile":
      return {
        ...baseMetadata,
        success: input.compileResult?.success ?? false,
        hasCompiledPlan: input.metadata.plan !== null,
        hasExecutionQuery: input.metadata.executionQuery !== null,
      };
    case "plan":
      return {
        ...baseMetadata,
        success: input.executionPlanResult?.success ?? false,
        hasExecutionPlan: input.metadata.executionPlan !== null,
        executionPlanNodeCount:
          input.metadata.executionPlan?.metadata.nodeCount ?? 0,
      };
    case "execute":
      return {
        ...baseMetadata,
        hasExecutionResult: input.executionResult !== null,
        matchCount: input.executionResult?.matches.length ?? 0,
        documentIds:
          input.executionResult?.matches.map((match) => match.documentId) ?? [],
      };
  }
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
): "success" | "diagnostic" {
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
