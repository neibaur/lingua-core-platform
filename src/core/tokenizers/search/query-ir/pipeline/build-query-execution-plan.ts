import type { Query } from "../../query-engine";
import type { CompiledQueryPlan } from "../../query-parser";
import {
  QUERY_EXECUTION_PLAN_SCHEMA_VERSION,
  type QueryExecutionPlan,
  type QueryExecutionPlanNode,
} from "../shared/query-execution-plan-types";

export function buildQueryExecutionPlan(
  compiledPlan: CompiledQueryPlan,
): QueryExecutionPlan {
  const counter = createNodeIdCounter();
  const root = buildNode(compiledPlan, counter);

  return Object.freeze({
    schemaVersion: QUERY_EXECUTION_PLAN_SCHEMA_VERSION,
    root,
    metadata: Object.freeze({
      schemaVersion: QUERY_EXECUTION_PLAN_SCHEMA_VERSION,
      nodeCount: countNodes(root),
      sourceSpan: Object.freeze({ ...root.sourceSpan }),
    }),
    diagnostics: Object.freeze([]),
  });
}

function buildNode(
  plan: CompiledQueryPlan,
  counter: () => string,
): QueryExecutionPlanNode {
  switch (plan.query.kind) {
    case "token":
      return Object.freeze({
        type: "token",
        id: counter(),
        term: plan.query.token,
        normalizedTerm: plan.query.token,
        sourceSpan: Object.freeze({ ...plan.sourceSpan }),
      });
    case "phrase":
      return Object.freeze({
        type: "phrase",
        id: counter(),
        terms: Object.freeze([...plan.query.tokens]),
        normalizedTerms: Object.freeze([...plan.query.tokens]),
        sourceSpan: Object.freeze({ ...plan.sourceSpan }),
      });
    case "boolean":
      return Object.freeze({
        type: "boolean",
        id: counter(),
        operator: plan.query.operator,
        children: Object.freeze(
          getBooleanChildPlans(plan).map((childPlan) =>
            buildNode(childPlan, counter),
          ),
        ),
        sourceSpan: Object.freeze({ ...plan.sourceSpan }),
      });
  }
}

function getBooleanChildPlans(
  plan: CompiledQueryPlan,
): readonly CompiledQueryPlan[] {
  if (plan.query.kind !== "boolean") {
    return [];
  }

  if (plan.children.length === plan.query.queries.length) {
    return plan.children;
  }

  const groupedChild = plan.children[0];

  if (
    plan.children.length === 1 &&
    areQueriesEqual(groupedChild.query, plan.query) &&
    groupedChild.query.kind === "boolean"
  ) {
    return getBooleanChildPlans(groupedChild);
  }

  return plan.children;
}

function areQueriesEqual(left: Query, right: Query): boolean {
  if (left.kind !== right.kind) {
    return false;
  }

  if (left.kind === "token" && right.kind === "token") {
    return left.token === right.token;
  }

  if (left.kind === "phrase" && right.kind === "phrase") {
    return areArraysEqual(left.tokens, right.tokens);
  }

  if (left.kind === "boolean" && right.kind === "boolean") {
    return (
      left.operator === right.operator &&
      left.queries.length === right.queries.length &&
      left.queries.every((query, index) => {
        return areQueriesEqual(query, right.queries[index]);
      })
    );
  }

  return false;
}

function areArraysEqual(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function createNodeIdCounter(): () => string {
  let nextId = 0;

  return () => {
    const id = `plan-node-${String(nextId)}`;
    nextId += 1;

    return id;
  };
}

function countNodes(node: QueryExecutionPlanNode): number {
  if (node.type !== "boolean") {
    return 1;
  }

  return (
    1 +
    node.children.reduce(
      (nodeCount, childNode) => nodeCount + countNodes(childNode),
      0,
    )
  );
}
