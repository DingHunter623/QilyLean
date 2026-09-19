#!/usr/bin/env python3
"""Audit the live CN site and record search submission receipts, never rankings."""

import argparse
import concurrent.futures
import datetime as dt
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
import xml.etree.ElementTree as ET

ORIGIN = "https://qilylean.cn"
SITE = Path(__file__).resolve().parents[1] / "cn-site"
INDEXNOW_KEY = "b47ed759da519bd90586a7877122d7be"
AGENTS = ("Baiduspider", "Mozilla/5.0 (Linux; Android 12; Mobile; compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
          "bingbot", "360Spider", "Sogou web spider")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request(url, *, agent="QilyLean-CN-Search-Audit/1.0", data=None, content_type=None):
    headers = {"User-Agent": agent}
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, data=data, headers=headers)
    # Never follow a submission redirect with credentials or retry an uncertain POST.
    opener = urllib.request.build_opener(NoRedirect()) if data is not None else urllib.request.build_opener()
    attempts = 1 if data is not None else 2
    for attempt in range(attempts):
        try:
            with opener.open(req, timeout=20) as response:
                return response.status, response.geturl(), dict(response.headers), response.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as exc:
            return exc.code, url, dict(exc.headers), exc.read().decode("utf-8", "replace")
        except (urllib.error.URLError, TimeoutError, OSError):
            if attempt + 1 == attempts:
                # Do not print exception strings: they can contain the Baidu token URL.
                raise RuntimeError("Network request failed or timed out") from None


def sitemap_urls(body):
    root = ET.fromstring(body)
    if root.tag != "{http://www.sitemaps.org/schemas/sitemap/0.9}urlset":
        raise ValueError("Expected a sitemap URL set")
    urls = [(node.text or "").strip() for node in root.findall("{*}url/{*}loc")]
    if not urls or len(urls) != len(set(urls)):
        raise ValueError("Sitemap is empty or contains duplicate URLs")
    for url in urls:
        parsed = urllib.parse.urlsplit(url)
        if (parsed.scheme, parsed.netloc) != ("https", "qilylean.cn") or parsed.query or parsed.fragment:
            raise ValueError("Sitemap must contain only canonical HTTPS CN URLs")
    return urls


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals, self.robots, self.titles, self.headings = [], [], [], []
        self.in_title = self.in_h1 = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and "canonical" in attrs.get("rel", "").lower().split():
            self.canonicals.append(attrs.get("href", ""))
        if tag == "meta" and attrs.get("name", "").lower() in ("robots", "baiduspider", "bingbot", "360spider", "sogou web spider"):
            self.robots.append(attrs.get("content", ""))
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.in_h1 = True

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "h1":
            self.in_h1 = False

    def handle_data(self, text):
        if self.in_title:
            self.titles.append(text)
        if self.in_h1:
            self.headings.append(text)


def page_result(url, response):
    code, final, headers, body = response
    page = Page()
    page.feed(body)
    robots = page.robots + [value for name, value in headers.items() if name.lower() == "x-robots-tag"]
    blocked = any(re.search(r"\b(noindex|none)\b", value, re.I) for value in robots)
    passed = code == 200 and final == url and page.canonicals == [url] and not blocked
    passed = passed and bool("".join(page.titles).strip()) and bool("".join(page.headings).strip())
    return {"url": url, "http_status": code, "final_url": final, "canonical": page.canonicals,
            "title": "".join(page.titles).strip(), "indexing_blocked": blocked, "passed": bool(passed)}


def check_page(url, agent="QilyLean-CN-Search-Audit/1.0"):
    try:
        return page_result(url, request(url, agent=agent))
    except (RuntimeError, ValueError):
        return {"url": url, "passed": False, "error": "Page could not be checked"}


def audit(urls):
    print(f"Checking live discovery files and {len(urls)} canonical CN pages.", flush=True)
    checks = []
    status, _, _, body = request(f"{ORIGIN}/sitemap.xml")
    checks.append({"name": "Live sitemap matches source", "passed": status == 200 and set(sitemap_urls(body)) == set(urls)})
    status, _, _, body = request(f"{ORIGIN}/robots.txt")
    robots = urllib.robotparser.RobotFileParser()
    robots.parse(body.splitlines())
    checks.append({"name": "Robots permits all submitted URLs and advertises sitemap",
                   "passed": status == 200 and f"Sitemap: {ORIGIN}/sitemap.xml" in body
                   and all(robots.can_fetch(agent, url) for agent in AGENTS for url in urls)})
    for path in ("baidu_verify_codeva-Bp0VGliFcp.html", "googleb7a991efbed3aa8a.html", f"{INDEXNOW_KEY}.txt"):
        status, final, _, body = request(f"{ORIGIN}/{path}")
        checks.append({"name": f"Public verification file: {path}", "passed": status == 200
                       and final == f"{ORIGIN}/{path}" and body.strip() == (SITE / path).read_text().strip()})
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        pages = list(pool.map(check_page, urls))
        probes = list(pool.map(lambda agent: {"agent": agent, **check_page(f"{ORIGIN}/", agent)}, AGENTS))
    print(f"Canonical pages passed: {sum(row['passed'] for row in pages)}/{len(pages)}; UA probes passed: {sum(row['passed'] for row in probes)}/{len(probes)}.", flush=True)
    redirects = []
    for url in ("http://qilylean.cn/", "http://www.qilylean.cn/", "https://www.qilylean.cn/"):
        try:
            status, final, _, _ = request(url)
            redirects.append({"url": url, "http_status": status, "final_url": final,
                              "passed": status == 200 and final == f"{ORIGIN}/"})
        except RuntimeError:
            redirects.append({"url": url, "passed": False, "error": "Redirect could not be checked from this runner"})
    return {"passed": all(row["passed"] for row in checks + pages + probes), "checks": checks,
            "pages": pages, "crawler_user_agent_probes": probes, "redirects": redirects,
            "note": "User-agent probes do not prove visits from real search-engine crawlers."}


def submit_indexnow(urls):
    payload = {"host": "qilylean.cn", "key": INDEXNOW_KEY,
               "keyLocation": f"{ORIGIN}/{INDEXNOW_KEY}.txt", "urlList": urls}
    status, _, _, _ = request("https://api.indexnow.org/indexnow", data=json.dumps(payload).encode(),
                              content_type="application/json; charset=utf-8")
    state = {200: "received", 202: "key_validation_pending"}.get(status, "error")
    return {"state": state, "http_status": status, "url_count": len(urls),
            "note": "Receipt is not proof of indexing or ranking."}


def baidu_receipt(status, body):
    try:
        data = json.loads(body)
    except ValueError:
        return {"state": "error", "reason": "Invalid JSON response", "http_status": status}
    if not isinstance(data, dict):
        return {"state": "error", "reason": "Invalid response shape", "http_status": status}
    if "over quota" in str(data.get("message", "")).lower():
        return {"state": "quota_exhausted", "http_status": status}
    if status != 200 or data.get("error") or data.get("not_same_site") or data.get("not_valid"):
        return {"state": "error", "reason": "API rejected URL or credentials", "http_status": status}
    if type(data.get("success")) is not int or data["success"] != 1:
        return {"state": "error", "reason": "API did not confirm this URL", "http_status": status}
    remain = data.get("remain")
    return {"state": "received", "remaining_quota": remain if type(remain) is int else None}


def submit_baidu(urls, token):
    if not token:
        return {"state": "not_configured", "received_urls": [], "pending_urls": urls,
                "required_secret": "BAIDU_CN_PUSH_TOKEN"}
    endpoint = "https://data.zz.baidu.com/urls?" + urllib.parse.urlencode({"site": ORIGIN, "token": token})
    accepted = []
    last = {"state": "received"}
    for url in urls:
        try:
            code, _, _, body = request(endpoint, data=(url + "\n").encode(), content_type="text/plain")
        except RuntimeError:
            last = {"state": "uncertain", "reason": "Transport failed; inspect the platform before retrying"}
            break
        last = baidu_receipt(code, body)
        if last["state"] != "received":
            break
        accepted.append(url)
        if last.get("remaining_quota") == 0 and len(accepted) < len(urls):
            last = {**last, "state": "quota_exhausted"}
            break
    return {**last, "received_urls": accepted, "pending_urls": urls[len(accepted):],
            "note": "API receipt is not proof of indexing. No automatic retry after an uncertain POST."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--submit", choices=("none", "indexnow", "baidu", "both"), default="none")
    parser.add_argument("--baidu-start-index", type=int, default=0, help="Resume at the next_start_index in a previous Baidu receipt")
    parser.add_argument("--output-dir", type=Path, default=Path(tempfile.gettempdir()) / "cn-search-discovery")
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    urls = sitemap_urls((SITE / "sitemap.xml").read_text())
    if not 0 <= args.baidu_start_index < len(urls):
        parser.error("Baidu start index must identify an existing sitemap URL")
    token = os.environ.get("BAIDU_CN_PUSH_TOKEN", "").strip()
    report = {"checked_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(), "site": ORIGIN, "url_count": len(urls),
              "submission_mode": args.submit, "index_status": "Not checked: requires webmaster platform data",
              "engines": {"baidu": {"state": "ready_not_submitted" if token else "not_configured",
                                      "required_secret": "BAIDU_CN_PUSH_TOKEN"},
                          "indexnow": {"state": "not_requested"},
                          "360": {"state": "account_verification_pending"},
                          "sogou": {"state": "account_and_eligibility_verification_pending"}}}
    failed = False
    try:
        report["audit"] = audit(urls)
        failed = not report["audit"]["passed"]
        if not failed:
            if args.submit in ("indexnow", "both"):
                try:
                    report["engines"]["indexnow"] = submit_indexnow(urls)
                except RuntimeError:
                    report["engines"]["indexnow"] = {"state": "uncertain", "reason": "Transport failed; receipt unknown"}
            if args.submit in ("baidu", "both"):
                receipt = submit_baidu(urls[args.baidu_start_index:], token)
                receipt["next_start_index"] = args.baidu_start_index + len(receipt["received_urls"])
                report["engines"]["baidu"] = receipt
        else:
            report["submission_blocked"] = "Live audit failed; no URLs submitted"
    except (RuntimeError, ValueError, ET.ParseError):
        failed = True
        report["audit"] = {"passed": False, "error": "Discovery files could not be verified; no URLs submitted"}
    failed = failed or any(row["state"] in ("error", "uncertain") for row in report["engines"].values())
    (args.output_dir / "urls.txt").write_text("\n".join(urls) + "\n")
    (args.output_dir / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    summary = ["## QilyLean 中国站搜索接入", "", f"检查网址：{len(urls)}；抓取条件：{'通过' if report['audit']['passed'] else '未通过'}。",
               "", "| 渠道 | 本次状态 |", "| --- | --- |"]
    summary.extend(f"| {engine} | {data['state']} |" for engine, data in report["engines"].items())
    summary += ["", "received 仅代表接口接收，不代表收录或排名。模拟爬虫UA不代表搜索引擎真实到访。",
                "not_requested 代表本轮未提交；not_configured 代表缺少中国站专用凭据，未向百度发送。",
                "360、搜狗的账号验证与权限尚待后台核实；不能从网页可抓取推断已接入。"]
    if not token:
        print("::warning::Baidu CN submission is blocked: BAIDU_CN_PUSH_TOKEN is not configured.")
    for row in report.get("audit", {}).get("redirects", []):
        if not row["passed"]:
            summary.append(f"入口待复核：{row['url']}")
    summary_text = "\n".join(summary) + "\n"
    (args.output_dir / "summary.md").write_text(summary_text)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as handle:
            handle.write(summary_text)
    print(summary_text)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
