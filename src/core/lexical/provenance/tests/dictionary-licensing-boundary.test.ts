import { describe, expect, it } from "vitest";

import {
  DICTIONARY_LICENSING_BOUNDARY_SCHEMA_VERSION,
  composeDictionaryLicensingBoundary,
  type ComposeDictionaryLicensingBoundaryInput,
  type DictionaryLicensingBoundary,
  type DictionaryLicensingVerdict,
} from "../dictionary-licensing-boundary";
import { composeDictionarySourceProvenance } from "../dictionary-source-provenance";

function makeProvenance() {
  return composeDictionarySourceProvenance({
    sourceId: "nectec:lexitron:v1",
    displayName: "NECTEC LEXiTRON",
    sourceUrl: "https://lexitron.nectec.or.th",
    licenseType: "Academic",
    licenseUrl: "https://lexitron.nectec.or.th/license",
    attributionRequired: true,
    attributionPayload: "NECTEC LEXiTRON Thai-English Dictionary",
  });
}

function makeInput(
  overrides?: Partial<ComposeDictionaryLicensingBoundaryInput>,
): ComposeDictionaryLicensingBoundaryInput {
  return {
    provenance: makeProvenance(),
    isCommerciallyViable: "unknown",
    redistributionAllowed: "unknown",
    licenseType: "Academic",
    licenseUrl: "https://lexitron.nectec.or.th/license",
    attributionRequired: "unknown",
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeDictionaryLicensingBoundary — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect(boundary.schemaVersion).toBe(
      DICTIONARY_LICENSING_BOUNDARY_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase11 lineage identifier", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect(boundary.schemaVersion).toBe(
      "lingua-core-platform:dictionary-licensing-boundary@phase11",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeDictionaryLicensingBoundary — field passthrough", () => {
  it("preserves provenance", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect(boundary.provenance).toEqual(makeProvenance());
  });

  it("preserves isCommerciallyViable as unknown", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect(boundary.isCommerciallyViable).toBe("unknown");
  });

  it("preserves isCommerciallyViable as true", () => {
    const boundary = composeDictionaryLicensingBoundary(
      makeInput({ isCommerciallyViable: true }),
    );

    expect(boundary.isCommerciallyViable).toBe(true);
  });

  it("preserves isCommerciallyViable as false", () => {
    const boundary = composeDictionaryLicensingBoundary(
      makeInput({ isCommerciallyViable: false }),
    );

    expect(boundary.isCommerciallyViable).toBe(false);
  });

  it("preserves redistributionAllowed as unknown", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect(boundary.redistributionAllowed).toBe("unknown");
  });

  it("preserves redistributionAllowed as true", () => {
    const boundary = composeDictionaryLicensingBoundary(
      makeInput({ redistributionAllowed: true }),
    );

    expect(boundary.redistributionAllowed).toBe(true);
  });

  it("preserves redistributionAllowed as false", () => {
    const boundary = composeDictionaryLicensingBoundary(
      makeInput({ redistributionAllowed: false }),
    );

    expect(boundary.redistributionAllowed).toBe(false);
  });

  it("preserves licenseType", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect(boundary.licenseType).toBe("Academic");
  });

  it("preserves empty licenseType (unknown)", () => {
    const boundary = composeDictionaryLicensingBoundary(
      makeInput({ licenseType: "" }),
    );

    expect(boundary.licenseType).toBe("");
  });

  it("preserves licenseUrl", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect(boundary.licenseUrl).toBe("https://lexitron.nectec.or.th/license");
  });

  it("preserves empty licenseUrl (unknown)", () => {
    const boundary = composeDictionaryLicensingBoundary(
      makeInput({ licenseUrl: "" }),
    );

    expect(boundary.licenseUrl).toBe("");
  });

  it("preserves attributionRequired as unknown", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect(boundary.attributionRequired).toBe("unknown");
  });

  it("preserves attributionRequired as true", () => {
    const boundary = composeDictionaryLicensingBoundary(
      makeInput({ attributionRequired: true }),
    );

    expect(boundary.attributionRequired).toBe(true);
  });

  it("preserves attributionRequired as false", () => {
    const boundary = composeDictionaryLicensingBoundary(
      makeInput({ attributionRequired: false }),
    );

    expect(boundary.attributionRequired).toBe(false);
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeDictionaryLicensingBoundary — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect("evaluationTimestamp" in boundary).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect("generatedFrom" in boundary).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeDictionaryLicensingBoundary — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect(Object.isFrozen(boundary)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const boundary = composeDictionaryLicensingBoundary(makeInput());

    expect(() => {
      JSON.stringify(boundary);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(boundary),
    ) as DictionaryLicensingBoundary;

    expect(roundTripped.schemaVersion).toBe(boundary.schemaVersion);
    expect(roundTripped.provenance).toEqual(boundary.provenance);
    expect(roundTripped.isCommerciallyViable).toBe(
      boundary.isCommerciallyViable,
    );
  });

  it("is JSON round-trip safe with boolean verdicts", () => {
    const boundary = composeDictionaryLicensingBoundary(
      makeInput({
        isCommerciallyViable: true,
        redistributionAllowed: false,
        attributionRequired: true,
      }),
    );

    const roundTripped = JSON.parse(
      JSON.stringify(boundary),
    ) as DictionaryLicensingBoundary;

    expect(roundTripped.isCommerciallyViable).toBe(true);
    expect(roundTripped.redistributionAllowed).toBe(false);
    expect(roundTripped.attributionRequired).toBe(true);
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeDictionaryLicensingBoundary — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(composeDictionaryLicensingBoundary(input)).toEqual(
      composeDictionaryLicensingBoundary(input),
    );
  });

  it("identical inputs with all boolean verdicts produce identical outputs", () => {
    const input = makeInput({
      isCommerciallyViable: true,
      redistributionAllowed: true,
      attributionRequired: false,
    });

    expect(composeDictionaryLicensingBoundary(input)).toEqual(
      composeDictionaryLicensingBoundary(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeDictionaryLicensingBoundary — invariant guards", () => {
  it("accepts empty licenseType (unknown license label)", () => {
    expect(() => {
      composeDictionaryLicensingBoundary(makeInput({ licenseType: "" }));
    }).not.toThrow();
  });

  it("accepts empty licenseUrl (unknown license url)", () => {
    expect(() => {
      composeDictionaryLicensingBoundary(makeInput({ licenseUrl: "" }));
    }).not.toThrow();
  });

  it("accepts unknown for isCommerciallyViable", () => {
    const verdict: DictionaryLicensingVerdict = "unknown";

    expect(() => {
      composeDictionaryLicensingBoundary(
        makeInput({ isCommerciallyViable: verdict }),
      );
    }).not.toThrow();
  });

  it("accepts unknown for redistributionAllowed", () => {
    const verdict: DictionaryLicensingVerdict = "unknown";

    expect(() => {
      composeDictionaryLicensingBoundary(
        makeInput({ redistributionAllowed: verdict }),
      );
    }).not.toThrow();
  });

  it("accepts unknown for attributionRequired", () => {
    const verdict: DictionaryLicensingVerdict = "unknown";

    expect(() => {
      composeDictionaryLicensingBoundary(
        makeInput({ attributionRequired: verdict }),
      );
    }).not.toThrow();
  });
});
