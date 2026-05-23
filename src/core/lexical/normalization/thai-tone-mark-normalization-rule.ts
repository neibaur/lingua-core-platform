import type { NormalizationRule } from "../../tokenizers/normalization/index";

export const thaiToneMarkNormalizationRule: NormalizationRule = {
  id: "thai-tone-mark-normalization",
  apply(input) {
    const nfcText = input.text.normalize("NFC");

    if (nfcText === input.text) {
      return { text: input.text, indexMap: [...input.indexMap] };
    }

    // NFC composed some sequences. Rebuild IndexMap by detecting which original
    // positions correspond to each NFC output character. NFC is monotonically
    // non-expanding: nfcText.length <= input.text.length always holds.
    const newIndexMap: number[] = [];
    let prevNfcLength = 0;

    for (let origPos = 0; origPos < input.text.length; origPos += 1) {
      const currentNfcLength = input.text
        .slice(0, origPos + 1)
        .normalize("NFC").length;

      if (currentNfcLength > prevNfcLength) {
        newIndexMap.push(input.indexMap[origPos] ?? origPos);
        prevNfcLength = currentNfcLength;
      }
      // Else: this position was absorbed by a preceding NFC composition.
    }

    return { text: nfcText, indexMap: newIndexMap };
  },
};
