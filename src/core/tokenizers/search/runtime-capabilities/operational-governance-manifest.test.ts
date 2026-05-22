import { describe, expect, it } from "vitest";

import {
  buildRuntimeCapabilityCertificationSummary,
  buildRuntimeCapabilityIntrospectionEnvelope,
  certifyRuntimeCapabilityManifest,
  composeRuntimeCapabilityCertificationAuditSnapshot,
  composeRuntimeCapabilityGovernanceReport,
  composeRuntimeCapabilityManifest,
  composeRuntimeOperationalGovernanceManifest,
} from ".";
import { stableJsonStringify } from "../query-snapshots";
import type {
  RuntimeCapabilityCertificationArtifact,
  RuntimeCapabilityDeclaration,
  RuntimeCapabilityManifest,
} from "./contracts";
import type { RuntimeCapabilityCertificationAuditSnapshot } from "./audit-snapshot";

describe("runtime operational governance manifests", () => {
  it("preserves caller-supplied manifestId", () => {
    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:caller-supplied-id",
      auditSnapshots: [buildPassedSnapshot("audit:snapshot:a")],
    });

    expect(manifest.manifestId).toBe("operational:manifest:caller-supplied-id");
  });

  it("uses fixed replay-safe literals for generatedFrom and schemaVersion", () => {
    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:literals",
      auditSnapshots: [],
    });

    expect(manifest.generatedFrom).toBe(
      "runtime-operational-governance-manifest",
    );
    expect(manifest.schemaVersion).toBe(
      "lingua-core-platform:runtime-operational-governance-manifest@phase9",
    );
  });

  it("sets evaluationTimestamp to null", () => {
    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:timestamp",
      auditSnapshots: [],
    });

    expect(manifest.evaluationTimestamp).toBeNull();
  });

  it("sorts audit snapshots deterministically by snapshotId", () => {
    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:sort",
      auditSnapshots: [
        buildPassedSnapshot("audit:snapshot:c"),
        buildPassedSnapshot("audit:snapshot:a"),
        buildPassedSnapshot("audit:snapshot:b"),
      ],
    });

    expect(manifest.auditSnapshots.map((s) => s.snapshotId)).toEqual([
      "audit:snapshot:a",
      "audit:snapshot:b",
      "audit:snapshot:c",
    ]);
  });

  it("produces governanceStatus passed when all snapshots pass", () => {
    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:all-passed",
      auditSnapshots: [
        buildPassedSnapshot("audit:snapshot:a"),
        buildPassedSnapshot("audit:snapshot:b"),
      ],
    });

    expect(manifest.governanceStatus).toBe("passed");
  });

  it("produces governanceStatus passed for empty auditSnapshots", () => {
    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:empty",
      auditSnapshots: [],
    });

    expect(manifest.governanceStatus).toBe("passed");
  });

  it("produces governanceStatus failed when any snapshot fails", () => {
    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:any-failed",
      auditSnapshots: [
        buildPassedSnapshot("audit:snapshot:a"),
        buildFailedSnapshot("audit:snapshot:b"),
        buildPassedSnapshot("audit:snapshot:c"),
      ],
    });

    expect(manifest.governanceStatus).toBe("failed");
  });

  it("produces governanceStatus failed when all snapshots fail", () => {
    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:all-failed",
      auditSnapshots: [
        buildFailedSnapshot("audit:snapshot:a"),
        buildFailedSnapshot("audit:snapshot:b"),
      ],
    });

    expect(manifest.governanceStatus).toBe("failed");
  });

  it("preserves embedded audit snapshot structures", () => {
    const snapshotA = buildPassedSnapshot("audit:snapshot:a");
    const snapshotB = buildFailedSnapshot("audit:snapshot:b");

    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:preservation",
      auditSnapshots: [snapshotA, snapshotB],
    });

    expect(manifest.auditSnapshots[0]).toEqual(snapshotA);
    expect(manifest.auditSnapshots[1]).toEqual(snapshotB);
  });

  it("returns a recursively immutable artifact", () => {
    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:immutability",
      auditSnapshots: [
        buildPassedSnapshot("audit:snapshot:a"),
        buildFailedSnapshot("audit:snapshot:b"),
      ],
    });

    expect(Object.isFrozen(manifest)).toBe(true);
    expect(Object.isFrozen(manifest.auditSnapshots)).toBe(true);
    expect(Object.isFrozen(manifest.auditSnapshots[0])).toBe(true);
    expect(Object.isFrozen(manifest.auditSnapshots[0]?.governanceReport)).toBe(
      true,
    );
    expect(
      Object.isFrozen(
        manifest.auditSnapshots[0]?.governanceReport.introspectionEnvelope,
      ),
    ).toBe(true);
  });

  it("is JSON roundtrip-safe", () => {
    const manifest = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:roundtrip",
      auditSnapshots: [
        buildPassedSnapshot("audit:snapshot:a"),
        buildFailedSnapshot("audit:snapshot:b"),
      ],
    });
    const roundTripped = JSON.parse(
      JSON.stringify(manifest),
    ) as typeof manifest;

    expect(roundTripped).toEqual(manifest);
    expect(stableJsonStringify(roundTripped)).toBe(
      stableJsonStringify(manifest),
    );
  });

  it("produces structurally equivalent output for repeated composition with identical input", () => {
    const input = {
      manifestId: "operational:manifest:repeatable",
      auditSnapshots: [
        buildPassedSnapshot("audit:snapshot:b"),
        buildPassedSnapshot("audit:snapshot:a"),
      ],
    };

    expect(composeRuntimeOperationalGovernanceManifest(input)).toEqual(
      composeRuntimeOperationalGovernanceManifest(input),
    );
  });

  it("produces identical output regardless of input insertion order", () => {
    const snapshotA = buildPassedSnapshot("audit:snapshot:a");
    const snapshotB = buildFailedSnapshot("audit:snapshot:b");
    const snapshotC = buildPassedSnapshot("audit:snapshot:c");

    const manifestForward = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:order",
      auditSnapshots: [snapshotA, snapshotB, snapshotC],
    });
    const manifestReversed = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:order",
      auditSnapshots: [snapshotC, snapshotB, snapshotA],
    });

    expect(stableJsonStringify(manifestForward)).toBe(
      stableJsonStringify(manifestReversed),
    );
  });

  it("introduces no generated IDs, timestamps, randomness, or async behavior", () => {
    const manifestA = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:determinism",
      auditSnapshots: [buildPassedSnapshot("audit:snapshot:a")],
    });
    const manifestB = composeRuntimeOperationalGovernanceManifest({
      manifestId: "operational:manifest:determinism",
      auditSnapshots: [buildPassedSnapshot("audit:snapshot:a")],
    });

    expect(manifestA.evaluationTimestamp).toBeNull();
    expect(manifestB.evaluationTimestamp).toBeNull();
    expect(stableJsonStringify(manifestA)).toBe(stableJsonStringify(manifestB));
  });
});

function buildPassedSnapshot(
  snapshotId: string,
): RuntimeCapabilityCertificationAuditSnapshot {
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
  const report = composeRuntimeCapabilityGovernanceReport({
    reportId: "governance:report:certified",
    introspectionEnvelope: envelope,
  });

  return composeRuntimeCapabilityCertificationAuditSnapshot({
    snapshotId,
    governanceReport: report,
  });
}

function buildFailedSnapshot(
  snapshotId: string,
): RuntimeCapabilityCertificationAuditSnapshot {
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

  return composeRuntimeCapabilityCertificationAuditSnapshot({
    snapshotId,
    governanceReport: report,
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
