// Honest presentation mapping for lookup outcomes.
//
// This module translates the governed-core lexical diagnostics into the small
// set of app-tier presentation states the page renders. It introduces NO
// matching, suggestion, prefix, substring, fuzzy, ranking, or "did-you-mean"
// behavior — it only maps real diagnostic codes to honest, human-readable copy
// and to a presentation category. Types are imported type-only from the public
// @core/lexical barrel (no internal core imports, no runtime core coupling).
import type { LexicalLookupDiagnostic } from "@core/lexical";
import type { LexicalLookupDiagnosticCode } from "@core/lexical";

// The presentation categories a no-entries response can resolve to. These are
// app view states, deliberately distinct from the core diagnostic codes they
// are derived from:
//   - "no-result"      — a neutral "no exact match"; NOT an error.
//   - "rejected-input" — the query was invalid input; a correctable condition.
//   - "unavailable"    — a system/data condition (e.g. an empty index, or any
//                        unmapped/future code); not the user's input being wrong
//                        and not a normal no-match.
export type LookupStateKind = "no-result" | "rejected-input" | "unavailable";

// Honest, human-readable copy for every diagnostic code the lookup can emit.
// Keyed by the exhaustive LexicalLookupDiagnosticCode union: if core adds a new
// code, this object fails to type-check until copy is supplied here. Even so,
// any code that slips through at runtime falls back to the generic message
// below — a raw enum string is never shown, and no specific meaning is invented
// for a code we do not recognize.
export const DIAGNOSTIC_MESSAGES: Record<LexicalLookupDiagnosticCode, string> =
  {
    LEXICAL_KEY_NOT_FOUND:
      "This is an exact-key lookup, so only an entry whose key matches exactly is returned.",
    LEXICAL_KEY_WHITESPACE_REJECTED: "Enter a single term with no spaces.",
    LEXICAL_INDEX_EMPTY:
      "The dictionary has no entries loaded, so there is nothing to look up.",
  };

// Resolve a diagnostic to its PRIMARY user-facing message under Policy B:
//   - Mapped codes use the app-authored copy above (unchanged behavior).
//   - Unmapped codes (e.g. a future core diagnostic) fall back to core's OWN
//     verbatim diagnostic.message rather than a generic placeholder, so core's
//     real information is never suppressed. The raw enum code is still never
//     shown as primary text.
// The cast widens the lookup so the runtime fallback is genuinely reachable (and
// not flagged as a dead branch); the underlying access is a plain keyed read.
// Mirrors the repository's accepted type-system accommodation pattern.
export function messageForDiagnostic(
  diagnostic: LexicalLookupDiagnostic,
): string {
  const byCode = DIAGNOSTIC_MESSAGES as Record<string, string | undefined>;
  return byCode[diagnostic.code] ?? diagnostic.message;
}

// Route a diagnostic to its presentation category. The rejection code routes to
// "rejected-input", the not-found code to the neutral "no-result", and every
// other code — the defensively-mapped empty-index code and any unmapped/future
// code — to the system "unavailable" category. No code is ever routed to a
// fabricated match.
export function categoryForDiagnostic(
  diagnostic: LexicalLookupDiagnostic,
): LookupStateKind {
  switch (diagnostic.code) {
    case "LEXICAL_KEY_WHITESPACE_REJECTED":
      return "rejected-input";
    case "LEXICAL_KEY_NOT_FOUND":
      return "no-result";
    case "LEXICAL_INDEX_EMPTY":
      return "unavailable";
    default:
      return "unavailable";
  }
}
