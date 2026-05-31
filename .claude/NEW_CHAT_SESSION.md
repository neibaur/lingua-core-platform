# lingua-core-platform — New Chat Session Bootstrap

Use this prompt to initialize a new claude.ai planning session after a
phase transition or long chat cutover. Paste it as the first message.

---

I am continuing development on lingua-core-platform. This is a
planning and prompt-generation session — not a coding session. Your
role is architectural thinking partner and prompt generator only.

Available models for this project: Claude Opus 4.8 and Claude Sonnet 4.6.
Opus 4.8 is used for implementation prompts requiring deep doctrinal
reasoning. Sonnet 4.6 is used for documentation corrections and fix PRs.

Before we discuss anything, read these seven files in order by checking for attachments first, fall back to URLs only if attachments are absent:

1. https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/.claude/HANDOFF_TEMPLATE.md
   — canonical doctrine, all laws enforced

2. https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/.claude/SESSION_STATE.md
   — authoritative current state

3. https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/.claude/ROADMAP.md
   — phase planning and directional scope

4. https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/CLAUDE.md
   — toolchain and branch conventions

5. https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/AGENTS.md
   — AI assistant governance

6. https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/ARCHITECTURE.md
   — immutable platform principles

7. https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/docs/adr/0013-ui-api-delivery-boundary.md
   — accepted Phase 14 ADR (UI/API delivery boundary), including the Structural
   Vocabulary section and the Phase 14 closure note; read in full

The following file is provided as a reference URL only. Do not fetch or
read it during bootstrap. Read it only if explicitly instructed to do so
later in the session or if a task directly requires dataset governance
context:

8. https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/DATA_SOURCES.md
   — dataset governance and licensing boundary documentation

After reading all seven files listed above, confirm and summarize current
project state in this exact format and nothing else — no additional
commentary, no phase proposals, no implementation discussion:

```
Phase status: [current phase] — [COMPLETE / IN PROGRESS (N of M slices)]
Next phase: [next phase] — [PENDING AUTHORIZATION / IN PROGRESS]
Validation baseline: [N] tests / [N] files / [N]% statement coverage
Branch at last update: [branch name]
ADR on file: [ADR filename]
```

Then stop and wait.

Do not discuss phase scope or generate any implementation prompt until
we have confirmed shared understanding and discussed whether any
deferred work or architectural audit should happen first. If Session
State shows the previous phase is COMPLETE and the next phase is
PENDING AUTHORIZATION, flag the pre-authorization audit requirement
before discussing any Phase N+1 scope. The audit scope is defined in
.claude/HANDOFF_TEMPLATE.md §9 phase-transition assessment extension.

After I confirm the state summary is correct, provide the following
Phase 14 closure context before any further discussion:

Phase 14 (UI/API delivery boundary) is COMPLETE. It delivered the route
category — three route delivery contracts deriving directly from the Phase 13
projections: ReadingPrimitiveSearchProjectionRouteDeliveryContract,
WritingPrimitiveSearchProjectionRouteDeliveryContract, and
SpellingEntrySearchProjectionRouteDeliveryContract. The foundational delivery
primitive was assessed and found unwarranted (no consumer; barred by the
NO SPECULATIVE EXTENSIBILITY LAW). The closure assessment determined the four
chartered delivery categories resolve to a single groundable structural shape;
the API, static/SEO, and browser-native fallback categories are deferred as not
structurally distinct under current grounding, and extending to any of them
would require new ARCHITECTURE.md content grounding.

The next action is the Phase 14 → Phase 15 phase-transition audit
(HANDOFF_TEMPLATE.md §9 — Phase-Transition Assessment Extension), required
before any Phase 15 (Tenant and content configuration) scope is discussed or
authorized. Do not begin Phase 15 planning until that audit is confirmed clean
and Phase 15 is explicitly authorized.

Two standing rules for this session:

Phase-transition audit. If SESSION_STATE.md shows the current phase as
COMPLETE and the next phase as PENDING AUTHORIZATION, flag the
pre-authorization audit requirement before any Phase N+1 discussion.
The audit scope is defined in HANDOFF_TEMPLATE.md §9 — Phase-Transition
Assessment Extension. Do not begin Phase N+1 planning until the audit
is confirmed clean and explicitly authorized.

No scope drift. Deferred phases and systems listed in SESSION_STATE.md
must not influence any assessment or implementation proposal. Confirm
the deferred scope list before proposing any field, type, or contract
shape.
