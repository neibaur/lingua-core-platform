# apps/usethai — UX Friction Log

App-tier evidence artifact. Records real friction observed while USING the dictionary
app, so that a later, separate warrant review can decide — with evidence — whether any
gap justifies app-tier work, wiring an already-reachable core surface, or (only through
core governance) a not-present core capability.

This log is governed by APP_SHELL_GUIDELINES.md. It is NOT a core artifact: nothing here
authorizes a core change. Core capability decisions require a separate warrant review
plus core grounding + §9 assessment.

## How to use this log (read before adding entries)

1. Capture EVIDENCE ONLY. Record what you did, expected, and got. Do NOT write proposed
   fixes, contract shapes, field names, or "we should add X" — solutioning belongs in the
   separate Warrant Review document or section, filled in a different session.
2. Tag every entry FIXTURE or REAL, and record the Data snapshot/source. Fixtures cap
   evidence: friction seen only on fixture data cannot support a content-usability claim or
   a core-capability warrant. A "no result" against a small fixture is usually fixture size,
   not a capability gap. The snapshot/source pins WHICH data was in play, so entries stay
   interpretable after the fixture contents change.
3. Record whether the target was CONFIRMED PRESENT in the data. "Query form didn't reach a
   confirmed-present entry" is the strong signal. "Entry absent" is weak evidence
   (data-coverage, often fixture noise).
4. Friction types are DESCRIPTIVE, not prescriptive. Do not classify friction by its
   imagined solution (no "needs-prefix"). Describe what happened.
5. Ranking / "best match first" / relevance ordering are explicit NON-GOALS
   (deterministic, no-ranking identity). Record such desires as NON-GOAL-DESIRE, not as a
   gap to fix.
6. Append-only. Do not rewrite or delete prior entries; observed evidence stands.

### Friction type vocabulary (pick one; describe in Notes)

- QUERY-FORM-UNMATCHED — input form (partial, misspelled, inflected, extra/missing spaces,
  alternate casing) did not match the exact key.
- ENTRY-ABSENT — the expected entry is not in the data at all.
- RESULT-PRESENT-HARD-TO-USE — a correct result returned, but presentation/interpretation
  caused friction.
- DIAGNOSTIC-UNCLEAR — a returned diagnostic or app state (e.g. rejected-input, awaiting-
  input, not-found) was confusing or mis-toned.
- NON-GOAL-DESIRE — the user wanted behavior that is an explicit platform non-goal
  (ranking, fuzzy "did you mean", relevance ordering).
- OTHER — describe fully.

### Record template (a template, not data)

### F-0001 — YYYY-MM-DD

- Session context: [what you were doing, how long, e.g. "15 min, looking up words off a
  menu photo"]
- Query: [exact input] Direction: [th→en | en→th]
- Surface exercised: [which app path served it, e.g. lexical exact-key lookup endpoint]
- Data basis: [FIXTURE | REAL]
- Data snapshot/source: [e.g. seed fixture | manual seeded entry set | future imported dataset]
- Target confirmed present in data: [yes | no | unknown]
- Expected: [what you expected to happen]
- Actual: [what happened — result / diagnostic / neutral state]
- Friction type: [one vocabulary tag]
- Notes: [free text — observation only, NO proposed fix]

### Illustrative examples (NOT evidence — do not count in any warrant review)

### EX-01 — 2026-06-06

- Session context: 20 min, looking up Thai words while reading
- Query: "ก" Direction: th→en
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: seed fixture
- Target confirmed present in data: yes (กิน is in the fixture)
- Expected: typing the first character would narrow toward กิน
- Actual: not-found (exact-key lookup; single char is not a key)
- Friction type: QUERY-FORM-UNMATCHED
- Notes: Demonstrates the SHAPE of a search-capability signal (query form didn't reach a
  confirmed-present entry). FIXTURE-tagged, so it carries NO warrant weight on its own —
  only REAL clustered equivalents would. (No fix proposed.)

### EX-02 — 2026-06-06

- Session context: same session
- Query: "elephant" Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: seed fixture
- Target confirmed present in data: no
- Expected: a Thai result
- Actual: not-found
- Friction type: ENTRY-ABSENT
- Notes: Likely fixture size, not a capability gap. Weak evidence; discount.

## Entries

(no observations yet — first real entry goes here as F-0001)

## Warrant Review (DEFERRED — do not fill during evidence capture)

Filled only in a separate, later session, after enough entries accumulate. As the log
grows this may graduate from a section here into its own document — either is fine. This is
where friction is triaged against three buckets — (a) app-tier presentation fix, (b) wire
an already-reachable core surface (lexical exact-key lookup; tokenizer corpus token/phrase
path — see the barrel inventory), (c) a not-present core capability requiring core
governance. Only REAL-tagged, confirmed-present-target, QUERY-FORM-UNMATCHED clusters can
support bucket (c). FIXTURE-tagged and ENTRY-ABSENT entries are discounted for capability
claims regardless of how clean the signal looks. No core proposal leaves this review
without a separate core grounding + §9 assessment.

(empty until a warrant review is convened)
