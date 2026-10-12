#!/usr/bin/env python3
"""Validate content-control and approved-runtime contracts after materializing."""
from __future__ import annotations

import hashlib
import importlib
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parents[2]
CN = ROOT / "cn-site"
sys.path.insert(0, str(CN / "scripts"))
sys.dont_write_bytecode = True
source = importlib.import_module("materialize-public-content-mirror")


class Nodes(HTMLParser):
    def __init__(self, value: str):
        super().__init__()
        self.nodes: list[tuple[str, dict[str, str | None]]] = []
        self.feed(value)

    def handle_starttag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))

    def matching(self, tag: str, attribute: str = "", value: str = ""):
        return [a for t, a in self.nodes if t == tag and (not attribute or (attribute in a and (not value or a[attribute] == value)))]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def main() -> None:
    report = json.loads((CN / "archive/public-interactions.json").read_text(encoding="utf-8"))
    inventory = {s.path.as_posix(): s for s in source.SOURCES}
    expected_sources = set()
    for path, page in inventory.items():
        if source.is_date_brief(page.path):
            continue
        fragment = source.extract_fragment((ROOT / page.path).read_text(encoding="utf-8"))
        if re.search(r'<(?:input|form|select|textarea|canvas|iframe)\b|<button\b(?![^>]*qily-float-btn)', fragment, re.I):
            expected_sources.add(path)
    require({item["source"] for item in report["items"]} == expected_sources, "Public interaction source inventory drifted")
    checked = 0
    for item in report["items"]:
        page = inventory[item["source"]]
        doc = page.out.read_text(encoding="utf-8")
        parsed = Nodes(doc)
        assets = parsed.matching("script", "data-cn-public-interactions") + parsed.matching("link", "data-cn-public-interactions")
        require(len(assets) == (4 if item["kind"] == "terminology" else 2), "Missing interaction resources: " + item["url"])
        for asset in assets:
            url = urlparse(asset.get("src") or asset.get("href") or "")
            path = CN / unquote(url.path.lstrip("/"))
            require(path.is_file(), "Missing generated resource: " + url.path)
            digest = hashlib.sha256(path.read_bytes()).hexdigest()[:12]
            require(parse_qs(url.query).get("v") == [digest], "Interaction cache identity mismatch: " + url.path)
        if item["kind"] == "terminology":
            require(len(parsed.matching("article", "data-term-card")) == report["terminology_lessons"], "Terminology cards lost")
            search = parsed.matching("input", "id", "termSearch")
            require(len(search) == 1 and search[0].get("type") == "search", "Terminology search control missing")
            require(bool(parsed.matching("label", "for", "termSearch")), "Terminology search label missing")
            require(bool(parsed.matching("section", "id", "engineering")), "Engineering hash target missing")
            runtime = (CN / "assets/public-terminology-interactions.js").read_text(encoding="utf-8")
            require(not re.search(r"mailto:|tel:|Qily259|qilylean\.com|homepage-music|site-navigation|floatDock", runtime, re.I), "Unapproved terminology runtime dependency")
            require("searchParams.set('opl',data.code)" in runtime and "params.get('opl')" in runtime, "Standalone OPL deep-link contract missing")
        elif item["kind"] == "brief-index":
            expected = sum(source.is_date_brief(s.path) for s in source.SOURCES)
            require(len(parsed.matching("a", "data-brief-date")) == expected, "Local brief index incomplete")
            require(bool(parsed.matching("input", "id", "cnPublicBriefSearch")), "Local brief index search missing")
        elif item["kind"] == "pdf":
            frames = parsed.matching("iframe", "id", "gbt2828PdfPreview")
            require(len(frames) == 1 and str(frames[0].get("src", "")).startswith("/assets/public-gbt2828-reference.pdf?v="), "Approved PDF preview missing")
            require((CN / "assets/public-gbt2828-reference.pdf").read_bytes().startswith(b"%PDF-"), "Approved PDF missing")
        if item["source"].startswith("qilylean/reference-"):
            original = Nodes(source.extract_fragment((ROOT / page.path).read_text(encoding="utf-8")))
            expected = len(original.matching("canvas"))
            require(len(parsed.matching("canvas")) == expected, "Reference canvas pages lost: " + item["url"])
            for canvas in parsed.matching("canvas"):
                require(str(canvas.get("data-src", "")).startswith("/mirror-media/qilylean/reference/"), "Unmapped reference asset: " + item["url"])
                require(canvas.get("data-preview-key") in ("QilyLeanPreview2026", "QilyLeanFlowPreview2026"), "Reference decode key missing")
        if item["source"] == "projects/factory-layout/index.html":
            previews = parsed.matching("button", "data-plan-preview")
            require(len(previews) == 9, "Factory plan preview controls lost")
            for button in previews:
                require(str(button.get("data-plan-source", "")).startswith("/mirror-media/"), "Factory original preview asset unmapped")
        if item["source"] == "qilylean/production-operations-organization.html":
            # Contact/QR preview cards are deliberately removed by the mirror
            # policy; all remaining presentation/workbook previews survive.
            previews = [a for a in parsed.matching("button") if "preview-open" in str(a.get("class", "")).split()]
            original = source.remove_forbidden_blocks(source.extract_fragment((ROOT / page.path).read_text(encoding="utf-8")))
            expected = len(re.findall(r'<button\b[^>]*\bclass="preview-open"', original))
            require(len(previews) == expected, "Public organization preview controls lost")
            require(not re.search(r'<a\b[^>]*>下载(?:PPT|Excel)</a>|<h3>官网与</h3>', doc), "Inert attachment/contact residue remains")
            require(all('href' in a for a in parsed.matching('a') if 'button' in str(a.get('class','')).split()), "Public resource action has no destination")
        if item["source"] in ("knowledge/pdca-gantt-milestone-opl.html", "knowledge/terminology/mtbf.html", "knowledge/terminology/mttr.html"):
            require(bool(parsed.matching("button", "data-public-print")), "Public print action missing: " + item["url"])
        checked += 1
    require(checked == report["checked"] and checked >= 20, "Public interaction route inventory incomplete")
    print(f"CN public interaction contracts passed: {checked} routes / {report['terminology_lessons']} terminology lessons")


if __name__ == "__main__":
    main()
