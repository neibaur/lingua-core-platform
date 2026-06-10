// Direction-aware page chrome (Cluster 1, F-0004). Maps the active lookup
// direction to the document <title> and the on-page <h1>, so the page chrome
// reflects whether the user is doing an English → Thai or Thai → English lookup
// at all times — including the neutral awaiting-input state, before any lookup.
//
// The direction type is reused from the public @core/lexical barrel (the same
// LexicalLanguageDirection the lookup form and the /api/lookup endpoint use); the
// app introduces no direction type of its own. This module is presentation copy
// only — it performs no lookup, no matching, and no normalization of query keys.
import type { LexicalLanguageDirection } from "@core/lexical";

// The direction shown before any interaction. Matches the #dir select's
// initially-selected option and the /api/lookup endpoint's fallback, so the
// server-rendered chrome and the client agree on first paint.
export const DEFAULT_DIRECTION: LexicalLanguageDirection = "th→en";

// Document <title> for each lookup direction.
export function documentTitleForDirection(
  direction: LexicalLanguageDirection,
): string {
  return direction === "en→th"
    ? "Use Thai — English → Thai Lookup"
    : "Use Thai — Thai → English Lookup";
}

// On-page <h1> heading for each lookup direction.
export function headingForDirection(
  direction: LexicalLanguageDirection,
): string {
  return direction === "en→th"
    ? "English → Thai lookup"
    : "Thai → English lookup";
}

// Input placeholder example for each lookup direction (F-0018, Cluster 1 residual).
export function placeholderForDirection(
  direction: LexicalLanguageDirection,
): string {
  return direction === "en→th"
    ? "Type a word, e.g. old"
    : "Type a word, e.g. กิน";
}

// Narrow an arbitrary control value (e.g. the raw #dir select value) to the
// LexicalLanguageDirection union, defaulting to DEFAULT_DIRECTION. Mirrors the
// endpoint's own normalization so client chrome and server agree.
export function normalizeDirection(value: string): LexicalLanguageDirection {
  return value === "en→th" ? "en→th" : "th→en";
}
