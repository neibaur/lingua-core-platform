import { describe, expect, it } from "vitest";

import {
  LEXICAL_DATASET_VALIDATION_REPORT_SCHEMA_VERSION,
  LEXICAL_DATASET_VALIDATION_RULE_CODES,
  composeLexicalDatasetValidationReport,
  type LexicalDatasetValidationReport,
} from "./lexical-dataset-validation-report";
import { validateLexicalDataset } from "./lexical-dataset-validation";
import type { LexicalEntry } from "../contracts";

function makeEntry(
  headword: string,
  overrides: Partial<LexicalEntry> = {},
): LexicalEntry {
  return {
    headword,
    definitions: [
      {
        definitionIndex: 0,
        partOfSpeech: "noun",
        definition: `Definition of ${headword}`,
      },
    ],
    ...overrides,
  };
}

function buildValidResult() {
  return validateLexicalDataset({
    datasetId: "test-dataset",
    entries: [makeEntry("apple"), makeEntry("banana")],
  });
}

function buildInvalidResult() {
  return validateLexicalDataset({
    datasetId: "test-dataset",
    entries: [makeEntry("apple"), makeEntry("apple")],
  });
}

function buildEmptyResult() {
  return validateLexicalDataset({
    datasetId: "test-dataset",
    entries: [],
  });
}

describe("composeLexicalDatasetValidationReport", () => {
  describe("schema and sentinel fields", () => {
    it("returns the correct schemaVersion constant", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "report-001",
        validationResult: buildValidResult(),
      });

      expect(report.schemaVersion).toBe(
        LEXICAL_DATASET_VALIDATION_REPORT_SCHEMA_VERSION,
      );
    });

    it("evaluationTimestamp is null", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "report-001",
        validationResult: buildValidResult(),
      });

      expect(report.evaluationTimestamp).toBeNull();
    });

    it("generatedFrom is the expected literal discriminant", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "report-001",
        validationResult: buildValidResult(),
      });

      expect(report.generatedFrom).toBe("lexical-dataset-validation-report");
    });
  });

  describe("field mappings from input", () => {
    it("maps reportId from input", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "my-unique-report",
        validationResult: buildValidResult(),
      });

      expect(report.reportId).toBe("my-unique-report");
    });

    it("maps datasetId from the validationResult", () => {
      const result = buildValidResult();
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(report.datasetId).toBe(result.datasetId);
    });

    it("maps validationStatus from the validationResult", () => {
      const result = buildValidResult();
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(report.validationStatus).toBe(result.validationStatus);
    });

    it("maps entryCount from the validationResult", () => {
      const result = buildValidResult();
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(report.entryCount).toBe(result.entryCount);
    });

    it("maps diagnosticCount from the validationResult", () => {
      const result = buildInvalidResult();
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(report.diagnosticCount).toBe(result.diagnosticCount);
    });

    it("embeds the full validationResult artifact by value", () => {
      const result = buildValidResult();
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(report.validationResult).toEqual(result);
    });
  });

  describe("evaluatedRuleCount", () => {
    it("equals LEXICAL_DATASET_VALIDATION_RULE_CODES.length", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildValidResult(),
      });

      expect(report.evaluatedRuleCount).toBe(
        LEXICAL_DATASET_VALIDATION_RULE_CODES.length,
      );
    });

    it("is 5", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildValidResult(),
      });

      expect(report.evaluatedRuleCount).toBe(5);
    });
  });

  describe("diagnostics cloning", () => {
    it("diagnostics array is a clone, not the same reference as validationResult.diagnostics", () => {
      const result = buildInvalidResult();
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(report.diagnostics).toEqual(result.diagnostics);
      expect(report.diagnostics).not.toBe(result.diagnostics);
    });

    it("diagnostics contents match validationResult diagnostics", () => {
      const result = buildInvalidResult();
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(report.diagnostics).toEqual(result.diagnostics);
    });
  });

  describe("diagnosticsByCode exhaustiveness", () => {
    it("all five diagnostic code keys are always present", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildValidResult(),
      });

      expect(
        "LEXICAL_DATASET_DUPLICATE_ENTRY_ID" in report.diagnosticsByCode,
      ).toBe(true);
      expect(
        "LEXICAL_DATASET_DUPLICATE_HEADWORD" in report.diagnosticsByCode,
      ).toBe(true);
      expect(
        "LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY" in report.diagnosticsByCode,
      ).toBe(true);
      expect(
        "LEXICAL_DATASET_EMPTY_DEFINITIONS" in report.diagnosticsByCode,
      ).toBe(true);
      expect(
        "LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH" in
          report.diagnosticsByCode,
      ).toBe(true);
    });

    it("all code buckets are empty arrays when no diagnostics fired", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildValidResult(),
      });

      for (const code of LEXICAL_DATASET_VALIDATION_RULE_CODES) {
        expect(report.diagnosticsByCode[code]).toHaveLength(0);
      }
    });

    it("all code buckets are empty arrays for an empty dataset", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildEmptyResult(),
      });

      for (const code of LEXICAL_DATASET_VALIDATION_RULE_CODES) {
        expect(report.diagnosticsByCode[code]).toHaveLength(0);
      }
    });
  });

  describe("diagnosticsByCode routing", () => {
    it("routes DUPLICATE_HEADWORD diagnostics to the correct bucket", () => {
      const result = validateLexicalDataset({
        datasetId: "ds",
        entries: [makeEntry("apple"), makeEntry("apple")],
      });
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(
        report.diagnosticsByCode.LEXICAL_DATASET_DUPLICATE_HEADWORD,
      ).toHaveLength(1);
      expect(
        report.diagnosticsByCode.LEXICAL_DATASET_DUPLICATE_HEADWORD[0]?.code,
      ).toBe("LEXICAL_DATASET_DUPLICATE_HEADWORD");
    });

    it("routes EMPTY_DEFINITIONS diagnostics to the correct bucket", () => {
      const result = validateLexicalDataset({
        datasetId: "ds",
        entries: [makeEntry("apple", { definitions: [] })],
      });
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(
        report.diagnosticsByCode.LEXICAL_DATASET_EMPTY_DEFINITIONS,
      ).toHaveLength(1);
      expect(
        report.diagnosticsByCode.LEXICAL_DATASET_EMPTY_DEFINITIONS[0]?.code,
      ).toBe("LEXICAL_DATASET_EMPTY_DEFINITIONS");
    });

    it("routes DUPLICATE_ENTRY_ID diagnostics to the correct bucket", () => {
      const result = validateLexicalDataset({
        datasetId: "ds",
        entries: [
          makeEntry("apple", { entryId: "en:apple:v1" }),
          makeEntry("banana", { entryId: "en:apple:v1" }),
        ],
      });
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(
        report.diagnosticsByCode.LEXICAL_DATASET_DUPLICATE_ENTRY_ID,
      ).toHaveLength(1);
    });

    it("routes DUPLICATE_NORMALIZED_KEY diagnostics to the correct bucket", () => {
      // "ปี25" (Arabic digits) and "ปี๒๕" (Thai digits) normalize to the same key
      const result = validateLexicalDataset({
        datasetId: "ds",
        entries: [makeEntry("ปี25"), makeEntry("ปี๒๕")],
      });
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(
        report.diagnosticsByCode.LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY,
      ).toHaveLength(1);
    });

    it("routes ENTRY_ID_NORMALIZATION_MISMATCH diagnostics to the correct bucket", () => {
      const result = validateLexicalDataset({
        datasetId: "ds",
        entries: [makeEntry("apple", { entryId: "en:banana:v1" })],
      });
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(
        report.diagnosticsByCode
          .LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH,
      ).toHaveLength(1);
    });

    it("buckets for unfired rules remain empty arrays", () => {
      const result = validateLexicalDataset({
        datasetId: "ds",
        entries: [makeEntry("apple"), makeEntry("apple")],
      });
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(
        report.diagnosticsByCode.LEXICAL_DATASET_DUPLICATE_ENTRY_ID,
      ).toHaveLength(0);
      expect(
        report.diagnosticsByCode.LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY,
      ).toHaveLength(0);
      expect(
        report.diagnosticsByCode.LEXICAL_DATASET_EMPTY_DEFINITIONS,
      ).toHaveLength(0);
      expect(
        report.diagnosticsByCode
          .LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH,
      ).toHaveLength(0);
    });
  });

  describe("validationStatus passthrough", () => {
    it("reports 'valid' for a clean dataset", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildValidResult(),
      });

      expect(report.validationStatus).toBe("valid");
    });

    it("reports 'invalid' when error diagnostics are present", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildInvalidResult(),
      });

      expect(report.validationStatus).toBe("invalid");
    });

    it("reports 'valid' for an empty dataset", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildEmptyResult(),
      });

      expect(report.validationStatus).toBe("valid");
    });
  });

  describe("immutability", () => {
    it("the returned report is deeply frozen", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildValidResult(),
      });

      expect(Object.isFrozen(report)).toBe(true);
    });

    it("the diagnostics array on the report is frozen", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildInvalidResult(),
      });

      expect(Object.isFrozen(report.diagnostics)).toBe(true);
    });

    it("the diagnosticsByCode object is frozen", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildValidResult(),
      });

      expect(Object.isFrozen(report.diagnosticsByCode)).toBe(true);
    });

    it("individual diagnostic buckets in diagnosticsByCode are frozen", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildValidResult(),
      });

      for (const code of LEXICAL_DATASET_VALIDATION_RULE_CODES) {
        expect(Object.isFrozen(report.diagnosticsByCode[code])).toBe(true);
      }
    });
  });

  describe("determinism", () => {
    it("identical inputs produce structurally equal reports", () => {
      const result = buildValidResult();
      const a = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });
      const b = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(a).toEqual(b);
    });

    it("identical inputs with diagnostics produce structurally equal reports", () => {
      const result = buildInvalidResult();
      const a = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });
      const b = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: result,
      });

      expect(a).toEqual(b);
    });
  });

  describe("JSON round-trip safety", () => {
    it("is JSON round-trip safe for a valid result", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildValidResult(),
      });

      expect(() => {
        JSON.stringify(report);
      }).not.toThrow();

      const roundTripped = JSON.parse(
        JSON.stringify(report),
      ) as LexicalDatasetValidationReport;

      expect(roundTripped.schemaVersion).toBe(report.schemaVersion);
      expect(roundTripped.reportId).toBe(report.reportId);
      expect(roundTripped.evaluationTimestamp).toBeNull();
      expect(roundTripped.generatedFrom).toBe(report.generatedFrom);
      expect(roundTripped.validationStatus).toBe(report.validationStatus);
    });

    it("is JSON round-trip safe for an invalid result", () => {
      const report = composeLexicalDatasetValidationReport({
        reportId: "r1",
        validationResult: buildInvalidResult(),
      });

      expect(() => {
        JSON.stringify(report);
      }).not.toThrow();

      const roundTripped = JSON.parse(
        JSON.stringify(report),
      ) as LexicalDatasetValidationReport;

      expect(roundTripped.diagnosticCount).toBe(report.diagnosticCount);
      expect(roundTripped.diagnostics).toEqual(report.diagnostics);
    });
  });

  describe("invariant guards", () => {
    it("throws on empty reportId", () => {
      expect(() => {
        composeLexicalDatasetValidationReport({
          reportId: "",
          validationResult: buildValidResult(),
        });
      }).toThrow("[lexical invariant]");
    });

    it("throws on whitespace-only reportId", () => {
      expect(() => {
        composeLexicalDatasetValidationReport({
          reportId: "   ",
          validationResult: buildValidResult(),
        });
      }).toThrow("[lexical invariant]");
    });

    it("throws on tab-only reportId", () => {
      expect(() => {
        composeLexicalDatasetValidationReport({
          reportId: "\t",
          validationResult: buildValidResult(),
        });
      }).toThrow("[lexical invariant]");
    });
  });
});
