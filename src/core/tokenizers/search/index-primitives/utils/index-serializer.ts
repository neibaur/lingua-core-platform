import {
  SEARCH_CORPUS_FORMAT_VERSION,
  type CorpusDocument,
  type InvertedIndex,
  type PostingRecord,
  type SearchCorpus,
} from "../shared/index-types";

export function serializeSearchCorpus(corpus: SearchCorpus): string {
  return `${JSON.stringify(canonicalizeSearchCorpus(corpus), null, 2)}\n`;
}

export function deserializeSearchCorpus(
  serializedCorpus: string,
): SearchCorpus {
  const parsedCorpus = JSON.parse(serializedCorpus) as Partial<SearchCorpus>;

  if (parsedCorpus.formatVersion !== SEARCH_CORPUS_FORMAT_VERSION) {
    throw new Error(
      `Unsupported search corpus format version: ${String(
        parsedCorpus.formatVersion,
      )}`,
    );
  }

  return canonicalizeSearchCorpus(parsedCorpus as SearchCorpus);
}

export function canonicalizeSearchCorpus(corpus: SearchCorpus): SearchCorpus {
  const documents = sortDocumentRegistry(corpus.documents);
  const invertedIndex = sortInvertedIndex(corpus.invertedIndex);

  return Object.freeze({
    formatVersion: SEARCH_CORPUS_FORMAT_VERSION,
    documents,
    invertedIndex,
    statistics: Object.freeze({
      documentCount: Object.keys(documents).length,
      totalDistinctTokens: Object.keys(invertedIndex).length,
      totalTokenOccurrences: Object.values(invertedIndex).reduce(
        (total, postings) => total + postings.length,
        0,
      ),
    }),
  });
}

function sortDocumentRegistry(
  documents: Record<string, CorpusDocument>,
): Record<string, CorpusDocument> {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(documents)
        .sort(([leftDocumentId], [rightDocumentId]) =>
          leftDocumentId.localeCompare(rightDocumentId),
        )
        .map(([documentId, document]) => [
          documentId,
          Object.freeze({ ...document }),
        ]),
    ),
  );
}

function sortInvertedIndex(invertedIndex: InvertedIndex): InvertedIndex {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(invertedIndex)
        .sort(([leftToken], [rightToken]) =>
          leftToken.localeCompare(rightToken),
        )
        .map(([token, postings]) => [
          token,
          Object.freeze(
            postings
              .map((posting) => Object.freeze({ ...posting }))
              .sort(comparePostings),
          ),
        ]),
    ),
  );
}

function comparePostings(left: PostingRecord, right: PostingRecord) {
  return (
    left.documentId.localeCompare(right.documentId) ||
    left.position - right.position ||
    left.normalizedStart - right.normalizedStart ||
    left.originalStart - right.originalStart
  );
}
