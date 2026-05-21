export { normalizeText } from "./pipeline/normalize-text";
export { collapseWhitespaceRule } from "./rules/collapse-whitespace";
export { thaiDigitNormalizationRule } from "./rules/thai-digit-normalization";
export { trimBoundaryWhitespaceRule } from "./rules/trim-boundary-whitespace";
export type { IndexMap } from "./shared/index-map";
export type { NormalizationResult } from "./shared/normalization-result";
export type {
  NormalizationRule,
  NormalizationRuleInput,
  NormalizationRuleOutput,
} from "./shared/normalization-rule";
