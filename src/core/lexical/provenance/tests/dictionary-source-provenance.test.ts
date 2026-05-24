import { describe, expect, it } from "vitest";

import {
  DICTIONARY_SOURCE_PROVENANCE_SCHEMA_VERSION,
  composeDictionarySourceProvenance,
  type ComposeDictionarySourceProvenanceInput,
  type DictionarySourceProvenance,
} from "../dictionary-source-provenance";

function makeInput(
  overrides?: Partial<ComposeDictionarySourceProvenanceInput>,
): ComposeDictionarySourceProvenanceInput {
  return {
    sourceId: "nectec:lexitron:v1",
    displayName: "NECTEC LEXiTRON",
    sourceUrl: "https://lexitron.nectec.or.th",
    licenseType: "Academic",
    licenseUrl: "https://lexitron.nectec.or.th/license",
    attributionRequired: true,
    attributionPayload: "NECTEC LEXiTRON Thai-English Dictionary",
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeDictionarySourceProvenance — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(provenance.schemaVersion).toBe(
      DICTIONARY_SOURCE_PROVENANCE_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase11 lineage identifier", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(provenance.schemaVersion).toBe(
      "lingua-core-platform:dictionary-source-provenance@phase11",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeDictionarySourceProvenance — field passthrough", () => {
  it("preserves sourceId", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(provenance.sourceId).toBe("nectec:lexitron:v1");
  });

  it("preserves displayName", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(provenance.displayName).toBe("NECTEC LEXiTRON");
  });

  it("preserves sourceUrl", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(provenance.sourceUrl).toBe("https://lexitron.nectec.or.th");
  });

  it("preserves licenseType", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(provenance.licenseType).toBe("Academic");
  });

  it("preserves licenseUrl", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(provenance.licenseUrl).toBe("https://lexitron.nectec.or.th/license");
  });

  it("preserves attributionRequired true", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(provenance.attributionRequired).toBe(true);
  });

  it("preserves attributionRequired false", () => {
    const provenance = composeDictionarySourceProvenance(
      makeInput({ attributionRequired: false }),
    );

    expect(provenance.attributionRequired).toBe(false);
  });

  it("preserves attributionPayload", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(provenance.attributionPayload).toBe(
      "NECTEC LEXiTRON Thai-English Dictionary",
    );
  });

  it("preserves empty attributionPayload when attributionRequired is false", () => {
    const provenance = composeDictionarySourceProvenance(
      makeInput({ attributionRequired: false, attributionPayload: "" }),
    );

    expect(provenance.attributionPayload).toBe("");
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeDictionarySourceProvenance — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect("evaluationTimestamp" in provenance).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect("generatedFrom" in provenance).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeDictionarySourceProvenance — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(Object.isFrozen(provenance)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const provenance = composeDictionarySourceProvenance(makeInput());

    expect(() => {
      JSON.stringify(provenance);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(provenance),
    ) as DictionarySourceProvenance;

    expect(roundTripped.schemaVersion).toBe(provenance.schemaVersion);
    expect(roundTripped.sourceId).toBe(provenance.sourceId);
    expect(roundTripped.attributionRequired).toBe(
      provenance.attributionRequired,
    );
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeDictionarySourceProvenance — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(composeDictionarySourceProvenance(input)).toEqual(
      composeDictionarySourceProvenance(input),
    );
  });

  it("identical inputs with attribution false produce identical outputs", () => {
    const input = makeInput({
      attributionRequired: false,
      attributionPayload: "",
    });

    expect(composeDictionarySourceProvenance(input)).toEqual(
      composeDictionarySourceProvenance(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeDictionarySourceProvenance — invariant guards", () => {
  it("throws on empty sourceId", () => {
    expect(() => {
      composeDictionarySourceProvenance(makeInput({ sourceId: "" }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only sourceId", () => {
    expect(() => {
      composeDictionarySourceProvenance(makeInput({ sourceId: "   " }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on empty displayName", () => {
    expect(() => {
      composeDictionarySourceProvenance(makeInput({ displayName: "" }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only displayName", () => {
    expect(() => {
      composeDictionarySourceProvenance(makeInput({ displayName: "   " }));
    }).toThrow("[lexical invariant]");
  });

  it("accepts empty sourceUrl (unknown)", () => {
    expect(() => {
      composeDictionarySourceProvenance(makeInput({ sourceUrl: "" }));
    }).not.toThrow();
  });

  it("accepts empty licenseUrl (unknown)", () => {
    expect(() => {
      composeDictionarySourceProvenance(makeInput({ licenseUrl: "" }));
    }).not.toThrow();
  });
});
