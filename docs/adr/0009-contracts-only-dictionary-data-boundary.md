# ADR 0009: Contracts-Only Dictionary Data Boundary With Mandatory Typed Provenance Embedding

## Status

Accepted

## Context

`DATA_SOURCES.md` establishes that linguistic dataset ingestion requires
provenance preservation, licensing boundary tracking, and source attribution
from first evaluation through ingestion, transformation, and publication. It
requires that every ingested record carry traceable provenance, that
redistribution and commercial-use constraints are documented before any data
enters the repository, and that licensed attribution payloads travel with the
records that require them.

Before Phase 11, no typed structural contract layer existed in the repository
to enforce these governance requirements in code. Dictionary data without a
typed provenance boundary cannot ensure that source identity, licensing
boundaries, and ingestion eligibility travel with each dictionary artifact
through composition and serialization. Provenance governance expressed only in
documentation cannot be verified at compile time, tested deterministically, or
enforced at architectural boundaries.

The platform required a formally typed, contracts-only dictionary data boundary
that makes provenance embedding a structural requirement rather than a
documentation expectation — without prematurely committing to any specific
ingestion pipeline, parser, loader, or orchestration approach.

## Decision

Establish a contracts-only dictionary data boundary layer at
`src/core/lexical/provenance/` with four typed structural artifacts:
`DictionarySourceProvenance`, `DictionaryLicensingBoundary`,
`CanonicalDictionaryEntry`, and `IngestionReadyDictionaryEntry`. Each artifact
is produced by a deterministic builder function that applies
`deepFreezeStructure` at return and accepts only caller-supplied identifiers
with no internal generation of UUIDs, timestamps, hashes, or random values.

Typed provenance embedding is mandatory. Any dictionary structural artifact
that references a source or licensing concept must use the typed structural
form rather than a raw string identifier. Once a backing structural type
exists for a dictionary governance concept, raw string coupling to that concept
is a doctrine violation.

All ingestion pipeline, parser, loader, adapter, source synchronization, and
orchestration concerns are explicitly deferred entirely outside this boundary.
They must not influence current contract shapes, field derivations, or
structural artifact designs. The boundary defines the typed seam that a future
ingestion pipeline must produce toward — not the pipeline itself.

## Consequences

Dictionary data governance becomes statically enforceable through the type
system. Provenance lineage is preserved as a replay-safe, recursively frozen
artifact chain from `DictionarySourceProvenance` through
`IngestionReadyDictionaryEntry`, verifiable through deterministic builders and
testable without a live ingestion pipeline or external data source.

The contracts-only boundary keeps the public repository free of premature
ingestion infrastructure, parser implementations, or orchestration dependencies
that would couple the governance model to a specific data source or processing
pipeline. Future ingestion pipeline work must produce artifacts that satisfy
these typed structural contracts — the typed boundary governs the seam, not the
data flow direction.

Extending the dictionary data boundary with new structural artifacts must
follow the same pattern: typed structural form, mandatory provenance embedding,
deterministic builder with deepFreezeStructure, caller-supplied identifiers,
and no ingestion pipeline coupling.

## Alternatives Considered

**Raw string provenance fields**: Rejected. String-based source identifiers
and license references cannot be statically verified, allow provenance lineage
to break silently, and violate the Typed Reference Law once a backing structural
type exists for the referenced concept.

**Embedding provenance as documentation only**: Rejected. Provenance
governance expressed only in DATA_SOURCES.md documentation cannot be enforced
at architectural boundaries, tested deterministically, or verified at compile
time. Structural enforcement is required for replay-safe composition.

**Deferring contracts until an ingestion pipeline exists**: Rejected. The
contracts-only boundary is precisely what makes the ingestion pipeline deferral
safe. Without typed structural contracts, a future ingestion pipeline has no
statically governed seam to produce toward, and provenance requirements remain
unenforced until integration time.

## Non-Goals

This decision does not introduce ingestion pipelines, parsers, loaders,
adapters, source synchronization systems, orchestration infrastructure,
rendering, CLI output, persistence, telemetry, async orchestration, plugin
registries, or AI orchestration. It does not select a specific dictionary data
source, commit to any licensing arrangement, or define ingestion schedules.
Dictionary data remains entirely outside the public repository until the
separate dataset governance process described in DATA_SOURCES.md is satisfied.
