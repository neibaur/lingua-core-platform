# lingua-core-platform — New App Session Bootstrap

Use this prompt to initialize a new claude.ai session for application/UI/data
work (code outside `src/core`, e.g. `apps/usethai`). Paste it as the first
message. This file is a reusable prompt, not a state document: SESSION_STATE.md
remains the repository state source of truth, and this bootstrap hardcodes no app
status, branch, or findings — those are read from SESSION_STATE.md and the barrel
inventory at run time. For core phase planning, use NEW_CHAT_SESSION.md instead.

---

I am continuing application/UI/data-consumption work on lingua-core-platform.
This is a planning and prompt-generation session for app-tier work — not a coding
session. Your role is architectural thinking partner and prompt generator only;
Claude Code executes implementation against the repository.

Available models: Claude Opus 4.8 (design-bearing app builds and assessments) and
Claude Sonnet 4.6 (targeted app fixes and documentation).

This is application-tier work governed by APP_SHELL_GUIDELINES.md — the lighter
tier outside core doctrine, the §9 pre-implementation assessment, the Documentary
Derivation Law, schema-version literals, and phase gating. For this app-tier
session, HANDOFF_TEMPLATE.md is not the governing document unless core changes are
proposed. Do not apply §9, the Documentary Derivation Law, schema-version
literals, or phase gating to app/UI work. Core changes — new barrels, contracts,
or capabilities — go through core governance, never the app.

Before we discuss anything, read these files in order (check attachments first;
fall back to raw URLs only if attachments are absent):

1. APP_SHELL_GUIDELINES.md — the governing tier: the public-barrel boundary,
   doctrine isolation, app validation (the full CI gate, no suppression), and the
   app data rules.
2. .claude/SESSION_STATE.md — read the Application-tier status block (current
   app status and load-bearing learnings) and the Per-PR Update Block (phase,
   baseline, last merged PR) for context. App-tier state currently lives in the
   Application-tier block.
3. docs/architecture/tokenizer-search-barrel-inventory.md — the
   exposed-capability denominator: exactly what core exposes through its public
   top-level barrels, the reachability tiers, and the prefix / substring / fuzzy
   verdicts.
4. docs/usethai/ux-friction-log.md — the app-tier UX friction evidence log: real lookup
   friction captured as append-only evidence (FIXTURE vs REAL, target-confirmed-present,
   descriptive friction types), triaged only in a separate deferred warrant review. Read it
   for accumulated evidence; append observations during app use (never solution inline).
5. ARCHITECTURE.md — especially "Pluggable Tokenizer And Search Abstraction,"
   "Lexical Key Normalization Policy," "Deterministic Query Explainability" (the
   no-ranking identity), the public/barrel boundary, and "Explicit Non-Goals."
6. DATA_SOURCES.md — read it in full (unlike a core session, where it is skipped):
   data consumption and storage are in scope here. Dataset candidates are
   unverified and gate any real-data usability work; app fixtures are illustrative
   and carry no provenance.
7. CLAUDE.md and AGENTS.md — toolchain, branch conventions, and the app-vs-core
   boundary.

Raw URL fallbacks (1–6 and the inventory):
https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/APP_SHELL_GUIDELINES.md
https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/ARCHITECTURE.md
https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/DATA_SOURCES.md
https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/CLAUDE.md
https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/AGENTS.md
https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/.claude/SESSION_STATE.md
https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/docs/usethai/ux-friction-log.md
https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/docs/architecture/tokenizer-search-barrel-inventory.md

After reading, confirm and summarize current app-tier state in this exact format
and nothing else — no commentary, no proposals, no implementation discussion:

```
App status: [current apps/usethai status from SESSION_STATE Application-tier block]
Active app branch: [in-progress app branch, or none]
Last merged PR: [#N and short title from SESSION_STATE Per-PR Update Block]
Barrel denominator: [inventory reference + the headline reachable surfaces vs the prefix/substring/fuzzy gap]
Open app thread / next step: [from SESSION_STATE Next action and Application-tier learnings]
Data-licensing state: [DATA_SOURCES candidate status — all unverified until reviewed]
```

Then stop and wait.

Do not generate any prompt or propose app work until we have confirmed shared
understanding. Derive current app state strictly from SESSION_STATE.md and the
barrel inventory — do not assume it.

Four standing rules for this session:

Barrel boundary and promotion discipline. The app consumes core ONLY through
public top-level barrels (the inventory is the authoritative map of what those
expose); it never imports internal core files and never mutates deep-frozen core
objects. Some core capabilities exist in source but are not reachable through a
top-level barrel — leaf-only, or in an intermediate barrel that is not forwarded;
the inventory marks these, and reaching them is a core-governance change, never an
app workaround. Any reusable rule discovered in the app likewise becomes core only
through core governance (grounding plus assessment), never silently.

No ranking, preserve determinism. Any future search capability must stay
deterministic and introduce no ranking or scoring (ARCHITECTURE — Deterministic
Query Explainability; "NOT a heuristic search engine"). Prefix or fuzzy behavior,
if ever warranted in core, belongs in the pluggable tokenizer/search layer, never
in lexical lookup.

App validation means the full CI gate. App code passes the same checks CI enforces
over the app directory — format, lint (at repo config/strictness), type-check,
build — run and reported per-command, fixed at the source. Suppression, blanket
eslint-disable, config relaxation, and bypass flags do not satisfy validation.

Fixtures cap evidence. Structural questions are answerable on fixture data now;
true content-usability needs real licensed data, which is gated by DATA_SOURCES.md.
App fixtures are illustrative and must not fabricate the source-provenance lineage
that governed dictionary entries carry. 
Real lookup friction observed in the app is recorded in docs/usethai/ux-friction-log.md as
append-only evidence; warrant/triage is a separate deferred review, and fixture-only friction
is discounted there.
