export { buildSearchProjection } from "./pipeline/build-search-projection";
export { CorpusIndexer } from "./index-primitives";
export {
  canonicalizeSearchCorpus,
  deserializeSearchCorpus,
  serializeSearchCorpus,
} from "./index-primitives";
export { matchSearchTerm } from "./matching";
export { buildPhraseWindow } from "./matching";
export { extractMatchSpan } from "./matching";
export { isContiguousMatch } from "./matching";
export { extractOriginalSpan } from "./utils/extract-original-span";
export {
  mapNormalizedRangeToOriginalRange,
  validateProjectionOffsets,
} from "./utils/validate-projection-offsets";
export type { ProjectionSourceRange } from "./shared/projection-source-range";
export {
  SEARCH_CORPUS_FORMAT_VERSION,
  type CorpusDocument,
  type CorpusIndexDocumentInput,
  type CorpusStatistics,
  type InvertedIndex,
  type PostingRecord,
  type SearchCorpus,
  type SearchCorpusFormatVersion,
} from "./index-primitives";
export type {
  PhraseMatchResult,
  SearchMatch,
  SearchMatchRange,
} from "./matching";
export type { SearchProjectionPipelineResult } from "./shared/search-projection-pipeline-result";
export type {
  SearchProjectionRecord,
  SearchProjectionTokenType,
} from "./shared/search-projection-record";
export type { ProjectionOffsetValidationResult } from "./utils/validate-projection-offsets";
