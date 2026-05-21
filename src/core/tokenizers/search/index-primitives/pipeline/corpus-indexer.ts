import type { SearchProjectionRecord } from "../../shared/search-projection-record";
import {
  SEARCH_CORPUS_FORMAT_VERSION,
  type CorpusDocument,
  type InvertedIndex,
  type PostingRecord,
  type SearchCorpus,
} from "../shared/index-types";

export interface CorpusIndexDocumentInput {
  documentId: string;
  identifier: string;
  sourceLength: number;
  projections: readonly SearchProjectionRecord[];
}

export class CorpusIndexer {
  private readonly documents = new Map<string, CorpusDocument>();
  private readonly identifiers = new Set<string>();
  private readonly postingsByToken = new Map<string, PostingRecord[]>();
  private tokenOccurrenceCount = 0;

  addDocument(input: CorpusIndexDocumentInput): this {
    if (this.documents.has(input.documentId)) {
      throw new Error(`Duplicate corpus document ID: ${input.documentId}`);
    }

    if (this.identifiers.has(input.identifier)) {
      throw new Error(
        `Duplicate corpus document identifier: ${input.identifier}`,
      );
    }

    this.documents.set(input.documentId, {
      documentId: input.documentId,
      identifier: input.identifier,
      sourceLength: input.sourceLength,
    });
    this.identifiers.add(input.identifier);

    let indexedPosition = 0;

    for (const projection of input.projections) {
      if (projection.token.trim() === "") {
        continue;
      }

      const posting: PostingRecord = {
        documentId: input.documentId,
        position: indexedPosition,
        normalizedStart: projection.normalizedStart,
        normalizedEnd: projection.normalizedEnd,
        originalStart: projection.originalStart,
        originalEnd: projection.originalEnd,
      };
      const postings = this.postingsByToken.get(projection.token) ?? [];

      postings.push(posting);
      this.postingsByToken.set(projection.token, postings);
      indexedPosition += 1;
      this.tokenOccurrenceCount += 1;
    }

    return this;
  }

  build(): SearchCorpus {
    const documents = buildDocumentRegistry(this.documents);
    const invertedIndex = buildInvertedIndex(this.postingsByToken);

    return Object.freeze({
      formatVersion: SEARCH_CORPUS_FORMAT_VERSION,
      documents,
      invertedIndex,
      statistics: Object.freeze({
        documentCount: Object.keys(documents).length,
        totalDistinctTokens: Object.keys(invertedIndex).length,
        totalTokenOccurrences: this.tokenOccurrenceCount,
      }),
    });
  }
}

function buildDocumentRegistry(
  documents: ReadonlyMap<string, CorpusDocument>,
): Record<string, CorpusDocument> {
  return Object.freeze(
    Object.fromEntries(
      [...documents.entries()]
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

function buildInvertedIndex(
  postingsByToken: ReadonlyMap<string, readonly PostingRecord[]>,
): InvertedIndex {
  return Object.freeze(
    Object.fromEntries(
      [...postingsByToken.entries()]
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
