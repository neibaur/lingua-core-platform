# Application Shell Guidelines

Governance for application- and UI-tier code (e.g. apps/usethai) that consumes the
governed core in src/core. This is a deliberately lighter tier than the core
doctrine in HANDOFF_TEMPLATE.md: application code is explicitly outside the core's
scope (ARCHITECTURE Explicit Non-Goals — no frontend framework lock-in, no hosting
commitment), so it is NOT subject to the §9 pre-implementation assessment, the
Documentary Derivation Law, schema-version literals, ADRs, or phase gating. It
follows the rules below instead.

## Boundary

- Application/UI code lives outside src/core. The dependency is one-way: the app
  imports the core; the core never imports the app.
- The app consumes the core only through its public barrels (index.ts exports),
  never by reaching into internal core files. Direct imports of non-exported core
  modules (e.g. importing from "../../src/core/lexical/lookup/lexical-lookup"
  instead of the lexical barrel) are prohibited. If the app needs a capability the
  core does not expose through a public barrel, expose it through core governance —
  do not bypass the boundary.
- The app must not mutate core objects. Core artifacts are deep-frozen; mutation
  throws — that is the contract, not an obstacle to work around.

## Doctrine isolation

- The app introduces no core schema-version literals, ADRs, grounding amendments,
  or changes to source contracts.
- The app does not alter core doctrine. Core behavior changes go through core
  governance, never the app.
- Any reusable business rule discovered while building the app must be promoted
  back through core governance (grounding + assessment) before becoming core
  behavior. It may live in the app provisionally; it is not core until governed.
- Spike/prototype code must never silently become governed core code.

## Latitude

- The app may use pragmatic framework conventions (Astro, Vite, Cloudflare
  adapter, file-based routing) without core-style justification.
- App dependencies, build tooling, and deploy config are the app's own concern.

## Application validation

- Application code must pass the full set of checks the project enforces over
  the app directory: format (Prettier), lint (ESLint at the
  repository-enforced config and strictness level — not a relaxed local
  subset), type-check, and build. Apps with tests must also pass them.
- "App validation" means the same gate CI/CD enforces over the app directory.
  Running a partial subset — for example, `astro check` alone — does not
  satisfy it. Every applicable check must be run and its result reported
  per-command before app work is declared validated or proposed for merge.
- These checks are satisfied by fixing the source. Suppressing rules, adding
  blanket `eslint-disable` comments, loosening the enforced config, or passing
  bypass flags do not satisfy them. A check that cannot pass is surfaced and
  fixed, not silenced.
- Core and application validation chains are independent concerns.
- Failing application validation is not excused because the code lives outside
  src/core; "not governed by core doctrine" does not mean "not validated."

## Data

- App seed/fixture data used in development is the app's own, illustrative, and
  carries no core grounding.
- App fixtures must not fabricate or copy the source-provenance lineage that
  governed dictionary entries carry (DictionarySourceProvenance /
  CanonicalDictionaryEntry); they are development data, not canonical provenanced
  records.
- Real linguistic datasets remain governed by DATA_SOURCES.md before ingestion,
  wherever they are consumed.
