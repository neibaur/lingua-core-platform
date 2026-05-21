import { describe, expect, it } from "vitest";

import { parseQuery } from "../parser";

describe("parseQuery", () => {
  it("parses a simple token query", () => {
    expect(parseQuery("กินข้าว")).toEqual({
      ast: {
        type: "TOKEN",
        token: "กินข้าว",
        sourceSpan: { start: 0, end: 7 },
      },
      diagnostics: [],
    });
  });

  it("parses a quoted phrase query", () => {
    expect(parseQuery('"กินข้าว"')).toEqual({
      ast: {
        type: "PHRASE",
        phrase: "กินข้าว",
        sourceSpan: { start: 0, end: 9 },
      },
      diagnostics: [],
    });
  });

  it("parses a phrase AND token query", () => {
    expect(parseQuery('"กินข้าว" AND หรือยัง')).toEqual({
      ast: {
        type: "BOOLEAN",
        operator: "AND",
        sourceSpan: { start: 0, end: 21 },
        clauses: [
          {
            type: "PHRASE",
            phrase: "กินข้าว",
            sourceSpan: { start: 0, end: 9 },
          },
          {
            type: "TOKEN",
            token: "หรือยัง",
            sourceSpan: { start: 14, end: 21 },
          },
        ],
      },
      diagnostics: [],
    });
  });

  it("parses a token OR token query", () => {
    expect(parseQuery("กิน OR ข้าว")).toEqual({
      ast: {
        type: "BOOLEAN",
        operator: "OR",
        sourceSpan: { start: 0, end: 11 },
        clauses: [
          {
            type: "TOKEN",
            token: "กิน",
            sourceSpan: { start: 0, end: 3 },
          },
          {
            type: "TOKEN",
            token: "ข้าว",
            sourceSpan: { start: 7, end: 11 },
          },
        ],
      },
      diagnostics: [],
    });
  });

  it("parses parenthesized queries as grouped nodes", () => {
    expect(parseQuery("(กิน OR ข้าว)")).toEqual({
      ast: {
        type: "GROUP",
        sourceSpan: { start: 0, end: 13 },
        expression: {
          type: "BOOLEAN",
          operator: "OR",
          sourceSpan: { start: 1, end: 12 },
          clauses: [
            {
              type: "TOKEN",
              token: "กิน",
              sourceSpan: { start: 1, end: 4 },
            },
            {
              type: "TOKEN",
              token: "ข้าว",
              sourceSpan: { start: 8, end: 12 },
            },
          ],
        },
      },
      diagnostics: [],
    });
  });

  it("parses nested booleans with left-associative grouping", () => {
    const result = parseQuery("(กินข้าว OR หรือยัง) AND ไปไหม");

    expect(result.diagnostics).toEqual([]);
    expect(result.ast).toMatchObject({
      type: "BOOLEAN",
      operator: "AND",
      sourceSpan: { start: 0, end: 30 },
    });
    expect(result.ast?.type === "BOOLEAN" ? result.ast.clauses : []).toEqual([
      {
        type: "GROUP",
        sourceSpan: { start: 0, end: 20 },
        expression: {
          type: "BOOLEAN",
          operator: "OR",
          sourceSpan: { start: 1, end: 19 },
          clauses: [
            {
              type: "TOKEN",
              token: "กินข้าว",
              sourceSpan: { start: 1, end: 8 },
            },
            {
              type: "TOKEN",
              token: "หรือยัง",
              sourceSpan: { start: 12, end: 19 },
            },
          ],
        },
      },
      {
        type: "TOKEN",
        token: "ไปไหม",
        sourceSpan: { start: 25, end: 30 },
      },
    ]);

    expect(parseQuery("A AND B OR C")).toEqual({
      ast: {
        type: "BOOLEAN",
        operator: "OR",
        sourceSpan: { start: 0, end: 12 },
        clauses: [
          {
            type: "BOOLEAN",
            operator: "AND",
            sourceSpan: { start: 0, end: 7 },
            clauses: [
              {
                type: "TOKEN",
                token: "A",
                sourceSpan: { start: 0, end: 1 },
              },
              {
                type: "TOKEN",
                token: "B",
                sourceSpan: { start: 6, end: 7 },
              },
            ],
          },
          {
            type: "TOKEN",
            token: "C",
            sourceSpan: { start: 11, end: 12 },
          },
        ],
      },
      diagnostics: [],
    });
  });

  it("reports an empty query diagnostic", () => {
    expect(parseQuery("   ")).toEqual({
      ast: null,
      diagnostics: [
        {
          code: "QUERY_EMPTY",
          message: "Query must contain an expression.",
          severity: "error",
          span: { start: 0, end: 3 },
        },
      ],
    });
  });

  it("reports a dangling operator diagnostic", () => {
    expect(parseQuery("A AND")).toEqual({
      ast: null,
      diagnostics: [
        {
          code: "DANGLING_OPERATOR",
          message: "Operator must be followed by an expression.",
          severity: "error",
          span: { start: 2, end: 5 },
        },
      ],
    });
  });

  it("reports a consecutive operator diagnostic", () => {
    expect(parseQuery("A AND OR B")).toEqual({
      ast: null,
      diagnostics: [
        {
          code: "CONSECUTIVE_OPERATORS",
          message: "Consecutive operators are not valid.",
          severity: "error",
          span: { start: 6, end: 8 },
        },
      ],
    });
  });

  it("reports adjacent terms without implicit operators", () => {
    expect(parseQuery("A B")).toEqual({
      ast: null,
      diagnostics: [
        {
          code: "ADJACENT_TERMS",
          message: "Adjacent terms must be connected by AND or OR.",
          severity: "error",
          span: { start: 2, end: 3 },
        },
      ],
    });
  });

  it("reports unmatched parenthesis diagnostics", () => {
    expect(parseQuery("(A AND B")).toEqual({
      ast: null,
      diagnostics: [
        {
          code: "UNMATCHED_LEFT_PAREN",
          message: "Opening parenthesis has no matching closing parenthesis.",
          severity: "error",
          span: { start: 0, end: 1 },
        },
      ],
    });

    expect(parseQuery("A AND B)")).toEqual({
      ast: null,
      diagnostics: [
        {
          code: "UNMATCHED_RIGHT_PAREN",
          message: "Closing parenthesis has no matching opening parenthesis.",
          severity: "error",
          span: { start: 7, end: 8 },
        },
      ],
    });

    expect(parseQuery("()")).toEqual({
      ast: null,
      diagnostics: [
        {
          code: "MISSING_GROUP_EXPRESSION",
          message: "Parentheses must contain an expression.",
          severity: "error",
          span: { start: 0, end: 2 },
        },
      ],
    });
  });

  it("preserves parent source spans from first to last component", () => {
    const result = parseQuery('  "กินข้าว" OR (หรือยัง AND ไปไหม)');

    expect(result.ast).toMatchObject({
      type: "BOOLEAN",
      operator: "OR",
      sourceSpan: { start: 2, end: 34 },
    });
    expect(
      result.ast?.type === "BOOLEAN" ? result.ast.clauses[1] : null,
    ).toEqual({
      type: "GROUP",
      sourceSpan: { start: 15, end: 34 },
      expression: {
        type: "BOOLEAN",
        operator: "AND",
        sourceSpan: { start: 16, end: 33 },
        clauses: [
          {
            type: "TOKEN",
            token: "หรือยัง",
            sourceSpan: { start: 16, end: 23 },
          },
          {
            type: "TOKEN",
            token: "ไปไหม",
            sourceSpan: { start: 28, end: 33 },
          },
        ],
      },
    });
  });

  it("returns deterministic output for repeated parses", () => {
    const firstResult = parseQuery('"กินข้าว" AND หรือยัง');
    const secondResult = parseQuery('"กินข้าว" AND หรือยัง');

    expect(firstResult).toEqual(secondResult);
  });
});
