#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / 'android/qilylean-home/app/src/main/java/com/qilylean/home/MainActivity.java'
GRADLE_PATH = ROOT / 'android/qilylean-home/app/build.gradle'
README_PATH = ROOT / 'android/qilylean-home/README.md'
BUILD_WORKFLOW_PATH = ROOT / '.github/workflows/build-qilylean-home.yml'
CAPABILITIES_PATH = ROOT / 'capabilities/index.html'
TIMES_PAGE_PATH = ROOT / 'tools/times26001/index.html'
APK_NAME = 'QilyLean_Home_Universal_v2.2.apk'
SHA_FILE = ROOT / 'QilyLean_Home_Universal_v2.2.sha256.txt'


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'Missing replacement target: {label}')
    return text.replace(old, new, 1)


def prepare_source() -> None:
    source = SOURCE_PATH.read_text(encoding='utf-8')

    if 'private TextView dateView;' not in source:
        source = replace_once(
            source,
            '    private TextView clockView;\n',
            '    private TextView clockView;\n    private TextView dateView;\n',
            'dateView field',
        )

    clock_replacement = '''    private final Runnable clockTask = new Runnable() {
        @Override
        public void run() {
            Date now = new Date();

            if (clockView != null) {
                clockView.setText(new SimpleDateFormat(
                        "HH:mm:ss", Locale.CHINA).format(now));
            }

            if (dateView != null) {
                java.util.Calendar weekCalendar = java.util.Calendar.getInstance(Locale.CHINA);
                weekCalendar.setFirstDayOfWeek(java.util.Calendar.MONDAY);
                weekCalendar.setMinimalDaysInFirstWeek(4);
                weekCalendar.setTime(now);
                int weekOfYear = weekCalendar.get(java.util.Calendar.WEEK_OF_YEAR);

                String solarDate = new SimpleDateFormat(
                        "yyyy年M月d日 EEEE", Locale.CHINA).format(now);
                dateView.setText(
                        solarDate
                                + " · 第" + weekOfYear + "周"
                                + "\\n" + formatLunarDate(now));
            }

            long delay = 1000L - (System.currentTimeMillis() % 1000L);
            clockHandler.postDelayed(this, delay);
        }
    };'''
    source, count = re.subn(
        r'    private final Runnable clockTask = new Runnable\(\) \{.*?^    \};',
        lambda _match: clock_replacement,
        source,
        count=1,
        flags=re.S | re.M,
    )
    if count != 1:
        raise SystemExit('Clock task replacement failed')

    old_clock_ui = '''        clockView = text("", 32, WHITE, Gravity.CENTER);
        clockView.setTypeface(Typeface.create("sans", Typeface.NORMAL));
        clockView.setLineSpacing(dp(3), 1f);
        content.addView(clockView, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));
        clockHandler.removeCallbacks(clockTask);
        clockHandler.post(clockTask);
'''
    new_clock_ui = '''        clockView = text("", 44, WHITE, Gravity.CENTER);
        clockView.setTypeface(Typeface.create("sans", Typeface.NORMAL));
        clockView.setIncludeFontPadding(false);
        content.addView(clockView, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));

        dateView = text("", 15, GOLD, Gravity.CENTER);
        dateView.setLineSpacing(dp(3), 1.08f);
        LinearLayout.LayoutParams dateLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        dateLp.setMargins(0, dp(8), 0, 0);
        content.addView(dateView, dateLp);

        clockHandler.removeCallbacks(clockTask);
        clockHandler.post(clockTask);
'''
    source = replace_once(source, old_clock_ui, new_clock_ui, 'clock UI')

    if 'QilyLean Home v2.2' not in source:
        source = replace_once(
            source,
            'TextView version = pill("QilyLean Home v2.0 · 官网全导航通用版");',
            'TextView version = pill("QilyLean Home v2.2 · 秒级时钟＋农历＋周次");',
            'version pill',
        )

    if 'card("思大时间管理"' not in source:
        digital_section = '''        addSectionTitle(content, "数字工具直达");
        addCardRow(content,
                card("思大时间管理", "黄历、IE计时、闹钟与倒计时", new View.OnClickListener() {
                    @Override public void onClick(View v) { openTimeManager(); }
                }),
                webCard("时间工具说明", "Times26001功能与安装说明", "https://qilylean.com/tools/times26001/"));

'''
        source = replace_once(
            source,
            '        addSectionTitle(content, "系统入口");\n',
            digital_section + '        addSectionTitle(content, "系统入口");\n',
            'digital tools section',
        )

    if 'private String formatLunarDate(Date date)' not in source:
        lunar_helpers = '''    private String formatLunarDate(Date date) {
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.N) {
            return "农历日期需 Android 7.0 及以上";
        }

        android.icu.util.Calendar lunar = android.icu.util.Calendar.getInstance(
                new android.icu.util.ULocale("zh_CN@calendar=chinese"));
        lunar.setTime(date);

        int month = lunar.get(android.icu.util.Calendar.MONTH) + 1;
        int day = lunar.get(android.icu.util.Calendar.DAY_OF_MONTH);
        boolean leapMonth = lunar.get(android.icu.util.Calendar.IS_LEAP_MONTH) == 1;

        return "农历 "
                + (leapMonth ? "闰" : "")
                + formatLunarMonth(month)
                + formatLunarDay(day);
    }

    private String formatLunarMonth(int month) {
        String[] months = {
                "正月", "二月", "三月", "四月", "五月", "六月",
                "七月", "八月", "九月", "十月", "冬月", "腊月"
        };
        return month >= 1 && month <= months.length ? months[month - 1] : "";
    }

    private String formatLunarDay(int day) {
        String[] days = {
                "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
                "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
        };
        return day >= 1 && day <= days.length ? days[day - 1] : "";
    }

'''
        source = replace_once(
            source,
            '    private View webCard(String title, String subtitle, final String url) {',
            lunar_helpers + '    private View webCard(String title, String subtitle, final String url) {',
            'lunar helpers',
        )

    if 'private void openTimeManager()' not in source:
        time_manager = '''    private void openTimeManager() {
        PackageManager pm = getPackageManager();
        Intent query = new Intent(Intent.ACTION_MAIN, null);
        query.addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> apps = pm.queryIntentActivities(query, 0);

        for (ResolveInfo info : apps) {
            String label = info.loadLabel(pm).toString();
            String packageName = info.activityInfo.packageName;
            String normalizedLabel = label.toLowerCase(Locale.ROOT);
            String normalizedPackage = packageName.toLowerCase(Locale.ROOT);

            if (normalizedLabel.contains("times26001")
                    || label.contains("思大时间管理")
                    || normalizedPackage.contains("times26001")) {
                Intent launch = pm.getLaunchIntentForPackage(packageName);
                if (launch != null) {
                    startActivity(launch);
                    return;
                }
            }
        }

        Toast.makeText(this, "未检测到思大时间管理，正在打开官网安装与使用页", Toast.LENGTH_SHORT).show();
        openUrl("https://qilylean.com/tools/times26001/");
    }

'''
        source = replace_once(
            source,
            '    private void openUrl(String url) {',
            time_manager + '    private void openUrl(String url) {',
            'Times26001 launcher',
        )

    markers = [
        'HH:mm:ss',
        '第" + weekOfYear + "周',
        'zh_CN@calendar=chinese',
        'card("思大时间管理"',
        'private void openTimeManager()',
        'QilyLean Home v2.2',
    ]
    for marker in markers:
        if marker not in source:
            raise SystemExit(f'Missing Java marker: {marker}')
    SOURCE_PATH.write_text(source, encoding='utf-8')


def prepare_gradle_and_workflow() -> None:
    gradle = GRADLE_PATH.read_text(encoding='utf-8')
    gradle = re.sub(r'versionCode\s+\d+', 'versionCode 7', gradle, count=1)
    gradle = re.sub(
        r"versionName\s+'[^']+'",
        "versionName '2.2.0-clock-lunar-week-times'",
        gradle,
        count=1,
    )
    GRADLE_PATH.write_text(gradle, encoding='utf-8')

    workflow = BUILD_WORKFLOW_PATH.read_text(encoding='utf-8')
    workflow = workflow.replace('QilyLean_Home_Universal_v2.1.apk', APK_NAME)
    workflow = workflow.replace('QilyLean-Home-Universal-v2.1', 'QilyLean-Home-Universal-v2.2')
    BUILD_WORKFLOW_PATH.write_text(workflow, encoding='utf-8')


def prepare_capabilities() -> None:
    text = CAPABILITIES_PATH.read_text(encoding='utf-8')

    if '.capability-home-clock{' not in text:
        text = replace_once(
            text,
            '.capability-home-screen p{margin:7px 0 18px;color:#e9f7f4;font-weight:800}',
            '.capability-home-screen p{margin:7px 0 12px;color:#e9f7f4;font-weight:800}'
            '.capability-home-clock{color:#fff;font-size:clamp(34px,5vw,52px);font-variant-numeric:tabular-nums;letter-spacing:.04em;font-weight:850}'
            '.capability-home-date{margin:7px 0 18px;color:#ffe6a8;font-size:14px;line-height:1.65;font-weight:850}',
            'QilyLean Home website clock CSS',
        )

    text = text.replace('Android官网全导航通用版 v2.1', 'Android官网全导航通用版 v2.2')
    text = text.replace('QilyLean_Home_Universal_v2.1.apk', APK_NAME)
    text = text.replace('Android通用版 v2.1下载', 'Android通用版 v2.2下载')

    if 'capability-home-clock' not in text.split('<body', 1)[1]:
        text = replace_once(
            text,
            '<h3>QilyLean Home</h3><p>Android官网全导航通用版 v2.2</p>\n                <div class="capability-home-shortcuts">',
            '<h3>QilyLean Home</h3><p>Android官网全导航通用版 v2.2</p>\n'
            '                <div class="capability-home-clock">08:05:32</div>\n'
            '                <div class="capability-home-date">2026年8月5日 星期三 · 第32周<br>农历 六月廿三</div>\n'
            '                <div class="capability-home-shortcuts">',
            'QilyLean Home website clock mockup',
        )

    if '<span>思大时间管理</span>' not in text:
        text = replace_once(
            text,
            '<span>今日简报</span><span>系统设置</span>',
            '<span>今日简报</span><span>思大时间管理</span><span>系统设置</span>',
            'QilyLean Home Times26001 shortcut',
        )

    old_intro = '将首页、能力画像、履历主线、代表项目、改善经验、QilyLean AI、知识分享、行走印记和项目合作完整集中到手机桌面；'
    if '桌面时钟升级为“小时：分钟：秒钟”' not in text:
        text = replace_once(
            text,
            old_intro,
            '桌面时钟升级为“小时：分钟：秒钟”并按秒刷新，日期同步显示公历、星期、中国农历与年度周次；新增“思大时间管理”直达入口，已安装Times26001时直接启动，用于查看黄历、IE分段计时、闹钟和倒计时，未安装时自动进入官网安装与使用页。' + old_intro,
            'QilyLean Home v2.2 description',
        )

    text = text.replace(
        'Android通用版 v2.1｜免Root｜官网首页全导航｜重点内容直达＋通用设置＋全部应用抽屉',
        'Android通用版 v2.2｜秒级时钟｜公历＋农历＋周次｜思大时间管理直达｜免Root',
    )
    CAPABILITIES_PATH.write_text(text, encoding='utf-8')


def prepare_times_page() -> None:
    text = TIMES_PAGE_PATH.read_text(encoding='utf-8')
    note = '<br><strong>现已接入QilyLean Home v2.2，可从品牌桌面直接启动；未安装时自动进入本页。</strong>'
    if note not in text:
        text = replace_once(
            text,
            'Times26001把北京时间、万年历、闹钟响铃、秒表分段、按秒倒计时、黄历节气及数据复制整合在一个Android APP中。</p>',
            'Times26001把北京时间、万年历、闹钟响铃、秒表分段、按秒倒计时、黄历节气及数据复制整合在一个Android APP中。' + note + '</p>',
            'Times26001 QilyLean Home integration note',
        )
    TIMES_PAGE_PATH.write_text(text, encoding='utf-8')


def prepare() -> None:
    prepare_source()
    prepare_gradle_and_workflow()
    prepare_capabilities()
    prepare_times_page()
    print('QilyLean Home v2.2 source and website modules prepared.')


def finalize(apk_path: Path, sha256: str) -> None:
    if not apk_path.is_file() or apk_path.stat().st_size == 0:
        raise SystemExit(f'APK missing or empty: {apk_path}')
    if not re.fullmatch(r'[0-9a-f]{64}', sha256):
        raise SystemExit('Invalid SHA-256 value')

    short_sha = sha256[:12]
    text = CAPABILITIES_PATH.read_text(encoding='utf-8')
    text, count = re.subn(
        r'QilyLean_Home_Universal_v2\.2\.apk\?build=[0-9a-f]+',
        f'{APK_NAME}?build={short_sha}',
        text,
        count=1,
    )
    if count != 1:
        raise SystemExit('Website APK hash replacement failed')
    CAPABILITIES_PATH.write_text(text, encoding='utf-8')

    SHA_FILE.write_text(f'{sha256}  {APK_NAME}\n', encoding='utf-8')

    readme = f'''# QilyLean Home v2.2｜Android官网全导航通用版

面向常见安卓手机自主开发的免Root品牌桌面，不展示手机品牌、型号或其他设备身份信息。

## v2.2升级内容

- 桌面时钟升级为“小时：分钟：秒钟”格式，并按秒同步刷新；
- 日期同步显示公历日期、星期与年度周次；
- 同步显示中国农历月份、日期及闰月状态；
- 新增“思大时间管理”直达入口：检测到Times26001时直接启动，用于查看黄历、IE分段计时、闹钟与倒计时；未安装时自动进入官网安装与使用页；
- 保留官网首页全导航、重点内容直达、通用设置和全部应用抽屉；
- 继续采用统一Q图标，并保持免Root和设备信息保护边界。

## 发布校验

- APK：`{APK_NAME}`
- SHA-256：`{sha256}`
- 官网下载：`https://qilylean.com/{APK_NAME}`

## 安装

```bash
adb install -r {APK_NAME}
```

如旧版本与新构建签名不同：

```bash
adb uninstall com.qilylean.home
adb install {APK_NAME}
```

按Home键后选择 `QilyLean Home`，并选择“始终”。

## 回退

进入“默认桌面”切回原系统桌面，或执行：

```bash
adb uninstall com.qilylean.home
```

## 安全边界

本版本是应用层免Root定制，不读取、不展示手机品牌、型号或设备名称；不解锁Bootloader，不刷Recovery，不修改系统分区、基带、IMEI、EFS、开机动画或通信底层。
'''
    README_PATH.write_text(readme, encoding='utf-8')

    checks = {
        SOURCE_PATH: [
            'HH:mm:ss',
            'formatLunarDate(now)',
            '第" + weekOfYear + "周',
            '思大时间管理',
            'openTimeManager()',
        ],
        CAPABILITIES_PATH: [
            'Android官网全导航通用版 v2.2',
            '思大时间管理',
            APK_NAME,
            short_sha,
        ],
        TIMES_PAGE_PATH: ['现已接入QilyLean Home v2.2'],
        README_PATH: [sha256, '思大时间管理'],
    }
    for path, markers in checks.items():
        content = path.read_text(encoding='utf-8')
        for marker in markers:
            if marker not in content:
                raise SystemExit(f'Missing {marker!r} in {path.relative_to(ROOT)}')

    print(f'QilyLean Home v2.2 finalized: {sha256}')


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('prepare')
    final = sub.add_parser('finalize')
    final.add_argument('--apk', required=True)
    final.add_argument('--sha256', default=os.environ.get('HOME_SHA256', ''))
    args = parser.parse_args()

    if args.command == 'prepare':
        prepare()
    else:
        finalize((ROOT / args.apk).resolve(), args.sha256)


if __name__ == '__main__':
    main()
