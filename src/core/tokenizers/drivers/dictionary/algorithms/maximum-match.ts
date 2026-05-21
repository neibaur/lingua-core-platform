import type { Token } from "../../../shared/token-types";

export interface MaximumMatchDictionaryEntry {
  surface: string;
}

export function forwardMaximumMatch(
  input: string,
  dictionary: readonly MaximumMatchDictionaryEntry[],
): Token[] {
  const dictionarySurfaces = dictionary
    .map((entry) => entry.surface)
    .filter((surface) => surface.length > 0)
    .sort(
      (left, right) => right.length - left.length || left.localeCompare(right),
    );
  const tokens: Token[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const surface =
      dictionarySurfaces.find((candidate) =>
        input.startsWith(candidate, cursor),
      ) ?? input[cursor];

    tokens.push({
      surface,
      startOffset: cursor,
      endOffset: cursor + surface.length,
    });

    cursor += Math.max(surface.length, 1);
  }

  return tokens;
}
