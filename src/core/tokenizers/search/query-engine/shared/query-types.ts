import type { PostingRecord } from "../../index-primitives";

export interface TokenQuery {
  readonly kind: "token";
  readonly token: string;
}

export interface PhraseQuery {
  readonly kind: "phrase";
  readonly tokens: readonly string[];
}

export interface BooleanQuery {
  readonly kind: "boolean";
  readonly operator: "AND" | "OR";
  readonly queries: readonly Query[];
}

export type Query = TokenQuery | PhraseQuery | BooleanQuery;

export interface MatchedSpan {
  readonly normalizedStart: number;
  readonly normalizedEnd: number;
  readonly originalStart: number;
  readonly originalEnd: number;
}

export interface MatchedDocument {
  readonly documentId: string;
  readonly tokenPositions: readonly number[];
  readonly spans: readonly MatchedSpan[];
}

export interface QueryExecutionResult {
  readonly matches: readonly MatchedDocument[];
}

export interface QueryPostingMatch {
  readonly documentId: string;
  readonly postings: readonly PostingRecord[];
}
