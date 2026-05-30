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

Before we discuss anything, read these six files in order by checking for attachments first, fall back to URLs only if attachments are absent:

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

The following file is provided as a reference URL only. Do not fetch or
read it during bootstrap. Read it only if explicitly instructed to do so
later in the session or if a task directly requires dataset governance
context:

7. https://raw.githubusercontent.com/neibaur/lingua-core-platform/main/DATA_SOURCES.md
   — dataset governance and licensing boundary documentation

After reading all six files listed above, confirm and summarize current
project state in two or three sentences.

Do not discuss phase scope or generate any implementation prompt until
we have confirmed shared understanding and discussed whether any
deferred work or architectural audit should happen first. If Session
State shows the previous phase is COMPLETE and the next phase is
PENDING AUTHORIZATION, flag the pre-authorization audit requirement
before discussing any Phase N+1 scope. The audit scope is defined in
.claude/HANDOFF_TEMPLATE.md §9 phase-transition assessment extension.
