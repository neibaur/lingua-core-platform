import {
  SPELLING_ENTRY_SCHEMA_VERSION,
  type SpellingEntry,
} from "../../../lexical";
import { deepFreezeStructure } from "../runtime-capabilities";
import {
  LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION,
  type LexicalQueryEnrichmentResult,
} from "../query-lexical-interop";

export const SPELLING_ENTRY_SEARCH_PROJECTION_SCHEMA_VERSION =
  "lingua-core-platform:spelling-entry-search-projection@phase13";

export type SpellingEntrySearchProjectionSchemaVersion =
  typeof SPELLING_ENTRY_SEARCH_PROJECTION_SCHEMA_VERSION;

export interface SpellingEntrySearchProjection {
  readonly schemaVersion: SpellingEntrySearchProjectionSchemaVersion;
  readonly projectionId: string;
  readonly enrichmentResult: LexicalQueryEnrichmentResult;
  readonly spellingEntry: SpellingEntry;
}

export interface ComposeSpellingEntrySearchProjectionInput {
  readonly projectionId: string;
  readonly enrichmentResult: LexicalQueryEnrichmentResult;
  readonly spellingEntry: SpellingEntry;
}

export function composeSpellingEntrySearchProjection(
  input: ComposeSpellingEntrySearchProjectionInput,
): SpellingEntrySearchProjection {
  if (
    (input.enrichmentResult.schemaVersion as unknown) !==
    LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION
  ) {
    throw new Error(
      "[search-learning invariant] enrichmentResult schemaVersion must be lingua-core-platform:lexical-interop-enrichment@phase10",
    );
  }

  if (
    (input.spellingEntry.schemaVersion as unknown) !==
    SPELLING_ENTRY_SCHEMA_VERSION
  ) {
    throw new Error(
      "[search-learning invariant] spellingEntry schemaVersion must be lingua-core-platform:spelling-entry@phase12",
    );
  }

  if (input.projectionId.trim() === "") {
    throw new Error(
      "[search-learning invariant] projectionId must be a non-empty string",
    );
  }

  return deepFreezeStructure({
    schemaVersion: SPELLING_ENTRY_SEARCH_PROJECTION_SCHEMA_VERSION,
    projectionId: input.projectionId,
    enrichmentResult: input.enrichmentResult,
    spellingEntry: input.spellingEntry,
  });
}
