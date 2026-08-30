#!/usr/bin/env python3
"""Normalize QilyLean public URL references to the site's canonical URL contract.

Contract:
- Site root: https://qilylean.com/
- Directory-backed pages (*/index.html): trailing slash, e.g. /projects/
- Real file URLs (.html, .xml, .png, ...): keep the file extension and never add '/'

The directory route set is derived from the repository itself, so the rule follows
GitHub Pages' native routing instead of relying on a manually maintained URL list.
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

ABS_URL_RE = re.compile(
    r"https://qilylean\.com"
    r"(?P<path>/[A-Za-z0-9._~!$&'()*+,;=:@%/-]*)?"
    r"(?P<suffix>[?#][^\s\"'<>]*)?"
)


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


def normalize_absolute(text: str, routes: set[str]) -> tuple[str, int]:
    changed = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal changed
        path = match.group("path") or ""
        suffix = match.group("suffix") or ""

        if path in ("", "/"):
            wanted = f"{HOST}/{suffix}"
        else:
            bare = path.rstrip("/")
            directory = f"{bare}/"
            if directory in routes:
                wanted = f"{HOST}{directory}{suffix}"
            else:
                wanted = match.group(0)

        if wanted != match.group(0):
            changed += 1
        return wanted

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
    # Do not match the path portion of an absolute URL (the slash there is
    # preceded by the domain's final character). Only exact known directory
    # routes are eligible; file URLs and asset URLs are therefore untouched.
    return re.compile(
        rf"(?<![A-Za-z0-9._~%+-])(?P<route>{alternation})"
        rf"(?P<suffix>[?#][^\s\"'<>]*)?"
        rf"(?P<boundary>[\"'<>\s),\]}};]|$)"
    )


def normalize_root_relative(
    text: str, route_re: re.Pattern[str] | None
) -> tuple[str, int]:
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

        updated, n_abs = normalize_absolute(original, routes)
        updated, n_rel = normalize_root_relative(updated, route_re)
        n = n_abs + n_rel
        if updated == original:
            continue

        rel = path.relative_to(ROOT).as_posix()
        changed_files.append((rel, n))
        total_changes += n
        if apply:
            path.write_text(updated, encoding="utf-8")

    mode = "APPLY" if apply else "CHECK"
    print(f"[{mode}] directory routes discovered: {len(routes)}")
    print(f"[{mode}] files requiring normalization: {len(changed_files)}")
    print(f"[{mode}] URL references requiring normalization: {total_changes}")
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
