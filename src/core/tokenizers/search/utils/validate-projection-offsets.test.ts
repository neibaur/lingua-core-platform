import { describe, expect, it } from "vitest";

import {
  mapNormalizedRangeToOriginalRange,
  validateProjectionOffsets,
} from "./validate-projection-offsets";
import type { SearchProjectionRecord } from "../shared/search-projection-record";

describe("validateProjectionOffsets", () => {
  it("accepts records aligned to the normalization index map", () => {
    const records: SearchProjectionRecord[] = [
      {
        token: "ข้าว",
        normalizedStart: 4,
        normalizedEnd: 8,
        originalStart: 6,
        originalEnd: 10,
        tokenType: "term",
        position: 0,
      },
    ];

    expect(
      validateProjectionOffsets(records, "กิน ข้าว", [0, 1, 2, 3, 6, 7, 8, 9]),
    ).toEqual({ isValid: true, errors: [] });
  });

  it("reports token, position, and source range drift", () => {
    const records: SearchProjectionRecord[] = [
      {
        token: "ผิด",
        normalizedStart: 4,
        normalizedEnd: 8,
        originalStart: 4,
        originalEnd: 8,
        tokenType: "term",
        position: 2,
      },
    ];

    const result = validateProjectionOffsets(
      records,
      "กิน ข้าว",
      [0, 1, 2, 3, 6, 7, 8, 9],
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      "Record 0 has unstable position 2.",
      "Record 0 token does not match normalized text.",
      "Record 0 original offsets do not match index map.",
    ]);
  });

  it("maps normalized ranges to original ranges through sparse index maps", () => {
    expect(
      mapNormalizedRangeToOriginalRange(4, 8, [0, 1, 2, 3, 6, 7, 8, 9]),
    ).toEqual({
      normalizedStart: 4,
      normalizedEnd: 8,
      originalStart: 6,
      originalEnd: 10,
    });
  });
});
