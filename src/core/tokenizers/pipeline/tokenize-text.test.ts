import { describe, expect, it } from "vitest";

import { MockTokenizerDriver } from "../drivers/mock";
import { tokenizeText } from "./tokenize-text";

describe("tokenizeText", () => {
  it("delegates tokenization to the provided driver strategy", async () => {
    const driver = new MockTokenizerDriver({
      romanizationByToken: {
        กิน: "kin",
      },
    });

    const result = await tokenizeText(driver, "กิน ข้าว test");

    expect(result.originalText).toBe("กิน ข้าว test");
    expect(result.tokens.map((token) => token.surface)).toEqual([
      "กิน",
      "ข้าว",
      "test",
    ]);
    expect(result.normalizedTokens[0]).toEqual({
      original: "กิน",
      normalized: "กิน",
      romanized: "kin",
    });
  });
});
