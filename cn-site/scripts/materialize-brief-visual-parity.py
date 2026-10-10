#!/usr/bin/env python3
"""Restore the international brief's semantic layout, original diagrams, and local
version of its curated-brief CSS for every eligible China-site brief.

Only the 380+ already-approved public /qilylean/daily/YYYY-MM-DD.html routes
are touched; CN shell, footer, ICP and commercial filters remain authoritative.
"""
from __future__ import annotations

import html
import importlib.util
import json
import re
import shutil
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, urlparse, unquote

ROOT=Path(__file__).resolve().parents[2]
CN=ROOT/"cn-site"
MIRROR=CN/"archive"/"media-manifest.txt"
REPORT=CN/"archive"/"brief-visual-parity.json"
sys.path.insert(0,str(CN/"scripts"))
import importlib
source=importlib.import_module("materialize-public-content-mirror")

CSS_SET = [
    "qilylean/daily-briefs.css",
    "qilylean/daily-brief-unified-layout-v2.css",
    "qilylean/knowledge-brief.css",
    "qilylean/daily/brief-layout-standard.css",
    "site-daily-brief-layout-guard-v1.css",
]
MEDIA_EXT={".png",".jpg",".jpeg",".webp",".gif",".svg",".mp4",".webm"}
SAFE_URL_ATTRS={"src","poster"}
VISUAL_CLASSES=re.compile(r"^[\w\-\s]{1,350}$",re.U)
ID_ATTR=re.compile(r"^[a-zA-Z][a-zA-Z0-9_\-:.]*$")
SVG_PATTERN=re.compile(r"<svg\b[\s\S]*?</svg\s*>",re.I)
SVG_RISK=re.compile(r"<\s*(?:script|foreignObject|iframe|object|embed)\b|\bon[a-z]+\s*=|javascript:|data:text/html|<\s*image\b[^>]*\bhref\s*=\s*['\"]https?://",re.I)
STYLE_IMPORT=re.compile(r'(@import\s+url\(["\']?)(/[^"\')\s]+)(["\']?\)\s*;)',re.I)

def local_media(url:str)->str:
    p=urlparse(url)
    if p.scheme in ("http","https"):
        if p.netloc.lower() not in {"qilylean.com","www.qilylean.com"}:return ""
        path=p.path
    elif url.startswith("/"):
        path=p.path
    else:return ""
    rel=unquote(path).lstrip("/")
    if ".." in Path(rel).parts:return ""
    if re.search(r"(?:^|[-_/])(qr|qrcode|wechat|weixin|contact)(?:[-_./]|$)",rel,re.I):return ""
    if Path(rel).suffix.lower() not in MEDIA_EXT:return ""
    f=ROOT/rel
    if not f.is_file():return ""
    if f.suffix.lower()==".svg":
        svg=f.read_text(encoding="utf-8",errors="ignore")
        if SVG_RISK.search(svg):return ""
    encoded=quote(rel,safe="/")
    source.MIRROR_MEDIA.add(encoded)
    return "/mirror-media/"+encoded

def copy_stylesheet(rel:str,copied:set[str])->str:
    """Copy source curated-brief CSS, preserving the exact styling rules;
    recursively rebase CSS @imports so production never depends on .com CSS."""
    rel=unquote(rel.split("?",1)[0]).lstrip("/")
    if ".." in Path(rel).parts or Path(rel).suffix.lower()!=".css":return ""
    src=ROOT/rel
    if not src.is_file():return ""
    href="/assets/brief-visual-source/"+quote(rel,safe="/")
    if rel in copied:return href
    copied.add(rel)
    content=src.read_text(encoding="utf-8",errors="ignore")
    def imports(match):
        imp=copy_stylesheet(match.group(2),copied)
        return match.group(1)+imp+match.group(3) if imp else "/* skipped remote import */"
    content=STYLE_IMPORT.sub(imports,content)
    def media_rebase(match):
        u=match.group(2)
        mapped=local_media(u)
        return match.group(1)+mapped+match.group(3) if mapped else match.group(0)
    content=re.sub(r'(url\(["\']?)(/(?!/)[^"\'\)\s]+)(["\']?\))',media_rebase,content)
    dest=CN/"assets/brief-visual-source"/rel
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(content,encoding="utf-8")
    return href

class VisualSanitizer(HTMLParser):
    allowed={
        "h1","h2","h3","h4","h5","h6","p","ul","ol","li","blockquote",
        "pre","code","table","caption","colgroup","col","thead","tbody","tfoot",
        "tr","th","td","figure","figcaption","img","a","strong","b","em","i",
        "span","div","section","article","nav","br","hr","small","time","sup",
        "sub","details","summary","picture","source","video","main","dl","dt","dd"
    }
    skip_tags={"script","style","noscript","iframe","form","button","input","select","textarea","object","embed"}
    void={"img","br","hr","col","source"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts=[];self.skip_stack=[];self.open_tags=[]
        self.visual_nodes=0
    def handle_starttag(self,tag,attrs):
        if self.skip_stack:
            if tag in self.skip_tags:self.skip_stack.append(tag)
            return
        if tag in self.skip_tags:
            self.skip_stack.append(tag);return
        if tag not in self.allowed:return
        a=dict(attrs);kept=[]
        clazz=a.get("class","")
        if clazz and VISUAL_CLASSES.fullmatch(clazz):
            kept.append(("class",clazz))
            self.visual_nodes+=1
        identifier=a.get("id","")
        if identifier and ID_ATTR.fullmatch(identifier):kept.append(("id",identifier))
        for key,val in attrs:
            if val is None:continue
            if key in {"aria-label","role","datetime","data-label","data-parity-svg","width","height","colspan","rowspan"} or re.fullmatch(r"data-(?:qily|brief|daily|one-point|section|step|item|visual|[a-z0-9_-]{2,35})[a-z0-9_-]*",key or ""):
                if len(val)<400 and not re.search(r"javascript:|<|>|onerror|onload",val,re.I):
                    if key in {"width","height","colspan","rowspan"} and not val.isdigit():continue
                    if key not in {"class","id"}:kept.append((key,val))
        if tag=="a":
            href=source.rewrite_href(a.get("href",""))
            if href and not href.lower().startswith(("javascript:","mailto:","tel:")):
                kept.append(("href",href))
                if href.startswith(("http://","https://")):kept.extend([("target","_blank"),("rel","noopener noreferrer")])
        if tag in {"img","source","video"}:
            if a.get("src"):
                media=local_media(a["src"])
                if media:kept.append(("src",media))
                elif tag=="img":return
            if a.get("poster"):
                poster=local_media(a["poster"])
                if poster:kept.append(("poster",poster))
            for key in ("alt","title"):
                if key in a and a[key] and len(a[key])<300:kept.append((key,a[key]))
            if tag=="img":kept.extend([("loading","lazy"),("decoding","async")])
            if tag=="video":kept.extend([("controls","controls"),("preload","metadata")])
        att="".join(' '+key+'="'+html.escape(str(value),quote=True)+'"' for key,value in kept)
        self.parts.append("<"+tag+att+">")
        if tag not in self.void:self.open_tags.append(tag)
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag not in self.void:self.handle_endtag(tag)
    def handle_endtag(self,tag):
        if self.skip_stack:
            if tag==self.skip_stack[-1]:self.skip_stack.pop()
            return
        if tag not in self.allowed or tag in self.void:return
        if tag in self.open_tags:
            while self.open_tags:
                popped=self.open_tags.pop()
                self.parts.append("</"+popped+">")
                if popped==tag:break
    def handle_data(self,data):
        if not self.skip_stack:self.parts.append(html.escape(data))
    def handle_entityref(self,name):
        if not self.skip_stack:self.parts.append("&"+name+";")

def sanitize_main(original:str):
    svgs=[]
    def svg_replace(m):
        raw=m.group(0)
        if SVG_RISK.search(raw):raise RuntimeError("unsafe inline SVG present; no lossy omission allowed")
        n=len(svgs);svgs.append(raw)
        return '<span data-parity-svg="'+str(n)+'"></span>'
    original=SVG_PATTERN.sub(svg_replace,original)
    # Forms and feedback panels contain personal contact and commercial conversion UI.
    original=re.sub(r'<section\b[^>]*class=["\'][^"\']*\bbrief-feedback\b[^"\']*["\'][^>]*>[\s\S]*?</section\s*>',"",original,flags=re.I)
    parser=VisualSanitizer()
    parser.feed(original)
    safe="".join(parser.parts)
    safe=source.remove_forbidden_blocks(safe)
    for i,svg in enumerate(svgs):
        safe=safe.replace('<span data-parity-svg="'+str(i)+'"></span>',svg)
    if len(source.clean_text(safe))<100:raise RuntimeError("brief content unexpectedly empty after filtering")
    return safe,len(svgs),parser.visual_nodes

def main():
    copied=set()
    for file in CSS_SET:
        if not copy_stylesheet(file,copied):raise SystemExit("Missing international brief stylesheet: "+file)
    evidence=[];briefs=[s for s in source.SOURCES if source.is_date_brief(s.path)]
    if len(briefs)<350:raise SystemExit("Incomplete curated brief source set")
    for src in briefs:
        raw=(ROOT/src.path).read_text(encoding="utf-8",errors="ignore")
        title,desc=source.extract_meta(raw)
        mainmatch=re.search(r'<main\b([^>]*)>([\s\S]*?)</main\s*>',raw,re.I)
        if not mainmatch:raise SystemExit("Missing original international main: "+str(src.path))
        safe,svg_count,visual_nodes=sanitize_main(mainmatch.group(2))
        bodymatch=re.search(r'<body\b([^>]*)>',raw,re.I)
        bodyattrs=bodymatch.group(1) if bodymatch else ""
        source_classes=re.search(r'\bclass=["\']([^"\']+)["\']',bodyattrs)
        classes=(source_classes.group(1) if source_classes else "").split()
        classes=[x for x in classes if re.fullmatch(r"[A-Za-z0-9_-]{1,90}",x)]
        for needed in ("daily-single-page","module-page"):
            if needed not in classes:classes.append(needed)
        layout=re.search(r'\bdata-qily-daily-layout=["\'](legacy|rich)["\']',bodyattrs)
        layout_val=layout.group(1) if layout else ("rich" if "qily-knowledge-brief-page" in classes else "legacy")
        main_classes=re.search(r'\bclass=["\']([^"\']+)["\']',mainmatch.group(1))
        maincls=main_classes.group(1) if main_classes and VISUAL_CLASSES.fullmatch(main_classes.group(1)) else ""
        main_name=re.search(r'\bdata-qily-knowledge-brief=["\']([^"\']+)["\']',mainmatch.group(1))
        main_data=' data-qily-knowledge-brief="'+html.escape(main_name.group(1),quote=True)+'"' if main_name else ""
        main_class=' class="'+html.escape(maincls,quote=True)+'"' if maincls else ""
        # Only import the source author's curated-brief styles, never the site's
        # global header/footer or commercial JavaScript.
        rel_styles=[]
        for match in re.finditer(r'<link\b[^>]*rel=["\']stylesheet["\'][^>]*>',raw,re.I):
            href=re.search(r'\bhref=["\']([^"\']+)["\']',match.group(0),re.I)
            if not href:continue
            path=urlparse(href.group(1)).path
            if path.startswith("/qilylean/") and path.endswith(".css"):
                copied_href=copy_stylesheet(path,copied)
                if copied_href and copied_href not in rel_styles:rel_styles.append(copied_href)
        styles=[
            "/assets/brief-visual-source/qilylean/daily-briefs.css",
            "/assets/brief-visual-source/qilylean/daily-brief-unified-layout-v2.css",
            "/assets/brief-visual-source/qilylean/knowledge-brief.css",
            "/assets/brief-visual-source/site-daily-brief-layout-guard-v1.css",
        ]
        for href in rel_styles:
            if href not in styles:styles.append(href)
        style_tags="".join('<link rel="stylesheet" href="'+html.escape(href,quote=True)+'?v=20261011-brief-source-parity-v1">' for href in styles)
        # Source page inline visual rule blocks only (never critical navigation,
        # Dock or inline scripts). Brings back legacy section-number/card hierarchy.
        blocks=[]
        for m in re.finditer(r'<style\b([^>]*)>([\s\S]*?)</style\s*>',raw,re.I):
            sid=re.search(r'\bid=["\']([^"\']+)["\']',m.group(1),re.I)
            if sid and sid.group(1) in {"qilyDailyReadabilityClosureV8","qilyDailyBriefSequenceOffV1"}:
                blocks.append(m.group(2))
        inline_css="<style>"+"\n".join(blocks)+"</style>" if blocks else ""
        top=(
            '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>'+html.escape(title)+'｜精益制造经验分享｜QilyLean｜启力精益</title>'
            '<meta name="description" content="'+html.escape(desc,quote=True)+'">'
            '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">'
            '<link rel="canonical" href="https://qilylean.cn'+src.url+'">'
            '<link rel="stylesheet" href="/assets/site.css?v=20260923-cn-personal-v3-reading">'
            '<link rel="stylesheet" href="/assets/portal.css?v=20260923-portal-v2-reading">'
            '<link rel="stylesheet" href="/assets/content-mirror.css?v=20261010-discovery-v2">'
            '<link rel="stylesheet" href="/assets/qilylean-vi-v2.css?v=20261008-cn-vi-v50-cache-revalidation">'
            +style_tags+
            '<link rel="stylesheet" href="/assets/brief-visual-parity.css?v=20261011-brief-parity-v1">'
            +inline_css+
            '<link id="qilyCnFooterActionsV1Stylesheet" rel="stylesheet" href="/assets/cn-footer-actions-v1.css?v=20261007-mobile-footer-row-merge-v16">'
            '<link id="qilyPublicFooterTypeV1" rel="stylesheet" href="/site-public-footer-type-v1.css?v=20261005-public-footer-v3">'
            '</head><body class="'+html.escape(" ".join(classes),quote=True)+'" data-qily-daily-layout="'+layout_val+'" data-qily-brief-parity="v1">'
            '<a class="skip" href="#main">跳到主要内容</a>'+source.header("briefs")+
            '<main id="main"'+main_class+main_data+'>'+safe+'</main>'+source.footer()+
            '<script defer src="/assets/cn-footer-actions-v1.js?v=20260930-footer-domain-v15"></script>'
            '<script defer src="/assets/cn-nav-rail-v1.js?v=20260926-nav-rail-v20-cn-bridge"></script>'
            '</body></html>'
        )
        src.out.write_text(top,encoding="utf-8")
        if main_data and main_data not in top:raise SystemExit("brief visual classes not preserved: "+str(src.path))
        if svg_count != len(re.findall(r"<svg\b",top,re.I)):raise SystemExit("inline SVG lost: "+str(src.path))
        evidence.append({"source":str(src.path),"url":src.url,"layout":layout_val,"source_svg":svg_count,"cn_svg":len(re.findall(r"<svg\b",top,re.I)),"visual_class_nodes":visual_nodes,"source_css":rel_styles})
    manifest=set(line.strip() for line in MIRROR.read_text(encoding="utf-8").splitlines() if line.strip())
    manifest.update(source.MIRROR_MEDIA)
    MIRROR.write_text("\n".join(sorted(manifest))+"\n",encoding="utf-8")
    REPORT.write_text(json.dumps({"briefs":len(evidence),"css_files":len(copied),"items":evidence},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"CN curated-brief original visual parity materialized: {len(evidence)} briefs / {len(copied)} source CSS files / {sum(x['source_svg'] for x in evidence)} inline SVGs")

if __name__=="__main__":
    main()
