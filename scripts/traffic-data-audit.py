#!/usr/bin/env python3
"""Read-only PV data-quality audit; no counter writes or speculative repairs."""
import datetime as dt
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

TZ = dt.timezone(dt.timedelta(hours=8))
BASE = "https://countapi.mileshilliard.com/api/v1/get/"
SITES = {"cn": 10000, "com": 15000}

def read(key):
    req = urllib.request.Request(BASE + key, headers={"User-Agent": "QilyLean-read-only-audit/2026-11"})
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            val = json.load(response).get("value")
            if isinstance(val, bool) or not isinstance(val, (int, float)) or val < 0 or int(val) != val:
                return {"state": "invalid", "http": response.status}
            return {"state": "recorded", "http": response.status, "pv": int(val)}
    except urllib.error.HTTPError as err:
        return {"state": "missing" if err.code == 404 else "error", "http": err.code}
    except Exception as err:
        return {"state": "error", "reason": type(err).__name__}

def collect(now):
    clock = now.astimezone(TZ)
    result = {"created_at": clock.isoformat(), "timezone": "Asia/Shanghai", "sites": {}}
    for site, baseline in SITES.items():
        total = read("qilylean_%s_sitewide_pageviews_20261029" % site)
        records = []
        for delta in range(13, -1, -1):
            day = clock.date() - dt.timedelta(days=delta)
            slots = []
            for slot in range(4):
                if day == clock.date() and slot > clock.hour // 6:
                    slots.append({"state": "future"})
                else:
                    key = "qilylean_%s_pv6h_v1_%s_s%s" % (site, day.strftime("%Y%m%d"), slot)
                    slots.append(read(key))
            unknown = sum(s["state"] in ("error", "invalid", "missing") for s in slots)
            records.append({
                "date": day.isoformat(),
                "weekday": day.strftime("%A"),
                "weekend": day.weekday() >= 5,
                "slots": slots,
                "confirmed_pv": sum(s.get("pv", 0) for s in slots),
                "unknown_slots": unknown,
                "current_partial_day": day == clock.date(),
            })
        result["sites"][site] = {
            "recorded_total": total,
            "presentation_baseline_not_measured": baseline,
            "records": records,
        }
    return result

def report(data):
    cn = data["sites"]["cn"]["records"]
    com = data["sites"]["com"]["records"]
    lines = [
        "# QilyLean 双站每日 PV 数据质量核查",
        "",
        "数据来源：第三方计数服务，只读 GET；不写入、不补数、不清零。北京时间统计，PV 不等于 UV。",
        "周末和工作日单独识别；缺失时段不推断为零，今日不能与全天直接比较。",
        "",
        "| 日期 | 类型 | 中国站已记录PV | 国际站已记录PV | 数据状态 |",
        "|---|---|---:|---:|---|",
    ]
    for a, b in zip(cn, com):
        def display(d):
            return ("≥" if d["unknown_slots"] else "") + str(d["confirmed_pv"]) + ("（未完结）" if d["current_partial_day"] else "")
        note = []
        if a["unknown_slots"]: note.append("中国站%d个分桶未确定" % a["unknown_slots"])
        if b["unknown_slots"]: note.append("国际站%d个分桶未确定" % b["unknown_slots"])
        lines.append("| %s | %s | %s | %s | %s |" % (a["date"], "周末" if a["weekend"] else "工作日", display(a), display(b), "；".join(note) or "已检查全部有效时段"))
    lines.extend(["", "## 累计计数", ""])
    for site, name in (("cn", "中国站"), ("com", "国际站")):
        v = data["sites"][site]
        raw = v["recorded_total"]
        lines.append("- %s：实际记录 %s PV；另有展示基数 %d（非历史实测）；接口状态 %s" % (name, raw.get("pv", "不可用"), v["presentation_baseline_not_measured"], raw["state"]))
    lines.extend(["", "完整分桶不保证客户端捕获全部真实访问；若要证明漏报，须结合服务器日志对账。", ""])
    return "\n".join(lines)

if __name__ == "__main__":
    out = Path("traffic-audit-output")
    out.mkdir(exist_ok=True)
    data = collect(dt.datetime.now(dt.timezone.utc))
    (out / "traffic-evidence.json").write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    markdown = report(data)
    (out / "summary.md").write_text(markdown, encoding="utf-8")
    print(markdown)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as stream:
            stream.write(markdown)
