import { deepFreezeStructure } from "../runtime-capabilities";
import {
  WRITING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION,
  type WritingPrimitiveSearchProjection,
} from "./writing-primitive-search-projection";

export const WRITING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION =
  "lingua-core-platform:writing-primitive-search-projection-route-delivery-contract@phase14";

export type WritingPrimitiveSearchProjectionRouteDeliveryContractSchemaVersion =
  typeof WRITING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION;

export interface WritingPrimitiveSearchProjectionRouteDeliveryContract {
  readonly schemaVersion: WritingPrimitiveSearchProjectionRouteDeliveryContractSchemaVersion;
  readonly deliveryId: string;
  readonly searchProjection: WritingPrimitiveSearchProjection;
  readonly staticContentAddress: string;
}

export interface ComposeWritingPrimitiveSearchProjectionRouteDeliveryContractInput {
  readonly deliveryId: string;
  readonly searchProjection: WritingPrimitiveSearchProjection;
  readonly staticContentAddress: string;
}

export function composeWritingPrimitiveSearchProjectionRouteDeliveryContract(
  input: ComposeWritingPrimitiveSearchProjectionRouteDeliveryContractInput,
): WritingPrimitiveSearchProjectionRouteDeliveryContract {
  if (
    (input.searchProjection.schemaVersion as unknown) !==
    WRITING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION
  ) {
    throw new Error(
      "[delivery-boundary invariant] searchProjection schemaVersion must be lingua-core-platform:writing-primitive-search-projection@phase13",
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
      WRITING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION,
    deliveryId: input.deliveryId,
    searchProjection: input.searchProjection,
    staticContentAddress: input.staticContentAddress,
  });
}
