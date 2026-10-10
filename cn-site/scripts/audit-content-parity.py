#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CN = ROOT / "cn-site"

COMMERCIAL_SEGMENTS = {
    "cooperation",
    "contact",
    "delivery",
}
COMMERCIAL_PATTERNS = re.compile(
    r"(项目合作|商务合作|业务承接|报价|收费|付款|合同|发票|收款|咨询预约|获取方案|立即咨询|服务套餐|客户招揽|销售线索)"
)

def tracked_html():
    out = subprocess.check_output(
        ["git", "ls-files", "*.html", "*.htm"], cwd=ROOT, text=True
    )
    return [Path(x) for x in out.splitlines() if x.strip()]

def is_cn(path: Path) -> bool:
    return path.parts and path.parts[0] == "cn-site"

def classify(path: Path) -> str:
    s = path.as_posix()
    if s.startswith("qilylean/daily/") and re.search(r"/\d{4}-\d{2}-\d{2}\.html$", s):
        return "selected_briefs"
    if s.startswith("knowledge/"):
        return "knowledge"
    if s.startswith("global-knowledge/"):
        return "global_knowledge"
    if s.startswith("projects/"):
        return "projects_practice"
    if s.startswith("improvements/"):
        return "improvements"
    if s.startswith("tools/") or s.startswith("qilylean/tools/"):
        return "tools"
    if s.startswith("certificates") or s.startswith("moments/"):
        return "learning_records"
    return "other_public"

def blocked_by_route(path: Path) -> bool:
    return bool(path.parts and path.parts[0] in COMMERCIAL_SEGMENTS)

def blocked_by_copy(path: Path) -> bool:
    try:
        text = (ROOT / path).read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return False
    return bool(COMMERCIAL_PATTERNS.search(text))

def main():
    files = tracked_html()
    international = [p for p in files if not is_cn(p)]
    cn = [p for p in files if is_cn(p)]

    categories = {}
    blocked = []
    eligible = []

    for p in international:
        bucket = classify(p)
        categories.setdefault(bucket, {"total": 0, "eligible": 0, "blocked": 0})
        categories[bucket]["total"] += 1

        if blocked_by_route(p):
            categories[bucket]["blocked"] += 1
            blocked.append({"path": p.as_posix(), "reason": "commercial_route"})
            continue

        # Copy-level commercial markers do not automatically delete the page from the
        # mirror plan: they mean the page must be sanitized/re-authored before CN publish.
        if blocked_by_copy(p):
            categories[bucket]["eligible"] += 1
            eligible.append({"path": p.as_posix(), "mode": "sanitize_and_rewrite"})
        else:
            categories[bucket]["eligible"] += 1
            eligible.append({"path": p.as_posix(), "mode": "direct_content_sync"})

    report = {
        "international_html_total": len(international),
        "cn_html_total": len(cn),
        "eligible_public_content_total": len(eligible),
        "hard_blocked_total": len(blocked),
        "categories": categories,
        "policy": "full public-content coverage with CN personal-site compliance filtering",
    }

    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
