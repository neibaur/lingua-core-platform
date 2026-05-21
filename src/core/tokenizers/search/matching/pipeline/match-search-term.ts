import { normalizeText } from "../../../normalization";
import type { NormalizationRule } from "../../../normalization";
import type { SearchProjectionRecord } from "../../shared/search-projection-record";
import type { SearchMatch } from "../shared/search-match";
import { buildPhraseWindow } from "../utils/build-phrase-window";

export function matchSearchTerm(
  projections: readonly SearchProjectionRecord[],
  query: string,
  normalizationRules?: readonly NormalizationRule[],
): SearchMatch[] {
  const normalizedQuery =
    normalizationRules === undefined
      ? normalizeText(query).normalizedText
      : normalizeText(query, normalizationRules).normalizedText;

  if (normalizedQuery === "") {
    return [];
  }

  const matches: SearchMatch[] = [];

  for (let startIndex = 0; startIndex < projections.length; startIndex += 1) {
    for (
      let endIndex = startIndex + 1;
      endIndex <= projections.length;
      endIndex += 1
    ) {
      const phraseWindow = buildPhraseWindow(projections, startIndex, endIndex);

      if (phraseWindow === undefined) {
        continue;
      }

      if (phraseWindow.phraseText === normalizedQuery) {
        matches.push({
          matchedText: phraseWindow.phraseText,
          normalizedStart: phraseWindow.normalizedStart,
          normalizedEnd: phraseWindow.normalizedEnd,
          originalStart: phraseWindow.originalStart,
          originalEnd: phraseWindow.originalEnd,
          tokenPositions: phraseWindow.tokenPositions,
          matchedTokens: phraseWindow.records.map((record) => record.token),
        });
      }

      if (phraseWindow.phraseText.length >= normalizedQuery.length) {
        break;
      }
    }
  }

  return matches;
}
