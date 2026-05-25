import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import {
  LEXICAL_LOOKUP_RESULT_SCHEMA_VERSION,
  type LexicalEntry,
  type LexicalIndex,
  type LexicalLookupDiagnostic,
  type LexicalLookupInput,
  type LexicalLookupResult,
} from "../contracts";
import { normalizeLexicalKey } from "../normalization/normalize-lexical-key";

function compareEntries(a: LexicalEntry, b: LexicalEntry): number {
  const keyA = a.headword;
  const keyB = b.headword;
  if (keyA < keyB) {
    return -1;
  }
  if (keyA > keyB) {
    return 1;
  }
  return 0;
}

export function composeLexicalLookup(
  input: LexicalLookupInput,
  index: LexicalIndex,
): LexicalLookupResult {
  if (/\s/.test(input.query)) {
    throw new Error(
      `[lexical invariant] query must not contain whitespace: ${JSON.stringify(input.query)}`,
    );
  }

  const diagnostics: LexicalLookupDiagnostic[] = [];

  if (index.entryCount === 0) {
    diagnostics.push({
      code: "LEXICAL_INDEX_EMPTY",
      severity: "warning",
      path: ["index"],
      message: "The lexical index contains no entries.",
    });

    return deepFreezeStructure({
      schemaVersion: LEXICAL_LOOKUP_RESULT_SCHEMA_VERSION,
      query: input.query,
      direction: input.direction,
      entries: [],
      diagnostics,
    });
  }

  const canonicalKey = normalizeLexicalKey(input.query);

  let entries: LexicalEntry[];

  if (input.direction === "th→en") {
    if (canonicalKey in index.thaiToEnglish) {
      entries = [index.thaiToEnglish[canonicalKey]];
    } else {
      diagnostics.push({
        code: "LEXICAL_KEY_NOT_FOUND",
        severity: "warning",
        path: ["query"],
        message: `No Thai entry found for key: ${JSON.stringify(input.query)}`,
      });
      entries = [];
    }
  } else {
    const canonicalEnglishKey = canonicalKey.toLowerCase();
    if (canonicalEnglishKey in index.englishToThai) {
      entries = [...index.englishToThai[canonicalEnglishKey]].sort(
        compareEntries,
      );
    } else {
      diagnostics.push({
        code: "LEXICAL_KEY_NOT_FOUND",
        severity: "warning",
        path: ["query"],
        message: `No English entry found for key: ${JSON.stringify(input.query)}`,
      });
      entries = [];
    }
  }

  return deepFreezeStructure({
    schemaVersion: LEXICAL_LOOKUP_RESULT_SCHEMA_VERSION,
    query: input.query,
    direction: input.direction,
    entries,
    diagnostics,
  });
}
