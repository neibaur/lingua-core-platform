import {
  RUNTIME_INTROSPECTION_ENVELOPE_SCHEMA_VERSION,
  type RuntimeCapabilityIntrospectionEnvelope,
} from "./contracts";
import {
  assertNonEmptyIdentifier,
  assertSchemaVersion,
  deepFreezeStructure,
} from "./manifest";

export const RUNTIME_GOVERNANCE_REPORT_SCHEMA_VERSION =
  "lingua-core-platform:runtime-governance-report@phase9";

export type RuntimeCapabilityGovernanceReportSchemaVersion =
  typeof RUNTIME_GOVERNANCE_REPORT_SCHEMA_VERSION;

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
  assertNonEmptyIdentifier(input.reportId, "reportId");

  assertSchemaVersion(
    input.introspectionEnvelope.schemaVersion,
    RUNTIME_INTROSPECTION_ENVELOPE_SCHEMA_VERSION,
    "introspectionEnvelope",
  );

  const reportStatus: RuntimeCapabilityGovernanceReportStatus =
    input.introspectionEnvelope.certificationSummary.globalStatus ===
    "certified"
      ? "passed"
      : "failed";

  return deepFreezeStructure({
    reportId: input.reportId,
    generatedFrom: GOVERNANCE_REPORT_GENERATED_FROM,
    schemaVersion: RUNTIME_GOVERNANCE_REPORT_SCHEMA_VERSION,
    evaluationTimestamp: null,
    introspectionEnvelope: input.introspectionEnvelope,
    reportStatus,
  });
}
