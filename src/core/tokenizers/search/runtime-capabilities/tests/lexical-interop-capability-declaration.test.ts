import { describe, expect, it } from "vitest";

import {
  composeLexicalInteropCapabilityDeclaration,
  LEXICAL_INTEROP_CAPABILITY_DECLARATION_SCHEMA_VERSION,
  validateLexicalInteropCapabilityDeclaration,
  type ComposeLexicalInteropCapabilityDeclarationInput,
  type LexicalInteropCapabilityDeclaration,
  type LexicalInteropCapabilityDeclarationEntry,
} from "..";

describe("lexical interop capability declarations", () => {
  it("sets the lexical interop capability declaration schemaVersion", () => {
    expect(createDeclaration().schemaVersion).toBe(
      LEXICAL_INTEROP_CAPABILITY_DECLARATION_SCHEMA_VERSION,
    );
  });

  it("passes through the caller supplied declarationId", () => {
    expect(createDeclaration().declarationId).toBe(
      "runtime:capabilities:lexical_interop",
    );
  });

  it("derives capabilityCount from capabilities.length", () => {
    const declaration = createDeclaration();

    expect(declaration.capabilityCount).toBe(declaration.capabilities.length);
  });

  it("sorts capabilities in binary lexicographic order by capabilityId", () => {
    expect(
      createDeclaration().capabilities.map(
        (capability) => capability.capabilityId,
      ),
    ).toEqual([
      "query:enrich:lexical",
      "query:report:lexical_enrichment",
      "query:report:lexical_query",
    ]);
  });

  it("declares only lexical interop capability identifiers", () => {
    expect(
      createDeclaration().capabilities.every((capability) =>
        isExpectedLexicalInteropCapabilityId(capability.capabilityId),
      ),
    ).toBe(true);
  });

  it("marks every lexical interop capability as query kind", () => {
    expect(
      createDeclaration().capabilities.every(
        (capability) => capability.kind === "query",
      ),
    ).toBe(true);
  });

  it("deep freezes the declaration artifact", () => {
    expect(Object.isFrozen(createDeclaration())).toBe(true);
  });

  it("deep freezes the declaration capabilities array", () => {
    expect(Object.isFrozen(createDeclaration().capabilities)).toBe(true);
  });

  it("deep freezes declaration capability entries", () => {
    expect(Object.isFrozen(createDeclaration().capabilities[0])).toBe(true);
  });

  it("produces identical declarations for identical inputs", () => {
    expect(createDeclaration()).toEqual(createDeclaration());
  });

  it("produces identical declarations regardless of input capability order", () => {
    const forward = createDeclaration();
    const reversed = composeLexicalInteropCapabilityDeclaration({
      declarationId: "runtime:capabilities:lexical_interop",
      capabilities: [...createEntries()].reverse(),
    });

    expect(reversed).toEqual(forward);
  });

  it("throws on empty declarationId with the invariant error literal", () => {
    expect(() =>
      composeLexicalInteropCapabilityDeclaration({
        declarationId: "",
        capabilities: createEntries(),
      }),
    ).toThrow(
      "[runtime-capabilities invariant] declarationId must be a non-empty string",
    );
  });

  it("throws on whitespace-only declarationId", () => {
    expect(() =>
      composeLexicalInteropCapabilityDeclaration({
        declarationId: "   ",
        capabilities: createEntries(),
      }),
    ).toThrow("[runtime-capabilities invariant]");
  });

  it("rejects unsupported lexical interop capability identifiers in the builder", () => {
    expect(() =>
      composeLexicalInteropCapabilityDeclaration({
        declarationId: "runtime:capabilities:lexical_interop",
        capabilities: [
          {
            capabilityId:
              "engine:tokenize:thai" as LexicalInteropCapabilityDeclarationEntry["capabilityId"],
            version: "1.0.0",
            stability: "stable",
          },
        ],
      }),
    ).toThrow("[runtime-capabilities invariant]");
  });

  it("validates a well-formed lexical interop capability declaration", () => {
    const result =
      validateLexicalInteropCapabilityDeclaration(createDeclaration());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(createDeclaration());
      expect(Object.isFrozen(result.data)).toBe(true);
    }
  });

  it("rejects a lexical interop declaration with the wrong schemaVersion", () => {
    const result = validateLexicalInteropCapabilityDeclaration({
      ...createDeclaration(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.diagnostics[0]?.code).toBe(
        "RUNTIME_CAPABILITY_MANIFEST_MALFORMED",
      );
      expect(result.diagnostics[0]?.path).toEqual(["$", "schemaVersion"]);
    }
  });

  it("rejects a lexical interop declaration with empty declarationId", () => {
    const result = validateLexicalInteropCapabilityDeclaration({
      ...createDeclaration(),
      declarationId: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.diagnostics[0]?.code).toBe(
        "RUNTIME_CAPABILITY_METADATA_INVALID",
      );
      expect(result.diagnostics[0]?.path).toEqual(["$", "declarationId"]);
    }
  });

  it("rejects a lexical interop declaration with invalid capabilityId", () => {
    const result = validateLexicalInteropCapabilityDeclaration({
      ...createDeclaration(),
      capabilities: [
        {
          capabilityId: "engine:tokenize:thai",
          kind: "query",
          version: "1.0.0",
          stability: "stable",
        },
      ],
      capabilityCount: 1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.diagnostics[0]?.code).toBe("RUNTIME_CAPABILITY_ID_INVALID");
      expect(result.diagnostics[0]?.path).toEqual([
        "$",
        "capabilities",
        "[0]",
        "capabilityId",
      ]);
    }
  });

  it("rejects a lexical interop declaration with capabilityCount mismatch", () => {
    const result = validateLexicalInteropCapabilityDeclaration({
      ...createDeclaration(),
      capabilityCount: 1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.diagnostics[0]?.code).toBe(
        "RUNTIME_CAPABILITY_MANIFEST_MALFORMED",
      );
      expect(result.diagnostics[0]?.path).toEqual(["$", "capabilityCount"]);
    }
  });

  it("rejects duplicate lexical interop capability identifiers", () => {
    const result = validateLexicalInteropCapabilityDeclaration({
      ...createDeclaration(),
      capabilities: [
        createCapability("query:enrich:lexical"),
        createCapability("query:enrich:lexical"),
      ],
      capabilityCount: 2,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.diagnostics[0]?.code).toBe("RUNTIME_CAPABILITY_DUPLICATE");
      expect(result.diagnostics[0]?.path).toEqual([
        "$",
        "capabilities",
        "[1]",
        "capabilityId",
      ]);
    }
  });

  it("returns frozen diagnostics when validation fails", () => {
    const result = validateLexicalInteropCapabilityDeclaration({
      ...createDeclaration(),
      declarationId: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.isFrozen(result.diagnostics)).toBe(true);
      expect(Object.isFrozen(result.diagnostics[0])).toBe(true);
      expect(Object.isFrozen(result.diagnostics[0]?.path)).toBe(true);
    }
  });
});

function createDeclaration(): LexicalInteropCapabilityDeclaration {
  return composeLexicalInteropCapabilityDeclaration(createInput());
}

function createInput(): ComposeLexicalInteropCapabilityDeclarationInput {
  return {
    declarationId: "runtime:capabilities:lexical_interop",
    capabilities: [
      createCapabilityEntry("query:report:lexical_query"),
      createCapabilityEntry("query:enrich:lexical"),
      createCapabilityEntry("query:report:lexical_enrichment"),
    ],
  };
}

function createEntries(): readonly LexicalInteropCapabilityDeclarationEntry[] {
  return createInput().capabilities;
}

function createCapabilityEntry(
  capabilityId: LexicalInteropCapabilityDeclarationEntry["capabilityId"],
): LexicalInteropCapabilityDeclarationEntry {
  return {
    capabilityId,
    version: "1.0.0",
    stability: "stable",
  };
}

function createCapability(
  capabilityId: LexicalInteropCapabilityDeclarationEntry["capabilityId"],
) {
  return {
    capabilityId,
    kind: "query" as const,
    version: "1.0.0",
    stability: "stable" as const,
  };
}

function isExpectedLexicalInteropCapabilityId(value: string): boolean {
  switch (value) {
    case "query:enrich:lexical":
    case "query:report:lexical_enrichment":
    case "query:report:lexical_query":
      return true;
    default:
      return false;
  }
}
