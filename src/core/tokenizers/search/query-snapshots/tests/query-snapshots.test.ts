import { describe, expect, it } from "vitest";

import { CorpusIndexer } from "../../index-primitives";
import type { SearchCorpus } from "../../index-primitives";
import { executeQueryPipeline } from "../../query-pipeline";
import type {
  ExecutionPlanSnapshot,
  QueryExecutionTraceSnapshot,
} from "../contracts";
import { verifyCanonicalStructuralEquivalence } from "../equivalence";
import {
  createQueryReplaySnapshot,
  createQuerySnapshotBundle,
  deserializeQueryReplaySnapshot,
  deserializeQuerySnapshotBundle,
  reconstructQueryReplaySnapshot,
  replayQuerySnapshotBundle,
} from "../reconstruction";
import { stableJsonStringify } from "../stable-json";
import {
  validateQueryReplaySnapshot,
  validateQuerySnapshotBundle,
} from "../validate";

const GIN = "\u0e01\u0e34\u0e19";
const KHAO = "\u0e02\u0e49\u0e32\u0e27";

describe("query snapshots", () => {
  it("validates deterministic replay snapshot envelopes", () => {
    const snapshot = buildExecutionPlanSnapshot();
    const result = validateQueryReplaySnapshot(snapshot);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.snapshotId).toBe("query-snapshot-0");
      expect(result.data.artifactKind).toBe("execution-plan");
    }
  });

  it("rejects malformed snapshots with deterministic diagnostics", () => {
    const result = validateQueryReplaySnapshot({
      schemaVersion: "query-snapshot-v0",
      artifactKind: "optimizer-plan",
      snapshotId: "snapshot-runtime",
      artifact: [],
    });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_INVALID_SCHEMA_VERSION",
          severity: "error",
          path: "$.schemaVersion",
          message: "Snapshot schemaVersion must be query-snapshot-v1.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT_KIND",
          severity: "error",
          path: "$.artifactKind",
          message: "Snapshot artifactKind is not supported.",
        },
        {
          code: "SNAPSHOT_INVALID_SNAPSHOT_ID",
          severity: "error",
          path: "$.snapshotId",
          message:
            "Snapshot snapshotId must use the query-snapshot-{number} format.",
        },
        {
          code: "SNAPSHOT_INVALID_ARTIFACT",
          severity: "error",
          path: "$.artifact",
          message: "Snapshot artifact must be a plain object.",
        },
      ],
    });
  });

  it("rejects non-json-safe structures without throwing", () => {
    const result = validateQueryReplaySnapshot({
      schemaVersion: "query-snapshot-v1",
      artifactKind: "execution-plan",
      snapshotId: "query-snapshot-0",
      artifact: {
        invalid: Number.POSITIVE_INFINITY,
      },
    });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_NON_JSON_SAFE",
          severity: "error",
          path: "$.artifact.invalid",
          message: "Snapshot value must be a finite JSON number.",
        },
      ],
    });
  });

  it("rejects circular structures deterministically", () => {
    const circularValue: Record<string, unknown> = {
      schemaVersion: "query-snapshot-v1",
      artifactKind: "execution-plan",
      snapshotId: "query-snapshot-0",
      artifact: {},
    };
    circularValue.self = circularValue;

    const result = validateQueryReplaySnapshot(circularValue);

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_NON_JSON_SAFE",
          severity: "error",
          path: "$.self",
          message: "Snapshot value must not contain circular references.",
        },
      ],
    });
  });

  it("preserves canonical serialization order while preserving array order", () => {
    const serialized = stableJsonStringify({
      z: [{ b: 2, a: 1 }],
      a: {
        d: 4,
        c: 3,
      },
    });

    expect(serialized).toBe('{"a":{"c":3,"d":4},"z":[{"a":1,"b":2}]}');
  });

  it("reconstructs immutable snapshots from canonical serialized data", () => {
    const snapshot = buildExecutionPlanSnapshot();
    const serialized = stableJsonStringify(snapshot);
    const reconstructed = deserializeQueryReplaySnapshot(serialized);

    expect(reconstructed.success).toBe(true);
    if (reconstructed.success) {
      expect(reconstructed.data.artifactKind).toBe("execution-plan");
      if (reconstructed.data.artifactKind !== "execution-plan") {
        return;
      }

      expect(reconstructed.data).toEqual(snapshot);
      expect(Object.isFrozen(reconstructed.data)).toBe(true);
      expect(Object.isFrozen(reconstructed.data.artifact)).toBe(true);
      expect(reconstructed.data.artifact.metadata.sourceSpan).toEqual({
        start: 0,
        end: 12,
      });
    }
  });

  it("returns deterministic serialization diagnostics during deserialization", () => {
    const result = deserializeQueryReplaySnapshot("{");

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_INVALID_SERIALIZATION",
          severity: "error",
          path: "$",
          message:
            "Serialized snapshot input must be valid canonical JSON-safe data.",
        },
      ],
    });
  });

  it("validates and replays snapshot bundles in stable order", () => {
    const planSnapshot = buildExecutionPlanSnapshot();
    const traceSnapshot = buildTraceSnapshot();
    const bundleResult = createQuerySnapshotBundle([
      planSnapshot,
      traceSnapshot,
    ]);

    expect(bundleResult.success).toBe(true);
    if (!bundleResult.success) {
      return;
    }

    const serialized = stableJsonStringify(bundleResult.data);
    const deserialized = deserializeQuerySnapshotBundle(serialized);

    expect(validateQuerySnapshotBundle(bundleResult.data).success).toBe(true);
    expect(deserialized.success).toBe(true);
    if (deserialized.success) {
      const replayed = replayQuerySnapshotBundle(deserialized.data);

      expect(replayed.success).toBe(true);
      if (replayed.success) {
        expect(
          replayed.data.snapshots.map((snapshot) => snapshot.snapshotId),
        ).toEqual(["query-snapshot-0", "query-snapshot-1"]);
      }
    }
  });

  it("verifies canonical structural equivalence as bit-for-bit serialization", () => {
    const result = verifyCanonicalStructuralEquivalence(
      {
        b: 2,
        a: {
          d: 4,
          c: 3,
        },
      },
      {
        a: {
          c: 3,
          d: 4,
        },
        b: 2,
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.equivalent).toBe(true);
      expect(result.data.serializedLeft).toBe('{"a":{"c":3,"d":4},"b":2}');
      expect(result.data.serializedRight).toBe('{"a":{"c":3,"d":4},"b":2}');
    }
  });

  it("rejects canonical structural non-equivalence deterministically", () => {
    const result = verifyCanonicalStructuralEquivalence({ a: 1 }, { a: 2 });

    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: "SNAPSHOT_NOT_EQUIVALENT",
          severity: "error",
          path: "$",
          message: "Canonical snapshot serialization outputs differ.",
        },
      ],
    });
  });

  it("reconstructs already parsed snapshots without mutating provenance", () => {
    const snapshot = buildExecutionPlanSnapshot();
    const reconstructed = reconstructQueryReplaySnapshot(snapshot);

    expect(reconstructed.success).toBe(true);
    if (reconstructed.success) {
      expect(reconstructed.data.artifactKind).toBe("execution-plan");
      if (reconstructed.data.artifactKind !== "execution-plan") {
        return;
      }

      expect(reconstructed.data.artifact.root.sourceSpan).toEqual({
        start: 0,
        end: 12,
      });
      expect(snapshot.artifact.root.sourceSpan).toEqual({
        start: 0,
        end: 12,
      });
    }
  });
});

function buildExecutionPlanSnapshot(): ExecutionPlanSnapshot {
  const result = executeQueryPipeline({
    rawQuery: `${GIN} AND ${KHAO}`,
    corpus: buildCorpus(),
    options: { explain: true, trace: true },
  });
  const snapshot = createQueryReplaySnapshot(
    "execution-plan",
    result.metadata.executionPlan,
    0,
  );

  if (!snapshot.success) {
    throw new Error("Test fixture snapshot must be valid.");
  }

  return snapshot.data as ExecutionPlanSnapshot;
}

function buildTraceSnapshot(): QueryExecutionTraceSnapshot {
  const result = executeQueryPipeline({
    rawQuery: `${GIN} AND ${KHAO}`,
    corpus: buildCorpus(),
    options: { explain: true, trace: true },
  });
  const snapshot = createQueryReplaySnapshot(
    "query-execution-trace",
    result.executionTrace,
    1,
  );

  if (!snapshot.success) {
    throw new Error("Test fixture snapshot must be valid.");
  }

  return snapshot.data as QueryExecutionTraceSnapshot;
}

function buildCorpus(): SearchCorpus {
  return new CorpusIndexer()
    .addDocument({
      documentId: "doc-1",
      identifier: "/doc-1",
      sourceLength: 8,
      projections: [
        projection(GIN, 0, 0, 3, 0, 3),
        projection(KHAO, 1, 3, 8, 3, 8),
      ],
    })
    .build();
}

function projection(
  token: string,
  position: number,
  normalizedStart: number,
  normalizedEnd: number,
  originalStart: number,
  originalEnd: number,
) {
  return {
    token,
    position,
    normalizedStart,
    normalizedEnd,
    originalStart,
    originalEnd,
    tokenType: "term" as const,
  };
}
