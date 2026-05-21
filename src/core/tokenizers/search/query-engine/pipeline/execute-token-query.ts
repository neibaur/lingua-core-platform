import type { InvertedIndex, PostingRecord } from "../../index-primitives";
import { groupPostingsByDocument } from "../utils/group-postings-by-document";
import type {
  MatchedDocument,
  QueryExecutionResult,
  TokenQuery,
} from "../shared/query-types";

export function executeTokenQuery(
  index: InvertedIndex,
  query: TokenQuery,
): QueryExecutionResult {
  const postings = [...(index[query.token] ?? [])].sort(comparePostings);
  const matches: MatchedDocument[] = [
    ...groupPostingsByDocument(postings).entries(),
  ].map(([documentId, documentPostings]) => ({
    documentId,
    tokenPositions: documentPostings.map((posting) => posting.position),
    spans: documentPostings.map((posting) => ({
      normalizedStart: posting.normalizedStart,
      normalizedEnd: posting.normalizedEnd,
      originalStart: posting.originalStart,
      originalEnd: posting.originalEnd,
    })),
  }));

  return { matches };
}

function comparePostings(left: PostingRecord, right: PostingRecord) {
  return (
    left.documentId.localeCompare(right.documentId) ||
    left.position - right.position ||
    left.normalizedStart - right.normalizedStart ||
    left.originalStart - right.originalStart
  );
}
