import type { SearchProjectionRecord } from "../../shared/search-projection-record";
import type { PhraseMatchResult } from "../shared/phrase-match-result";
import { isContiguousMatch } from "./is-contiguous-match";

export function buildPhraseWindow(
  projections: readonly SearchProjectionRecord[],
  startIndex: number,
  endIndex: number,
): PhraseMatchResult | undefined {
  const records = projections.slice(startIndex, endIndex);

  if (records.length === 0 || !isContiguousMatch(records)) {
    return undefined;
  }

  const firstRecord = records[0];
  const lastRecord = records[records.length - 1];

  return {
    phraseText: buildPhraseText(records),
    normalizedStart: firstRecord.normalizedStart,
    normalizedEnd: lastRecord.normalizedEnd,
    originalStart: firstRecord.originalStart,
    originalEnd: lastRecord.originalEnd,
    tokenPositions: records.map((record) => record.position),
    records,
  };
}

function buildPhraseText(records: readonly SearchProjectionRecord[]): string {
  return records.reduce((phraseText, record, index) => {
    if (index === 0) {
      return record.token;
    }

    const previousRecord = records[index - 1];
    const separator =
      record.normalizedStart > previousRecord.normalizedEnd ? " " : "";

    return `${phraseText}${separator}${record.token}`;
  }, "");
}
