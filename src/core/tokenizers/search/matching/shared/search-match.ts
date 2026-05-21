import type { SearchMatchRange } from "./search-match-range";

export interface SearchMatch extends SearchMatchRange {
  matchedText: string;
  matchedTokens: string[];
}
