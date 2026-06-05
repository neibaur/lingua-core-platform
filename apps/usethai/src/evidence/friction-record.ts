// Barrel-reach friction evidence: the typed record and the PURE recorder seam.
//
// This module is the reusable seam between "what the app reached for" and "how
// that reach classifies." It is side-effect free: given a scenario input and the
// outcome observed live from a core call, `recordFriction` returns a FrictionRecord.
// Nothing here calls core, touches the filesystem, reads the clock, or persists.
//
// Live-app integration is a possible follow-on and is OUT OF SCOPE here: a future
// live UseThai logger could call `recordFriction` from a real request handler,
// passing the user's query and the live core outcome. This file deliberately does
// NOT build that logger — no event hooks, subscriptions, persistence, background
// collection, or UI integration.
//
// Verdicts and reachability tiers are SOURCED from the merged authoritative
// inventory (docs/architecture/tokenizer-search-barrel-inventory.md §4, Capability
// Verdict Matrix). They are NOT recomputed by inspecting core source. The table
// below is a transcription of that matrix for the capabilities the fixed scenario
// list exercises. The harness observes OUTCOMES live; it never derives verdicts.

/** Direction of a lexical reach. `either` denotes a direction-agnostic corpus
 *  token/phrase reach (the search pipeline is monolingual over the corpus). */
export type ReachDirection = "th→en" | "en→th" | "either";

/** The capability an app reach intends, mapped 1:1 onto an inventory §4 row. */
export type IntendedCapability =
  | "exact-key"
  | "exact-key whole-phrase"
  | "exact-key single word"
  | "prefix"
  | "fuzzy"
  | "incremental prefix"
  | "tokenization-driven matching"
  | "phrase matching";

/** Outcome observed live by calling core. `unsupported` is reserved for a core
 *  call that could not execute at all (e.g. it threw an invariant error). */
export type ReachOutcome = "hit" | "miss" | "unsupported";

/** Capability verdict vocabulary — verbatim from the inventory §1 definitions. */
export type CapabilityVerdict =
  | "EXPORTED"
  | "PRESENT — NOT APP-REACHABLE"
  | "NOT PRESENT";

/** Reachability tier — from the inventory §1. `APP-REACHABLE` accompanies an
 *  EXPORTED verdict; the lower tiers accompany PRESENT — NOT APP-REACHABLE. */
export type ReachabilityTier =
  | "APP-REACHABLE"
  | "INTERMEDIATE"
  | "LEAF-ONLY"
  | "INTERNAL";

/**
 * Evidence classification of the reach.
 *
 * - STRUCTURAL    — capability is absent regardless of data (prefix, substring,
 *   fuzzy, incremental-prefix). A valid finding now.
 * - CONTENT-CAPPED — capability exists and is reachable, but the fixture lacks the
 *   entry. Bounded by fixture data; revisited only with real licensed data.
 * - AMBIGUOUS     — evidence insufficient to classify as STRUCTURAL or
 *   CONTENT-CAPPED (e.g. an en→th "eat" miss when the fixture has "to eat" but not
 *   "eat" — could be correct exact-key behavior, fixture incompleteness, or a
 *   user-expectation mismatch).
 * - NONE          — the reach succeeded: capability EXPORTED and data present. Not
 *   a friction finding. Used so a clean hit is not forced into a friction label
 *   (the brief forbids forcing STRUCTURAL/CONTENT-CAPPED where evidence does not
 *   support one); the summary still tallies all three friction values separately.
 */
export type EvidenceClassification =
  | "STRUCTURAL"
  | "CONTENT-CAPPED"
  | "AMBIGUOUS"
  | "NONE";

/** Author hint applied only when an EXPORTED capability did NOT hit: it records
 *  whether the miss is a clean data gap (CONTENT-CAPPED) or genuinely AMBIGUOUS.
 *  This is a property of how the scenario was designed, not of core source. */
export type MissClassification = "CONTENT-CAPPED" | "AMBIGUOUS";

/** Scenario input half of the recorder seam. */
export interface ScenarioInput {
  readonly query: string;
  readonly category: string;
  readonly direction: ReachDirection;
  readonly intendedCapability: IntendedCapability;
  /** Applied only when the capability is EXPORTED and the outcome is not a hit. */
  readonly missClassification?: MissClassification;
}

/** Observed-outcome half of the recorder seam (the live core result). */
export interface ObservedOutcome {
  readonly outcome: ReachOutcome;
  /** Brief, factual evidence note. No recommendations. */
  readonly note?: string;
}

/** One classified row of barrel-reach friction evidence. */
export interface FrictionRecord {
  readonly query: string;
  readonly category: string;
  readonly direction: ReachDirection;
  readonly intendedCapability: IntendedCapability;
  readonly outcome: ReachOutcome;
  readonly verdict: CapabilityVerdict;
  /** From the inventory; `null` when the capability is NOT PRESENT (no tier). */
  readonly reachabilityTier: ReachabilityTier | null;
  readonly classification: EvidenceClassification;
  readonly note?: string;
}

/**
 * Authoritative verdict/tier per intended capability — a transcription of
 * docs/architecture/tokenizer-search-barrel-inventory.md §4. NOT derived from
 * core source. Each entry cites the inventory row it transcribes.
 */
const INVENTORY_VERDICT: Readonly<
  Record<
    IntendedCapability,
    { readonly verdict: CapabilityVerdict; readonly reachabilityTier: ReachabilityTier | null }
  >
> = Object.freeze({
  // §4 "exact-key lookup" → EXPORTED / APP-REACHABLE
  "exact-key": { verdict: "EXPORTED", reachabilityTier: "APP-REACHABLE" },
  // §4 "English whole-phrase lookup" → EXPORTED / APP-REACHABLE
  "exact-key whole-phrase": { verdict: "EXPORTED", reachabilityTier: "APP-REACHABLE" },
  // §4 "exact-key lookup" (single-word query is the same capability) → EXPORTED
  "exact-key single word": { verdict: "EXPORTED", reachabilityTier: "APP-REACHABLE" },
  // §4 "prefix matching" → NOT PRESENT
  prefix: { verdict: "NOT PRESENT", reachabilityTier: null },
  // §4 "fuzzy matching" → NOT PRESENT
  fuzzy: { verdict: "NOT PRESENT", reachabilityTier: null },
  // §4 "prefix matching" (incremental prefix is prefix repeated) → NOT PRESENT
  "incremental prefix": { verdict: "NOT PRESENT", reachabilityTier: null },
  // §4 "tokenization-driven matching" → EXPORTED / APP-REACHABLE
  "tokenization-driven matching": { verdict: "EXPORTED", reachabilityTier: "APP-REACHABLE" },
  // §4 "phrase matching" → EXPORTED / APP-REACHABLE
  "phrase matching": { verdict: "EXPORTED", reachabilityTier: "APP-REACHABLE" },
});

/**
 * Pure classification of a reach from its verdict, live outcome, and (for an
 * EXPORTED non-hit) the scenario's author hint. No I/O, no source inspection.
 */
export function classifyEvidence(
  verdict: CapabilityVerdict,
  outcome: ReachOutcome,
  missClassification: MissClassification | undefined,
): EvidenceClassification {
  if (verdict === "NOT PRESENT") {
    // Capability absent regardless of data.
    return "STRUCTURAL";
  }

  if (verdict === "EXPORTED") {
    if (outcome === "hit") {
      return "NONE";
    }
    // EXPORTED but the reach did not land: either a bounded fixture-data gap or a
    // genuinely ambiguous expectation, as labeled by the scenario author.
    return missClassification ?? "AMBIGUOUS";
  }

  // PRESENT — NOT APP-REACHABLE is not exercised by the fixed scenario list; if it
  // ever were, the evidence alone cannot settle the classification.
  return "AMBIGUOUS";
}

/**
 * The recorder seam: map (scenario input, observed core outcome) → FrictionRecord.
 * Pure and side-effect free, callable once per reach. A future live-app logger
 * could call this per real user event (out of scope here).
 */
export function recordFriction(
  scenario: ScenarioInput,
  observed: ObservedOutcome,
): FrictionRecord {
  const inventory = INVENTORY_VERDICT[scenario.intendedCapability];

  return {
    query: scenario.query,
    category: scenario.category,
    direction: scenario.direction,
    intendedCapability: scenario.intendedCapability,
    outcome: observed.outcome,
    verdict: inventory.verdict,
    reachabilityTier: inventory.reachabilityTier,
    classification: classifyEvidence(
      inventory.verdict,
      observed.outcome,
      scenario.missClassification,
    ),
    ...(observed.note === undefined ? {} : { note: observed.note }),
  };
}
