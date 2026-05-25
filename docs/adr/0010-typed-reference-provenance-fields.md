# ADR 0010: Typed Reference Provenance Fields Replace Raw String Identifiers

## Status

Accepted

## Context

ADR-0009 established `DictionarySourceProvenance` as the backing structural
type for a dictionary source reference and declared that once a backing
structural type exists for a concept, raw string coupling to that concept is a
doctrine violation (Typed Reference Law).

Two fields introduced before or alongside `DictionarySourceProvenance` were
left as raw strings after the backing type was available:

- `LexicalEntry.sourceId?: string` in `src/core/lexical/contracts.ts`
- `DictionaryLicensingBoundary.sourceId: string` and its input counterpart
  `ComposeDictionaryLicensingBoundaryInput.sourceId: string` in
  `src/core/lexical/provenance/dictionary-licensing-boundary.ts`

These fields identify a dictionary source by a raw string identifier. With
`DictionarySourceProvenance` present and validated, continuing to reference the
same concept as a bare string is a Typed Reference Law violation. Raw string
identifiers cannot carry the full provenance payload required by the governance
contract, cannot be statically verified to reference a valid and complete source
record, and produce a structural inconsistency with `CanonicalDictionaryEntry`,
which already embeds `DictionarySourceProvenance` under the field name
`provenance`.

## Decision

Rename both raw-string `sourceId` fields to `provenance` and change their
types from `string` to `DictionarySourceProvenance`. Apply the same rename to
`ComposeDictionaryLicensingBoundaryInput`.

The field name `provenance` is derived from `CanonicalDictionaryEntry.provenance:
DictionarySourceProvenance`, which is the authoritative Phase 11 naming
convention for an embedded dictionary source provenance reference. No other
field name is authorized.

Remove the string-based invariant guard `if (input.sourceId.trim() === "")`
from `composeDictionaryLicensingBoundary`. The guard validated a raw string
whose structural equivalent is already validated and deep-frozen by
`composeDictionarySourceProvenance` at construction time. A
`DictionarySourceProvenance` value passed to the builder is a complete, already
validated structural artifact; re-validating its internal fields inside a
downstream builder is redundant and incompatible with the typed structural
composition model.

## Consequences

`LexicalEntry`, `DictionaryLicensingBoundary`, and
`ComposeDictionaryLicensingBoundaryInput` now embed `DictionarySourceProvenance`
directly. The full provenance payload — source identity, license type, license
URL, attribution requirements, and attribution payload — travels with every
licensing boundary artifact that references a source, enforced at compile time.

Two test cases in `dictionary-licensing-boundary.test.ts` that exercised the
removed string guard are deleted. They tested a guard that no longer exists;
adaptation or replacement tests are not warranted because there is no new
string invariant to verify.

All future structural artifacts that reference a dictionary source must embed
`DictionarySourceProvenance` under the field name `provenance`, consistent with
this decision and with `CanonicalDictionaryEntry`.

## Alternatives Considered

**Retain `sourceId: string` and add a separate `provenance` field**: Rejected.
Carrying both a raw string identifier and a typed structural reference to the
same concept produces redundancy with no governance benefit and violates the
Typed Reference Law, which prohibits raw string identifiers once the backing
structural type exists.

**Rename to `provenanceId: string` as an intermediate typed alias**: Rejected.
A renamed string is still a string. The Typed Reference Law requires the typed
structural form, not a cosmetically renamed raw identifier.

**Defer until an ingestion pipeline exists**: Rejected. The Typed Reference Law
violation is active as soon as the backing structural type is introduced,
regardless of whether an ingestion pipeline consumes the field. Deferral allows
the violation to propagate to additional consumers before it is corrected.

## Non-Goals

This decision does not introduce ingestion pipelines, parsers, loaders,
adapters, orchestration, or source synchronization systems. It does not change
the shape or validation rules of `DictionarySourceProvenance` itself. It does
not affect `CanonicalDictionaryEntry` or `IngestionReadyDictionaryEntry`, which
already use the typed structural form. It does not rename `sourceId` within
`DictionarySourceProvenance` — that field is the raw identifier field on the
backing structural type itself and is not a consumer of another backing type.
