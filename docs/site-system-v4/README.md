# QilyLean Site System V4

> Production-system technical closure for QilyLean. `QL-WEB-STD-001 / R6` remains the only public website mother standard.

## 1. System objective

QilyLean is governed as a production digital asset system, not as a collection of unrelated HTML pages. V4 converts the existing strengths — static-first HTML, evidence boundaries, central site metadata, R6 guards and generated content — into one auditable operating model.

The permanent production chain is:

`SOURCE → BUILD → VALIDATE → DEPLOY → PUBLIC VERIFY → PASS`

No code-only state may be called publicly deployed. Search-engine indexing is a later state and must not be confused with deployment.

## 2. Quality gates

- **G1 Source**: authoritative data, source HTML/templates and configuration are internally consistent.
- **G2 Build**: generated HTML, search data, sitemap and production metadata materialize without drift.
- **G3 CI**: SEO, R6, visual, interaction, accessibility-oriented structural and repository checks pass.
- **G4 Production**: public routes resolve and production metadata identifies the intended source baseline.
- **G5 Experience**: representative desktop/mobile manual sampling confirms usable layout and interaction.

Only G1–G5 all PASS permits the wording “整改完成”.

## 3. Existing SSOT retained

V4 does **not** create a competing metadata source. Existing production sources remain authoritative:

- `qilylean/site-data.json` — site/trust/knowledge/search summary SSOT.
- `qilylean/daily/index.json` — curated engineering brief index.
- `qilylean/site-search-index.json` — generated public search index.
- `sitemap.xml` / `sitemap-core.xml` — crawl inventories.
- `robots.txt` — crawler policy.
- `data/site-system-v4.json` — governance/configuration only; it does not replace business/content SSOT.

## 4. Static-first contract

Core information must exist in HTML. JavaScript may enhance navigation, search, diagnosis, visual continuity and progressive interaction but may not become the only source of critical public information.

The 1560px content axis, continuity interaction contract and R6 evidence/identity rules remain protected baselines.

## 5. Public build identity

`meta/build.json` is the production identity surface. It records the V4 schema, source baseline, build identifier, standard and publication state. Public verification uses it together with route markers; it does not by itself prove search-engine indexing.

## 6. Workflow architecture

Long-term website governance converges on four durable concerns:

1. **Validate** — source/SEO/R6/visual/interaction/route/schema checks.
2. **Build** — deterministic generated content and metadata.
3. **Deploy** — publish validated production artifacts only.
4. **Audit** — scheduled public, repository, asset and regression inspection.

Historical one-off workflows are not deleted blindly. They move through `ACTIVE → MIGRATED → DEPRECATED → ARCHIVED → DELETE`. Product/app build workflows remain separate when they are not website-governance duplicates.

## 7. Repository asset policy

Source code and production web assets belong in Git. Large installation packages, historical binaries and delivery archives should progressively move to GitHub Releases or build artifacts. History rewrite is explicitly excluded from the V4 foundation and requires a separately reviewed migration because it changes repository ancestry.

## 8. SEO architecture

Canonical URLs use no trailing slash for public metadata. Sitemap entries must map to real public files. `lastmod` must represent actual page/content modification rather than a manually copied global date. Entity SEO is added on top of factual public pages; it may not invent branches, customer endorsements, certifications or local offices.

## 9. Protected evidence boundaries

- Historical employment/team results remain distinct from QilyLean commercial revenue.
- Verified values remain distinct from stage estimates.
- Inner Mongolia evidence remains anonymized as the public source requires.
- NORTH expresses service regions, not fictitious offices.

## 10. V4 source layout

```text
/data/site-system-v4.json        governance configuration
/meta/build.json                 public production identity
/scripts/site-system-v4-*.js     V4 audit/validation/materialization tools
/docs/site-system-v4/            architecture and migration records
/.github/workflows/v4-*.yml      consolidated V4 governance entries
```

This structure is additive during migration so existing production behavior remains protected while duplicated legacy paths are retired deliberately.
