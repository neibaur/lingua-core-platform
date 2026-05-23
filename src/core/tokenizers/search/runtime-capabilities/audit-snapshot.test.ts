import { describe, expect, it } from "vitest";

import {
  buildRuntimeCapabilityCertificationSummary,
  buildRuntimeCapabilityIntrospectionEnvelope,
  certifyRuntimeCapabilityManifest,
  composeRuntimeCapabilityCertificationAuditSnapshot,
  composeRuntimeCapabilityGovernanceReport,
  composeRuntimeCapabilityManifest,
} from ".";
import { stableJsonStringify } from "../query-snapshots";
import type {
  RuntimeCapabilityCertificationArtifact,
  RuntimeCapabilityDeclaration,
  RuntimeCapabilityManifest,
} from "./contracts";
import type { RuntimeCapabilityGovernanceReport } from "./governance-report";

describe("runtime capability certification audit snapshots", () => {
  it("preserves caller-supplied snapshotId", () => {
    const snapshot = composeRuntimeCapabilityCertificationAuditSnapshot({
      snapshotId: "audit:snapshot:caller-supplied-id",
      governanceReport: buildPassedGovernanceReport(),
    });

    expect(snapshot.snapshotId).toBe("audit:snapshot:caller-supplied-id");
  });

  it("uses fixed replay-safe literals for generatedFrom, schemaVersion, and null evaluationTimestamp", () => {
    const snapshot = composeRuntimeCapabilityCertificationAuditSnapshot({
      snapshotId: "audit:snapshot:literals",
      governanceReport: buildPassedGovernanceReport(),
    });

    expect(snapshot.generatedFrom).toBe(
      "runtime-capability-certification-audit-snapshot",
    );
    expect(snapshot.schemaVersion).toBe(
      "lingua-core-platform:runtime-certification-audit-snapshot@phase9",
    );
    expect(snapshot.evaluationTimestamp).toBeNull();
  });

  it("derives auditStatus passed from governanceReport.reportStatus passed", () => {
    const report = buildPassedGovernanceReport();

    expect(report.reportStatus).toBe("passed");

    const snapshot = composeRuntimeCapabilityCertificationAuditSnapshot({
      snapshotId: "audit:snapshot:passed",
      governanceReport: report,
    });

    expect(snapshot.auditStatus).toBe("passed");
  });

  it("derives auditStatus failed from governanceReport.reportStatus failed", () => {
    const report = buildFailedGovernanceReport();

    expect(report.reportStatus).toBe("failed");

    const snapshot = composeRuntimeCapabilityCertificationAuditSnapshot({
      snapshotId: "audit:snapshot:failed",
      governanceReport: report,
    });

    expect(snapshot.auditStatus).toBe("failed");
  });

  it("preserves the embedded governance report structurally", () => {
    const report = buildPassedGovernanceReport();
    const snapshot = composeRuntimeCapabilityCertificationAuditSnapshot({
      snapshotId: "audit:snapshot:report-preservation",
      governanceReport: report,
    });

    expect(snapshot.governanceReport).toEqual(report);
  });

  it("returns a recursively immutable artifact", () => {
    const report = buildFailedGovernanceReport();
    const snapshot = composeRuntimeCapabilityCertificationAuditSnapshot({
      snapshotId: "audit:snapshot:immutability",
      governanceReport: report,
    });

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.governanceReport)).toBe(true);
    expect(
      Object.isFrozen(snapshot.governanceReport.introspectionEnvelope),
    ).toBe(true);
    expect(
      Object.isFrozen(
        snapshot.governanceReport.introspectionEnvelope.certifications,
      ),
    ).toBe(true);
    expect(
      Object.isFrozen(
        snapshot.governanceReport.introspectionEnvelope.certificationSummary,
      ),
    ).toBe(true);
  });

  it("is JSON roundtrip-safe", () => {
    const report = buildPassedGovernanceReport();
    const snapshot = composeRuntimeCapabilityCertificationAuditSnapshot({
      snapshotId: "audit:snapshot:roundtrip",
      governanceReport: report,
    });
    const roundTripped = JSON.parse(
      JSON.stringify(snapshot),
    ) as typeof snapshot;

    expect(roundTripped).toEqual(snapshot);
    expect(stableJsonStringify(roundTripped)).toBe(
      stableJsonStringify(snapshot),
    );
  });

  it("produces structurally equivalent output for repeated composition with identical input", () => {
    const report = buildPassedGovernanceReport();
    const input = {
      snapshotId: "audit:snapshot:repeatable",
      governanceReport: report,
    };

    expect(composeRuntimeCapabilityCertificationAuditSnapshot(input)).toEqual(
      composeRuntimeCapabilityCertificationAuditSnapshot(input),
    );
  });

  it("introduces no generated IDs, timestamps, randomness, or async behavior", () => {
    const reportA = buildPassedGovernanceReport();
    const reportB = buildPassedGovernanceReport();

    const snapshotA = composeRuntimeCapabilityCertificationAuditSnapshot({
      snapshotId: "audit:snapshot:determinism",
      governanceReport: reportA,
    });
    const snapshotB = composeRuntimeCapabilityCertificationAuditSnapshot({
      snapshotId: "audit:snapshot:determinism",
      governanceReport: reportB,
    });

    expect(snapshotA.evaluationTimestamp).toBeNull();
    expect(snapshotB.evaluationTimestamp).toBeNull();
    expect(stableJsonStringify(snapshotA)).toBe(stableJsonStringify(snapshotB));
  });
});

function buildPassedGovernanceReport(): RuntimeCapabilityGovernanceReport {
  const manifest = createManifest("runtime:manifest:baseline");
  const certification = certifyRuntimeCapabilityManifest({
    expectedManifest: manifest,
    providedManifest: manifest,
  });
  const summary = buildRuntimeCapabilityCertificationSummary({
    certifications: [certification],
  });
  const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
    trackingId: "runtime:introspection:certified-fixture",
    manifests: [manifest],
    certifications: [certification],
    certificationSummary: summary,
  });

  return composeRuntimeCapabilityGovernanceReport({
    reportId: "governance:report:certified",
    introspectionEnvelope: envelope,
  });
}

function buildFailedGovernanceReport(): RuntimeCapabilityGovernanceReport {
  const certifications: RuntimeCapabilityCertificationArtifact[] = [
    {
      status: "rejected",
      platformBaseline: "lingua-core-platform@phase9",
      structuralMismatches: [
        {
          stageIndex: 1,
          objectPath: "$.capabilities[0].version",
          diagnosticCode: "CAPABILITY_MISMATCH",
          message: "version mismatch",
        },
      ],
    },
  ];
  const summary = buildRuntimeCapabilityCertificationSummary({
    certifications,
  });
  const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
    trackingId: "runtime:introspection:rejected-fixture",
    manifests: [],
    certifications,
    certificationSummary: summary,
  });

  return composeRuntimeCapabilityGovernanceReport({
    reportId: "governance:report:rejected",
    introspectionEnvelope: envelope,
  });
}

function createManifest(manifestId: string): RuntimeCapabilityManifest {
  return composeRuntimeCapabilityManifest({
    metadata: {
      manifestId,
      runtimeName: "lingua-core-search-runtime",
      runtimeVersion: "1.0.0",
      manifestVersion: "1.0.0",
    },
    capabilities: [
      createCapability("engine:tokenize:thai", "engine", "1.0.0"),
      createCapability("query:parse:recursive_descent", "query", "1.0.0"),
    ],
  });
}

function createCapability(
  capabilityId: RuntimeCapabilityDeclaration["capabilityId"],
  kind: RuntimeCapabilityDeclaration["kind"],
  version: string,
): RuntimeCapabilityDeclaration {
  return { capabilityId, kind, version, stability: "stable" };
}
