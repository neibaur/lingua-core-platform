import type {
  BooleanQueryNode,
  GroupedQueryNode,
  PhraseQueryNode,
  QueryAstNode,
  TokenQueryNode,
} from "../ast";
import type { Query } from "../../query-engine";
import type { SourceSpan } from "../shared";
import type {
  CompiledQueryPlan,
  CompileQueryResult,
  QueryCompileDiagnostic,
} from "./shared/query-planner-types";

export function compileQueryAst(ast: QueryAstNode | null): CompileQueryResult {
  if (ast === null) {
    return failure([
      createDiagnostic(
        "COMPILE_EMPTY_AST",
        "Cannot compile an empty query AST.",
        { start: 0, end: 0 },
      ),
    ]);
  }

  const result = compileNode(ast);

  if (result.plan === null) {
    return result;
  }

  return Object.freeze({
    success: true,
    plan: result.plan,
    query: result.plan.query,
    diagnostics: Object.freeze([]),
  });
}

function compileNode(node: QueryAstNode): CompileQueryResult {
  switch (node.type) {
    case "TOKEN":
      return success(compileTokenNode(node));
    case "PHRASE":
      return compilePhraseNode(node);
    case "BOOLEAN":
      return compileBooleanNode(node);
    case "GROUP":
      return compileGroupNode(node);
  }
}

function compileTokenNode(node: TokenQueryNode): CompiledQueryPlan {
  return createPlan(
    {
      kind: "token",
      token: node.token,
    },
    node.sourceSpan,
    [],
  );
}

function compilePhraseNode(node: PhraseQueryNode): CompileQueryResult {
  const tokens = node.phrase.split(/\s+/u).filter((token) => token !== "");

  if (tokens.length === 0) {
    return failure([
      createDiagnostic(
        "COMPILE_EMPTY_PHRASE",
        "Phrase query must contain at least one token.",
        node.sourceSpan,
      ),
    ]);
  }

  return success(
    createPlan(
      {
        kind: "phrase",
        tokens: Object.freeze(tokens),
      },
      node.sourceSpan,
      [],
    ),
  );
}

function compileBooleanNode(node: BooleanQueryNode): CompileQueryResult {
  if (node.clauses.length < 2) {
    return failure([
      createDiagnostic(
        "COMPILE_INVALID_BOOLEAN",
        "Boolean query must contain at least two clauses.",
        node.sourceSpan,
      ),
    ]);
  }

  const childPlans: CompiledQueryPlan[] = [];

  for (const clause of node.clauses) {
    const result = compileNode(clause);

    if (result.plan === null) {
      return result;
    }

    childPlans.push(result.plan);
  }

  return success(
    createPlan(
      {
        kind: "boolean",
        operator: node.operator,
        queries: Object.freeze(childPlans.map((childPlan) => childPlan.query)),
      },
      node.sourceSpan,
      childPlans,
    ),
  );
}

function compileGroupNode(node: GroupedQueryNode): CompileQueryResult {
  const result = compileNode(node.expression);

  if (result.plan === null) {
    return result;
  }

  return success(createPlan(result.plan.query, node.sourceSpan, [result.plan]));
}

function createPlan(
  query: Query,
  sourceSpan: SourceSpan,
  children: readonly CompiledQueryPlan[],
): CompiledQueryPlan {
  return Object.freeze({
    query: freezeQuery(query),
    sourceSpan: Object.freeze({ ...sourceSpan }),
    children: Object.freeze([...children]),
  });
}

function freezeQuery(query: Query): Query {
  if (query.kind === "boolean") {
    return Object.freeze({
      kind: "boolean",
      operator: query.operator,
      queries: Object.freeze(
        query.queries.map((childQuery) => freezeQuery(childQuery)),
      ),
    });
  }

  if (query.kind === "phrase") {
    return Object.freeze({
      kind: "phrase",
      tokens: Object.freeze([...query.tokens]),
    });
  }

  return Object.freeze({
    kind: "token",
    token: query.token,
  });
}

function success(plan: CompiledQueryPlan): CompileQueryResult {
  return Object.freeze({
    success: true,
    plan,
    query: plan.query,
    diagnostics: Object.freeze([]),
  });
}

function failure(
  diagnostics: readonly QueryCompileDiagnostic[],
): CompileQueryResult {
  return Object.freeze({
    success: false,
    plan: null,
    query: null,
    diagnostics: Object.freeze([...diagnostics]),
  });
}

function createDiagnostic(
  code: string,
  message: string,
  sourceSpan: SourceSpan,
): QueryCompileDiagnostic {
  return Object.freeze({
    code,
    message,
    severity: "error",
    sourceSpan: Object.freeze({ ...sourceSpan }),
  });
}
