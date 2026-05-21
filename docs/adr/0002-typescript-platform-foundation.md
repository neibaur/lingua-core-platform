# ADR 0002: TypeScript Platform Foundation

Status: Accepted

## Context

The platform needs compile-time safety, unified backend processing, clear interface contracts, and highly scannable configuration patterns for both developers and AI coding assistants.

The project also needs a shared language for tokenizer interfaces, tenant configuration, search abstractions, and infrastructure-facing application code before runtime framework choices are finalized.

## Decision

Use strict-mode TypeScript as the initial platform language for shared runtime and infrastructure-facing application code.

The platform foundation should use modern ES Modules and avoid untyped JavaScript for core infrastructure. Type definitions should express boundaries between tokenizers, tenants, search, shared utilities, and data access modules.

## Consequences

TypeScript provides enforceable interface contracts across core utilities and helps prevent JavaScript creep in architecture-critical areas. It also supports readable configuration and schema-like types that are easy to review in a governance-first repository.

The tradeoff is upfront type discipline, especially for multi-language schemas, tokenizer metadata, tenant settings, and future ingestion pipelines.

## Alternatives

- Python-first architecture.
- Java/Spring Boot as the initial platform foundation.
- Immediate commitment to a framework-specific runtime before architecture stabilization.
