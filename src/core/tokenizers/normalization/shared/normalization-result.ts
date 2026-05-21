import type { IndexMap } from "./index-map";

export interface NormalizationResult {
  originalText: string;
  normalizedText: string;
  indexMap: IndexMap;
  appliedRules: string[];
}
