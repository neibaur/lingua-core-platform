export { CorpusIndexer } from "./pipeline/corpus-indexer";
export {
  canonicalizeSearchCorpus,
  deserializeSearchCorpus,
  serializeSearchCorpus,
} from "./utils/index-serializer";
export type { CorpusIndexDocumentInput } from "./pipeline/corpus-indexer";
export {
  SEARCH_CORPUS_FORMAT_VERSION,
  type CorpusDocument,
  type CorpusStatistics,
  type InvertedIndex,
  type PostingRecord,
  type SearchCorpus,
  type SearchCorpusFormatVersion,
} from "./shared/index-types";
