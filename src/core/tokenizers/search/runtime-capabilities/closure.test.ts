import { describe, expect, it } from "vitest";

import {
  buildRuntimeCapabilityCertificationSummary,
  buildRuntimeCapabilityIntrospectionEnvelope,
  composeRuntimeCapabilityCertificationAuditSnapshot,
  composeRuntimeCapabilityGovernanceReport,
  composeRuntimeGovernanceClosure,
  composeRuntimeGovernanceProvenance,
  composeRuntimeOperationalGovernanceManifest,
} from ".";
import { stableJsonStringify } from "../query-snapshots";
import type { RuntimeCapabilityCertificationArtifact } from "./contracts";
import type { RuntimeGovernanceProvenance } from "./provenance";

describe("runtime governance closure", () => {
  it("preserves caller-supplied closureId", () => {
    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:caller-supplied-id",
      provenance: buildPassedProvenance(),
    });

    expect(closure.closureId).toBe("closure:caller-supplied-id");
  });

  it("uses fixed replay-safe literals for generatedFrom, schemaVersion, and evaluationTimestamp", () => {
    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:literals",
      provenance: buildPassedProvenance(),
    });

    expect(closure.generatedFrom).toBe("runtime-governance-closure");
    expect(closure.schemaVersion).toBe(
      "lingua-core-platform:runtime-governance-closure@phase9",
    );
    expect(closure.evaluationTimestamp).toBeNull();
  });

  it("sets evaluationTimestamp to null", () => {
    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:timestamp",
      provenance: buildPassedProvenance(),
    });

    expect(closure.evaluationTimestamp).toBeNull();
  });

  it("derives closureStatus passed from provenance.attestationStatus passed", () => {
    const provenance = buildPassedProvenance();

    expect(provenance.attestationStatus).toBe("passed");

    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:status-passed",
      provenance,
    });

    expect(closure.closureStatus).toBe("passed");
  });

  it("derives closureStatus failed from provenance.attestationStatus failed", () => {
    const provenance = buildFailedProvenance();

    expect(provenance.attestationStatus).toBe("failed");

    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:status-failed",
      provenance,
    });

    expect(closure.closureStatus).toBe("failed");
  });

  it("preserves the embedded provenance structure", () => {
    const provenance = buildPassedProvenance();
    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:provenance-preservation",
      provenance,
    });

    expect(closure.provenance).toEqual(provenance);
  });

  it("returns a recursively immutable artifact", () => {
    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:immutability",
      provenance: buildFailedProvenance(),
    });

    expect(Object.isFrozen(closure)).toBe(true);
    expect(Object.isFrozen(closure.provenance)).toBe(true);
    expect(Object.isFrozen(closure.provenance.operationalManifest)).toBe(true);
    expect(
      Object.isFrozen(closure.provenance.operationalManifest.auditSnapshots),
    ).toBe(true);
  });

  it("is JSON roundtrip-safe", () => {
    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:roundtrip",
      provenance: buildPassedProvenance(),
    });
    const roundTripped = JSON.parse(JSON.stringify(closure)) as typeof closure;

    expect(roundTripped).toEqual(closure);
    expect(stableJsonStringify(roundTripped)).toBe(
      stableJsonStringify(closure),
    );
  });

  it("produces structurally equivalent output for repeated composition with identical input", () => {
    const provenance = buildPassedProvenance();
    const input = { closureId: "closure:repeatable", provenance };

    expect(composeRuntimeGovernanceClosure(input)).toEqual(
      composeRuntimeGovernanceClosure(input),
    );
  });

  it("produces canonically stable serialization regardless of composition order", () => {
    const provenanceA = buildPassedProvenance();
    const provenanceB = buildPassedProvenance();

    const closureA = composeRuntimeGovernanceClosure({
      closureId: "closure:order",
      provenance: provenanceA,
    });
    const closureB = composeRuntimeGovernanceClosure({
      closureId: "closure:order",
      provenance: provenanceB,
    });

    expect(stableJsonStringify(closureA)).toBe(stableJsonStringify(closureB));
  });

  it("introduces no timestamps, randomness, UUIDs, or async behavior", () => {
    const provenanceA = buildPassedProvenance();
    const provenanceB = buildPassedProvenance();

    const closureA = composeRuntimeGovernanceClosure({
      closureId: "closure:determinism",
      provenance: provenanceA,
    });
    const closureB = composeRuntimeGovernanceClosure({
      closureId: "closure:determinism",
      provenance: provenanceB,
    });

    expect(closureA.evaluationTimestamp).toBeNull();
    expect(closureB.evaluationTimestamp).toBeNull();
    expect(stableJsonStringify(closureA)).toBe(stableJsonStringify(closureB));
  });

  it("deep freeze enforcement prevents mutation of top-level artifact", () => {
    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:freeze-top",
      provenance: buildPassedProvenance(),
    });

    expect(() => {
      (closure as unknown as Record<string, unknown>)["closureStatus"] =
        "passed";
    }).toThrow();
  });

  it("deep freeze enforcement prevents mutation of embedded provenance", () => {
    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:freeze-nested",
      provenance: buildPassedProvenance(),
    });

    expect(() => {
      (closure.provenance as unknown as Record<string, unknown>)[
        "attestationStatus"
      ] = "failed";
    }).toThrow();
  });

  it("closureStatus derives only from provenance.attestationStatus, not lower layers", () => {
    const passedProvenance = buildPassedProvenance();
    const failedProvenance = buildFailedProvenance();

    const passedClosure = composeRuntimeGovernanceClosure({
      closureId: "closure:layer-boundary",
      provenance: passedProvenance,
    });
    const failedClosure = composeRuntimeGovernanceClosure({
      closureId: "closure:layer-boundary",
      provenance: failedProvenance,
    });

    expect(passedClosure.closureStatus).toBe(
      passedProvenance.attestationStatus,
    );
    expect(failedClosure.closureStatus).toBe(
      failedProvenance.attestationStatus,
    );
  });

  it("does not traverse lower governance layers — closureStatus equals provenance.attestationStatus exactly", () => {
    const provenance = buildPassedProvenance();
    const closure = composeRuntimeGovernanceClosure({
      closureId: "closure:no-traversal",
      provenance,
    });

    expect(closure.closureStatus).toBe(provenance.attestationStatus);
    expect(closure.provenance.operationalManifest.governanceStatus).toBe(
      provenance.attestationStatus,
    );
  });
});

function buildPassedProvenance(): RuntimeGovernanceProvenance {
  const manifest = composeRuntimeOperationalGovernanceManifest({
    manifestId: "operational:manifest:passed-fixture",
    auditSnapshots: [],
  });

  return composeRuntimeGovernanceProvenance({
    provenanceId: "provenance:passed-fixture",
    operationalManifest: manifest,
  });
}

function buildFailedProvenance(): RuntimeGovernanceProvenance {
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
  const manifest = composeRuntimeOperationalGovernanceManifest({
    manifestId: "operational:manifest:failed-fixture",
    auditSnapshots: [snapshot],
  });

  return composeRuntimeGovernanceProvenance({
    provenanceId: "provenance:failed-fixture",
    operationalManifest: manifest,
  });
}
