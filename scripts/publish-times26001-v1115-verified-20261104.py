#!/usr/bin/env python3
"""Publish verified Times26001 v1.1.15 APK to INTERNATIONAL QilyLean site only.
Requires a preverified 2026-11-04 APK at repository root. No key material.
"""
from pathlib import Path
import json

OLD_APK = "Times26001-Android-v1.1.14-Standard-Website-Logo.apk"
OLD_SHA = "Times26001-Android-v1.1.14-Standard-Website-Logo.sha256.txt"
NEW_APK = "Times26001_v1.1.15_API36_website_release.apk"
NEW_SHA = "Times26001_v1.1.15_API36_website_release.sha256.txt"
NEW_BUILD = "20261104-release-v1115"
EXPECTED_SHA256 = "cf4f443e9382625a7207afc24fad129080d0b4fe73eab94ca16b98774db86606"

def change(text, old, new, label, required=True):
    if required and old not in text:
        raise SystemExit(f"Release aborted: missing expected source in {label}: {old[:80]}")
    return text.replace(old,new)

def write(path, text):
    Path(path).write_text(text, encoding="utf-8")

import hashlib
apk = Path(NEW_APK)
if not apk.is_file() or hashlib.sha256(apk.read_bytes()).hexdigest()!=EXPECTED_SHA256:
    raise SystemExit("Release aborted: APK missing or SHA-256 mismatch")
if not Path(NEW_SHA).is_file() or EXPECTED_SHA256 not in Path(NEW_SHA).read_text():
    raise SystemExit("Release aborted: SHA file missing/mismatch")

# Product page. Preserve existing VI, navigation, imagery, all unrelated content.
p="tools/times26001/index.html"
s=Path(p).read_text(encoding="utf-8")
s=change(s,OLD_APK,NEW_APK,p)
s=change(s,OLD_SHA,NEW_SHA,p)
s=change(s,"?build=20260827-v114","?build="+NEW_BUILD,p)
s=change(s,"当前手机试用版：v1.1.14 / versionCode 17 / API 36","当前官网验收版：v1.1.15 / versionCode 18 / API 36",p)
s=change(s,"立即下载 Android APK｜v1.1.14 官网标准LOGO统一修正版","下载 Android APK｜v1.1.15 正式签名验收版",p)
s=change(s,"当前可直接下载 v1.1.14 Android 官网标准LOGO统一修正版 APK。","当前可下载 v1.1.15 Android 正式签名 APK（验收版）。",p)
s=change(s,"versionCode 17 / API 36，已通过","versionCode 18 / API 36，已通过",p)
s=change(s,"当前可下载：Times26001 v1.1.14 官网标准LOGO统一修正版","当前可下载：Times26001 v1.1.15 正式签名验收版",p)
s=change(s,"Android APK，v1.1.14 / versionCode 17 / API 36。","Android APK，v1.1.15 / versionCode 18 / API 36。",p)
s=change(s,"该试用包采用测试签名；如手机已安装签名不同的旧测试版，Android可能要求先卸载旧版再安装。","本版采用与备案证书一致的正式签名，已通过自动构建、签名与完整性校验；本轮实际手机安装及功能仍待用户验收。旧测试签名不同，安装前请备份本机数据，必要时卸载旧试用版。",p)
s=change(s,"立即下载 v1.1.14 官网标准LOGO统一修正版 APK","立即下载 v1.1.15 正式签名验收版 APK",p)
s=change(s,"/app-download-share-v1.js?v=20260808-share-v1","/app-download-share-v1.js?v="+NEW_BUILD,p,required=False)
if OLD_APK in s: raise SystemExit("Old product download link remains")
write(p,s)

# Share dialog, keeping historical C55 screenshot captions explicitly at v1.1.14.
p="app-download-share-v1.js"
s=Path(p).read_text(encoding="utf-8")
s=change(s,"var TIMES_VERSION='1.1.14';","var TIMES_VERSION='1.1.15';",p)
s=change(s,"var TIMES_CODE='17';","var TIMES_CODE='18';",p)
s=change(s,OLD_APK,NEW_APK,p)
s=change(s,"?build=20260827-v114","?build="+NEW_BUILD,p)
s=change(s,"当前验证版本：v'+TIMES_VERSION+' / versionCode '+TIMES_CODE+' / API '+TIMES_TARGET+'；已完成'+TIMES_VERIFIED_DEVICES+'安装与代表性功能验证。其中'+TIMES_DEVICE+'提供实际界面截图证据。","当前官网正式签名验收版：v'+TIMES_VERSION+' / versionCode '+TIMES_CODE+' / API '+TIMES_TARGET+'；签名及元数据已通过自动校验，当前版本真机功能待用户验收。v1.1.14历史版已完成'+TIMES_VERIFIED_DEVICES+'安装验证。",p)
write(p,s)

# Homepage entry.
p="times26001-home-card.js"
s=Path(p).read_text(encoding="utf-8")
s=change(s,OLD_APK,NEW_APK,p)
s=change(s,"?build=efe5e188","?build="+NEW_BUILD,p,required=False)
s=change(s,"当前手机试用版 v1.1.14 / versionCode 17 / API 36","当前官网验收版 v1.1.15 / versionCode 18 / API 36",p)
s=change(s,"下载 v1.1.14 官网标准LOGO统一修正版","下载 v1.1.15 正式签名验收版",p)
write(p,s)

# Capabilities landing card.
p="capabilities/index.html"
s=Path(p).read_text(encoding="utf-8")
s=change(s,OLD_APK,NEW_APK,p)
s=change(s,"?build=efe5e188","?build="+NEW_BUILD,p,required=False)
s=change(s,"手机试用版：v1.1.14 / versionCode 17 / API 36","官网验收版：v1.1.15 / versionCode 18 / API 36",p)
s=change(s,"/app-download-share-v1.js?v=20260808-share-v1","/app-download-share-v1.js?v="+NEW_BUILD,p,required=False)
write(p,s)

# Support page; do not modify QilyLean Home details.
p="app-support/index.html"
s=Path(p).read_text(encoding="utf-8")
s=change(s,"当前官网试用版 v1.1.14 / versionCode 17 / targetSdk 36","当前国际站正式签名验收版 v1.1.15 / versionCode 18 / targetSdk 36（签名校验通过；本轮真机功能待验收）",p)
write(p,s)

# Release manifest SSOT: keep old real-device evidence and separate store candidate untouched.
p="app-release-manifest.json"
m=json.loads(Path(p).read_text(encoding="utf-8"))
app=m["apps"]["times26001"]
m["updatedAt"]="2026-11-04"
app["publicRelease"].update({
 "versionName":"1.1.15", "versionCode":18,"targetSdk":36,
 "apk":"/"+NEW_APK,"sha256":"/"+NEW_SHA,
 "label":"国际站正式签名 APK v1.1.15（用户验收阶段）",
 "status":"与腾讯云备案证书匹配的 Release JKS 正式签名；已通过 GitHub Actions 编译、签名验证、包信息及 SHA-256 检查；当前版本真机功能待用户验收，不代表应用商店上架"
})
app["latestBuild"].update({
 "versionName":"1.1.15","versionCode":18,"targetSdk":36,
 "label":"国际站 v1.1.15 正式签名验收版",
 "status":"2026-11-04 GitHub Actions run 41766365021 构建通过；APK SHA-256 cf4f443e9382625a7207afc24fad129080d0b4fe73eab94ca16b98774db86606。真机功能验收尚未完成。"
})
app["websiteReleaseAcceptance"]={"versionName":"1.1.15","versionCode":18,"channel":"qilylean.com-only","status":"awaiting-owner-acceptance","ciRun":"https://github.com/DingHunter623/Times26001/actions/runs/41766365021","apkSha256":EXPECTED_SHA256}
write(p,json.dumps(m,ensure_ascii=False,indent=2)+"\n")

# Assertions prevent a partial/stale-link commit. Entire group is committed only after success.
for p in ("tools/times26001/index.html","app-download-share-v1.js","times26001-home-card.js","capabilities/index.html"):
 s=Path(p).read_text(encoding="utf-8")
 if NEW_APK not in s or OLD_APK in s:
  raise SystemExit(f"Release aborted: inconsistent current download link in {p}")
if m["apps"]["qilyleanHome"]["publicRelease"]["versionName"]!="2.3.3":
 raise SystemExit("Unexpected change to unrelated product")
if Path("cn-site").exists() and any("cn-site" in p for p in (NEW_APK,NEW_SHA)):
 raise SystemExit("CN deployment boundary violated")
print("International-only v1.1.15 release source check OK; final production download and Android real-device acceptance remain.")
