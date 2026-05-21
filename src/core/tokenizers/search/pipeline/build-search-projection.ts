import { normalizeText } from "../../normalization";
import type { NormalizationRule } from "../../normalization";
import type { TokenizerDriver } from "../../drivers/tokenizer-driver";
import { tokenizeText } from "../../pipeline/tokenize-text";
import type { SearchProjectionPipelineResult } from "../shared/search-projection-pipeline-result";
import type { SearchProjectionRecord } from "../shared/search-projection-record";
import { mapNormalizedRangeToOriginalRange } from "../utils/validate-projection-offsets";

export async function buildSearchProjection(
  input: string,
  driver: TokenizerDriver,
  rules?: readonly NormalizationRule[],
): Promise<SearchProjectionPipelineResult> {
  const normalization =
    rules === undefined ? normalizeText(input) : normalizeText(input, rules);
  const tokenization = await tokenizeText(driver, normalization.normalizedText);
  const records: SearchProjectionRecord[] = tokenization.tokens
    .filter((token) => token.surface.trim() !== "")
    .map((token, position) => {
      const sourceRange = mapNormalizedRangeToOriginalRange(
        token.startOffset,
        token.endOffset,
        normalization.indexMap,
      );

      return {
        token: token.surface,
        normalizedStart: token.startOffset,
        normalizedEnd: token.endOffset,
        originalStart: sourceRange.originalStart,
        originalEnd: sourceRange.originalEnd,
        tokenType: "term",
        position,
      };
    });

  return {
    originalText: input,
    normalizedText: normalization.normalizedText,
    normalization,
    tokenization,
    records,
  };
}
