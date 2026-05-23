import {
  normalizeText,
  thaiDigitNormalizationRule,
} from "../../tokenizers/normalization/index";
import { assertNoWhitespace } from "./assert-no-whitespace";
import { thaiToneMarkNormalizationRule } from "./thai-tone-mark-normalization-rule";

const LEXICAL_KEY_NORMALIZATION_RULES = [
  thaiToneMarkNormalizationRule,
  thaiDigitNormalizationRule,
] as const;

export function normalizeLexicalKey(input: string): string {
  assertNoWhitespace(input, "lexical key");
  return normalizeText(input, LEXICAL_KEY_NORMALIZATION_RULES).normalizedText;
}
