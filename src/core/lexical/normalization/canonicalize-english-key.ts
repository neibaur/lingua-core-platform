import {
  collapseWhitespaceRule,
  normalizeText,
  trimBoundaryWhitespaceRule,
} from "../../tokenizers/normalization/index";

const ENGLISH_KEY_NORMALIZATION_RULES = [
  collapseWhitespaceRule,
  trimBoundaryWhitespaceRule,
] as const;

export function canonicalizeEnglishKey(input: string): string {
  return normalizeText(
    input,
    ENGLISH_KEY_NORMALIZATION_RULES,
  ).normalizedText.toLowerCase();
}
