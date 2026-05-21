import type { JsonObject, JsonValue } from "./contracts";

export function stableJsonStringify(value: unknown): string {
  const canonicalValue = canonicalizeJsonValue(value);

  return JSON.stringify(canonicalValue);
}

export function stableJsonParse(serializedValue: string): JsonValue {
  return canonicalizeJsonValue(JSON.parse(serializedValue) as unknown);
}

export function canonicalizeJsonValue(value: unknown): JsonValue {
  assertJsonValue(value, "$");

  return sortJsonValue(value);
}

export function assertJsonValue(
  value: unknown,
  path: string,
): asserts value is JsonValue {
  if (value === null) {
    return;
  }

  switch (typeof value) {
    case "string":
    case "boolean":
      return;
    case "number":
      if (Number.isFinite(value)) {
        return;
      }

      throw new TypeError(`${path} must be a finite JSON number.`);
    case "object":
      assertJsonObjectOrArray(value, path);
      return;
    default:
      throw new TypeError(`${path} must be JSON-safe data.`);
  }
}

function assertJsonObjectOrArray(value: object, path: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assertJsonValue(item, `${path}[${String(index)}]`);
    });
    return;
  }

  if (!isPlainJsonObject(value)) {
    throw new TypeError(`${path} must be a plain JSON object.`);
  }

  Object.entries(value).forEach(([key, entryValue]) => {
    assertJsonValue(entryValue, `${path}.${key}`);
  });
}

function sortJsonValue(value: JsonValue): JsonValue {
  if (isJsonArray(value)) {
    return Object.freeze(value.map((item) => sortJsonValue(item)));
  }

  if (isJsonObjectValue(value)) {
    const sortedObject: Record<string, JsonValue> = {};

    Object.keys(value)
      .sort(compareJsonObjectKeys)
      .forEach((key) => {
        const entryValue = value[key];

        sortedObject[key] = sortJsonValue(entryValue);
      });

    return Object.freeze(sortedObject);
  }

  return value;
}

function isJsonArray(value: JsonValue): value is readonly JsonValue[] {
  return Array.isArray(value);
}

function isJsonObjectValue(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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

function isPlainJsonObject(value: object): boolean {
  const prototype = Reflect.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}
