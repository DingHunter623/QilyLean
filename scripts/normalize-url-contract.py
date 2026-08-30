#!/usr/bin/env python3
"""Normalize QilyLean public URL references to one canonical routing contract.

Public URL contract:
- Public site root: https://qilylean.com/
- Directory-backed pages (*/index.html): trailing slash, e.g. /projects/
- Real file URLs (.html, .xml, .png, ...): keep the extension; never append '/'
- Runtime origins/base origins/CORS origins stay origin-form: https://qilylean.com

The distinction between a *public URL* and an *origin/base string* is deliberate.
Appending '/' to an Origin header allow-list or to a base string that is later joined
with '/path' is incorrect and can break CORS or create double slashes.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {".html", ".htm", ".xml", ".json", ".js", ".webmanifest"}
SKIP_PARTS = {".git", "node_modules", "vendor", "dist", "build", ".gradle"}
HOST = "https://qilylean.com"

# Match absolute QilyLean URLs. Bare HOST is intentionally left alone by the
# generic normalizer because it can be an origin/base string rather than a URL.
ABS_URL_RE = re.compile(
    r"https://qilylean\.com"
    r"(?P<path>/[A-Za-z0-9._~!$&'()*+,;=:@%/-]*)?"
    r"(?P<suffix>[?#][^\s\"'<>]*)?"
)

ROOT_CANONICAL_PATTERNS = [
    (re.compile(r'(<link\b[^>]*\brel=["\']canonical["\'][^>]*\bhref=["\'])https://qilylean\.com(["\'][^>]*>)', re.I), r'\1https://qilylean.com/\2'),
    (re.compile(r'(<link\b[^>]*\bhref=["\'])https://qilylean\.com(["\'][^>]*\brel=["\']canonical["\'][^>]*>)', re.I), r'\1https://qilylean.com/\2'),
    (re.compile(r'(<meta\b[^>]*\bproperty=["\']og:url["\'][^>]*\bcontent=["\'])https://qilylean\.com(["\'][^>]*>)', re.I), r'\1https://qilylean.com/\2'),
    (re.compile(r'(<meta\b[^>]*\bcontent=["\'])https://qilylean\.com(["\'][^>]*\bproperty=["\']og:url["\'][^>]*>)', re.I), r'\1https://qilylean.com/\2'),
    (re.compile(r'<loc>https://qilylean\.com</loc>', re.I), '<loc>https://qilylean.com/</loc>'),
]

# Surgical repairs for runtime/base-origin semantics. These also repair the
# first URL-contract materialization, which correctly normalized page routes
# but over-normalized a few origin/base literals.
SEMANTIC_REPAIRS: dict[str, list[tuple[str, str]]] = {
    "app-download-share-v1.js": [
        ("'https://qilylean.com/'+TIMES_REAL_HERO", "'https://qilylean.com'+TIMES_REAL_HERO"),
    ],
    "cloudflare-worker/worker.js": [
        ("'https://qilylean.com/'", "'https://qilylean.com'"),
    ],
    "cloudflare-worker/worker-social.js": [
        ("'https://qilylean.com/'", "'https://qilylean.com'"),
    ],
    "data/site-system-v4.json": [
        ('"baseUrl": "https://qilylean.com/"', '"baseUrl": "https://qilylean.com"'),
        ('"canonicalTrailingSlash": false', '"canonicalTrailingSlash": true'),
    ],
    "qilylean/floating-service.js": [
        ("normalizeUrl('https://qilylean.com/' + (shortPath", "normalizeUrl('https://qilylean.com' + (shortPath"),
    ],
    "qilylean/site-meta.js": [
        ("var ORIGIN='https://qilylean.com/';", "var ORIGIN='https://qilylean.com';"),
    ],
    "scripts/build-daily-archive.js": [
        ("const baseUrl = 'https://qilylean.com/';", "const baseUrl = 'https://qilylean.com';"),
    ],
    "scripts/build-trust-search-sync.js": [
        ("parsed.origin !== 'https://qilylean.com/'", "parsed.origin !== 'https://qilylean.com'"),
    ],
    "scripts/curate-weekly-briefs.js": [
        ("const baseUrl = 'https://qilylean.com/';", "const baseUrl = 'https://qilylean.com';"),
    ],
    "scripts/materialize-professionalization-v24.js": [
        ("`https://qilylean.com/${brief.href}`", "`https://qilylean.com${brief.href}`"),
    ],
    "scripts/materialize-terminology-search-authority-v1.js": [
        ("const ORIGIN='https://qilylean.com/';", "const ORIGIN='https://qilylean.com';"),
    ],
    "scripts/publish-equipment-reliability-terminology.js": [
        ("`https://qilylean.com/${route}`", "`https://qilylean.com${route}`"),
    ],
    "scripts/sync-public-modules.js": [
        ("const origin = 'https://qilylean.com/';", "const origin = 'https://qilylean.com';"),
    ],
    "scripts/sync-search-brief-metadata.js": [
        ("parsed.origin !== 'https://qilylean.com/'", "parsed.origin !== 'https://qilylean.com'"),
    ],
}


def is_skipped(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    return any(part in SKIP_PARTS for part in rel.parts)


def directory_routes() -> set[str]:
    routes: set[str] = {"/"}
    for index in ROOT.rglob("index.html"):
        if is_skipped(index):
            continue
        rel_parent = index.parent.relative_to(ROOT).as_posix()
        route = "/" if rel_parent == "." else f"/{rel_parent.strip('/')}/"
        routes.add(route)
    return routes


def apply_semantic_repairs(rel: str, text: str) -> tuple[str, int]:
    changed = 0
    for before, after in SEMANTIC_REPAIRS.get(rel, []):
        count = text.count(before)
        if count:
            text = text.replace(before, after)
            changed += count
    return text, changed


def normalize_root_public_url(rel: str, text: str) -> tuple[str, int]:
    if not (rel.endswith((".html", ".htm", ".xml"))):
        return text, 0
    changed = 0
    for pattern, replacement in ROOT_CANONICAL_PATTERNS:
        text, n = pattern.subn(replacement, text)
        changed += n
    return text, changed


def normalize_absolute(text: str, routes: set[str]) -> tuple[str, int]:
    changed = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal changed
        path = match.group("path") or ""
        suffix = match.group("suffix") or ""

        # Bare host is ambiguous: it may be a CORS Origin/base string. Leave it
        # alone. Root canonical/sitemap URLs are handled by targeted HTML/XML rules.
        if path in ("", "/"):
            return match.group(0)

        bare = path.rstrip("/")
        directory = f"{bare}/"
        if directory in routes and not path.endswith("/"):
            changed += 1
            return f"{HOST}{directory}{suffix}"
        return match.group(0)

    return ABS_URL_RE.sub(repl, text), changed


def build_root_relative_re(routes: set[str]) -> re.Pattern[str] | None:
    bare_routes = sorted(
        (route.rstrip("/") for route in routes if route != "/"),
        key=len,
        reverse=True,
    )
    if not bare_routes:
        return None
    alternation = "|".join(re.escape(route) for route in bare_routes)
    return re.compile(
        rf"(?<![A-Za-z0-9._~%+-])(?P<route>{alternation})"
        rf"(?P<suffix>[?#][^\s\"'<>]*)?"
        rf"(?P<boundary>[\"'<>\s),\]}};]|$)"
    )


def normalize_root_relative(text: str, route_re: re.Pattern[str] | None) -> tuple[str, int]:
    if route_re is None:
        return text, 0
    changed = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal changed
        route = match.group("route")
        suffix = match.group("suffix") or ""
        boundary = match.group("boundary")
        changed += 1
        return f"{route}/{suffix}{boundary}"

    return route_re.sub(repl, text), changed


def candidate_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or is_skipped(path):
            continue
        if path.suffix.lower() in TEXT_SUFFIXES:
            files.append(path)
    return sorted(files)


def process(apply: bool) -> int:
    routes = directory_routes()
    route_re = build_root_relative_re(routes)
    changed_files: list[tuple[str, int]] = []
    total_changes = 0

    for path in candidate_files():
        try:
            original = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        rel = path.relative_to(ROOT).as_posix()
        updated, n_sem = apply_semantic_repairs(rel, original)
        updated, n_root = normalize_root_public_url(rel, updated)
        updated, n_abs = normalize_absolute(updated, routes)
        updated, n_rel = normalize_root_relative(updated, route_re)
        n = n_sem + n_root + n_abs + n_rel
        if updated == original:
            continue

        changed_files.append((rel, n))
        total_changes += n
        if apply:
            path.write_text(updated, encoding="utf-8")

    mode = "APPLY" if apply else "CHECK"
    print(f"[{mode}] directory routes discovered: {len(routes)}")
    print(f"[{mode}] files requiring normalization: {len(changed_files)}")
    print(f"[{mode}] URL references/semantic repairs: {total_changes}")
    for rel, count in changed_files[:200]:
        print(f"  {count:4d}  {rel}")
    if len(changed_files) > 200:
        print(f"  ... {len(changed_files) - 200} additional files")

    if not apply and changed_files:
        return 1
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--apply",
        action="store_true",
        help="write normalized URL references; default is check-only",
    )
    args = parser.parse_args()
    return process(apply=args.apply)


if __name__ == "__main__":
    sys.exit(main())
