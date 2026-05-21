import type { InvertedIndex, PostingRecord } from "../../index-primitives";
import type {
  MatchedDocument,
  PhraseQuery,
  QueryExecutionResult,
} from "../shared/query-types";
import { groupPostingsByDocument } from "../utils/group-postings-by-document";
import { mergeDocumentMatches } from "../utils/intersect-postings";
import { reconstructQuerySpan } from "../utils/reconstruct-query-span";

export function executePhraseQuery(
  index: InvertedIndex,
  query: PhraseQuery,
): QueryExecutionResult {
  if (query.tokens.length === 0) {
    return { matches: [] };
  }

  if (query.tokens.length === 1) {
    return executeSingleTokenPhrase(index, query.tokens[0]);
  }

  const firstTokenPostings = index[query.tokens[0]] ?? [];
  const postingsByQueryToken = query.tokens.map((token) =>
    groupPostingsByDocument(index[token] ?? []),
  );
  const phraseMatches: MatchedDocument[] = [];

  for (const startPosting of firstTokenPostings) {
    const postingSequence = findPostingSequence(
      startPosting,
      postingsByQueryToken,
    );

    if (postingSequence === undefined) {
      continue;
    }

    phraseMatches.push({
      documentId: startPosting.documentId,
      tokenPositions: postingSequence.map((posting) => posting.position),
      spans: [reconstructQuerySpan(postingSequence)],
    });
  }

  const matchesByDocument = new Map<string, MatchedDocument[]>();

  for (const match of phraseMatches) {
    const documentMatches = matchesByDocument.get(match.documentId) ?? [];

    documentMatches.push(match);
    matchesByDocument.set(match.documentId, documentMatches);
  }

  return {
    matches: [...matchesByDocument.entries()]
      .sort(([leftDocumentId], [rightDocumentId]) =>
        leftDocumentId.localeCompare(rightDocumentId),
      )
      .map(([documentId, matches]) =>
        mergeDocumentMatches(documentId, matches),
      ),
  };
}

function executeSingleTokenPhrase(
  index: InvertedIndex,
  token: string,
): QueryExecutionResult {
  const postings = index[token] ?? [];

  return {
    matches: [...groupPostingsByDocument(postings).entries()].map(
      ([documentId, documentPostings]) => ({
        documentId,
        tokenPositions: documentPostings.map((posting) => posting.position),
        spans: documentPostings.map((posting) =>
          reconstructQuerySpan([posting]),
        ),
      }),
    ),
  };
}

function findPostingSequence(
  startPosting: PostingRecord,
  postingsByQueryToken: readonly ReadonlyMap<
    string,
    readonly PostingRecord[]
  >[],
): PostingRecord[] | undefined {
  const sequence: PostingRecord[] = [{ ...startPosting }];

  for (
    let queryIndex = 1;
    queryIndex < postingsByQueryToken.length;
    queryIndex += 1
  ) {
    const candidatePosting = postingsByQueryToken[queryIndex]
      .get(startPosting.documentId)
      ?.find(
        (posting) => posting.position === startPosting.position + queryIndex,
      );

    if (candidatePosting === undefined) {
      return undefined;
    }

    sequence.push({ ...candidatePosting });
  }

  return sequence;
}
