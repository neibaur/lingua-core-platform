import type { RuntimeCapabilityCertificationAuditSnapshot } from "./audit-snapshot";
import { deepFreezeStructure } from "./manifest";

export const RUNTIME_OPERATIONAL_GOVERNANCE_MANIFEST_SCHEMA_VERSION =
  "lingua-core-platform:runtime-operational-governance-manifest@phase9";

export type RuntimeOperationalGovernanceManifestSchemaVersion =
  typeof RUNTIME_OPERATIONAL_GOVERNANCE_MANIFEST_SCHEMA_VERSION;

export type RuntimeOperationalGovernanceStatus = "passed" | "failed";

export interface RuntimeOperationalGovernanceManifest {
  readonly manifestId: string;
  readonly generatedFrom: "runtime-operational-governance-manifest";
  readonly schemaVersion: RuntimeOperationalGovernanceManifestSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly auditSnapshots: ReadonlyArray<RuntimeCapabilityCertificationAuditSnapshot>;
  readonly governanceStatus: RuntimeOperationalGovernanceStatus;
}

export interface ComposeRuntimeOperationalGovernanceManifestInput {
  readonly manifestId: string;
  readonly auditSnapshots: ReadonlyArray<RuntimeCapabilityCertificationAuditSnapshot>;
}

const OPERATIONAL_GOVERNANCE_MANIFEST_GENERATED_FROM =
  "runtime-operational-governance-manifest" as const;

export function composeRuntimeOperationalGovernanceManifest(
  input: ComposeRuntimeOperationalGovernanceManifestInput,
): RuntimeOperationalGovernanceManifest {
  const auditSnapshots = [...input.auditSnapshots].sort(
    compareAuditSnapshotsBySnapshotId,
  );

  const governanceStatus: RuntimeOperationalGovernanceStatus =
    auditSnapshots.every((snapshot) => snapshot.auditStatus === "passed")
      ? "passed"
      : "failed";

  return deepFreezeStructure({
    manifestId: input.manifestId,
    generatedFrom: OPERATIONAL_GOVERNANCE_MANIFEST_GENERATED_FROM,
    schemaVersion: RUNTIME_OPERATIONAL_GOVERNANCE_MANIFEST_SCHEMA_VERSION,
    evaluationTimestamp: null,
    auditSnapshots,
    governanceStatus,
  });
}

function compareAuditSnapshotsBySnapshotId(
  a: RuntimeCapabilityCertificationAuditSnapshot,
  b: RuntimeCapabilityCertificationAuditSnapshot,
): number {
  if (a.snapshotId < b.snapshotId) return -1;
  if (a.snapshotId > b.snapshotId) return 1;
  return 0;
}
