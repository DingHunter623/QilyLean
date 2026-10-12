#!/usr/bin/env python3
"""Restore the international brief's semantic layout, original diagrams, and local
version of its curated-brief CSS for every eligible China-site brief.

Only the 380+ already-approved public /qilylean/daily/YYYY-MM-DD.html routes
are touched; CN shell, footer, ICP and commercial filters remain authoritative.
"""
from __future__ import annotations

import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, urlparse, unquote, urljoin, urlunsplit

ROOT=Path(__file__).resolve().parents[2]
CN=ROOT/"cn-site"
MIRROR=CN/"archive"/"media-manifest.txt"
REPORT=CN/"archive"/"brief-visual-parity.json"
sys.path.insert(0,str(CN/"scripts"))
sys.dont_write_bytecode=True
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
ID_ATTR=re.compile(r"^[a-zA-Z0-9_][a-zA-Z0-9_\-:.]*$")
SVG_PATTERN=re.compile(r"<svg\b[\s\S]*?</svg\s*>",re.I)
SVG_RISK=re.compile(r"<\s*(?:script|foreignObject|iframe|object|embed)\b|\bon[a-z]+\s*=|javascript:|data:text/html|<\s*image\b[^>]*\bhref\s*=\s*['\"]https?://",re.I)
STYLE_IMPORT=re.compile(r'(@import\s+url\(["\']?)(/[^"\')\s]+)(["\']?\)\s*;)',re.I)
CONTENT_SCOPE='main#main[data-qily-brief-content="v2"]'
SOURCE_STYLE_VERSION="20261012-brief-source-parity-v8"
SOURCE_INLINE_STYLE_IDS={"qilyDailyReadabilityClosureV8","qilyDailyBriefSequenceOffV1"}
CSS_GROUPS={"media","supports","container","layer"}
# Brand imagery belongs to the destination site; authored engineering diagrams
# continue to use their original local mirror assets.
CN_BRAND_MEDIA={
    "assets/qilylean-aircraft-hero-approved-20260826.png":
        "/assets/qilylean-aircraft-hero-cn-v2-20260919.png",
}

def split_css(value:str, delimiters:str)->list[str]:
    """Split CSS only outside strings, functions and attribute selectors.

    In particular a comma in :is(), a semicolon in a quoted string, or the
    braces in an SVG data URL must never become a new unscoped selector.
    """
    result=[];start=0;depth=0;quote_char="";escaped=False
    for i,char in enumerate(value):
        if escaped:escaped=False;continue
        if char=="\\":escaped=True;continue
        if quote_char:
            if char==quote_char:quote_char=""
            continue
        if char in "\"'":quote_char=char;continue
        if char in "([":depth+=1
        elif char in ")]":depth-=1
        elif not depth and char in delimiters:
            result.append(value[start:i]);start=i+1
    result.append(value[start:])
    return result

def css_rules(content:str):
    """Read balanced CSS rules without a build-time third-party dependency."""
    pos=0;length=len(content)
    while pos<length:
        while pos<length and content[pos].isspace():pos+=1
        if pos==length:return
        start=pos;depth=0;quote_char="";escaped=False
        while pos<length:
            char=content[pos]
            if escaped:escaped=False
            elif char=="\\":escaped=True
            elif quote_char:
                if char==quote_char:quote_char=""
            elif char in "\"'":quote_char=char
            elif content.startswith("/*",pos):
                end=content.find("*/",pos+2)
                if end<0:raise ValueError("Unterminated CSS comment")
                content=content[:pos]+" "+content[end+2:];length=len(content);continue
            elif char in "([":depth+=1
            elif char in ")]":depth-=1
            elif not depth and char in "{;":break
            pos+=1
        if pos==length:
            if content[start:].strip():raise ValueError("Unterminated CSS rule")
            return
        prelude=content[start:pos].strip();delimiter=content[pos];pos+=1
        if delimiter==";":yield prelude,None;continue
        start=pos;depth=1;quote_char="";escaped=False
        while pos<length and depth:
            char=content[pos]
            if escaped:escaped=False
            elif char=="\\":escaped=True
            elif quote_char:
                if char==quote_char:quote_char=""
            elif char in "\"'":quote_char=char
            elif content.startswith("/*",pos):
                end=content.find("*/",pos+2)
                if end<0:raise ValueError("Unterminated CSS comment")
                content=content[:pos]+" "+content[end+2:];length=len(content);continue
            elif char=="{":depth+=1
            elif char=="}":depth-=1
            pos+=1
        if depth:raise ValueError("Unterminated CSS block")
        yield prelude,content[start:pos-1]

def selector_compounds(selector:str):
    """Return top-level compound spans; ignore selectors inside :is/:has."""
    result=[];start=0;depth=0;quote_char="";escaped=False
    for i,char in enumerate(selector):
        if escaped:escaped=False;continue
        if char=="\\":escaped=True;continue
        if quote_char:
            if char==quote_char:quote_char=""
            continue
        if char in "\"'":quote_char=char;continue
        if char in "([":depth+=1
        elif char in ")]":depth-=1
        elif not depth and (char.isspace() or char in ">+~"):
            if start<i:result.append((start,i,selector[start:i]))
            start=i+1
    if start<len(selector):result.append((start,len(selector),selector[start:]))
    return result

def scope_selector(selector:str)->str:
    selector=selector.strip()
    if not selector:return ""
    compounds=selector_compounds(selector)
    for start,end,compound in compounds:
        if re.match(r"main(?:[^\w-]|$)",compound):
            # A scoped main followed by +/~ could style a sibling in the CN shell.
            if re.search(r"[+~]",selector[end:]):return ""
            return selector[:start]+CONTENT_SCOPE+compound[4:]+selector[end:]
    # Keep body conditions (layout/class/:has) as ancestors. Root/body-only
    # rules instead target the content main, so no rule reaches the CN shell.
    for start,end,compound in compounds:
        if re.match(r"body(?:[^\w-]|$)",compound):
            rest=selector[end:].strip()
            if rest.startswith(("+","~")):return ""
            return selector[:end]+" "+CONTENT_SCOPE+(" "+rest if rest else "")
    if compounds and re.match(r"(?:html|:root)(?:[^\w-]|$)",compounds[0][2]):
        start,end,compound=compounds[0]
        rest=selector[end:].strip()
        if rest.startswith(("+","~")):return ""
        return CONTENT_SCOPE+(" "+rest if rest else "")
    return CONTENT_SCOPE+" "+selector

def safe_declarations(content:str,base_path:str="")->str:
    declarations=[]
    for item in split_css(content,";"):
        prop,sep,value=item.partition(":");prop=prop.strip();value=value.strip()
        if not sep or not re.fullmatch(r"(?:--|-)?[a-zA-Z][\w-]*",prop):continue
        # CSS escaping is unnecessary for these local authored layouts and can
        # disguise executable URLs/properties. Do not carry active CSS across.
        if prop.lower() in {"behavior","-moz-binding"} or re.search(r"expression\s*\(|javascript:|vbscript:|[\\<>@]|/\*|\*/",value,re.I) or len(split_css(value,"{}"))>1:continue
        failed=False
        def rebase(match):
            nonlocal failed
            raw=match.group(1).strip().strip("\"'")
            resolved=urljoin("/"+base_path,raw) if base_path else raw
            mapped=local_media(resolved)
            if not mapped:failed=True;return ""
            return 'url("'+mapped+'")'
        value=re.sub(r"url\(\s*([^)]*)\)",rebase,value,flags=re.I)
        if failed:continue
        declarations.append(prop+":"+value)
    return ";".join(declarations)

def scope_stylesheet(content:str,base_path:str="")->str:
    output=[]
    for prelude,body in css_rules(content):
        if prelude.startswith("@"):
            name=re.match(r"@([\w-]+)",prelude)
            if body is not None and name and name.group(1).lower() in CSS_GROUPS:
                nested=scope_stylesheet(body,base_path)
                if nested:output.append(prelude+"{"+nested+"}")
            elif body is None and name and name.group(1).lower()=="import" and prelude.startswith('@import url("/assets/brief-visual-source/'):
                output.append(prelude+";")
            continue
        if body is None:continue
        selectors=[]
        for selector in split_css(prelude,","):
            # The source once painted a second banner using pseudo-elements,
            # including a date belonging to one particular issue. CN pages
            # already contain the actual accessible hero and issue metadata.
            if base_path=="qilylean/knowledge-brief.css" and re.search(r"(?:main\[data-qily-knowledge-brief\]|\.knowledge-brief-top-nav)::(?:before|after)",selector):continue
            if base_path=="qilylean/daily-brief-unified-layout-v2.css" and '[id="2026-08-25"]' in selector:
                if re.search(r"main\.page-shell:has\([^{}]+\)::(?:before|after)\s*$",selector):continue
                if re.search(r'article\[id="2026-08-25"\]\s*>\s*\.date\s*$',selector):continue
            scoped=scope_selector(selector)
            if scoped:selectors.append(scoped)
        declarations=safe_declarations(body,base_path)
        if base_path=="qilylean/knowledge-brief.css" and re.search(r"main\[data-qily-knowledge-brief\]\s*$",prelude):
            declarations=";".join(item for item in declarations.split(";") if not item.startswith("padding-top:"))
        if selectors and declarations:output.append(",".join(selectors)+"{"+declarations+"}")
    return "\n".join(output)

def rewrite_brief_href(value:str,base_path:str="")->str:
    value=value.strip()
    if not value or value.startswith("#"):return value
    parsed=urlparse(value)
    if parsed.scheme and parsed.scheme not in {"http","https"}:return ""
    if parsed.netloc and parsed.netloc.lower() not in {"qilylean.com","www.qilylean.com","qilylean.cn","www.qilylean.cn"}:
        return source.rewrite_href(value)
    resolved=urlparse(urljoin("/"+base_path,value))
    if resolved.path in {"/qilylean/daily-insights.html","/qilylean/daily-insights/"}:
        path="/briefs/"
    elif Path(resolved.path).suffix.lower() in MEDIA_EXT:
        path=local_media(resolved.path)
    else:
        original=source.source_file_for_url(resolved.path)
        path=source.SOURCE_TO_URL.get(original,"") if original else ""
        path=path or source.rewrite_href(resolved.path)
    return urlunsplit(("","",path,resolved.query,resolved.fragment)) if path else ""

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
    if rel in CN_BRAND_MEDIA:
        mapped=CN_BRAND_MEDIA[rel]
        if not (CN/mapped.lstrip("/")).is_file():
            raise RuntimeError("Missing China-site brand image: "+mapped)
        return mapped
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
    """Localize source styles and confine every selector to brief content."""
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
        return '@import url("'+imp+'");' if imp else "/* skipped remote import */"
    content=STYLE_IMPORT.sub(imports,content)
    content=scope_stylesheet(content,rel)
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
    def __init__(self,base_path:str=""):
        super().__init__(convert_charrefs=True)
        self.parts=[];self.skip_stack=[];self.open_tags=[]
        self.visual_nodes=0;self.base_path=base_path;self.inline_styles=0
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
        if a.get("style"):
            visual_style=safe_declarations(a["style"],self.base_path)
            if visual_style:
                kept.append(("style",visual_style));self.inline_styles+=1
        for key,val in attrs:
            if val is None:continue
            if key in {"aria-label","aria-labelledby","aria-describedby","aria-hidden","aria-current","role","datetime","data-label","data-parity-svg","width","height","colspan","rowspan"} or re.fullmatch(r"data-(?:qily|brief|daily|one-point|section|step|item|visual|[a-z0-9_-]{2,35})[a-z0-9_-]*",key or ""):
                if len(val)<400 and not re.search(r"javascript:|<|>|onerror|onload",val,re.I):
                    if key in {"width","height","colspan","rowspan"} and not val.isdigit():continue
                    if key not in {"class","id"}:kept.append((key,val))
        if tag=="a":
            href=rewrite_brief_href(a.get("href",""),self.base_path)
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

def sanitize_main(original:str,base_path:str=""):
    svgs=[]
    def svg_replace(m):
        raw=m.group(0)
        if SVG_RISK.search(raw):raise RuntimeError("unsafe inline SVG present; no lossy omission allowed")
        n=len(svgs);svgs.append(raw)
        return '<span data-parity-svg="'+str(n)+'"></span>'
    original=SVG_PATTERN.sub(svg_replace,original)
    # Forms and feedback panels contain personal contact and commercial conversion UI.
    original=re.sub(r'<section\b[^>]*class=["\'][^"\']*\bbrief-feedback\b[^"\']*["\'][^>]*>[\s\S]*?</section\s*>',"",original,flags=re.I)
    parser=VisualSanitizer(base_path)
    parser.feed(original)
    safe="".join(parser.parts)
    safe=source.remove_forbidden_blocks(safe)
    for i,svg in enumerate(svgs):
        safe=safe.replace('<span data-parity-svg="'+str(i)+'"></span>',svg)
    if len(source.clean_text(safe))<100:raise RuntimeError("brief content unexpectedly empty after filtering")
    # Shared with the nonbrief renderer: retain its three-value API contract.
    return safe,len(svgs),parser.visual_nodes

def ensure_brief_heading(content:str,source_path:Path)->str:
    """Replace a source CSS-only banner with a real, accessible module hero."""
    if re.search(r"<h1\b",content,re.I):return content
    meta=re.search(r'<div\b[^>]*class=["\'][^"\']*\bdate\b[^"\']*["\'][^>]*>([\s\S]*?)</div\s*>',content,re.I)
    label=source.clean_text(meta.group(1)) if meta else source_path.stem
    return ('<section class="daily-hero compact" data-qily-brief-generated-hero="v2">'
        '<div class="daily-inner"><span>CURATED ENGINEERING BRIEF</span>'
        '<h1>精选简报</h1><p>'+html.escape(label)+'</p></div></section>'+content)

def contain_brief_tables(content:str)->str:
    """Keep dense engineering tables scrollable without widening the page."""
    def surround(match):
        if match.group(1):return match.group(0)+'</div>'
        return ('<div class="qily-brief-table-scroll" role="region" tabindex="0" '
            'aria-label="表格，可左右滚动">'+match.group(0))
    return re.sub(r'<(/?)table\b[^>]*>',surround,content,flags=re.I)

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
        safe,svg_count,visual_nodes=sanitize_main(mainmatch.group(2),src.path.as_posix())
        inline_style_count=len(re.findall(r'\bstyle=["\']',safe,re.I))
        safe=ensure_brief_heading(safe,src.path)
        safe=contain_brief_tables(safe)
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
        style_tags="".join('<link rel="stylesheet" href="'+html.escape(href,quote=True)+'?v='+SOURCE_STYLE_VERSION+'">' for href in styles)
        # Source page inline visual rule blocks only (never critical navigation,
        # Dock or inline scripts). Brings back legacy section-number/card hierarchy.
        blocks=[]
        for m in re.finditer(r'<style\b([^>]*)>([\s\S]*?)</style\s*>',raw,re.I):
            sid=re.search(r'\bid=["\']([^"\']+)["\']',m.group(1),re.I)
            if not sid or sid.group(1) in SOURCE_INLINE_STYLE_IDS:
                localized=scope_stylesheet(m.group(2),src.path.as_posix())
                if localized:blocks.append(localized)
        inline_css='<style data-qily-brief-source-style="v2">'+"\n".join(blocks)+"</style>" if blocks else ""
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
            +source.TRANSLATION_STYLESHEET+
            '<link rel="stylesheet" href="/assets/qilylean-vi-v2.css?v=20261008-cn-vi-v50-cache-revalidation">'
            +style_tags+
            '<link rel="stylesheet" href="/assets/brief-visual-parity.css?v=20261012-brief-parity-v9">'
            +inline_css+
            '<link id="qilyCnFooterActionsV1Stylesheet" rel="stylesheet" href="/assets/cn-footer-actions-v1.css?v=20261007-mobile-footer-row-merge-v16">'
            '<link id="qilyPublicFooterTypeV1" rel="stylesheet" href="/site-public-footer-type-v1.css?v=20261005-public-footer-v3">'
            '</head><body class="'+html.escape(" ".join(classes),quote=True)+'" data-qily-daily-layout="'+layout_val+'" data-qily-brief-parity="v1">'
            '<a class="skip" href="#main">跳到主要内容</a>'+source.header("briefs")+
            '<main id="main" data-qily-brief-content="v2"'+main_class+main_data+'>'+safe+'</main>'+source.footer()+
            source.TRANSLATION_SCRIPT+
            '<script defer src="/assets/cn-footer-actions-v1.js?v=20260930-footer-domain-v15"></script>'
            '<script defer src="/assets/cn-nav-rail-v1.js?v=20260926-nav-rail-v20-cn-bridge"></script>'
            '</body></html>'
        )
        src.out.write_text(top,encoding="utf-8")
        if main_data and main_data not in top:raise SystemExit("brief visual classes not preserved: "+str(src.path))
        if svg_count != len(re.findall(r"<svg\b",top,re.I)):raise SystemExit("inline SVG lost: "+str(src.path))
        evidence.append({"source":str(src.path),"url":src.url,"layout":layout_val,"source_svg":svg_count,"cn_svg":len(re.findall(r"<svg\b",top,re.I)),"visual_class_nodes":visual_nodes,"inline_style_nodes":inline_style_count,"scoped_style_blocks":len(blocks),"source_css":rel_styles})
    manifest=set(line.strip() for line in MIRROR.read_text(encoding="utf-8").splitlines() if line.strip())
    manifest.update(source.MIRROR_MEDIA)
    MIRROR.write_text("\n".join(sorted(manifest))+"\n",encoding="utf-8")
    REPORT.write_text(json.dumps({"briefs":len(evidence),"css_files":len(copied),"items":evidence},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"CN curated-brief original visual parity materialized: {len(evidence)} briefs / {len(copied)} source CSS files / {sum(x['source_svg'] for x in evidence)} inline SVGs")

if __name__=="__main__":
    main()
