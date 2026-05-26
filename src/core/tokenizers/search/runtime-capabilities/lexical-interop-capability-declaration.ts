import type {
  RuntimeCapabilityDeclaration,
  RuntimeCapabilityStability,
} from "./contracts";
import { deepFreezeStructure } from "./manifest";

export const LEXICAL_INTEROP_CAPABILITY_DECLARATION_SCHEMA_VERSION =
  "lingua-core-platform:lexical-interop-capability-declaration@phase10" as const;

export type LexicalInteropCapabilityDeclarationSchemaVersion =
  typeof LEXICAL_INTEROP_CAPABILITY_DECLARATION_SCHEMA_VERSION;

export type LexicalInteropCapabilityId =
  | "query:enrich:lexical"
  | "query:report:lexical_enrichment"
  | "query:report:lexical_query";

export interface LexicalInteropCapabilityDeclaration {
  readonly schemaVersion: LexicalInteropCapabilityDeclarationSchemaVersion;
  readonly declarationId: string;
  readonly capabilityCount: number;
  readonly capabilities: readonly RuntimeCapabilityDeclaration[];
}

export interface LexicalInteropCapabilityDeclarationEntry {
  readonly capabilityId: LexicalInteropCapabilityId;
  readonly version: string;
  readonly stability: RuntimeCapabilityStability;
}

export interface ComposeLexicalInteropCapabilityDeclarationInput {
  readonly declarationId: string;
  readonly capabilities: readonly LexicalInteropCapabilityDeclarationEntry[];
}

export function composeLexicalInteropCapabilityDeclaration(
  input: ComposeLexicalInteropCapabilityDeclarationInput,
): LexicalInteropCapabilityDeclaration {
  if (input.declarationId.trim() === "") {
    throw new Error(
      "[runtime-capabilities invariant] declarationId must be a non-empty string",
    );
  }

  const capabilities = input.capabilities.map((capability) => {
    switch (capability.capabilityId) {
      case "query:enrich:lexical":
      case "query:report:lexical_enrichment":
      case "query:report:lexical_query":
        break;
      default:
        throw new Error(
          "[runtime-capabilities invariant] capabilityId must be a supported lexical interop capability",
        );
    }

    return {
      capabilityId: capability.capabilityId,
      kind: "query" as const,
      version: capability.version,
      stability: capability.stability,
    };
  });

  const orderedCapabilities = orderLexicalInteropCapabilities(capabilities);

  return deepFreezeStructure({
    schemaVersion: LEXICAL_INTEROP_CAPABILITY_DECLARATION_SCHEMA_VERSION,
    declarationId: input.declarationId,
    capabilityCount: orderedCapabilities.length,
    capabilities: orderedCapabilities,
  });
}

function orderLexicalInteropCapabilities(
  capabilities: readonly RuntimeCapabilityDeclaration[],
): readonly RuntimeCapabilityDeclaration[] {
  return [...capabilities].sort(compareLexicalInteropCapabilityDeclarations);
}

function compareLexicalInteropCapabilityDeclarations(
  left: RuntimeCapabilityDeclaration,
  right: RuntimeCapabilityDeclaration,
): number {
  return compareStrings(left.capabilityId, right.capabilityId);
}

function compareStrings(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}
