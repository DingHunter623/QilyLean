# Workflow migration registry

This registry is the human-readable control surface for the machine-generated `maintenance/site-system-v4-workflow-audit.json` report.

## Permanent V4 website-governance entries

| Concern | Workflow | State |
|---|---|---|
| Validate | `.github/workflows/v4-validate.yml` | ACTIVE |
| Build | `.github/workflows/v4-build.yml` | ACTIVE |
| Deploy/Public Verify | `.github/workflows/v4-deploy-verify.yml` | ACTIVE |
| Audit | `.github/workflows/v4-audit.yml` | ACTIVE |

## Migration rules

1. Independent Android/APK/app-release pipelines are **not** website-CI duplicates and are not removed merely to reduce workflow count.
2. A dated or one-off website workflow becomes `MIGRATED` only when its end-state is covered by a V4 build or validation check.
3. `DEPRECATED` workflows must be manual-only before deletion unless they are provably unreachable/obsolete.
4. Deletion requires a repository comparison showing that no protected public behavior, R6 guard, release path or generated source depends on that workflow.
5. Production deployment remains independently verified; workflow success alone is not G4 evidence.

## Retired tranche 01 — 2026-08-24

The following active workflow files were removed from `.github/workflows/` after source inspection showed that they were one-off/stale writers rather than durable production pipelines:

| Retired workflow | Reason |
|---|---|
| `add-a3-terminology-20260814.yml` | One-time A3 publisher; its validator expected the obsolete 190-card state while the current terminology SSOT is already beyond that state. |
| `apply-daily-20260810-function-boundary.yml` | Historical 2026-08-10 brief patch; the weekly-curated publication model no longer keeps that page as an active production target. |
| `apply-knowledge-stats-brief-visuals-20260809.yml` | One-time knowledge/0810 visual writer; knowledge statistics are now generated through the central metadata pipeline. |
| `fix-brief-total-count-sync-20260809.yml` | Unsafe obsolete writer that hard-coded 2589 daily briefs; current weekly-curated SSOT is a different contract and must never be overwritten by this workflow. |

Their supporting source scripts are not automatically deleted in this tranche; source retention allows evidence review while active GitHub Actions surface is reduced.

## Current protected migration candidates

The following families remain candidates for staged review, not blind deletion:

- dated `apply-*`, `fix-*`, `hotfix-*`, `fast-publish-*` website patch workflows;
- duplicate visual/layout/interaction enforcement after equivalent R6 V4 validation exists;
- standalone metadata/sitemap audit paths after V4 Build/Audit covers their complete contract;
- historical materializers whose output has become permanent source and is protected by a regression guard.

`materialize-qilylean-north-20260824.yml` remains protected. It is now bridged through `qilylean-north-v4-sitemap-contract.js` so its historical trailing-slash sitemap writer cannot regress the V4 canonical sitemap contract while the generator itself is still being migrated.

`sync-site-metadata.yml` is already manual-only and remains as a migration reference until its remaining unique materialization responsibilities are absorbed.
