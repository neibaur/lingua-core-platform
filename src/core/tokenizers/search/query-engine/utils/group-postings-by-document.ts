import type { PostingRecord } from "../../index-primitives";

export function groupPostingsByDocument(
  postings: readonly PostingRecord[],
): ReadonlyMap<string, readonly PostingRecord[]> {
  const postingsByDocument = new Map<string, PostingRecord[]>();

  for (const posting of postings) {
    const documentPostings = postingsByDocument.get(posting.documentId) ?? [];

    documentPostings.push({ ...posting });
    postingsByDocument.set(posting.documentId, documentPostings);
  }

  return new Map(
    [...postingsByDocument.entries()]
      .sort(([leftDocumentId], [rightDocumentId]) =>
        leftDocumentId.localeCompare(rightDocumentId),
      )
      .map(([documentId, documentPostings]) => [
        documentId,
        Object.freeze(documentPostings.sort(comparePostings)),
      ]),
  );
}

export function comparePostings(left: PostingRecord, right: PostingRecord) {
  return (
    left.documentId.localeCompare(right.documentId) ||
    left.position - right.position ||
    left.normalizedStart - right.normalizedStart ||
    left.originalStart - right.originalStart
  );
}
