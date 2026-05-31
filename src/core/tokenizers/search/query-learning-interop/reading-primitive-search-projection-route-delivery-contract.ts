import { deepFreezeStructure } from "../runtime-capabilities";
import {
  READING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION,
  type ReadingPrimitiveSearchProjection,
} from "./reading-primitive-search-projection";

export const READING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION =
  "lingua-core-platform:reading-primitive-search-projection-route-delivery-contract@phase14";

export type ReadingPrimitiveSearchProjectionRouteDeliveryContractSchemaVersion =
  typeof READING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION;

export interface ReadingPrimitiveSearchProjectionRouteDeliveryContract {
  readonly schemaVersion: ReadingPrimitiveSearchProjectionRouteDeliveryContractSchemaVersion;
  readonly deliveryId: string;
  readonly searchProjection: ReadingPrimitiveSearchProjection;
  readonly staticContentAddress: string;
}

export interface ComposeReadingPrimitiveSearchProjectionRouteDeliveryContractInput {
  readonly deliveryId: string;
  readonly searchProjection: ReadingPrimitiveSearchProjection;
  readonly staticContentAddress: string;
}

export function composeReadingPrimitiveSearchProjectionRouteDeliveryContract(
  input: ComposeReadingPrimitiveSearchProjectionRouteDeliveryContractInput,
): ReadingPrimitiveSearchProjectionRouteDeliveryContract {
  if (
    (input.searchProjection.schemaVersion as unknown) !==
    READING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION
  ) {
    throw new Error(
      "[delivery-boundary invariant] searchProjection schemaVersion must be lingua-core-platform:reading-primitive-search-projection@phase13",
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
      READING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION,
    deliveryId: input.deliveryId,
    searchProjection: input.searchProjection,
    staticContentAddress: input.staticContentAddress,
  });
}
