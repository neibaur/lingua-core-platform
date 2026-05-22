import { describe, expect, it } from "vitest";

import {
  buildRuntimeCapabilityCertificationSummary,
  certifyRuntimeCapabilityManifest,
  composeRuntimeCapabilityManifest,
} from ".";
import { stableJsonStringify } from "../query-snapshots";
import type {
  RuntimeCapabilityCertificationArtifact,
  RuntimeCapabilityCertificationResult,
  RuntimeCapabilityDeclaration,
  RuntimeCapabilityManifest,
} from "./contracts";

describe("runtime capability certification aggregation", () => {
  it("produces certified summaries for certified inputs", () => {
    const certification = certifyRuntimeCapabilityManifest({
      expectedManifest: createManifest("runtime:manifest:expected"),
      providedManifest: createManifest("runtime:manifest:provided"),
    });
    const summary = buildRuntimeCapabilityCertificationSummary({
      certifications: [certification],
    });

    expect(summary).toEqual({
      trackingId: "lingua-core-platform:runtime-certification-summary",
      totalCapabilitiesEvaluated: 1,
      globalStatus: "certified",
      aggregatedMismatches: [],
    });
    expect(Object.isFrozen(summary)).toBe(true);
    expect(Object.isFrozen(summary.aggregatedMismatches)).toBe(true);
  });

  it("produces rejected summaries for rejected inputs", () => {
    const certification = certifyRuntimeCapabilityManifest({
      expectedManifest: createManifest("runtime:manifest:expected"),
      providedManifest: composeRuntimeCapabilityManifest({
        metadata: createMetadata("runtime:manifest:provided"),
        capabilities: [
          createCapability("engine:tokenize:thai", "engine", "2.0.0"),
        ],
      }),
    });
    const summary = buildRuntimeCapabilityCertificationSummary({
      certifications: [certification],
    });

    expect(summary.globalStatus).toBe("rejected");
    expect(summary.totalCapabilitiesEvaluated).toBe(1);
    expect(summary.aggregatedMismatches.length).toBeGreaterThan(0);
  });

  it("maps validation failures as certification failures", () => {
    const certification = certifyRuntimeCapabilityManifest({
      expectedManifest: {
        schemaVersion: "runtime-capability-manifest-v0",
        metadata: createMetadata("runtime:manifest:expected"),
        capabilities: [],
      },
      providedManifest: createManifest("runtime:manifest:provided"),
    });
    const summary = buildRuntimeCapabilityCertificationSummary({
      certifications: [certification],
    });

    expect(summary.aggregatedMismatches).toEqual([
      {
        stageIndex: 0,
        objectPath: "$.expectedManifest.schemaVersion",
        diagnosticCode: "CERTIFICATION_FAILURE",
        message:
          "Runtime capability manifest schemaVersion must be runtime-capability-manifest-v1.",
      },
    ]);
  });

  it("maps compatibility failures as capability mismatches", () => {
    const certification = certifyRuntimeCapabilityManifest({
      expectedManifest: createManifest("runtime:manifest:expected"),
      providedManifest: composeRuntimeCapabilityManifest({
        metadata: createMetadata("runtime:manifest:provided"),
        capabilities: [
          createCapability("engine:tokenize:thai", "engine", "2.0.0"),
          createCapability(
            "query:parse:recursive_descent",
            "governance",
            "1.0.0",
          ),
        ],
      }),
    });
    const summary = buildRuntimeCapabilityCertificationSummary({
      certifications: [certification],
    });

    expect(
      summary.aggregatedMismatches.map((mismatch) => mismatch.diagnosticCode),
    ).toEqual([
      "CAPABILITY_MISMATCH",
      "CAPABILITY_MISMATCH",
      "CAPABILITY_MISMATCH",
    ]);
  });

  it("sorts mismatches by stage, object path, and diagnostic code", () => {
    const summary = buildRuntimeCapabilityCertificationSummary({
      certifications: [
        createCertificationArtifact([
          {
            stageIndex: 2,
            objectPath: "$.z",
            diagnosticCode: "CERTIFICATION_FAILURE",
            message: "z",
          },
          {
            stageIndex: 1,
            objectPath: "$.b",
            diagnosticCode: "CAPABILITY_MISMATCH",
            message: "b",
          },
        ]),
        createCertificationArtifact([
          {
            stageIndex: 1,
            objectPath: "$.a",
            diagnosticCode: "CERTIFICATION_FAILURE",
            message: "a",
          },
          {
            stageIndex: 1,
            objectPath: "$.a",
            diagnosticCode: "CAPABILITY_MISMATCH",
            message: "a",
          },
        ]),
      ],
    });

    expect(
      summary.aggregatedMismatches.map((mismatch) => [
        mismatch.stageIndex,
        mismatch.objectPath,
        mismatch.diagnosticCode,
      ]),
    ).toEqual([
      [1, "$.a", "CAPABILITY_MISMATCH"],
      [1, "$.a", "CERTIFICATION_FAILURE"],
      [1, "$.b", "CAPABILITY_MISMATCH"],
      [2, "$.z", "CERTIFICATION_FAILURE"],
    ]);
  });

  it("recursively freezes returned summary artifacts", () => {
    const summary = buildRuntimeCapabilityCertificationSummary({
      certifications: [
        createCertificationArtifact([
          {
            stageIndex: 0,
            objectPath: "$.manifest",
            diagnosticCode: "CERTIFICATION_FAILURE",
            message: "manifest invalid",
          },
        ]),
      ],
    });

    expect(Object.isFrozen(summary)).toBe(true);
    expect(Object.isFrozen(summary.aggregatedMismatches)).toBe(true);
    expect(Object.isFrozen(summary.aggregatedMismatches[0])).toBe(true);
  });

  it("preserves JSON roundtrip safety", () => {
    const summary = buildRuntimeCapabilityCertificationSummary({
      certifications: [createCertificationArtifact([])],
    });
    const roundTripped = JSON.parse(JSON.stringify(summary)) as typeof summary;

    expect(roundTripped).toEqual(summary);
    expect(stableJsonStringify(roundTripped)).toBe(
      stableJsonStringify(summary),
    );
  });

  it("keeps empty mismatch arrays immutable", () => {
    const summary = buildRuntimeCapabilityCertificationSummary({
      certifications: [],
    });

    expect(summary.globalStatus).toBe("certified");
    expect(summary.aggregatedMismatches).toEqual([]);
    expect(Object.isFrozen(summary.aggregatedMismatches)).toBe(true);
  });

  it("does not mutate input certification artifacts", () => {
    const certifications = [
      createCertificationArtifact([
        {
          stageIndex: 3,
          objectPath: "$.z",
          diagnosticCode: "CERTIFICATION_FAILURE",
          message: "z",
        },
        {
          stageIndex: 1,
          objectPath: "$.a",
          diagnosticCode: "CAPABILITY_MISMATCH",
          message: "a",
        },
      ]),
    ];
    const before = JSON.parse(
      JSON.stringify(certifications),
    ) as typeof certifications;

    buildRuntimeCapabilityCertificationSummary({ certifications });

    expect(certifications).toEqual(before);
  });

  it("produces stable replay ordering for equivalent inputs", () => {
    const first = buildRuntimeCapabilityCertificationSummary({
      certifications: [
        createCertificationArtifact([
          {
            stageIndex: 2,
            objectPath: "$.b",
            diagnosticCode: "CAPABILITY_MISMATCH",
            message: "b",
          },
          {
            stageIndex: 1,
            objectPath: "$.a",
            diagnosticCode: "CERTIFICATION_FAILURE",
            message: "a",
          },
        ]),
      ],
    });
    const second = buildRuntimeCapabilityCertificationSummary({
      certifications: [
        createCertificationArtifact([
          {
            stageIndex: 1,
            objectPath: "$.a",
            diagnosticCode: "CERTIFICATION_FAILURE",
            message: "a",
          },
          {
            stageIndex: 2,
            objectPath: "$.b",
            diagnosticCode: "CAPABILITY_MISMATCH",
            message: "b",
          },
        ]),
      ],
    });

    expect(first).toEqual(second);
    expect(stableJsonStringify(first)).toBe(stableJsonStringify(second));
  });
});

function createManifest(manifestId: string): RuntimeCapabilityManifest {
  return composeRuntimeCapabilityManifest({
    metadata: createMetadata(manifestId),
    capabilities: [
      createCapability("engine:tokenize:thai", "engine", "1.0.0"),
      createCapability("query:parse:recursive_descent", "query", "1.0.0"),
      createCapability("snapshot:replay:diff", "snapshot", "1.0.0"),
    ],
  });
}

function createMetadata(manifestId: string) {
  return {
    manifestId,
    runtimeName: "lingua-core-search-runtime",
    runtimeVersion: "1.0.0",
    manifestVersion: "1.0.0",
  };
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

function createCertificationArtifact(
  structuralMismatches: RuntimeCapabilityCertificationArtifact["structuralMismatches"],
): RuntimeCapabilityCertificationResult {
  return {
    status: structuralMismatches.length === 0 ? "certified" : "rejected",
    platformBaseline: "lingua-core-platform@phase9",
    structuralMismatches,
  };
}
