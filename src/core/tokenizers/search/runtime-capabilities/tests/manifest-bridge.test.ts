import { describe, expect, it } from "vitest";

import {
  composeLexicalInteropCapabilityDeclaration,
  composeManifestFromLexicalInteropDeclaration,
  RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
  type ComposeManifestFromLexicalInteropDeclarationInput,
  type LexicalInteropCapabilityDeclaration,
} from "..";

describe("composeManifestFromLexicalInteropDeclaration", () => {
  it("produces a RuntimeCapabilityManifest with correct schemaVersion, manifestId, capabilities, and deep freeze", () => {
    const declaration = createDeclaration();
    const input = createInput(declaration);
    const result = composeManifestFromLexicalInteropDeclaration(input);

    expect(result.schemaVersion).toBe(
      RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
    );
    expect(result.metadata.manifestId).toBe("runtime:manifest:lexical_interop");
    expect(result.capabilities).toEqual(declaration.capabilities);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(Object.isFrozen(result.capabilities)).toBe(true);
    expect(Object.isFrozen(result.capabilities[0])).toBe(true);
  });

  it("passes capabilities through correctly and delegates ordering to the existing builder", () => {
    const declaration = createDeclaration();
    const result = composeManifestFromLexicalInteropDeclaration(
      createInput(declaration),
    );

    expect(result.capabilities.map((c) => c.capabilityId)).toEqual([
      "query:enrich:lexical",
      "query:report:lexical_enrichment",
      "query:report:lexical_query",
    ]);
    expect(result.capabilities).toEqual(declaration.capabilities);
  });

  it("throws on empty manifestId with the exact invariant literal", () => {
    expect(() =>
      composeManifestFromLexicalInteropDeclaration({
        ...createInput(createDeclaration()),
        manifestId: "",
      }),
    ).toThrow(
      "[lexical-interop-manifest-bridge invariant] manifestId must be a non-empty string",
    );
  });

  it("throws on empty runtimeName with the exact invariant literal", () => {
    expect(() =>
      composeManifestFromLexicalInteropDeclaration({
        ...createInput(createDeclaration()),
        runtimeName: "",
      }),
    ).toThrow(
      "[lexical-interop-manifest-bridge invariant] runtimeName must be a non-empty string",
    );
  });

  it("throws on empty runtimeVersion with the exact invariant literal", () => {
    expect(() =>
      composeManifestFromLexicalInteropDeclaration({
        ...createInput(createDeclaration()),
        runtimeVersion: "",
      }),
    ).toThrow(
      "[lexical-interop-manifest-bridge invariant] runtimeVersion must be a non-empty string",
    );
  });

  it("throws on empty manifestVersion with the exact invariant literal", () => {
    expect(() =>
      composeManifestFromLexicalInteropDeclaration({
        ...createInput(createDeclaration()),
        manifestVersion: "",
      }),
    ).toThrow(
      "[lexical-interop-manifest-bridge invariant] manifestVersion must be a non-empty string",
    );
  });

  it("delegates sorting to the existing builder — capabilities are in binary lexicographic order regardless of declaration input order", () => {
    const reversed = composeLexicalInteropCapabilityDeclaration({
      declarationId: "runtime:capabilities:lexical_interop",
      capabilities: [
        {
          capabilityId: "query:report:lexical_query",
          version: "1.0.0",
          stability: "stable",
        },
        {
          capabilityId: "query:report:lexical_enrichment",
          version: "1.0.0",
          stability: "stable",
        },
        {
          capabilityId: "query:enrich:lexical",
          version: "1.0.0",
          stability: "stable",
        },
      ],
    });

    const result = composeManifestFromLexicalInteropDeclaration(
      createInput(reversed),
    );

    expect(result.capabilities.map((c) => c.capabilityId)).toEqual([
      "query:enrich:lexical",
      "query:report:lexical_enrichment",
      "query:report:lexical_query",
    ]);
  });
});

function createDeclaration(): LexicalInteropCapabilityDeclaration {
  return composeLexicalInteropCapabilityDeclaration({
    declarationId: "runtime:capabilities:lexical_interop",
    capabilities: [
      {
        capabilityId: "query:report:lexical_query",
        version: "1.0.0",
        stability: "stable",
      },
      {
        capabilityId: "query:enrich:lexical",
        version: "1.0.0",
        stability: "stable",
      },
      {
        capabilityId: "query:report:lexical_enrichment",
        version: "1.0.0",
        stability: "stable",
      },
    ],
  });
}

function createInput(
  declaration: LexicalInteropCapabilityDeclaration,
): ComposeManifestFromLexicalInteropDeclarationInput {
  return {
    manifestId: "runtime:manifest:lexical_interop",
    runtimeName: "lingua-core-search-runtime",
    runtimeVersion: "1.0.0",
    manifestVersion: "1.0.0",
    declaration,
  };
}
