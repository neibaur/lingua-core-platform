import { describe, expect, it } from "vitest";

import type { BooleanQueryNode, PhraseQueryNode } from "../ast";
import { parseQuery } from "../parser";
import { compileQueryAst } from "../query-planner";

describe("compileQueryAst", () => {
  it("compiles token query AST nodes", () => {
    const ast = parseAst("กินข้าว");

    expect(compileQueryAst(ast)).toEqual({
      success: true,
      query: {
        kind: "token",
        token: "กินข้าว",
      },
      plan: {
        query: {
          kind: "token",
          token: "กินข้าว",
        },
        sourceSpan: { start: 0, end: 7 },
        children: [],
      },
      diagnostics: [],
    });
  });

  it("compiles phrase query AST nodes", () => {
    const ast = parseAst('"กิน ข้าว"');

    expect(compileQueryAst(ast)).toEqual({
      success: true,
      query: {
        kind: "phrase",
        tokens: ["กิน", "ข้าว"],
      },
      plan: {
        query: {
          kind: "phrase",
          tokens: ["กิน", "ข้าว"],
        },
        sourceSpan: { start: 0, end: 10 },
        children: [],
      },
      diagnostics: [],
    });
  });

  it("compiles AND boolean AST nodes", () => {
    const ast = parseAst("กิน AND ข้าว");

    expect(compileQueryAst(ast).query).toEqual({
      kind: "boolean",
      operator: "AND",
      queries: [
        { kind: "token", token: "กิน" },
        { kind: "token", token: "ข้าว" },
      ],
    });
  });

  it("compiles OR boolean AST nodes", () => {
    const ast = parseAst("กิน OR ข้าว");

    expect(compileQueryAst(ast).query).toEqual({
      kind: "boolean",
      operator: "OR",
      queries: [
        { kind: "token", token: "กิน" },
        { kind: "token", token: "ข้าว" },
      ],
    });
  });

  it("unwraps grouped query AST nodes while preserving group provenance", () => {
    const ast = parseAst("(กิน OR ข้าว)");

    expect(compileQueryAst(ast)).toEqual({
      success: true,
      query: {
        kind: "boolean",
        operator: "OR",
        queries: [
          { kind: "token", token: "กิน" },
          { kind: "token", token: "ข้าว" },
        ],
      },
      plan: {
        query: {
          kind: "boolean",
          operator: "OR",
          queries: [
            { kind: "token", token: "กิน" },
            { kind: "token", token: "ข้าว" },
          ],
        },
        sourceSpan: { start: 0, end: 13 },
        children: [
          {
            query: {
              kind: "boolean",
              operator: "OR",
              queries: [
                { kind: "token", token: "กิน" },
                { kind: "token", token: "ข้าว" },
              ],
            },
            sourceSpan: { start: 1, end: 12 },
            children: [
              {
                query: { kind: "token", token: "กิน" },
                sourceSpan: { start: 1, end: 4 },
                children: [],
              },
              {
                query: { kind: "token", token: "ข้าว" },
                sourceSpan: { start: 8, end: 12 },
                children: [],
              },
            ],
          },
        ],
      },
      diagnostics: [],
    });
  });

  it("compiles nested boolean and grouped AST nodes deterministically", () => {
    const ast = parseAst("(กินข้าว OR หรือยัง) AND ไปไหม");
    const result = compileQueryAst(ast);

    expect(result.query).toEqual({
      kind: "boolean",
      operator: "AND",
      queries: [
        {
          kind: "boolean",
          operator: "OR",
          queries: [
            { kind: "token", token: "กินข้าว" },
            { kind: "token", token: "หรือยัง" },
          ],
        },
        { kind: "token", token: "ไปไหม" },
      ],
    });
    expect(result.plan?.sourceSpan).toEqual({ start: 0, end: 30 });
    expect(result.plan?.children.map((child) => child.sourceSpan)).toEqual([
      { start: 0, end: 20 },
      { start: 25, end: 30 },
    ]);
  });

  it("preserves sourceSpan provenance for every compiled plan node", () => {
    const ast = parseAst('"กิน ข้าว" AND หรือยัง');
    const result = compileQueryAst(ast);

    expect(result.plan?.sourceSpan).toEqual({ start: 0, end: 22 });
    expect(result.plan?.children).toEqual([
      {
        query: { kind: "phrase", tokens: ["กิน", "ข้าว"] },
        sourceSpan: { start: 0, end: 10 },
        children: [],
      },
      {
        query: { kind: "token", token: "หรือยัง" },
        sourceSpan: { start: 15, end: 22 },
        children: [],
      },
    ]);
  });

  it("returns diagnostics for an empty AST", () => {
    expect(compileQueryAst(null)).toEqual({
      success: false,
      plan: null,
      query: null,
      diagnostics: [
        {
          code: "COMPILE_EMPTY_AST",
          message: "Cannot compile an empty query AST.",
          severity: "error",
          sourceSpan: { start: 0, end: 0 },
        },
      ],
    });
  });

  it("returns diagnostics for malformed empty phrase AST variants", () => {
    const malformedPhrase: PhraseQueryNode = {
      type: "PHRASE",
      phrase: "   ",
      sourceSpan: { start: 0, end: 5 },
    };

    expect(compileQueryAst(malformedPhrase)).toEqual({
      success: false,
      plan: null,
      query: null,
      diagnostics: [
        {
          code: "COMPILE_EMPTY_PHRASE",
          message: "Phrase query must contain at least one token.",
          severity: "error",
          sourceSpan: { start: 0, end: 5 },
        },
      ],
    });
  });

  it("returns diagnostics for malformed boolean AST variants", () => {
    const malformedBoolean: BooleanQueryNode = {
      type: "BOOLEAN",
      operator: "AND",
      clauses: [
        {
          type: "TOKEN",
          token: "กิน",
          sourceSpan: { start: 0, end: 3 },
        },
      ],
      sourceSpan: { start: 0, end: 3 },
    };

    expect(compileQueryAst(malformedBoolean)).toEqual({
      success: false,
      plan: null,
      query: null,
      diagnostics: [
        {
          code: "COMPILE_INVALID_BOOLEAN",
          message: "Boolean query must contain at least two clauses.",
          severity: "error",
          sourceSpan: { start: 0, end: 3 },
        },
      ],
    });
  });

  it("returns deterministic compilation output for repeated calls", () => {
    const ast = parseAst('"กิน ข้าว" AND หรือยัง');

    expect(compileQueryAst(ast)).toEqual(compileQueryAst(ast));
  });
});

function parseAst(query: string) {
  const result = parseQuery(query);

  if (result.ast === null) {
    throw new Error(`Expected parseable query: ${query}`);
  }

  return result.ast;
}
