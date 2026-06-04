# lingua-core-platform — Claude Code Project Memory

## Project Identity

Available models: Claude Opus 4.8 and Claude Sonnet 4.6 — use Opus 4.8
for implementation assessment prompts, Sonnet 4.6 for documentation
corrections and targeted fix PRs.

`lingua-core-platform` is a governance-first deterministic multilingual
linguistic runtime platform built as a modular monolith, initialized for
Thai-English. Current phase, validation baseline, next action, and last accepted
ADR live in the Per-PR Update Block at the top of `.claude/SESSION_STATE.md` —
read them there; do not restate them in this file.

## Authoritative Session Documents

Read these before any implementation:

- `.claude/SESSION_STATE.md` — current phase status, validation baseline,
  completed slices, deferred scope, and schema version literals
- `.claude/HANDOFF_TEMPLATE.md` — all doctrine laws, session governance
  requirements, and the mandatory pre-implementation assessment format
- `.claude/settings.json` is tool-managed and excluded from formatting validation because Claude Code may  
  rewrite it during permission persistence.
- `APP_SHELL_GUIDELINES.md` — governance for application/UI-tier code outside
  `src/core` (e.g. `apps/`). A lighter tier than core doctrine; read it before
  app/UI work. Core work follows `.claude/HANDOFF_TEMPLATE.md`.

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
