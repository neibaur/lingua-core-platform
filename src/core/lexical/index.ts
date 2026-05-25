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
export {
  LEXICAL_DATASET_VALIDATION_RESULT_SCHEMA_VERSION,
  validateLexicalDataset,
  type LexicalDatasetValidationDiagnostic,
  type LexicalDatasetValidationDiagnosticCode,
  type LexicalDatasetValidationDiagnosticSeverity,
  type LexicalDatasetValidationResult,
  type LexicalDatasetValidationResultSchemaVersion,
  type LexicalDatasetValidationStatus,
  type ValidateLexicalDatasetInput,
} from "./validation/lexical-dataset-validation";
export { normalizeLexicalKey } from "./normalization/normalize-lexical-key";
export { thaiToneMarkNormalizationRule } from "./normalization/thai-tone-mark-normalization-rule";
export {
  LEXICAL_DATASET_VALIDATION_REPORT_SCHEMA_VERSION,
  LEXICAL_DATASET_VALIDATION_RULE_CODES,
  composeLexicalDatasetValidationReport,
  type ComposeLexicalDatasetValidationReportInput,
  type LexicalDatasetDiagnosticsByCode,
  type LexicalDatasetValidationReport,
  type LexicalDatasetValidationReportSchemaVersion,
} from "./validation/lexical-dataset-validation-report";
export {
  DICTIONARY_SOURCE_PROVENANCE_SCHEMA_VERSION,
  composeDictionarySourceProvenance,
  type ComposeDictionarySourceProvenanceInput,
  type DictionarySourceProvenance,
  type DictionarySourceProvenanceSchemaVersion,
} from "./provenance/dictionary-source-provenance";
export {
  DICTIONARY_LICENSING_BOUNDARY_SCHEMA_VERSION,
  composeDictionaryLicensingBoundary,
  type ComposeDictionaryLicensingBoundaryInput,
  type DictionaryLicensingBoundary,
  type DictionaryLicensingBoundarySchemaVersion,
  type DictionaryLicensingVerdict,
} from "./provenance/dictionary-licensing-boundary";
export {
  CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION,
  composeCanonicalDictionaryEntry,
  type CanonicalDictionaryEntry,
  type CanonicalDictionaryEntrySchemaVersion,
  type ComposeCanonicalDictionaryEntryInput,
} from "./provenance/canonical-dictionary-entry";
export {
  INGESTION_READY_DICTIONARY_ENTRY_SCHEMA_VERSION,
  composeIngestionReadyDictionaryEntry,
  type ComposeIngestionReadyDictionaryEntryInput,
  type IngestionReadyDictionaryEntry,
  type IngestionReadyDictionaryEntrySchemaVersion,
} from "./provenance/ingestion-ready-dictionary-entry";
