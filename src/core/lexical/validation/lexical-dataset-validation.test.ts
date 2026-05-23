import { describe, expect, it } from "vitest";

import { THAI_ENGLISH_FIXTURE_DATASET } from "../datasets/thai-english/thai-english-fixture-dataset";
import { composeEntryId } from "../identity/lexical-entry-id";
import {
  LEXICAL_DATASET_VALIDATION_RESULT_SCHEMA_VERSION,
  validateLexicalDataset,
} from "./lexical-dataset-validation";
import type { ValidateLexicalDatasetInput } from "./lexical-dataset-validation";

// ─── helpers ─────────────────────────────────────────────────────────────────

function validInput(
  overrides?: Partial<ValidateLexicalDatasetInput>,
): ValidateLexicalDatasetInput {
  return {
    datasetId: "test-dataset",
    entries: THAI_ENGLISH_FIXTURE_DATASET,
    ...overrides,
  };
}

// ─── schema and replay invariants ────────────────────────────────────────────

describe("validateLexicalDataset — schema and replay invariants", () => {
  it("returns the correct schemaVersion constant", () => {
    const result = validateLexicalDataset(validInput());

    expect(result.schemaVersion).toBe(
      LEXICAL_DATASET_VALIDATION_RESULT_SCHEMA_VERSION,
    );
  });

  it("evaluationTimestamp is null", () => {
    const result = validateLexicalDataset(validInput());

    expect(result.evaluationTimestamp).toBeNull();
  });

  it("maps datasetId from input", () => {
    const result = validateLexicalDataset(
      validInput({ datasetId: "my-dataset-v1" }),
    );

    expect(result.datasetId).toBe("my-dataset-v1");
  });

  it("maps entryCount from input entries length", () => {
    const result = validateLexicalDataset(validInput());

    expect(result.entryCount).toBe(THAI_ENGLISH_FIXTURE_DATASET.length);
  });

  it("diagnosticCount equals diagnostics array length", () => {
    const result = validateLexicalDataset(validInput());

    expect(result.diagnosticCount).toBe(result.diagnostics.length);
  });

  it("is JSON round-trip safe", () => {
    const result = validateLexicalDataset(validInput());

    expect(() => {
      JSON.stringify(result);
    }).not.toThrow();

    const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;

    expect(roundTripped.schemaVersion).toBe(result.schemaVersion);
    expect(roundTripped.datasetId).toBe(result.datasetId);
    expect(roundTripped.evaluationTimestamp).toBeNull();
    expect(roundTripped.validationStatus).toBe(result.validationStatus);
  });

  it("identical inputs produce structurally equal results", () => {
    const input = validInput();
    const a = validateLexicalDataset(input);
    const b = validateLexicalDataset(input);

    expect(a).toEqual(b);
  });

  it("throws on empty datasetId", () => {
    expect(() => {
      validateLexicalDataset(validInput({ datasetId: "" }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only datasetId", () => {
    expect(() => {
      validateLexicalDataset(validInput({ datasetId: "   " }));
    }).toThrow("[lexical invariant]");
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("validateLexicalDataset — immutability", () => {
  it("returns a deeply frozen result", () => {
    const result = validateLexicalDataset(validInput());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
  });

  it("nested diagnostic objects are frozen", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            headword: "กิน",
            definitions: [],
          },
        ],
      }),
    );

    for (const d of result.diagnostics) {
      expect(Object.isFrozen(d)).toBe(true);
      expect(Object.isFrozen(d.path)).toBe(true);
    }
  });

  it("does not mutate the input entries array", () => {
    const entries = [
      {
        headword: "กิน",
        definitions: [
          { definitionIndex: 0, definition: "to eat", partOfSpeech: "verb" },
        ],
      },
      {
        headword: "กิน",
        definitions: [
          { definitionIndex: 0, definition: "to eat", partOfSpeech: "verb" },
        ],
      },
    ] as const;

    validateLexicalDataset({ datasetId: "test", entries });

    expect(entries[0].headword).toBe("กิน");
    expect(entries[1].headword).toBe("กิน");
    expect(entries).toHaveLength(2);
  });
});

// ─── valid dataset ────────────────────────────────────────────────────────────

describe("validateLexicalDataset — valid dataset", () => {
  it("returns 'valid' for the fixture dataset", () => {
    const result = validateLexicalDataset(validInput());

    expect(result.validationStatus).toBe("valid");
    expect(result.diagnosticCount).toBe(0);
    expect(result.diagnostics).toHaveLength(0);
  });

  it("returns 'valid' for an empty entries array", () => {
    const result = validateLexicalDataset(validInput({ entries: [] }));

    expect(result.validationStatus).toBe("valid");
    expect(result.entryCount).toBe(0);
    expect(result.diagnostics).toHaveLength(0);
  });

  it("returns 'valid' for a single well-formed entry", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
        ],
      }),
    );

    expect(result.validationStatus).toBe("valid");
  });

  it("returns 'valid' for an entry with a matching entryId", () => {
    const entryId = composeEntryId({
      languageCode: "thai",
      headword: "กิน",
      version: 1,
    });

    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            entryId,
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
        ],
      }),
    );

    expect(result.validationStatus).toBe("valid");
  });
});

// ─── duplicate headword ───────────────────────────────────────────────────────

describe("validateLexicalDataset — LEXICAL_DATASET_DUPLICATE_HEADWORD", () => {
  it("emits an error when two entries share the same headword string", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
          {
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to consume",
                partOfSpeech: "verb",
              },
            ],
          },
        ],
      }),
    );

    expect(result.validationStatus).toBe("invalid");
    const codes = result.diagnostics.map((d) => d.code);
    expect(codes).toContain("LEXICAL_DATASET_DUPLICATE_HEADWORD");
  });

  it("uses the duplicate headword as path[0]", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
          {
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to consume",
                partOfSpeech: "verb",
              },
            ],
          },
        ],
      }),
    );

    const d = result.diagnostics.find(
      (x) => x.code === "LEXICAL_DATASET_DUPLICATE_HEADWORD",
    );

    expect(d?.path[0]).toBe("กิน");
    expect(d?.severity).toBe("error");
  });

  it("does not emit DUPLICATE_NORMALIZED_KEY for exact headword duplicates", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
          {
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to consume",
                partOfSpeech: "verb",
              },
            ],
          },
        ],
      }),
    );

    const codes = result.diagnostics.map((d) => d.code);
    expect(codes).not.toContain("LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY");
  });
});

// ─── duplicate normalized key ─────────────────────────────────────────────────

describe("validateLexicalDataset — LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY", () => {
  it("emits an error when two distinct headwords normalize to the same key", () => {
    // "ปี25" (Arabic digits) and "ปี๒๕" (Thai digits) both normalize to "ปี25"
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            headword: "ปี25",
            definitions: [
              {
                definitionIndex: 0,
                definition: "year (25)",
                partOfSpeech: "noun",
              },
            ],
          },
          {
            headword: "ปี๒๕",
            definitions: [
              {
                definitionIndex: 0,
                definition: "year (Thai 25)",
                partOfSpeech: "noun",
              },
            ],
          },
        ],
      }),
    );

    expect(result.validationStatus).toBe("invalid");
    const codes = result.diagnostics.map((d) => d.code);
    expect(codes).toContain("LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY");
  });

  it("uses the colliding entry's headword as path[0]", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            headword: "ปี25",
            definitions: [
              {
                definitionIndex: 0,
                definition: "year",
                partOfSpeech: "noun",
              },
            ],
          },
          {
            headword: "ปี๒๕",
            definitions: [
              {
                definitionIndex: 0,
                definition: "year (Thai)",
                partOfSpeech: "noun",
              },
            ],
          },
        ],
      }),
    );

    const d = result.diagnostics.find(
      (x) => x.code === "LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY",
    );

    expect(d?.path[0]).toBe("ปี๒๕");
    expect(d?.severity).toBe("error");
  });
});

// ─── empty definitions ────────────────────────────────────────────────────────

describe("validateLexicalDataset — LEXICAL_DATASET_EMPTY_DEFINITIONS", () => {
  it("emits an error when an entry has no definitions", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            headword: "กิน",
            definitions: [],
          },
        ],
      }),
    );

    expect(result.validationStatus).toBe("invalid");
    const codes = result.diagnostics.map((d) => d.code);
    expect(codes).toContain("LEXICAL_DATASET_EMPTY_DEFINITIONS");
  });

  it("uses the entry headword as path[0]", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [{ headword: "ดี", definitions: [] }],
      }),
    );

    const d = result.diagnostics.find(
      (x) => x.code === "LEXICAL_DATASET_EMPTY_DEFINITIONS",
    );

    expect(d?.path[0]).toBe("ดี");
    expect(d?.severity).toBe("error");
  });

  it("does not emit EMPTY_DEFINITIONS for entries with at least one definition", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
        ],
      }),
    );

    const codes = result.diagnostics.map((d) => d.code);
    expect(codes).not.toContain("LEXICAL_DATASET_EMPTY_DEFINITIONS");
  });
});

// ─── duplicate entryId ────────────────────────────────────────────────────────

describe("validateLexicalDataset — LEXICAL_DATASET_DUPLICATE_ENTRY_ID", () => {
  it("emits an error when two entries share the same entryId", () => {
    const entryId = composeEntryId({
      languageCode: "thai",
      headword: "กิน",
      version: 1,
    });

    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            entryId,
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
          {
            entryId,
            headword: "ข้าว",
            definitions: [
              { definitionIndex: 0, definition: "rice", partOfSpeech: "noun" },
            ],
          },
        ],
      }),
    );

    expect(result.validationStatus).toBe("invalid");
    const codes = result.diagnostics.map((d) => d.code);
    expect(codes).toContain("LEXICAL_DATASET_DUPLICATE_ENTRY_ID");
  });

  it("uses the second entry's headword as path[0]", () => {
    const entryId = composeEntryId({
      languageCode: "thai",
      headword: "กิน",
      version: 1,
    });

    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            entryId,
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
          {
            entryId,
            headword: "ข้าว",
            definitions: [
              { definitionIndex: 0, definition: "rice", partOfSpeech: "noun" },
            ],
          },
        ],
      }),
    );

    const d = result.diagnostics.find(
      (x) => x.code === "LEXICAL_DATASET_DUPLICATE_ENTRY_ID",
    );

    expect(d?.path[0]).toBe("ข้าว");
    expect(d?.severity).toBe("error");
  });

  it("does not emit DUPLICATE_ENTRY_ID for entries without entryId", () => {
    const result = validateLexicalDataset(validInput());

    const codes = result.diagnostics.map((d) => d.code);
    expect(codes).not.toContain("LEXICAL_DATASET_DUPLICATE_ENTRY_ID");
  });
});

// ─── entryId normalization mismatch ──────────────────────────────────────────

describe("validateLexicalDataset — LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH", () => {
  it("emits an error when the entryId canonical key does not match the normalized headword", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            entryId: "thai:wrong-key:v1",
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
        ],
      }),
    );

    expect(result.validationStatus).toBe("invalid");
    const codes = result.diagnostics.map((d) => d.code);
    expect(codes).toContain("LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH");
  });

  it("uses the entry headword as path[0]", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            entryId: "thai:wrong-key:v1",
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
        ],
      }),
    );

    const d = result.diagnostics.find(
      (x) => x.code === "LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH",
    );

    expect(d?.path[0]).toBe("กิน");
    expect(d?.severity).toBe("error");
  });

  it("does not emit NORMALIZATION_MISMATCH when entryId canonical key matches normalized headword", () => {
    const entryId = composeEntryId({
      languageCode: "thai",
      headword: "กิน",
      version: 1,
    });

    const result = validateLexicalDataset(
      validInput({
        entries: [
          {
            entryId,
            headword: "กิน",
            definitions: [
              {
                definitionIndex: 0,
                definition: "to eat",
                partOfSpeech: "verb",
              },
            ],
          },
        ],
      }),
    );

    const codes = result.diagnostics.map((d) => d.code);
    expect(codes).not.toContain(
      "LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH",
    );
  });
});

// ─── diagnostic ordering ─────────────────────────────────────────────────────

describe("validateLexicalDataset — diagnostic ordering", () => {
  it("orders diagnostics by path[0] in binary lexicographic order", () => {
    // "ข้าว" (U+0E02...) > "กิน" (U+0E01...) — กิน should sort first
    const result = validateLexicalDataset(
      validInput({
        entries: [
          { headword: "ข้าว", definitions: [] },
          { headword: "กิน", definitions: [] },
        ],
      }),
    );

    expect(result.diagnostics[0]?.path[0]).toBe("กิน");
    expect(result.diagnostics[1]?.path[0]).toBe("ข้าว");
  });

  it("uses code as secondary sort key when path[0] is equal", () => {
    // Both rules fire on the same headword: empty definitions + duplicate headword
    const result = validateLexicalDataset(
      validInput({
        entries: [
          { headword: "กิน", definitions: [] },
          { headword: "กิน", definitions: [] },
        ],
      }),
    );

    const codes = result.diagnostics.map((d) => d.code);

    // LEXICAL_DATASET_DUPLICATE_HEADWORD < LEXICAL_DATASET_EMPTY_DEFINITIONS binary
    const dupeIdx = codes.indexOf("LEXICAL_DATASET_DUPLICATE_HEADWORD");
    const emptyIdx = codes.indexOf("LEXICAL_DATASET_EMPTY_DEFINITIONS");
    expect(dupeIdx).toBeLessThan(emptyIdx);
  });

  it("repeated validation of the same input produces structurally equal ordered diagnostics", () => {
    const entries = [
      { headword: "ข้าว", definitions: [] },
      { headword: "กิน", definitions: [] },
    ] as const;

    const a = validateLexicalDataset({ datasetId: "test", entries });
    const b = validateLexicalDataset({ datasetId: "test", entries });

    expect(a.diagnostics).toEqual(b.diagnostics);
  });
});

// ─── validationStatus derivation ─────────────────────────────────────────────

describe("validateLexicalDataset — validationStatus derivation", () => {
  it("returns 'invalid' when any error-severity diagnostic is present", () => {
    const result = validateLexicalDataset(
      validInput({
        entries: [{ headword: "กิน", definitions: [] }],
      }),
    );

    expect(result.validationStatus).toBe("invalid");
  });

  it("returns 'valid' when diagnostics array is empty", () => {
    const result = validateLexicalDataset(validInput());

    expect(result.validationStatus).toBe("valid");
  });

  it("entryCount reflects total entries regardless of validity", () => {
    const entries = [
      { headword: "กิน", definitions: [] },
      { headword: "กิน", definitions: [] },
      { headword: "ข้าว", definitions: [] },
    ] as const;

    const result = validateLexicalDataset({ datasetId: "test", entries });

    expect(result.entryCount).toBe(3);
  });
});
