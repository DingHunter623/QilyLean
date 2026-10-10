#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
from collections import defaultdict
from pathlib import Path

CN = Path(__file__).resolve().parents[1]
MANIFEST = CN / "archive/content-manifest.json"
CSS_HREF = "/assets/content-mirror.css?v=20261010-discovery-v3"
START = "<!-- QILY-CN-DISCOVERY:START -->"
END = "<!-- QILY-CN-DISCOVERY:END -->"

GROUPS = [
    ("精选简报", "briefs", {"精选简报"}, "持续沉淀制造工程、精益、IE、数智化与行业观察。"),
    ("精益与制造知识", "manufacturing", {"制造知识", "精益制造", "知识资料"}, "围绕生产系统、IE、标准化、质量与制造工程建立专业知识主线。"),
    ("改善方法", "improvement", {"改善方法"}, "把 VSM、SMED、ECRS、PDCA 等方法放回问题、数据与验证逻辑。"),
    ("实践与成果", "practice", {"实践档案", "公开记录", "学习记录"}, "用真实实践、项目复盘与阶段成果连接方法和现场。"),
    ("AI与数智制造", "digital-ai", {"AI知识"}, "关注 AI、数据、ERP/MES/APS 与制造系统之间的应用逻辑。"),
    ("工具与参考资料", "reference", {"工具资料", "参考资料", "公开资料"}, "集中整理工具、标准、参考文档与可复用资料。"),
]


def load():
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    items = data.get("items", [])
    if not items:
        raise SystemExit("content manifest has no items")
    return data, items


def header(current="knowledge"):
    nav = [
        ("/", "home", "首页"),
        ("/lean/", "lean", "精益制造"),
        ("/notes/", "projects", "代表项目"),
        ("/knowledge/", "knowledge", "知识索引"),
        ("/briefs/", "briefs", "精选简报"),
        ("/resources/", "resources", "资源协同"),
        ("/about/", "about", "关于我们"),
    ]
    links = "".join(
        f'<a href="{href}" data-qily-nav-key="{key}"' + (' aria-current="page"' if key == current else "") + f'>{label}</a>'
        for href, key, label in nav
    )
    return f'<header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="返回QilyLean首页">QilyLean | <span>启力精益</span></a><nav class="nav" aria-label="主导航">{links}</nav></div></header>'


def footer():
    return '<footer class="footer"><div class="footer-inner"><a class="footer-home" href="/">精益制造经验分享</a><nav class="footer-actions" aria-label="页脚快捷操作"><button type="button" data-qily-footer-action="top">顶部</button><button type="button" data-qily-footer-action="share">分享当前</button></nav><span class="footer-records notranslate" translate="no"><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">湘ICP备2026041143号-1</a><a class="police-record" href="https://beian.mps.gov.cn/#/query/webSearch?code=43020002000443" target="_blank" rel="noopener noreferrer"><span>湘公网安备43020002000443号</span></a></span></div></footer>'


def shell(title, heading, intro, body, canonical, current="knowledge"):
    return f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}｜精益制造经验分享｜QilyLean | 启力精益</title><meta name="description" content="{html.escape(intro, quote=True)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><link rel="canonical" href="{canonical}"><link rel="stylesheet" href="/assets/site.css?v=20260923-cn-personal-v3-reading"><link rel="stylesheet" href="/assets/portal.css?v=20260923-portal-v2-reading"><link rel="stylesheet" href="{CSS_HREF}"><link id="qilyCnUnifiedViV2" rel="stylesheet" href="/assets/qilylean-vi-v2.css?v=20261008-cn-vi-v50-cache-revalidation"><link id="qilyCnFooterActionsV1Stylesheet" rel="stylesheet" href="/assets/cn-footer-actions-v1.css?v=20261007-mobile-footer-row-merge-v16"><link id="qilyPublicFooterTypeV1" rel="stylesheet" href="/site-public-footer-type-v1.css?v=20261005-public-footer-v3"></head><body><a class="skip" href="#main">跳到主要内容</a>{header(current)}<main id="main"><section class="page-hero"><div class="content"><span class="hero-eyebrow">QILYLEAN KNOWLEDGE ASSETS｜知识资产</span><h1>{html.escape(heading)}</h1><p>{html.escape(intro)}</p></div></section>{body}</main>{footer()}<script defer src="/assets/cn-footer-actions-v1.js?v=20260930-footer-domain-v15"></script><script defer src="/assets/cn-nav-rail-v1.js?v=20260926-nav-rail-v20-cn-bridge"></script></body></html>'''


def cards(items):
    return "".join(
        f'<a class="article-link" href="{html.escape(x["url"], quote=True)}"><h3>{html.escape(x["title"])}</h3><p>{html.escape(x["category"])} · 中国站本地内容</p></a>'
        for x in items
    )


def group_for(category):
    for title, slug, raw, desc in GROUPS:
        if category in raw:
            return title, slug, desc
    return "工具与参考资料", "reference", "工具、标准与公开参考资料。"


def ensure_css(text):
    if "content-mirror.css" in text:
        return text
    return text.replace("</head>", f'<link rel="stylesheet" href="{CSS_HREF}">\n</head>', 1)


def replace_or_insert(path, block, fallback_pattern=None, before="</main>"):
    text = ensure_css(path.read_text(encoding="utf-8"))
    wrapped = START + block + END
    if START in text and END in text:
        text = re.sub(re.escape(START) + r"[\s\S]*?" + re.escape(END), wrapped, text, count=1)
    elif fallback_pattern and re.search(fallback_pattern, text, re.I):
        text = re.sub(fallback_pattern, wrapped, text, count=1, flags=re.I)
    else:
        text = text.replace(before, wrapped + before, 1)
    path.write_text(text, encoding="utf-8")


def update_sitemap(urls):
    path = CN / "sitemap.xml"
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"\s*<url><loc>https://qilylean\.cn/(?:archive/category|briefs/archive/year)/[^<]*</loc></url>", "", text)
    add = "".join(f"\n  <url><loc>https://qilylean.cn{u}</loc></url>" for u in sorted(set(urls)))
    path.write_text(text.replace("</urlset>", add + "\n</urlset>"), encoding="utf-8")


def main():
    _, items = load()
    total = len(items)
    briefs = [x for x in items if x["category"] == "精选简报"]
    nonbrief = total - len(briefs)

    grouped = defaultdict(list)
    for item in items:
        grouped[group_for(item["category"])[1]].append(item)

    group_cards = []
    generated_urls = []
    for title, slug, raw, desc in GROUPS:
        bucket = sorted(grouped.get(slug, []), key=lambda x: x["title"])
        if not bucket:
            continue
        url = f"/archive/category/{slug}/"
        generated_urls.append(url)
        group_cards.append(
            f'<a class="catalog-card" href="{url}"><span class="catalog-count">{len(bucket)}篇</span><h3>{html.escape(title)}</h3><p>{html.escape(desc)}</p><span class="catalog-enter">进入该知识分类 →</span></a>'
        )
        body = f'<section class="section"><div class="content"><div class="catalog-breadcrumb"><a href="/knowledge/">知识索引</a><span>›</span><a href="/archive/">完整知识库</a><span>›</span><span>{html.escape(title)}</span></div><div class="article-list catalog-list">{cards(bucket)}</div></div></section>'
        out = CN / f"archive/category/{slug}/index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(shell(title, f"{title}｜{len(bucket)}篇", desc, body, "https://qilylean.cn" + url), encoding="utf-8")

    archive_body = f'''<section class="section"><div class="content"><div class="catalog-stats"><div><b>{total}</b><span>中国站本地知识页面</span></div><div><b>{len(briefs)}</b><span>精选制造简报</span></div><div><b>{nonbrief}</b><span>专业知识与实践资料</span></div><div><b>{len(group_cards)}</b><span>面向用户的专业分类</span></div></div><div class="catalog-grid">{''.join(group_cards)}</div></div></section>'''
    (CN / "archive/index.html").write_text(
        shell("完整知识库", f"完整知识库｜{total}篇本地内容", "国际站已公开且符合中国个人知识站边界的内容，已在中国服务器本地化整理，并按专业维度进入前台知识体系。", archive_body, "https://qilylean.cn/archive/"),
        encoding="utf-8",
    )

    years = defaultdict(list)
    for item in briefs:
        m = re.search(r"(\d{4})-\d{2}-\d{2}", item.get("url", ""))
        if m:
            years[m.group(1)].append(item)

    year_cards = []
    for year in sorted(years, reverse=True):
        bucket = sorted(years[year], key=lambda x: x["url"], reverse=True)
        url = f"/briefs/archive/year/{year}/"
        generated_urls.append(url)
        year_cards.append(
            f'<a class="catalog-card" href="{url}"><span class="catalog-count">{len(bucket)}篇</span><h3>{year} 年精选简报</h3><p>按时间浏览该年度制造工程与行业精选内容。</p><span class="catalog-enter">进入 {year} 年档案 →</span></a>'
        )
        body = f'<section class="section"><div class="content"><div class="catalog-breadcrumb"><a href="/briefs/">精选简报</a><span>›</span><span>{year}年</span></div><div class="article-list catalog-list">{cards(bucket)}</div></div></section>'
        out = CN / f"briefs/archive/year/{year}/index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(shell(f"{year}年精选简报", f"{year}年精选简报｜{len(bucket)}篇", "按时间浏览中国站已本地化的 QilyLean 精选制造工程简报。", body, "https://qilylean.cn" + url, "briefs"), encoding="utf-8")

    latest = sorted(briefs, key=lambda x: x["url"], reverse=True)[:12]
    brief_archive_body = f'''<section class="section"><div class="content"><div class="catalog-stats"><div><b>{len(briefs)}</b><span>本地精选简报</span></div><div><b>{len(years)}</b><span>年度档案</span></div><div><b>12</b><span>最新简报直接展示</span></div><div><b>100%</b><span>中国站本地阅读</span></div></div><div class="section-head"><small>LATEST｜最新内容</small><h2>最近更新</h2></div><div class="article-list catalog-list">{cards(latest)}</div><div class="section-head catalog-more"><small>YEAR ARCHIVE｜年度档案</small><h2>按年份浏览</h2></div><div class="catalog-grid catalog-year-grid">{''.join(year_cards)}</div></div></section>'''
    (CN / "briefs/archive/index.html").write_text(
        shell("精选简报完整档案", f"精选简报完整档案｜{len(briefs)}篇", "中国站直接提供国际站公开精选简报的本地阅读与年度索引，不需要跳转海外站点。", brief_archive_body, "https://qilylean.cn/briefs/archive/", "briefs"),
        encoding="utf-8",
    )

    knowledge_cards = "".join(group_cards[1:])
    knowledge_block = f'''<section class="section"><div class="content"><div class="section-head"><small>FULL KNOWLEDGE ASSETS｜完整知识资产</small><h2>{total}篇本地内容，已经进入中国站知识体系</h2><p>不是隐藏归档：国际站公开且符合中国站边界的专业内容，已按制造知识、改善方法、实践成果、AI数智和工具参考重新组织。</p></div><div class="catalog-stats"><div><b>{nonbrief}</b><span>专业知识与实践资料</span></div><div><b>{len(briefs)}</b><span>精选简报</span></div><div><b>{len(group_cards)}</b><span>专业分类</span></div><div><b>本地</b><span>腾讯云中国服务器读取</span></div></div><div class="catalog-grid">{knowledge_cards}</div><div class="catalog-actions"><a class="btn primary" href="/archive/">进入完整知识库</a><a class="btn" href="/briefs/">浏览精选简报</a></div></div></section>'''
    replace_or_insert(
        CN / "knowledge/index.html",
        knowledge_block,
        r'<section class="section"><div class="content"><div class="section-head"><small>FULL CONTENT ARCHIVE[\s\S]*?</section>'
    )

    brief_block = f'''<section class="section"><div class="content"><div class="section-head"><small>LOCAL BRIEF LIBRARY｜本地简报库</small><h2>{len(briefs)}篇精选简报已经本地化</h2><p>最新内容直接展示，按年份继续浏览；中国大陆访问无需跳转国际站。</p></div><div class="catalog-stats"><div><b>{len(briefs)}</b><span>精选简报</span></div><div><b>{len(years)}</b><span>年度档案</span></div><div><b>12</b><span>最新内容</span></div><div><b>本地</b><span>中国服务器阅读</span></div></div><div class="article-list catalog-list">{cards(latest)}</div><div class="catalog-actions"><a class="btn primary" href="/briefs/archive/">进入完整简报档案</a></div><div class="catalog-grid catalog-year-grid catalog-more">{''.join(year_cards)}</div></div></section>'''
    replace_or_insert(
        CN / "briefs/index.html",
        brief_block,
        r'<section class="section"><div class="content article-shell">[\s\S]*?</section>'
    )

    home_cards = "".join(group_cards[:3])
    home_block = f'''<section class="section alt"><div class="content"><div class="section-head"><small>KNOWLEDGE ASSETS｜知识资产</small><h2>{total}篇本地内容，形成可持续扩展的制造知识库</h2><p>国际站公开且符合中国站边界的内容已本地承接；从首页即可进入知识、方法、实践与精选简报，不再隐藏在技术归档路径中。</p></div><div class="catalog-stats"><div><b>{total}</b><span>本地知识页面</span></div><div><b>{len(briefs)}</b><span>精选简报</span></div><div><b>{nonbrief}</b><span>知识与实践资料</span></div><div><b>{len(group_cards)}</b><span>专业分类</span></div></div><div class="catalog-grid catalog-home-grid">{home_cards}</div><div class="catalog-actions"><a class="btn primary" href="/knowledge/">进入知识索引</a><a class="btn" href="/archive/">查看完整知识库</a></div></div></section>'''
    replace_or_insert(
        CN / "index.html",
        home_block,
        None,
        '<section class="section"><div class="content"><div class="section-head"><small>ABOUT QILYLEAN'
    )

    update_sitemap(generated_urls)
    print(f"CN knowledge discovery built: {total} local pages / {len(briefs)} briefs / {len(group_cards)} groups / {len(years)} brief years.")


if __name__ == "__main__":
    main()
