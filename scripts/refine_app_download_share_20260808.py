from pathlib import Path
import qrcode
import qrcode.image.svg

ROOT = Path('.')
CSS_TAG = '<link id="qilyAppDownloadShareStylesheet" rel="stylesheet" href="/app-download-share-v1.css?v=20260808-share-v1">'
JS_TAG = '<script defer id="qilyAppDownloadShareScript" src="/app-download-share-v1.js?v=20260808-share-v1"></script>'


def add_assets(text: str) -> str:
    if CSS_TAG not in text:
        text = text.replace('</head>', f'  {CSS_TAG}\n</head>', 1)
    if JS_TAG not in text:
        text = text.replace('</body>', f'{JS_TAG}\n</body>', 1)
    return text


def replace_required(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'missing patch marker: {label}')
    return text.replace(old, new, 1)


# 1) 能力画像：删除旧版APK显性下载按钮，改为稳定下载页二维码/链接分享。
cap_path = ROOT / 'capabilities/index.html'
cap = cap_path.read_text(encoding='utf-8')
cap = add_assets(cap)
cap = replace_required(
    cap,
    '历史官网包 v1.1.4｜最新构建 / 应用市场候选 v1.1.6 / API 36｜按秒倒计时｜闹钟与倒计时响铃通知｜分段计时与文本复制',
    '当前官网APK：v1.1.4（历史归档）｜最新构建：v1.1.6 / API 36（待正式签名发布）｜按秒倒计时｜闹钟与倒计时响铃通知｜分段计时与文本复制',
    'Times26001 status copy',
)
cap = replace_required(
    cap,
    '<a class="secondary" href="/Times26001-Android-v1.1.4-IE-Stopwatch.apk?build=af47a9ec" download>历史版 v1.1.4</a>',
    '<button type="button" class="app-share-trigger" data-app-share-qr="times26001">二维码分享</button><button type="button" class="app-link-share-trigger" data-app-share-link="times26001">分享下载链接</button>',
    'Times26001 legacy button',
)
cap = replace_required(
    cap,
    'Android 历史官网包 v2.2｜最新构建 / 应用市场候选 v2.3.1 / API 36',
    'Android 当前官网APK v2.2（历史归档）｜最新构建 v2.3.1 / API 36（待正式签名）',
    'QilyLean Home visual status',
)
cap = replace_required(
    cap,
    '历史官网包 v2.2｜最新构建 / 应用市场候选 v2.3.1 / API 36｜秒级时钟｜公历＋农历＋周次｜Times26001直达｜免Root',
    '当前官网APK：v2.2（历史归档）｜最新构建：v2.3.1 / API 36（待正式签名发布）｜秒级时钟｜公历＋农历＋周次｜Times26001直达｜免Root',
    'QilyLean Home status copy',
)
cap = replace_required(
    cap,
    '<a href="/QilyLean_Home_Universal_v2.2.apk?build=19dad120e99b" download>历史版 v2.2（不建议新装）</a>',
    '<button type="button" class="app-share-trigger" data-app-share-qr="qilyleanHome">二维码分享</button><button type="button" class="app-link-share-trigger" data-app-share-link="qilyleanHome">分享下载链接</button>',
    'QilyLean Home legacy button',
)
cap_path.write_text(cap, encoding='utf-8')


# 2) Times26001独立页：旧版不再作为新装入口；分享稳定下载页。
times_path = ROOT / 'tools/times26001/index.html'
times = times_path.read_text(encoding='utf-8')
times = add_assets(times)
times = replace_required(
    times,
    '<strong>现已接入官网公开版 QilyLean Home v2.2，可从品牌桌面直接启动；QilyLean Home 应用市场候选版为 v2.3.0 / API 36。</strong>',
    '<strong>QilyLean Home 当前官网APK为 v2.2（历史归档）；最新构建为 v2.3.1 / API 36，待正式Release签名后切换官网稳定下载。</strong>',
    'Times hero QilyLean Home status',
)
times = replace_required(
    times,
    '<a class="download" href="/Times26001-Android-v1.1.4-IE-Stopwatch.apk?build=af47a9ec" download>历史版 v1.1.4（不建议新装）</a>',
    '<button type="button" class="app-share-trigger" data-app-share-qr="times26001">二维码分享</button><button type="button" class="app-link-share-trigger" data-app-share-link="times26001">分享下载链接</button>',
    'Times hero legacy button',
)
times = replace_required(
    times,
    '<section class="tool-section"><div class="tool-inner"><div class="tool-heading"><h2>Android 下载与发布状态</h2>',
    '<section class="tool-section" id="android-download"><div class="tool-inner"><div class="tool-heading"><h2>Android 下载与发布状态</h2>',
    'Times download anchor',
)
times = replace_required(
    times,
    '<div class="download-panel"><div><h3>Times26001 历史官网安装包 v1.1.4</h3><p>适用于Android手机和平板，包含时间管理、万年历、闹钟响铃、IE秒表分段、累计总时长、文本复制，以及按秒显示并在结束时响铃通知的倒计时。安装包文件名：Times26001-Android-v1.1.4-IE-Stopwatch.apk。该文件采用历史Debug签名，仅作为旧版留档，不建议新安装；不能与后续生产签名版视为同一升级链。</p></div><a href="/Times26001-Android-v1.1.4-IE-Stopwatch.apk?build=af47a9ec" download>立即下载安装包</a></div>',
    '<div class="download-panel"><div><h3>Times26001 当前官网APK v1.1.4（历史归档）</h3><p>该版本采用历史Debug签名，仅用于既有版本追溯，官网不再将其作为新安装入口。最新构建 v1.1.6 / versionCode 9 / API 36 已完成；待固定Release签名启用后，本下载页将切换为稳定正式版本，并与后续应用市场版本保持同一签名链。</p></div><div class="app-share-inline"><button type="button" class="app-share-trigger" data-app-share-qr="times26001">二维码分享</button><button type="button" class="app-link-share-trigger" data-app-share-link="times26001">分享下载链接</button></div></div>',
    'Times download panel',
)
times = replace_required(
    times,
    '<div class="tool-note"><strong>安装提示：</strong>下载完成后点击APK安装。部分Android手机首次安装时会提示“允许安装未知应用”，按系统提示授权当前浏览器或文件管理器即可。v1.1.4已修复倒计时无按秒显示以及闹钟、倒计时无响铃通知的问题；后续Android新版本将在本页持续更新。iPhone版本暂缓研究与发布。</div>',
    '<div class="tool-note"><strong>安装提示：</strong>最新版正式Release APK开放后，下载页将提供统一稳定入口；部分Android手机首次安装时会提示“允许安装未知应用”，按系统提示授权当前浏览器或文件管理器即可。历史 v1.1.4 不再作为新装推荐；iPhone版本暂缓研究与发布。</div>',
    'Times installation note',
)
times_path.write_text(times, encoding='utf-8')


# 3) 生成稳定下载页二维码；二维码指向页面入口而非具体APK文件，后续换包无需重印二维码。
qr_targets = {
    ROOT / 'assets/tools/qr-times26001-download.svg': 'https://qilylean.com/tools/times26001/#android-download',
    ROOT / 'assets/tools/qr-qilylean-home-download.svg': 'https://qilylean.com/capabilities/#digital-tools',
}
for out, url in qr_targets.items():
    out.parent.mkdir(parents=True, exist_ok=True)
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
    with out.open('wb') as f:
        image.save(f)


# 4) 验收：旧版显性下载按钮必须清零，新分享入口必须成对存在。
cap_final = cap_path.read_text(encoding='utf-8')
times_final = times_path.read_text(encoding='utf-8')
checks = [
    ('cap old QHome button removed', '历史版 v2.2（不建议新装）' not in cap_final),
    ('cap old Times button removed', '>历史版 v1.1.4</a>' not in cap_final),
    ('cap share times', 'data-app-share-qr="times26001"' in cap_final and 'data-app-share-link="times26001"' in cap_final),
    ('cap share qhome', 'data-app-share-qr="qilyleanHome"' in cap_final and 'data-app-share-link="qilyleanHome"' in cap_final),
    ('times old hero removed', '历史版 v1.1.4（不建议新装）' not in times_final),
    ('times stable anchor', 'id="android-download"' in times_final),
    ('share assets loaded cap', CSS_TAG in cap_final and JS_TAG in cap_final),
    ('share assets loaded times', CSS_TAG in times_final and JS_TAG in times_final),
    ('qr times exists', (ROOT / 'assets/tools/qr-times26001-download.svg').stat().st_size > 1000),
    ('qr qhome exists', (ROOT / 'assets/tools/qr-qilylean-home-download.svg').stat().st_size > 1000),
]
failed = [name for name, ok in checks if not ok]
if failed:
    raise SystemExit('validation failed: ' + ', '.join(failed))

print('APP download status and QR/link sharing refined successfully')
