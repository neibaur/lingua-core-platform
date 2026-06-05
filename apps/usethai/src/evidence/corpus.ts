// Pure-input corpus isolation for the token/phrase corpus reaches.
//
// The search pipeline (buildSearchProjection → CorpusIndexer → executeQuery /
// executePhraseQuery) is exercised over a corpus built IN-PROCESS from the simple
// hardcoded string array below. There are NO filesystem operations, no dynamic
// content-scraping loops, and no outside assets. The only `await` is core's own
// Promise-returning projection API; the data itself is fully in-memory and fixed,
// which is the "build synchronously from a hardcoded array" requirement in spirit.
//
// These strings are illustrative dev text, not governed dictionary records, and
// fabricate no DictionarySourceProvenance / CanonicalDictionaryEntry lineage
// (APP_SHELL_GUIDELINES.md — Data).

import { buildSearchProjection, CorpusIndexer, MockTokenizerDriver } from "@core/tokenizers";
import type { SearchCorpus } from "@core/tokenizers";

/** Fixed, hardcoded corpus input. Whitespace-segmented by MockTokenizerDriver. */
export const CORPUS_STRINGS: readonly string[] = Object.freeze([
  "to eat rice",
  "drink water",
  "good house",
]);

/**
 * Build a frozen SearchCorpus from CORPUS_STRINGS through the public
 * @core/tokenizers barrel only. Deterministic: fixed input, fixed driver, no I/O.
 */
export async function buildEvidenceCorpus(): Promise<SearchCorpus> {
  const driver = new MockTokenizerDriver();
  const indexer = new CorpusIndexer();

  let documentNumber = 0;
  for (const text of CORPUS_STRINGS) {
    const projection = await buildSearchProjection(text, driver);
    const documentId = `corpus-doc-${documentNumber}`;

    indexer.addDocument({
      documentId,
      identifier: text,
      sourceLength: text.length,
      projections: projection.records,
    });
    documentNumber += 1;
  }

  return indexer.build();
}
