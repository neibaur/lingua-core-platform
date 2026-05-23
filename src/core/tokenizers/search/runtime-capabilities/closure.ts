import {
  RUNTIME_GOVERNANCE_PROVENANCE_SCHEMA_VERSION,
  type RuntimeGovernanceProvenance,
} from "./provenance";
import {
  assertNonEmptyIdentifier,
  assertSchemaVersion,
  deepFreezeStructure,
} from "./manifest";

export const RUNTIME_GOVERNANCE_CLOSURE_SCHEMA_VERSION =
  "lingua-core-platform:runtime-governance-closure@phase9";

export type RuntimeGovernanceClosureSchemaVersion =
  typeof RUNTIME_GOVERNANCE_CLOSURE_SCHEMA_VERSION;

export type RuntimeGovernanceClosureStatus = "passed" | "failed";

export interface RuntimeGovernanceClosure {
  readonly closureId: string;
  readonly generatedFrom: "runtime-governance-closure";
  readonly schemaVersion: RuntimeGovernanceClosureSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly provenance: RuntimeGovernanceProvenance;
  readonly closureStatus: RuntimeGovernanceClosureStatus;
}

export interface ComposeRuntimeGovernanceClosureInput {
  readonly closureId: string;
  readonly provenance: RuntimeGovernanceProvenance;
}

const GOVERNANCE_CLOSURE_GENERATED_FROM = "runtime-governance-closure" as const;

export function composeRuntimeGovernanceClosure(
  input: ComposeRuntimeGovernanceClosureInput,
): RuntimeGovernanceClosure {
  assertNonEmptyIdentifier(input.closureId, "closureId");

  assertSchemaVersion(
    input.provenance.schemaVersion,
    RUNTIME_GOVERNANCE_PROVENANCE_SCHEMA_VERSION,
    "provenance",
  );

  const closureStatus: RuntimeGovernanceClosureStatus =
    input.provenance.attestationStatus === "passed" ? "passed" : "failed";

  return deepFreezeStructure({
    closureId: input.closureId,
    generatedFrom: GOVERNANCE_CLOSURE_GENERATED_FROM,
    schemaVersion: RUNTIME_GOVERNANCE_CLOSURE_SCHEMA_VERSION,
    evaluationTimestamp: null,
    provenance: input.provenance,
    closureStatus,
  });
}
