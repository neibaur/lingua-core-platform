export const SEARCH_CORPUS_FORMAT_VERSION = "search-corpus-v1";

export type SearchCorpusFormatVersion = typeof SEARCH_CORPUS_FORMAT_VERSION;

export interface CorpusDocument {
  readonly documentId: string;
  readonly identifier: string;
  readonly sourceLength: number;
}

export interface PostingRecord {
  readonly documentId: string;
  readonly position: number;
  readonly normalizedStart: number;
  readonly normalizedEnd: number;
  readonly originalStart: number;
  readonly originalEnd: number;
}

export type InvertedIndex = Readonly<Record<string, readonly PostingRecord[]>>;

export interface CorpusStatistics {
  readonly documentCount: number;
  readonly totalDistinctTokens: number;
  readonly totalTokenOccurrences: number;
}

export interface SearchCorpus {
  readonly formatVersion: SearchCorpusFormatVersion;
  readonly documents: Readonly<Record<string, CorpusDocument>>;
  readonly invertedIndex: InvertedIndex;
  readonly statistics: CorpusStatistics;
}
