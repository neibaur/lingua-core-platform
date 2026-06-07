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
| LEXITRON / NECTEC Thai-English vocabulary data | Thai-English lexical coverage, dictionary lookup, search enrichment, tokenizer evaluation. Usage example sentences present in entries per the NECTEC portal (unconfirmed). | Candidate / requires legal and licensing verification. License conflict: An official LICENSE LEXiTRON 2.0 file ships bundled with the NECTEC opend-portal dataset package (mirrored on gdcatalog.go.th); the portal's structured license metadata field is unset. License is BSD-3-clause-style (redistribution and modification permitted with notice retention) plus a mandatory attribution string and a restriction that derivatives not be named 'LEXiTRON.' Open items: commercial-adaptation scope and the naming restriction — not the existence of a license. Commercial use: unknown. |
| Volubilis multilingual Thai dictionary (Belisan) | Thai↔English and multilingual lexical coverage (~114k entries, v25.3), romanized Thai pronunciation reference, dictionary enrichment. | Candidate / requires legal and licensing verification. CC BY-SA 4.0 per the official project site (belisan-volubilis.blogspot.com); independently corroborated by PyThaiNLP bundling volubilis.txt as CC-BY-SA 4.0. Rights-holder: Francis Bastien (handle 'Belisan'), confirmed on the primary project site and corroborated by PyThaiNLP. |
| SCB-MT-EN-TH-2020 (AIResearch / VISTEC / depa) | Parallel EN-TH example sentences, 1,001,752 segment pairs across 12 source corpora. Useful for reading/usage example material. | Candidate / requires legal and licensing verification. CC BY-SA 4.0 per official release; CC0 carve-out for Mozilla Common Voice subset. Sentences are standalone parallel pairs — not entry-linked. |
| PyThaiNLP library and bundled corpora | Tokenization, romanization, POS tagging, word lists, syllable data. Per-component licensing: must not be treated as a single license. | Candidate / requires per-component legal and licensing verification. Library code: Apache-2.0. Bundled corpora vary: CC0 (word/syllable lists), CC-BY 4.0 (POS models), CC-BY-SA 4.0 (Volubilis, Wikipedia titles, name corpora), custom research licenses (Unicode License Agreement for icubrk_th.txt; NICT custom for wordnet_th.db). No single global clearance possible. |
| Thai WordNet / Asian WordNet (NICT) via Open Multilingual Wordnet | Semantic mapping, synset-level Thai↔English linkage. | Candidate / requires legal and licensing verification. Custom MIT/X11-shaped permissive license grants use/copy/modify/distribute for any purpose without fee, with notice retention. Provenance entanglement with LEXiTRON and Princeton WordNet is an open question. |
| Tatoeba (Thai-English sentence pairs) | Bilingual EN-TH example sentences for reading/usage examples. Standalone parallel pairs — not entry-linked. | Candidate / requires legal and licensing verification. CC BY 2.0 FR per Tatoeba terms; some contributions CC0. Per-sentence attribution required. |
| OFL-1.1 Thai fonts (glyph-form character reference) | Reference character shapes (glyphs) for WritingPrimitive exercise scaffolding. Stroke-order sequence data: no licensed source located — genuine unmet gap. | Candidate (glyph forms only) / requires legal and licensing verification. OFL-1.1 fonts (also some Apache-2.0 / GPL fonts) provide reference character shapes. Thai stroke-order sequence data: no open licensed dataset identified; this surface remains unmet. |
| Thai example sentence corpus (reading examples) | Reading example usage sentences, contextual usage annotations, and difficulty classification for ReadingPrimitive content fields. | Candidate / partially addressed for standalone sentences: Tatoeba (CC BY 2.0 FR) and SCB-MT-EN-TH-2020 (CC BY-SA 4.0) provide parallel EN-TH sentence material (not entry-linked). LEXITRON may provide entry-linked usage examples if its authoritative license is resolved. No source is approved for ingestion. Requires source selection, legal and licensing verification before ingestion. |
| Thai character reference dataset (character shapes and stroke order) | Reference character forms for WritingPrimitive exercise scaffolding — stroke order, character shape, component breakdown. | Candidate / partially addressed for glyph shapes: OFL-1.1 Thai fonts (see candidate row above) cover reference character shapes. Thai stroke-order sequence data: no licensed source identified — genuine unmet gap. Requires source identification for stroke-order and full licensing verification before ingestion. |

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

### Audit Records (provisional)

> **PROVISIONAL — NOT LEGAL ADVICE.** The following records represent an initial landscape assessment for engineering design context only. They do not constitute formal legal advice or a binding statutory clearance. Every candidate remains at `candidate` status; no candidate is approved for ingestion. Every licensing, redistribution, commercial-use, and attribution finding is provisional and verification-gated. Absence of a stated restriction is recorded as `unknown`, not as permission. Open legal questions are listed in each record's `notes` field and in the Open Verification Threads section below; they are not resolved here.

---

#### LEXITRON / NECTEC Thai-English (`lexitron-nectec`)

| Field | Value |
| --- | --- |
| `source_id` | `lexitron-nectec` |
| `display_name` | LEXiTRON 2.0 (NECTEC Thai-English / English-Thai lexicon) |
| `source_url` | https://opend-portal.nectec.or.th/en/dataset/lexitron-2-0 |
| `license_type` | Official bundled LICENSE + unset metadata field. The NECTEC opend-portal dataset package ships an official "LICENSE LEXiTRON 2.0" file (mirrored on gdcatalog.go.th); the portal's structured license metadata field is separately unset ("License not specified" / "public data"). The license is the custom NECTEC LEXiTRON TOU (© 2003), BSD-3-clause-style with restrictions, reproduced consistently across the bundled file and third-party mirrors (Yaitron, sansarn.com). HF mirror (SEACrowd) labels it generic "Other." |
| `license_url` | https://github.com/veer66/Yaitron/blob/master/LICENSE-LEXITRON (highest-authority license text located; a third-party mirror, not a NECTEC-hosted document) |
| `is_commercially_viable` | `unknown` — the 2003 TOU text states no explicit commercial prohibition and no commercial grant; it warns terms "depart from other 'free' softwares and 'open source' softwares." Absence of a commercial clause is unknown, not permission. |
| `redistribution_allowed` | Conditional per the 2003 TOU text — redistribution permitted in source and binary form provided copyright notice, acceptance, TOU, and disclaimer are retained or reproduced. Whether the 2003 TOU is the current authoritative license for the NECTEC portal release ships with the data. |
| `attribution_required` | Yes per the 2003 TOU text (the LICENSE ships with the data). |
| `attribution_payload` | "This product is created by the adaptation of LEXiTRON developed by NECTEC (http://www.nectec.or.th/)" |
| `intended_usage` | Dictionary lookup, Thai↔English lexical coverage, search enrichment, tokenizer evaluation. Usage example sentences present per the NECTEC portal (UNCONFIRMED — portal mentions example sentence fields; not independently verified as available in the data file). |
| `ingestion_status` | `candidate` |
| `last_audited_at` | 2026-06-05 |
| `notes` | **(1) License instrument** — an official LICENSE LEXiTRON 2.0 file ships bundled with the opend-portal dataset package (mirrored on gdcatalog.go.th); the portal's structured license metadata field is separately unset ("License not specified" / "public data"). The 2003 TOU text is consistent across the bundled file and mirrors, so an authoritative license travels with the data. The residual open question is its commercial-adaptation scope, not the existence of a license. |

---

#### Volubilis (`volubilis`)

| Field | Value |
| --- | --- |
| `source_id` | `volubilis` |
| `display_name` | VOLUBILIS Multilingual Thai Dictionary & Database (Belisan) |
| `source_url` | https://belisan-volubilis.blogspot.com/ |
| `license_type` | CC BY-SA 4.0 — stated on the official project site: "VOLUBILIS MULTILINGUAL THAI DICT. & DATABASE by Francis Bastien (Belisan) is licensed under CC BY-SA 4.0". Independently corroborated by PyThaiNLP bundling `volubilis.txt` as CC-BY-SA 4.0 in its corpus license map. |
| `license_url` | https://creativecommons.org/licenses/by-sa/4.0/ |
| `is_commercially_viable` | Provisionally yes per CC BY-SA 4.0 text (CC BY-SA 4.0 permits commercial use), subject to ShareAlike obligations — see open questions. |
| `redistribution_allowed` | Yes per CC BY-SA 4.0 text, under attribution and ShareAlike. |
| `attribution_required` | Yes (CC BY-SA 4.0). |
| `attribution_payload` | Attribute Francis Bastien (Belisan), VOLUBILIS Multilingual Thai Dictionary & Database, with link to CC BY-SA 4.0. |
| `intended_usage` | Dictionary enrichment, Thai↔English bilingual coverage, romanized Thai pronunciation reference. |
| `ingestion_status` | `candidate` |
| `last_audited_at` | 2026-06-07 |
| `notes` | (1) RESOLVED — primary site states 'by Francis Bastien (Belisan),' corroborated by PyThaiNLP. A third-party converter repo quotes the author giving a more permissive informal statement (use freely, just mention the source) that omits ShareAlike — the formal CC BY-SA 4.0 badge governs, but it's worth confirming SA intent with him before relying on ShareAlike obligations. **(2) Romanization confirmed present; tone not natively encoded** — Spike §2 (`docs/spikes/volubilis-data-shape-spike.md`): vowel length is marked natively (combining macron in ~81.6% of `THAIROM` cells); lexical tone is not — tone diacritics appear in only ~3.4% of cells and only the acute accent ever occurs (grave, circumflex, caron, and breve entirely absent from the corpus). A tone-marked romanization is a generated, derived artifact requiring a transcriber dependency, not a property of the source. No IPA column. Example sentences in entries: not confirmed. **(3) Confirmed structure: 114,177 entries, 15 named columns** — Thai headword (`THA`), romanization (`THAIROM`), and POS (`TYPE`) ~100% populated; English gloss (`ENG`) ~93%; bidirectional TH↔EN. Enrichment columns (`USAGE`, `CLASSIF`, `NOTE`, `SYN`, `ETYMO`) sparse (≤8%). ~46% of rows carry expression-type POS tags (multi-word entries). `TYPE` is a 73-tag controlled vocabulary. SourceForge mirror: https://sourceforge.net/projects/belisan/. Evidence: spike §1, §3, §6. **(4) ShareAlike** — license text requires derivatives under the same license; downstream consequences for combining with other-licensed data are an open legal-review question; state license text only, do not infer consequences. **(5) Reproducible snapshot** — Filename `VOLUBILIS Database.xlsx`; version v25.3 (Nov. 2025), 114,177 entries; 10,778,108 bytes; SHA-256 `ab71c33a8f2dd33e893013cf06d21b9b8e447ff9b49b2a1c347cb3cafa64ee85`; downloaded from SourceForge project `belisan` (https://sourceforge.net/projects/belisan/files/) on 2026-06-07. Evidence: spike §9. |

---

#### SCB-MT-EN-TH-2020 (`scb-mt-en-th-2020`)

| Field | Value |
| --- | --- |
| `source_id` | `scb-mt-en-th-2020` |
| `display_name` | scb-mt-en-th-2020: A Large English-Thai Parallel Corpus |
| `source_url` | https://github.com/vistec-AI/dataset-releases/releases/tag/scb-mt-en-th-2020_v1.0 |
| `license_type` | CC BY-SA 4.0 (overall corpus), with a CC0 carve-out for the Mozilla Common Voice EN-TH sentence pairs. Official release: "Siam Commercial Bank PCL has published the dataset to the public under Attribution-ShareAlike 4.0 International license (CC BY-SA 4.0) except the English-Thai sentences pairs from Mozilla Common Voice that will be under CC0." |
| `license_url` | https://github.com/vistec-AI/dataset-releases/releases/tag/scb-mt-en-th-2020_v1.0 |
| `is_commercially_viable` | Provisionally yes per CC BY-SA 4.0 text, subject to ShareAlike obligations — see open questions. |
| `redistribution_allowed` | Yes per CC BY-SA 4.0 (and CC0 for the Mozilla subset), under attribution and ShareAlike for the CC BY-SA 4.0 portion. |
| `attribution_required` | Yes for the CC BY-SA 4.0 portion; CC0 subset requires none. |
| `attribution_payload` | Attribute AIResearch, VISTEC, and depa. Citation: Lowphansirikul et al., "scb-mt-en-th-2020: A Large English-Thai Parallel Corpus," arXiv:2007.03541 (2020). Per-subcorpus attributions also apply (Thai Wikipedia content creators, Asia Pacific Defense Forum, MSR Paraphrase, Mozilla Common Voice). |
| `intended_usage` | Sentence-level reading/usage example material (parallel EN-TH sentence pairs). Not entry-linked — sentences are standalone parallel text; any association with dictionary entries is a derivation step performed by this project, not a property of the source. |
| `ingestion_status` | `candidate` |
| `last_audited_at` | 2026-06-05 |
| `notes` | 1,001,752 segment pairs across 12 named sources. **Mixed-license internals**: the aggregate CC BY-SA 4.0 label subsumes subcorpora with independent upstream attributions (ParaCrawl, Wikipedia, government documents, MSR Paraphrase, Mozilla Common Voice/CC0); a per-subcorpus provenance review is required before reuse. **ShareAlike** — same open legal-review question as Volubilis regarding combining with other-licensed data. Whether any individual subcorpus (e.g., MSR Paraphrase, ParaCrawl) carries upstream terms narrower than the aggregate CC BY-SA 4.0 requires review. HF card: https://huggingface.co/datasets/airesearch/scb_mt_enth_2020 |

---

#### PyThaiNLP (`pythainlp`)

| Field | Value |
| --- | --- |
| `source_id` | `pythainlp` |
| `display_name` | PyThaiNLP (library + bundled corpora) |
| `source_url` | https://github.com/PyThaiNLP/pythainlp |
| `license_type` | **Split — must not be treated as one license.** Library code: Apache-2.0. Bundled corpora vary per file: CC0 (word lists, syllable lists, frequency lists, province data, negations, stopwords, etc.); CC-BY 4.0 (POS/segmentation models: pos_orchid_*, pos_ud_*, sentenceseg_crfcut.model, tdtb_*, pos_tud_*); CC-BY-SA 4.0 (volubilis.txt, wikipedia_titles.txt, Thai name corpora: family_names_th.txt, person_names_*.txt); custom/research (icubrk_th.txt: Unicode License Agreement – Data Files and Software 2016; wordnet_th.db: custom NICT license). |
| `license_url` | https://github.com/PyThaiNLP/pythainlp/blob/dev/pythainlp/corpus/corpus_license.md (authoritative per-corpus license map) |
| `is_commercially_viable` | Per-component. Code (Apache-2.0): yes. CC0 corpora: yes. CC-BY/CC-BY-SA corpora: provisionally yes under attribution/ShareAlike per respective license texts. Custom corpora (Unicode License Agreement, NICT): per their own terms — requires independent review. No single global clearance. |
| `redistribution_allowed` | Per-component — each bundled corpus must be cleared individually. |
| `attribution_required` | Per-component. Not required for CC0; required for CC-BY, CC-BY-SA, Unicode, and NICT components per their respective terms. |
| `attribution_payload` | Per-component (e.g., Belisan for volubilis.txt; NICT 2011 for wordnet_th.db; Unicode, Inc. for icubrk_th.txt). |
| `intended_usage` | Tokenization, romanization, POS tagging, word lists, syllable reference; each feature inherits the license of the specific corpus supplying it. |
| `ingestion_status` | `candidate` |
| `last_audited_at` | 2026-06-05 |
| `notes` | Any ingestion must select specific corpora and clear each one independently; do not import "PyThaiNLP corpora" as a unit. `wordnet_th.db` overlaps with the Asian WordNet / Thai WordNet (NICT) candidate and carries the same custom NICT license. Exact terms of the Unicode License Agreement (2016) for `icubrk_th.txt` and the NICT custom license for `wordnet_th.db` require independent review before clearing those components. Runtime-downloaded corpora (distinct from bundled files) may carry additional terms not covered by the bundled license map. |

---

#### Thai WordNet / Asian WordNet — NICT (`asian-wordnet-thai`)

| Field | Value |
| --- | --- |
| `source_id` | `asian-wordnet-thai` |
| `display_name` | Thai WordNet (NICT), distributed via Open Multilingual Wordnet |
| `source_url` | https://github.com/omwn/omw-data/tree/main/wns/tha |
| `license_type` | Custom NICT permissive license ("wordnet"-class in OMW). Text: "Thai WordNet Copyright 2011 by the National Institute of Information and Communications Technology (NICT) … Permission to use, copy, modify and distribute this software and database and its documentation for any purpose and without fee or royalty is hereby granted, provided that" the copyright notice and disclaimer appear on all copies. |
| `license_url` | https://github.com/omwn/omw-data/blob/main/wns/tha/LICENSE (highest-authority redistribution text located) |
| `is_commercially_viable` | Provisionally yes per license text — grants use/copy/modify/distribute "for any purpose and without fee or royalty"; no commercial bar stated. Subject to the LEXiTRON/Princeton WordNet provenance entanglement open question. |
| `redistribution_allowed` | Yes per license text — explicitly grants local-database distribution provided copyright notice and disclaimer travel on all copies. |
| `attribution_required` | Yes — copyright notice and disclaimer must appear on all copies and modifications. |
| `attribution_payload` | "Thai WordNet Copyright 2011 by the National Institute of Information and Communications Technology (NICT)" plus the full disclaimer. |
| `intended_usage` | Semantic mapping, synset-level Thai↔English linkage, sense enrichment. |
| `ingestion_status` | `candidate` |
| `last_audited_at` | 2026-06-05 |
| `notes` | **Provenance entanglement open question** — secondary sources state Thai WordNet was constructed using LEXiTRON and Princeton WordNet; the OMW LICENSE text itself does not mention LEXiTRON or Princeton WordNet. Whether upstream LEXiTRON TOU or Princeton WordNet license terms reach through to redistribution of the Thai WordNet is an open legal-review question; do not resolve internally. OMW includes only wordnets "with a license that allows redistribution" — a third-party curation signal, not a license determination. Same data appears as PyThaiNLP `wordnet_th.db`. Asian WordNet service: http://asianwordnet.org |

---

#### Tatoeba (`tatoeba`)

| Field | Value |
| --- | --- |
| `source_id` | `tatoeba` |
| `display_name` | Tatoeba Project (Thai-English sentence pairs) |
| `source_url` | https://tatoeba.org/en/downloads |
| `license_type` | CC BY 2.0 FR for sentence text; some contributions CC0 per contributor opt-in. |
| `license_url` | https://creativecommons.org/licenses/by/2.0/fr/ |
| `is_commercially_viable` | Provisionally yes per CC BY 2.0 FR text (permits commercial use under attribution). |
| `redistribution_allowed` | Yes per CC BY 2.0 FR, under attribution. |
| `attribution_required` | Yes — per-sentence format: "CC-BY 2.0 (France) Attribution: tatoeba.org #<sentence_id> (<username>)". |
| `attribution_payload` | Per sentence: "tatoeba.org #<id> (<owner username>), CC-BY 2.0 FR". Attribution is granular and must travel with each record. |
| `intended_usage` | Sentence-level reading/usage examples; bilingual EN-TH. Sentences are standalone parallel pairs — not entry-linked. |
| `ingestion_status` | `candidate` |
| `last_audited_at` | 2026-06-05 |
| `notes` | No ShareAlike (CC BY, not BY-SA) — lower license-mixing risk than SCB-MT-EN-TH-2020 or Volubilis for combining with other licensed data, subject to verification. Per-sentence attribution is granular and must be preserved per record through ingestion and publication. Partial CC0 sentences are per-contributor; the bulk license for the corpus is CC BY 2.0 FR. Terms: https://tatoeba.org/en/terms_of_use |

---

#### OFL-1.1 Thai Fonts — glyph-form character reference (`thai-char-reference`)

| Field | Value |
| --- | --- |
| `source_id` | `thai-char-reference` |
| `display_name` | OFL-1.1 Thai fonts (glyph-form character reference; stroke-order: no source identified) |
| `source_url` | https://codeberg.org/jeffmcneill/thai-font-collection |
| `license_type` | SIL Open Font License 1.1 (OFL-1.1) for the majority; also Apache-2.0 and GPL variants for specific font families. Stroke-order sequence data: **no licensed source located**. |
| `license_url` | https://openfontlicense.org/ (OFL-1.1 canonical text) |
| `is_commercially_viable` | OFL-1.1 fonts: provisionally yes under OFL terms (permits bundling/embedding). Stroke-order data: unknown — no source. |
| `redistribution_allowed` | OFL-1.1 fonts: yes under OFL-1.1 reserved-name and bundling conditions. Stroke-order: unknown — no source. |
| `attribution_required` | OFL-1.1: per-font copyright/notice retention; reserved font names must not be reused in derivative font names. |
| `attribution_payload` | Per-font OFL copyright lines (e.g., Noto Sans Thai, DIP-published fonts). |
| `intended_usage` | Reference character *shapes* (glyphs) for WritingPrimitive scaffolding. Stroke-order sequence data would address the full WritingPrimitive character-reference surface but no source has been identified. |
| `ingestion_status` | `candidate` (glyph forms only); stroke-order surface remains unmet. |
| `last_audited_at` | 2026-06-05 |
| `notes` | Thai is written with 1–2 strokes per letter; there is no open-licensed stroke-order sequence dataset for Thai comparable to Chinese character decomposition projects (e.g., makemeahanzi). Character *shape* reference is addressed by OFL-1.1 fonts. Ordered *stroke sequence* data is a genuine unmet gap — no licensed source has been identified. OFL-1.1 has specific reserved-name and embedding conditions; review per font before use. |

---

### Open Verification Threads

The following items must be resolved before any future ingestion decision for the affected candidates. They are not resolved in this document.

1. **LEXITRON authoritative/current license and commercial-adaptation scope** — The 2003 NECTEC TOU ships bundled with the official package; the open items are commercial-adaptation scope and the naming restriction; the current official NECTEC portal lists "License not specified.", whether commercial dictionary-lookup use falls within the "adaptation" scope, and whether the derivative-naming restriction requires prior NECTEC written permission, must be confirmed by contacting NECTEC / NSTDA (Language and Speech Technology research team, opend-portal.nectec.or.th).

2. **Volubilis ShareAlike intent — Rights-holder identity is resolved** (Francis Bastien, handle "Belisan," confirmed on the primary project site and corroborated by PyThaiNLP). Remaining: a third-party converter repo quotes the author giving a more permissive informal statement ("use freely, just mention the source") that omits ShareAlike. The formal CC BY-SA 4.0 badge governs, but confirm whether ShareAlike is genuinely intended before relying on SA obligations. Not identity-blocking. Contact: belisan-volubilis.blogspot.com.

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
