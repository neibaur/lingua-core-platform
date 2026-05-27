# docs/validation

Semantic validation layer for `lingua-core-platform`.

## Purpose

Files in this directory are manual validation resources that supplement
automated CI. They are not a replacement for formatting, linting,
typechecking, tests, coverage, or repository validation. They exist
because some correctness properties of a linguistic platform cannot be
fully validated by automated structural tests alone.

Automated tests verify deterministic structural contracts — that builders
return frozen artifacts with correct field values, that invariant guards
throw on invalid input, that schema version literals match expectations.
They do not verify semantic correctness of linguistic behavior — whether
Thai segmentation produces the right tokens for real input, whether
source-coordinate offset reconstruction survives a normalization change,
or whether mixed-script phrase matching preserves source order across
a real document.

These documents fill that gap by giving reviewers a concrete protocol
and concrete inputs rather than relying on intuition during PR review.

## Current Files

| File | Purpose |
| --- | --- |
| `linguistic-regression-checklist.md` | Checklist for PR review when a change affects tokenizer, normalization, search projection, or matching behavior. Lists trigger conditions and review items. |
| `manual-validation-scenarios.md` | Concrete Thai-language input strings, expected segmentation and matching outputs, and offset reconstruction verification targets. Used alongside the regression checklist. |

## When to Run These Files

Run `linguistic-regression-checklist.md` for any PR that changes:

- Normalization rules, rule ordering, or index-map behavior
- Tokenizer drivers, dictionaries, fallback behavior, or segmentation
- Search projection records, source-coordinate mapping, or span extraction
- Term matching, phrase matching, phrase-window logic, or span reconstruction
- Multilingual extensions or any optimization affecting text processing order

These trigger conditions are reproduced in the checklist itself. This
README is not the authoritative source — the checklist is.

## When to Add New Content

Add a new scenario to `manual-validation-scenarios.md` when a phase
introduces new linguistic behavior that automated tests cannot fully
validate semantically. The bar is: would a reviewer need to manually
verify real input/output behavior to be confident a change is correct?
If yes, a scenario belongs here.

Add new items to `linguistic-regression-checklist.md` when a phase
introduces new trigger conditions — new normalization rules, new
matching modes, new projection record types, or new offset-handling
behavior — that reviewers should check explicitly.

Not every phase produces new content here. Phases that introduce only
structural contract types, governance artifacts, or documentation
changes do not require validation scenarios or checklist additions.
The absence of new content for a given phase is intentional.

## Relationship to Automated Tests

These documents do not duplicate what automated tests cover. They cover
what automated tests cannot cover well:

- Semantic correctness of real linguistic input/output
- Offset reconstruction behavior across normalization boundaries
- Mixed-script ordering and span traceability
- Behaviors that are correct-looking in isolation but wrong under
  composition with real text

If a scenario in `manual-validation-scenarios.md` identifies a
regression, the fix should be accompanied by a new automated test
that encodes the specific input/output contract going forward.
Manual scenarios identify gaps; automated tests close them permanently.

## Staleness Policy

Scenarios and checklist items reflect the linguistic behavior of the
implementation at the time they were written. If a future phase changes
normalization rules, segmentation behavior, or offset handling in a
way that makes an existing scenario incorrect, that scenario must be
updated as part of the authorized PR scope. A stale scenario that
describes superseded behavior is a PA.8 conflict surface for any
implementation prompt that explicitly includes these files in its
required reading list.