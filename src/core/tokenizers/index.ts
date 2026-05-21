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
export { extractOriginalSpan } from "./search";
export {
  mapNormalizedRangeToOriginalRange,
  validateProjectionOffsets,
} from "./search";
export type {
  ProjectionOffsetValidationResult,
  ProjectionSourceRange,
  SearchProjectionPipelineResult,
  SearchProjectionRecord,
  SearchProjectionTokenType,
} from "./search";
export type { SearchIndexDocument } from "./shared/search-index";
export type {
  NormalizedToken,
  Token,
  TokenizationResult,
} from "./shared/token-types";
