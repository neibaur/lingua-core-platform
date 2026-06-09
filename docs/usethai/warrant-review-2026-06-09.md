# apps/usethai — Warrant Review 2026-06-09

## Header

- **Date:** 2026-06-09
- **Evidence basis:** 14 FIXTURE entries (F-0014–F-0027), current UseThai fixture / local dev app
- **Real data:** none — all entries are FIXTURE-tagged; no REAL-tagged entries exist yet
- **Core-capability warrant issued:** none — FIXTURE basis forecloses all bucket (c) outcomes;
  no not-present core capability is warranted by this review

---

## Shared Understanding Confirmed Before Triage

**Entries in scope:** 14 F-entries, F-0014 through F-0027 only. F-0001–F-0013 are settled by
the first review (docs/usethai/warrant-review-2026-06-07.md) and are not re-triaged here.
All 14 are FIXTURE-tagged.

**Data snapshots:** mixed — most entries tagged "current UseThai fixture/local dev app" or
"current UseThai fixture/manual lookup compared against external reference screenshots." All
FIXTURE-tagged regardless.

**Comparison-testing entries:** F-0014–F-0017 and F-0020 arose from manual comparison against
an external Thai dictionary reference. The comparison material is context for the friction
observation; it is not itself evidence of a capability gap. The gap between UseThai fixture
and reference material is overwhelmingly a data-content question on FIXTURE data.

**Capability-bucket eligibility:** not eligible — bucket (c) requires REAL-tagged,
confirmed-present-target, QUERY-FORM-UNMATCHED clusters; every entry here is FIXTURE-tagged,
so none can carry a not-present-core-capability warrant regardless of signal clarity.
Buckets (a) and (b) remain conditionally available per the data-independence rule below.

**Data-independence rule for bucket (a):** friction whose cause is app/UI state rather than
dictionary-data content is data-independent and may support a bucket-(a) identification even
on FIXTURE data — consistent with how Cluster 1 (page title) was treated. Error-state
presentation (F-0021, F-0025), navigation/URL state (F-0024, F-0026), and
direction-placeholder sync (F-0018) qualify. Result-content friction (F-0014–F-0017, F-0020)
does not; the app cannot surface data it does not hold.

**Reachability ≠ warrant:** the corpus token/phrase path (buildSearchProjection →
CorpusIndexer → executeQuery/executePhraseQuery) remains UNWIRED pending a logged friction
signal that maps to it. Being app-reachable does not itself authorize wiring. The same hold
established in Clusters 5 and 8 of the first review carries forward.

**Search-capability-shaped FIXTURE entries:** F-0022, F-0023 (romanized-form lookup) and
F-0027 (as-you-type input guidance) are search-capability-shaped FIXTURE entries. Per the
friction log's warrant-review rules, they are recorded HELD pending REAL clustered evidence
— the Clusters 5/8 posture — and cannot support a core-capability warrant on FIXTURE basis.

**Direction-aware chrome status:** P2 slice (#189) shipped heading and document-title
direction reflection. SESSION_STATE confirms coverage: "page heading + document title now
reflects the currently selected lookup direction." Placeholder text was not in scope.
F-0018 (placeholder shows Thai example in en→th mode) is a residual gap from Cluster 1,
not a re-opening of that cluster.

---

## Triage

**Scope reminder:** 14 FIXTURE entries, F-0014–F-0027. Bucket (c) foreclosed for all entries.
Bucket (a) available for data-independent friction. Buckets (b) and (c)-shaped entries held
under FIXTURE + reachability-≠-warrant discipline. New clusters proposed only where the
pattern is genuinely distinct from Clusters 1–9.

---

### F-0014 — Romanization scheme not identified

- **Entry:** F-0014 (กิน → "kin" in UseThai; "gin" in comparison reference — user cannot
  tell why the romanizations differ because the scheme is not labeled)
- **Friction type:** RESULT-PRESENT-HARD-TO-USE
- **Data basis:** FIXTURE
- **Cluster mapping:** New Cluster 10 (Romanization scheme not identified) — distinct from
  Cluster 4 (tone marks absent from the romanized string). Cluster 4's friction was that
  the romanized form lacked tone-mark content; here the romanized form was present and the
  lookup succeeded, but the transcription system itself was not visible, causing confusion
  when comparing with external material that uses a different system. The gap is not
  missing tone data but a missing scheme label.
- **Bucket:** data-content, no action
- **Disposition:** The romanization string is core entry data; whether a scheme label exists
  depends on what the fixture and future data sources carry. Displaying a static label would
  require the app to assert which system was used — which it cannot do without provenance
  support. FIXTURE + provenance-dependent = discounted. Data/core-schema-gated question;
  no app-tier fix is possible without knowing the authoritative scheme from the data.

---

### F-0015 — Definition too narrow for common usage

- **Entry:** F-0015 (กิน → "to eat"; comparison reference indicates the word also covers
  consuming drinks or medicine, which the returned definition does not communicate)
- **Friction type:** RESULT-PRESENT-HARD-TO-USE
- **Data basis:** FIXTURE
- **Cluster mapping:** New Cluster 11 (Result content depth insufficient vs. external
  reference) — a new pattern covering cases where the lookup succeeds and the result is
  correct at a basic level, but the displayed definition content is too shallow to serve a
  learner comparing against richer reference material. Distinct from Clusters 3/4: Cluster 3
  was multi-entry homograph disambiguation (same gloss, multiple entries); Cluster 4 was
  tone-mark absence; this cluster is about definition-field depth for a single, correctly
  returned entry.
- **Bucket:** data-content, no action
- **Disposition:** The app cannot widen a definition it does not hold. The fixture "to eat"
  is the data; the richer usage coverage is in external sources. FIXTURE + data-content =
  discounted. Data-sourcing question outside app-tier scope.

---

### F-0016 — No related words or compound context shown

- **Entry:** F-0016 (กิน lookup succeeds; comparison reference shows related words, phrases,
  and example sentences; UseThai result is isolated)
- **Friction type:** RESULT-PRESENT-HARD-TO-USE
- **Data basis:** FIXTURE
- **Cluster mapping:** Cluster 11 (Result content depth) — the friction is the same
  class: result present and correct, but shallow vs. reference material. Here the missing
  content is relational (compounds, example sentences) rather than definitional breadth, but
  the root is still fixture data-content and an unimplemented data structure.
- **Bucket:** data-content / not-present core capability — both foreclosed on FIXTURE basis
- **Disposition:** Related-word / cross-reference / example-sentence structures are not
  present in the current data model or fixture. The app cannot surface cross-references that
  do not exist in the data. Even if a relational capability were present in core, FIXTURE +
  no-data = nothing to wire. Discounted.

---

### F-0017 — Result set feels incomplete (additional Thai forms not returned)

- **Entry:** F-0017 ("old" en→th returns เก่า and แก่; comparison reference shows
  additional forms เก่าๆ and เก่าแก่ not confirmed present in UseThai data)
- **Friction type:** RESULT-PRESENT-HARD-TO-USE
- **Data basis:** FIXTURE
- **Cluster mapping:** Cluster 11 (Result content depth) — the result set feels incomplete
  against external reference. Note: presence of the additional forms in the current fixture
  was not confirmed; this may be ENTRY-ABSENT for those forms rather than a display gap.
  Either way, the root is data-content.
- **Bucket:** data-content, no action
- **Disposition:** If the additional forms are absent from the fixture, this is fixture-
  coverage noise (analogous to Cluster 9). If they are present but unreturned, it would be
  a render question — but their presence was not confirmed. FIXTURE + unconfirmed target
  presence = discounted. Data-content/data-coverage matter; no app-tier fix.

---

### F-0018 — Placeholder shows Thai example in en→th mode (residual Cluster 1)

- **Entry:** F-0018 (search box shows "Type a word, e.g. กิน" while en→th is selected;
  entering the displayed Thai example in en→th mode returns not-found)
- **Friction type:** OTHER
- **Data basis:** FIXTURE (data-independent — this is UI chrome)
- **Cluster mapping:** **Cluster 1 residual** — not a new cluster; not re-opening the
  settled Cluster 1 disposition. The P2 direction-aware chrome (#189) addressed page
  heading and document title; placeholder text was not in scope. The friction is the same
  class as Cluster 1 (direction not reflected in app chrome) but in a different surface
  (input placeholder). Noting as a residual gap within Cluster 1's scope.
- **Bucket:** **(a) app-tier candidate** — data-independent chrome, consistent with
  Cluster 1 treatment
- **Disposition:** IDENTIFIED, not authorized. The placeholder is app chrome; making it
  direction-aware is wholly within app-tier latitude (APP_SHELL_GUIDELINES "Latitude").
  Needs separate operator authorization before any slice.

---

### F-0019 — Direction-mismatch: wrong-direction query returns silent not-found

- **Entry:** F-0019 ("old" entered while th→en is selected; no result, no hint that the
  concept exists in en→th; user needed to select the correct direction before querying)
- **Friction type:** OTHER
- **Data basis:** FIXTURE (data-independent — this is app-state UX)
- **Cluster mapping:** New Cluster 12 (Direction-mismatch — no cross-direction hint) —
  distinct from Cluster 1 (which is about display not reflecting the active direction) and
  from Cluster 1 residual (F-0018, which is about the placeholder). Here the direction was
  correct from the app's perspective (exact-key lookup is inherently direction-specific), but
  the user entered a query whose script did not match the selected direction and received a
  silent not-found with no guidance. The distinguishing pattern is: lookup behavior was
  correct; the UX friction is the absence of a cross-direction hint when script and direction
  appear mismatched.
- **Bucket:** **(a) app-tier candidate** — data-independent; a script-mismatch hint is
  wholly app-state logic (no core surface required); any promoted business rule would need
  core governance before becoming authoritative
- **Disposition:** IDENTIFIED, not authorized. If pursued, the hint logic must remain
  provisional app-tier code until governed; must not mutate core objects or bypass the
  exact-key lookup boundary. Needs separate operator authorization.

---

### F-0020 — Word with multiple meanings returns a subset of senses

- **Entry:** F-0020 (เอา → "to take," "to want"; comparison reference shows additional
  senses including an "ok/right/well" usage and metadata about breadth/commonness)
- **Friction type:** RESULT-PRESENT-HARD-TO-USE
- **Data basis:** FIXTURE
- **Cluster mapping:** Cluster 11 (Result content depth) — successful lookup, result
  present, but comparison testing reveals the fixture's sense coverage is shallower than
  reference material. Same data-content root as F-0015, F-0016, F-0017.
- **Bucket:** data-content, no action
- **Disposition:** The app returned what the fixture holds. Missing senses are a data-
  coverage gap, not a render gap. FIXTURE + data-content = discounted.

---

### F-0021 — Offline error surfaced as raw fetch failure

- **Entry:** F-0021 (while offline, UI shows "Lookup failed ERROR The lookup request could
  not be completed: Failed to fetch" instead of an offline/network explanation)
- **Friction type:** DIAGNOSTIC-UNCLEAR
- **Data basis:** FIXTURE (data-independent — this is error-state presentation)
- **Cluster mapping:** New Cluster 13 (Error/diagnostic messages are technical rather than
  user-facing) — a new pattern: app error states caused by infrastructure conditions
  (network, HTTP protocol) surface low-level technical messages rather than user-facing
  explanations. No existing cluster covers error messaging presentation.
- **Bucket:** **(a) app-tier candidate** — data-independent; error-state copy and offline
  detection are wholly within app-tier latitude; no core surface involved
- **Disposition:** IDENTIFIED, not authorized. The friction is presentation: mapping a
  caught fetch failure to a user-facing "you appear to be offline" message is an app-tier
  presentation fix. Needs separate operator authorization.

---

### F-0022 — Romanized form of Thai word does not reach the entry as a query

- **Entry:** F-0022 ("kin" entered in en→th mode — matching the displayed romanized form
  for กิน — returns no result; target confirmed present)
- **Friction type:** QUERY-FORM-UNMATCHED
- **Data basis:** FIXTURE
- **Cluster mapping:** New Cluster 15 (Romanized-form lookup) — a new search-capability-
  shaped pattern: the romanized pronunciation form displayed in results cannot be used as a
  lookup query. Distinct from all Clusters 1–9: it is not a token-in-gloss question
  (Cluster 5), not inflection/stemming (Cluster 6), not punctuation adjacency (Cluster 7),
  not Thai multi-token (Cluster 8). The desired behavior would require an index keyed on
  romanized forms — a surface not present in core.
- **Bucket:** **HELD** — search-capability-shaped FIXTURE entry; clusters 5/8 posture
- **Disposition:** HELD pending REAL clustered evidence. On FIXTURE basis, this carries no
  warrant. The mechanism (if ever warranted) is a not-present romanized-index surface —
  bucket (c)-class — foreclosed by FIXTURE. If REAL evidence accumulates, scope a
  deliberate evaluation distinct from any lexical exact-key change.

---

### F-0023 — Alternate romanized spelling does not reach the entry

- **Entry:** F-0023 ("gin" entered in en→th — matching a romanized form seen in external
  reference for กิน — returns no result; target confirmed present)
- **Friction type:** QUERY-FORM-UNMATCHED
- **Data basis:** FIXTURE
- **Cluster mapping:** Cluster 15 (Romanized-form lookup) — same cluster as F-0022. The
  additional dimension is alternate romanization schemes (RTGS "kin" vs. IPA-influenced
  "gin"), but the core mechanism is the same: a romanized pronunciation form used as a
  lookup query does not reach the Thai entry.
- **Bucket:** **HELD** — same posture as F-0022
- **Disposition:** HELD pending REAL clustered evidence. FIXTURE + search-capability-shaped =
  no warrant. Records alongside F-0022 as corroborating signal; the alternate-romanization
  dimension (transcription-scheme variance) strengthens the eventual need for a defined
  authoritative romanization scheme before any romanized-index surface could be specified.

---

### F-0024 — Browser Back does not navigate through lookup history

- **Entry:** F-0024 (after multiple lookups, pressing browser Back returns to the prior
  site rather than to an earlier lookup state within UseThai)
- **Friction type:** OTHER
- **Data basis:** FIXTURE (data-independent — this is browser navigation state)
- **Cluster mapping:** New Cluster 14 (Lookup state not preserved in browser
  navigation/history) — a new pattern: lookup queries and direction do not produce
  browser-history entries, so standard browser navigation bypasses the app's lookup flow.
  No existing cluster covers URL/history state management.
- **Bucket:** **(a) app-tier candidate** — data-independent; URL-based query params and the
  History API are wholly app-tier concerns (Astro/Vite routing, Cloudflare adapter);
  no core surface involved
- **Disposition:** IDENTIFIED, not authorized. URL-state design (query string, history
  push) is a pragmatic framework convention within app-tier latitude
  (APP_SHELL_GUIDELINES "Latitude"). Needs separate operator authorization.

---

### F-0025 — HTTP 431 error surfaced as a technical HTTP status message

- **Entry:** F-0025 (very long pasted input causes UI to display "The lookup request
  failed (HTTP 431)" instead of a user-facing "input too long" explanation)
- **Friction type:** DIAGNOSTIC-UNCLEAR
- **Data basis:** FIXTURE (data-independent — this is error-state presentation)
- **Cluster mapping:** Cluster 13 (Technical error messages) — same cluster as F-0021.
  Both are DIAGNOSTIC-UNCLEAR cases where an infrastructure-level failure code (network
  fetch failure, HTTP 431) is surfaced verbatim instead of a user-facing explanation.
- **Bucket:** **(a) app-tier candidate** — data-independent; mapping an HTTP 431 to a
  "query too long" user message is wholly app-tier presentation
- **Disposition:** IDENTIFIED, not authorized. Input-length feedback could also be
  implemented as a client-side guard before the request is sent (character-count limit
  triggering an inline message), which would prevent the 431 entirely. Either approach is
  app-tier. Needs separate operator authorization.

---

### F-0026 — Page refresh resets direction and query state

- **Entry:** F-0026 (after searching "old" en→th, refreshing the page resets to default
  Thai → English state with กิน pre-populated)
- **Friction type:** OTHER
- **Data basis:** FIXTURE (data-independent — this is page-state persistence)
- **Cluster mapping:** Cluster 14 (Lookup state not preserved) — same cluster as F-0024.
  Both are about lookup state not surviving browser-level actions (Back, Refresh). Here the
  specific mechanism is that query and direction are not encoded in the URL, so a page
  reload always restores the server-rendered default.
- **Bucket:** **(a) app-tier candidate** — same rationale as F-0024; URL-state encoding
  would address both Back-navigation and refresh-persistence together
- **Disposition:** IDENTIFIED, not authorized. Shares a probable fix with F-0024 (URL
  query-string encoding of direction + query). Needs separate operator authorization.

---

### F-0027 — No as-you-type input guidance while typing

- **Entry:** F-0027 (while typing partial input, no suggestions, completions, or matching
  hints appear; page remains static until a full query is submitted)
- **Friction type:** QUERY-FORM-UNMATCHED
- **Data basis:** FIXTURE
- **Cluster mapping:** New Cluster 16 (As-you-type input guidance absent) — a new
  search-capability-shaped pattern: the input field provides no guidance during partial
  typing. Distinct from the en→th token-in-gloss (Cluster 5) and Thai multi-token (Cluster 8)
  patterns, which concerned submitted query forms; this is about pre-submission input
  behavior. The friction log entry itself notes it "should remain evidence only and not be
  treated as a search-capability warrant without later review."
- **Bucket:** **HELD** — search-capability-shaped FIXTURE entry; clusters 5/8 posture
- **Disposition:** HELD pending REAL clustered evidence. As-you-type guidance would require
  either a prefix/substring lookup surface (not present in core; non-goaled in lexical) or
  a client-side corpus query — both capability-class questions. On FIXTURE basis this
  carries no warrant. If REAL evidence accumulates, scope a deliberate evaluation as a
  distinct search affordance, never as a change to exact-key lexical lookup.

---

## New Clusters Summary

| Cluster                                                       | Pattern                                                                                                                                                       | Entries                        | First-review basis                                                                                                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10 — Romanization scheme not identified                       | Romanized form present but transcription system unlabeled; user cannot reconcile divergent romanizations across references                                    | F-0014                         | New; distinct from Cluster 4 (tone marks absent from string) — this is a scheme-label gap, not a tone-data gap                                                |
| 11 — Result content depth insufficient vs. external reference | Lookup succeeds; returned content is shallow compared with richer reference material (narrow definitions, missing senses, absent compound/relational context) | F-0015, F-0016, F-0017, F-0020 | New; distinct from Cluster 3 (disambiguation of multiple returned entries) — this cluster is about depth of a single or small result set                      |
| 12 — Direction-mismatch / no cross-direction hint             | User queries in the wrong direction; exact-key lookup correctly returns not-found; no app hint that the concept may exist in the other direction              | F-0019                         | New; distinct from Cluster 1 (heading/title display) and Cluster 1 residual F-0018 (placeholder sync) — this is a query-flow UX gap, not a chrome-display gap |
| 13 — Error/diagnostic messages are technical                  | Infrastructure-level failure messages (network fetch error, HTTP 431) surfaced verbatim rather than as user-facing explanations                               | F-0021, F-0025                 | New; no existing cluster covers error-state presentation                                                                                                      |
| 14 — Lookup state not preserved in navigation                 | Query and direction state are not encoded in the URL; browser Back and page Refresh bypass lookup history                                                     | F-0024, F-0026                 | New; no existing cluster covers URL/history state                                                                                                             |
| 15 — Romanized-form lookup (HELD)                             | Romanized pronunciation form (as displayed in results, or from alternate scheme) entered as a lookup query does not reach the entry                           | F-0022, F-0023                 | New; search-capability-shaped; Clusters 5/8 posture — HELD                                                                                                    |
| 16 — As-you-type input guidance absent (HELD)                 | No suggestions or hints appear during partial typing; page static until full submit                                                                           | F-0027                         | New; search-capability-shaped; Clusters 5/8 posture — HELD                                                                                                    |

---

## Per-Entry Disposition Summary

| Entry  | Cluster                                 | Bucket                  | Disposition                                                                               |
| ------ | --------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| F-0014 | 10 — Romanization scheme not identified | data-content, no action | FIXTURE; data/core-schema-gated; no action                                                |
| F-0015 | 11 — Result content depth               | data-content, no action | FIXTURE; fixture-content quality; no action                                               |
| F-0016 | 11 — Result content depth               | data-content, no action | FIXTURE; fixture-content quality; no action                                               |
| F-0017 | 11 — Result content depth               | data-content, no action | FIXTURE; fixture-coverage (forms unconfirmed); no action                                  |
| F-0018 | Cluster 1 residual                      | (a) app-tier candidate  | IDENTIFIED; residual gap from #189 (placeholder not direction-aware); needs authorization |
| F-0019 | 12 — Direction-mismatch, no hint        | (a) app-tier candidate  | IDENTIFIED; data-independent; needs authorization                                         |
| F-0020 | 11 — Result content depth               | data-content, no action | FIXTURE; fixture-content quality; no action                                               |
| F-0021 | 13 — Technical error messages           | (a) app-tier candidate  | IDENTIFIED; data-independent; needs authorization                                         |
| F-0022 | 15 — Romanized-form lookup (HELD)       | HELD                    | FIXTURE; search-capability-shaped; no warrant                                             |
| F-0023 | 15 — Romanized-form lookup (HELD)       | HELD                    | FIXTURE; search-capability-shaped; no warrant                                             |
| F-0024 | 14 — State not preserved                | (a) app-tier candidate  | IDENTIFIED; data-independent; needs authorization                                         |
| F-0025 | 13 — Technical error messages           | (a) app-tier candidate  | IDENTIFIED; data-independent; needs authorization                                         |
| F-0026 | 14 — State not preserved                | (a) app-tier candidate  | IDENTIFIED; data-independent; needs authorization                                         |
| F-0027 | 16 — As-you-type (HELD)                 | HELD                    | FIXTURE; search-capability-shaped; no warrant                                             |

---

## No Core-Capability Warrant

**This review, conducted on FIXTURE basis, issues no core-capability warrant.**

Every entry in F-0014–F-0027 is FIXTURE-tagged. The friction log's warrant-review rule is
unambiguous: FIXTURE entries cannot support a bucket-(c) core-capability warrant regardless
of how clean the signal looks. The three clusters with bucket-(c)-shaped mechanisms
(Clusters 15 and 16, romanized-form lookup and as-you-type) and the not-present relational
data in Cluster 11 are explicitly discounted on this basis.

No core proposal, no schema change, no grounding amendment, and no §9 assessment follows
from this review.

---

## Bucket-(a) Candidates Identified (Not Authorized)

Six bucket-(a) identification outcomes emerge from this batch. Each is identified only.
None is authorized. Each requires a separate, explicit operator authorization before any
app-tier slice proceeds.

| Candidate                                        | Entries        | Notes                                                                                                             |
| ------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------- |
| Cluster 1 residual — direction-aware placeholder | F-0018         | Extends #189 scope to input placeholder; straightforward chrome item                                              |
| Cluster 12 — direction-mismatch hint             | F-0019         | Simple script-heuristic hint in app tier; any promoted rule needs core governance                                 |
| Cluster 13 — user-facing error messages          | F-0021, F-0025 | Offline detection + input-length guard/message; F-0025 may also warrant a client-side length check before request |
| Cluster 14 — URL-state persistence               | F-0024, F-0026 | Direction + query encoded in URL query string; probable shared fix covering both Back and Refresh                 |
