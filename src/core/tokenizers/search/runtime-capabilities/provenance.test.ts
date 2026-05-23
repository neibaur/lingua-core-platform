import { describe, expect, it } from "vitest";

import {
  buildRuntimeCapabilityCertificationSummary,
  buildRuntimeCapabilityIntrospectionEnvelope,
  composeRuntimeCapabilityCertificationAuditSnapshot,
  composeRuntimeCapabilityGovernanceReport,
  composeRuntimeGovernanceProvenance,
  composeRuntimeOperationalGovernanceManifest,
  RUNTIME_OPERATIONAL_GOVERNANCE_MANIFEST_SCHEMA_VERSION,
} from ".";
import { stableJsonStringify } from "../query-snapshots";
import type { RuntimeCapabilityCertificationArtifact } from "./contracts";
import type { RuntimeOperationalGovernanceManifest } from "./operational-governance-manifest";

describe("runtime governance provenance", () => {
  it("preserves caller-supplied provenanceId", () => {
    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:caller-supplied-id",
      operationalManifest: buildPassedManifest(),
    });

    expect(provenance.provenanceId).toBe("provenance:caller-supplied-id");
  });

  it("uses fixed replay-safe generatedFrom literal", () => {
    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:literals",
      operationalManifest: buildPassedManifest(),
    });

    expect(provenance.generatedFrom).toBe("runtime-governance-provenance");
  });

  it("uses the Phase 9 aligned schemaVersion literal", () => {
    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:schema-version",
      operationalManifest: buildPassedManifest(),
    });

    expect(provenance.schemaVersion).toBe(
      "lingua-core-platform:runtime-governance-provenance@phase9",
    );
  });

  it("sets evaluationTimestamp to null", () => {
    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:timestamp",
      operationalManifest: buildPassedManifest(),
    });

    expect(provenance.evaluationTimestamp).toBeNull();
  });

  it("derives attestationStatus passed from operationalManifest.governanceStatus passed", () => {
    const manifest = buildPassedManifest();

    expect(manifest.governanceStatus).toBe("passed");

    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:attestation-passed",
      operationalManifest: manifest,
    });

    expect(provenance.attestationStatus).toBe("passed");
  });

  it("derives attestationStatus failed from operationalManifest.governanceStatus failed", () => {
    const manifest = buildFailedManifest();

    expect(manifest.governanceStatus).toBe("failed");

    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:attestation-failed",
      operationalManifest: manifest,
    });

    expect(provenance.attestationStatus).toBe("failed");
  });

  it("derives attestationStatus only from root governanceStatus, not sub-structures", () => {
    const passedManifest = buildPassedManifest();
    const failedManifest = buildFailedManifest();

    const passedProvenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:boundary-passed",
      operationalManifest: passedManifest,
    });
    const failedProvenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:boundary-failed",
      operationalManifest: failedManifest,
    });

    expect(passedProvenance.attestationStatus).toBe(
      passedManifest.governanceStatus,
    );
    expect(failedProvenance.attestationStatus).toBe(
      failedManifest.governanceStatus,
    );
  });

  it("derives attestationStatus passed from vacuous-pass manifest without re-evaluating audit snapshots", () => {
    const emptyManifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:vacuous-pass",
      auditSnapshots: [],
    });

    expect(emptyManifest.auditSnapshots).toHaveLength(0);
    expect(emptyManifest.governanceStatus).toBe("passed");

    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:vacuous-pass-derivation",
      operationalManifest: emptyManifest,
    });

    expect(provenance.attestationStatus).toBe("passed");
  });

  it("preserves the embedded operational manifest structurally", () => {
    const manifest = buildPassedManifest();
    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:manifest-preservation",
      operationalManifest: manifest,
    });

    expect(provenance.operationalManifest).toEqual(manifest);
  });

  it("returns a recursively immutable artifact", () => {
    const manifest = buildFailedManifest();
    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:immutability",
      operationalManifest: manifest,
    });

    expect(Object.isFrozen(provenance)).toBe(true);
    expect(Object.isFrozen(provenance.operationalManifest)).toBe(true);
    expect(Object.isFrozen(provenance.operationalManifest.auditSnapshots)).toBe(
      true,
    );
  });

  it("is JSON roundtrip-safe", () => {
    const manifest = buildPassedManifest();
    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:roundtrip",
      operationalManifest: manifest,
    });
    const roundTripped = JSON.parse(
      JSON.stringify(provenance),
    ) as typeof provenance;

    expect(roundTripped).toEqual(provenance);
    expect(stableJsonStringify(roundTripped)).toBe(
      stableJsonStringify(provenance),
    );
  });

  it("produces structurally equivalent output for repeated composition with identical input", () => {
    const manifest = buildPassedManifest();
    const input = {
      provenanceId: "provenance:repeatable",
      operationalManifest: manifest,
    };

    expect(composeRuntimeGovernanceProvenance(input)).toEqual(
      composeRuntimeGovernanceProvenance(input),
    );
  });

  it("introduces no generated IDs, timestamps, randomness, or async behavior", () => {
    const manifestA = buildPassedManifest();
    const manifestB = buildPassedManifest();

    const provenanceA = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:determinism",
      operationalManifest: manifestA,
    });
    const provenanceB = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:determinism",
      operationalManifest: manifestB,
    });

    expect(provenanceA.evaluationTimestamp).toBeNull();
    expect(provenanceB.evaluationTimestamp).toBeNull();
    expect(stableJsonStringify(provenanceA)).toBe(
      stableJsonStringify(provenanceB),
    );
  });

  it("throws on empty provenanceId", () => {
    expect(() =>
      composeRuntimeGovernanceProvenance({
        provenanceId: "",
        operationalManifest: buildPassedManifest(),
      }),
    ).toThrow("[governance invariant]");
  });

  it("throws on whitespace-only provenanceId", () => {
    expect(() =>
      composeRuntimeGovernanceProvenance({
        provenanceId: "   ",
        operationalManifest: buildPassedManifest(),
      }),
    ).toThrow("[governance invariant]");
  });

  it("throws when operationalManifest carries a wrong schemaVersion", () => {
    const manifest = buildPassedManifest();
    const driftedManifest = {
      ...manifest,
      schemaVersion: "wrong@version",
    } as unknown as typeof manifest;

    expect(() =>
      composeRuntimeGovernanceProvenance({
        provenanceId: "provenance:schema-drift",
        operationalManifest: driftedManifest,
      }),
    ).toThrow(
      `[governance invariant] operationalManifest schemaVersion must be ${RUNTIME_OPERATIONAL_GOVERNANCE_MANIFEST_SCHEMA_VERSION}`,
    );
  });

  it("result contains only JSON-serialization-safe field types", () => {
    const provenance = composeRuntimeGovernanceProvenance({
      provenanceId: "provenance:serializable",
      operationalManifest: buildPassedManifest(),
    });

    for (const [key, value] of Object.entries(provenance)) {
      const t = typeof value;
      expect(
        t === "string" ||
          t === "number" ||
          t === "boolean" ||
          value === null ||
          t === "object",
        `field '${key}' has non-serializable type '${t}'`,
      ).toBe(true);
    }
  });
});

function buildPassedManifest(): RuntimeOperationalGovernanceManifest {
  return composeRuntimeOperationalGovernanceManifest({
    manifestId: "operational:manifest:passed-fixture",
    auditSnapshots: [],
  });
}

function buildFailedManifest(): RuntimeOperationalGovernanceManifest {
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
  const report = composeRuntimeCapabilityGovernanceReport({
    reportId: "governance:report:rejected",
    introspectionEnvelope: envelope,
  });
  const snapshot = composeRuntimeCapabilityCertificationAuditSnapshot({
    snapshotId: "audit:snapshot:failed",
    governanceReport: report,
  });

  return composeRuntimeOperationalGovernanceManifest({
    manifestId: "operational:manifest:failed-fixture",
    auditSnapshots: [snapshot],
  });
}
