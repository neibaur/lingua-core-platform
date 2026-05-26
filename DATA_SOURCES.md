# Data Sources Governance

`lingua-core-platform` may eventually ingest linguistic datasets for dictionary lookup, tokenization, phonetics, romanization, search ranking, and educational content. This document defines governance expectations before any third-party dataset is committed or ingested.

This is not legal advice. Dataset licensing, attribution, redistribution, and commercial-use compatibility must be verified before ingestion.

## Dataset Governance Principles

- Do not commit third-party linguistic datasets until license compatibility and attribution requirements are documented.
- Preserve source provenance from first evaluation through ingestion, transformation, indexing, and publication.
- Keep public/open data separate from premium, proprietary, tenant-specific, or private data.
- Avoid mixing datasets with incompatible licenses or unclear redistribution terms.
- Record transformation steps so generated artifacts can be audited and reproduced.
- Prefer datasets with clear license text, stable source URLs, and explicit redistribution terms.
- Treat attribution as data that must travel with imported records where required.
- Remove or quarantine data when licensing status is unclear.

## Repository License Boundary

The repository MIT license covers repository-authored framework code, source code, documentation, configuration, and other original materials created for this project.

Third-party linguistic datasets retain their own licensing, attribution, commercial-use, transformation, and redistribution boundaries. Including metadata about a dataset in this repository does not relicense that dataset.

## Audit Table Specification

Every dataset candidate or ingested source should have an audit record with the following fields:

| Field | Description |
| --- | --- |
| `source_id` | Stable internal identifier for the source. |
| `display_name` | Human-readable dataset or project name. |
| `source_url` | Canonical source or project URL. |
| `license_type` | Reported license label or status, if known. |
| `license_url` | URL for license text or terms, if available. |
| `is_commercially_viable` | Whether intended commercial use appears permitted after review. Use `unknown` until verified. |
| `redistribution_allowed` | Whether redistribution appears permitted after review. Use `unknown` until verified. |
| `attribution_required` | Whether attribution appears required. Use `unknown` until verified. |
| `attribution_payload` | Required attribution text, source notices, citation text, or contributor acknowledgements. |
| `intended_usage` | Planned use such as dictionary lookup, tokenizer training/evaluation, search metadata, phonetics, examples, or educational content. |
| `ingestion_status` | Candidate status such as `candidate`, `blocked`, `approved_for_ingestion`, `ingested`, or `retired`. |
| `last_audited_at` | Date of the latest licensing, provenance, or compatibility review. |
| `notes` | Open questions, risk notes, transformation details, or reviewer comments. |

## Provisional Dataset Candidates

The following sources are candidates only and require legal and licensing verification before ingestion, redistribution, derived artifacts, or commercial use.

| Candidate | Potential value | Status |
| --- | --- | --- |
| LEXITRON / NECTEC Thai-English vocabulary data | Thai-English lexical coverage, dictionary lookup, search enrichment, tokenizer evaluation. | Candidate / requires legal and licensing verification. |
| Volubilis Dictionary Project data | Potential phonetics, romanization, IPA, tone classification, and dictionary enrichment if available and licensed compatibly. | Candidate / requires legal and licensing verification. |
| Thai example sentence corpus (source TBD) | Reading example usage sentences, contextual usage annotations, and difficulty classification for ReadingPrimitive content fields. | Candidate / no source identified yet — requires source identification, legal and licensing verification before ingestion. |
| Thai character reference dataset (source TBD) | Reference character forms for WritingPrimitive exercise scaffolding — stroke order, character shape, component breakdown. | Candidate / no source identified yet — requires source identification, legal and licensing verification before ingestion. |

### Learning Surface Dataset Requirements

**ReadingPrimitive** (`src/core/lexical/reading/reading-primitive.ts`)
requires a candidate dataset row with `intended_usage` covering "reading
examples" or "usage sentences" before any example sentence field may be
introduced into the type under the Documentary Derivation Law. The row
above satisfies this requirement at candidate status. Actual field
implementation requires the candidate to reach `approved_for_ingestion`
status or a compatible substitute to be identified and documented.

**WritingPrimitive** (`src/core/lexical/writing/writing-primitive.ts`)
requires a candidate dataset row with `intended_usage` covering "character
reference" or "stroke data" before any reference form field beyond what
`CanonicalDictionaryEntry` already carries may be introduced. The row
above satisfies this requirement at candidate status. Actual field
implementation requires the candidate to reach `approved_for_ingestion`
status or a compatible substitute to be identified and documented.

The `intended_usage` field description is expanded to include the following
categories in addition to those previously listed:
- **reading examples** — sentence-level usage examples associated with a
  dictionary entry, for use in `ReadingPrimitive` content fields
- **writing exercises** — character reference forms, stroke data, or
  exercise scaffolding content for use in `WritingPrimitive` structural
  fields

No third-party dataset from these or any other sources should be committed until license compatibility, attribution requirements, redistribution rights, and intended usage are documented in an audit record.

## Future Ingestion Pipeline Guidance

Future ingestion pipelines should:

- Preserve source provenance for each imported record.
- Record transformation steps, normalization rules, filtering decisions, and generated artifacts.
- Keep raw source material separate from normalized project-owned records.
- Avoid mixing incompatible licenses in a single derived artifact.
- Separate public/open datasets from premium, proprietary, tenant-specific, or private datasets.
- Store attribution payloads with the records or generated bundles that require them.
- Track ingestion status so candidate data cannot accidentally ship as approved data.
- Make removal practical if a source is later found to be incompatible.

## Review Expectations

Before a dataset is ingested, reviewers should confirm:

- The source URL and license URL are stable enough for audit purposes.
- License terms are compatible with the planned usage.
- Attribution requirements can be preserved in the product and documentation.
- Redistribution boundaries are understood.
- Commercial-use status is explicitly documented or marked `unknown`.
- Any generated output can be traced back to its source records and transformation steps.
