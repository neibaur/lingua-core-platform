import type { MatchedDocument } from "../shared/query-types";

export function intersectMatchedDocuments(
  resultSets: readonly (readonly MatchedDocument[])[],
): MatchedDocument[] {
  if (resultSets.length === 0) {
    return [];
  }

  const commonDocumentIds = resultSets
    .map((matches) => new Set(matches.map((match) => match.documentId)))
    .reduce((leftIds, rightIds) => {
      return new Set(
        [...leftIds].filter((documentId) => rightIds.has(documentId)),
      );
    });

  return [...commonDocumentIds]
    .sort((leftDocumentId, rightDocumentId) =>
      leftDocumentId.localeCompare(rightDocumentId),
    )
    .map((documentId) => {
      const documentMatches = resultSets.flatMap((matches) =>
        matches.filter((match) => match.documentId === documentId),
      );

      return mergeDocumentMatches(documentId, documentMatches);
    });
}

export function unionMatchedDocuments(
  resultSets: readonly (readonly MatchedDocument[])[],
): MatchedDocument[] {
  const matchesByDocument = new Map<string, MatchedDocument[]>();

  for (const resultSet of resultSets) {
    for (const match of resultSet) {
      const documentMatches = matchesByDocument.get(match.documentId) ?? [];

      documentMatches.push(match);
      matchesByDocument.set(match.documentId, documentMatches);
    }
  }

  return [...matchesByDocument.entries()]
    .sort(([leftDocumentId], [rightDocumentId]) =>
      leftDocumentId.localeCompare(rightDocumentId),
    )
    .map(([documentId, matches]) => mergeDocumentMatches(documentId, matches));
}

export function mergeDocumentMatches(
  documentId: string,
  matches: readonly MatchedDocument[],
): MatchedDocument {
  const tokenPositions = [
    ...new Set(matches.flatMap((match) => [...match.tokenPositions])),
  ].sort((leftPosition, rightPosition) => leftPosition - rightPosition);
  const spans = matches
    .flatMap((match) => [...match.spans])
    .sort(
      (left, right) =>
        left.normalizedStart - right.normalizedStart ||
        left.originalStart - right.originalStart ||
        left.normalizedEnd - right.normalizedEnd ||
        left.originalEnd - right.originalEnd,
    );

  return {
    documentId,
    tokenPositions,
    spans,
  };
}
