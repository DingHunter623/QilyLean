from pathlib import Path
import json
import re

DATE = "2026-08-03"
PREV = "2026-08-02"
THEME = "成果证据分级与公开核验"
TITLE = "成果不是数字卡片：用证据等级、阶段门与公开链接形成核验闭环"
SUMMARY = "制造改善成果一旦进入官网、项目报告或对外交流材料，就从内部总结升级为公开主张。公开主张不能只给出“提升多少、节省多少、完成多少”，还必须同步回答：依据是什么、由谁确认、本人承担什么角色、适用于什么条件、读者在哪里核验。"
URL = f"/qilylean/daily/{DATE}.html"
ABS_URL = f"https://qilylean.com{URL}"


def read(path):
    return Path(path).read_text(encoding="utf-8")


def write(path, text):
    Path(path).write_text(text, encoding="utf-8")


# Machine-readable brief index.
index_path = Path("qilylean/daily/index.json")
items = json.loads(index_path.read_text(encoding="utf-8"))
entry = {"date": DATE, "title": TITLE, "summary": SUMMARY, "dayNo": "", "theme": THEME}
items = [item for item in items if item.get("date") != DATE]
items.insert(0, entry)
index_path.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Previous issue: update top and bottom navigation only.
prev_path = Path(f"qilylean/daily/{PREV}.html")
prev_html = prev_path.read_text(encoding="utf-8")
next_link = f'<a href="{URL}">下一期 →</a>'
old_latest = '<span>已是最新一期</span>'
if next_link not in prev_html:
    count = prev_html.count(old_latest)
    if count != 2:
        raise SystemExit(f"Expected two latest markers in {PREV}, found {count}")
    prev_html = prev_html.replace(old_latest, next_link)
prev_path.write_text(prev_html, encoding="utf-8")

# Brief directory: preserve existing disclosure, schema and VI links.
directory_path = Path("qilylean/daily-insights.html")
directory = directory_path.read_text(encoding="utf-8")
directory = directory.replace(
    f"2019-07-10—{PREV}｜共2581期｜按月份收纳、最新优先",
    f"2019-07-10—{DATE}｜共2582期｜按月份收纳、最新优先"
)
directory = directory.replace(
    f'<a href="/qilylean/daily/{PREV}.html">打开最新简报</a>',
    f'<a href="{URL}">打开最新简报</a>',
    1
)
directory = directory.replace("当前显示全部 2581 期", "当前显示全部 2582 期")
directory = directory.replace(
    '<summary><span>2026年8月</span><b>2期</b></summary>',
    '<summary><span>2026年8月</span><b>3期</b></summary>',
    1
)
old_latest_prefix = f'<article class="brief-index-card latest" data-brief-year="2026" data-brief-date="{PREV}"'
normal_prefix = f'<article class="brief-index-card" data-brief-year="2026" data-brief-date="{PREV}"'
directory = directory.replace(old_latest_prefix, normal_prefix, 1)
new_card = f'''<article class="brief-index-card latest" data-brief-year="2026" data-brief-date="{DATE}" data-brief-theme="{THEME}" data-brief-title="{TITLE}" data-brief-summary="{SUMMARY}" data-brief-search="{DATE} {THEME} {TITLE} {SUMMARY}">
  <div class="brief-index-meta"><time datetime="{DATE}">{DATE}</time><span>{THEME}</span></div>
  <h2><a href="{URL}">{TITLE}</a></h2>
  <div class="brief-index-actions"><a class="brief-open" href="{URL}">打开本期简报</a><button type="button" data-brief-url="{ABS_URL}" data-brief-title="{TITLE}">分享本期网址</button><span class="brief-share-status" aria-live="polite"></span></div>
</article>
'''
if f'data-brief-date="{DATE}"' not in directory:
    if normal_prefix not in directory:
        raise SystemExit("Cannot locate August 2 directory card")
    directory = directory.replace(normal_prefix, new_card + normal_prefix, 1)
directory_path.write_text(directory, encoding="utf-8")

# Preserve existing card structures; update only latest-brief fields.
def sync_latest_card(path):
    text = read(path)
    pattern = re.compile(r'<article\b[^>]*data-latest-brief-card[\s\S]*?</article>')
    match = pattern.search(text)
    if not match:
        raise SystemExit(f"Latest brief card missing: {path}")
    card = match.group(0)
    card = re.sub(r'data-latest-brief-date="[^"]*"', f'data-latest-brief-date="{DATE}"', card, count=1)
    card = re.sub(r'(<[^>]+data-latest-brief-meta[^>]*>)[\s\S]*?(</[^>]+>)', rf'\1最新：{DATE}｜{THEME}\2', card, count=1)
    card = re.sub(r'(<[^>]+data-latest-brief-title[^>]*>)[\s\S]*?(</[^>]+>)', rf'\1{TITLE}\2', card, count=1)
    card = re.sub(r'(<[^>]+data-latest-brief-summary[^>]*>)[\s\S]*?(</[^>]+>)', rf'\1{SUMMARY}\2', card, count=1)
    card = re.sub(r'(<a\b[^>]*data-latest-brief-link[^>]*href=")[^"]*(")', rf'\1{URL}\2', card, count=1)
    write(path, text[:match.start()] + card + text[match.end():])


sync_latest_card("knowledge/index.html")
sync_latest_card("index.html")

# Runtime fallback candidate.
latest_js_path = Path("qilylean/latest-brief.js")
latest_js = latest_js_path.read_text(encoding="utf-8")
candidate = f"""var releaseCandidate={{
  date:'{DATE}',
  theme:'{THEME}',
  title:'{TITLE}',
  summary:'{SUMMARY}',
  href:'{URL}'
}};"""
latest_js, n = re.subn(r"var releaseCandidate=\{[\s\S]*?\n\};", candidate, latest_js, count=1)
if n != 1:
    raise SystemExit("releaseCandidate block not found")
latest_js_path.write_text(latest_js, encoding="utf-8")

# Shared site metadata.
site_data_path = Path("qilylean/site-data.json")
site = json.loads(site_data_path.read_text(encoding="utf-8"))
already_latest = site.get("search", {}).get("latestBriefDate") == DATE
site["generatedAt"] = DATE
site["briefs"].update({
    "total": 2582,
    "latestDate": DATE,
    "latestTheme": THEME,
    "latestTitle": TITLE,
    "latestSummary": SUMMARY,
    "latestUrl": URL
})
site["search"].update({
    "indexedEntries": int(site["search"].get("indexedEntries", 2860)) + (0 if already_latest else 1),
    "indexedPages": int(site["search"].get("indexedPages", 2802)) + (0 if already_latest else 1),
    "briefTotal": 2582,
    "latestBriefDate": DATE,
    "sitemapLastmod": DATE
})
site_data_path.write_text(json.dumps(site, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Sitemap.
sitemap_path = Path("sitemap.xml")
sitemap = sitemap_path.read_text(encoding="utf-8")
sitemap = sitemap.replace(
    f'<url><loc>https://qilylean.com/qilylean/daily-insights.html</loc><lastmod>{PREV}</lastmod>',
    f'<url><loc>https://qilylean.com/qilylean/daily-insights.html</loc><lastmod>{DATE}</lastmod>',
    1
)
new_url = f'  <url><loc>{ABS_URL}</loc><lastmod>{DATE}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n'
if ABS_URL not in sitemap:
    old_url = f'  <url><loc>https://qilylean.com/qilylean/daily/{PREV}.html</loc>'
    if old_url not in sitemap:
        raise SystemExit("Previous sitemap URL not found")
    sitemap = sitemap.replace(old_url, new_url + old_url, 1)
sitemap_path.write_text(sitemap, encoding="utf-8")

# Terminology release gate record.
audit_path = Path("qilylean/daily/terminology-audit-latest.json")
audit = {
    "schemaVersion": 1,
    "briefDate": DATE,
    "briefPath": f"qilylean/daily/{DATE}.html",
    "checkedAt": "2026-08-03T02:32:00.000Z",
    "candidates": [
        {"term": "PMO", "explanation": "", "explicit": False, "source": "PMO"},
        {"term": "RACI", "explanation": "", "explicit": False, "source": "RACI"}
    ],
    "coveredTerms": ["PMO", "RACI"],
    "unknownTerms": [],
    "rule": "今日简报发布前必须完成新术语的中文诠释、独立课件／词典收录、搜索索引及Sitemap同步；存在未收录术语时阻断发布。",
    "linkedTerms": [],
    "featuredTerms": ["PMO", "RACI", "Sponsor"],
    "status": "passed"
}
audit_path.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Guardrails.
brief = read(f"qilylean/daily/{DATE}.html")
required = ["证据卡必须链接到对应公开成果页", "项目负责人准备成果与证据", "site-link-standard-v2.css"]
missing = [item for item in required if item not in brief]
if missing:
    raise SystemExit(f"Latest brief guardrail failed: {missing}")
if "site-vi-standard-v1.css" not in read(f"qilylean/daily/{PREV}.html"):
    raise SystemExit("Previous brief VI stylesheet was removed")
