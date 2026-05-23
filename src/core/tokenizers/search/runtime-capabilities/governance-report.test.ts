import { describe, expect, it } from "vitest";

import {
  buildRuntimeCapabilityCertificationSummary,
  buildRuntimeCapabilityIntrospectionEnvelope,
  certifyRuntimeCapabilityManifest,
  composeRuntimeCapabilityGovernanceReport,
  composeRuntimeCapabilityManifest,
} from ".";
import { stableJsonStringify } from "../query-snapshots";
import type {
  RuntimeCapabilityCertificationArtifact,
  RuntimeCapabilityDeclaration,
  RuntimeCapabilityIntrospectionEnvelope,
  RuntimeCapabilityManifest,
} from "./contracts";

describe("runtime capability governance reports", () => {
  it("preserves caller-supplied reportId", () => {
    const report = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:caller-supplied-id",
      introspectionEnvelope: buildCertifiedEnvelope(),
    });

    expect(report.reportId).toBe("governance:report:caller-supplied-id");
  });

  it("uses hardcoded generatedFrom, schemaVersion, and null evaluationTimestamp", () => {
    const report = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:literals",
      introspectionEnvelope: buildCertifiedEnvelope(),
    });

    expect(report.generatedFrom).toBe("runtime-capability-governance-report");
    expect(report.schemaVersion).toBe(
      "lingua-core-platform:runtime-governance-report@phase9",
    );
    expect(report.evaluationTimestamp).toBeNull();
  });

  it("sets reportStatus to passed when envelope is globally certified", () => {
    const envelope = buildCertifiedEnvelope();

    expect(envelope.certificationSummary.globalStatus).toBe("certified");

    const report = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:certified",
      introspectionEnvelope: envelope,
    });

    expect(report.reportStatus).toBe("passed");
  });

  it("sets reportStatus to failed when envelope is not globally certified", () => {
    const envelope = buildRejectedEnvelope();

    expect(envelope.certificationSummary.globalStatus).toBe("rejected");

    const report = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:rejected",
      introspectionEnvelope: envelope,
    });

    expect(report.reportStatus).toBe("failed");
  });

  it("preserves the embedded introspection envelope structurally", () => {
    const envelope = buildCertifiedEnvelope();
    const report = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:envelope-preservation",
      introspectionEnvelope: envelope,
    });

    expect(report.introspectionEnvelope).toEqual(envelope);
  });

  it("returns a recursively immutable artifact", () => {
    const envelope = buildRejectedEnvelope();
    const report = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:immutability",
      introspectionEnvelope: envelope,
    });

    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.introspectionEnvelope)).toBe(true);
    expect(Object.isFrozen(report.introspectionEnvelope.manifests)).toBe(true);
    expect(Object.isFrozen(report.introspectionEnvelope.certifications)).toBe(
      true,
    );
    expect(
      Object.isFrozen(report.introspectionEnvelope.certificationSummary),
    ).toBe(true);
    expect(
      Object.isFrozen(
        report.introspectionEnvelope.certificationSummary.aggregatedMismatches,
      ),
    ).toBe(true);
  });

  it("is JSON roundtrip-safe", () => {
    const envelope = buildCertifiedEnvelope();
    const report = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:roundtrip",
      introspectionEnvelope: envelope,
    });
    const roundTripped = JSON.parse(JSON.stringify(report)) as typeof report;

    expect(roundTripped).toEqual(report);
    expect(stableJsonStringify(roundTripped)).toBe(stableJsonStringify(report));
  });

  it("produces structurally equivalent output for repeated composition with identical input", () => {
    const envelope = buildCertifiedEnvelope();
    const input = {
      reportId: "governance:report:repeatable",
      introspectionEnvelope: envelope,
    };

    expect(composeRuntimeCapabilityGovernanceReport(input)).toEqual(
      composeRuntimeCapabilityGovernanceReport(input),
    );
  });

  it("produces canonically stable serialization regardless of composition order", () => {
    const certifiedEnvelope = buildCertifiedEnvelope();
    const rejectedEnvelope = buildRejectedEnvelope();

    const reportA = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:order-a",
      introspectionEnvelope: certifiedEnvelope,
    });
    const reportB = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:order-a",
      introspectionEnvelope: certifiedEnvelope,
    });

    expect(stableJsonStringify(reportA)).toBe(stableJsonStringify(reportB));

    const rejectedA = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:order-b",
      introspectionEnvelope: rejectedEnvelope,
    });
    const rejectedB = composeRuntimeCapabilityGovernanceReport({
      reportId: "governance:report:order-b",
      introspectionEnvelope: rejectedEnvelope,
    });

    expect(stableJsonStringify(rejectedA)).toBe(stableJsonStringify(rejectedB));
  });
});

function buildCertifiedEnvelope(): RuntimeCapabilityIntrospectionEnvelope {
  const manifest = createManifest("runtime:manifest:baseline");
  const certification = certifyRuntimeCapabilityManifest({
    expectedManifest: manifest,
    providedManifest: manifest,
  });
  const summary = buildRuntimeCapabilityCertificationSummary({
    certifications: [certification],
  });

  return buildRuntimeCapabilityIntrospectionEnvelope({
    trackingId: "runtime:introspection:certified-fixture",
    manifests: [manifest],
    certifications: [certification],
    certificationSummary: summary,
  });
}

function buildRejectedEnvelope(): RuntimeCapabilityIntrospectionEnvelope {
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

  return buildRuntimeCapabilityIntrospectionEnvelope({
    trackingId: "runtime:introspection:rejected-fixture",
    manifests: [],
    certifications,
    certificationSummary: summary,
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
  return {
    capabilityId,
    kind,
    version,
    stability: "stable",
  };
}
