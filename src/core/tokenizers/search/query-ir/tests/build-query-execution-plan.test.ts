import { describe, expect, it } from "vitest";

import { parseQuery } from "../../query-parser";
import { compileQueryAst } from "../../query-parser/query-planner";
import { buildQueryExecutionPlan } from "../pipeline/build-query-execution-plan";
import {
  QUERY_EXECUTION_PLAN_SCHEMA_VERSION,
  type QueryExecutionPlan,
} from "../shared/query-execution-plan-types";

const GIN = "\u0e01\u0e34\u0e19";
const KHAO = "\u0e02\u0e49\u0e32\u0e27";

describe("buildQueryExecutionPlan", () => {
  it("generates token query plan nodes", () => {
    const plan = buildQueryExecutionPlan(compilePlan(GIN));

    expect(plan).toEqual({
      schemaVersion: QUERY_EXECUTION_PLAN_SCHEMA_VERSION,
      root: {
        type: "token",
        id: "plan-node-0",
        term: GIN,
        normalizedTerm: GIN,
        sourceSpan: { start: 0, end: 3 },
      },
      metadata: {
        schemaVersion: QUERY_EXECUTION_PLAN_SCHEMA_VERSION,
        nodeCount: 1,
        sourceSpan: { start: 0, end: 3 },
      },
      diagnostics: [],
    });
  });

  it("generates phrase query plan nodes", () => {
    const plan = buildQueryExecutionPlan(compilePlan(`"${GIN} ${KHAO}"`));

    expect(plan.root).toEqual({
      type: "phrase",
      id: "plan-node-0",
      terms: [GIN, KHAO],
      normalizedTerms: [GIN, KHAO],
      sourceSpan: { start: 0, end: 10 },
    });
    expect(plan.metadata.nodeCount).toBe(1);
  });

  it("generates boolean AND plan nodes with stable child ordering", () => {
    const plan = buildQueryExecutionPlan(compilePlan(`${GIN} AND ${KHAO}`));

    expect(plan.root).toEqual({
      type: "boolean",
      id: "plan-node-0",
      operator: "AND",
      children: [
        {
          type: "token",
          id: "plan-node-1",
          term: GIN,
          normalizedTerm: GIN,
          sourceSpan: { start: 0, end: 3 },
        },
        {
          type: "token",
          id: "plan-node-2",
          term: KHAO,
          normalizedTerm: KHAO,
          sourceSpan: { start: 8, end: 12 },
        },
      ],
      sourceSpan: { start: 0, end: 12 },
    });
    expect(plan.metadata.nodeCount).toBe(3);
  });

  it("generates boolean OR plan nodes", () => {
    const plan = buildQueryExecutionPlan(compilePlan(`${GIN} OR ${KHAO}`));

    expect(plan.root).toMatchObject({
      type: "boolean",
      id: "plan-node-0",
      operator: "OR",
      sourceSpan: { start: 0, end: 11 },
    });
  });

  it("preserves grouped query provenance without adding a group node", () => {
    const plan = buildQueryExecutionPlan(compilePlan(`(${GIN} OR ${KHAO})`));

    expect(plan.root).toEqual({
      type: "boolean",
      id: "plan-node-0",
      operator: "OR",
      children: [
        {
          type: "token",
          id: "plan-node-1",
          term: GIN,
          normalizedTerm: GIN,
          sourceSpan: { start: 1, end: 4 },
        },
        {
          type: "token",
          id: "plan-node-2",
          term: KHAO,
          normalizedTerm: KHAO,
          sourceSpan: { start: 8, end: 12 },
        },
      ],
      sourceSpan: { start: 0, end: 13 },
    });
  });

  it("preserves nested boolean structure and deterministic node ids", () => {
    const query = `(${GIN} OR ${KHAO}) AND ${GIN}`;
    const firstPlan = buildQueryExecutionPlan(compilePlan(query));
    const secondPlan = buildQueryExecutionPlan(compilePlan(query));

    expect(firstPlan).toEqual(secondPlan);
    expect(firstPlan.root).toMatchObject({
      type: "boolean",
      id: "plan-node-0",
      operator: "AND",
    });

    if (firstPlan.root.type !== "boolean") {
      throw new Error("Expected boolean root plan node.");
    }

    expect(firstPlan.root.children.map((child) => child.id)).toEqual([
      "plan-node-1",
      "plan-node-4",
    ]);
    expect(firstPlan.metadata.nodeCount).toBe(5);
  });

  it("roundtrips through JSON serialization as a plain structure", () => {
    const plan = buildQueryExecutionPlan(compilePlan(`"${GIN} ${KHAO}"`));
    const roundtripped = JSON.parse(JSON.stringify(plan)) as QueryExecutionPlan;

    expect(roundtripped).toEqual(plan);
  });

  it("freezes generated plan structures", () => {
    const plan = buildQueryExecutionPlan(compilePlan(`${GIN} AND ${KHAO}`));

    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.root)).toBe(true);

    if (plan.root.type !== "boolean") {
      throw new Error("Expected boolean root plan node.");
    }

    expect(Object.isFrozen(plan.root.children)).toBe(true);
  });
});

function compilePlan(query: string) {
  const parseResult = parseQuery(query);

  if (parseResult.ast === null) {
    throw new Error(`Expected parseable query: ${query}`);
  }

  const compileResult = compileQueryAst(parseResult.ast);

  if (compileResult.plan === null) {
    throw new Error(`Expected compilable query: ${query}`);
  }

  return compileResult.plan;
}
