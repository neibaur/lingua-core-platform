import type {
  RuntimeCapabilityDeclaration,
  RuntimeCapabilityStability,
} from "./contracts";

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
