import {
  RUNTIME_CERTIFICATION_AUDIT_SNAPSHOT_SCHEMA_VERSION,
  type RuntimeCapabilityCertificationAuditSnapshot,
} from "./audit-snapshot";
import {
  assertNonEmptyIdentifier,
  assertSchemaVersion,
  deepFreezeStructure,
} from "./manifest";

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
  assertNonEmptyIdentifier(input.manifestId, "manifestId");

  for (const snapshot of input.auditSnapshots) {
    assertSchemaVersion(
      snapshot.schemaVersion,
      RUNTIME_CERTIFICATION_AUDIT_SNAPSHOT_SCHEMA_VERSION,
      "auditSnapshot",
    );
  }

  const auditSnapshots = [...input.auditSnapshots].sort(
    compareAuditSnapshotsBySnapshotId,
  );

  let previousSnapshotId: string | undefined;
  for (const snapshot of auditSnapshots) {
    if (snapshot.snapshotId === previousSnapshotId) {
      throw new Error(
        `[governance invariant] auditSnapshot snapshotId must be unique: ${snapshot.snapshotId}`,
      );
    }
    previousSnapshotId = snapshot.snapshotId;
  }

  // Vacuous-pass: Array.prototype.every returns true for an empty array, so
  // auditSnapshots: [] intentionally produces governanceStatus: "passed".
  // Downstream layers (provenance, closure) must derive their status only from
  // governanceStatus and must never re-evaluate auditSnapshots —
  // Single-Layer Governance Derivation Law.
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
