import type { SourceSpan } from "../shared/source-span";

export type QueryLexemeType =
  "TEXT" | "PHRASE" | "AND" | "OR" | "LPAREN" | "RPAREN";

export interface QueryLexeme {
  readonly type: QueryLexemeType;
  readonly value: string;
  readonly rawSpan: SourceSpan;
  readonly normalizedSpan: SourceSpan;
}
