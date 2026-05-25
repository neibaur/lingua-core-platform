import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";

export const DICTIONARY_LICENSING_BOUNDARY_SCHEMA_VERSION =
  "lingua-core-platform:dictionary-licensing-boundary@phase11";

export type DictionaryLicensingBoundarySchemaVersion =
  typeof DICTIONARY_LICENSING_BOUNDARY_SCHEMA_VERSION;

export type DictionaryLicensingVerdict = boolean | "unknown";

export interface DictionaryLicensingBoundary {
  readonly schemaVersion: DictionaryLicensingBoundarySchemaVersion;
  readonly sourceId: string;
  readonly isCommerciallyViable: DictionaryLicensingVerdict;
  readonly redistributionAllowed: DictionaryLicensingVerdict;
  readonly licenseType: string;
  readonly licenseUrl: string;
  readonly attributionRequired: DictionaryLicensingVerdict;
}

export interface ComposeDictionaryLicensingBoundaryInput {
  readonly sourceId: string;
  readonly isCommerciallyViable: DictionaryLicensingVerdict;
  readonly redistributionAllowed: DictionaryLicensingVerdict;
  readonly licenseType: string;
  readonly licenseUrl: string;
  readonly attributionRequired: DictionaryLicensingVerdict;
}

export function composeDictionaryLicensingBoundary(
  input: ComposeDictionaryLicensingBoundaryInput,
): DictionaryLicensingBoundary {
  if (input.sourceId.trim() === "") {
    throw new Error("[lexical invariant] sourceId must be a non-empty string");
  }

  return deepFreezeStructure({
    schemaVersion: DICTIONARY_LICENSING_BOUNDARY_SCHEMA_VERSION,
    sourceId: input.sourceId,
    isCommerciallyViable: input.isCommerciallyViable,
    redistributionAllowed: input.redistributionAllowed,
    licenseType: input.licenseType,
    licenseUrl: input.licenseUrl,
    attributionRequired: input.attributionRequired,
  });
}
