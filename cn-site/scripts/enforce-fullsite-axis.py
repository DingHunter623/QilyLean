#!/usr/bin/env python3
from pathlib import Path
import re

CN = Path(__file__).resolve().parents[1]
AXIS_HREF = "/site-content-axis-v1.css?v=20261010-fullsite-axis-parity-v10"
AXIS_LINK = f'<link id="qilyContentAxisV1" rel="stylesheet" href="{AXIS_HREF}">'
VI_HREF = "/assets/cn-sitewide-visual-parity-v1.css?v=20261023-fullsite-vi-parity-v4"
VI_LINK = f'<link id="qilyCnSitewideVisualParityV1" rel="stylesheet" href="{VI_HREF}">'
ABOUT = (CN / 'about/index.html').read_text(encoding='utf-8')
CANONICAL_HEADER = re.search(r'<header\b[\s\S]*?</header>', ABOUT, re.I).group(0)
CANONICAL_HEADER = re.sub(r'\saria-current=["\']page["\']', '', CANONICAL_HEADER)
INTERNATIONAL_SHELL_IMPORT = re.compile(
    r'<(?:link|script)\b[^>]*(?:href|src)=["\']/site-'
    r'(?:floating-dock-gold-v1\.css|visual-authority-r8\.css|visual-runtime-r8\.js)'
    r'(?:\?[^"\']*)?["\'][^>]*>(?:</script>)?\n?', re.I,
)

changed = 0
checked = 0
for path in sorted(CN.rglob("*.html")):
    text = path.read_text(encoding="utf-8", errors="ignore")
    # Search-engine ownership files are protocol payloads, not visual pages.
    if "/assets/site.css" not in text or "<head" not in text or "<body" not in text:
        continue
    checked += 1
    before = text

    # Support, policy and error pages used a reduced header. They now receive
    # the same noncommercial primary navigation and translation affordance.
    header = re.search(r'<header\b[\s\S]*?</header>', text, re.I)
    if header and 'aria-label="主导航"' not in header.group(0):
        text = text[:header.start()] + CANONICAL_HEADER + text[header.end():]

    # Legal/support emails remain directly actionable after removing footer contact.
    text = re.sub(r'<span\b([^>]*)>admin@qilylean\.com</span>',
                  r'<a\1 href="mailto:admin@qilylean.com">admin@qilylean.com</a>', text)

    # These international shell owners are not published at China-domain paths.
    # CN owns its navigation, footer and measured header through local assets.
    text = INTERNATIONAL_SHELL_IMPORT.sub("", text)

    # Normalize or append the canonical content-axis authority as the final
    # stylesheet in <head>, so cached/legacy page-local width rules cannot win.
    text = re.sub(
        r'\n?[ \t]*<link[^>]+id=["\']qilyContentAxisV1["\'][^>]*>\n?',
        "",
        text,
        flags=re.I,
    )
    text = re.sub(r'\n?[ \t]*<link[^>]+id=["\']qilyCnSitewideVisualParityV1["\'][^>]*>\n?', "", text, flags=re.I)
    text = text.replace("</head>", AXIS_LINK + "\n" + VI_LINK + "\n</head>", 1)

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
    if AXIS_HREF not in text or VI_HREF not in text or 'data-qily-site="cn"' not in text or INTERNATIONAL_SHELL_IMPORT.search(text):
        missing.append(str(path.relative_to(CN)))

if missing:
    raise SystemExit("CN full-site axis authority missing from: " + ", ".join(missing))

print(f"CN full-site 1180px axis enforced: {checked} visual pages checked / {changed} updated.")
