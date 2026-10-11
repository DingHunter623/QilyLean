#!/usr/bin/env python3
"""Materialize the non-commercial 101-link China technology research directory.

Source of truth: international links/index.html's published five-field rows.
Only the public company names, categories, countries and official URLs are
replicated; international resource onboarding, referrals and business content
are deliberately not imported.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "links" / "index.html"
PAGE = ROOT / "cn-site" / "resources" / "index.html"
RUNTIME = ROOT / "cn-site" / "assets" / "cn-public-tech-directory-v1.js"
START = "/* QILY-CN-DIRECTORY-DATA:START */"
END = "/* QILY-CN-DIRECTORY-DATA:END */"


def main() -> None:
    original = SOURCE.read_text(encoding="utf-8")
    found = re.findall(r"var rows=`([\s\S]*?)`;", original)
    if len(found) != 1:
        raise SystemExit("Expected one international technology-directory dataset")
    rows = []
    for line in found[0].strip().splitlines():
        fields = line.split("|")
        if len(fields) != 5:
            raise SystemExit("Invalid public directory record: " + line)
        name, cn, category, country, url = fields
        parsed = urlparse(url)
        if not all(fields) or parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
            raise SystemExit("Invalid public directory URL or field: " + line)
        rows.append({"name": name, "cn": cn, "category": category, "country": country, "url": url})

    if len(rows) != 101 or len({record["url"] for record in rows}) != 101:
        raise SystemExit("International official directory deviates from the approved 101 unique entries")

    data = json.dumps(rows, ensure_ascii=False, separators=(",", ":"))
    asset = RUNTIME.read_text(encoding="utf-8")
    expression = re.escape(START) + r"[\s\S]*?" + re.escape(END)
    if len(re.findall(expression, asset)) != 1:
        raise SystemExit("China directory data ownership markers missing or duplicated")
    replacement = START + "\nconst companies=" + data + ";\n" + END
    rendered = re.sub(expression, lambda _: replacement, asset)
    if rendered != asset:
        RUNTIME.write_text(rendered, encoding="utf-8")

    version = hashlib.sha256(data.encode("utf-8")).hexdigest()[:12]
    page = PAGE.read_text(encoding="utf-8")
    asset_ref = r"(/assets/cn-public-tech-directory-v1\.js\?v=)[^\s\"']+"
    if len(re.findall(asset_ref, page)) != 1:
        raise SystemExit("China directory asset reference missing")
    updated = re.sub(asset_ref, lambda match: match.group(1) + version, page)
    if updated != page:
        PAGE.write_text(updated, encoding="utf-8")

    if "https://qilylean.com/links/cn-public/" not in updated:
        raise SystemExit("Approved public international resource introduction must remain accessible")
    print(f"CN public technology directory synced: {len(rows)} records, 6 industry classes + navigation, rev={version}")


if __name__ == "__main__":
    main()
