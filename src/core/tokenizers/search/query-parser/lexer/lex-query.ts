import type { QueryLexeme, QueryLexemeType } from "./query-lexeme";

export function lexQuery(query: string): readonly QueryLexeme[] {
  const lexemes: QueryLexeme[] = [];
  let cursor = 0;
  let normalizedCursor = 0;

  while (cursor < query.length) {
    const character = readCharacter(query, cursor);

    if (isWhitespace(character)) {
      cursor += character.length;
      continue;
    }

    if (character === "(" || character === ")") {
      const type: QueryLexemeType = character === "(" ? "LPAREN" : "RPAREN";

      lexemes.push(
        createLexeme(
          type,
          character,
          cursor,
          cursor + character.length,
          normalizedCursor,
        ),
      );
      cursor += character.length;
      normalizedCursor += character.length;
      continue;
    }

    if (character === '"') {
      const phrase = readPhrase(query, cursor);

      lexemes.push(
        createLexeme(
          "PHRASE",
          phrase.value,
          phrase.rawStart,
          phrase.rawEnd,
          normalizedCursor,
        ),
      );
      cursor = phrase.rawEnd;
      normalizedCursor += phrase.value.length;
      continue;
    }

    const text = readText(query, cursor);
    const operatorType = getOperatorType(text.value);

    lexemes.push(
      createLexeme(
        operatorType ?? "TEXT",
        operatorType === undefined ? text.value : operatorType,
        text.rawStart,
        text.rawEnd,
        normalizedCursor,
      ),
    );
    cursor = text.rawEnd;
    normalizedCursor +=
      operatorType === undefined ? text.value.length : operatorType.length;
  }

  return Object.freeze(lexemes);
}

function createLexeme(
  type: QueryLexemeType,
  value: string,
  rawStart: number,
  rawEnd: number,
  normalizedStart: number,
): QueryLexeme {
  return Object.freeze({
    type,
    value,
    rawSpan: Object.freeze({
      start: rawStart,
      end: rawEnd,
    }),
    normalizedSpan: Object.freeze({
      start: normalizedStart,
      end: normalizedStart + value.length,
    }),
  });
}

function readPhrase(query: string, rawStart: number) {
  let cursor = rawStart + 1;
  let value = "";

  while (cursor < query.length && query[cursor] !== '"') {
    const character = readCharacter(query, cursor);

    value += character;
    cursor += character.length;
  }

  const rawEnd = cursor < query.length ? cursor + 1 : cursor;

  return {
    value,
    rawStart,
    rawEnd,
  };
}

function readText(query: string, rawStart: number) {
  let cursor = rawStart;
  let value = "";

  while (cursor < query.length) {
    const character = readCharacter(query, cursor);

    if (
      isWhitespace(character) ||
      character === "(" ||
      character === ")" ||
      character === '"'
    ) {
      break;
    }

    value += character;
    cursor += character.length;
  }

  return {
    value,
    rawStart,
    rawEnd: cursor,
  };
}

function getOperatorType(value: string): "AND" | "OR" | undefined {
  const normalizedValue = value.toUpperCase();

  if (normalizedValue === "AND" || normalizedValue === "OR") {
    return normalizedValue;
  }

  return undefined;
}

function isWhitespace(character: string) {
  return /\s/u.test(character);
}

function readCharacter(input: string, cursor: number) {
  const codePoint = input.codePointAt(cursor);

  if (codePoint === undefined) {
    throw new Error(
      `Cannot read query character at offset ${cursor.toString()}.`,
    );
  }

  return String.fromCodePoint(codePoint);
}
