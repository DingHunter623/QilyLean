#!/usr/bin/env python3
from __future__ import annotations

import html
import os
import re
import shutil
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

try:
    from PIL import Image
except ImportError:
    Image = None

ROOT = Path(__file__).resolve().parents[2]
CN = ROOT / "cn-site"

FILED_NAME = "精益制造经验分享"
BRAND = "QilyLean | 启力精益"

FORBIDDEN = re.compile(
    r"项目合作|商务合作|业务合作|业务承接|项目承接|签单|签约|报价|收费|付款|合同|发票|收款|"
    r"咨询预约|预约咨询|获取方案|联系我们|立即咨询|服务套餐|招商|代理加盟|资源撮合|提成|分成|"
    r"商业交付|咨询转化|销售线索|客户招揽|核心业务|直接交付|业务转化"
)

NEUTRALIZE = {
    "项目合作": "项目实践",
    "商务合作": "经验交流",
    "业务合作": "经验交流",
    "业务承接": "实践开展",
    "项目承接": "项目实践",
    "签单": "项目确认",
    "签约": "项目确认",
    "报价": "成本信息",
    "收费": "费用信息",
    "付款": "费用处理",
    "合同": "项目文件",
    "发票": "费用凭证",
    "收款": "费用处理",
    "咨询预约": "内容浏览",
    "预约咨询": "内容浏览",
    "获取方案": "查看方法",
    "联系我们": "关于本站",
    "立即咨询": "查看内容",
    "服务套餐": "内容模块",
    "招商": "资源说明",
    "代理加盟": "资源说明",
    "资源撮合": "资源说明",
    "提成": "分配",
    "分成": "分配",
    "商业交付": "实践交付",
    "咨询转化": "内容转化",
    "销售线索": "反馈信息",
    "客户招揽": "公开交流",
    "核心业务": "核心能力",
    "直接交付": "实践输出",
    "业务转化": "内容应用",
}

HARD_BLOCK_PREFIXES = (
    "cooperation/",
    "contact/",
)
HARD_BLOCK_EXACT = {
    "delivery.html",
    "projects/qilylean-commercial-deliveries/index.html",
    "projects/qilylean-commercial-deliveries/delivery-record-template.html",
    "projects/qilylean-commercial-deliveries/review-authorization-template.html",
    "links/network/index.html",
    "links/onboarding/index.html",
    "north/diagnosis/index.html",
}

ALLOWED_RASTER = {".png", ".jpg", ".jpeg", ".webp", ".gif"}

@dataclass
class Source:
    path: Path
    category: str
    url: str
    out: Path

def tracked_html() -> list[Path]:
    import subprocess
    out = subprocess.check_output(["git", "ls-files", "*.html", "*.htm"], cwd=ROOT, text=True)
    return [Path(x) for x in out.splitlines() if x.strip()]

def is_date_brief(path: Path) -> bool:
    s = path.as_posix()
    return bool(re.fullmatch(r"qilylean/daily/\d{4}-\d{2}-\d{2}\.html", s))

def selected_source(path: Path) -> bool:
    s = path.as_posix()
    if s.startswith("cn-site/") or s.startswith(HARD_BLOCK_PREFIXES) or s in HARD_BLOCK_EXACT:
        return False
    if is_date_brief(path):
        return True
    allowed_prefixes = (
        "knowledge/",
        "improvements/",
        "projects/",
        "global-knowledge/",
        "moments/",
        "certificates/",
        "AI-Knowledge/",
        "tools/times26001/",
    )
    if s.startswith(allowed_prefixes):
        if "/qilylean-commercial-deliveries/" in s:
            return False
        if any(token in s for token in ("award-preview", "award-online-view", "q3-preview", "q3-online-view", "q4-preview", "q4-online-view")):
            return False
        return True
    exact = {
        "ai.html",
        "capabilities/index.html",
        "experience/index.html",
        "gbt2828.html",
        "lean-production/index.html",
        "papers.html",
        "standards.html",
        "tools.html",
        "knowledge.html",
        "qilylean/gbt2828.html",
        "qilylean/lean-knowledge.html",
        "qilylean/lean-tools.html",
        "qilylean/papers.html",
        "qilylean/production-operations-organization.html",
        "qilylean/reference-audit-documents.html",
        "qilylean/reference-iatf16949-core-tools.html",
        "qilylean/reference-materials.html",
        "qilylean/reference-one-piece-flow.html",
        "qilylean/training/2026-08-08.html",
    }
    return s in exact

def route_for(path: Path) -> tuple[str, str]:
    s = path.as_posix()
    if is_date_brief(path):
        date = path.stem
        return "精选简报", f"/briefs/archive/{date}/"
    if s.startswith("knowledge/"):
        tail = s[len("knowledge/"):]
        return "制造知识", "/archive/knowledge/" + normalize_tail(tail)
    if s.startswith("improvements/"):
        tail = s[len("improvements/"):]
        return "改善方法", "/archive/improvements/" + normalize_tail(tail)
    if s.startswith("projects/"):
        tail = s[len("projects/"):]
        return "实践档案", "/archive/practice/" + normalize_tail(tail)
    if s.startswith("global-knowledge/"):
        tail = s[len("global-knowledge/"):]
        return "知识资料", "/archive/global-knowledge/" + normalize_tail(tail)
    if s.startswith("moments/"):
        tail = s[len("moments/"):]
        return "公开记录", "/archive/records/" + normalize_tail(tail)
    if s.startswith("certificates/"):
        tail = s[len("certificates/"):]
        return "学习记录", "/archive/learning/" + normalize_tail(tail)
    if s.startswith("tools/"):
        tail = s[len("tools/"):]
        return "工具资料", "/archive/tools/" + normalize_tail(tail)
    if s.startswith("AI-Knowledge/"):
        tail = s[len("AI-Knowledge/"):]
        return "AI知识", "/archive/ai/" + normalize_tail(tail)
    if s.startswith("qilylean/"):
        tail = s[len("qilylean/"):]
        return "参考资料", "/archive/reference/" + normalize_tail(tail)
    if s.startswith("lean-production/"):
        return "精益制造", "/archive/knowledge/lean-production/"
    stem = s[:-5] if s.endswith(".html") else s
    stem = stem.strip("/").replace("/index", "")
    return "公开资料", "/archive/profile/" + (stem or "index") + "/"

def normalize_tail(tail: str) -> str:
    if tail.endswith("index.html"):
        tail = tail[:-10]
    elif tail.endswith(".html"):
        tail = tail[:-5] + "/"
    return tail.lstrip("/")

def source_file_for_url(path: str) -> str | None:
    p = path.split("?", 1)[0].split("#", 1)[0]
    if p == "/":
        return "index.html"
    p = p.lstrip("/")
    if p.endswith("/"):
        return p + "index.html"
    if "." not in Path(p).name:
        return p + "/index.html"
    return p

def make_sources() -> list[Source]:
    candidates = [p for p in tracked_html() if selected_source(p)]
    tmp = []
    for p in candidates:
        category, url = route_for(p)
        out = CN / url.lstrip("/") / "index.html" if not url.endswith(".html") else CN / url.lstrip("/")
        if url.endswith("/"):
            out = CN / url.lstrip("/") / "index.html"
        tmp.append(Source(p, category, url, out))
    return tmp

SOURCES = make_sources()
SOURCE_TO_URL = {s.path.as_posix(): s.url for s in SOURCES}

def rewrite_href(value: str) -> str:
    if not value:
        return ""
    value = value.strip()
    low = value.lower()
    if low.startswith(("mailto:", "tel:", "wechat:", "weixin:", "whatsapp:", "javascript:")):
        return ""
    if value.startswith("#"):
        return value
    parsed = urlparse(value)
    if parsed.scheme in ("http", "https"):
        host = parsed.netloc.lower()
        if host in ("qilylean.com", "www.qilylean.com"):
            src = source_file_for_url(parsed.path)
            if src and src in SOURCE_TO_URL:
                return SOURCE_TO_URL[src] + (("#" + parsed.fragment) if parsed.fragment else "")
            return "/"
        return value
    if value.startswith("/"):
        if value.startswith("/downloads/"):
            return ""
        src = source_file_for_url(value)
        if src and src in SOURCE_TO_URL:
            return SOURCE_TO_URL[src]
        if value.startswith(("/assets/", "/site-", "/qilylean/")):
            return value
        if value.startswith(("/cooperation/", "/contact/", "/links/network/", "/links/onboarding/")):
            return "/"
        return value
    return value

class FragmentSanitizer(HTMLParser):
    allowed = {
        "h1","h2","h3","h4","p","ul","ol","li","blockquote","pre","code",
        "table","thead","tbody","tr","th","td","figure","figcaption","img","a",
        "strong","b","em","i","span","div","section","article","br","hr"
    }
    void = {"img","br","hr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in {"script","style","noscript","iframe","form","button","nav","footer","header"}:
            self.skip += 1
            return
        if self.skip or tag not in self.allowed:
            return
        kept = []
        attr = dict(attrs)
        if tag == "a":
            href = rewrite_href(attr.get("href", ""))
            if href:
                kept.append(("href", href))
                if href.startswith(("http://","https://")):
                    kept.extend([("target","_blank"),("rel","noopener noreferrer")])
        elif tag == "img":
            src = attr.get("src", "")
            safe_src = materialize_image(src)
            if not safe_src:
                return
            kept.append(("src", safe_src))
            if attr.get("alt"):
                kept.append(("alt", attr["alt"]))
            kept.append(("loading", "lazy"))
        elif tag in {"th","td"}:
            for key in ("colspan","rowspan"):
                if attr.get(key, "").isdigit():
                    kept.append((key, attr[key]))
        attrs_text = "".join(f' {k}="{html.escape(v, quote=True)}"' for k,v in kept)
        self.out.append(f"<{tag}{attrs_text}>")

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in {"script","style","noscript","iframe","form","button","nav","footer","header"}:
            if self.skip:
                self.skip -= 1
            return
        if self.skip or tag not in self.allowed or tag in self.void:
            return
        self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if self.skip:
            return
        self.out.append(html.escape(data))

def materialize_image(src: str) -> str:
    if not src:
        return ""
    parsed = urlparse(src)
    if parsed.scheme in ("http","https"):
        if parsed.netloc.lower() not in ("qilylean.com","www.qilylean.com"):
            return ""
        src = parsed.path
    if not src.startswith("/"):
        return ""
    rel = src.split("?",1)[0].lstrip("/")
    if re.search(r"(?:^|[-_/])(qr|qrcode|wechat|weixin|contact)(?:[-_. /]|$)", rel, re.I):
        return ""
    ext = Path(rel).suffix.lower()
    if ext not in ALLOWED_RASTER:
        return ""
    source = ROOT / rel
    if not source.is_file():
        return ""

    # The international site contains many multi-megabyte originals. Re-using those
    # byte-for-byte made the CN release exceed 100 MB and unreliable over the mainland
    # deployment route. Preserve the visual content, but materialize a high-quality web-optimized
    # local copy for the China site.
    if source.stat().st_size > 256 * 1024 and ext != ".gif":
        if Image is None:
            raise RuntimeError("Pillow is required to optimize CN mirror images")
        rel_path = Path(rel)
        optimized_rel = Path("assets/mirror-media") / rel_path.with_suffix(".webp")
        dest = CN / optimized_rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists() or source.stat().st_mtime_ns > dest.stat().st_mtime_ns:
            with Image.open(source) as img:
                img = img.convert("RGB")
                img.thumbnail((1920, 2160), Image.Resampling.LANCZOS)
                img.save(dest, "WEBP", quality=84, method=6, optimize=True)
        return "/" + optimized_rel.as_posix()

    dest = CN / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists() or source.stat().st_mtime_ns > dest.stat().st_mtime_ns:
        shutil.copy2(source, dest)
    return "/" + rel

def extract_meta(text: str) -> tuple[str, str]:
    mt = re.search(r"<title>(.*?)</title>", text, re.I|re.S)
    title = clean_text(mt.group(1)) if mt else "公开知识资料"
    md = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', text, re.I|re.S)
    desc = clean_text(md.group(1)) if md else ""
    return neutralize(title), neutralize(desc)

def extract_fragment(text: str) -> str:
    for tag in ("main","article","body"):
        m = re.search(fr"<{tag}\b[^>]*>([\s\S]*?)</{tag}>", text, re.I)
        if m:
            return m.group(1)
    return text

def clean_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    return re.sub(r"\s+", " ", value).strip()

def neutralize(value: str) -> str:
    for old, new in NEUTRALIZE.items():
        value = value.replace(old, new)
    value = value.replace("https://qilylean.com", "https://qilylean.cn")
    value = value.replace("http://qilylean.com", "https://qilylean.cn")
    return value

def remove_forbidden_blocks(body: str) -> str:
    # Drop conversion/contact-oriented blocks. The mainland personal site must never
    # inherit QR-code, private-contact or sales-conversion residue from the global site.
    contact = re.compile(r"(微信|WeChat|wechat|Qily259|二维码|联系电话|联系邮箱|项目交流|官网与交流)", re.I)
    pattern = re.compile(r"<(p|li|a|blockquote|figcaption|figure)\b[^>]*>[\s\S]*?</\1>", re.I)
    def repl(m):
        text = clean_text(m.group(0))
        return "" if (FORBIDDEN.search(text) or contact.search(text)) else m.group(0)
    body = pattern.sub(repl, body)
    body = re.sub(r"(微信|WeChat|wechat|Qily259|二维码|项目交流|官网与交流)", "", body, flags=re.I)
    return neutralize(body)

def footer() -> str:
    return '''<footer class="footer"><div class="footer-inner"><a class="footer-home" href="/" aria-label="返回精益制造经验分享中国站首页" title="返回中国站首页">精益制造经验分享</a><nav class="footer-actions" aria-label="页脚快捷操作"><button type="button" data-qily-footer-action="top">顶部</button><button type="button" data-qily-footer-action="share">分享当前</button></nav><span class="footer-records notranslate" translate="no"><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" title="工信部备案查询（新标签页打开）">湘ICP备2026041143号-1</a><a class="police-record" href="https://beian.mps.gov.cn/#/query/webSearch?code=43020002000443" target="_blank" rel="noopener noreferrer" title="公安备案查询（新标签页打开）"><img src="/assets/mps-beian.png" width="18" height="20" alt="" aria-hidden="true"><span>湘公网安备43020002000443号</span></a></span></div></footer>'''

def header(current: str = "knowledge") -> str:
    def a(href, key, label):
        current_attr = ' aria-current="page"' if key == current else ""
        return f'<a href="{href}" data-qily-nav-key="{key}"{current_attr}>{label}</a>'
    return '<header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="返回QilyLean首页" title="返回首页">QilyLean | <span>启力精益</span></a><nav class="nav" aria-label="主导航" data-qily-cn-nav-contract="20260926-v7-bridge">' + "".join([
        a("/", "home", "首页"),
        a("/lean/", "lean", "精益制造"),
        a("/notes/", "projects", "代表项目"),
        a("/knowledge/", "knowledge", "知识索引"),
        a("/briefs/", "briefs", "精选简报"),
        a("/resources/", "resources", "资源协同"),
        a("/about/", "about", "关于我们"),
    ]) + '</nav></div></header>'

def wrap_page(source: Source, title: str, desc: str, body: str) -> str:
    current = "briefs" if source.category == "精选简报" else "knowledge"
    canonical = "https://qilylean.cn" + source.url
    desc = desc or f"{FILED_NAME}公开知识资料：{title}"
    return f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}｜{FILED_NAME}｜{BRAND}</title><meta name="description" content="{html.escape(desc, quote=True)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><link rel="canonical" href="{canonical}"><link rel="stylesheet" href="/assets/site.css?v=20260923-cn-personal-v3-reading"><link rel="stylesheet" href="/assets/portal.css?v=20260923-portal-v2-reading"><link rel="stylesheet" href="/assets/content-mirror.css?v=20261010-full-content-v1"><link id="qilyCnDomesticTranslateV1Stylesheet" rel="stylesheet" href="/assets/cn-translate-baidu-v1.css?v=20260922-translate-v6-baidu"><link id="qilyCnUnifiedViV2" rel="stylesheet" href="/assets/qilylean-vi-v2.css?v=20261008-cn-vi-v50-cache-revalidation"><link id="qilyCnFooterActionsV1Stylesheet" rel="stylesheet" href="/assets/cn-footer-actions-v1.css?v=20261007-mobile-footer-row-merge-v16"><link id="qilyPublicFooterTypeV1" rel="stylesheet" href="/site-public-footer-type-v1.css?v=20261005-public-footer-v3"></head><body><a class="skip" href="#main">跳到主要内容</a>{header(current)}<main id="main"><section class="page-hero"><div class="content"><span class="hero-eyebrow">{html.escape(source.category)}｜公开知识档案</span><h1>{html.escape(title)}</h1><p>{html.escape(desc)}</p></div></section><section class="section"><div class="content mirror-shell"><article class="article-body mirror-article">{body}</article><aside class="toc mirror-meta"><b>内容来源</b><p>由 QilyLean｜启力精益公开内容资产同步至中国站，并按个人知识站边界完成本地化整理。</p><p><a href="/archive/">返回完整内容档案</a></p></aside></div></section></main>{footer()}<script defer src="/assets/cn-translate-baidu-v1.js?v=20261006-youdao-nmt-closure-v1"></script><script defer src="/assets/cn-footer-actions-v1.js?v=20260930-footer-domain-v15"></script><script defer src="/assets/cn-nav-rail-v1.js?v=20260926-nav-rail-v20-cn-bridge"></script></body></html>'''

def render_index(title: str, heading: str, intro: str, rows: list[tuple[str,str,str]], url: str) -> str:
    cards = []
    for label, href, meta in rows:
        cards.append(f'<a class="article-link" href="{href}"><h3>{html.escape(label)}</h3><p>{html.escape(meta)}</p></a>')
    canonical = "https://qilylean.cn" + url
    return f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}｜{FILED_NAME}｜{BRAND}</title><meta name="description" content="{html.escape(intro, quote=True)}"><meta name="robots" content="index,follow"><link rel="canonical" href="{canonical}"><link rel="stylesheet" href="/assets/site.css?v=20260923-cn-personal-v3-reading"><link rel="stylesheet" href="/assets/portal.css?v=20260923-portal-v2-reading"><link rel="stylesheet" href="/assets/content-mirror.css?v=20261010-full-content-v1"><link id="qilyCnUnifiedViV2" rel="stylesheet" href="/assets/qilylean-vi-v2.css?v=20261008-cn-vi-v50-cache-revalidation"><link id="qilyCnFooterActionsV1Stylesheet" rel="stylesheet" href="/assets/cn-footer-actions-v1.css?v=20261007-mobile-footer-row-merge-v16"><link id="qilyPublicFooterTypeV1" rel="stylesheet" href="/site-public-footer-type-v1.css?v=20261005-public-footer-v3"></head><body><a class="skip" href="#main">跳到主要内容</a>{header("briefs" if url.startswith("/briefs/") else "knowledge")}<main id="main"><section class="page-hero"><div class="content"><span class="hero-eyebrow">QILYLEAN CONTENT ARCHIVE｜内容档案</span><h1>{html.escape(heading)}</h1><p>{html.escape(intro)}</p></div></section><section class="section"><div class="content"><div class="article-list mirror-index">{''.join(cards)}</div></div></section></main>{footer()}<script defer src="/assets/cn-footer-actions-v1.js?v=20260930-footer-domain-v15"></script><script defer src="/assets/cn-nav-rail-v1.js?v=20260926-nav-rail-v20-cn-bridge"></script></body></html>'''

def update_sitemap(urls: list[str]):
    path = CN / "sitemap.xml"
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    # Remove previously materialized mirror entries so the job is idempotent.
    text = re.sub(r"\s*<url><loc>https://qilylean\.cn/(?:archive|briefs/archive)/[^<]*</loc>[\s\S]*?</url>", "", text)
    entries = []
    for url in sorted(set(urls)):
        entries.append(f"  <url><loc>https://qilylean.cn{url}</loc><changefreq>monthly</changefreq><priority>0.65</priority></url>")
    text = text.replace("</urlset>", "\n" + "\n".join(entries) + "\n</urlset>")
    path.write_text(text, encoding="utf-8")

def main():
    # Remove old generated mirror trees only; never touch hand-authored CN pages.
    for rel in ("archive", "briefs/archive"):
        target = CN / rel
        if target.exists():
            shutil.rmtree(target)

    manifest = []
    category_rows: dict[str, list[tuple[str,str,str]]] = {}
    brief_rows: list[tuple[str,str,str]] = []
    urls = ["/archive/", "/briefs/archive/"]

    for source in SOURCES:
        raw = (ROOT / source.path).read_text(encoding="utf-8", errors="ignore")
        title, desc = extract_meta(raw)
        fragment = extract_fragment(raw)
        parser = FragmentSanitizer()
        parser.feed(fragment)
        body = remove_forbidden_blocks("".join(parser.out))
        body = re.sub(r"\s{3,}", " ", body)
        if len(clean_text(body)) < 80:
            continue

        source.out.parent.mkdir(parents=True, exist_ok=True)
        source.out.write_text(wrap_page(source, title, desc, body), encoding="utf-8")
        urls.append(source.url)

        row = (title, source.url, f"{source.category} · 本地公开内容")
        category_rows.setdefault(source.category, []).append(row)
        if source.category == "精选简报":
            brief_rows.append(row)
        manifest.append({
            "source": source.path.as_posix(),
            "category": source.category,
            "url": source.url,
            "title": title,
        })

    brief_rows.sort(key=lambda x: x[1], reverse=True)
    brief_index = CN / "briefs/archive/index.html"
    brief_index.parent.mkdir(parents=True, exist_ok=True)
    brief_index.write_text(render_index(
        "精选简报完整档案",
        f"精选简报完整档案｜{len(brief_rows)}篇",
        "国际站已公开的精选制造工程简报已同步为中国站本地阅读版本，不需要跳转国际站即可连续浏览。",
        brief_rows,
        "/briefs/archive/",
    ), encoding="utf-8")

    all_rows = []
    for category in sorted(category_rows):
        items = category_rows[category]
        all_rows.append((f"{category}｜{len(items)}篇", items[0][1], "进入该类别已同步的公开知识内容"))
    archive_index = CN / "archive/index.html"
    archive_index.parent.mkdir(parents=True, exist_ok=True)
    archive_index.write_text(render_index(
        "公开内容完整档案",
        f"QilyLean公开内容完整档案｜{len(manifest)}篇",
        "中国站对国际站公开制造知识资产实施全内容覆盖同步；经营、交易、隐私、保密或主体不匹配内容在同步环节过滤。",
        all_rows,
        "/archive/",
    ), encoding="utf-8")

    (CN / "archive/content-manifest.json").write_text(
        __import__("json").dumps({
            "generated": len(manifest),
            "categories": {k: len(v) for k,v in category_rows.items()},
            "items": manifest,
        }, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    update_sitemap(urls)
    print(f"CN content mirror materialized: {len(manifest)} pages")
    for category, items in sorted(category_rows.items()):
        print(f"  {category}: {len(items)}")

if __name__ == "__main__":
    main()
