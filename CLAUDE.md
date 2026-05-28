# lingua-core-platform — Claude Code Project Memory

## Project Identity

Available models: Claude Opus 4.7 and Claude Sonnet 4.6 — use Opus 4.7
for implementation assessment prompts, Sonnet 4.6 for documentation
corrections and targeted fix PRs.

`lingua-core-platform` is a governance-first deterministic multilingual linguistic
runtime platform built as a modular monolith. It is initialized for Thai-English
and is currently at Phase 13 (in progress, slice 1 of 3 complete) with Phase 14
pending authorization. Phase 13 has delivered one slice:
ReadingPrimitiveSearchProjection and WritingPrimitiveSearchProjection
(752 tests, 92.61% coverage).

## Authoritative Session Documents

Read these before any implementation:

- `.claude/SESSION_STATE.md` — current phase status, validation baseline,
  completed slices, deferred scope, and schema version literals
- `.claude/HANDOFF_TEMPLATE.md` — all doctrine laws, session governance
  requirements, and the mandatory pre-implementation assessment format

## Toolchain

- Node 22+
- pnpm 10
- TypeScript 6
- ES Modules

## Validation Chain

Run in this order before every commit:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm validate
```

## Branch Conventions

- Implementation slices: `feat/<phase>-<slice-name>` (e.g. feat/phase12-reading-primitive)
- Documentation and status corrections: `fix/<descriptor>`
- Investigation and architecture exploration: `spike/<descriptor>`
- Do not commit directly to main
- Conventional commits required
