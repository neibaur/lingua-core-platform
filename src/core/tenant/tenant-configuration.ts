import { deepFreezeStructure } from "../tokenizers/search/runtime-capabilities";
import type { CanonicalLanguageTag } from "../language";

export const TENANT_CONFIGURATION_SCHEMA_VERSION =
  "lingua-core-platform:tenant-configuration@phase15";

export type TenantConfigurationSchemaVersion =
  typeof TENANT_CONFIGURATION_SCHEMA_VERSION;

export interface TenantConfiguration {
  readonly schemaVersion: TenantConfigurationSchemaVersion;
  readonly tenantId: string;
  readonly enabledLanguages: readonly CanonicalLanguageTag[];
}

export interface ComposeTenantConfigurationInput {
  readonly tenantId: string;
  readonly enabledLanguages: readonly CanonicalLanguageTag[];
}

export function composeTenantConfiguration(
  input: ComposeTenantConfigurationInput,
): TenantConfiguration {
  if (input.tenantId.trim() === "") {
    throw new Error("[tenant invariant] tenantId must be a non-empty string");
  }

  for (const language of input.enabledLanguages) {
    if ((language as unknown) !== "th" && (language as unknown) !== "en") {
      throw new Error(
        '[tenant invariant] enabledLanguages must contain only "th" or "en"',
      );
    }
  }

  const orderedLanguages = [...input.enabledLanguages].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );

  for (let index = 1; index < orderedLanguages.length; index += 1) {
    if (orderedLanguages[index] === orderedLanguages[index - 1]) {
      throw new Error(
        "[tenant invariant] enabledLanguages must not contain a duplicate language",
      );
    }
  }

  return deepFreezeStructure({
    schemaVersion: TENANT_CONFIGURATION_SCHEMA_VERSION,
    tenantId: input.tenantId,
    enabledLanguages: orderedLanguages,
  });
}
