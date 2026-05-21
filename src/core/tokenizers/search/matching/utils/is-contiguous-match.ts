import type { SearchProjectionRecord } from "../../shared/search-projection-record";

export function isContiguousMatch(
  records: readonly SearchProjectionRecord[],
): boolean {
  return records.every((record, index) => {
    if (index === 0) {
      return true;
    }

    const previousRecord = records[index - 1];

    return (
      record.position === previousRecord.position + 1 &&
      record.normalizedStart >= previousRecord.normalizedEnd &&
      record.originalStart >= previousRecord.originalEnd
    );
  });
}
