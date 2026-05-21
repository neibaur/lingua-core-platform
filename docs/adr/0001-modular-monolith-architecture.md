# ADR 0001: Modular Monolith Architecture

Status: Accepted

## Context

`lingua-core-platform` must support multiple language-learning domain assets, including specialized entry points such as `usethai.com`, `thaifluency.com`, and related properties. The platform needs shared linguistic infrastructure, consistent governance, reusable tenant handling, and a clear path for Thai-English support to expand into additional language domains.

Managing approximately seven distinct language domain assets as separate systems would multiply infrastructure cost, deployment complexity, and governance overhead before the product boundaries are stable.

The high-level architecture blueprint is described in [ARCHITECTURE.md](../../ARCHITECTURE.md).

## Decision

Use a governance-first modular monolith rather than microservices or separate per-domain applications.

The platform will use a unified single-codebase model with a shared core engine, shared backend boundaries, and a centralized conceptual database layer. Domain-specific experiences should be represented as tenant configuration, routing, content boundaries, branding settings, tokenizer/search preferences, and module-level separation inside the same platform.

## Consequences

This significantly reduces infrastructure cost and operational complexity while preserving strong SEO indexation potential across specialized domain entry points. It also creates clear paths for code separation through modules, tenant boundaries, and shared interfaces.

The tradeoff is that the repository must maintain strict internal boundaries. Tenant-specific behavior, language-specific processing, and shared platform concerns must not collapse into tightly coupled code paths.

## Alternatives

- Distributed microservices split by tenant, domain, language, or capability.
- Separate per-domain GitHub repositories.
- Siloed single-purpose applications for each language-learning property.
