export interface Token {
  surface: string;
  startOffset: number;
  endOffset: number;
}

export interface NormalizedToken {
  original: string;
  normalized: string;
  romanized?: string;
  toneClass?: string;
}

export interface TokenizationResult {
  originalText: string;
  tokens: Token[];
  normalizedTokens: NormalizedToken[];
}
