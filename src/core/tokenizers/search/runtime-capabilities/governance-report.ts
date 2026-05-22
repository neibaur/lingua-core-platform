import type { RuntimeCapabilityIntrospectionEnvelope } from "./contracts";
import { deepFreezeStructure } from "./manifest";

export const RUNTIME_CAPABILITY_GOVERNANCE_REPORT_SCHEMA_VERSION =
  "lingua-core-platform:runtime-capability-governance-report@phase9";

export type RuntimeCapabilityGovernanceReportSchemaVersion =
  typeof RUNTIME_CAPABILITY_GOVERNANCE_REPORT_SCHEMA_VERSION;

export type RuntimeCapabilityGovernanceReportStatus = "passed" | "failed";

export interface RuntimeCapabilityGovernanceReport {
  readonly reportId: string;
  readonly generatedFrom: "runtime-capability-governance-report";
  readonly schemaVersion: RuntimeCapabilityGovernanceReportSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly introspectionEnvelope: RuntimeCapabilityIntrospectionEnvelope;
  readonly reportStatus: RuntimeCapabilityGovernanceReportStatus;
}

export interface ComposeRuntimeCapabilityGovernanceReportInput {
  readonly reportId: string;
  readonly introspectionEnvelope: RuntimeCapabilityIntrospectionEnvelope;
}

const GOVERNANCE_REPORT_GENERATED_FROM =
  "runtime-capability-governance-report" as const;

export function composeRuntimeCapabilityGovernanceReport(
  input: ComposeRuntimeCapabilityGovernanceReportInput,
): RuntimeCapabilityGovernanceReport {
  const reportStatus: RuntimeCapabilityGovernanceReportStatus =
    input.introspectionEnvelope.certificationSummary.globalStatus ===
    "certified"
      ? "passed"
      : "failed";

  return deepFreezeStructure({
    reportId: input.reportId,
    generatedFrom: GOVERNANCE_REPORT_GENERATED_FROM,
    schemaVersion: RUNTIME_CAPABILITY_GOVERNANCE_REPORT_SCHEMA_VERSION,
    evaluationTimestamp: null,
    introspectionEnvelope: input.introspectionEnvelope,
    reportStatus,
  });
}
