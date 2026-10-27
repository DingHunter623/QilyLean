#!/usr/bin/env python3
from pathlib import Path
import re

CN = Path(__file__).resolve().parents[1]
AXIS_HREF = "/site-content-axis-v1.css?v=20261010-fullsite-axis-parity-v10"
AXIS_LINK = f'<link id="qilyContentAxisV1" rel="stylesheet" href="{AXIS_HREF}">'
VI_HREF = "/assets/cn-sitewide-visual-parity-v1.css?v=20261027-cn-kicker-font-regular-v1&kicker=21px-v2"
VI_LINK = f'<link id="qilyCnSitewideVisualParityV1" rel="stylesheet" href="{VI_HREF}">'
# The home hero golden label receives a fresh, home-only CSS URL. The
# destination CSS file remains unchanged; other CN routes retain their
# settled visual cache and layout.
# QILY-CN-HOME-HERO-KICKER-PUBLISH-PRIORITY-20261028: release only when updated home CSS URL is served.
HOME_VI_HREF = VI_HREF + "&home=20261028-gold-regular-v1"
HOME_VI_LINK = f'<link id="qilyCnSitewideVisualParityV1" rel="stylesheet" href="{HOME_VI_HREF}">'
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

    # Source clones retain their source cascade; an unscoped destination axis
    # appended after it would replace section colors and phone gutters.
    text = re.sub(
        r'\n?[ \t]*<link[^>]+id=["\']qilyContentAxisV1["\'][^>]*>\n?',
        "",
        text,
        flags=re.I,
    )
    text = re.sub(r'\n?[ \t]*<link[^>]+id=["\']qilyCnSitewideVisualParityV1["\'][^>]*>\n?', "", text, flags=re.I)
    page_vi_link = HOME_VI_LINK if path == CN / "index.html" else VI_LINK
    source_style = re.search(r'<(?:link|style)\b[^>]*\bdata-cn-source-css=', text, re.I)
    if source_style:
        text = text[:source_style.start()] + AXIS_LINK + "\n" + text[source_style.start():]
        text = text.replace("</head>", page_vi_link + "\n</head>", 1)
    else:
        text = text.replace("</head>", AXIS_LINK + "\n" + page_vi_link + "\n</head>", 1)

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
    page_vi_href = HOME_VI_HREF if path == CN / "index.html" else VI_HREF
    if AXIS_HREF not in text or page_vi_href not in text or 'data-qily-site="cn"' not in text or INTERNATIONAL_SHELL_IMPORT.search(text):
        missing.append(str(path.relative_to(CN)))

if missing:
    raise SystemExit("CN full-site axis authority missing from: " + ", ".join(missing))

print(f"CN full-site 1180px axis enforced: {checked} visual pages checked / {changed} updated.")
