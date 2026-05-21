import type {
  NormalizationRule,
  NormalizationRuleOutput,
} from "../shared/normalization-rule";

const WHITESPACE_PATTERN = /\s/;

export const collapseWhitespaceRule: NormalizationRule = {
  id: "collapse-whitespace",
  apply(input) {
    const output: NormalizationRuleOutput = {
      text: "",
      indexMap: [],
    };
    let previousWasWhitespace = false;

    for (let index = 0; index < input.text.length; index += 1) {
      const character = input.text[index];
      const isWhitespace = WHITESPACE_PATTERN.test(character);

      if (isWhitespace) {
        if (!previousWasWhitespace) {
          output.text += " ";
          output.indexMap.push(input.indexMap[index]);
        }

        previousWasWhitespace = true;
        continue;
      }

      output.text += character;
      output.indexMap.push(input.indexMap[index]);
      previousWasWhitespace = false;
    }

    return output;
  },
};
