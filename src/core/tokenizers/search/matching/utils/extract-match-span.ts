import type { SearchMatch } from "../shared/search-match";

export function extractMatchSpan(input: string, match: SearchMatch): string {
  return input.slice(match.originalStart, match.originalEnd);
}
