import type { LexicalEntryId } from "./identity/lexical-entry-id";

export const LEXICAL_INDEX_SCHEMA_VERSION =
  "lingua-core-platform:lexical-index@phase10";

export type LexicalIndexSchemaVersion = typeof LEXICAL_INDEX_SCHEMA_VERSION;

export const LEXICAL_LOOKUP_RESULT_SCHEMA_VERSION =
  "lingua-core-platform:lexical-lookup-result@phase10";

export type LexicalLookupResultSchemaVersion =
  typeof LEXICAL_LOOKUP_RESULT_SCHEMA_VERSION;

export type LexicalPartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "conjunction"
  | "preposition"
  | "particle"
  | "classifier"
  | "interjection";

export interface LexicalDefinition {
  readonly definitionIndex: number;
  readonly definition: string;
  readonly partOfSpeech: LexicalPartOfSpeech;
}

export interface LexicalEntry {
  readonly entryId?: LexicalEntryId;
  readonly sourceId?: string;
  readonly headword: string;
  readonly romanized?: string;
  readonly definitions: readonly LexicalDefinition[];
}

export interface LexicalIndex {
  readonly schemaVersion: LexicalIndexSchemaVersion;
  readonly lexicalIndexId: string;
  readonly evaluationTimestamp: null;
  readonly entryCount: number;
  readonly entries: readonly LexicalEntry[];
  readonly thaiToEnglish: Readonly<Record<string, LexicalEntry>>;
  readonly englishToThai: Readonly<Record<string, readonly LexicalEntry[]>>;
}

export type LexicalLanguageDirection = "th→en" | "en→th";

export type LexicalLookupDiagnosticCode =
  | "LEXICAL_KEY_NOT_FOUND"
  | "LEXICAL_INDEX_EMPTY"
  | "LEXICAL_KEY_WHITESPACE_REJECTED";

export type LexicalLookupDiagnosticSeverity = "error" | "warning";

export interface LexicalLookupDiagnostic {
  readonly code: LexicalLookupDiagnosticCode;
  readonly severity: LexicalLookupDiagnosticSeverity;
  readonly path: readonly string[];
  readonly message: string;
}

export interface LexicalLookupInput {
  readonly query: string;
  readonly direction: LexicalLanguageDirection;
  readonly lexicalIndexId: string;
}

export interface LexicalLookupResult {
  readonly schemaVersion: LexicalLookupResultSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly query: string;
  readonly direction: LexicalLanguageDirection;
  readonly entries: readonly LexicalEntry[];
  readonly diagnostics: readonly LexicalLookupDiagnostic[];
}
