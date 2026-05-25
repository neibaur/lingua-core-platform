import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import type { LexicalDefinition } from "../contracts";
import type { LexicalEntryId } from "../identity/lexical-entry-id";
import type { DictionarySourceProvenance } from "./dictionary-source-provenance";

export const CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION =
  "lingua-core-platform:canonical-dictionary-entry@phase11";

export type CanonicalDictionaryEntrySchemaVersion =
  typeof CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION;

export interface CanonicalDictionaryEntry {
  readonly schemaVersion: CanonicalDictionaryEntrySchemaVersion;
  readonly entryId: LexicalEntryId;
  readonly provenance: DictionarySourceProvenance;
  readonly headword: string;
  readonly romanized?: string;
  readonly definitions: readonly LexicalDefinition[];
}

export interface ComposeCanonicalDictionaryEntryInput {
  readonly entryId: LexicalEntryId;
  readonly provenance: DictionarySourceProvenance;
  readonly headword: string;
  readonly romanized?: string;
  readonly definitions: readonly LexicalDefinition[];
}

export function composeCanonicalDictionaryEntry(
  input: ComposeCanonicalDictionaryEntryInput,
): CanonicalDictionaryEntry {
  if (input.entryId.trim() === "") {
    throw new Error("[lexical invariant] entryId must be a non-empty string");
  }

  if (input.headword.trim() === "") {
    throw new Error("[lexical invariant] headword must be a non-empty string");
  }

  if (input.definitions.length === 0) {
    throw new Error(
      "[lexical invariant] definitions must be a non-empty array",
    );
  }

  return deepFreezeStructure({
    schemaVersion: CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION,
    entryId: input.entryId,
    provenance: input.provenance,
    headword: input.headword,
    ...(input.romanized !== undefined ? { romanized: input.romanized } : {}),
    definitions: [...input.definitions],
  });
}
