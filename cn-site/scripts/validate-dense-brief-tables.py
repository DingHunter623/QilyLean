#!/usr/bin/env python3
"""Check dense-table scope, keyboard containment and source row associations.

Run after CN materialization. An optional CN root supports frozen release builds.
Uses the standard library, as does the production renderer.
"""
from __future__ import annotations

import importlib.util
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CN = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "cn-site"
sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location(
    "dense_brief_visuals", Path(__file__).with_name("materialize-brief-visual-parity.py")
)
visual = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(visual)


class Tables(HTMLParser):
    def __init__(self, text: str):
        super().__init__(convert_charrefs=True)
        self.tables = []
        self.divs = []
        self.table = self.row = self.cell = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "div":
            self.divs.append(attrs)
        elif tag == "table":
            self.table = {"rows": [], "regions": self.divs.copy()}
        elif tag == "tr" and self.table is not None:
            self.row = []
        elif tag in ("th", "td") and self.row is not None:
            self.cell = {"tag": tag, "span": int(attrs.get("colspan", "1")), "text": ""}

    def handle_data(self, text):
        if self.cell is not None:
            self.cell["text"] += text

    def handle_endtag(self, tag):
        if tag == "div" and self.divs:
            self.divs.pop()
        elif tag in ("th", "td") and self.cell is not None:
            self.cell["text"] = re.sub(r"\s+", " ", self.cell["text"]).strip()
            self.row.append(self.cell)
            self.cell = None
        elif tag == "tr" and self.row is not None:
            self.table["rows"].append(self.row)
            self.row = None
        elif tag == "table" and self.table is not None:
            self.tables.append(self.table)
            self.table = None


css = (CN / "assets/brief-visual-parity.css").read_text(encoding="utf-8")
marker = "/* QILY-CN-BRIEF-DENSE-TABLE-READABILITY-V11"
assert marker in css, "Missing dense-table component"
component = css[css.index(marker):]
rules = list(visual.css_rules(component))
thresholds = set()
for prelude, body in rules:
    assert body is not None and not prelude.startswith("@"), prelude
    for selector in visual.split_css(prelude, ","):
        assert "body[data-qily-brief-parity] #main#main#main" in selector, selector
        dense = re.search(r":has\(>thead>tr:first-child>:nth-child\((\d+)\)", selector)
        assert dense and int(dense.group(1)) >= 4, "Dense styles could affect a 2/3-column table: " + selector
        thresholds.add(int(dense.group(1)))
assert {4, 5, 6} <= thresholds, "Missing dense column-count coverage"

# 2026-08-25 eight-waste matrix: the international source and CN mirror must
# use the same fixed 13/18/30/20/19 column contract and 1120px reading canvas.
matrix_date = "2026-08-25"
matrix_source = (ROOT / "qilylean/daily" / f"{matrix_date}.html").read_text(encoding="utf-8")
assert '.w8 table{width:100%;min-width:1120px;border-collapse:collapse}' in matrix_source, "International matrix minimum width changed"
assert 'article[id="2026-08-25"].w8 .matrix-wrap table{table-layout:fixed!important}' in matrix_source, "International matrix is not fixed-layout"
column_widths = ("13%", "18%", "30%", "20%", "19%")
for index, width in enumerate(column_widths, start=1):
    rule = f'article[id="2026-08-25"].w8 .matrix-wrap tr>:nth-child({index}){{width:{width}!important'
    assert rule in matrix_source, ("International matrix column width mismatch", index, width)

cn_start = css.find("/* QILY-CN-WASTE-MATRIX-2026-08-25-V1")
cn_end = css.find("/* QILY-CN-BRIEF-HEADER-PARITY", cn_start)
assert cn_start >= 0 and cn_end > cn_start, "Missing CN 2026-08-25 matrix parity override"
cn_matrix_css = css[cn_start:cn_end]
assert "table-layout:fixed!important" in cn_matrix_css, "CN matrix is not fixed-layout"
for index, width in enumerate(column_widths, start=1):
    rule = f"tr>:nth-child({index}){{width:{width}!important"
    assert rule in cn_matrix_css, ("CN matrix column width mismatch", index, width)

matrix_page = CN / "briefs/archive" / matrix_date / "index.html"
assert matrix_page.is_file(), "Missing generated CN 2026-08-25 brief"
matrix_html = matrix_page.read_text(encoding="utf-8")
scoped_blocks = re.findall(
    r'<style\\b[^>]*data-qily-brief-source-style="v2"[^>]*>([\\s\\S]*?)</style\\s*>',
    matrix_html,
    re.I,
)
scoped_css = "\\n".join(scoped_blocks)
assert f'{visual.CONTENT_SCOPE} article[id="2026-08-25"].w8 .matrix-wrap table{{table-layout:fixed!important}}' in scoped_css, "CN mirror did not receive the source table layout"
for index, width in enumerate(column_widths, start=1):
    rule = f'{visual.CONTENT_SCOPE} article[id="2026-08-25"].w8 .matrix-wrap tr>:nth-child({index}){{width:{width}!important'
    assert rule in scoped_css, ("CN mirror source-style width mismatch", index, width)


count = 0
routes = set()
for src in visual.source.SOURCES:
    if not visual.source.is_date_brief(src.path):
        continue
    original = Tables((ROOT / src.path).read_text(encoding="utf-8")).tables
    dense = [i for i, table in enumerate(original)
             if table["rows"] and sum(c["span"] for c in table["rows"][0]) >= 4]
    if not dense:
        continue
    date = Path(src.path).stem
    target = CN / "briefs/archive" / date / "index.html"
    assert target.is_file(), "Missing dense-table route: " + str(target)
    mirrored = Tables(target.read_text(encoding="utf-8")).tables
    assert len(mirrored) == len(original), (src.path, "table count changed")
    for index in dense:
        before, after = original[index], mirrored[index]
        assert before["rows"] == after["rows"], (src.path, index, "header or row association changed")
        header = before["rows"][0]
        assert all(cell["tag"] == "th" and cell["text"] for cell in header), (src.path, index, "missing headers")
        columns = sum(cell["span"] for cell in header)
        assert all(sum(cell["span"] for cell in row) == columns for row in before["rows"]), (src.path, index, "misaligned row")
        regions = [r for r in after["regions"] if "qily-brief-table-scroll" in r.get("class", "").split()]
        assert regions and regions[-1].get("role") == "region", (src.path, index, "missing scroll region")
        assert regions[-1].get("tabindex") == "0" and regions[-1].get("aria-label"), (src.path, index, "keyboard scroll unavailable")
        count += 1
        routes.add(date)
assert count, "No dense source tables found"
print(f"Dense brief table contract passed: {count} tables across {len(routes)} routes; source rows and keyboard containment preserved.")
