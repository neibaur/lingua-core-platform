ADR-0015 — Phase 15 Closure: Tenant and Content Configuration
Status: Accepted
Phase: Phase 15
Supersedes: —
Related: ADR-0014 (Tenant and Content Configuration Boundary); ADR-0013 (UI/API Delivery Boundary); ADR-0011 (Learning Surface Layer Structure)

Context
Phase 15 was opened under ADR-0014, which established the tenant and content
configuration boundary and named three precursor determinations (§5 single-layer
relationship; §6 binding-grounding amendment; §7 canonical language identity). The
binding ARCHITECTURE.md amendments — "Tenant and Content Configuration Layer"
(including "Tenant Identity" and "Tenant-Scoped Enabled-Language Configuration"),
"Grounding Scope and the Database Blueprint", and "Canonical Language Identity" —
resolved the §6 and §7 precursors. One code slice merged: the structural
TenantConfiguration contract (src/core/tenant/) and the foundational
CanonicalLanguageTag identity (src/core/language/).

A repository-first Phase 15 closeout assessment evaluated whether any remaining
binding-grounded Phase 15 structural slice is warranted. It found the
binding-grounded structural surface fully realized by the merged artifacts, with no
additive slice warranted under current grounding; the validation chain was confirmed
green during the closure assessment. This mirrors the Phase 14 closure logic: a phase
resolves COMPLETE when its binding-grounded structural surface is realized and the
remaining named concepts are not groundable without a further binding amendment.

Decision

1. Phase 15 is COMPLETE. The binding-grounded Phase 15 structural surface — tenant
   identity and tenant-scoped enabled-language configuration, backed by canonical
   language identity — is fully realized by TenantConfiguration
   (tenant-configuration.ts) and CanonicalLanguageTag (canonical-language-identity.ts).

2. Single-layer relationship (ADR-0014 §5). For the delivered Phase 15 surface, the
   repository realizes the PARALLEL interpretation of ADR-0014 §5: the merged
   TenantConfiguration references no delivery output, and tenant identity and
   enabled-language configuration are caller-supplied configuration with no
   preceding-layer source (confirmed: tenant-configuration.ts imports only
   deepFreezeStructure and CanonicalLanguageTag). The derive (a) and compose (b)
   options of ADR-0014 §5 were not adjudicated on their merits — they were mooted,
   because no grounded Phase 15 concept consumes a Phase 14 delivery contract. Should
   a future grounded concept reference delivery output, ADR-0014 §5 is re-opened for
   that concept under a fresh per-slice pre-implementation assessment.

3. Phase ownership is not field grounding. ARCHITECTURE.md "Scope Boundaries" assigns
   lesson grouping, sequencing, tenant-specific weighting, and curriculum organization
   to Phase 15 as ownership; per ARCHITECTURE.md "Grounding Scope and the Database
   Blueprint" (binding grounding for tenant identity and enabled-language
   configuration only) and ADR-0014 §6, that ownership assignment is NOT binding field
   grounding for any contract field. These concepts are therefore deferred, not
   available.

4. Remaining named Phase 15 concepts are deferred, each requiring a further binding
   ARCHITECTURE.md amendment plus explicit operator authorization before any future
   slice:
   - content organization — curriculum, lesson grouping, content sequencing,
     tenant-specific weighting;
   - content visibility — treated separately in ADR-0014; grounded only in the
     conceptual Database Blueprint dictionary_tenant_tags entity, insufficiently
     grounded for any field, with runtime content-visibility resolution prohibited;
   - branding;
   - feature boundaries / feature flags.
     Consistent with the omission discipline of ADR-0011 / ADR-0012 / ADR-0013 /
     ADR-0014, this ADR proposes no such amendment and no type names, field names,
     builder signatures, or structural shapes.

5. This ADR is a decision record, not field grounding. Per the operator ruling
   recorded in SESSION_STATE.md (Accepted ADRs do not constitute field-grounding
   evidence under the DOCUMENTARY DERIVATION LAW), this ADR records closure; it
   neither grounds nor scopes any future contract field, and introduces no schema
   version literal.

Consequences
What this makes possible. Phase 15 is COMPLETE; no core phase is active. The
repository returns to an authorized-planning state until a subsequent phase or
architectural effort is explicitly authorized. The next phase — Phase 16 (AI-assisted
private envelope) — remains PENDING AUTHORIZATION and premature. Before any Phase 16
work, the §9 Phase-Transition Assessment Extension (Audits A–E) runs as the binding
gate, and Phase 16 requires explicit operator authorization (HANDOFF_TEMPLATE.md §9;
ROADMAP.md Phase Status).

What remains prohibited or deferred. The runtime concerns barred at the boundary by
ADR-0014 (runtime tenant resolution, routing, middleware, hostname/domain resolution,
request-context application, feature-flag runtime evaluation, content-visibility
runtime resolution, persistence/sessions, analytics/telemetry, adaptive/ranking/
scoring); the deferred content-organization, content-visibility, branding, and feature
concepts above; and everything enumerated in SESSION_STATE.md Deferred Scope.

Orthogonal note. feat/lexical-english-phrase-keying is lexical-layer work
(ARCHITECTURE.md "Lexical Key Normalization Policy", which states it is independent of
Phase 15 tenant and enabled-language configuration). It neither advanced nor blocked
this closure.

Grounding Sources
SESSION_STATE.md — Per-PR Update Block; Schema Version Literals
('lingua-core-platform:tenant-configuration@phase15'); Deferred Scope; Resolved
doctrinal rulings (ADRs not field-grounding; canonical language identity;
enabled-language set semantics).
ARCHITECTURE.md — Tenant and Content Configuration Layer; Tenant Identity;
Tenant-Scoped Enabled-Language Configuration; Grounding Scope and the Database
Blueprint; Canonical Language Identity; Tenant and Content Configuration Non-Goals;
Scope Boundaries; Lexical Key Normalization Policy.
ROADMAP.md — Phase Status (Phase 15; Phases 16–17 PENDING AUTHORIZATION).
ADR-0014 (boundary; §5, §6, §7); ADR-0013 (closure/section-structure precedent);
ADR-0011 (Phase 15 ownership of grouping / sequencing / weighting / curriculum).
HANDOFF_TEMPLATE.md §3 (named laws); §6 (schema convention; phase-label invariant);
§9 (PA.8; the phase-transition extension as the Phase 16 gate).
Source files (confirmed existing contracts, not field grounding):
src/core/tenant/tenant-configuration.ts; src/core/language/canonical-language-identity.ts.

Omission note
No type names, field names, builder parameters, builder signatures, structural shapes,
or schema version literals are proposed. This ADR records the Phase 15 closure
determination only.
