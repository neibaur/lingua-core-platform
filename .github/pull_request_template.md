## Summary

Briefly describe what changed and why.

## Change Type

- [ ] Documentation
- [ ] Governance / repository hygiene
- [ ] CI/CD or automation
- [ ] Source code
- [ ] Test / validation
- [ ] Other

## Scope

What files or areas changed?

What is intentionally out of scope?

## Validation

- [ ] I ran the relevant local validation commands (lint, typecheck, format, or test).
- [ ] I confirmed GitHub Actions checks pass or are expected to pass.
- [ ] This change contains no code or runtime logic (pure documentation or markdown-only metadata).

Commands run:

```text

```

## Governance Checklist

- [ ] This PR is atomic and focused on one logical change.
- [ ] This PR does not weaken branch protection, security scanning, or review expectations.
- [ ] This PR respects the public/private repository boundary (no proprietary prompts, keys, or datasets).
- [ ] This PR aligns with the modular monolith direction (rejects microservice fragmentation).
- [ ] This PR preserves language-agnostic extensibility (linguistic parsing/tokenization layers remain pluggable; does not hardcode language-specific assumptions into the platform core).
- [ ] This PR does not introduce premature framework, hosting, or database lock-in unless explicitly documented in an ADR.

## Risk / Rollback

Risk level: Low / Medium / High

Rollback plan:

## Reviewer Notes

Optional notes for reviewers.
