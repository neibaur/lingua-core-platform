These are deep subsystem reference documents, not session-bootstrap governance files, and that they describe completed implementation contracts rather than active phase scope.  Last verified against source: Phase 9 complete.

# Replay Governance Lifecycle

## Purpose

Replay governance defines how deterministic query runtime artifacts become
replay-safe evidence. The lifecycle is structural: each stage consumes completed
immutable data and emits the next immutable governance artifact without
rendering, persistence, telemetry, runtime discovery, or async orchestration.

## Lifecycle State Machine

The replay lifecycle is:

Raw query ingestion -> lexing -> parsing -> compilation -> execution plan
generation -> runtime execution -> tracing/explainability -> snapshot
boundaries -> reconstruction -> replay validation -> replay diff governance ->
aggregation -> governance report composition -> replay audit envelope
composition.

Each transition is deterministic for equivalent input data. A transition may
produce diagnostics, but diagnostics are returned as immutable data rather than
side effects.

## Query Runtime Boundaries

Raw query ingestion accepts the source query as data. The query pipeline then
performs lexing, parsing, compilation, execution plan generation, and runtime
execution under deterministic compiler/runtime rules.

The runtime stages preserve explicit source provenance. Source spans and
sequence coordinates remain data attached to lexemes, AST nodes, execution plan
nodes, traces, explanations, diagnostics, and snapshots. Replay governance does
not infer provenance from clocks, environment state, storage state, or
telemetry.

## Tracing And Explainability Boundary

Tracing and explainability describe completed runtime execution. They are
replay diagnostics and explanation artifacts, not telemetry streams,
performance profilers, or optimizer inputs.

Trace and explanation artifacts must remain JSON-safe and deterministic. Valid
trace metadata is restricted to JSON-safe primitive, array, and plain-object
structures. Runtime objects, iterators, functions, generators, clocks, random
values, and process-sensitive data are outside the replay boundary.

## Snapshot Boundaries

A query replay snapshot wraps one completed artifact in a deterministic
envelope:

- `schemaVersion`, currently `query-snapshot-v1`.
- `artifactKind`.
- `snapshotId`, using `query-snapshot-{number}`.
- `artifact`.

Snapshot creation is a boundary operation. It records the artifact structure
that replay governance can validate, reconstruct, compare, summarize, and wrap
in reports. It does not persist the artifact, render it, or attach operational
metadata.

Snapshot bundles preserve explicit snapshot arrays. Array order is part of the
bundle data and must be supplied deterministically by the caller.

## Reconstruction Boundary

Replay reconstruction accepts already parsed snapshots or serialized canonical
snapshot data. Reconstruction validates the envelope and artifact shape, then
returns immutable replay data or deterministic diagnostics.

Reconstruction does not repair malformed snapshots. It does not migrate schema
versions. It does not recover missing provenance. It does not fetch missing
data from persistence. It classifies invalid replay input through validation
results.

## Replay Validation Boundary

Replay validation verifies JSON safety, snapshot envelope shape, snapshot id
format, schema version, artifact kind, and artifact-specific structure.

Validator orchestration is switch-based and deterministic. Dispatch is based on
the declared validation target, not reflection, plugin registration, class
metadata, dynamic imports, naming conventions, or ambient runtime discovery.

Validation follows railway-oriented behavior:

- valid artifacts return success data.
- invalid artifacts return deterministic diagnostics.
- expected malformed replay input is represented in the validation result.

## Replay Diff Governance Boundary

Replay diff governance compares two replay snapshot structures after the
serialization and compatibility boundaries have made the compared values
explicit. Diffs classify differences by schema version, artifact kind,
snapshot id, provenance, or structural mismatch.

Diff governance does not mutate either side of the comparison. It does not
select runtime execution paths. It does not optimize search behavior. It emits
immutable mismatch data for downstream summary and governance composition.

## Aggregation Stages

Replay diagnostic aggregation composes diagnostics by fixed governance stages:

- validation.
- compatibility.
- diff.
- provenance.

Aggregation orders stages by the implemented fixed stage sequence, and orders
artifacts by the implemented fixed artifact sequence:

- snapshot-envelope.
- query-pipeline-result.
- execution-plan.
- query-explanation.
- query-execution-trace.

Aggregated diagnostics are frozen JSON-safe records. Aggregation is not a log
collector and does not read runtime state.

## Governance Report Composition

`ReplayGovernanceReport` composes validation blocks, compatibility results,
diff results, diff summaries, and diagnostic aggregates into a deterministic
report artifact.

The report contains:

- `reportFormatVersion`.
- `isValid`.
- `compatibility`.
- `summary`.
- `artifactSummary`.
- `diagnostics`.
- `mismatches`.

The report is the canonical replay governance composition artifact. It is not a
presentation model and does not contain markdown, CLI formatting, persistence
metadata, or telemetry fields.

## Replay Audit Envelope Composition

`ReplayAuditReport` wraps a completed `ReplayGovernanceReport` with replay
audit coordinates:

- `auditId: string`.
- `sourceSnapshotId: string`.
- `targetSnapshotId: string`.
- `reportKind: 'REPLAY_AUDIT_REPORT'`.
- `composedAtSequence: number`.
- `governanceReport: ReplayGovernanceReport`.

`auditId` is either caller-supplied or canonically composed from source
snapshot id, target snapshot id, and `composedAtSequence`. No UUID, random
value, hash, timestamp, crypto API, or process-sensitive source may generate an
audit id.

`composedAtSequence` MUST be a non-negative integer primitive. It is a
deterministic sequence coordinate supplied by the caller and must not be
derived from wall-clock time or ambient runtime state.

Audit envelope composition freezes the returned envelope and nested collection
buffers. It preserves the wrapped governance report semantics exactly.

## Immutable Snapshot Transitions

Every lifecycle transition treats its input as a value and emits a new
immutable value. The replay governance lifecycle therefore permits:

- JSON roundtrip validation.
- canonical serialization comparison.
- deterministic diagnostics.
- deterministic governance summaries.
- deterministic audit envelope composition.

It does not permit:

- in-place mutation of replay artifacts.
- hidden cache mutation.
- mutable singleton state.
- lazy runtime initialization.
- environment-sensitive behavior.
- persistence-coupled validation.
