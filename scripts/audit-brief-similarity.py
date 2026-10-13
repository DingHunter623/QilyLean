#!/usr/bin/env python3
"""Evidence-based overlap audit for QilyLean dated manufacturing briefs.

Read-only: no page deletion, rewriting, redirects, or semantic claims.
Counts repeated summaries separately from high-overlap article bodies.
"""
from __future__ import annotations

import argparse
import html
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DAILY = ROOT / "qilylean" / "daily"
PATTERN = re.compile(r"<article\b[^>]*class=['\"][^'\"]*\bpost\b[^'\"]*['\"][^>]*>[\s\S]*?</article>", re.I)
DATE = re.compile(r"\d{4}-\d{2}-\d{2}")


def visible_body(source: str) -> str:
    found = PATTERN.search(source)
    if not found:
        return ""
    text = found.group(0)
    text = re.sub(r"<(?:script|style)\b[\s\S]*?</(?:script|style)>", " ", text, flags=re.I)
    text = re.sub(r'<div\s+class="date"[^>]*>[\s\S]*?</div>', " ", text, flags=re.I)
    text = re.sub(r"<h2[^>]*>[\s\S]*?</h2>", " ", text, count=1, flags=re.I)
    text = html.unescape(re.sub(r"<[^>]+>", " ", text))
    return DATE.sub(" ", re.sub(r"\s+", " ", text)).strip()


def shingles(s: str, size: int = 14) -> set[str]:
    s = re.sub(r'[\s，、。；:：！!？?（）()\[\]“”"\'—·/]', "", s)
    return {s[i : i + size] for i in range(0, max(0, len(s) - size + 1), 2)}


def run() -> dict:
    items = json.loads((DAILY / "index.json").read_text(encoding="utf-8"))
    summary_groups = defaultdict(list)
    for row in items:
        summary_groups[(row.get("summary") or "").strip()].append(row)
    candidates = [group for group in summary_groups.values() if len(group) > 1]
    corpus = {}
    errors = []
    for item in items:
        date = item["date"]
        path = DAILY / (date + ".html")
        if not path.exists():
            errors.append(f"missing {date}")
            continue
        body = visible_body(path.read_text(encoding="utf-8"))
        if not body:
            errors.append(f"article parser found no body: {date}")
        corpus[date] = {"body_length": len(body), "shingles": shingles(body)}
    pairs = []
    for group in candidates:
        for i, a in enumerate(group):
            for b in group[i + 1:]:
                x = corpus.get(a["date"], {}).get("shingles", set())
                y = corpus.get(b["date"], {}).get("shingles", set())
                if not x or not y:
                    continue
                intersection = len(x.intersection(y))
                union = len(x) + len(y) - intersection
                score = round(intersection / union, 4) if union else 0
                if score >= 0.72:
                    pairs.append({"a": a["date"], "b": b["date"], "overlap": score,
                                  "theme_a": a.get("title", ""), "theme_b": b.get("title", "")})
    pairs.sort(key=lambda x: (-x["overlap"], x["a"], x["b"]))
    return {
        "corpus": len(items),
        "summary_duplicate_groups": len(candidates),
        "pages_in_repeated_summary_groups": sum(len(g) for g in candidates),
        "article_pairs_overlap_ge_090": sum(x["overlap"] >= 0.9 for x in pairs),
        "article_pairs_overlap_ge_080": sum(x["overlap"] >= 0.8 for x in pairs),
        "suspect_pairs": pairs,
        "parse_errors": errors,
        "policy": "Review actual functional differences; preserve IE/PE/PMC/ME/quality roles and historical URLs; never automatically delete."
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="")
    args = parser.parse_args()
    report = run()
    print(json.dumps({k:v for k,v in report.items() if k!="suspect_pairs"}, ensure_ascii=False, indent=2))
    print("TOP HIGH-OVERLAP BRIEF PAIRS:")
    for item in report["suspect_pairs"][:100]:
        print(f'{item["overlap"]:.1%} {item["a"]} <> {item["b"]} | {item["theme_a"][:28]} / {item["theme_b"][:28]}')
    if args.output:
        path = Path(args.output)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if report["parse_errors"]:
        raise SystemExit("ERROR: brief audit failed due to missing/unreadable dated pages")
