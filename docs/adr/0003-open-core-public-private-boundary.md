# ADR 0003: Open-Core Public/Private Boundary

Status: Accepted

## Context

The project must balance open-source community extensibility with protection for commercial intellectual property. Public platform infrastructure can benefit from transparent governance and contribution, while proprietary AI prompts, premium educational materials, monetized datasets, analytics logic, secrets, and private configuration must remain outside the public repository.

Dataset boundaries and license expectations are described in [DATA_SOURCES.md](../../DATA_SOURCES.md).

## Decision

Use an open-core repository boundary.

The public framework layer owns shared tokenizers, routing concepts, open ingestion pipeline structure, governance documentation, and reusable platform infrastructure. Future detached private repositories may own business logic, premium content workflows, proprietary AI orchestration, premium audio workflows, analytics integration, monetization concerns, credentials, and tenant-specific private data.

## Consequences

This creates a safe public open-source contribution vector without exposing proprietary content or environmental credentials. It also keeps the public repository focused on infrastructure quality, language extensibility, and governance clarity.

The tradeoff is that integrations across the public/private boundary must remain explicit and well documented. Private behavior must not leak into public configuration, fixtures, prompts, or generated artifacts.

## Alternatives

- A completely private monorepo.
- A fully public unmonetized product repository.
- Premature integration of payment or monetization logic into the public platform core.
