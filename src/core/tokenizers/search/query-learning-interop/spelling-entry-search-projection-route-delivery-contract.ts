import { deepFreezeStructure } from "../runtime-capabilities";
import {
  SPELLING_ENTRY_SEARCH_PROJECTION_SCHEMA_VERSION,
  type SpellingEntrySearchProjection,
} from "./spelling-entry-search-projection";

export const SPELLING_ENTRY_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION =
  "lingua-core-platform:spelling-entry-search-projection-route-delivery-contract@phase14";

export type SpellingEntrySearchProjectionRouteDeliveryContractSchemaVersion =
  typeof SPELLING_ENTRY_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION;

export interface SpellingEntrySearchProjectionRouteDeliveryContract {
  readonly schemaVersion: SpellingEntrySearchProjectionRouteDeliveryContractSchemaVersion;
  readonly deliveryId: string;
  readonly searchProjection: SpellingEntrySearchProjection;
  readonly staticContentAddress: string;
}

export interface ComposeSpellingEntrySearchProjectionRouteDeliveryContractInput {
  readonly deliveryId: string;
  readonly searchProjection: SpellingEntrySearchProjection;
  readonly staticContentAddress: string;
}

export function composeSpellingEntrySearchProjectionRouteDeliveryContract(
  input: ComposeSpellingEntrySearchProjectionRouteDeliveryContractInput,
): SpellingEntrySearchProjectionRouteDeliveryContract {
  if (
    (input.searchProjection.schemaVersion as unknown) !==
    SPELLING_ENTRY_SEARCH_PROJECTION_SCHEMA_VERSION
  ) {
    throw new Error(
      "[delivery-boundary invariant] searchProjection schemaVersion must be lingua-core-platform:spelling-entry-search-projection@phase13",
    );
  }

  if (input.deliveryId.trim() === "") {
    throw new Error(
      "[delivery-boundary invariant] deliveryId must be a non-empty string",
    );
  }

  if (input.staticContentAddress.trim() === "") {
    throw new Error(
      "[delivery-boundary invariant] staticContentAddress must be a non-empty string",
    );
  }

  return deepFreezeStructure({
    schemaVersion:
      SPELLING_ENTRY_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION,
    deliveryId: input.deliveryId,
    searchProjection: input.searchProjection,
    staticContentAddress: input.staticContentAddress,
  });
}
