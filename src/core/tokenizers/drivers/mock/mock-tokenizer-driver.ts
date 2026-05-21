import type { TokenizerDriver } from "../tokenizer-driver";
import type { SearchIndexDocument } from "../../shared/search-index";
import type {
  NormalizedToken,
  Token,
  TokenizationResult,
} from "../../shared/token-types";

export interface MockTokenizerDriverOptions {
  romanizationByToken?: Readonly<Partial<Record<string, string>>>;
}

export class MockTokenizerDriver implements TokenizerDriver {
  readonly languageCode = "th";

  private readonly romanizationByToken: Readonly<
    Partial<Record<string, string>>
  >;

  constructor(options: MockTokenizerDriverOptions = {}) {
    this.romanizationByToken = options.romanizationByToken ?? {};
  }

  tokenize(input: string): Promise<TokenizationResult> {
    const tokens = this.segmentOnSpaces(input);

    return Promise.resolve({
      originalText: input,
      tokens,
      normalizedTokens: tokens.map((token) =>
        this.normalizeToken(token.surface),
      ),
    });
  }

  normalizeToken(token: string): NormalizedToken {
    const romanized = this.romanizationByToken[token];

    return {
      original: token,
      normalized: token.toLowerCase(),
      ...(romanized === undefined ? {} : { romanized }),
    };
  }

  generateSearchIndex(result: TokenizationResult): SearchIndexDocument {
    return {
      surfaceForms: result.tokens.map((token) => token.surface),
      normalizedForms: result.normalizedTokens.map((token) => token.normalized),
      romanizedForms: result.normalizedTokens
        .map((token) => token.romanized)
        .filter(
          (romanized): romanized is string =>
            romanized !== undefined && romanized !== "",
        ),
    };
  }

  private segmentOnSpaces(input: string): Token[] {
    const tokens: Token[] = [];
    const tokenPattern = /\S+/g;
    let match: RegExpExecArray | null;

    while ((match = tokenPattern.exec(input)) !== null) {
      const surface = match[0];
      const startOffset = match.index;

      tokens.push({
        surface,
        startOffset,
        endOffset: startOffset + surface.length,
      });
    }

    return tokens;
  }
}
