import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import {
  CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION,
  type CanonicalDictionaryEntry,
} from "../provenance/canonical-dictionary-entry";

export const SPELLING_ENTRY_SCHEMA_VERSION =
  "lingua-core-platform:spelling-entry@phase12";

export type SpellingEntrySchemaVersion = typeof SPELLING_ENTRY_SCHEMA_VERSION;

export interface SpellingEntry {
  readonly schemaVersion: SpellingEntrySchemaVersion;
  readonly entry: CanonicalDictionaryEntry;
  readonly phoneticNotation: string;
  readonly toneClassification: string;
}

export interface ComposeSpellingEntryInput {
  readonly entry: CanonicalDictionaryEntry;
  readonly phoneticNotation: string;
  readonly toneClassification: string;
}

export function composeSpellingEntry(
  input: ComposeSpellingEntryInput,
): SpellingEntry {
  if (
    (input.entry.schemaVersion as unknown) !==
    CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION
  ) {
    throw new Error(
      "[lexical invariant] entry schemaVersion must be lingua-core-platform:canonical-dictionary-entry@phase11",
    );
  }

  if (input.phoneticNotation.trim() === "") {
    throw new Error(
      "[lexical invariant] phoneticNotation must be a non-empty string",
    );
  }

  if (input.toneClassification.trim() === "") {
    throw new Error(
      "[lexical invariant] toneClassification must be a non-empty string",
    );
  }

  return deepFreezeStructure({
    schemaVersion: SPELLING_ENTRY_SCHEMA_VERSION,
    entry: input.entry,
    phoneticNotation: input.phoneticNotation,
    toneClassification: input.toneClassification,
  });
}
