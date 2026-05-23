import { describe, expect, it } from "vitest";

import {
  buildRuntimeCapabilityCertificationSummary,
  buildRuntimeCapabilityIntrospectionEnvelope,
  certifyRuntimeCapabilityManifest,
  composeRuntimeCapabilityManifest,
  orderRuntimeCapabilityCertifications,
  orderRuntimeCapabilityManifests,
  RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
} from ".";
import { stableJsonStringify } from "../query-snapshots";
import type {
  RuntimeCapabilityCertificationArtifact,
  RuntimeCapabilityDeclaration,
  RuntimeCapabilityManifest,
} from "./contracts";

describe("runtime capability introspection envelopes", () => {
  it("composes deterministic introspection envelopes", () => {
    const manifests = [
      createManifest("runtime:manifest:z"),
      createManifest("runtime:manifest:a"),
    ];
    const certifications = [
      createCertificationArtifact("rejected", [
        {
          stageIndex: 2,
          objectPath: "$.z",
          diagnosticCode: "CERTIFICATION_FAILURE",
          message: "z",
        },
      ]),
      createCertificationArtifact("certified", []),
    ];
    const certificationSummary = buildRuntimeCapabilityCertificationSummary({
      certifications,
    });
    const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:static-fixture",
      manifests,
      certifications,
      certificationSummary,
    });

    expect(envelope).toMatchObject({
      trackingId: "runtime:introspection:static-fixture",
      schemaVersion:
        "lingua-core-platform:runtime-introspection-envelope@phase9",
      generatedFrom: "runtime-capability-introspection",
      manifestCount: 2,
      certificationCount: 2,
      globalStatus: "rejected",
    });
    expect(
      envelope.manifests.map((manifest) => manifest.metadata.manifestId),
    ).toEqual(["runtime:manifest:a", "runtime:manifest:z"]);
  });

  it("preserves explicit input tracking id without generation", () => {
    const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:caller-supplied",
      manifests: [],
      certifications: [],
      certificationSummary: buildRuntimeCapabilityCertificationSummary({
        certifications: [],
      }),
    });

    expect(envelope.trackingId).toBe("runtime:introspection:caller-supplied");
  });

  it("uses hardcoded schema and source literals", () => {
    const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:literals",
      manifests: [],
      certifications: [],
      certificationSummary: buildRuntimeCapabilityCertificationSummary({
        certifications: [],
      }),
    });

    expect(envelope.schemaVersion).toBe(
      "lingua-core-platform:runtime-introspection-envelope@phase9",
    );
    expect(envelope.generatedFrom).toBe("runtime-capability-introspection");
  });

  it("sorts root manifests by manifest id", () => {
    const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:manifest-order",
      manifests: [
        createManifest("runtime:manifest:c"),
        createManifest("runtime:manifest:a"),
        createManifest("runtime:manifest:b"),
      ],
      certifications: [],
      certificationSummary: buildRuntimeCapabilityCertificationSummary({
        certifications: [],
      }),
    });

    expect(
      envelope.manifests.map((manifest) => manifest.metadata.manifestId),
    ).toEqual([
      "runtime:manifest:a",
      "runtime:manifest:b",
      "runtime:manifest:c",
    ]);
  });

  it("sorts root certifications by deterministic tracking identifier", () => {
    const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:certification-order",
      manifests: [],
      certifications: [
        createCertificationArtifact("rejected", [
          {
            stageIndex: 2,
            objectPath: "$.b",
            diagnosticCode: "CERTIFICATION_FAILURE",
            message: "b",
          },
        ]),
        createCertificationArtifact("certified", []),
        createCertificationArtifact("rejected", [
          {
            stageIndex: 1,
            objectPath: "$.a",
            diagnosticCode: "CAPABILITY_MISMATCH",
            message: "a",
          },
        ]),
      ],
      certificationSummary: buildRuntimeCapabilityCertificationSummary({
        certifications: [],
      }),
    });

    expect(
      envelope.certifications.map((certification) => [
        certification.status,
        certification.structuralMismatches[0]?.objectPath ?? "$",
      ]),
    ).toEqual([
      ["certified", "$"],
      ["rejected", "$.a"],
      ["rejected", "$.b"],
    ]);
  });

  it("preserves global certification status and deterministic counts", () => {
    const summary = buildRuntimeCapabilityCertificationSummary({
      certifications: [
        createCertificationArtifact("rejected", [
          {
            stageIndex: 1,
            objectPath: "$.a",
            diagnosticCode: "CAPABILITY_MISMATCH",
            message: "a",
          },
        ]),
      ],
    });
    const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:status",
      manifests: [createManifest("runtime:manifest:a")],
      certifications: [
        createCertificationArtifact("certified", []),
        createCertificationArtifact("rejected", [
          {
            stageIndex: 1,
            objectPath: "$.a",
            diagnosticCode: "CAPABILITY_MISMATCH",
            message: "a",
          },
        ]),
      ],
      certificationSummary: summary,
    });

    expect(envelope.globalStatus).toBe("rejected");
    expect(envelope.manifestCount).toBe(1);
    expect(envelope.certificationCount).toBe(2);
  });

  it("recursively freezes envelope artifacts", () => {
    const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:freeze",
      manifests: [createManifest("runtime:manifest:a")],
      certifications: [
        createCertificationArtifact("rejected", [
          {
            stageIndex: 1,
            objectPath: "$.a",
            diagnosticCode: "CAPABILITY_MISMATCH",
            message: "a",
          },
        ]),
      ],
      certificationSummary: buildRuntimeCapabilityCertificationSummary({
        certifications: [
          createCertificationArtifact("rejected", [
            {
              stageIndex: 1,
              objectPath: "$.a",
              diagnosticCode: "CAPABILITY_MISMATCH",
              message: "a",
            },
          ]),
        ],
      }),
    });

    expect(Object.isFrozen(envelope)).toBe(true);
    expect(Object.isFrozen(envelope.manifests)).toBe(true);
    expect(Object.isFrozen(envelope.manifests[0])).toBe(true);
    expect(Object.isFrozen(envelope.manifests[0]?.capabilities)).toBe(true);
    expect(Object.isFrozen(envelope.certifications)).toBe(true);
    expect(Object.isFrozen(envelope.certifications[0])).toBe(true);
    expect(Object.isFrozen(envelope.certificationSummary)).toBe(true);
    expect(
      Object.isFrozen(envelope.certificationSummary.aggregatedMismatches),
    ).toBe(true);
  });

  it("preserves JSON roundtrip safety", () => {
    const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:roundtrip",
      manifests: [createManifest("runtime:manifest:a")],
      certifications: [createCertificationArtifact("certified", [])],
      certificationSummary: buildRuntimeCapabilityCertificationSummary({
        certifications: [createCertificationArtifact("certified", [])],
      }),
    });
    const roundTripped = JSON.parse(
      JSON.stringify(envelope),
    ) as typeof envelope;

    expect(roundTripped).toEqual(envelope);
    expect(stableJsonStringify(roundTripped)).toBe(
      stableJsonStringify(envelope),
    );
  });

  it("produces equivalent output for repeated execution", () => {
    const input = {
      trackingId: "runtime:introspection:repeatable",
      manifests: [
        createManifest("runtime:manifest:b"),
        createManifest("runtime:manifest:a"),
      ],
      certifications: [
        createCertificationArtifact("rejected", [
          {
            stageIndex: 1,
            objectPath: "$.a",
            diagnosticCode: "CAPABILITY_MISMATCH",
            message: "a",
          },
        ]),
        createCertificationArtifact("certified", []),
      ],
      certificationSummary: buildRuntimeCapabilityCertificationSummary({
        certifications: [
          createCertificationArtifact("certified", []),
          createCertificationArtifact("rejected", [
            {
              stageIndex: 1,
              objectPath: "$.a",
              diagnosticCode: "CAPABILITY_MISMATCH",
              message: "a",
            },
          ]),
        ],
      }),
    };

    expect(buildRuntimeCapabilityIntrospectionEnvelope(input)).toEqual(
      buildRuntimeCapabilityIntrospectionEnvelope(input),
    );
  });

  it("does not mutate input artifacts", () => {
    const manifests = [
      createManifest("runtime:manifest:b"),
      createManifest("runtime:manifest:a"),
    ];
    const certifications = [
      createCertificationArtifact("rejected", [
        {
          stageIndex: 2,
          objectPath: "$.b",
          diagnosticCode: "CERTIFICATION_FAILURE",
          message: "b",
        },
        {
          stageIndex: 1,
          objectPath: "$.a",
          diagnosticCode: "CAPABILITY_MISMATCH",
          message: "a",
        },
      ]),
    ];
    const certificationSummary = buildRuntimeCapabilityCertificationSummary({
      certifications,
    });
    const before = JSON.parse(
      JSON.stringify({ manifests, certifications, certificationSummary }),
    ) as {
      readonly manifests: typeof manifests;
      readonly certifications: typeof certifications;
      readonly certificationSummary: typeof certificationSummary;
    };

    buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:no-mutation",
      manifests,
      certifications,
      certificationSummary,
    });

    expect({ manifests, certifications, certificationSummary }).toEqual(before);
  });

  it("throws on empty trackingId", () => {
    expect(() =>
      buildRuntimeCapabilityIntrospectionEnvelope({
        trackingId: "",
        manifests: [],
        certifications: [],
        certificationSummary: buildRuntimeCapabilityCertificationSummary({
          certifications: [],
        }),
      }),
    ).toThrow("[governance invariant]");
  });

  it("throws on whitespace-only trackingId", () => {
    expect(() =>
      buildRuntimeCapabilityIntrospectionEnvelope({
        trackingId: "   ",
        manifests: [],
        certifications: [],
        certificationSummary: buildRuntimeCapabilityCertificationSummary({
          certifications: [],
        }),
      }),
    ).toThrow("[governance invariant]");
  });

  it("throws on duplicate manifestId across manifests", () => {
    const manifest = createManifest("runtime:manifest:duplicate");

    expect(() =>
      buildRuntimeCapabilityIntrospectionEnvelope({
        trackingId: "runtime:introspection:duplicate-manifests",
        manifests: [manifest, manifest],
        certifications: [],
        certificationSummary: buildRuntimeCapabilityCertificationSummary({
          certifications: [],
        }),
      }),
    ).toThrow(
      "[governance invariant] manifest manifestId must be unique: runtime:manifest:duplicate",
    );
  });

  it("throws when a manifest carries a wrong schemaVersion", () => {
    const manifest = createManifest("runtime:manifest:baseline");
    const driftedManifest = {
      ...manifest,
      schemaVersion: "wrong@version",
    } as unknown as RuntimeCapabilityManifest;

    expect(() =>
      buildRuntimeCapabilityIntrospectionEnvelope({
        trackingId: "runtime:introspection:schema-drift",
        manifests: [driftedManifest],
        certifications: [],
        certificationSummary: buildRuntimeCapabilityCertificationSummary({
          certifications: [],
        }),
      }),
    ).toThrow(
      `[governance invariant] manifest schemaVersion must be ${RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION}`,
    );
  });

  it("orderRuntimeCapabilityManifests individually freezes each manifest object, not only the array", () => {
    const ordered = orderRuntimeCapabilityManifests([
      createManifest("runtime:manifest:a"),
    ]);

    expect(Object.isFrozen(ordered)).toBe(true);
    expect(Object.isFrozen(ordered[0])).toBe(true);
    expect(Object.isFrozen(ordered[0]?.metadata)).toBe(true);
    expect(Object.isFrozen(ordered[0]?.capabilities)).toBe(true);
  });

  it("orderRuntimeCapabilityCertifications individually freezes each certification object, not only the array", () => {
    const ordered = orderRuntimeCapabilityCertifications([
      createCertificationArtifact("rejected", [
        {
          stageIndex: 1,
          objectPath: "$.a",
          diagnosticCode: "CAPABILITY_MISMATCH",
          message: "mismatch",
        },
      ]),
    ]);

    expect(Object.isFrozen(ordered)).toBe(true);
    expect(Object.isFrozen(ordered[0])).toBe(true);
    expect(Object.isFrozen(ordered[0]?.structuralMismatches)).toBe(true);
  });

  it("keeps empty arrays immutable", () => {
    const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:empty",
      manifests: [],
      certifications: [],
      certificationSummary: buildRuntimeCapabilityCertificationSummary({
        certifications: [],
      }),
    });

    expect(envelope.manifests).toEqual([]);
    expect(envelope.certifications).toEqual([]);
    expect(Object.isFrozen(envelope.manifests)).toBe(true);
    expect(Object.isFrozen(envelope.certifications)).toBe(true);
  });

  it("can compose real certification artifacts", () => {
    const expectedManifest = createManifest("runtime:manifest:expected");
    const providedManifest = createManifest("runtime:manifest:provided");
    const certification = certifyRuntimeCapabilityManifest({
      expectedManifest,
      providedManifest,
    });
    const summary = buildRuntimeCapabilityCertificationSummary({
      certifications: [certification],
    });
    const envelope = buildRuntimeCapabilityIntrospectionEnvelope({
      trackingId: "runtime:introspection:real-certification",
      manifests: [expectedManifest, providedManifest],
      certifications: [certification],
      certificationSummary: summary,
    });

    expect(envelope.globalStatus).toBe("certified");
    expect(envelope.certifications[0]).toEqual(certification);
  });
});

function createManifest(manifestId: string): RuntimeCapabilityManifest {
  return composeRuntimeCapabilityManifest({
    metadata: createMetadata(manifestId),
    capabilities: [
      createCapability("snapshot:replay:diff", "snapshot", "1.0.0"),
      createCapability("engine:tokenize:thai", "engine", "1.0.0"),
      createCapability("query:parse:recursive_descent", "query", "1.0.0"),
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
  status: RuntimeCapabilityCertificationArtifact["status"],
  structuralMismatches: RuntimeCapabilityCertificationArtifact["structuralMismatches"],
): RuntimeCapabilityCertificationArtifact {
  return {
    status,
    platformBaseline: "lingua-core-platform@phase9",
    structuralMismatches,
  };
}
