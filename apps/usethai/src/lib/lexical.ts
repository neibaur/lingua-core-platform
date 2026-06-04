import { composeLexicalIndex } from "@core/lexical";

import { seed } from "../data/seed";

// Build the index once at module scope; it is reused across requests. The core
// artifact is deep-frozen — we read it, never mutate it.
export const LEXICAL_INDEX_ID = "usethai-fixture";

export const index = composeLexicalIndex({
  lexicalIndexId: LEXICAL_INDEX_ID,
  entries: seed,
});
