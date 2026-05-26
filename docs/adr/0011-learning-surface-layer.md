# ADR-0011: Learning Surface Layer Structure

**Status:** Accepted  
**Phase:** 12  
**Date:** 2026-05-26

## Context

Phase 12 introduces the learning surface layer: structural types representing
learner-facing dictionary data forms positioned between the dictionary data
boundary (Phase 11) and the search-to-learning integration layer (Phase 13).

Phase 11 terminates at `IngestionReadyDictionaryEntry`. Phase 13 scope
requires structural targets representing reading and writing learning
experiences. This ADR defines the architectural decisions governing how
those targets are structured.

## Decisions

### 1. Independent structural types, not a shared learning unit

Reading practice and writing practice are defined as independent structural
types, each with its own schema version literal and file.

Rationale: the two types share an embedded reference to the same upstream
dictionary entry but diverge significantly in structural shape. Writing
practice introduces handwriting input scaffolding, reference character form,
and exercise mode concerns that have no reading equivalent. Shared field
names between the two types are coincidental, not a semantic identity
warranting a shared base type. A discriminated union or shared base interface
would introduce speculative abstraction that does not satisfy the three-slice
threshold required by the ABSTRACTION GOVERNANCE LAW.

The existing platform pattern — one structural concept per file, one schema
version literal per type — is preserved.

### 2. Embedding, not reference by entryId

Learning surface types embed `CanonicalDictionaryEntry` directly as a typed
field, following the established pattern across all Phase 11 structural types.

Rationale: reference by entryId would require runtime lookup infrastructure
inconsistent with the STATIC RESOLUTION LAW. The embedding pattern is
established at `DictionaryLicensingBoundary`, `CanonicalDictionaryEntry`,
`IngestionReadyDictionaryEntry`, and `SpellingEntry`. No argument warrants
departing from this pattern at Phase 12.

### 3. Phase 12 owns learning surface data types; Phase 15 owns configuration

Phase 12 defines what a reading unit and a writing unit contain structurally.
Phase 15 owns grouping, sequencing, tenant-specific weighting, and lesson
organization.

Any concept from ROADMAP.md's "learner-facing content structure" language
that represents configuration rather than data is explicitly deferred to
Phase 15. Phase 12 does not introduce lesson grouping, sequence ordering,
curriculum organization, or tenant visibility controls.

### 4. Writing practice scope boundary

The Phase 12 `WritingPrimitive` structural type defines the structure of a
writing exercise: the target dictionary entry, the reference character form,
and the exercise mode (free fill or template overlay).

Handwriting capture, stroke interpretation, user input evaluation, and
scoring are explicitly out of Phase 12 scope. These are runtime processing
concerns deferred to a later phase. Phase 12 defines what the exercise is,
not how user input is captured or evaluated.

### 5. Reading practice scope boundary

The Phase 12 `ReadingPrimitive` structural type defines the structure of a
reading exercise: the target dictionary entry and any licensed example usage
content associated with it.

Example sentence content is contingent on DATA_SOURCES.md providing a
grounded candidate dataset with compatible licensing for usage examples.
If no such dataset is documented before implementation, `ReadingPrimitive`
fields are limited to what existing Phase 11 and Phase 12 types already
carry. No speculative example sentence fields are introduced without
documentary grounding.

## Consequences

- `src/core/lexical/reading/reading-primitive.ts` is the authorized location
  for the Phase 12 reading practice type.
- `src/core/lexical/writing/writing-primitive.ts` is the authorized location
  for the Phase 12 writing practice type.
- Both types embed `CanonicalDictionaryEntry` directly.
- Both types are structural (no `evaluationTimestamp`, no `generatedFrom`).
- Lesson grouping, sequencing, and tenant configuration belong to Phase 15
  and must not appear in Phase 12 types.
- Handwriting interpretation runtime belongs to a phase after Phase 13 and
  must not appear in Phase 12 types.
- DATA_SOURCES.md must be expanded with a reading example dataset candidate
  before any example sentence field can be introduced into `ReadingPrimitive`.
- This ADR supersedes any implication in ROADMAP.md that "learner-facing
  content structures" are a Phase 12 implementation concern beyond the two
  structural types named above.
