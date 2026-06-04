import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import {
  LEXICAL_INDEX_SCHEMA_VERSION,
  type LexicalEntry,
  type LexicalIndex,
} from "../contracts";
import { canonicalizeEnglishKey } from "../normalization/canonicalize-english-key";
import { normalizeLexicalKey } from "../normalization/normalize-lexical-key";

export interface ComposeLexicalIndexInput {
  readonly lexicalIndexId: string;
  readonly entries: readonly LexicalEntry[];
}

function compareStrings(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

export function composeLexicalIndex(
  input: ComposeLexicalIndexInput,
): LexicalIndex {
  if (input.lexicalIndexId.trim() === "") {
    throw new Error(
      "[lexical invariant] lexicalIndexId must be a non-empty string",
    );
  }

  const sortedEntries = [...input.entries].sort((a, b) =>
    compareStrings(
      normalizeLexicalKey(a.headword),
      normalizeLexicalKey(b.headword),
    ),
  );

  const thaiToEnglish: Record<string, LexicalEntry> = {};
  const englishToThaiBuilder: Record<string, LexicalEntry[] | undefined> = {};

  for (const entry of sortedEntries) {
    const canonicalThaiKey = normalizeLexicalKey(entry.headword);
    thaiToEnglish[canonicalThaiKey] = entry;

    for (const def of entry.definitions) {
      const canonicalEnglishKey = canonicalizeEnglishKey(def.definition);
      const bucket = englishToThaiBuilder[canonicalEnglishKey];
      if (bucket === undefined) {
        englishToThaiBuilder[canonicalEnglishKey] = [entry];
      } else {
        let isDuplicate = false;
        for (let i = 0; i < bucket.length; i++) {
          if (bucket[i] === entry) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          bucket.push(entry);
        }
      }
    }
  }

  // englishToThai keys are in insertion order from sorted-entry traversal, not sorted by key.
  // Callers requiring canonical equivalence must use stableJsonStringify, not key-order comparison.
  const englishToThai: Record<string, LexicalEntry[]> = {};
  for (const key of Object.keys(englishToThaiBuilder)) {
    const bucket = englishToThaiBuilder[key] ?? [];
    englishToThai[key] = [...bucket].sort((a, b) =>
      compareStrings(
        normalizeLexicalKey(a.headword),
        normalizeLexicalKey(b.headword),
      ),
    );
  }

  return deepFreezeStructure({
    schemaVersion: LEXICAL_INDEX_SCHEMA_VERSION,
    lexicalIndexId: input.lexicalIndexId,
    entryCount: sortedEntries.length,
    entries: sortedEntries,
    thaiToEnglish,
    englishToThai,
  });
}
