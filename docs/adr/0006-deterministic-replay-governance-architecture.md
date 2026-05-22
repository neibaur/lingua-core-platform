# ADR 0006: Deterministic Replay Governance Architecture

## Status

Accepted

## Context

The query runtime now emits replay-safe artifacts for deterministic query
execution, explainability, tracing, snapshot reconstruction, compatibility
evaluation, diff governance, diagnostic aggregation, governance report
composition, and replay audit envelope composition.

The replay governance layer is part of the deterministic compiler/runtime
pipeline. It must preserve source provenance, immutable artifact boundaries,
canonical serialization, and exact ordering contracts without adding runtime
discovery, persistence, telemetry, plugin hosting, optimizer behavior, or
environment-sensitive execution.

## Decision

Formalize deterministic replay governance under
`src/core/tokenizers/search/query-snapshots/` as the repository law for replay
certification artifacts.

Replay governance artifacts are synchronous, in-memory, dependency-free,
framework-agnostic, persistence-agnostic, serialization-safe, and immutable.
They describe completed runtime structures; they do not execute queries, mutate
query results, persist records, render reports, emit logs, or discover runtime
capabilities from the environment.

## Snapshot Lifecycle

The replay lifecycle is an explicit compiler/runtime sequence:

Raw query ingestion -> lexing -> parsing -> compilation -> execution plan
generation -> runtime execution -> tracing/explainability -> snapshot
boundaries -> reconstruction -> replay validation -> replay diff governance ->
aggregation -> governance report composition -> replay audit envelope
composition.

Snapshot boundaries are structural boundaries around completed artifacts. A
snapshot records:

- `schemaVersion`, currently `query-snapshot-v1`.
- `artifactKind`, one of the supported replay artifact kinds.
- `snapshotId`, using the deterministic `query-snapshot-{number}` form.
- `artifact`, containing JSON-safe replay data for the target artifact.

Snapshots do not contain clocks, process state, index instances, iterators,
functions, generators, random values, cryptographic material, persistence
handles, telemetry records, or environment-derived data.

## Governance Report Composition

`ReplayGovernanceReport` composes validation blocks, optional compatibility
results, optional replay diff results, optional diff summaries, and optional
diagnostic aggregates into one deterministic governance artifact.

The report records:

- `reportFormatVersion`.
- `isValid`.
- `compatibility`.
- `summary`.
- `artifactSummary`.
- `diagnostics`.
- `mismatches`.

Composition preserves replay-safe aggregation behavior. Validation diagnostics,
compatibility diagnostics, diff diagnostics, aggregate diagnostics, and replay
mismatches are converted into immutable report collections with stable ordering.
The report is descriptive governance output, not a renderer, CLI record,
database schema, or operational telemetry event.

## Replay Audit Envelopes

`ReplayAuditReport` is the audit-ready envelope around a completed
`ReplayGovernanceReport`.

The implemented structure is:

- `auditId: string`.
- `sourceSnapshotId: string`.
- `targetSnapshotId: string`.
- `reportKind: 'REPLAY_AUDIT_REPORT'`.
- `composedAtSequence: number`.
- `governanceReport: ReplayGovernanceReport`.

`auditId` is caller-supplied or derived from a canonical composite identifier
formed from the source snapshot id, target snapshot id, and
`composedAtSequence`. Audit identifiers must not be generated from UUIDs,
randomness, timestamps, hashing, crypto APIs, process state, or ambient
runtime discovery.

`composedAtSequence` is a deterministic caller-provided sequence coordinate.
It is not a timestamp. It is not a logical clock inferred from runtime state.
`composedAtSequence` MUST be a non-negative integer primitive. Callers that
compose replay audit reports are responsible for supplying this value from the
same deterministic sequence model used to identify the replay comparison.

The audit envelope is frozen with its nested governance report collections. The
envelope does not mutate the governance report, reinterpret compatibility, or
materialize rendered output.

## Deterministic Ordering Guarantees

Replay governance report collections use this exact ordering hierarchy:

Stage Tracking Index (Numerical Ascending)
→ Dot-Joined Object Path (Lexicographical Binary)
→ Diagnostic/Mismatch Code (Lexicographical Binary)

The ordering contract applies to diagnostics and mismatches. The object path is
the `path` array joined by `"."` before comparison. The code field is
`diagnostic.code` for diagnostics and `mismatch.code` for mismatches.

Artifact summaries are ordered by stage tracking index numerically ascending,
then artifact target lexicographically. Diagnostic aggregation is ordered by
the fixed aggregation stage sequence and fixed artifact sequence implemented by
the aggregation module.

Ordering must not depend on locale collation, insertion order of noncanonical
objects, runtime process state, filesystem order, environment variables,
randomized iteration, unstable sorting, or implementation-defined object
enumeration assumptions.

## Canonical Serialization Boundaries

`stableJsonStringify` is the canonical serialization boundary for replay-safe
JSON structures. It validates that values are JSON-safe, recursively sorts JSON
object keys, preserves array order, freezes the canonicalized structure, and
serializes with `JSON.stringify`.

`stableJsonParse` parses serialized JSON, then canonicalizes the parsed value
using the same JSON-safe validation and recursive key ordering rules. Parsed
values that contain non-JSON-safe data, circular references, nonfinite numbers,
or nonplain objects are outside the replay contract.

Canonical serialization does not define semantic compatibility by itself.
Equivalence and compatibility are explicit replay governance concepts layered
above canonical JSON representation.

## Validator Governance Model

Replay artifact validation uses explicit switch-based validator orchestration.
The dispatch target is a declared `ReplayArtifactValidationTarget`; validators
are selected by switch cases rather than reflection, registries, plugin
loading, runtime discovery, naming conventions, or dependency injection.

Validation is exception-free for expected malformed replay artifacts. A
validator returns a railway-oriented `QuerySnapshotValidationResult`:

- success with data when the artifact satisfies the target contract.
- failure with deterministic diagnostics when the artifact violates the target
  contract.

Validation diagnostics include stable codes, paths, severities, and messages.
Malformed user or replay data is represented as data in the validation result,
not as ambient side effects.

Canonical equivalence classification is explicit. Two replay artifacts are
equivalent only when their canonical structural representation and replay
governance checks agree. Compatibility classification remains separate from
byte-for-byte serialization equality so future migration-aware governance can
remain explicit.

## Compatibility Classification Philosophy

Replay compatibility is descriptive and conservative.

`PERFECT_MATCH` means the compared replay artifacts are equivalent with no
diagnostics and no mismatches. `FORWARD_COMPATIBLE` means governance detected
structural differences that do not classify the comparison as a breaking
mismatch. `BREAKING_MISMATCH` means diagnostics, incompatible compatibility
results, incompatible diff results, incompatible diff summaries, or breaking
classification data are present.

Compatibility classification does not trigger migrations, rewrite snapshots,
perform repair, persist remediation state, or select optimized execution
paths.

## Immutable Artifact Contracts

Replay governance structures use TypeScript `readonly` and `ReadonlyArray`
contracts at compile time and defensive `Object.freeze` behavior at runtime
where artifacts are composed.

The immutability contract is structural:

- composition functions return frozen envelopes or reports.
- nested collection buffers are frozen.
- report consumers must treat replay artifacts as values.
- mutation after composition is not part of the replay model.

JSON roundtrip safety is required for replay governance artifacts. Values must
remain representable through JSON primitives, arrays, and plain objects without
loss of deterministic governance meaning.

## Consequences

- Replay governance becomes a formal architecture boundary rather than a test
  helper or presentation layer.
- Future runtime introspection work must consume immutable replay governance
  artifacts rather than observe mutable runtime state.
- Replay certification can be layered on top of snapshots, validation,
  compatibility, diffs, aggregation, governance reports, and audit envelopes
  without introducing persistence or operational coupling.
- Any future expansion of artifact kinds, validators, compatibility
  classifications, or audit metadata must preserve deterministic ordering,
  canonical serialization, explicit dispatch, immutable contracts, and
  provenance-preserving replay boundaries.

## Non-Goals

This decision does not introduce rendering, markdown report generation, CLI
output, persistence, telemetry, async orchestration, plugin registries,
runtime capability discovery, distributed replay execution, optimizer-driven
search behavior, or AI orchestration.
