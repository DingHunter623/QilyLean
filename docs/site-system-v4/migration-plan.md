# Site System V4 migration plan

## Phase A — Foundation / observability (current PR)

- establish `data/site-system-v4.json` governance configuration;
- publish `meta/build.json` schema;
- add source/system validation;
- add repository/workflow audit without deleting files;
- add public production verifier;
- add deterministic sitemap `lastmod` audit/materializer;
- create V4 Validate / Build / Audit governance workflows;
- preserve current R6/NORTH/product release paths during migration.

**Exit:** V4 can inspect current production structure, identify drift, generate auditable reports and verify public routes without changing user-facing business claims.

## Phase B — Build identity and release closure

- materialize `meta/build.json` from the accepted content baseline;
- publish Pages production tree;
- run public verification until the expected build identity and route markers resolve;
- record `SOURCE READY / CI PASS / DEPLOYED / PUBLIC VERIFIED / INDEXED` independently.

**Exit:** repository state and public state are no longer inferred from each other.

## Phase C — Workflow consolidation

Classify all `.github/workflows/*.yml` by responsibility and trigger. Migrate website-governance duplication into four durable concerns:

- Validate
- Build
- Deploy
- Audit

Do not fold independent Android/application release workflows into website CI merely for filename reduction.

A legacy workflow may be disabled only after its required end-state is covered by a V4 guard or build step.

## Phase D — Repository weight reduction

1. Inventory working-tree largest files and historical largest blobs.
2. Identify current production references.
3. Move installables/archives to Releases or Actions artifacts where appropriate.
4. Delete only confirmed unreferenced current-tree assets.
5. Evaluate a separate history-rewrite proposal only after backups, release references and Pages deployment implications are reviewed.

No `git filter-repo` or force rewrite is permitted as part of ordinary cleanup.

## Phase E — SSOT and component closure

Reuse existing `qilylean/site-data.json` rather than introducing a competing statistics database. Extend structured data only where the existing SSOT cannot represent the field.

Progressively standardize:

- Qily Flow
- Qily Table
- Qily Visual Card
- Qily Diagram Frame

Common date/year/period cells must use non-wrapping shared table rules rather than page patches.

## Phase F — CSS/runtime closure

- centralize design tokens/layout/interaction utilities;
- reduce page-local overrides, negative-margin repair and uncontrolled `!important` usage;
- define runtime baseline from one configuration source rather than scattering literal Vxx expectations across guards;
- keep static first paint mandatory.

## Phase G — SEO/entity/content architecture

- deterministic sitemap + canonical + `lastmod`;
- consistent WebPage/Breadcrumb/Article/SoftwareApplication/Service/Person entity graph where factual;
- classify historical daily/brief URLs into retain / consolidate / archive-noindex candidates;
- establish topic clusters that connect method → evidence → tool → cooperation.

## Phase H — Performance / responsive / accessibility

Apply a measurable performance budget, audit representative 375/390/430/768/1024/1280/1560/1920/2560 widths and verify keyboard/focus/alt/label semantics.

## Phase I — NORTH growth and Digital Marketing VSM

After the technical base is stable, execute the existing NORTH content matrix. Region pages remain market/service entrances, never fictitious branch offices.

Measure:

`曝光 → 搜索点击 → Landing → Evidence → Diagnosis → Cooperation → 技术交流 → 现场诊断 → 方案 → 项目`

## Final Gate

V4 closes only when G1 Source, G2 Build, G3 CI, G4 Production and G5 Experience are all evidenced. Search indexing is monitored separately because crawlers control timing.
