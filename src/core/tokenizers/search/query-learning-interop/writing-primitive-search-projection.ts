import {
  WRITING_PRIMITIVE_SCHEMA_VERSION,
  type WritingPrimitive,
} from "../../../lexical";
import { deepFreezeStructure } from "../runtime-capabilities";
import {
  LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION,
  type LexicalQueryEnrichmentResult,
} from "../query-lexical-interop";

export const WRITING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION =
  "lingua-core-platform:writing-primitive-search-projection@phase13";

export type WritingPrimitiveSearchProjectionSchemaVersion =
  typeof WRITING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION;

export interface WritingPrimitiveSearchProjection {
  readonly schemaVersion: WritingPrimitiveSearchProjectionSchemaVersion;
  readonly projectionId: string;
  readonly enrichmentResult: LexicalQueryEnrichmentResult;
  readonly writingPrimitive: WritingPrimitive;
}

export interface ComposeWritingPrimitiveSearchProjectionInput {
  readonly projectionId: string;
  readonly enrichmentResult: LexicalQueryEnrichmentResult;
  readonly writingPrimitive: WritingPrimitive;
}

export function composeWritingPrimitiveSearchProjection(
  input: ComposeWritingPrimitiveSearchProjectionInput,
): WritingPrimitiveSearchProjection {
  if (
    (input.enrichmentResult.schemaVersion as unknown) !==
    LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION
  ) {
    throw new Error(
      "[search-learning invariant] enrichmentResult schemaVersion must be lingua-core-platform:lexical-interop-enrichment@phase10",
    );
  }

  if (
    (input.writingPrimitive.schemaVersion as unknown) !==
    WRITING_PRIMITIVE_SCHEMA_VERSION
  ) {
    throw new Error(
      "[search-learning invariant] writingPrimitive schemaVersion must be lingua-core-platform:writing-primitive@phase12",
    );
  }

  if (input.projectionId.trim() === "") {
    throw new Error(
      "[search-learning invariant] projectionId must be a non-empty string",
    );
  }

  return deepFreezeStructure({
    schemaVersion: WRITING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION,
    projectionId: input.projectionId,
    enrichmentResult: input.enrichmentResult,
    writingPrimitive: input.writingPrimitive,
  });
}
