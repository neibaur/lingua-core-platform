# AI Coding Assistant Guidelines

Before performing any implementation work, read
[.claude/HANDOFF_TEMPLATE.md](.claude/HANDOFF_TEMPLATE.md) in full. All
doctrine laws in that file are active, enforced, and override any conflicting
guidance in any other file. Do not proceed past this instruction until that
file has been read.

These guidelines apply to AI coding assistants, including Codex, Cursor, and
similar tools.

## Authoritative Session Documents

Read these before any implementation:

- [.claude/SESSION_STATE.md](.claude/SESSION_STATE.md) — current phase
  status, validation baseline, completed slices, deferred scope, and schema
  version literals. Read this before any implementation to confirm the current
  phase and what is explicitly deferred.
- [.claude/ROADMAP.md](.claude/ROADMAP.md) — phase planning and directional
  scope. Read this for phase sequencing context before proposing new work.

## Architecture and Design Boundaries

Before proposing architectural changes, read [ARCHITECTURE.md](ARCHITECTURE.md)
in full. It is the canonical source for modular monolith principles, directory
layout, public/private boundary, non-goals, and the content-first progression
principle.

All tokenizer driver and search infrastructure work must use the pluggable
layer under `src/core/tokenizers/`. Lexical infrastructure and dictionary data
boundary contracts reside under `src/core/lexical/`. Refer to
[ARCHITECTURE.md](ARCHITECTURE.md) for the confirmed current directory layout.

Do not introduce microservice fragmentation, separate product repositories, or
isolated codebases for multi-tenant domains unless an approved ADR in
`docs/adr/` explicitly authorizes the change.

## Application and UI Tier

Application- and UI-tier code outside `src/core` (for example a user-facing site
consuming the core) is governed by
[APP_SHELL_GUIDELINES.md](APP_SHELL_GUIDELINES.md), not by the core doctrine in
`.claude/HANDOFF_TEMPLATE.md`. It is a deliberately lighter tier: no §9
pre-implementation assessment, no Documentary Derivation Law, no schema-version
literals, no phase gating. Read APP_SHELL_GUIDELINES.md before any application or
UI work. Work inside `src/core` remains governed by HANDOFF_TEMPLATE.md as above.

## ADR Discipline

Document major architectural decisions in `docs/adr/` before making them
binding. Create or update an ADR before changing: core module boundaries,
tenant isolation strategy, tokenizer architecture, data ingestion policy,
security posture, deployment topology, or language expansion strategy.

## Data Boundaries and Safe Licensing

Redact sensitive data before creating commits, issues, pull requests, or
generated artifacts. Do not commit proprietary AI prompts, premium educational
materials, monetization logic, analytics secrets, private configuration keys,
vendor credentials, or tenant-specific data to this public repository.

Before ingesting or committing any linguistic dataset, read
[DATA_SOURCES.md](DATA_SOURCES.md) in full. It is the canonical source for
dataset governance principles, audit requirements, and licensing boundaries.

## Validation

Before recommending merge, read
[.claude/HANDOFF_TEMPLATE.md](.claude/HANDOFF_TEMPLATE.md) §10 for the full
validation chain required before every commit.

If a check is unavailable, stubbed, or intentionally deferred, state that
clearly in the final report instead of treating it as passing coverage.
