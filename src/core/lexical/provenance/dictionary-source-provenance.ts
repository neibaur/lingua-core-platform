import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";

export const DICTIONARY_SOURCE_PROVENANCE_SCHEMA_VERSION =
  "lingua-core-platform:dictionary-source-provenance@phase11";

export type DictionarySourceProvenanceSchemaVersion =
  typeof DICTIONARY_SOURCE_PROVENANCE_SCHEMA_VERSION;

export interface DictionarySourceProvenance {
  readonly schemaVersion: DictionarySourceProvenanceSchemaVersion;
  readonly sourceId: string;
  readonly displayName: string;
  readonly sourceUrl: string;
  readonly licenseType: string;
  readonly licenseUrl: string;
  readonly attributionRequired: boolean;
  readonly attributionPayload: string;
}

export interface ComposeDictionarySourceProvenanceInput {
  readonly sourceId: string;
  readonly displayName: string;
  readonly sourceUrl: string;
  readonly licenseType: string;
  readonly licenseUrl: string;
  readonly attributionRequired: boolean;
  readonly attributionPayload: string;
}

export function composeDictionarySourceProvenance(
  input: ComposeDictionarySourceProvenanceInput,
): DictionarySourceProvenance {
  if (input.sourceId.trim() === "") {
    throw new Error("[lexical invariant] sourceId must be a non-empty string");
  }

  if (input.displayName.trim() === "") {
    throw new Error(
      "[lexical invariant] displayName must be a non-empty string",
    );
  }

  return deepFreezeStructure({
    schemaVersion: DICTIONARY_SOURCE_PROVENANCE_SCHEMA_VERSION,
    sourceId: input.sourceId,
    displayName: input.displayName,
    sourceUrl: input.sourceUrl,
    licenseType: input.licenseType,
    licenseUrl: input.licenseUrl,
    attributionRequired: input.attributionRequired,
    attributionPayload: input.attributionPayload,
  });
}
