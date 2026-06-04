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

  // The core lookup THROWS if the query contains any whitespace, so we guard
  // before calling it. An empty or whitespace-bearing query is reported as a
  // diagnostic rather than allowed to throw — single-token queries only.
  if (query === "" || /\s/.test(query)) {
    return jsonResponse({
      query: rawQuery,
      direction,
      entries: [],
      diagnostics: [
        {
          code: "LEXICAL_KEY_WHITESPACE_REJECTED",
          severity: "error",
          path: ["query"],
          message:
            "Query must be a single token with no whitespace (e.g. กิน).",
        },
      ],
    });
  }

  const result: LexicalLookupResult = composeLexicalLookup(
    { query, direction, lexicalIndexId: LEXICAL_INDEX_ID },
    index,
  );

  return jsonResponse(result);
};
