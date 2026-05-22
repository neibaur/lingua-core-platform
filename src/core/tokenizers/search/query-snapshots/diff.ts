import type {
  JsonObject,
  JsonValue,
  QueryReplayDiffEntry,
  QueryReplayDiffKind,
  QueryReplayDiffResult,
  QueryReplayDiffValue,
} from "./contracts";
import {
  createQuerySnapshotDiagnostic,
  createQuerySnapshotFailure,
  createQuerySnapshotSuccess,
  type QuerySnapshotValidationResult,
} from "./diagnostics";
import { canonicalizeJsonValue, stableJsonStringify } from "./stable-json";
import { validateJsonSafeStructure } from "./validate";

export function diffQueryReplaySnapshots(
  left: unknown,
  right: unknown,
): QuerySnapshotValidationResult<QueryReplayDiffResult> {
  const diagnostics = Object.freeze([
    ...validateJsonSafeStructure(left, "$.left"),
    ...validateJsonSafeStructure(right, "$.right"),
  ]);

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  if (!isJsonObject(left) || !isJsonObject(right)) {
    return createQuerySnapshotFailure([
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_MALFORMED_ENVELOPE",
        "$",
        "Replay diff requires two snapshot envelope objects.",
      ),
    ]);
  }

  const serializedLeft = stableJsonStringify(left);
  const serializedRight = stableJsonStringify(right);
  const equivalent = serializedLeft === serializedRight;
  const compatible =
    left.schemaVersion === right.schemaVersion &&
    left.artifactKind === right.artifactKind;
  const diffs = equivalent ? [] : collectDiffEntries(left, right, "$");

  return createQuerySnapshotSuccess(
    Object.freeze({
      classification: equivalent
        ? "equivalent"
        : compatible
          ? "different"
          : "incompatible",
      equivalent,
      compatible,
      serializedLeft,
      serializedRight,
      diffs: Object.freeze(diffs),
    }),
  );
}

export function diffJsonValues(
  left: unknown,
  right: unknown,
): QuerySnapshotValidationResult<readonly QueryReplayDiffEntry[]> {
  const diagnostics = Object.freeze([
    ...validateJsonSafeStructure(left, "$.left"),
    ...validateJsonSafeStructure(right, "$.right"),
  ]);

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  return createQuerySnapshotSuccess(
    Object.freeze(
      collectDiffEntries(left as JsonValue, right as JsonValue, "$"),
    ),
  );
}

function collectDiffEntries(
  left: JsonValue,
  right: JsonValue,
  path: string,
): readonly QueryReplayDiffEntry[] {
  if (stableJsonStringify(left) === stableJsonStringify(right)) {
    return Object.freeze([]);
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return collectArrayDiffEntries(left, right, path);
  }

  if (isJsonObject(left) && isJsonObject(right)) {
    return collectObjectDiffEntries(left, right, path);
  }

  return Object.freeze([
    createDiffEntry(path, classifyDiffKind(path), left, right),
  ]);
}

function collectArrayDiffEntries(
  left: readonly JsonValue[],
  right: readonly JsonValue[],
  path: string,
): readonly QueryReplayDiffEntry[] {
  const diffs: QueryReplayDiffEntry[] = [];
  const itemCount = Math.max(left.length, right.length);

  for (let index = 0; index < itemCount; index += 1) {
    const itemPath = `${path}[${String(index)}]`;
    const leftHasValue = index < left.length;
    const rightHasValue = index < right.length;

    if (!leftHasValue || !rightHasValue) {
      diffs.push(
        createPresenceDiffEntry(
          itemPath,
          leftHasValue ? left[index] : undefined,
          rightHasValue ? right[index] : undefined,
        ),
      );
    } else {
      diffs.push(...collectDiffEntries(left[index], right[index], itemPath));
    }
  }

  return Object.freeze(diffs);
}

function collectObjectDiffEntries(
  left: JsonObject,
  right: JsonObject,
  path: string,
): readonly QueryReplayDiffEntry[] {
  const diffs: QueryReplayDiffEntry[] = [];
  const keys = Object.freeze(
    [...new Set([...Object.keys(left), ...Object.keys(right)])].sort(
      compareJsonObjectKeys,
    ),
  );

  keys.forEach((key) => {
    const propertyPath = `${path}.${key}`;
    const leftHasValue = hasJsonObjectKey(left, key);
    const rightHasValue = hasJsonObjectKey(right, key);

    if (!leftHasValue || !rightHasValue) {
      diffs.push(
        createPresenceDiffEntry(
          propertyPath,
          leftHasValue ? left[key] : undefined,
          rightHasValue ? right[key] : undefined,
        ),
      );
    } else {
      diffs.push(...collectDiffEntries(left[key], right[key], propertyPath));
    }
  });

  return Object.freeze(diffs);
}

function createPresenceDiffEntry(
  path: string,
  left: JsonValue | undefined,
  right: JsonValue | undefined,
): QueryReplayDiffEntry {
  return Object.freeze({
    path,
    kind: classifyDiffKind(path),
    left: createDiffValue(left),
    right: createDiffValue(right),
  });
}

function createDiffEntry(
  path: string,
  kind: QueryReplayDiffKind,
  left: JsonValue,
  right: JsonValue,
): QueryReplayDiffEntry {
  return Object.freeze({
    path,
    kind,
    left: createDiffValue(left),
    right: createDiffValue(right),
  });
}

function createDiffValue(value: JsonValue | undefined): QueryReplayDiffValue {
  if (value === undefined) {
    return Object.freeze({
      present: false as const,
    });
  }

  return Object.freeze({
    present: true as const,
    value: canonicalizeJsonValue(value),
  });
}

function classifyDiffKind(path: string): QueryReplayDiffKind {
  if (path === "$.schemaVersion") {
    return "schema-version";
  }

  if (path === "$.artifactKind") {
    return "artifact-kind";
  }

  if (path === "$.snapshotId") {
    return "snapshot-id";
  }

  if (
    path.includes("sourceSpan") ||
    path.endsWith(".start") ||
    path.endsWith(".end")
  ) {
    return "provenance";
  }

  return "structural";
}

function compareJsonObjectKeys(leftKey: string, rightKey: string): number {
  if (leftKey < rightKey) {
    return -1;
  }

  if (leftKey > rightKey) {
    return 1;
  }

  return 0;
}

function isJsonObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasJsonObjectKey(value: JsonObject, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}
