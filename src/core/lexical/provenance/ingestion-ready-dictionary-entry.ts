import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import type { CanonicalDictionaryEntry } from "./canonical-dictionary-entry";
import type { DictionaryLicensingBoundary } from "./dictionary-licensing-boundary";

export const INGESTION_READY_DICTIONARY_ENTRY_SCHEMA_VERSION =
  "lingua-core-platform:ingestion-ready-dictionary-entry@phase11";

export type IngestionReadyDictionaryEntrySchemaVersion =
  typeof INGESTION_READY_DICTIONARY_ENTRY_SCHEMA_VERSION;

export interface IngestionReadyDictionaryEntry {
  readonly schemaVersion: IngestionReadyDictionaryEntrySchemaVersion;
  readonly entry: CanonicalDictionaryEntry;
  readonly licensingBoundary: DictionaryLicensingBoundary;
}

export interface ComposeIngestionReadyDictionaryEntryInput {
  readonly entry: CanonicalDictionaryEntry;
  readonly licensingBoundary: DictionaryLicensingBoundary;
}

export function composeIngestionReadyDictionaryEntry(
  input: ComposeIngestionReadyDictionaryEntryInput,
): IngestionReadyDictionaryEntry {
  return deepFreezeStructure({
    schemaVersion: INGESTION_READY_DICTIONARY_ENTRY_SCHEMA_VERSION,
    entry: input.entry,
    licensingBoundary: input.licensingBoundary,
  });
}
