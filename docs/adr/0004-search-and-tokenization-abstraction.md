# ADR 0004: Search And Tokenization Abstraction

Status: Accepted

## Context

Thai written text presents a space segmentation problem that cannot be handled well by simple whitespace tokenization. The platform must support Thai-English linguistic tooling first while preserving structural flexibility for future Mandarin tokenization and other non-space-delimited or language-specific scripts.

Search and tokenization are therefore core platform capabilities rather than incidental implementation details.

## Decision

Treat search and tokenization as first-class, language-agnostic platform abstractions.

Establish a generic, pluggable `TokenizerDriver` interface that decouples host-level token processing from the shared lookup engine. Thai-specific tokenization should be implemented as one driver. Future Mandarin tokenization should be implemented as another driver. The shared lookup/search engine should consume normalized token output and metadata without depending directly on one language implementation.

## Consequences

This prevents the platform engine from hardcoding language-specific coupling and keeps a clean path for non-Thai scripts. It also makes deterministic dictionary indexing and search behavior easier to test, audit, and extend.

The tradeoff is additional interface design work up front. Tokenizer metadata, normalization behavior, and search ranking hints must be modeled carefully so language-specific drivers remain useful without leaking implementation details into the platform core.

## Alternatives

- A hardcoded Thai-only tokenizer pipeline.
- Database-level text lookups without language-aware tokenization.
- A costly AI-first translation layer instead of deterministic dictionary indexing.
