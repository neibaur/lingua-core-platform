import {
  READING_PRIMITIVE_SCHEMA_VERSION,
  type ReadingPrimitive,
} from "../../../lexical";
import { deepFreezeStructure } from "../runtime-capabilities";
import {
  LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION,
  type LexicalQueryEnrichmentResult,
} from "../query-lexical-interop";

export const READING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION =
  "lingua-core-platform:reading-primitive-search-projection@phase13";

export type ReadingPrimitiveSearchProjectionSchemaVersion =
  typeof READING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION;

export interface ReadingPrimitiveSearchProjection {
  readonly schemaVersion: ReadingPrimitiveSearchProjectionSchemaVersion;
  readonly projectionId: string;
  readonly enrichmentResult: LexicalQueryEnrichmentResult;
  readonly readingPrimitive: ReadingPrimitive;
}

export interface ComposeReadingPrimitiveSearchProjectionInput {
  readonly projectionId: string;
  readonly enrichmentResult: LexicalQueryEnrichmentResult;
  readonly readingPrimitive: ReadingPrimitive;
}

export function composeReadingPrimitiveSearchProjection(
  input: ComposeReadingPrimitiveSearchProjectionInput,
): ReadingPrimitiveSearchProjection {
  if (
    (input.enrichmentResult.schemaVersion as unknown) !==
    LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION
  ) {
    throw new Error(
      "[search-learning invariant] enrichmentResult schemaVersion must be lingua-core-platform:lexical-interop-enrichment@phase10",
    );
  }

  if (
    (input.readingPrimitive.schemaVersion as unknown) !==
    READING_PRIMITIVE_SCHEMA_VERSION
  ) {
    throw new Error(
      "[search-learning invariant] readingPrimitive schemaVersion must be lingua-core-platform:reading-primitive@phase12",
    );
  }

  if (input.projectionId.trim() === "") {
    throw new Error(
      "[search-learning invariant] projectionId must be a non-empty string",
    );
  }

  return deepFreezeStructure({
    schemaVersion: READING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION,
    projectionId: input.projectionId,
    enrichmentResult: input.enrichmentResult,
    readingPrimitive: input.readingPrimitive,
  });
}
