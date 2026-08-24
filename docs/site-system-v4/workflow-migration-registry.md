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

## Initial known migration candidates

The following families are candidates for staged review, not immediate deletion:

- dated `apply-*`, `fix-*`, `hotfix-*`, `fast-publish-*` website patch workflows;
- duplicate visual/layout/interaction enforcement after equivalent R6 V4 validation exists;
- standalone metadata/sitemap audit paths after V4 Build/Audit covers their complete contract;
- historical materializers whose output has become permanent source and is protected by a regression guard.

`materialize-qilylean-north-20260824.yml` remains protected until V4 Build can reproduce and validate the NORTH hub, regional pages, diagnosis funnel, evidence wording and sitemap registration without regression.

`sync-site-metadata.yml` is already manual-only and remains as a migration reference until its remaining unique materialization responsibilities are absorbed.
