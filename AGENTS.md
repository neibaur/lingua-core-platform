# AI Coding Assistant Guidelines

This repository is a governance-first, multi-tenant modular monolith platform engine for language learning and linguistic processing. It starts with Thai-English support and must remain extensible to Mandarin and other languages.

These guidelines apply to AI coding assistants, including Codex, Cursor, and similar tools.

## 1. Architecture Style

Preserve a modular monolith architecture. Keep tenant domains, language domains, and platform capabilities in one coherent codebase with clear internal module boundaries.

Do not introduce premature microservice fragmentation, separate product repositories, or isolated codebases for multi-tenant domains unless an approved architecture decision record explicitly authorizes the change.

## 2. Language Extensibility

All tokenizer and linguistic processing work must use a pluggable layer under `src/core/tokenizers/`.

Thai support is the first implementation priority, but the design must leave room for Mandarin and other languages without rewriting core platform logic. Language-specific rules, dictionaries, segmentation behavior, and normalization logic should be isolated behind stable interfaces.

## 3. Data Boundary Segregation

Do not commit proprietary AI prompts, premium educational materials, monetization logic, analytics secrets, private configuration keys, vendor credentials, or tenant-specific data to this public repository.

Use examples, fixtures, and documentation that are safe for public distribution. Redact sensitive data before creating commits, issues, pull requests, or generated artifacts.

## 4. Content-First Progression

Prioritize durable content and discovery foundations before interactive multi-user features.

Prefer static content, SEO-friendly rendering, static rendering paths, browser-native fallback text-to-speech, dictionary foundations, and search foundations before adding real-time collaboration, social features, complex accounts, or other interactive multi-user components.

## 5. Validation Discipline

Before recommending merge, run the checks available for the current repository state. Typical checks include:

- Type checking
- Linting
- Build verification
- Security scanning
- Dependency or lockfile validation

If a check is unavailable, stubbed, or intentionally deferred, state that clearly in the final report instead of treating it as passing coverage.

## 6. ADR Discipline

Document major architectural decisions in `docs/adr/`.

Create or update an ADR before changing core module boundaries, tenant isolation strategy, tokenizer architecture, data ingestion policy, security posture, deployment topology, or language expansion strategy.

## 7. Safe Data Licensing

All imported linguistic datasets must be documented before ingestion.

Documentation must identify the source, license, permitted uses, attribution requirements, redistribution constraints, transformation steps, and any known risks. Do not ingest datasets with unclear licensing into this public repository.
