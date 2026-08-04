#!/usr/bin/env python3
from pathlib import Path

page = Path("capabilities/index.html")
text = page.read_text(encoding="utf-8")

replacements = {
    "Android通用品牌桌面 v1.0": "Android官网全导航通用版 v2.0",
    '<div class="capability-home-shortcuts"><span>官网</span><span>QilyLean AI</span><span>代表项目</span><span>知识分享</span><span>今日简报</span><span>项目合作</span><span>系统设置</span><span>应用抽屉</span></div>': '<div class="capability-home-shortcuts"><span>首页</span><span>能力画像</span><span>履历主线</span><span>代表项目</span><span>改善经验</span><span>QilyLean AI</span><span>知识分享</span><span>行走印记</span><span>项目合作</span><span>今日简报</span><span>系统设置</span><span>应用抽屉</span></div>',
    '将官网、QilyLean AI、代表项目、知识分享、今日简报和项目合作等核心入口集中到手机桌面，并提供网络、电池、显示、声音、壁纸、应用、安全、语言与输入等通用设置入口及全部应用抽屉，便于随时进入QilyLean持续更新的全站内容与服务。': '按照QilyLean官网当前首页导航重构移动端入口，将首页、能力画像、履历主线、代表项目、改善经验、QilyLean AI、知识分享、行走印记和项目合作完整集中到手机桌面；同时保留今日简报、全站术语、友情链接等重点直达入口，并提供网络、电池、显示、声音、壁纸、应用、安全、语言与输入等通用设置及全部应用抽屉，便于随时进入QilyLean持续更新的全站内容与服务。',
    'Android通用版 v1.0｜免Root｜可设为默认桌面｜官网核心入口＋通用设置＋全部应用抽屉': 'Android通用版 v2.0｜免Root｜官网首页全导航｜重点内容直达＋通用设置＋全部应用抽屉',
    '<a href="/QilyLean_Home_Universal_v1.0.apk?build=096cf0389446627" download>Android通用版下载</a>': '<a href="/QilyLean_Home_Universal_v2.0.apk?build=dc8ba9ddff23" download>Android通用版 v2.0下载</a>',
}

changed = False
for old, new in replacements.items():
    old_count = text.count(old)
    new_count = text.count(new)
    if old_count == 1:
        text = text.replace(old, new, 1)
        changed = True
    elif old_count == 0 and new_count == 1:
        continue
    else:
        raise SystemExit(
            f"Unexpected publication state: old={old_count}, new={new_count}: {old[:90]}"
        )

if changed:
    page.write_text(text, encoding="utf-8")
    print("Updated capabilities/index.html for QilyLean Home v2.0")
else:
    print("capabilities/index.html is already current for QilyLean Home v2.0")
