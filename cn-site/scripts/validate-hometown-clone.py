#!/usr/bin/env python3
"""Strict public paper parity: international article content + native CN shell."""
from pathlib import Path
import hashlib
import re
import sys

root=Path(__file__).resolve().parents[2]
source=(root/"links/hometown-manufacturing/index.html").read_text(encoding="utf-8")
target=(root/"cn-site/links/hometown-manufacturing/index.html").read_text(encoding="utf-8")
directory=(root/"cn-site/resources/index.html").read_text(encoding="utf-8")
sitemap=(root/"cn-site/sitemap.xml").read_text(encoding="utf-8")
cn_style=(root/"cn-site/assets/cn-hometown-resource-network-v1.css").read_text(encoding="utf-8")
source_style=(root/"site-resource-network-v1.css").read_text(encoding="utf-8")
source_directory=(root/"links/index.html").read_text(encoding="utf-8")

def require(ok, message):
    if not ok: raise AssertionError(message)
def main(doc):
    found=re.findall(r"<main\b[\s\S]*?</main>",doc,re.I)
    require(len(found)==1, "Expected one complete article main")
    return found[0]
def style(doc, identity):
    found=re.findall(r'<style\b[^>]*id="'+re.escape(identity)+r'"[^>]*>[\s\S]*?</style>',doc,re.I)
    require(len(found)==1, "Style block missing: "+identity)
    return found[0]

source_main=main(source)
cn_main=main(target)
require(cn_main.replace('href="/resources/"','href="/links/"')==source_main,
        "CN research article body differs from its approved international content")
for name in ("qilyHometownManufacturingPaperStyles","qilyHometownManufacturingRefinementV1"):
    require(style(source,name)==style(target,name), "Published article CSS differs: "+name)
require(source.count("<svg")==target.count("<svg")==4,"Four original SVG figures must be retained")
require(source_main.count('data-qily-unified-arrow="v4"')==cn_main.count('data-qily-unified-arrow="v4"')==12,
        "All V4 diagram arrows must match")
require('data-qily-flow-direction="feedback"' in cn_main,"Knowledge-feedback loop missing")
require('<title>让专业知识走进家乡制造业：' in target,"Exact approved headline missing")
require('<link rel="canonical" href="https://qilylean.cn/links/hometown-manufacturing/">' in target,"China canonical missing")
require('data-qily-site="cn"' in target,"China site identity missing")
require('data-qily-nav-key="resources" aria-current="page"' in target,"Native CN navigation mismatch")
require("https://beian.miit.gov.cn/" in target,"China filing missing")
require('data-qily-footer-action="top"' in target and 'data-qily-footer-action="current"' in target,
        "Approved CN footer actions missing")
require(target.count('<footer class="footer">')==1,"Original CN public footer missing/duplicated")
require("https://qilylean.com/links/hometown-manufacturing/" not in target,"International canonical leaked into CN page")
require(directory.count("QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:START")==1,"CN resources module missing/duplicated")
require(directory.count('href="/links/hometown-manufacturing/"')==1,"CN article link missing/duplicated")
card_pattern=r'<!-- QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:START -->[\s\S]*?<!-- QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:END -->'
require(re.search(card_pattern,source_directory).group(0)==re.search(card_pattern,directory).group(0),
        "Approved public-knowledge card must retain the exact source wording and markup")
require('qilyCnHometownViParity' not in target,"Retired handwritten heading overrides remain")
for doc,basename in ((target,'cn-hometown-paper-source.css'),(directory,'cn-hometown-card-source.css')):
    asset=root/'cn-site/assets'/basename
    expected='/assets/'+basename+'?v='+hashlib.sha256(asset.read_bytes()).hexdigest()[:16]
    require(doc.count('id="qilyCnHometownSourceCascade"')==1 and expected in doc,
            "Missing or stale isolated source cascade: "+basename)
    runtime=root/'cn-site/assets/cn-hometown-content-runtime.js'
    runtime_url='/assets/'+runtime.name+'?v='+hashlib.sha256(runtime.read_bytes()).hexdigest()[:16]
    require(doc.count('data-cn-hometown-content-runtime="v1"')==1 and runtime_url in doc,
            "Missing or stale source table/grid/diagram adapter")
positions={key:directory.index(key) for key in ("QILY-CHINA-KNOWLEDGE-BRIDGE:END","QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:START","QILY-ELECTRICAL-REFERENCES:START")}
require(positions["QILY-CHINA-KNOWLEDGE-BRIDGE:END"]<positions["QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:START"]<positions["QILY-ELECTRICAL-REFERENCES:START"],
        "Directory module placement drifted: "+str(positions))
require('id="qilyCnHometownPublicKnowledgeVi"' in directory,"Directory VI stylesheet missing")
require(cn_style.strip().split("\n",1)[-1]==source_style[:source_style.index("html body main section.hero")].strip(),
        "Resource knowledge card CSS no longer matches accepted international VI")
require(sitemap.count("https://qilylean.cn/links/hometown-manufacturing/")==1,"China sitemap entry missing/duplicated")
print("PASS: full 1:1 source paper body (only CN return route localized)")
print("PASS: four original SVGs, all 12 arrows, and exact paper CSS")
print("PASS: native CN header/footer, canonical/filing, resource entry and sitemap")
