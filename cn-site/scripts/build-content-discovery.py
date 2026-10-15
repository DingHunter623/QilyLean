#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import importlib
from urllib.parse import urlsplit
import re
from collections import OrderedDict, defaultdict
from pathlib import Path

CN = Path(__file__).resolve().parents[1]
MANIFEST = CN / "archive/content-manifest.json"
CATALOG = CN / "archive/content-catalog.json"

BRAND = "QilyLean | 启力精益"
FILED_NAME = "精益制造经验分享"

GROUPS = OrderedDict([
    ("briefs", {
        "name": "精选简报",
        "slug": "",
        "categories": {"精选简报"},
        "desc": "制造工程、精益改善、IE、数智化与行业观察的长期精选简报档案。",
    }),
    ("manufacturing-engineering-ie", {
        "name": "制造工程与 IE",
        "slug": "manufacturing-engineering-ie",
        "categories": {"制造知识"},
        "desc": "标准工时、产能、线平衡、VSM、质量与制造系统等工程知识。",
    }),
    ("lean-improvement", {
        "name": "精益与改善方法",
        "slug": "lean-improvement",
        "categories": {"改善方法", "精益制造"},
        "desc": "SMED、PDCA、ECRS、标准化与持续改善方法的现场应用逻辑。",
    }),
    ("practice", {
        "name": "实践案例",
        "slug": "practice",
        "categories": {"实践档案"},
        "desc": "从真实制造场景沉淀的问题、方法、结果、证据与标准化复盘。",
    }),
    ("digital-professional", {
        "name": "数智制造与专业资料",
        "slug": "digital-professional",
        "categories": {"AI知识", "公开资料"},
        "desc": "AI、制造数智化、能力体系及其他适合公开学习的专业资料。",
    }),
    ("tools-reference", {
        "name": "工具与参考资料",
        "slug": "tools-reference",
        "categories": {"知识资料", "参考资料", "工具资料"},
        "desc": "术语、工具、标准、参考文献与可复用的制造学习资料。",
    }),
    ("learning-records", {
        "name": "学习与公开记录",
        "slug": "learning-records",
        "categories": {"公开记录", "学习记录"},
        "desc": "公开学习记录、能力证明与适合知识站长期保留的记录性内容。",
    }),
])

COMMON_HEAD = """<link rel="stylesheet" href="/assets/site.css?v=20260923-cn-personal-v3-reading"><link rel="stylesheet" href="/assets/portal.css?v=20260923-portal-v2-reading"><link rel="stylesheet" href="/assets/content-mirror.css?v=20261010-discovery-v2&anchors=20261013-v1"><link id="qilyCnDomesticTranslateV1Stylesheet" rel="stylesheet" href="/assets/cn-translate-baidu-v1.css?v=20260922-translate-v6-baidu"><link id="qilyCnUnifiedViV2" rel="stylesheet" href="/assets/qilylean-vi-v2.css?v=20261008-cn-vi-v50-cache-revalidation"><link id="qilyCnFooterActionsV1Stylesheet" rel="stylesheet" href="/assets/cn-footer-actions-v1.css?v=20261007-mobile-footer-row-merge-v16"><link id="qilyPublicFooterTypeV1" rel="stylesheet" href="/site-public-footer-type-v1.css?v=20261005-public-footer-v3">"""

COMMON_SCRIPTS = """<script defer src="/assets/cn-translate-baidu-v1.js?v=20261006-youdao-nmt-closure-v1"></script><script defer src="/assets/cn-footer-actions-v1.js?v=20260930-footer-domain-v15"></script><script defer src="/assets/cn-nav-rail-v1.js?v=20260926-nav-rail-v20-cn-bridge&anchors=20261013-v1"></script>"""

def header(current: str) -> str:
    nav = [
        ("/", "home", "首页"),
        ("/lean/", "lean", "精益制造"),
        ("/notes/", "projects", "代表项目"),
        ("/knowledge/", "knowledge", "知识索引"),
        ("/briefs/", "briefs", "精选简报"),
        ("/resources/", "resources", "资源协同"),
        ("/about/", "about", "关于我们"),
    ]
    links = []
    for href, key, label in nav:
        active = ' aria-current="page"' if key == current else ""
        links.append(f'<a href="{href}" data-qily-nav-key="{key}"{active}>{label}</a>')
    return '<header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="返回QilyLean首页" title="返回首页">QilyLean | <span>启力精益</span></a><nav class="nav" aria-label="主导航" data-qily-cn-nav-contract="20260926-v7-bridge">' + "".join(links) + '</nav></div></header>'

def footer() -> str:
    return '<footer class="footer"><div class="footer-inner"><a class="footer-home" href="/" aria-label="返回精益制造经验分享中国站首页" title="返回中国站首页">精益制造经验分享</a><nav class="footer-actions" aria-label="页脚快捷操作"><button type="button" data-qily-footer-action="top">顶部</button><button type="button" data-qily-footer-action="share">分享当前</button></nav><span class="footer-records notranslate" translate="no"><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" title="工信部备案查询（新标签页打开）">湘ICP备2026041143号-1</a><a class="police-record" href="https://beian.mps.gov.cn/#/query/webSearch?code=43020002000443" target="_blank" rel="noopener noreferrer" title="公安备案查询（新标签页打开）"><img src="/assets/mps-beian.png" width="18" height="20" alt="" aria-hidden="true"><span>湘公网安备43020002000443号</span></a></span></div></footer>'

def shell(title: str, description: str, current: str, body: str, canonical: str, attrs: str = "") -> str:
    return f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}｜{FILED_NAME}｜{BRAND}</title><meta name="description" content="{html.escape(description, quote=True)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><link rel="canonical" href="https://qilylean.cn{canonical}">{COMMON_HEAD}</head><body {attrs}><a class="skip" href="#main">跳到主要内容</a>{header(current)}<main id="main">{body}</main>{footer()}{COMMON_SCRIPTS}</body></html>'''

def card(label: str, href: str, meta: str, count: int | None = None) -> str:
    count_html = f'<strong class="catalog-count">{count}</strong>' if count is not None else ""
    return f'<a class="catalog-card" href="{href}">{count_html}<h3>{html.escape(label)}</h3><p>{html.escape(meta)}</p><span class="catalog-enter">进入浏览 →</span></a>'

def article_link(item: dict) -> str:
    return f'<a class="article-link" href="{html.escape(item["url"], quote=True)}"><h3>{html.escape(item["title"])}</h3><p>{html.escape(item["category"])} · 中国站本地内容</p></a>'

def international_brief_cards(briefs: list[dict]) -> dict[str, str]:
    """Use the international curated-directory SSOT for date, theme, summary and card layout."""
    directory = (CN.parent / "qilylean/daily-insights.html").read_text(encoding="utf-8")
    expected = {Path(item["source"]).stem for item in briefs}
    cards: dict[str, str] = {}
    pattern = re.compile(r'<article class="brief-index-card" data-date="(\d{4}-\d{2}-\d{2})"[^>]*>[\s\S]*?</article>')
    for match in pattern.finditer(directory):
        date, fragment = match.group(1), match.group(0)
        original = f"/qilylean/daily/{date}.html"
        links = re.findall(r'\bhref="([^"]+)"', fragment)
        if (date in cards or links != [original, original]
                or f'<time datetime="{date}">' not in fragment
                or '<p class="brief-index-summary">' not in fragment
                or re.search(r'<(?:script|form|iframe)\b|\bon\w+\s*=', fragment, re.I)):
            raise ValueError(f"International brief directory card violates public-knowledge contract: {date}")
        cards[date] = fragment.replace(f'href="{original}"', f'href="/briefs/archive/{date}/"')
    if set(cards) != expected:
        raise ValueError(f"International/CN brief metadata mismatch: missing={sorted(expected-set(cards))[:5]}, extra={sorted(set(cards)-expected)[:5]}")
    return cards


def brief_year_search(year: str, total: int, year_count: int) -> str:
    """Local-only, client-side directory filter; no network, external links or commercial forms."""
    js = """<script data-qily-brief-year-search="v1">(function(){
"use strict";
var input=document.getElementById("briefSearch"),grid=document.getElementById("briefCuratedGrid"),status=document.getElementById("briefFilterStatus");
if(!input||!grid||!status)return;
var cards=Array.prototype.slice.call(grid.querySelectorAll(".brief-index-card"));
function apply(){
  var query=input.value.normalize("NFKC").trim().toLocaleLowerCase("zh-CN"),visible=0;
  cards.forEach(function(card){
    var searchable=(card.getAttribute("data-search")||"").normalize("NFKC").toLocaleLowerCase("zh-CN");
    var matched=!query||searchable.indexOf(query)!==-1;
    card.hidden=!matched;if(matched)visible++;
  });
  status.textContent=query?"找到 "+visible+" 篇相关精选（__YEAR__年）｜全站 __TOTAL__ 篇精选":"当前 __TOTAL__ 篇精选｜__YEAR__年 __YEAR_COUNT__ 篇";
}
input.addEventListener("input",apply);apply();
})();</script>"""
    return (js.replace("__YEAR__", year).replace("__TOTAL__", str(total))
              .replace("__YEAR_COUNT__", str(year_count)))


def international_knowledge_hub(brief_total: int) -> str:
    """Mirror all seven noncommercial international knowledge sections, with local links.

    The international page is the content SSOT. Its native navigation, commercial
    operating axis, translation and overseas runtimes are intentionally excluded.
    Fail closed on any source drift or destination that cannot be served locally.
    """
    import_path = importlib.import_module("materialize-public-content-mirror")
    source = (CN.parent / "knowledge/index.html").read_text(encoding="utf-8")
    report = json.loads((CN / "archive/public-interactions.json").read_text(encoding="utf-8"))
    lessons = int(report.get("terminology_lessons", 0))
    if lessons < 190 or f"<h3>{lessons} 项</h3>" not in source:
        raise ValueError("International/CN terminology training count differs")
    if f"<h3>{brief_total} 篇</h3>" not in source:
        raise ValueError("International/CN knowledge brief count differs")
    if "<h3>16 项</h3>" not in source:
        raise ValueError("International tool/topic/reference total changed; review before syncing")

    ids = (
        "knowledge-stats", "ai-manufacturing-knowledge", "terminology",
        "daily", "tools", "lean-series", "documents",
    )
    jump = {
        "/knowledge/#terminology": "#cn-global-knowledge-architecture",
        "/knowledge/#tools": "#cn-global-tools",
        "/qilylean/daily-insights.html": "/briefs/",
    }
    def local_url(value: str) -> str:
        if value in jump:
            return jump[value]
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc or not parsed.path.startswith("/"):
            raise ValueError("Unapproved knowledge source link: " + value)
        if parsed.path == "/%E7%8E%B0%E5%9C%BA%E7%AE%A1%E7%90%86.pdf":
            local = CN / "assets/knowledge/现场管理.pdf"
            if not local.is_file() or local.stat().st_size < 1_000_000:
                raise ValueError("Full-quality local training PDF absent")
            return "/assets/knowledge/%E7%8E%B0%E5%9C%BA%E7%AE%A1%E7%90%86.pdf"
        src = import_path.source_file_for_url(parsed.path)
        out = import_path.SOURCE_TO_URL.get(src or "")
        if not out:
            raise ValueError("Knowledge content not approved for CN local mirror: " + value)
        dest = CN / out.lstrip("/") / "index.html" if out.endswith("/") else CN / out.lstrip("/")
        if not dest.is_file():
            raise ValueError("Missing local knowledge destination: " + out)
        # Fragment anchors from international pages are not guaranteed to
        # survive mirror sanitization. Link to the correct local article.
        return out

    rendered = []
    for name in ids:
        match = re.search(
            r'<section\b(?=[^>]*\bid="' + re.escape(name) + r'")[^>]*>[\s\S]*?</section>',
            source,
        )
        if match is None:
            raise ValueError("Missing international knowledge section: " + name)
        fragment = match.group(0)
        fragment = fragment.replace(f'id="{name}"', f'id="cn-global-{name}"', 1)
        fragment = re.sub(r'\sdata-site-metadata-source="[^"]+"', "", fragment)
        fragment = re.sub(r'\sdata-latest-brief-(?:card|date|title|summary|meta|link)(?:="[^"]*")?', "", fragment)
        # Preserve source card hierarchy and visible content; replace href
        # values only after verifying their CN-local production destinations.
        def route(match: re.Match) -> str:
            return 'href="' + html.escape(local_url(html.unescape(match.group(1))), quote=True) + '"'
        fragment = re.sub(r'href="([^"]+)"', route, fragment)
        if re.search(r'href="(?:https?://|//)|\bonclick=|<script\b|<form\b', fragment, re.I):
            raise ValueError("Commercial/remote action slipped into China knowledge module")
        if name == "ai-manufacturing-knowledge":
            fragment = fragment.replace("企业级知识资产库", "公开制造知识资料库")
        rendered.append(fragment)
    # The 16 original cards (4 tools + 6 topics + 6 reference documents)
    # must remain complete, not be reduced to a four-card statistics copy.
    card_total = sum(len(re.findall(r'<article class="module-card"', block))
                     for block in rendered[-3:])
    if card_total != 16:
        raise ValueError(f"International 16-asset structure changed: {card_total}")
    return ('<div class="qily-cn-knowledge-hub" data-qily-international-knowledge-mirror="v1" '
            f'data-qily-brief-total="{brief_total}" data-qily-terminology-total="{lessons}">'
            + "".join(rendered) + '</div>')


def add_css_link(text: str) -> str:
    href = '/assets/content-mirror.css?v=20261010-discovery-v2&anchors=20261013-v1'
    if href in text:
        return text
    return text.replace("</head>", f'<link rel="stylesheet" href="{href}">\n</head>', 1)

def replace_managed(text: str, start: str, end: str, block: str, fallback_before: str = "</main>") -> str:
    pattern = re.compile(re.escape(start) + r"[\s\S]*?" + re.escape(end), re.I)
    wrapped = start + block + end
    if pattern.search(text):
        return pattern.sub(wrapped, text, count=1)
    return text.replace(fallback_before, wrapped + fallback_before, 1)

def remove_legacy_archive_section(text: str) -> str:
    return re.sub(
        r'<section class="section"><div class="content"><div class="section-head"><small>FULL CONTENT ARCHIVE｜完整内容档案</small>[\s\S]*?</section>',
        "",
        text,
        count=1,
        flags=re.I,
    )

def update_sitemap(urls: list[str]) -> None:
    path = CN / "sitemap.xml"
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    text = re.sub(r'\s*<url><loc>https://qilylean\.cn/archive/categories/[^<]+</loc>[\s\S]*?</url>', "", text)
    text = re.sub(r'\s*<url><loc>https://qilylean\.cn/briefs/archive/year/[^<]+</loc>[\s\S]*?</url>', "", text)
    additions = []
    for url in sorted(set(urls)):
        additions.append(f'  <url><loc>https://qilylean.cn{url}</loc><changefreq>weekly</changefreq><priority>0.72</priority></url>')
    if additions:
        text = text.replace("</urlset>", "\n" + "\n".join(additions) + "\n</urlset>")
    path.write_text(text, encoding="utf-8")

def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    items = list(data.get("items", []))
    total = int(data.get("generated", len(items)))

    grouped: dict[str, list[dict]] = {k: [] for k in GROUPS}
    unmatched = []
    for item in items:
        matched = False
        for key, meta in GROUPS.items():
            if item.get("category") in meta["categories"]:
                grouped[key].append(item)
                matched = True
                break
        if not matched:
            unmatched.append(item)
    if unmatched:
        raise SystemExit("Unmapped public-content categories: " + ", ".join(sorted({x.get("category","") for x in unmatched})))

    for key in grouped:
        if key == "briefs":
            grouped[key].sort(key=lambda x: x["source"], reverse=True)
        else:
            grouped[key].sort(key=lambda x: (x.get("category",""), x.get("title","")))

    brief_total = len(grouped["briefs"])
    nonbrief_total = total - brief_total

    # Group detail pages.
    discovery_urls = []
    for key, meta in GROUPS.items():
        if key == "briefs":
            continue
        rows = "".join(article_link(x) for x in grouped[key])
        url = f'/archive/categories/{meta["slug"]}/'
        page = shell(
            meta["name"],
            meta["desc"],
            "knowledge",
            f'<section class="page-hero"><div class="content"><span class="hero-eyebrow">QILYLEAN KNOWLEDGE ASSET｜知识资产</span><h1>{html.escape(meta["name"])}｜{len(grouped[key])}篇</h1><p>{html.escape(meta["desc"])}</p></div></section><section class="section"><div class="content"><div class="catalog-breadcrumb"><a href="/knowledge/">知识索引</a><span>›</span><a href="/archive/">完整知识库</a><span>›</span><b>{html.escape(meta["name"])}</b></div><div class="article-list catalog-list">{rows}</div></div></section>',
            url,
            f'data-qily-knowledge-discovery="v1" data-qily-generated-total="{total}"',
        )
        target = CN / url.lstrip("/") / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page, encoding="utf-8")
        discovery_urls.append(url)

    # Year indexes for 380+ dated briefs.
    years: dict[str, list[dict]] = defaultdict(list)
    for item in grouped["briefs"]:
        m = re.search(r'/(\d{4})-(\d{2})-(\d{2})\.html$', item.get("source", ""))
        if m:
            years[m.group(1)].append(item)
    # Metadata and card structure follow the international directory, while links
    # remain on China's local brief archive. Never infer titles, topics or summaries.
    source_brief_cards = international_brief_cards(grouped["briefs"])
    for year in sorted(years, reverse=True):
        rows = "".join(source_brief_cards[Path(x["source"]).stem] for x in years[year])
        search = (
            f'<div class="brief-directory-tools" id="brief-directory">'
            f'<label for="briefSearch"><span>搜索日期、主题或关键词</span>'
            f'<input type="search" id="briefSearch" placeholder="例如：NPI、SMED、标准工时、PMO" autocomplete="off"></label>'
            f'<p id="briefFilterStatus" role="status" aria-live="polite">当前 {brief_total} 篇精选｜{year}年 {len(years[year])} 篇</p></div>'
        )
        directory = f'<div class="brief-grid" id="briefCuratedGrid">{rows}</div>'
        search_runtime = brief_year_search(year, brief_total, len(years[year]))
        url = f"/briefs/archive/year/{year}/"
        page = shell(
            f"{year}年精选简报",
            f"{year}年 QilyLean 制造工程精选简报中国站本地档案。",
            "briefs",
            f'<section class="page-hero"><div class="content"><span class="hero-eyebrow">SELECTED BRIEFS｜年度档案</span><h1>{year}年精选简报｜{len(years[year])}篇</h1><p>按发布日期连续浏览该年度已经同步到中国服务器的制造工程精选简报。</p></div></section><section class="section"><div class="content"><div class="catalog-breadcrumb"><a href="/briefs/">精选简报</a><span>›</span><b>{year}</b></div>{search}{directory}{search_runtime}</div></section>',
            url,
            f'data-qily-knowledge-discovery="v1" data-qily-brief-total="{brief_total}" data-qily-brief-year-catalog="v2"',
        )
        page = page.replace("/assets/content-mirror.css?v=20261010-discovery-v2&anchors=20261013-v1",
                            "/assets/content-mirror.css?v=20261015-brief-year-cards-v1&anchors=20261013-v1", 1)
        target = CN / url.lstrip("/") / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page, encoding="utf-8")
        discovery_urls.append(url)

    # Public archive: real front shelf instead of a technical manifest landing page.
    cards = []
    for key, meta in GROUPS.items():
        href = "/briefs/" if key == "briefs" else f'/archive/categories/{meta["slug"]}/'
        cards.append(card(meta["name"], href, meta["desc"], len(grouped[key])))
    archive_body = f'''<section class="page-hero"><div class="content"><span class="hero-eyebrow">QILYLEAN KNOWLEDGE LIBRARY｜完整知识库</span><h1>中国站完整知识库｜{total}篇本地内容</h1><p>国际站已公开且符合中国个人知识站边界的制造知识，已同步到国内服务器并按专业维度重新组织。商业经营信息继续在同步环节过滤。</p></div></section><section class="section"><div class="content"><div class="catalog-stats"><div><b>{total}</b><span>本地内容页面</span></div><div><b>{brief_total}</b><span>精选简报</span></div><div><b>{nonbrief_total}</b><span>专题与专业资料</span></div><div><b>{len(GROUPS)-1}</b><span>专业知识分类</span></div></div><div class="section-head"><small>PROFESSIONAL INDEX｜专业分类</small><h2>不是技术归档，而是可直接浏览的制造知识资产</h2><p>按专业维度进入内容，避免用户必须知道隐藏路径才能发现已经同步的资料。</p></div><div class="catalog-grid">{''.join(cards)}</div></div></section>'''
    (CN / "archive/index.html").write_text(
        shell("完整知识库", "QilyLean 中国站完整本地知识库。", "knowledge", archive_body, "/archive/", f'data-qily-knowledge-discovery="v1" data-qily-generated-total="{total}" data-qily-brief-total="{brief_total}"'),
        encoding="utf-8",
    )

    # Brief home: year index is the sole brief-discovery module (no repeated latest list).
    year_cards = "".join(
        card(f"{year}年", f"/briefs/archive/year/{year}/", f"{len(years[year])}篇本地精选简报", len(years[year]))
        for year in sorted(years, reverse=True)
    )
    briefs_body = f'''<section class="page-hero"><div class="content"><span class="hero-eyebrow">SELECTED BRIEFS｜精选简报</span><h1>精选简报｜{brief_total}篇国内本地档案</h1><p>国际站公开制造工程简报已按合规规则同步到中国服务器；进入本页即可按年份连续浏览，无需跳转国际站。</p></div></section><section class="section"><div class="content"><div class="catalog-stats"><div><b>{brief_total}</b><span>本地精选简报</span></div><div><b>{len(years)}</b><span>年度档案</span></div><div><b>100%</b><span>中国站本地阅读入口</span></div></div><div class="section-head"><small>YEAR ARCHIVE｜年度索引</small><h2>按年份连续浏览</h2></div><div class="catalog-grid catalog-year-grid">{year_cards}</div></div></section>'''
    (CN / "briefs/index.html").write_text(
        shell("精选简报", "QilyLean 中国站制造工程精选简报完整本地档案。", "briefs", briefs_body, "/briefs/", f'data-qily-knowledge-discovery="v1" data-qily-brief-total="{brief_total}"'),
        encoding="utf-8",
    )

    # Knowledge index: convert the old hidden archive CTA into a professional matrix.
    knowledge_path = CN / "knowledge/index.html"
    knowledge = add_css_link(knowledge_path.read_text(encoding="utf-8"))
    # Cache-bust this page only; do not change shared CN styles on other pages.
    knowledge = knowledge.replace(
        '/assets/content-mirror.css?v=20261010-discovery-v2&anchors=20261013-v1',
        '/assets/content-mirror.css?v=20261015-knowledge-hub-v1&anchors=20261013-v1',
    )
    knowledge = remove_legacy_archive_section(knowledge)
    global_hub = international_knowledge_hub(brief_total)
    global_start = "<!-- QILY-CN-INTERNATIONAL-KNOWLEDGE-HUB:START -->"
    global_end = "<!-- QILY-CN-INTERNATIONAL-KNOWLEDGE-HUB:END -->"
    if global_start not in knowledge:
        knowledge_intro = '<section class="section"><div class="content"><div class="section-head"><small>KNOWLEDGE MAP｜知识地图</small>'
        if knowledge_intro not in knowledge:
            raise ValueError("China knowledge page placement anchor changed")
    knowledge = replace_managed(knowledge, global_start, global_end, global_hub,
                                fallback_before=knowledge_intro if global_start not in knowledge else "</main>")
    knowledge_cards = []
    for key, meta in GROUPS.items():
        if key == "briefs":
            continue
        knowledge_cards.append(card(meta["name"], f'/archive/categories/{meta["slug"]}/', meta["desc"], len(grouped[key])))
    knowledge_block = f'''<section class="section" id="cn-global-knowledge-architecture" data-qily-generated-total="{total}"><div class="content"><div class="section-head"><small>LOCAL KNOWLEDGE ASSETS｜本地知识资产</small><h2>{nonbrief_total}篇专题资料 + {brief_total}篇精选简报，已进入中国站可发现体系</h2><p>国际站符合个人知识站边界的公开内容已经同步到国内服务器，并按制造业专业维度组织，不再隐藏在技术归档目录中。</p></div><div class="catalog-grid">{''.join(knowledge_cards)}</div><div class="catalog-actions"><a class="btn primary" href="/archive/">进入完整知识库</a><a class="btn" href="/briefs/">浏览{brief_total}篇精选简报</a></div></div></section>'''
    knowledge = replace_managed(
        knowledge,
        "<!-- QILY-CN-KNOWLEDGE-ASSET-CATALOG:START -->",
        "<!-- QILY-CN-KNOWLEDGE-ASSET-CATALOG:END -->",
        knowledge_block,
    )
    knowledge_path.write_text(knowledge, encoding="utf-8")

    # Homepage: one compact, high-value discovery module; no framework redesign.
    home_path = CN / "index.html"
    home = add_css_link(home_path.read_text(encoding="utf-8"))
    home_cards = [
        card("完整知识库", "/archive/", "国际站合规公开内容的中国服务器本地承接。", total),
        card("精选简报", "/briefs/", "按年份连续浏览制造工程简报。", brief_total),
        card("专业知识索引", "/knowledge/", "按制造工程、精益改善、实践、数智化与工具资料浏览。", len(GROUPS)-1),
    ]
    home_block = f'''<section class="section alt" data-qily-generated-total="{total}" data-qily-brief-total="{brief_total}"><div class="content"><div class="section-head"><small>LOCAL KNOWLEDGE ASSETS｜本地知识资产</small><h2>{total}篇公开知识内容已经进入中国服务器</h2><p>内容完成合规过滤后在国内本地呈现，并通过知识索引、专业分类和年度简报入口直接可发现。</p></div><div class="catalog-grid catalog-home-grid">{''.join(home_cards)}</div></div></section>'''
    anchor = '<section class="section alt"><div class="content"><div class="section-head"><small>QILYLEAN KNOWLEDGE NETWORK'
    start = "<!-- QILY-CN-KNOWLEDGE-ASSET-SUMMARY:START -->"
    end = "<!-- QILY-CN-KNOWLEDGE-ASSET-SUMMARY:END -->"
    managed = start + home_block + end
    existing = re.compile(re.escape(start) + r"[\s\S]*?" + re.escape(end), re.I)
    if existing.search(home):
        home = existing.sub(managed, home, count=1)
    elif anchor in home:
        home = home.replace(anchor, managed + anchor, 1)
    else:
        home = home.replace("</main>", managed + "</main>", 1)
    home_path.write_text(home, encoding="utf-8")

    catalog = {
        "generated": total,
        "briefs": brief_total,
        "non_brief": nonbrief_total,
        "groups": {
            key: {
                "name": meta["name"],
                "count": len(grouped[key]),
                "url": "/briefs/" if key == "briefs" else f'/archive/categories/{meta["slug"]}/',
                "description": meta["desc"],
            }
            for key, meta in GROUPS.items()
        },
        "brief_years": {year: len(years[year]) for year in sorted(years, reverse=True)},
    }
    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    data["front_groups"] = catalog["groups"]
    data["brief_years"] = catalog["brief_years"]
    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    update_sitemap(discovery_urls)
    print(f"CN knowledge discovery materialized: {total} pages / {brief_total} briefs / {len(GROUPS)-1} professional groups.")

if __name__ == "__main__":
    main()
