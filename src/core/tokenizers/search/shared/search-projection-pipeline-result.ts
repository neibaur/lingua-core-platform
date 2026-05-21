import type { NormalizationResult } from "../../normalization";
import type { TokenizationResult } from "../../shared/token-types";
import type { SearchProjectionRecord } from "./search-projection-record";

export interface SearchProjectionPipelineResult {
  originalText: string;
  normalizedText: string;
  normalization: NormalizationResult;
  tokenization: TokenizationResult;
  records: SearchProjectionRecord[];
}
