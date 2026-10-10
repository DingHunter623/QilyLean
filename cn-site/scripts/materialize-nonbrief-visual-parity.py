#!/usr/bin/env python3
"""Restore structural/visual fidelity of ALL eligible non-brief CN mirrored pages.

The 380 dated briefs have their own original-style parity pipeline. This pass
covers the complementary 52 manufacturing articles, project practice pages,
reference resources and knowledge indexes without modifying the international
site or the approved China-site header, footer and compliance controls.
"""
from __future__ import annotations

import html
import importlib
import json
import re
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
CN=ROOT/"cn-site"
sys.path.insert(0,str(CN/"scripts"))
source=importlib.import_module("materialize-public-content-mirror")
brief=importlib.import_module("materialize-brief-visual-parity")

REPORT=CN/"archive"/"nonbrief-visual-parity.json"
MEDIA=CN/"archive"/"media-manifest.txt"
EXTRA_CSS='<link rel="stylesheet" href="/assets/nonbrief-visual-parity.css?v=20261011-all-mirror-visual-v1">'

def recover_relative_media(markup:str, path:Path)->str:
    # Only expand references that resolve to checked-in public files; do not
    # allow remote hosts, traversal beyond repo or private file inclusions.
    def replace(match:re.Match)->str:
        prefix,url,suffix=match.groups()
        if url.startswith(("/", "#", "data:", "blob:", "http:", "https:")):
            return match.group(0)
        clean=url.split("?",1)[0].split("#",1)[0]
        candidate=(ROOT/path.parent/clean).resolve()
        try:rel=candidate.relative_to(ROOT)
        except ValueError:return match.group(0)
        if not candidate.is_file():return match.group(0)
        if candidate.suffix.lower() not in brief.MEDIA_EXT:return match.group(0)
        return prefix+"/"+rel.as_posix()+suffix
    return re.sub(r"""((?:\bsrc|\bposter)=["'])([^"']+)(["'])""", replace, markup, flags=re.I)

def main()->None:
    eligible=[s for s in source.SOURCES if not source.is_date_brief(s.path)]
    if len(eligible)<40:raise SystemExit("Non-brief mirror inventory unexpectedly small")
    evidence=[]
    for page in eligible:
        raw=(ROOT/page.path).read_text(encoding="utf-8",errors="ignore")
        fragment=source.extract_fragment(raw)
        fragment=recover_relative_media(fragment,page.path)
        body,svg_count,visual_nodes=brief.sanitize_main(fragment)
        # Original heading, image, card, chart and diagram semantics remain in
        # the full-width content column; no new commercial links are added.
        title,desc=source.extract_meta(raw)
        doc=source.wrap_page(page,title,desc,body)
        doc=doc.replace(
            '<article class="article-body mirror-article">',
            '<article class="article-body mirror-article mirror-article-fidelity" data-qily-original-visual="v1">',
            1,
        )
        doc=doc.replace("</head>",EXTRA_CSS+"</head>",1)
        if 'data-qily-original-visual="v1"' not in doc:
            raise SystemExit("Missing non-brief visual marker: "+str(page.path))
        if len(re.findall(r"<svg\b",doc,re.I))!=svg_count:
            raise SystemExit("Inline diagram lost: "+str(page.path))
        if visual_nodes and "class=" not in body:
            raise SystemExit("Original visual semantics lost: "+str(page.path))
        if "/assets/nonbrief-visual-parity.css" not in doc:
            raise SystemExit("Missing non-brief visual CSS: "+str(page.path))
        page.out.parent.mkdir(parents=True,exist_ok=True)
        page.out.write_text(doc,encoding="utf-8")
        evidence.append({
            "source":page.path.as_posix(),
            "url":page.url,
            "category":page.category,
            "visual_class_nodes":visual_nodes,
            "inline_svg":svg_count,
            "media":len(re.findall(r'/(?:mirror-media)/',doc)),
            "source_chars":len(source.clean_text(fragment)),
            "cn_chars":len(source.clean_text(body)),
        })
    manifest=set(line.strip() for line in MEDIA.read_text(encoding="utf-8").splitlines() if line.strip())
    manifest.update(source.MIRROR_MEDIA)
    MEDIA.write_text("\n".join(sorted(manifest))+"\n",encoding="utf-8")
    REPORT.write_text(json.dumps({
        "checked":len(evidence),
        "visual_classes":sum(x["visual_class_nodes"] for x in evidence),
        "inline_svg_preserved":sum(x["inline_svg"] for x in evidence),
        "items":evidence,
    },ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"CN non-brief visual parity checked: {len(evidence)} pages / "+
          f"{sum(x['visual_class_nodes'] for x in evidence)} semantic nodes / "+
          f"{sum(x['inline_svg'] for x in evidence)} inline diagrams")

if __name__=="__main__":
    main()
