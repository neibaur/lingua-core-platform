export type DeepReadonlySerializable<T> = T extends
  | string
  | number
  | boolean
  | null
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepReadonlySerializable<U>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonlySerializable<T[K]> }
      : never;

export function deepFreeze<T>(value: T): DeepReadonlySerializable<T> {
  return freezeValue(value) as DeepReadonlySerializable<T>;
}

function freezeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => freezeValue(item)));
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).map(([key, entryValue]) => {
      return [key, freezeValue(entryValue)] as const;
    });

    return Object.freeze(Object.fromEntries(entries));
  }

  return value;
}

export function copySourceSpan<
  TSourceSpan extends { readonly start: number; readonly end: number },
>(sourceSpan: TSourceSpan): TSourceSpan {
  return deepFreeze({
    start: sourceSpan.start,
    end: sourceSpan.end,
  }) as TSourceSpan;
}
