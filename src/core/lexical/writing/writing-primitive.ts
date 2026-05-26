import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import {
  CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION,
  type CanonicalDictionaryEntry,
} from "../provenance/canonical-dictionary-entry";

export const WRITING_PRIMITIVE_SCHEMA_VERSION =
  "lingua-core-platform:writing-primitive@phase12";

export type WritingPrimitiveSchemaVersion =
  typeof WRITING_PRIMITIVE_SCHEMA_VERSION;

export type WritingPrimitiveExerciseMode = "free-fill" | "template-overlay";

export interface WritingPrimitive {
  readonly schemaVersion: WritingPrimitiveSchemaVersion;
  readonly writingPrimitiveId: string;
  readonly entry: CanonicalDictionaryEntry;
  readonly referenceCharacterForm: string;
  readonly exerciseMode: WritingPrimitiveExerciseMode;
}

export interface ComposeWritingPrimitiveInput {
  readonly writingPrimitiveId: string;
  readonly entry: CanonicalDictionaryEntry;
  readonly referenceCharacterForm: string;
  readonly exerciseMode: WritingPrimitiveExerciseMode;
}

export function composeWritingPrimitive(
  input: ComposeWritingPrimitiveInput,
): WritingPrimitive {
  if (
    (input.entry.schemaVersion as unknown) !==
    CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION
  ) {
    throw new Error(
      "[lexical invariant] entry schemaVersion must be lingua-core-platform:canonical-dictionary-entry@phase11",
    );
  }

  if (input.writingPrimitiveId.trim() === "") {
    throw new Error(
      "[lexical invariant] writingPrimitiveId must be a non-empty string",
    );
  }

  if (input.referenceCharacterForm.trim() === "") {
    throw new Error(
      "[lexical invariant] referenceCharacterForm must be a non-empty string",
    );
  }

  switch (input.exerciseMode) {
    case "free-fill":
      break;
    case "template-overlay":
      break;
    default:
      throw new Error(
        '[lexical invariant] exerciseMode must be "free-fill" or "template-overlay"',
      );
  }

  return deepFreezeStructure({
    schemaVersion: WRITING_PRIMITIVE_SCHEMA_VERSION,
    writingPrimitiveId: input.writingPrimitiveId,
    entry: input.entry,
    referenceCharacterForm: input.referenceCharacterForm,
    exerciseMode: input.exerciseMode,
  });
}
