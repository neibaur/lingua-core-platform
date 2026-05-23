import { describe, expect, it } from "vitest";

import { thaiToneMarkNormalizationRule } from "./thai-tone-mark-normalization-rule";

describe("thaiToneMarkNormalizationRule", () => {
  it("produces identical output when input is already in NFC", () => {
    const input = { text: "กินข้าว", indexMap: [0, 1, 2, 3, 4, 5, 6] };
    const result = thaiToneMarkNormalizationRule.apply(input);

    expect(result.text).toBe("กินข้าว");
    expect(result.indexMap).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("round-trips: applying NFC twice yields the same output as applying it once", () => {
    const raw = "น้ำ";
    const input = {
      text: raw,
      indexMap: Array.from({ length: raw.length }, (_, i) => i),
    };

    const once = thaiToneMarkNormalizationRule.apply(input);
    const twice = thaiToneMarkNormalizationRule.apply({
      text: once.text,
      indexMap: once.indexMap,
    });

    expect(twice.text).toBe(once.text);
    expect(twice.indexMap).toEqual(once.indexMap);
  });

  it("normalizes NFD-decomposed Latin combining sequence to NFC form", () => {
    // 'e' + U+0301 (combining acute accent) → 'é' in NFC
    const decomposed = "é";
    const input = { text: decomposed, indexMap: [0, 1] };
    const result = thaiToneMarkNormalizationRule.apply(input);

    expect(result.text).toBe("é"); // precomposed 'é'
    expect(result.text.length).toBe(1);
    expect(result.indexMap).toEqual([0]);
  });

  it("preserves IndexMap length equality with output text length after composition", () => {
    const decomposed = "éá";
    const input = { text: decomposed, indexMap: [0, 1, 2, 3] };
    const result = thaiToneMarkNormalizationRule.apply(input);

    expect(result.indexMap.length).toBe(result.text.length);
  });

  it("maps each composed NFC character to the first original source position", () => {
    // 'a' + combining acute → 'á'; 'o' + combining grave → 'ò'
    const decomposed = "áò";
    const input = { text: decomposed, indexMap: [10, 11, 20, 21] };
    const result = thaiToneMarkNormalizationRule.apply(input);

    // 'á' composed from positions 10 and 11 → takes index 10
    expect(result.indexMap[0]).toBe(10);
    // 'ò' composed from positions 20 and 21 → takes index 20
    expect(result.indexMap[1]).toBe(20);
  });

  it("preserves identity for pure ASCII input", () => {
    const input = { text: "hello", indexMap: [0, 1, 2, 3, 4] };
    const result = thaiToneMarkNormalizationRule.apply(input);

    expect(result.text).toBe("hello");
    expect(result.indexMap).toEqual([0, 1, 2, 3, 4]);
  });

  it("preserves identity for empty input", () => {
    const input = { text: "", indexMap: [] };
    const result = thaiToneMarkNormalizationRule.apply(input);

    expect(result.text).toBe("");
    expect(result.indexMap).toEqual([]);
  });

  it("produces the same canonical output for visually identical Thai strings with different byte orderings", () => {
    // Both represent กิน in NFC; NFC of either should be identical
    const formA = "กินข้าว".normalize("NFC");
    const formB = "กินข้าว".normalize("NFD").normalize("NFC");

    const inputA = {
      text: formA,
      indexMap: Array.from({ length: formA.length }, (_, i) => i),
    };
    const inputB = {
      text: formB,
      indexMap: Array.from({ length: formB.length }, (_, i) => i),
    };

    const resultA = thaiToneMarkNormalizationRule.apply(inputA);
    const resultB = thaiToneMarkNormalizationRule.apply(inputB);

    expect(resultA.text).toBe(resultB.text);
    expect(resultA.text.length).toBe(resultB.text.length);
  });
});
