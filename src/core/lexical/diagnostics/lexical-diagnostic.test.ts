import { describe, expect, it } from "vitest";

import {
  createLexicalDiagnostic,
  orderLexicalDiagnostics,
} from "./lexical-diagnostic";

describe("createLexicalDiagnostic", () => {
  it("returns a diagnostic with the supplied fields", () => {
    const d = createLexicalDiagnostic(
      "LEXICAL_KEY_NOT_FOUND",
      "warning",
      ["query"],
      "No entry found.",
    );

    expect(d.code).toBe("LEXICAL_KEY_NOT_FOUND");
    expect(d.severity).toBe("warning");
    expect(d.path).toEqual(["query"]);
    expect(d.message).toBe("No entry found.");
  });

  it("returns a deeply frozen diagnostic", () => {
    const d = createLexicalDiagnostic(
      "LEXICAL_INDEX_EMPTY",
      "warning",
      ["index"],
      "Index is empty.",
    );

    expect(Object.isFrozen(d)).toBe(true);
    expect(Object.isFrozen(d.path)).toBe(true);
  });

  it("clones the path array so mutations to the original do not affect the diagnostic", () => {
    const path = ["query"];
    const d = createLexicalDiagnostic(
      "LEXICAL_KEY_NOT_FOUND",
      "warning",
      path,
      "msg",
    );

    path.push("extra");

    expect(d.path).toHaveLength(1);
    expect(d.path[0]).toBe("query");
  });

  it("produces structurally equal output for identical inputs (determinism)", () => {
    const a = createLexicalDiagnostic(
      "LEXICAL_KEY_NOT_FOUND",
      "error",
      ["query"],
      "msg",
    );
    const b = createLexicalDiagnostic(
      "LEXICAL_KEY_NOT_FOUND",
      "error",
      ["query"],
      "msg",
    );

    expect(a).toEqual(b);
  });
});

describe("orderLexicalDiagnostics", () => {
  it("returns a frozen array", () => {
    const ordered = orderLexicalDiagnostics([
      createLexicalDiagnostic("LEXICAL_KEY_NOT_FOUND", "warning", ["z"], "z"),
    ]);

    expect(Object.isFrozen(ordered)).toBe(true);
  });

  it("sorts by path[0] in binary-lexicographic order", () => {
    const a = createLexicalDiagnostic(
      "LEXICAL_KEY_NOT_FOUND",
      "warning",
      ["z-path"],
      "z",
    );
    const b = createLexicalDiagnostic(
      "LEXICAL_INDEX_EMPTY",
      "warning",
      ["a-path"],
      "a",
    );

    const ordered = orderLexicalDiagnostics([a, b]);

    expect(ordered[0].path[0]).toBe("a-path");
    expect(ordered[1].path[0]).toBe("z-path");
  });

  it("uses code as a secondary sort key when path[0] is equal", () => {
    const a = createLexicalDiagnostic(
      "LEXICAL_KEY_WHITESPACE_REJECTED",
      "error",
      ["query"],
      "whitespace",
    );
    const b = createLexicalDiagnostic(
      "LEXICAL_KEY_NOT_FOUND",
      "warning",
      ["query"],
      "not found",
    );
    const c = createLexicalDiagnostic(
      "LEXICAL_INDEX_EMPTY",
      "warning",
      ["query"],
      "empty",
    );

    const ordered = orderLexicalDiagnostics([a, b, c]);

    expect(ordered[0].code).toBe("LEXICAL_INDEX_EMPTY");
    expect(ordered[1].code).toBe("LEXICAL_KEY_NOT_FOUND");
    expect(ordered[2].code).toBe("LEXICAL_KEY_WHITESPACE_REJECTED");
  });

  it("does not mutate the input array", () => {
    const a = createLexicalDiagnostic(
      "LEXICAL_KEY_NOT_FOUND",
      "warning",
      ["z"],
      "z",
    );
    const b = createLexicalDiagnostic(
      "LEXICAL_INDEX_EMPTY",
      "warning",
      ["a"],
      "a",
    );
    const input = [a, b] as const;

    orderLexicalDiagnostics(input);

    expect(input[0].path[0]).toBe("z");
    expect(input[1].path[0]).toBe("a");
  });

  it("returns an empty array when given an empty input", () => {
    const ordered = orderLexicalDiagnostics([]);

    expect(ordered).toHaveLength(0);
    expect(Object.isFrozen(ordered)).toBe(true);
  });

  it("repeated ordering of the same input produces structurally equal results", () => {
    const diagnostics = [
      createLexicalDiagnostic("LEXICAL_KEY_NOT_FOUND", "warning", ["z"], "z"),
      createLexicalDiagnostic("LEXICAL_INDEX_EMPTY", "warning", ["a"], "a"),
    ];

    expect(orderLexicalDiagnostics(diagnostics)).toEqual(
      orderLexicalDiagnostics(diagnostics),
    );
  });

  it("treats missing path[0] as an empty string for ordering purposes", () => {
    const withPath = createLexicalDiagnostic(
      "LEXICAL_INDEX_EMPTY",
      "warning",
      ["a-path"],
      "has path",
    );
    const withoutPath = createLexicalDiagnostic(
      "LEXICAL_KEY_NOT_FOUND",
      "warning",
      [],
      "no path",
    );

    const ordered = orderLexicalDiagnostics([withPath, withoutPath]);

    expect(ordered[0].path).toHaveLength(0);
    expect(ordered[1].path[0]).toBe("a-path");
  });
});
