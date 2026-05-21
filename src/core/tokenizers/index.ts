export type {
  SupportedLanguageCode,
  TokenizerDriver,
} from "./drivers/tokenizer-driver";
export { DictionaryTokenizerDriver } from "./drivers/dictionary";
export type { DictionaryTokenizerDriverOptions } from "./drivers/dictionary";
export { MockTokenizerDriver } from "./drivers/mock";
export type { MockTokenizerDriverOptions } from "./drivers/mock";
export { normalizeText } from "./normalization";
export type {
  IndexMap,
  NormalizationResult,
  NormalizationRule,
  NormalizationRuleInput,
  NormalizationRuleOutput,
} from "./normalization";
export { tokenizeText } from "./pipeline/tokenize-text";
export { buildSearchProjection } from "./search";
export { CorpusIndexer } from "./search";
export { SEARCH_CORPUS_FORMAT_VERSION } from "./search";
export {
  canonicalizeSearchCorpus,
  deserializeSearchCorpus,
  serializeSearchCorpus,
} from "./search";
export {
  executeBooleanQuery,
  executePhraseQuery,
  executeQuery,
  executeTokenQuery,
} from "./search";
export {
  groupPostingsByDocument,
  intersectMatchedDocuments,
  mergeDocumentMatches,
  reconstructQuerySpan,
  unionMatchedDocuments,
} from "./search";
export { matchSearchTerm } from "./search";
export { buildPhraseWindow } from "./search";
export { extractMatchSpan } from "./search";
export { extractOriginalSpan } from "./search";
export { isContiguousMatch } from "./search";
export {
  mapNormalizedRangeToOriginalRange,
  validateProjectionOffsets,
} from "./search";
export type {
  BooleanQuery,
  CorpusDocument,
  CorpusIndexDocumentInput,
  CorpusStatistics,
  InvertedIndex,
  MatchedDocument,
  MatchedSpan,
  PhraseQuery,
  PostingRecord,
  ProjectionOffsetValidationResult,
  ProjectionSourceRange,
  PhraseMatchResult,
  Query,
  QueryExecutionResult,
  QueryPostingMatch,
  SearchCorpus,
  SearchCorpusFormatVersion,
  SearchMatch,
  SearchMatchRange,
  SearchProjectionPipelineResult,
  SearchProjectionRecord,
  SearchProjectionTokenType,
  TokenQuery,
} from "./search";
export type { SearchIndexDocument } from "./shared/search-index";
export type {
  NormalizedToken,
  Token,
  TokenizationResult,
} from "./shared/token-types";
