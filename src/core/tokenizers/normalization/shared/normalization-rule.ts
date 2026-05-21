import type { IndexMap } from "./index-map";

export interface NormalizationRuleInput {
  text: string;
  indexMap: IndexMap;
}

export interface NormalizationRuleOutput {
  text: string;
  indexMap: IndexMap;
}

export interface NormalizationRule {
  readonly id: string;
  apply(input: NormalizationRuleInput): NormalizationRuleOutput;
}
