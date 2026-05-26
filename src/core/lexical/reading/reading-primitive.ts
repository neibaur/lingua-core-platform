import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import {
  CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION,
  type CanonicalDictionaryEntry,
} from "../provenance/canonical-dictionary-entry";

export const READING_PRIMITIVE_SCHEMA_VERSION =
  "lingua-core-platform:reading-primitive@phase12";

export type ReadingPrimitiveSchemaVersion =
  typeof READING_PRIMITIVE_SCHEMA_VERSION;

export interface ReadingPrimitive {
  readonly schemaVersion: ReadingPrimitiveSchemaVersion;
  readonly readingPrimitiveId: string;
  readonly entry: CanonicalDictionaryEntry;
}

export interface ComposeReadingPrimitiveInput {
  readonly readingPrimitiveId: string;
  readonly entry: CanonicalDictionaryEntry;
}

export function composeReadingPrimitive(
  input: ComposeReadingPrimitiveInput,
): ReadingPrimitive {
  if (
    (input.entry.schemaVersion as unknown) !==
    CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION
  ) {
    throw new Error(
      "[lexical invariant] entry schemaVersion must be lingua-core-platform:canonical-dictionary-entry@phase11",
    );
  }

  if (input.readingPrimitiveId.trim() === "") {
    throw new Error(
      "[lexical invariant] readingPrimitiveId must be a non-empty string",
    );
  }

  return deepFreezeStructure({
    schemaVersion: READING_PRIMITIVE_SCHEMA_VERSION,
    readingPrimitiveId: input.readingPrimitiveId,
    entry: input.entry,
  });
}
