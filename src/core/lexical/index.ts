export {
  LEXICAL_INDEX_SCHEMA_VERSION,
  LEXICAL_LOOKUP_RESULT_SCHEMA_VERSION,
  type LexicalDefinition,
  type LexicalEntry,
  type LexicalIndex,
  type LexicalIndexSchemaVersion,
  type LexicalLanguageDirection,
  type LexicalLookupDiagnostic,
  type LexicalLookupDiagnosticCode,
  type LexicalLookupDiagnosticSeverity,
  type LexicalLookupInput,
  type LexicalLookupResult,
  type LexicalLookupResultSchemaVersion,
  type LexicalPartOfSpeech,
} from "./contracts";
export { THAI_ENGLISH_FIXTURE_DATASET } from "./datasets/thai-english/thai-english-fixture-dataset";
export {
  createLexicalDiagnostic,
  orderLexicalDiagnostics,
} from "./diagnostics/lexical-diagnostic";
export {
  LEXICAL_LOOKUP_TRACE_SCHEMA_VERSION,
  composeLexicalLookupTrace,
  type ComposeLexicalLookupTraceInput,
  type LexicalLookupResultStatus,
  type LexicalLookupTrace,
  type LexicalLookupTraceSchemaVersion,
} from "./diagnostics/lexical-lookup-trace";
export {
  assertValidLexicalEntryId,
  composeEntryId,
  type ComposeEntryIdInput,
  type LexicalEntryId,
  type LexicalLanguageCode,
} from "./identity/lexical-entry-id";
export {
  composeLexicalIndex,
  type ComposeLexicalIndexInput,
} from "./index/lexical-index";
export { composeLexicalLookup } from "./lookup/lexical-lookup";
export { assertNoWhitespace } from "./normalization/assert-no-whitespace";
export { normalizeLexicalKey } from "./normalization/normalize-lexical-key";
export { thaiToneMarkNormalizationRule } from "./normalization/thai-tone-mark-normalization-rule";
