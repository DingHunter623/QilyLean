from pathlib import Path
import hashlib
import json
import re

VERSION = '1.1.14'
VERSION_CODE = 17
TARGET_SDK = 36
EFFECTIVE_DATE = '2026年8月27日'
APK_NAME = 'Times26001-Android-v1.1.14-Standard-Website-Logo.apk'
APK_SHA_FILE = 'Times26001-Android-v1.1.14-Standard-Website-Logo.sha256.txt'
APK_SHA256 = '4d92f7e09cef8fe9796a8bd19f3642161e0aeb7c8077a254a4e8f2af8691ca63'


def replace_public_release_surface(path: str) -> None:
    p = Path(path)
    if not p.exists():
        return
    text = p.read_text(encoding='utf-8')
    text = text.replace('Times26001-Android-v1.1.13-Standard-Website-Logo.apk', APK_NAME)
    text = text.replace('Times26001-Android-v1.1.13-Standard-Website-Logo.sha256.txt', APK_SHA_FILE)
    text = text.replace('v1.1.13', 'v1.1.14')
    text = text.replace('V1.1.13', 'V1.1.14')
    text = text.replace('versionCode 16', 'versionCode 17')
    text = text.replace('versionCode `16`', 'versionCode `17`')
    text = text.replace('code 16', 'code 17')
    text = text.replace('code16', 'code17')
    p.write_text(text, encoding='utf-8')


# 1) Never move website current-release metadata until the physical APK is verified.
apk = Path(APK_NAME)
if not apk.exists():
    raise SystemExit(f'missing canonical website APK: {APK_NAME}')
digest = hashlib.sha256(apk.read_bytes()).hexdigest()
if digest != APK_SHA256:
    raise SystemExit(f'website APK digest mismatch: {digest}')
Path(APK_SHA_FILE).write_text(f'{APK_SHA256}  {APK_NAME}\n', encoding='utf-8')

# 2) app-release-manifest.json is the sole current-release master record.
manifest_path = Path('app-release-manifest.json')
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
manifest['updatedAt'] = '2026-08-27'
times = manifest['apps']['times26001']
public = times['publicRelease']
public.update({
    'versionName': VERSION,
    'versionCode': VERSION_CODE,
    'targetSdk': TARGET_SDK,
    'apk': '/' + APK_NAME,
    'sha256': '/' + APK_SHA_FILE,
    'label': '当前官网安装包（v1.1.14 / code17 / API36 / QilyLean统一LOGO）',
    'status': '用于官网直接下载与试用；采用官网独立测试签名分发链，与Google Play Upload Key / Play App Signing链严格分开管理；签名不同的旧测试版可能需要卸载后安装',
})
for key in ('latestBuild', 'storeCandidate'):
    times[key]['versionName'] = VERSION
    times[key]['versionCode'] = VERSION_CODE
    times[key]['targetSdk'] = TARGET_SDK
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# 3) Synchronize current visitor-facing release surfaces. Historical CI recipes remain historical facts.
release_surfaces = [
    'times26001-home-card.js',
    'tools/times26001/index.html',
    'capabilities/index.html',
    'app-support/index.html',
    'app-download-share-v1.js',
    'assets/tools/times26001-overview.svg',
    'app-store/times26001/README.md',
]
for path in release_surfaces:
    replace_public_release_surface(path)

# Normalize current direct-download cache keys.
js = Path('app-download-share-v1.js')
if js.exists():
    text = js.read_text(encoding='utf-8')
    text = re.sub(
        r"download:'https://qilylean\.com/Times26001-Android-v1\.1\.14-Standard-Website-Logo\.apk\?build=[^']+'",
        "download:'https://qilylean.com/Times26001-Android-v1.1.14-Standard-Website-Logo.apk?build=20260827-v114'",
        text,
    )
    js.write_text(text, encoding='utf-8')

tool = Path('tools/times26001/index.html')
if tool.exists():
    text = tool.read_text(encoding='utf-8')
    text = re.sub(
        r'Times26001-Android-v1\.1\.14-Standard-Website-Logo\.apk\?build=[^"\'<> ]+',
        APK_NAME + '?build=20260827-v114',
        text,
    )
    tool.write_text(text, encoding='utf-8')

# 4) Privacy and Terms metadata move with the current release.
privacy = Path('legal/times26001/privacy/index.html')
text = privacy.read_text(encoding='utf-8')
text = text.replace('2026年8月15日', EFFECTIVE_DATE)
text = text.replace('v1.1.13（versionCode 16 / API 36）', 'v1.1.14（versionCode 17 / API 36）')
privacy.write_text(text, encoding='utf-8')

terms = Path('legal/times26001/terms/index.html')
text = terms.read_text(encoding='utf-8')
text = text.replace('2026年8月8日', EFFECTIVE_DATE)
text = text.replace('<strong>版本：</strong>V1.1', '<strong>版本：</strong>v1.1.14（versionCode 17 / API 36）')
text = text.replace('<strong>版本：</strong> V1.1', '<strong>版本：</strong> v1.1.14（versionCode 17 / API 36）')
terms.write_text(text, encoding='utf-8')

# 5) Every shared legal page uses one current stylesheet cache key.
for p in Path('legal').rglob('index.html'):
    text = p.read_text(encoding='utf-8')
    if '/legal/app-legal.css' in text:
        text = re.sub(
            r'/legal/app-legal\.css\?v=[^"\']+',
            '/legal/app-legal.css?v=20260827-release-governance-v2',
            text,
        )
        p.write_text(text, encoding='utf-8')

# 6) Remove the obsolete 980px legal-page island and inherit the site-wide 1560px axis.
legal_css_path = Path('legal/app-legal.css')
css = legal_css_path.read_text(encoding='utf-8')
css = css.replace(
    '.top-inner,.wrap{width:min(980px,calc(100% - 36px));margin:auto}',
    '.top-inner,.wrap{width:calc(100% - (2 * var(--qily-content-axis-gutter,clamp(18px,3vw,48px))));max-width:var(--qily-content-axis-max,1560px);margin-inline:auto}',
)
legal_marker = '/* QILY-LEGAL-AXIS-CONTACT-GOVERNANCE:20260827 */'
if legal_marker not in css:
    css += (
        '\n' + legal_marker + '\n'
        'a[href^="mailto:"]{text-decoration-line:underline!important;text-decoration-style:solid!important;'
        'text-decoration-thickness:1px!important;text-underline-offset:3px!important;'
        'text-decoration-skip-ink:none!important;white-space:nowrap!important;word-break:normal!important;overflow-wrap:normal!important}\n'
    )
legal_css_path.write_text(css, encoding='utf-8')

# 7) Whole-site email addresses use a continuous underline and do not split mid-address.
link_css_path = Path('site-link-standard-v1.css')
css = link_css_path.read_text(encoding='utf-8')
mail_marker = '/* QILY-MAILTO-CONTINUOUS-UNDERLINE:20260827 */'
if mail_marker not in css:
    css += (
        '\n' + mail_marker + '\n'
        'a[href^="mailto:"]{text-decoration-line:underline!important;text-decoration-style:solid!important;'
        'text-decoration-thickness:1px!important;text-underline-offset:3px!important;'
        'text-decoration-skip-ink:none!important;white-space:nowrap!important;word-break:normal!important;overflow-wrap:normal!important}\n'
    )
link_css_path.write_text(css, encoding='utf-8')

print('Times26001 site release governance remediation applied.')
