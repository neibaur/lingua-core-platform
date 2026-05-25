import { normalizeLexicalKey } from "../normalization/normalize-lexical-key";

export type LexicalLanguageCode = "thai" | "en";

export type LexicalEntryId = `${LexicalLanguageCode}:${string}:v${number}`;

export interface ComposeEntryIdInput {
  readonly languageCode: LexicalLanguageCode;
  readonly headword: string;
  readonly version: number;
}

export function composeEntryId(input: ComposeEntryIdInput): LexicalEntryId {
  if (!Number.isInteger(input.version) || input.version < 1) {
    throw new Error(
      `[lexical invariant] version must be a positive integer, got: ${String(input.version)}`,
    );
  }

  const canonicalKey = normalizeLexicalKey(input.headword);

  if (canonicalKey.length === 0) {
    throw new Error(
      "[lexical invariant] headword must not be empty after normalization",
    );
  }

  if (canonicalKey.includes(":")) {
    throw new Error(
      `[lexical invariant] headword canonical key must not contain a colon: ${JSON.stringify(canonicalKey)}`,
    );
  }

  return `${input.languageCode}:${canonicalKey}:v${String(input.version)}` as LexicalEntryId;
}

export function assertValidLexicalEntryId(
  id: string,
): asserts id is LexicalEntryId {
  const segments = id.split(":");

  if (segments.length !== 3) {
    throw new Error(
      `[lexical invariant] LexicalEntryId must have exactly 3 colon-delimited segments: ${JSON.stringify(id)}`,
    );
  }

  const [languageCode, canonicalKey, versionTag] = segments as [
    string,
    string,
    string,
  ];

  if (languageCode !== "thai" && languageCode !== "en") {
    throw new Error(
      `[lexical invariant] LexicalEntryId language code must be "thai" or "en": ${JSON.stringify(id)}`,
    );
  }

  if (canonicalKey.length === 0) {
    throw new Error(
      `[lexical invariant] LexicalEntryId canonical key segment must not be empty: ${JSON.stringify(id)}`,
    );
  }

  if (/\s/.test(canonicalKey)) {
    throw new Error(
      `[lexical invariant] LexicalEntryId canonical key segment must not contain whitespace: ${JSON.stringify(id)}`,
    );
  }

  if (!versionTag.startsWith("v")) {
    throw new Error(
      `[lexical invariant] LexicalEntryId version segment must start with "v": ${JSON.stringify(id)}`,
    );
  }

  const versionNumber = Number(versionTag.slice(1));

  if (!Number.isInteger(versionNumber) || versionNumber < 1) {
    throw new Error(
      `[lexical invariant] LexicalEntryId version segment must be "v" followed by a positive integer: ${JSON.stringify(id)}`,
    );
  }
}
