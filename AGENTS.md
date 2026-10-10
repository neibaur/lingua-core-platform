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

## Agent Operations Rails

These rails apply to every AI agent working in this repository and match the
`neibaur-labs/agent-ops` contract. Where another section of this file is
stricter, the stricter rule wins.

- **Commits, not merges.** Agents may commit and push their own work to feature
  branches. Agents never push to `main`, and never merge, approve, or close pull
  requests.
- **Protected paths: agents edit, the maintainer commits.** Agents may edit
  agent-instruction files (`AGENTS.md`, `CLAUDE.md`, and similar), `.github/**`,
  `LICENSE`, and skill directories, but the maintainer commits and pushes those
  changes. The agent keeps them out of its own commits, hands off the exact
  `git add`, `git commit`, and `git push` commands, waits for the maintainer's
  commit, then continues the task.
- **Dependencies.** Install from the committed lockfile
  (`pnpm install --frozen-lockfile`), except while making a dependency change.
  Agents may add, upgrade, or remove dependencies when a task needs it. They
  make and verify the change (frozen install, `pnpm validate`, `pnpm audit`),
  then wait for the maintainer's explicit authorization or hand off the commit.
  Keep dependency changes in their own commit, and list each one in the PR
  description with an exact version verified against a current source.
  - **Advisory fixes are pre-authorized.** An agent may commit a dependency
    change without waiting when all of these hold: it is a minor or patch
    change to an existing dependency or override pin (a new override pin for a
    package already in the lockfile counts) that fixes an advisory reported by
    `pnpm audit`; the version meets the release-age rule below; frozen install,
    `pnpm audit`, and `pnpm validate` pass; and it is its own commit. New
    dependencies, major versions, removals, `ignoreGhsas` entries, and trust
    exclusions still wait for authorization or a handoff.
  - **Release age.** Use only versions published at least 7 days ago, checked
    on the registry, not recalled. A version that fixes an advisory reported by
    `pnpm audit` is exempt: use it as soon as it is published. If it is younger
    than 7 days, add a version-pinned `minimumReleaseAgeExclude` entry
    (`package@version`, never a bare package name) and say so in the PR
    description.
  - **Fix deadline.** High and critical advisories are fixed within 7 days of a
    patched version being published. The weekly `dependency-audit` workflow
    opens an issue that lists the open ones. They do not block unrelated pull
    requests: the `audit-gate` check fails only a pull request that introduces
    one (`neibaur-labs/agent-ops`, `docs/adr/0001`).
  - **No usable fix.** If an advisory has no patched version, do not add an
    exception on your own. Open an issue with the advisory, the affected
    dependency path, and the proposed dated `ignoreGhsas` entry.
- **Pull request size.** One concern per pull request, or two when they are
  tightly coupled. There is no line cap; the ceiling is 20,000 changed lines,
  excluding lockfiles and generated files.
- **Secrets.** Agents never read, print, or commit secret-bearing files.
- **Labels.** Label agent-assisted pull requests `ai-assisted` and include
  `Co-authored-by` trailers.
