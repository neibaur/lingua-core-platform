export { buildSearchProjection } from "./pipeline/build-search-projection";
export { extractOriginalSpan } from "./utils/extract-original-span";
export {
  mapNormalizedRangeToOriginalRange,
  validateProjectionOffsets,
} from "./utils/validate-projection-offsets";
export type { ProjectionSourceRange } from "./shared/projection-source-range";
export type { SearchProjectionPipelineResult } from "./shared/search-projection-pipeline-result";
export type {
  SearchProjectionRecord,
  SearchProjectionTokenType,
} from "./shared/search-projection-record";
export type { ProjectionOffsetValidationResult } from "./utils/validate-projection-offsets";
