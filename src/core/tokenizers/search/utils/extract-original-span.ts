import type { SearchProjectionRecord } from "../shared/search-projection-record";

export function extractOriginalSpan(
  input: string,
  record: SearchProjectionRecord,
): string {
  return input.slice(record.originalStart, record.originalEnd);
}
