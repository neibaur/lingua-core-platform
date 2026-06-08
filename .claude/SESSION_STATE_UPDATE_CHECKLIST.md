# SESSION_STATE Update Checklist

Run before committing any SESSION_STATE.md edit. Goal: make "what to update"
mechanical, not a judgment call.

1. Classify the PR
   [ ] Does this PR touch src/core? (Y / N)

2. Volatile fields (Per-PR Update Block) — change only what moved
   [ ] Current phase — only on an authorized phase transition (§9 audit first).
   [ ] Last accepted ADR — only if this cycle accepted a new ADR.
   [ ] Last merged PR — the PR merged immediately BEFORE this in-flight one.
   Never the PR carrying this edit. It always lags by one cycle.
   [ ] Next action — rewrite to the SINGLE next concrete step. Keep it short.
   No PR numbers in the prose (DRY); name slices/spikes, don't number them.

3. Baseline — only if src/core changed
   [ ] src/core changed → set Tests / Test files / Coverage from THIS cycle's
   actual `pnpm test:coverage` (PA.7).
   [ ] docs-only / app-tier / spike → leave Tests / files / coverage UNCHANGED.
   (Most common mistake: a docs PR does not move the baseline.)

4. Append-only logs — add a line, never rewrite
   [ ] Completed Slices — only for a merged src/core slice (not app, not spikes).
   [ ] Schema Version Literals — append any new literal this cycle introduced.
   [ ] Investigation Log — append any docs-only spike or triage.
   [ ] Open Doctrinal Questions — append or mark resolved as applicable.

5. App-tier block — only if app work merged
   [ ] Application-tier — current state: status / active branch / evidence.

6. Deferred Scope
   [ ] Add anything newly deferred; confirm nothing deferred leaked into Next action.

7. Consistency pass
   [ ] Last merged PR number + title appears exactly once in the whole doc.
   [ ] Baseline matches the last src/core PR's PA.7 output.
   [ ] Any document-vs-reality gap is surfaced, not silently reconciled
   (GOVERNANCE DOCUMENT PRECEDENCE LAW).
