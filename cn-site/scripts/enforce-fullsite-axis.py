#!/usr/bin/env python3
from pathlib import Path
import re

CN = Path(__file__).resolve().parents[1]
AXIS_HREF = "/site-content-axis-v1.css?v=20261010-fullsite-axis-parity-v10"
AXIS_LINK = f'<link id="qilyContentAxisV1" rel="stylesheet" href="{AXIS_HREF}">'

changed = 0
checked = 0
for path in sorted(CN.rglob("*.html")):
    text = path.read_text(encoding="utf-8", errors="ignore")
    # Search-engine ownership files are protocol payloads, not visual pages.
    if "/assets/site.css" not in text or "<head" not in text or "<body" not in text:
        continue
    checked += 1
    before = text

    # Normalize or append the canonical content-axis authority as the final
    # stylesheet in <head>, so cached/legacy page-local width rules cannot win.
    text = re.sub(
        r'<link[^>]+id=["\']qilyContentAxisV1["\'][^>]*>',
        "",
        text,
        flags=re.I,
    )
    text = text.replace("</head>", AXIS_LINK + "\n</head>", 1)

    # Deterministic CN scope; avoids touching international layouts while using
    # the exact same canonical stylesheet.
    if not re.search(r'<body\b[^>]*\bdata-qily-site=["\']cn["\']', text, re.I):
        text = re.sub(r'<body\b', '<body data-qily-site="cn"', text, count=1, flags=re.I)

    if text != before:
        path.write_text(text, encoding="utf-8")
        changed += 1

missing = []
for path in sorted(CN.rglob("*.html")):
    text = path.read_text(encoding="utf-8", errors="ignore")
    if "/assets/site.css" not in text:
        continue
    if AXIS_HREF not in text or 'data-qily-site="cn"' not in text:
        missing.append(str(path.relative_to(CN)))

if missing:
    raise SystemExit("CN full-site axis authority missing from: " + ", ".join(missing))

print(f"CN full-site 1180px axis enforced: {checked} visual pages checked / {changed} updated.")
