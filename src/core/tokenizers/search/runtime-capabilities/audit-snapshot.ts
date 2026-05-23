import type { RuntimeCapabilityGovernanceReport } from "./governance-report";
import { deepFreezeStructure } from "./manifest";

export const RUNTIME_CERTIFICATION_AUDIT_SNAPSHOT_SCHEMA_VERSION =
  "lingua-core-platform:runtime-certification-audit-snapshot@phase9";

export type RuntimeCapabilityAuditSnapshotSchemaVersion =
  typeof RUNTIME_CERTIFICATION_AUDIT_SNAPSHOT_SCHEMA_VERSION;

export type RuntimeCapabilityAuditSnapshotStatus = "passed" | "failed";

export interface RuntimeCapabilityCertificationAuditSnapshot {
  readonly snapshotId: string;
  readonly generatedFrom: "runtime-capability-certification-audit-snapshot";
  readonly schemaVersion: RuntimeCapabilityAuditSnapshotSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly governanceReport: RuntimeCapabilityGovernanceReport;
  readonly auditStatus: RuntimeCapabilityAuditSnapshotStatus;
}

export interface ComposeRuntimeCapabilityCertificationAuditSnapshotInput {
  readonly snapshotId: string;
  readonly governanceReport: RuntimeCapabilityGovernanceReport;
}

const AUDIT_SNAPSHOT_GENERATED_FROM =
  "runtime-capability-certification-audit-snapshot" as const;

export function composeRuntimeCapabilityCertificationAuditSnapshot(
  input: ComposeRuntimeCapabilityCertificationAuditSnapshotInput,
): RuntimeCapabilityCertificationAuditSnapshot {
  const auditStatus: RuntimeCapabilityAuditSnapshotStatus =
    input.governanceReport.reportStatus === "passed" ? "passed" : "failed";

  return deepFreezeStructure({
    snapshotId: input.snapshotId,
    generatedFrom: AUDIT_SNAPSHOT_GENERATED_FROM,
    schemaVersion: RUNTIME_CERTIFICATION_AUDIT_SNAPSHOT_SCHEMA_VERSION,
    evaluationTimestamp: null,
    governanceReport: input.governanceReport,
    auditStatus,
  });
}
