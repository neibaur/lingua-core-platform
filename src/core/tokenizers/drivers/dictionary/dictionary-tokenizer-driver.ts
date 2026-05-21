import type { TokenizerDriver } from "../tokenizer-driver";
import type { SearchIndexDocument } from "../../shared/search-index";
import type {
  NormalizedToken,
  TokenizationResult,
} from "../../shared/token-types";
import { forwardMaximumMatch } from "./algorithms/maximum-match";
import {
  THAI_FIXTURE_DICTIONARY,
  type ThaiFixtureDictionaryEntry,
} from "./fixtures/thai-fixture-dictionary";

export interface DictionaryTokenizerDriverOptions {
  dictionary?: readonly ThaiFixtureDictionaryEntry[];
}

export class DictionaryTokenizerDriver implements TokenizerDriver {
  readonly languageCode = "th";

  private readonly dictionary: readonly ThaiFixtureDictionaryEntry[];
  private readonly entriesBySurface: ReadonlyMap<
    string,
    ThaiFixtureDictionaryEntry
  >;

  constructor(options: DictionaryTokenizerDriverOptions = {}) {
    this.dictionary = options.dictionary ?? THAI_FIXTURE_DICTIONARY;
    this.entriesBySurface = new Map(
      this.dictionary.map((entry) => [entry.surface, entry]),
    );
  }

  tokenize(input: string): Promise<TokenizationResult> {
    const tokens = forwardMaximumMatch(input, this.dictionary);

    return Promise.resolve({
      originalText: input,
      tokens,
      normalizedTokens: tokens.map((token) =>
        this.normalizeToken(token.surface),
      ),
    });
  }

  normalizeToken(token: string): NormalizedToken {
    const dictionaryEntry = this.entriesBySurface.get(token);

    return {
      original: token,
      normalized: token.toLowerCase(),
      ...(dictionaryEntry?.romanized === undefined
        ? {}
        : { romanized: dictionaryEntry.romanized }),
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
}
