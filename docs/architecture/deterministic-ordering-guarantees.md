These are deep subsystem reference documents, not session-bootstrap governance files, and that they describe completed implementation contracts rather than active phase scope.  Last verified against source: Phase 9 complete.

# Deterministic Ordering Guarantees

## Purpose

Deterministic ordering is part of replay correctness. Replay governance
artifacts must compare, serialize, validate, aggregate, and audit in stable
order for equivalent inputs. Ordering rules are explicit data contracts, not
incidental implementation behavior.

## Governance Report Ordering Matrix

Replay governance report diagnostics and mismatches use this exact ordering
hierarchy:

Stage Tracking Index (Numerical Ascending)
→ Dot-Joined Object Path (Lexicographical Binary)
→ Diagnostic/Mismatch Code (Lexicographical Binary)

The first comparison key is `stageTrackingIndex`. It is compared as a number in
ascending order.

The second comparison key is the object path. The path array is joined with
`.` before comparison. The resulting dot-joined object path is compared with
binary lexicographical string ordering.

The third comparison key is the diagnostic or mismatch code. Diagnostics use
the diagnostic `code`; mismatches use the mismatch `code`. The code is compared
with binary lexicographical string ordering.

No other key may precede these keys for diagnostics or mismatches.

## Artifact Summary Ordering

Governance artifact summaries are ordered by:

- `stageTrackingIndex` numerically ascending.
- `artifactTarget` using binary lexicographical string ordering.

Artifact summary ordering exists to make report summaries stable. It does not
replace the diagnostic and mismatch ordering matrix.

## Diagnostic Aggregation Ordering

Replay diagnostic aggregation uses fixed stage order:

- validation.
- compatibility.
- diff.
- provenance.

Within aggregation stage ordering, artifact order is fixed as:

- snapshot-envelope.
- query-pipeline-result.
- execution-plan.
- query-explanation.
- query-execution-trace.

Aggregation output must not depend on input group order once groups have been
classified by stage and artifact. Aggregated diagnostic records remain
JSON-safe and frozen.

## Canonical JSON Ordering

Canonical JSON serialization recursively sorts plain object keys using binary
lexicographical string ordering. Arrays preserve their supplied order because
array order is semantic replay data.

`stableJsonStringify` performs JSON-safe validation, canonical recursive
ordering, and `JSON.stringify` serialization. `stableJsonParse` parses JSON and
canonicalizes the resulting value through the same recursive ordering rules.

Canonical JSON object key ordering does not reorder report diagnostics,
mismatches, artifact summaries, aggregation summaries, snapshot arrays,
execution plan nodes, trace steps, or any other semantic array. Arrays must
already be deterministically ordered by the lifecycle stage that produced them.

## Lexicographical Ordering Boundaries

Lexicographical ordering in replay governance means binary string comparison
using the direct `<` and `>` relation over the compared strings. It is not
locale-aware collation. It is not natural sorting. It is not case-folded
sorting. It is not Unicode normalization.

Inputs that require Unicode normalization must be normalized before they become
ordering keys. Ordering functions do not perform language-specific
normalization.

## Numerical Ordering Boundaries

Numerical ordering is used for stage tracking indexes, deterministic sequence
coordinates, execution plan sequence checks, trace step indexes, and
composition sequences where applicable.

Replay sequence numbers must be finite numbers. `composedAtSequence` in a
`ReplayAuditReport` MUST be a non-negative integer primitive. It is compared
and serialized as numeric data, not as a timestamp string, generated id, or
runtime clock value.

## Replay Equivalence Expectations

Equivalent replay inputs must produce equivalent canonical serialization,
validation diagnostics, replay diffs, aggregation summaries, governance
reports, and audit envelopes when supplied with the same deterministic audit
coordinates.

Equivalence does not mean object identity. It means canonical structural
equality under the relevant replay contract. Frozen object identity is not used
as an equivalence signal.

## Prohibited Ordering Sources

Replay governance ordering must not depend on:

- unstable sorting.
- runtime-sensitive ordering.
- environment-sensitive ordering.
- randomized ordering.
- implementation-defined ordering assumptions.
- filesystem enumeration order.
- object insertion order when canonical object key ordering is required.
- locale collation.
- process id, memory address, worker id, or thread scheduling.
- clocks, timestamps, UUIDs, hashes, crypto randomness, or random numbers.

## Audit Ordering Verification

Replay audit reports expose ordering verification through
`verifyAuditReportOrderingInvariants`. The verifier checks the wrapped
governance report collections against the ordering contracts used by report
composition.

The verifier is pure. It does not sort the report, mutate the report, persist
results, render output, or infer missing order metadata.
