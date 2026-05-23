import { describe, expect, it } from "vitest";

import { assertNoWhitespace } from "./assert-no-whitespace";

describe("assertNoWhitespace", () => {
  it("throws on leading space", () => {
    expect(() => {
      assertNoWhitespace(" กิน");
    }).toThrow("[lexical invariant]");
  });

  it("throws on trailing space", () => {
    expect(() => {
      assertNoWhitespace("กิน ");
    }).toThrow("[lexical invariant]");
  });

  it("throws on interior space", () => {
    expect(() => {
      assertNoWhitespace("กิน ข้าว");
    }).toThrow("[lexical invariant]");
  });

  it("throws on tab character", () => {
    expect(() => {
      assertNoWhitespace("กิน\tข้าว");
    }).toThrow("[lexical invariant]");
  });

  it("throws on newline character", () => {
    expect(() => {
      assertNoWhitespace("กิน\nข้าว");
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only input", () => {
    expect(() => {
      assertNoWhitespace("   ");
    }).toThrow("[lexical invariant]");
  });

  it("does not throw for a clean Thai string", () => {
    expect(() => {
      assertNoWhitespace("กินข้าว");
    }).not.toThrow();
  });

  it("does not throw for a clean ASCII string", () => {
    expect(() => {
      assertNoWhitespace("hello");
    }).not.toThrow();
  });

  it("does not throw for an empty string", () => {
    expect(() => {
      assertNoWhitespace("");
    }).not.toThrow();
  });

  it("includes the field name in the error message when provided", () => {
    expect(() => {
      assertNoWhitespace(" x", "headword");
    }).toThrow("headword");
  });

  it("includes the offending key in the error message", () => {
    expect(() => {
      assertNoWhitespace("กิน ข้าว", "query");
    }).toThrow(JSON.stringify("กิน ข้าว"));
  });
});
