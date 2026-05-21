export { buildSearchProjection } from "./pipeline/build-search-projection";
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
