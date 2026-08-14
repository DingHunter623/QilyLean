#!/usr/bin/env python3
"""Deprecated one-time APP release association migration.

R5 (2026-08-14) moved APP versions, contact terminology and release state to the
current single-source chain. This historical 2026-08-07 migration is kept only
for traceability and must not rewrite current production pages, APP materials or
audits.
"""

print(
    "DEPRECATED: scripts/sync_app_release_association_20260807.py is a historical "
    "one-time migration and no longer modifies production sources. Use the current "
    "app-release-manifest.json / release workflow and R5 contact naming: "
    "‘官方网址’ + ‘官网邮箱’."
)
