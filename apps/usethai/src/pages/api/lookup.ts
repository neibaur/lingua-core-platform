import type { APIRoute } from "astro";

import { composeLexicalLookup } from "@core/lexical";
import type {
  LexicalLanguageDirection,
  LexicalLookupResult,
} from "@core/lexical";

import { LEXICAL_INDEX_ID, index } from "../../lib/lexical";

export const prerender = false;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const GET: APIRoute = ({ url }) => {
  const rawQuery = url.searchParams.get("q") ?? "";
  const rawDir = url.searchParams.get("dir") ?? "th→en";

  const direction: LexicalLanguageDirection =
    rawDir === "en→th" ? "en→th" : "th→en";

  const query = rawQuery.trim();

  // Empty input is not a lookup: there is nothing to resolve. We return a
  // neutral, entry-less response without calling core and without fabricating
  // any diagnostic — the "awaiting input" condition is the UI's to present.
  // Whitespace-BEARING queries are NOT guarded here: they pass through to core,
  // which decides per direction (th→en returns its own real
  // LEXICAL_KEY_WHITESPACE_REJECTED diagnostic; en→th resolves a whole-phrase
  // query such as "to eat" by exact equality). The app mints no diagnostic and
  // consumes whatever core returns.
  if (query === "") {
    return jsonResponse({
      query: rawQuery,
      direction,
      entries: [],
      diagnostics: [],
    });
  }

  const result: LexicalLookupResult = composeLexicalLookup(
    { query, direction, lexicalIndexId: LEXICAL_INDEX_ID },
    index,
  );

  return jsonResponse(result);
};
