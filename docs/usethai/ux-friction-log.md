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

### F-0001 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~10 minutes)
- Query: hello Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: no
- Expected: A Thai greeting result (e.g. สวัสดี)
- Actual: No exact match for "hello"
- Friction type: ENTRY-ABSENT
- Notes: Expected a common greeting to be present. The lookup behaved as an exact-key search and returned a not-found state.

### F-0002 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~10 minutes)
- Query: eat Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: yes
- Expected: Result for กิน
- Actual: No exact match for "eat"
- Friction type: QUERY-FORM-UNMATCHED
- Notes: The concept was known to exist in the fixture via the gloss "to eat", but the shorter query form "eat" did not reach it.

### F-0003 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~15 minutes)
- Query: old Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: yes
- Expected: Understand the pronunciation differences between the returned Thai entries.
- Actual: The lookup returned two entries, เก่า (kao) and แก่ (kae), each with a romanized form but without tone/accent markings.
- Friction type: RESULT-PRESENT-HARD-TO-USE
- Notes: The result was successfully returned, but the romanized forms did not communicate tone information. During use, it was difficult to determine how the pronunciations differed compared with references that include tone-marked romanization.

### F-0004 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~20 minutes)
- Query: old Direction: en→th
- Surface exercised: lookup UI result presentation
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: yes
- Expected: The page heading and result presentation would clearly reinforce that I was performing an English → Thai lookup.
- Actual: The page title remained "Use Thai - Thai word lookup" regardless of lookup direction.
- Friction type: RESULT-PRESENT-HARD-TO-USE
- Notes: During English → Thai lookups the page title did not appear to reflect the active lookup direction.

### F-0005 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~20 minutes)
- Query: To eAt Direction: en→th
- Surface exercised: query echo presentation
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: yes
- Expected: A result for the concept "to eat."
- Actual: The lookup succeeded and returned กิน. The query echo displayed the original mixed-case input exactly as entered.
- Friction type: RESULT-PRESENT-HARD-TO-USE
- Notes: The echoed query looked unusual because the original mixed-case input was preserved.

### F-0006 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~20 minutes)
- Query: old Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: yes
- Expected: Understand why two Thai entries were returned and when each would be used.
- Actual: The lookup returned both เก่า and แก่ with the same English gloss "old."
- Friction type: RESULT-PRESENT-HARD-TO-USE
- Notes: The result successfully returned multiple entries, but there was insufficient information to understand the distinction between them.

### F-0007 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~20 minutes)
- Query: old! Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: yes
- Expected: Same result as searching for "old".
- Actual: No exact match was returned.
- Friction type: QUERY-FORM-UNMATCHED
- Notes: The target concept was present in the fixture, but adding punctuation prevented the query from reaching it.

### F-0008 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~20 minutes)
- Query: eating Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: yes
- Expected: Result for กิน.
- Actual: No exact match was returned.
- Friction type: QUERY-FORM-UNMATCHED
- Notes: The target concept existed in the fixture via the gloss "to eat," but the inflected form "eating" did not reach it.

### F-0009 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~25 minutes)
- Query: กรุงเทพมหานคร อมรรัตนโกสินทร์ Direction: th→en
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: unknown
- Expected: Attempt a Thai → English lookup for the entered Thai text.
- Actual: The lookup returned a warning diagnostic. Primary message: "Enter a single term with no spaces." Secondary message: `Thai query must not contain whitespace: "กรุงเทพมหานคร อมรรัตนโกสินทร์"`. The state also explained that Thai → English looks up one Thai token.
- Friction type: QUERY-FORM-UNMATCHED
- Notes: The entered text was valid Thai text containing whitespace. The lookup surface rejected the query because it was not a single whitespace-free Thai token.

### F-0010 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~30 minutes)
- Query: กิน ข้าว Direction: th→en
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: yes
- Expected: A lookup result related to the entered Thai phrase.
- Actual: The lookup returned a warning diagnostic indicating that Thai queries must not contain whitespace and that Thai → English looks up a single Thai token.
- Friction type: QUERY-FORM-UNMATCHED
- Notes: The entered text consisted of multiple Thai words separated by whitespace. The lookup surface rejected the query because it was not a single whitespace-free Thai token.

### F-0011 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~30 minutes)
- Query: ฉันกินข้าว Direction: th→en
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: unknown
- Expected: Some form of lookup result related to the entered Thai text.
- Actual: No exact match was returned.
- Friction type: QUERY-FORM-UNMATCHED
- Notes: The entered text was a complete Thai sentence rather than a single lexical lookup key. The query did not reach a result.

### F-0012 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~30 minutes)
- Query: old Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: yes
- Expected: Understand the pronunciation differences between the returned Thai entries.
- Actual: The lookup returned both เก่า (kao) and แก่ (kae). Romanized forms were present but did not clearly communicate pronunciation differences or tone distinctions.
- Friction type: RESULT-PRESENT-HARD-TO-USE
- Notes: The lookup succeeded and returned results. Difficulty occurred when attempting to understand how the returned pronunciations differed.

### F-0013 — 2026-06-07

- Session context: Manual testing of the post-P1 lookup UI (~30 minutes)
- Query: กิน? Direction: th→en
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: enriched seed fixture (post-P1)
- Target confirmed present in data: yes
- Expected: Same result as searching for กิน.
- Actual: No exact match was returned.
- Friction type: QUERY-FORM-UNMATCHED
- Notes: The target word exists in the fixture. Adding punctuation prevented the query from reaching the result.

### F-0014 — 2026-06-09

- Session context: Manual comparison testing against an external Thai dictionary reference while reviewing the current UseThai lookup experience
- Query: กิน Direction: th→en
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/manual lookup compared against external reference screenshots
- Target confirmed present in data: yes
- Expected: Understand the displayed pronunciation for กิน and how to interpret the romanized form.
- Actual: UseThai returned กิน with romanized form "kin" and definition "to eat." The external reference displayed a different romanized form, "gin," for the same Thai word.
- Friction type: RESULT-PRESENT-HARD-TO-USE
- Notes: The lookup succeeded, but the romanized form was difficult to interpret because the transcription system was not apparent during use. The friction was not that the lookup failed, but that a non-Thai speaker comparing references could not tell why the same Thai word appeared with different romanized spellings.

### F-0015 — 2026-06-09

- Session context: Manual comparison testing while reviewing whether a beginner can understand common usage of returned Thai words
- Query: กิน Direction: th→en
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/manual lookup compared against external reference screenshots
- Target confirmed present in data: yes
- Expected: Understand the meaning of กิน well enough to recognize common usage beyond the narrow English gloss.
- Actual: UseThai returned the definition "to eat." The external reference indicated usage that also covers consuming drinks or medicine, which is not obvious from the returned UseThai definition alone.
- Friction type: RESULT-PRESENT-HARD-TO-USE
- Notes: The result was present and correct at a basic level, but the displayed definition was too narrow for a learner to understand common usage contexts observed in comparison material.

### F-0016 — 2026-06-09

- Session context: Manual comparison testing while reviewing how much context a learner gets after a successful Thai → English lookup
- Query: กิน Direction: th→en
- Surface exercised: lookup UI result presentation
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/manual lookup compared against external reference screenshots
- Target confirmed present in data: yes
- Expected: After a successful lookup for a common Thai word, see enough surrounding usage context to understand how the word appears in related words or phrases.
- Actual: UseThai returned the single entry for กิน with its romanized form and definition. The comparison reference showed related words/phrases and example sentence material using กิน, but that surrounding context was not visible in the UseThai result.
- Friction type: RESULT-PRESENT-HARD-TO-USE
- Notes: The lookup itself succeeded. The friction was that the returned result was isolated, making it harder to understand how the word appears in common compounds or sentence contexts.

### F-0017 — 2026-06-09

- Session context: Manual comparison testing of English → Thai lookup breadth
- Query: old Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/manual lookup compared against external reference screenshots
- Target confirmed present in data: yes
- Expected: Understand whether the returned Thai translations represented the full set of common Thai options for "old."
- Actual: UseThai returned เก่า and แก่. The comparison reference displayed additional Thai forms associated with "old," including เก่าๆ and เก่าแก่.
- Friction type: RESULT-PRESENT-HARD-TO-USE
- Notes: This is distinct from the prior tone and homograph-disambiguation entries. The result was present, but comparison testing made the result set feel incomplete or difficult to evaluate for coverage. The presence of the additional Thai forms in the current UseThai data was not confirmed.

### F-0018 — 2026-06-09

- Session context: Manual testing of lookup direction and search-box guidance
- Query: กิน Direction: en→th
- Surface exercised: lookup UI input placeholder / lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/manual lookup
- Target confirmed present in data: yes, but in the opposite direction
- Expected: The example shown in the search box would be usable in the currently selected lookup direction.
- Actual: The search box showed a Thai example, "Type a word, e.g. กิน," even while English → Thai mode was selected. Entering the displayed Thai example in English → Thai mode did not reach the Thai → English entry.
- Friction type: OTHER
- Notes: The friction came from the input guidance and active direction being out of sync. The target word exists in the fixture, but following the displayed example under the selected direction led to a not-found result.

### F-0019 — 2026-06-09

- Session context: Manual testing of direction-selection friction while comparing UseThai with a single-search-box external reference
- Query: old Direction: th→en
- Surface exercised: lookup direction selector / lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/manual lookup
- Target confirmed present in data: yes, but in the opposite direction
- Expected: Entering an English word that exists in the dictionary would reach the English → Thai result or make the direction mismatch clear.
- Actual: With Thai → English selected, the English query "old" did not reach the existing English → Thai result for old.
- Friction type: OTHER
- Notes: The target concept exists in the fixture for English → Thai lookup. The friction was caused by the user needing to choose the correct lookup direction before entering the query.

### F-0020 — 2026-06-09

- Session context: Manual comparison testing of a common Thai word with multiple meanings
- Query: เอา Direction: th→en
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/manual lookup compared against external reference screenshots
- Target confirmed present in data: yes
- Expected: Understand how many meanings the Thai word เอา has and how common or usable the returned senses are.
- Actual: UseThai returned definitions corresponding to "to take" and "to want." The comparison reference showed additional meaning/context, including an "ok/right/well" sense and metadata indicating multiple meanings, common usage, and pronunciation availability.
- Friction type: RESULT-PRESENT-HARD-TO-USE
- Notes: The lookup succeeded and returned multiple definitions, but the result did not make the breadth, commonness, or pronunciation context of the word easy to assess during use.

### F-0021 — 2026-06-09

- Session context: Manual testing of the lookup UI while the browser/network connection was offline
- Query: not recorded Direction: not recorded
- Surface exercised: lookup request / error state presentation
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/local dev app
- Target confirmed present in data: unknown
- Expected: The app would explain that the lookup could not complete because the browser was offline or the network request failed.
- Actual: The UI displayed: `Lookup failed ERROR The lookup request could not be completed: Failed to fetch`.
- Friction type: DIAGNOSTIC-UNCLEAR
- Notes: The lookup failure was caused by the offline/network state, but the displayed message exposed a low-level fetch failure rather than making the offline/network condition clear to the user.

### F-0022 — 2026-06-09

- Session context: Manual testing of whether a user can look up a Thai word by the way it sounds in roman letters
- Query: kin Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/local dev app
- Target confirmed present in data: yes
- Expected: Some result related to กิน / "to eat," because the entered roman letters matched the displayed romanized pronunciation seen in the Thai → English result.
- Actual: No exact match was returned.
- Friction type: QUERY-FORM-UNMATCHED
- Notes: The target word exists in the fixture as กิน and appears with romanized form "kin" in the Thai → English result, but entering the romanized form as a lookup query did not reach the entry.

### F-0023 — 2026-06-09

- Session context: Manual testing of whether a user can look up a Thai word by an alternate romanized spelling observed in comparison material
- Query: gin Direction: en→th
- Surface exercised: lexical exact-key lookup endpoint
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/local dev app compared against external reference material
- Target confirmed present in data: yes
- Expected: Some result related to กิน / "to eat," because the entered roman letters matched an alternate romanized form observed in external reference material.
- Actual: No exact match was returned.
- Friction type: QUERY-FORM-UNMATCHED
- Notes: The target word exists in the fixture as กิน, but the alternate romanized spelling did not reach the entry. This is distinct from the romanization-display friction: here the lookup query itself was a romanized sound form.

### F-0024 — 2026-06-09

- Session context: Manual testing of repeated lookups followed by browser Back navigation
- Query: multiple lookup queries, exact sequence not recorded Direction: mixed / not recorded
- Surface exercised: browser navigation behavior / lookup UI state
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/local dev app
- Target confirmed present in data: unknown
- Expected: After performing several lookups, the browser Back button would move back through earlier lookup states or prior searches within UseThai.
- Actual: Pressing the browser Back button returned to the site visited before `localhost:4321` instead of navigating through earlier UseThai lookup states.
- Friction type: OTHER
- Notes: The observed friction was not about a lookup result. It was about search/navigation state not being represented in browser history during the manual session.

### F-0025 — 2026-06-09

- Session context: Manual stress testing of the lookup input with a very long pasted query
- Query: approximately 4,405 characters, mostly blank spaces, with `old` included Direction: en→th
- Surface exercised: lookup request / error state presentation
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/local dev app
- Target confirmed present in data: yes
- Expected: The app would either handle the pasted input gracefully or clearly explain that the lookup input was too long.
- Actual: The UI displayed a lookup failure: `The lookup request failed (HTTP 431)`. The terminal also logged a Vite 431 warning for request header fields too large.
- Friction type: DIAGNOSTIC-UNCLEAR
- Notes: An error for excessive input length was understandable, but the displayed HTTP 431 message was not learner-facing and did not clearly explain the excessive-input condition.

### F-0026 — 2026-06-09

- Session context: Manual testing of page refresh behavior after changing lookup direction and query
- Query: old Direction: en→th
- Surface exercised: page reload / lookup UI state
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/local dev app
- Target confirmed present in data: yes
- Expected: Refreshing the page after searching for `old` in English → Thai mode would preserve the active direction and query state.
- Actual: Refreshing the page returned the UI to the default Thai → English state with กิน pre-populated and its definition loaded.
- Friction type: OTHER
- Notes: The lookup result for `old` was present before refresh, but the refreshed page did not preserve the user’s active lookup direction or query state.

### F-0027 — 2026-06-09

- Session context: Manual testing of the lookup input while typing rather than submitting a full exact query
- Query: partial typed input, exact characters not recorded Direction: not recorded
- Surface exercised: lookup input behavior
- Data basis: FIXTURE
- Data snapshot/source: current UseThai fixture/local dev app
- Target confirmed present in data: unknown
- Expected: While typing, the input would provide some indication of matching available words or otherwise guide the user toward valid lookup keys.
- Actual: The page remained static while typing; no matching words, completion hint, or intermediate guidance appeared before submitting a lookup.
- Friction type: QUERY-FORM-UNMATCHED
- Notes: This observation is about input guidance during typing rather than a submitted lookup result. Because it concerns partial/as-you-type behavior, it should remain evidence only and not be treated as a search-capability warrant without later review.

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

A first warrant-review triage was convened 2026-06-07 on the FIXTURE batch (F-0001–F-0013).
Result persisted at docs/usethai/warrant-review-2026-06-07.md. FIXTURE basis — no
core-capability warrant issued.
