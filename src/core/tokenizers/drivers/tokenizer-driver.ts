import type { SearchIndexDocument } from "../shared/search-index";
import type {
  NormalizedToken,
  TokenizationResult,
} from "../shared/token-types";

export type SupportedLanguageCode = "th" | "zh" | "en";

export interface TokenizerDriver {
  readonly languageCode: SupportedLanguageCode;
  tokenize(input: string): Promise<TokenizationResult>;
  normalizeToken(token: string): NormalizedToken;
  generateSearchIndex(result: TokenizationResult): SearchIndexDocument;
}
