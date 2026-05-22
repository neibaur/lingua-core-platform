import { describe, expect, it } from "vitest";

import {
  certifyRuntimeCapabilityManifest,
  composeRuntimeCapabilityManifest,
  RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
} from ".";
import { stableJsonStringify } from "../query-snapshots";
import type {
  RuntimeCapabilityDeclaration,
  RuntimeCapabilityManifest,
} from "./contracts";

describe("runtime capability certification", () => {
  it("certifies identical manifests deterministically", () => {
    const manifest = createManifest("runtime:manifest:thai-query");
    const result = certifyRuntimeCapabilityManifest({
      expectedManifest: manifest,
      providedManifest: manifest,
    });

    expect(result).toEqual({
      status: "certified",
      platformBaseline: "lingua-core-platform@phase9",
      structuralMismatches: [],
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.structuralMismatches)).toBe(true);
  });

  it("rejects incompatible manifests deterministically", () => {
    const expectedManifest = createManifest("runtime:manifest:expected");
    const providedManifest = composeRuntimeCapabilityManifest({
      metadata: createMetadata("runtime:manifest:provided"),
      capabilities: [
        createCapability("engine:tokenize:thai", "engine", "2.0.0"),
        createCapability(
          "query:parse:recursive_descent",
          "governance",
          "1.0.0",
        ),
      ],
    });

    const result = certifyRuntimeCapabilityManifest({
      expectedManifest,
      providedManifest,
    });

    expect(result.status).toBe("rejected");
    expect(result.structuralMismatches).toEqual([
      {
        stageIndex: 2,
        objectPath: "$.compatibility.capabilities.engine:tokenize:thai.version",
        diagnosticCode: "CAPABILITY_MISMATCH",
        message: "Runtime capability engine:tokenize:thai version must match.",
      },
      {
        stageIndex: 3,
        objectPath:
          "$.compatibility.capabilities.query:parse:recursive_descent.kind",
        diagnosticCode: "CAPABILITY_MISMATCH",
        message:
          "Runtime capability query:parse:recursive_descent kind must match.",
      },
      {
        stageIndex: 4,
        objectPath: "$.compatibility.capabilities.snapshot:replay:diff",
        diagnosticCode: "CAPABILITY_MISMATCH",
        message: "Required runtime capability snapshot:replay:diff is missing.",
      },
    ]);
  });

  it("preserves certification diagnostic ordering law", () => {
    const result = certifyRuntimeCapabilityManifest({
      expectedManifest: {
        schemaVersion: "runtime-capability-manifest-v0",
        metadata: {
          manifestId: "",
          runtimeName: "lingua-core-search-runtime",
          runtimeVersion: "1",
          manifestVersion: "1.0.0",
        },
        capabilities: [],
      },
      providedManifest: {
        schemaVersion: RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
        metadata: createMetadata("runtime:manifest:provided"),
        capabilities: [
          {
            capabilityId: "generated-id",
            kind: "plugin",
            version: "1",
            stability: "volatile",
          },
        ],
      },
    });

    expect(result.status).toBe("rejected");
    expect(
      result.structuralMismatches.map((mismatch) => [
        mismatch.stageIndex,
        mismatch.objectPath,
        mismatch.diagnosticCode,
      ]),
    ).toEqual([
      [0, "$.expectedManifest.metadata.manifestId", "CERTIFICATION_FAILURE"],
      [
        0,
        "$.expectedManifest.metadata.runtimeVersion",
        "CERTIFICATION_FAILURE",
      ],
      [0, "$.expectedManifest.schemaVersion", "CERTIFICATION_FAILURE"],
      [
        1,
        "$.providedManifest.capabilities.[0].capabilityId",
        "CERTIFICATION_FAILURE",
      ],
      [1, "$.providedManifest.capabilities.[0].kind", "CERTIFICATION_FAILURE"],
      [
        1,
        "$.providedManifest.capabilities.[0].stability",
        "CERTIFICATION_FAILURE",
      ],
      [
        1,
        "$.providedManifest.capabilities.[0].version",
        "CERTIFICATION_FAILURE",
      ],
    ]);
  });

  it("returns deeply immutable certification artifacts", () => {
    const result = certifyRuntimeCapabilityManifest({
      expectedManifest: createManifest("runtime:manifest:expected"),
      providedManifest: composeRuntimeCapabilityManifest({
        metadata: createMetadata("runtime:manifest:provided"),
        capabilities: [
          createCapability("engine:tokenize:thai", "engine", "2.0.0"),
        ],
      }),
    });

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.structuralMismatches)).toBe(true);
    expect(Object.isFrozen(result.structuralMismatches[0])).toBe(true);
  });

  it("produces JSON roundtrip-safe certification output", () => {
    const result = certifyRuntimeCapabilityManifest({
      expectedManifest: createManifest("runtime:manifest:expected"),
      providedManifest: createManifest("runtime:manifest:expected"),
    });
    const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;

    expect(roundTripped).toEqual(result);
    expect(stableJsonStringify(roundTripped)).toBe(stableJsonStringify(result));
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
