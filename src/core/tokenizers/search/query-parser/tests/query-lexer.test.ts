import { describe, expect, it } from "vitest";

import { lexQuery } from "../lexer";

describe("lexQuery", () => {
  it("lexes a simple token query", () => {
    expect(lexQuery("กิน")).toEqual([
      {
        type: "TEXT",
        value: "กิน",
        rawSpan: { start: 0, end: 3 },
        normalizedSpan: { start: 0, end: 3 },
      },
    ]);
  });

  it("lexes quoted Thai phrases as a single lexeme", () => {
    expect(lexQuery('"กินข้าว"')).toEqual([
      {
        type: "PHRASE",
        value: "กินข้าว",
        rawSpan: { start: 0, end: 9 },
        normalizedSpan: { start: 0, end: 7 },
      },
    ]);
  });

  it("lexes phrase AND token queries", () => {
    expect(lexQuery('"กินข้าว" AND test')).toEqual([
      {
        type: "PHRASE",
        value: "กินข้าว",
        rawSpan: { start: 0, end: 9 },
        normalizedSpan: { start: 0, end: 7 },
      },
      {
        type: "AND",
        value: "AND",
        rawSpan: { start: 10, end: 13 },
        normalizedSpan: { start: 7, end: 10 },
      },
      {
        type: "TEXT",
        value: "test",
        rawSpan: { start: 14, end: 18 },
        normalizedSpan: { start: 10, end: 14 },
      },
    ]);
  });

  it("lexes token OR token queries", () => {
    expect(lexQuery("กิน OR ข้าว")).toEqual([
      {
        type: "TEXT",
        value: "กิน",
        rawSpan: { start: 0, end: 3 },
        normalizedSpan: { start: 0, end: 3 },
      },
      {
        type: "OR",
        value: "OR",
        rawSpan: { start: 4, end: 6 },
        normalizedSpan: { start: 3, end: 5 },
      },
      {
        type: "TEXT",
        value: "ข้าว",
        rawSpan: { start: 7, end: 11 },
        normalizedSpan: { start: 5, end: 9 },
      },
    ]);
  });

  it("recognizes parentheses", () => {
    expect(lexQuery("(กิน OR ข้าว)")).toEqual([
      {
        type: "LPAREN",
        value: "(",
        rawSpan: { start: 0, end: 1 },
        normalizedSpan: { start: 0, end: 1 },
      },
      {
        type: "TEXT",
        value: "กิน",
        rawSpan: { start: 1, end: 4 },
        normalizedSpan: { start: 1, end: 4 },
      },
      {
        type: "OR",
        value: "OR",
        rawSpan: { start: 5, end: 7 },
        normalizedSpan: { start: 4, end: 6 },
      },
      {
        type: "TEXT",
        value: "ข้าว",
        rawSpan: { start: 8, end: 12 },
        normalizedSpan: { start: 6, end: 10 },
      },
      {
        type: "RPAREN",
        value: ")",
        rawSpan: { start: 12, end: 13 },
        normalizedSpan: { start: 10, end: 11 },
      },
    ]);
  });

  it("skips mixed whitespace outside phrases", () => {
    const lexemes = lexQuery(" \tกิน\n  ข้าว ");

    expect(lexemes.map((lexeme) => lexeme.value)).toEqual(["กิน", "ข้าว"]);
    expect(lexemes.map((lexeme) => lexeme.rawSpan)).toEqual([
      { start: 2, end: 5 },
      { start: 8, end: 12 },
    ]);
    expect(lexemes.map((lexeme) => lexeme.normalizedSpan)).toEqual([
      { start: 0, end: 3 },
      { start: 3, end: 7 },
    ]);
  });

  it("normalizes lowercase operators to AND and OR lexeme values", () => {
    expect(
      lexQuery("กิน and ข้าว or test").map((lexeme) => lexeme.type),
    ).toEqual(["TEXT", "AND", "TEXT", "OR", "TEXT"]);
    expect(lexQuery("ANDROID or orbit").map((lexeme) => lexeme.value)).toEqual([
      "ANDROID",
      "OR",
      "orbit",
    ]);
  });

  it("preserves Thai text raw and normalized offsets", () => {
    const lexemes = lexQuery("กินข้าว หรือยัง");

    expect(lexemes).toEqual([
      {
        type: "TEXT",
        value: "กินข้าว",
        rawSpan: { start: 0, end: 7 },
        normalizedSpan: { start: 0, end: 7 },
      },
      {
        type: "TEXT",
        value: "หรือยัง",
        rawSpan: { start: 8, end: 15 },
        normalizedSpan: { start: 7, end: 14 },
      },
    ]);
  });

  it("preserves full Unicode character spans for non-BMP text", () => {
    expect(lexQuery("กิน🙂")).toEqual([
      {
        type: "TEXT",
        value: "กิน🙂",
        rawSpan: { start: 0, end: 5 },
        normalizedSpan: { start: 0, end: 5 },
      },
    ]);
  });
});
