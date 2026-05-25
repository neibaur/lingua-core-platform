# lingua-core-platform — Claude Code Project Memory

## Project Identity

`lingua-core-platform` is a governance-first deterministic multilingual linguistic
runtime platform built as a modular monolith. It is initialized for Thai-English
and is currently at Phase 11 (complete), with all implementation residing in
`src/core/`.

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
