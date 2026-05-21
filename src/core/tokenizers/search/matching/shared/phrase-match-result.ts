import type { SearchProjectionRecord } from "../../shared/search-projection-record";
import type { SearchMatchRange } from "./search-match-range";

export interface PhraseMatchResult extends SearchMatchRange {
  phraseText: string;
  records: SearchProjectionRecord[];
}
