#!/usr/bin/env python3
"""Restore approved, local interactions after the CN mirror renderers.

Only the explicitly listed terminology content modules are adapted from source.
The international navigation, music, marketing and remote AI runtimes are never
copied. Source lesson text remains authoritative; adaptations concern routes,
contact panels and the placement of UI inside the China-site content column.
"""
from __future__ import annotations

import base64
import hashlib
import html
import importlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
CN = ROOT / "cn-site"
ASSETS = CN / "assets"
sys.path.insert(0, str(CN / "scripts"))
sys.dont_write_bytecode = True
source = importlib.import_module("materialize-public-content-mirror")
brief = importlib.import_module("materialize-brief-visual-parity")

TERM_PATH = "knowledge/terminology.html"
TERM_URL = "/archive/knowledge/terminology/"
TERM_PATCHES = (
    "knowledge/terminology-project-delivery-v1.js",
    "knowledge/knowledge-asset-v2.js",
    "knowledge/knowledge-asset-v2-opl-header.js",
    "knowledge/terminology-sponsor-v1.js",
)
GENERIC_JS = "public-content-interactions.js"
GENERIC_CSS = "public-content-interactions.css"
TERM_JS = "public-terminology-interactions.js"
TERM_CSS = "public-terminology-interactions.css"
SCOPE = 'body[data-cn-public-kind="terminology"] .mirror-article-fidelity'
ARTICLE = re.compile(r'(<article\b[^>]*\bclass="[^"]*\bmirror-article\b[^"]*"[^>]*>)([\s\S]*)(</article>)', re.I)
STAMP = "cn-public-interactions-v1"


def replace_required(text: str, old: str, new: str) -> str:
    if old not in text:
        raise RuntimeError("Approved interaction source changed: " + old[:100])
    return text.replace(old, new)


def asset_url(name: str) -> str:
    path = ASSETS / name
    if not path.is_file():
        raise RuntimeError("Missing public interaction dependency: " + name)
    digest = hashlib.sha256(path.read_bytes()).hexdigest()[:12]
    return "/assets/" + name + "?v=" + digest


def map_content_url(value: str) -> str:
    """Map approved source links without losing lesson query/hash state."""
    parsed = urlparse(value)
    specials = {
        "/projects/": "/notes/",
        "/improvements/": "/methods/",
        "/cooperation/": "/methods/",
        "/qilylean/daily-insights.html": "/briefs/",
    }
    if parsed.path in specials:
        return specials[parsed.path]
    return brief.rewrite_brief_href(value, TERM_PATH)


def adapt_content_module(code: str) -> str:
    code = replace_required(
        code,
        r"/\/knowledge\/terminology(?:\.html)?\/?$/i",
        r"/^\/archive\/knowledge\/terminology\/$/i",
    )
    # Only ordinary quoted local URL strings are rewritten. Regex literals and
    # lesson prose are left alone, including all existing examples/formulas.
    def route(match: re.Match) -> str:
        quote, value = match.groups()
        mapped = map_content_url(value)
        if not mapped:
            raise RuntimeError("Unmapped terminology dependency: " + value)
        return quote + mapped + quote
    code = re.sub(r"(['\"])(/(?:knowledge|qilylean|projects|improvements|cooperation)/[^'\"\s<>]*)\1", route, code)
    code = code.replace("相关知识与项目承接", "相关知识与项目实践")
    # The source header observer watches text mutations. Avoid rescheduling it
    # forever by writing its existing title only when the value changes.
    code = code.replace("theme.textContent = THEMES[domain];", "if (theme.textContent !== THEMES[domain]) theme.textContent = THEMES[domain];")
    return code


def terminology_runtime(raw: str) -> str:
    blocks = [body for attrs, body in re.findall(r"<script\b([^>]*)>([\s\S]*?)</script\s*>", raw, re.I)
              if not re.search(r"\bsrc\s*=|application/ld\+json", attrs, re.I)]
    searches = [b for b in blocks if "var input=document.getElementById('termSearch')" in b]
    lessons = [b for b in blocks if "function buildModal()" in b and "function lesson(" in b]
    if len(searches) != 1 or len(lessons) != 1:
        raise RuntimeError("Terminology search/lesson source must be unambiguous")
    lesson = lessons[0]
    # Remove the single runtime-generated contact card, rather than allowing
    # contact data to bypass the mirror's static content restrictions.
    lesson, removed = re.subn(
        r"    '<section class=\"term-opl-contact-card\"[\s\S]*?    '</section>'\+\n",
        "", lesson, count=1,
    )
    if removed != 1:
        raise RuntimeError("Terminology runtime contact panel changed")
    lesson, removed = re.subn(
        r'  var wechatCopy=event\.target\.closest\([\s\S]*?(?=  if\(event\.target\.closest\(\x27\[data-opl-link\]\x27\)\))',
        "", lesson, count=1,
    )
    if removed != 1:
        raise RuntimeError("Terminology private contact action changed")
    lesson = replace_required(
        lesson,
        '<span>QilyLean 单点培训知识库 · qilylean.com</span><span>官网邮箱 admin@qilylean.com · 微信 Qily259 · 134 5001 4003 / 151 6812 0722 / 176 8178 8259</span>',
        '<span>精益制造经验分享 · 单点培训知识库</span><span>qilylean.cn · 来源可追溯</span>',
    )
    lesson = replace_required(
        lesson,
        '<span>官方网址：https://qilylean.com/<br>官网邮箱：admin@qilylean.com</span>',
        '<span>中国站知识档案：https://qilylean.cn/</span>',
    )
    lesson = replace_required(lesson, "node.className='term-opl-modal';", "node.className='term-opl-modal qily-cn-terminology-modal';")
    lesson = replace_required(lesson, "document.body.appendChild(node);", "document.querySelector('.mirror-article-fidelity').appendChild(node);")
    if re.search(r"mailto:|tel:|Qily259|134\s*5001\s*4003|qilylean\.com", lesson, re.I):
        raise RuntimeError("Private/international contact data remains in terminology runtime")
    parts = [searches[0], lesson]
    parts.extend(adapt_content_module((ROOT / name).read_text(encoding="utf-8")) for name in TERM_PATCHES)
    return "/* Generated from approved terminology modules; do not edit. */\n" + "\n;\n".join(parts) + "\n"


def scope_terminology_css(content: str) -> str:
    result = []
    for prelude, body in brief.css_rules(content):
        if prelude.startswith("@"):
            if body is not None and re.match(r"@(media|supports|container|layer)\b", prelude, re.I):
                scoped = scope_terminology_css(body)
                if scoped:
                    result.append(prelude + "{" + scoped + "}")
            elif body is not None and re.match(r"@page\b", prelude, re.I):
                result.append(prelude + "{" + brief.safe_declarations(body) + "}")
            continue
        if body is None:
            continue
        selectors = []
        for selector in brief.split_css(prelude, ","):
            selector = selector.strip()
            if re.search(r"term-opl-(contact|qr|copy-wechat)|wx-qr", selector):
                continue
            # Standalone lessons keep the CN header/footer. Only the archive's
            # lesson siblings are hidden, never the site's top-level children.
            if re.match(r"body\.term-opl-(?:standalone|locked)", selector):
                selector = re.sub(r"^body(\.term-opl-(?:standalone|locked))", r'body[data-cn-public-kind="terminology"]\1 .mirror-article-fidelity', selector)
                if selector.endswith(".mirror-article-fidelity"):
                    continue
            else:
                selector = re.sub(r"^(?:html\s+)?body\s+", "", selector)
                selector = SCOPE + " " + selector
            selectors.append(selector)
        declarations = brief.safe_declarations(body, TERM_PATH)
        if selectors and declarations:
            result.append(",".join(selectors) + "{" + declarations + "}")
    return "\n".join(result)


def terminology_styles(raw: str) -> str:
    styles = [body for attrs, body in re.findall(r"<style\b([^>]*)>([\s\S]*?)</style\s*>", raw, re.I)
              if not attrs.strip() or 'id="qilyOplPrintNoOverlapV14"' in attrs]
    if not styles or ".term-search" not in styles[0]:
        raise RuntimeError("Terminology base styles changed")
    styles.append((ROOT / "knowledge/terminology-opl-readability-v8.css").read_text(encoding="utf-8"))
    css = scope_terminology_css("\n".join(styles))
    # Every extracted declaration is confined to archive content. Modal boxes
    # inherit explicit colors because they no longer inherit international skin.
    return css + "\n" + SCOPE + "{--qily-forest:#0f4b5a;--qily-teal:#178b94;--qily-line:#d5e4e3;--qily-ink:#182420;--qily-muted:#5f7474}\n"


def replace_article(doc: str, content: str) -> str:
    match = ARTICLE.search(doc)
    if not match:
        raise RuntimeError("Generated mirror article missing")
    return doc[:match.start(2)] + content + doc[match.end(2):]


def scope_article_footer(doc: str) -> str:
    match = ARTICLE.search(doc)
    if not match:
        raise RuntimeError("Generated mirror article missing")
    def classes(found: re.Match) -> str:
        before, tokens, after = found.groups()
        names = ["qily-public-content-footer" if name == "footer" else name for name in tokens.split()]
        return before + " ".join(names) + after
    content = re.sub(r'(<div\b[^>]*\bclass=")([^"]*)(")', classes, match.group(2))
    return doc[:match.start(2)] + content + doc[match.end(2):]


def brief_index_content() -> str:
    cards = []
    for page in sorted((s for s in source.SOURCES if source.is_date_brief(s.path)), key=lambda s: s.path.stem, reverse=True):
        title, description = source.extract_meta((ROOT / page.path).read_text(encoding="utf-8", errors="ignore"))
        title = source.neutralize(title)
        description = source.neutralize(description)
        terms = html.escape(page.path.stem + " " + title + " " + description, quote=True)
        cards.append(f'<a class="cn-public-brief-card" href="{page.url}" data-brief-date="{page.path.stem}" data-brief-search="{terms}"><small>{page.path.stem}</small><h2>{html.escape(title)}</h2><p>{html.escape(description)}</p></a>')
    return ('<section data-public-brief-index><label for="cnPublicBriefSearch"><strong>搜索精选简报</strong></label>'
            '<input id="cnPublicBriefSearch" class="term-search" type="search" autocomplete="off" placeholder="输入日期、标题或关键词，例如 SMED、标准化、OEE">'
            f'<p id="cnPublicBriefCount" role="status" aria-live="polite">共 {len(cards)} 篇精选简报</p>'
            '<div class="cn-public-brief-grid" data-public-brief-list>' + "".join(cards) + '</div></section>')


def pdf_asset() -> str:
    script = (ROOT / "qilylean/assets/gbt2828-reference-v1.js").read_text(encoding="utf-8")
    match = re.search(r"const PDF_BASE64\s*=\s*\[([\s\S]*?)\]\.join\(\"\"\)", script)
    if not match:
        raise RuntimeError("Approved GB/T PDF source changed")
    binary = base64.b64decode("".join(re.findall(r'"([A-Za-z0-9+/=]+)"', match.group(1))), validate=True)
    if not binary.startswith(b"%PDF-"):
        raise RuntimeError("Invalid approved GB/T PDF")
    name = "public-gbt2828-reference.pdf"
    (ASSETS / name).write_bytes(binary)
    return asset_url(name)


def attach(doc: str, kind: str, term: bool = False) -> str:
    # The mirror pipeline starts from source on every build; this also permits
    # running this last pass repeatedly without duplicating its own resources.
    doc = re.sub(r'<(?:link|script)\b[^>]*\bdata-cn-public-interactions="[^"]*"[^>]*>(?:</script>)?', "", doc, flags=re.I)
    doc = re.sub(r'\sdata-cn-public-kind="[^"]*"', "", doc)
    doc = doc.replace("<body", '<body data-cn-public-kind="' + kind + '"', 1)
    css = [GENERIC_CSS] + ([TERM_CSS] if term else [])
    js = [GENERIC_JS] + ([TERM_JS] if term else [])
    doc = doc.replace("</head>", "".join('<link rel="stylesheet" data-cn-public-interactions="' + STAMP + '" href="' + asset_url(n) + '">' for n in css) + "</head>", 1)
    return doc.replace("</body>", "".join('<script defer data-cn-public-interactions="' + STAMP + '" src="' + asset_url(n) + '"></script>' for n in js) + "</body>", 1)


def main() -> None:
    term_source = (ROOT / TERM_PATH).read_text(encoding="utf-8")
    term_count = len(re.findall(r'\bdata-term-card(?:=|\s|>)', source.extract_fragment(term_source)))
    if term_count < 190:
        raise RuntimeError("Terminology source inventory unexpectedly small")
    ASSETS.mkdir(parents=True, exist_ok=True)
    (ASSETS / TERM_JS).write_text(terminology_runtime(term_source), encoding="utf-8")
    (ASSETS / TERM_CSS).write_text(terminology_styles(term_source), encoding="utf-8")
    pdf_url = pdf_asset()
    evidence = []
    for page in source.SOURCES:
        if source.is_date_brief(page.path):
            continue
        path = page.path.as_posix()
        if not page.out.is_file():
            if path != "global-knowledge/briefs/index.html":
                continue
            # The first static mirror pass intentionally skips very short
            # JavaScript-driven sources. This approved index is rendered from
            # the local dated-page corpus instead of importing its remote UI.
            raw = (ROOT / page.path).read_text(encoding="utf-8")
            title, description = source.extract_meta(raw)
            page.out.parent.mkdir(parents=True, exist_ok=True)
            doc = source.wrap_page(page, title, description, brief_index_content())
            doc = doc.replace('class="article-body mirror-article"', 'class="article-body mirror-article mirror-article-fidelity"', 1)
            page.out.write_text(doc, encoding="utf-8")
        original = (ROOT / page.path).read_text(encoding="utf-8", errors="ignore")
        fragment = source.extract_fragment(original)
        has_content_controls = bool(re.search(r'<(?:input|form|select|textarea|canvas|iframe)\b|<button\b(?![^>]*qily-float-btn)', fragment, re.I))
        if not has_content_controls:
            continue
        doc = page.out.read_text(encoding="utf-8")
        kind = "content"
        if path == TERM_PATH:
            if len(re.findall(r'\bdata-term-card(?:=|\s|>)', doc)) != term_count or 'id="termSearch"' not in doc:
                raise RuntimeError("Terminology controls/content must survive sanitization before interactions")
            kind = "terminology"
        elif path == "global-knowledge/briefs/index.html":
            doc = replace_article(doc, brief_index_content())
            kind = "brief-index"
        elif path == "gbt2828.html":
            stage = '<div class="cn-public-pdf-stage"><iframe id="gbt2828PdfPreview" src="' + pdf_url + '#page=1&amp;zoom=page-width" title="GB/T 2828 抽样检验参考资料高清PDF预览" loading="lazy"></iframe></div>'
            doc, count = re.subn(r'<div class="(?:pdf-stage|cn-public-pdf-stage)">[\s\S]*?</div>', lambda _: stage, doc, count=1)
            if count != 1:
                raise RuntimeError("GB/T PDF preview container missing")
            for identifier in ("gbt2828PdfOpen", "gbt2828PdfDownload"):
                extra = ' download="GB-T-2828-reference.pdf"' if identifier.endswith("Download") else ' target="_blank" rel="noopener"'
                doc = re.sub(r'<a\b([^>]*\bid="' + identifier + r'"[^>]*)>', lambda m: '<a' + re.sub(r'\s(?:href|aria-disabled|target|rel|download)="[^"]*"', '', m.group(1)) + ' href="' + pdf_url + '"' + extra + '>', doc, count=1)
            # The legacy "full training" source is only a short placeholder
            # and is not a materialized archive page. Offer the real PDF.
            doc = doc.replace('href="/archive/reference/gbt2828/"', 'href="#preview" data-public-pdf-preview')
            doc = doc.replace('>查看完整培训</a>', '>查看PDF资料预览</a>')
            doc = doc.replace("正在载入高清版本……", "高清资料已就绪，可打开预览并缩放查阅。")
            kind = "pdf"
        elif path == "ai.html":
            # This source depends on international AI endpoints. Keep the
            # archive readable without presenting an unconnected chat form.
            doc = replace_article(doc, '<section><h2>AI 与制造知识</h2><p>从制造知识索引进入精益、工业工程、质量与数智化主题，结合现场事实核对资料和方法。</p><p><a class="btn" href="/knowledge/">浏览制造知识索引</a></p></section>')
            kind = "knowledge-entry"
        if path == "projects/factory-layout/index.html":
            def preview_asset(match: re.Match) -> str:
                opening, content = match.groups()
                if 'data-plan-source=' in opening:
                    return match.group(0)
                # Two historical high-resolution source URLs have no checked-in
                # asset. Use the real approved diagram rather than a dead URL.
                image = re.search(r'<img\b[^>]*\bsrc="(/mirror-media/[^"]+)"', content)
                if not image:
                    raise RuntimeError("Factory diagram has no usable source or preview")
                opening = opening[:-1] + ' data-plan-source="' + image.group(1) + '">'
                opening = opening.replace("高清原图", "图纸")
                return opening + content + '</button>'
            doc = re.sub(r'(<button\b[^>]*\bdata-plan-preview[^>]*>)([\s\S]*?)</button>', preview_asset, doc)
            doc = doc.replace("9张高清规划图纸", "9张规划图纸")
            doc = doc.replace("点击缩略图后进入仓库高清原图受控预览", "点击缩略图后进入图纸预览")
        if path == "qilylean/production-operations-organization.html":
            # Editable source attachments include contact sheets and are not
            # published by the CN mirror. Point the public actions to the
            # approved online galleries instead of leaving inert downloads.
            doc = doc.replace("支持PPT与Excel在线预览和下载", "支持PPT与Excel资料在线预览")
            doc = doc.replace('href="#downloads">下载附件</a>', 'href="#downloads">资料导航</a>')
            doc = doc.replace('>DOWNLOADS</span><h2>附件下载</h2>', '>ONLINE RESOURCES</span><h2>资料导航</h2>')
            doc = doc.replace('<a class="button">下载PPT</a>', '<a class="button" href="#ppt-preview">查看管理汇报资料</a>')
            doc = doc.replace('<a class="button secondary">下载Excel</a>', '<a class="button secondary" href="#excel-preview">查看岗位与KPI资料</a>')
        doc = re.sub(r'<button\b(?![^>]*data-public-print)([^>]*\bclass="[^"]*(?:opl-btn|qily-term-pdf-action)[^"]*"[^>]*)>', r'<button\1 data-public-print>', doc)
        if 'canvas' in doc:
            key = "QilyLeanFlowPreview2026" if path.endswith("reference-one-piece-flow.html") else "QilyLeanPreview2026"
            doc = re.sub(r'<canvas\b(?![^>]*data-preview-key)', '<canvas data-preview-key="' + key + '"', doc)
        if path == "tools/times26001/index.html":
            doc = re.sub(r'<button\b[^>]*\bclass="[^"]*\bapp-share-trigger\b[^"]*"[^>]*>[\s\S]*?</button>', "", doc)
            # Neither the APK nor its checksum is present in the approved CN
            # publication inputs. Keep version information without dead CTAs.
            doc = re.sub(r'<a\b[^>]*\bhref="/Times26001-[^"]+\.apk(?:\?[^"]*)?"[^>]*>[\s\S]*?</a>', '<span class="status" role="status" data-public-download-unavailable="apk">安装包暂不可下载</span>', doc)
            doc = re.sub(r'<a\b[^>]*\bhref="/Times26001-[^"]+\.sha256\.txt(?:\?[^"]*)?"[^>]*>[\s\S]*?</a>', '<span data-public-download-unavailable="checksum">校验文件暂不可用</span>', doc)
            doc = doc.replace("当前可直接下载 v1.1.14 Android 官网标准LOGO统一修正版 APK。", "归档版本为 v1.1.14 Android 官网标准LOGO统一修正版；当前中国站暂不提供安装包下载。")
            doc = doc.replace("当前可下载：Times26001", "版本说明：Times26001")
            doc = doc.replace("<h2>Android 下载</h2>", "<h2>Android 版本说明</h2>")
            doc = doc.replace("下载入口优先于分享入口；与分享链接均指向本页 Android 下载区。", "本页可分享版本与功能说明；安装包及校验文件当前暂不可用。")
            doc = doc.replace(">分享下载页</button>", ">分享本页说明</button>")
        # The first sanitizer strips mailto destinations, but an inert email
        # label can survive in span/div footers. Remove only this known contact
        # residue, preserving nearby public-source links and print controls.
        doc = re.sub(r'<span\b[^>]*>\s*官网邮箱\s*[:：]?\s*<a\b[^>]*>\s*admin@qilylean\.com\s*</a>\s*</span>', "", doc, flags=re.I)
        doc = re.sub(r'[；;]?\s*官网邮箱\s*[:：]?\s*<a\b[^>]*>\s*admin@qilylean\.com\s*</a>', "", doc, flags=re.I)
        doc = re.sub(r'<a\b[^>]*>\s*admin@qilylean\.com\s*</a>', "", doc, flags=re.I)
        # Authored lesson footers are content, not the CN fixed site footer.
        # Scope only nested div class tokens and retain the real footer element.
        doc = scope_article_footer(doc)
        doc = attach(doc, kind, path == TERM_PATH)
        page.out.write_text(doc, encoding="utf-8")
        evidence.append({"source": path, "url": page.url, "kind": kind})
    report = CN / "archive" / "public-interactions.json"
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps({"version": STAMP, "checked": len(evidence), "terminology_lessons": term_count, "items": evidence}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"CN public interactions materialized: {len(evidence)} routes / {term_count} terminology lessons")


if __name__ == "__main__":
    main()
