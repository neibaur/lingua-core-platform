import { describe, expect, it } from "vitest";

import type { CanonicalLanguageTag } from "../../language";
import {
  TENANT_CONFIGURATION_SCHEMA_VERSION,
  composeTenantConfiguration,
  type ComposeTenantConfigurationInput,
} from "../tenant-configuration";

function makeInput(
  overrides?: Partial<ComposeTenantConfigurationInput>,
): ComposeTenantConfigurationInput {
  return {
    tenantId: "tenant:acme",
    enabledLanguages: ["th", "en"],
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeTenantConfiguration — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const configuration = composeTenantConfiguration(makeInput());

    expect(configuration.schemaVersion).toBe(
      TENANT_CONFIGURATION_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase15 lineage identifier", () => {
    const configuration = composeTenantConfiguration(makeInput());

    expect(configuration.schemaVersion).toBe(
      "lingua-core-platform:tenant-configuration@phase15",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeTenantConfiguration — field passthrough", () => {
  it("preserves tenantId verbatim", () => {
    const configuration = composeTenantConfiguration(
      makeInput({ tenantId: "tenant:acme" }),
    );

    expect(configuration.tenantId).toBe("tenant:acme");
  });

  it("preserves the enabled languages", () => {
    const configuration = composeTenantConfiguration(
      makeInput({ enabledLanguages: ["th", "en"] }),
    );

    expect(configuration.enabledLanguages).toEqual(["en", "th"]);
  });
});

// ─── deterministic ordering ───────────────────────────────────────────────────

describe("composeTenantConfiguration — deterministic ordering", () => {
  it("orders enabled languages by binary lexicographic comparison", () => {
    const configuration = composeTenantConfiguration(
      makeInput({ enabledLanguages: ["th", "en"] }),
    );

    expect(configuration.enabledLanguages).toEqual(["en", "th"]);
  });

  it("produces identical ordered output regardless of input order", () => {
    const ascending = composeTenantConfiguration(
      makeInput({ enabledLanguages: ["en", "th"] }),
    );
    const descending = composeTenantConfiguration(
      makeInput({ enabledLanguages: ["th", "en"] }),
    );

    expect(ascending.enabledLanguages).toEqual(descending.enabledLanguages);
  });

  it("preserves a single-language configuration", () => {
    const configuration = composeTenantConfiguration(
      makeInput({ enabledLanguages: ["en"] }),
    );

    expect(configuration.enabledLanguages).toEqual(["en"]);
  });
});

// ─── empty set ────────────────────────────────────────────────────────────────

describe("composeTenantConfiguration — empty enabled-language set", () => {
  it("permits an empty enabledLanguages set", () => {
    const configuration = composeTenantConfiguration(
      makeInput({ enabledLanguages: [] }),
    );

    expect(configuration.enabledLanguages).toEqual([]);
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeTenantConfiguration — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const configuration = composeTenantConfiguration(makeInput());

    expect("evaluationTimestamp" in configuration).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const configuration = composeTenantConfiguration(makeInput());

    expect("generatedFrom" in configuration).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeTenantConfiguration — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const configuration = composeTenantConfiguration(makeInput());

    expect(Object.isFrozen(configuration)).toBe(true);
  });

  it("nested enabledLanguages array remains frozen", () => {
    const configuration = composeTenantConfiguration(makeInput());

    expect(Object.isFrozen(configuration.enabledLanguages)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const configuration = composeTenantConfiguration(makeInput());

    expect(() => {
      JSON.stringify(configuration);
    }).not.toThrow();
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeTenantConfiguration — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(composeTenantConfiguration(input)).toEqual(
      composeTenantConfiguration(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeTenantConfiguration — invariant guards", () => {
  it("throws on empty tenantId", () => {
    expect(() => {
      composeTenantConfiguration(makeInput({ tenantId: "" }));
    }).toThrow("[tenant invariant]");
  });

  it("throws on whitespace-only tenantId", () => {
    expect(() => {
      composeTenantConfiguration(makeInput({ tenantId: "   " }));
    }).toThrow("[tenant invariant]");
  });

  it("throws on an out-of-set language code (zh)", () => {
    const enabledLanguages = [
      "zh",
    ] as unknown as readonly CanonicalLanguageTag[];

    expect(() => {
      composeTenantConfiguration(makeInput({ enabledLanguages }));
    }).toThrow("[tenant invariant]");
  });

  it("throws on an unknown language code (xx)", () => {
    const enabledLanguages = [
      "xx",
    ] as unknown as readonly CanonicalLanguageTag[];

    expect(() => {
      composeTenantConfiguration(makeInput({ enabledLanguages }));
    }).toThrow("[tenant invariant]");
  });

  it("throws on a duplicate language", () => {
    expect(() => {
      composeTenantConfiguration(makeInput({ enabledLanguages: ["th", "th"] }));
    }).toThrow("[tenant invariant]");
  });
});
