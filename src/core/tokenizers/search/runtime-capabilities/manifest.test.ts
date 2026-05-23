import { describe, expect, it } from "vitest";

import {
  composeRuntimeCapabilityManifest,
  evaluateRuntimeCapabilityCompatibility,
  RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
  validateRuntimeCapabilityManifest,
} from ".";
import { stableJsonStringify } from "../query-snapshots";
import type {
  RuntimeCapabilityDeclaration,
  RuntimeCapabilityManifest,
} from "./contracts";

describe("runtime capability manifests", () => {
  it("composes deterministic immutable manifests with sorted declarations", () => {
    const manifest = composeRuntimeCapabilityManifest({
      metadata: createMetadata("runtime:manifest:thai-query"),
      capabilities: [
        createCapability("snapshot:replay:diff", "snapshot", "1.0.0"),
        createCapability("engine:tokenize:thai", "engine", "1.0.0"),
        createCapability("query:parse:recursive_descent", "query", "1.0.0"),
      ],
    });

    expect(manifest).toEqual({
      schemaVersion: RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
      metadata: createMetadata("runtime:manifest:thai-query"),
      capabilities: [
        createCapability("engine:tokenize:thai", "engine", "1.0.0"),
        createCapability("query:parse:recursive_descent", "query", "1.0.0"),
        createCapability("snapshot:replay:diff", "snapshot", "1.0.0"),
      ],
    });
    expect(Object.isFrozen(manifest)).toBe(true);
    expect(Object.isFrozen(manifest.metadata)).toBe(true);
    expect(Object.isFrozen(manifest.capabilities)).toBe(true);
    expect(Object.isFrozen(manifest.capabilities[0])).toBe(true);
  });

  it("preserves exact structure across JSON roundtrip and canonical serialization", () => {
    const first = createManifest();
    const second = composeRuntimeCapabilityManifest({
      metadata: createMetadata("runtime:manifest:thai-query"),
      capabilities: [...first.capabilities].reverse(),
    });
    const roundTripped = JSON.parse(
      JSON.stringify(first),
    ) as RuntimeCapabilityManifest;

    expect(roundTripped).toEqual(first);
    expect(stableJsonStringify(first)).toBe(stableJsonStringify(second));
  });

  it("normalizes composed manifests to declared schema fields only", () => {
    const metadataWithExtra = {
      ...createMetadata("runtime:manifest:normalized"),
      ignored: "metadata-extra",
    } as RuntimeCapabilityManifest["metadata"];
    const capabilityWithExtra = {
      ...createCapability("engine:tokenize:thai", "engine", "1.0.0"),
      ignored: "capability-extra",
    } as RuntimeCapabilityDeclaration;

    const manifest = composeRuntimeCapabilityManifest({
      metadata: metadataWithExtra,
      capabilities: [capabilityWithExtra],
    });

    expect(Object.keys(manifest.metadata)).toEqual([
      "manifestId",
      "runtimeName",
      "runtimeVersion",
      "manifestVersion",
    ]);
    expect(Object.keys(manifest.capabilities[0])).toEqual([
      "capabilityId",
      "kind",
      "version",
      "stability",
    ]);
  });

  it("validates manifests without mutation and returns frozen canonical data", () => {
    const input = {
      schemaVersion: RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
      metadata: createMetadata("runtime:manifest:thai-query"),
      capabilities: [
        createCapability("snapshot:replay:diff", "snapshot", "1.0.0"),
        createCapability("engine:normalize:offsets", "engine", "1.0.0", {
          projections: ["original", "normalized"],
        }),
      ],
    };
    const before = structuredClone(input);
    const result = validateRuntimeCapabilityManifest(input);

    expect(result.success).toBe(true);
    expect(input).toEqual(before);
    if (result.success) {
      expect(
        result.data.capabilities.map((capability) => capability.capabilityId),
      ).toEqual(["engine:normalize:offsets", "snapshot:replay:diff"]);
      expect(Object.isFrozen(result.data.capabilities)).toBe(true);
    }
  });

  it("rejects malformed manifests with deterministic ordered diagnostics", () => {
    const result = validateRuntimeCapabilityManifest({
      schemaVersion: "runtime-capability-manifest-v0",
      metadata: {
        manifestId: "",
        runtimeName: "lingua-core",
        runtimeVersion: "1",
        manifestVersion: "1.0.0",
      },
      capabilities: [
        {
          capabilityId: "generated-id",
          kind: "plugin",
          version: "1",
          stability: "volatile",
        },
        {
          capabilityId: "generated-id",
          kind: "plugin",
          version: "1",
          stability: "volatile",
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
        "RUNTIME_CAPABILITY_METADATA_INVALID",
        "RUNTIME_CAPABILITY_VERSION_INVALID",
        "RUNTIME_CAPABILITY_MANIFEST_MALFORMED",
        "RUNTIME_CAPABILITY_ID_INVALID",
        "RUNTIME_CAPABILITY_KIND_INVALID",
        "RUNTIME_CAPABILITY_STABILITY_INVALID",
        "RUNTIME_CAPABILITY_VERSION_INVALID",
        "RUNTIME_CAPABILITY_DUPLICATE",
        "RUNTIME_CAPABILITY_ID_INVALID",
        "RUNTIME_CAPABILITY_KIND_INVALID",
        "RUNTIME_CAPABILITY_STABILITY_INVALID",
        "RUNTIME_CAPABILITY_VERSION_INVALID",
      ]);
      expect(
        result.diagnostics.map((diagnostic) => diagnostic.path.join(".")),
      ).toEqual([
        "$.metadata.manifestId",
        "$.metadata.runtimeVersion",
        "$.schemaVersion",
        "$.capabilities.[0].capabilityId",
        "$.capabilities.[0].kind",
        "$.capabilities.[0].stability",
        "$.capabilities.[0].version",
        "$.capabilities.[1].capabilityId",
        "$.capabilities.[1].capabilityId",
        "$.capabilities.[1].kind",
        "$.capabilities.[1].stability",
        "$.capabilities.[1].version",
      ]);
      expect(Object.isFrozen(result.diagnostics)).toBe(true);
      expect(Object.isFrozen(result.diagnostics[0]?.path)).toBe(true);
    }
  });

  it("evaluates capability compatibility with deterministic mismatch ordering", () => {
    const required = composeRuntimeCapabilityManifest({
      metadata: createMetadata("runtime:manifest:required"),
      capabilities: [
        createCapability("query:parse:recursive_descent", "query", "1.0.0"),
        createCapability("snapshot:replay:diff", "snapshot", "1.0.0"),
        createCapability("engine:tokenize:thai", "engine", "1.0.0"),
      ],
    });
    const provided = composeRuntimeCapabilityManifest({
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

    const result = evaluateRuntimeCapabilityCompatibility(required, provided);

    expect(result.compatible).toBe(false);
    expect(result.requiredManifestId).toBe("runtime:manifest:required");
    expect(result.providedManifestId).toBe("runtime:manifest:provided");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "RUNTIME_CAPABILITY_INCOMPATIBLE_VERSION",
      "RUNTIME_CAPABILITY_INCOMPATIBLE_KIND",
      "RUNTIME_CAPABILITY_MISSING",
    ]);
    expect(
      result.diagnostics.map((diagnostic) => diagnostic.path.join(".")),
    ).toEqual([
      "$.capabilities.engine:tokenize:thai.version",
      "$.capabilities.query:parse:recursive_descent.kind",
      "$.capabilities.snapshot:replay:diff",
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
  });

  it("rejects metadata with whitespace-only manifestId", () => {
    const result = validateRuntimeCapabilityManifest({
      schemaVersion: RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
      metadata: {
        manifestId: "   ",
        runtimeName: "lingua-core-search-runtime",
        runtimeVersion: "1.0.0",
        manifestVersion: "1.0.0",
      },
      capabilities: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.diagnostics.some(
          (d) => d.code === "RUNTIME_CAPABILITY_METADATA_INVALID",
        ),
      ).toBe(true);
    }
  });

  it("rejects non-json-safe capability metadata", () => {
    const result = validateRuntimeCapabilityManifest({
      schemaVersion: RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
      metadata: createMetadata("runtime:manifest:invalid-metadata"),
      capabilities: [
        {
          ...createCapability("engine:normalize:offsets", "engine", "1.0.0"),
          metadata: {
            invalid: Number.POSITIVE_INFINITY,
          },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.diagnostics).toEqual([
        {
          stageTrackingIndex: 1,
          code: "RUNTIME_CAPABILITY_METADATA_NON_JSON_SAFE",
          severity: "error",
          path: ["$", "capabilities", "[0]", "metadata"],
          message: "Snapshot value must be a finite JSON number.",
        },
      ]);
    }
  });
});

function createManifest(): RuntimeCapabilityManifest {
  return composeRuntimeCapabilityManifest({
    metadata: createMetadata("runtime:manifest:thai-query"),
    capabilities: [
      createCapability("engine:tokenize:thai", "engine", "1.0.0"),
      createCapability("engine:normalize:offsets", "engine", "1.0.0"),
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
  metadata?: RuntimeCapabilityDeclaration["metadata"],
): RuntimeCapabilityDeclaration {
  return {
    capabilityId,
    kind,
    version,
    stability: "stable",
    ...(metadata === undefined ? {} : { metadata }),
  };
}
