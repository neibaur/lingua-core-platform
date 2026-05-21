import { collapseWhitespaceRule } from "../rules/collapse-whitespace";
import { thaiDigitNormalizationRule } from "../rules/thai-digit-normalization";
import { trimBoundaryWhitespaceRule } from "../rules/trim-boundary-whitespace";
import type { NormalizationResult } from "../shared/normalization-result";
import type {
  NormalizationRule,
  NormalizationRuleOutput,
} from "../shared/normalization-rule";

const DEFAULT_NORMALIZATION_RULES: readonly NormalizationRule[] = [
  thaiDigitNormalizationRule,
  collapseWhitespaceRule,
  trimBoundaryWhitespaceRule,
];

export function normalizeText(
  input: string,
  rules: readonly NormalizationRule[] = DEFAULT_NORMALIZATION_RULES,
): NormalizationResult {
  const appliedRules: string[] = [];
  let current: NormalizationRuleOutput = {
    text: input,
    indexMap: Array.from({ length: input.length }, (_, index) => index),
  };

  for (const rule of rules) {
    const next = rule.apply(current);

    if (
      next.text !== current.text ||
      !hasSameIndexMap(next.indexMap, current.indexMap)
    ) {
      appliedRules.push(rule.id);
    }

    current = next;
  }

  return {
    originalText: input,
    normalizedText: current.text,
    indexMap: current.indexMap,
    appliedRules,
  };
}

function hasSameIndexMap(left: readonly number[], right: readonly number[]) {
  return (
    left.length === right.length &&
    left.every((leftIndex, index) => leftIndex === right[index])
  );
}
