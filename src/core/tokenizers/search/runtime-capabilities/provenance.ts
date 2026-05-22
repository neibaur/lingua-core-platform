import type { RuntimeOperationalGovernanceManifest } from "./operational-governance-manifest";
import { deepFreezeStructure } from "./manifest";

export const RUNTIME_GOVERNANCE_PROVENANCE_SCHEMA_VERSION =
  "lingua-core-platform:runtime-governance-provenance@phase9";

export type RuntimeGovernanceProvenanceSchemaVersion =
  typeof RUNTIME_GOVERNANCE_PROVENANCE_SCHEMA_VERSION;

export type RuntimeGovernanceAttestationStatus = "passed" | "failed";

export interface RuntimeGovernanceProvenance {
  readonly provenanceId: string;
  readonly generatedFrom: "runtime-governance-provenance";
  readonly schemaVersion: RuntimeGovernanceProvenanceSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly operationalManifest: RuntimeOperationalGovernanceManifest;
  readonly attestationStatus: RuntimeGovernanceAttestationStatus;
}

export interface ComposeRuntimeGovernanceProvenanceInput {
  readonly provenanceId: string;
  readonly operationalManifest: RuntimeOperationalGovernanceManifest;
}

const GOVERNANCE_PROVENANCE_GENERATED_FROM =
  "runtime-governance-provenance" as const;

export function composeRuntimeGovernanceProvenance(
  input: ComposeRuntimeGovernanceProvenanceInput,
): RuntimeGovernanceProvenance {
  const attestationStatus: RuntimeGovernanceAttestationStatus =
    input.operationalManifest.governanceStatus === "passed"
      ? "passed"
      : "failed";

  return deepFreezeStructure({
    provenanceId: input.provenanceId,
    generatedFrom: GOVERNANCE_PROVENANCE_GENERATED_FROM,
    schemaVersion: RUNTIME_GOVERNANCE_PROVENANCE_SCHEMA_VERSION,
    evaluationTimestamp: null,
    operationalManifest: input.operationalManifest,
    attestationStatus,
  });
}
