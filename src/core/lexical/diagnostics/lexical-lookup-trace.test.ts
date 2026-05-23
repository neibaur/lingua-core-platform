import { describe, expect, it } from "vitest";

import { THAI_ENGLISH_FIXTURE_DATASET } from "../datasets/thai-english/thai-english-fixture-dataset";
import { composeLexicalIndex } from "../index/lexical-index";
import { composeLexicalLookup } from "../lookup/lexical-lookup";
import {
  LEXICAL_LOOKUP_TRACE_SCHEMA_VERSION,
  composeLexicalLookupTrace,
} from "./lexical-lookup-trace";

function buildFixtureIndex() {
  return composeLexicalIndex({
    lexicalIndexId: "test-index",
    entries: THAI_ENGLISH_FIXTURE_DATASET,
  });
}

function buildFoundResult() {
  return composeLexicalLookup(
    { query: "กิน", direction: "th→en", lexicalIndexId: "test-index" },
    buildFixtureIndex(),
  );
}

function buildNotFoundResult() {
  return composeLexicalLookup(
    { query: "xyz", direction: "en→th", lexicalIndexId: "test-index" },
    buildFixtureIndex(),
  );
}

function buildEmptyIndexResult() {
  const emptyIndex = composeLexicalIndex({
    lexicalIndexId: "empty-index",
    entries: [],
  });
  return composeLexicalLookup(
    { query: "กิน", direction: "th→en", lexicalIndexId: "empty-index" },
    emptyIndex,
  );
}

describe("composeLexicalLookupTrace", () => {
  it("returns the correct schemaVersion constant", () => {
    const trace = composeLexicalLookupTrace({
      traceId: "trace-001",
      result: buildFoundResult(),
    });

    expect(trace.schemaVersion).toBe(LEXICAL_LOOKUP_TRACE_SCHEMA_VERSION);
  });

  it("evaluationTimestamp is null", () => {
    const trace = composeLexicalLookupTrace({
      traceId: "trace-001",
      result: buildFoundResult(),
    });

    expect(trace.evaluationTimestamp).toBeNull();
  });

  it("maps traceId from input", () => {
    const trace = composeLexicalLookupTrace({
      traceId: "trace-abc",
      result: buildFoundResult(),
    });

    expect(trace.traceId).toBe("trace-abc");
  });

  it("maps query and direction from the result", () => {
    const result = buildFoundResult();
    const trace = composeLexicalLookupTrace({ traceId: "t1", result });

    expect(trace.query).toBe(result.query);
    expect(trace.direction).toBe(result.direction);
  });

  it("maps entryCount from result entries length", () => {
    const result = buildFoundResult();
    const trace = composeLexicalLookupTrace({ traceId: "t1", result });

    expect(trace.entryCount).toBe(result.entries.length);
  });

  it("maps diagnosticCount from result diagnostics length", () => {
    const result = buildNotFoundResult();
    const trace = composeLexicalLookupTrace({ traceId: "t1", result });

    expect(trace.diagnosticCount).toBe(result.diagnostics.length);
  });

  it("resolves resultStatus as 'found' when entries exist", () => {
    const trace = composeLexicalLookupTrace({
      traceId: "t1",
      result: buildFoundResult(),
    });

    expect(trace.resultStatus).toBe("found");
  });

  it("resolves resultStatus as 'not-found' when entries are empty and no empty-index diagnostic", () => {
    const trace = composeLexicalLookupTrace({
      traceId: "t1",
      result: buildNotFoundResult(),
    });

    expect(trace.resultStatus).toBe("not-found");
  });

  it("resolves resultStatus as 'empty-index' when LEXICAL_INDEX_EMPTY diagnostic is present", () => {
    const trace = composeLexicalLookupTrace({
      traceId: "t1",
      result: buildEmptyIndexResult(),
    });

    expect(trace.resultStatus).toBe("empty-index");
  });

  it("returns a deeply frozen trace", () => {
    const trace = composeLexicalLookupTrace({
      traceId: "t1",
      result: buildFoundResult(),
    });

    expect(Object.isFrozen(trace)).toBe(true);
    expect(Object.isFrozen(trace.diagnostics)).toBe(true);
  });

  it("nested diagnostic objects in the trace are frozen", () => {
    const result = buildNotFoundResult();
    const trace = composeLexicalLookupTrace({ traceId: "t1", result });

    for (const d of trace.diagnostics) {
      expect(Object.isFrozen(d)).toBe(true);
    }
  });

  it("clones diagnostics so the trace array is independent of the source result", () => {
    const result = buildNotFoundResult();
    const trace = composeLexicalLookupTrace({ traceId: "t1", result });

    expect(trace.diagnostics).toEqual(result.diagnostics);
    expect(trace.diagnostics).not.toBe(result.diagnostics);
  });

  it("is JSON round-trip safe", () => {
    const trace = composeLexicalLookupTrace({
      traceId: "t1",
      result: buildFoundResult(),
    });

    expect(() => {
      JSON.stringify(trace);
    }).not.toThrow();

    const roundTripped = JSON.parse(JSON.stringify(trace)) as typeof trace;

    expect(roundTripped.schemaVersion).toBe(trace.schemaVersion);
    expect(roundTripped.traceId).toBe(trace.traceId);
    expect(roundTripped.evaluationTimestamp).toBeNull();
    expect(roundTripped.resultStatus).toBe(trace.resultStatus);
  });

  it("identical inputs produce structurally equal traces", () => {
    const result = buildFoundResult();
    const a = composeLexicalLookupTrace({ traceId: "t1", result });
    const b = composeLexicalLookupTrace({ traceId: "t1", result });

    expect(a).toEqual(b);
  });

  it("repeated ordering of the same result produces structurally equal traces", () => {
    const result = buildNotFoundResult();

    expect(composeLexicalLookupTrace({ traceId: "t1", result })).toEqual(
      composeLexicalLookupTrace({ traceId: "t1", result }),
    );
  });

  it("throws on empty traceId", () => {
    expect(() => {
      composeLexicalLookupTrace({ traceId: "", result: buildFoundResult() });
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only traceId", () => {
    expect(() => {
      composeLexicalLookupTrace({
        traceId: "   ",
        result: buildFoundResult(),
      });
    }).toThrow("[lexical invariant]");
  });
});
