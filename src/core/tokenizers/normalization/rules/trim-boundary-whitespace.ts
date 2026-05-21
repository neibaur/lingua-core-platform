import type {
  NormalizationRule,
  NormalizationRuleOutput,
} from "../shared/normalization-rule";

const WHITESPACE_PATTERN = /\s/;

export const trimBoundaryWhitespaceRule: NormalizationRule = {
  id: "trim-boundary-whitespace",
  apply(input) {
    let startIndex = 0;
    let endIndex = input.text.length;

    while (
      startIndex < endIndex &&
      WHITESPACE_PATTERN.test(input.text[startIndex])
    ) {
      startIndex += 1;
    }

    while (
      endIndex > startIndex &&
      WHITESPACE_PATTERN.test(input.text[endIndex - 1])
    ) {
      endIndex -= 1;
    }

    const output: NormalizationRuleOutput = {
      text: input.text.slice(startIndex, endIndex),
      indexMap: input.indexMap.slice(startIndex, endIndex),
    };

    return output;
  },
};
