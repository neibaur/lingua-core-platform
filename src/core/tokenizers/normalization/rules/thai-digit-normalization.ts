import type { NormalizationRule } from "../shared/normalization-rule";

const THAI_DIGIT_TO_ARABIC_DIGIT: Readonly<Record<string, string>> = {
  "๐": "0",
  "๑": "1",
  "๒": "2",
  "๓": "3",
  "๔": "4",
  "๕": "5",
  "๖": "6",
  "๗": "7",
  "๘": "8",
  "๙": "9",
};

export const thaiDigitNormalizationRule: NormalizationRule = {
  id: "thai-digit-normalization",
  apply(input) {
    return {
      text: Array.from(input.text, (character) => {
        return THAI_DIGIT_TO_ARABIC_DIGIT[character] ?? character;
      }).join(""),
      indexMap: [...input.indexMap],
    };
  },
};
