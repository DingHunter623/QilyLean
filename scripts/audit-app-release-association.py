from pathlib import Path
import hashlib
import json
import re
import sys

manifest = json.loads(Path('app-release-manifest.json').read_text(encoding='utf-8'))
errors = []

if manifest.get('officialWebsite') != 'https://qilylean.com':
    errors.append('官方网址主数据错误')
if manifest.get('supportEmail') != 'admin@qilylean.com':
    errors.append('官网邮箱主数据错误')

apps = manifest.get('apps', {})
for key in ('times26001', 'qilyleanHome'):
    if key not in apps:
        errors.append(f'主数据缺少应用: {key}')
        continue
    app = apps[key]
    public = app['publicRelease']
    latest = app['latestBuild']
    store = app['storeCandidate']
    for field in ('apk', 'sha256'):
        value = public.get(field)
        if not value or not Path(value.lstrip('/')).exists():
            errors.append(f'{key} 官网{field}不存在: {value}')
    if latest.get('targetSdk') != 36 or store.get('targetSdk') != 36:
        errors.append(f'{key} targetSdk未统一到36')

# Times26001 current-release surfaces must follow the current build from one master record.
t = apps['times26001']
t_public = t['publicRelease']
t_latest = t['latestBuild']
t_store = t['storeCandidate']
current = (t_latest.get('versionName'), t_latest.get('versionCode'))
if (t_public.get('versionName'), t_public.get('versionCode')) != current:
    errors.append('Times26001 官网下载安装包落后于最新构建')
if (t_store.get('versionName'), t_store.get('versionCode')) != current:
    errors.append('Times26001 Google Play候选落后于最新构建')
if t_public.get('targetSdk') != 36:
    errors.append('Times26001 官网包targetSdk未记录为36')
if '测试签名' not in t_public.get('status', '') or 'Google Play' not in t_public.get('status', ''):
    errors.append('Times26001 官网测试签名与Google Play签名链边界说明缺失')
if 'Upload Key' not in (t_store.get('status', '') + t_latest.get('status', '')):
    errors.append('Times26001 Google Play Upload Key状态说明缺失')
if '官方网址与官网邮箱' not in t.get('officialWebsiteLinkPolicy', ''):
    errors.append('Times26001 联系字段未统一为官方网址与官网邮箱')

validation = t.get('realDeviceValidation', {})
if (validation.get('versionName'), validation.get('versionCode'), validation.get('targetSdk')) != (
    t_latest.get('versionName'), t_latest.get('versionCode'), t_latest.get('targetSdk')
):
    errors.append('Times26001 真机验证版本未绑定到最新构建')
if 'Samsung C55' not in validation.get('device', ''):
    errors.append('Times26001 未记录三星C55真机验证')
for screenshot in validation.get('screenshots', []):
    if not Path(screenshot.lstrip('/')).exists():
        errors.append(f'Times26001 真机截图不存在: {screenshot}')

apk_path = Path(t_public['apk'].lstrip('/'))
checksum_path = Path(t_public['sha256'].lstrip('/'))
if apk_path.exists() and checksum_path.exists():
    digest = hashlib.sha256(apk_path.read_bytes()).hexdigest()
    checksum_text = checksum_path.read_text(encoding='utf-8')
    if digest not in checksum_text:
        errors.append('Times26001 官网APK SHA-256文件与实体不一致')

release_surfaces = [
    'times26001-home-card.js',
    'tools/times26001/index.html',
    'capabilities/index.html',
    'app-support/index.html',
    'app-download-share-v1.js',
    'assets/tools/times26001-overview.svg',
    'legal/times26001/privacy/index.html',
    'legal/times26001/terms/index.html',
]
stale_tokens = (
    'v1.1.13',
    'versionCode 16',
    'code16',
    'Times26001-Android-v1.1.13-Standard-Website-Logo.apk',
)
for path in release_surfaces:
    p = Path(path)
    if not p.exists():
        errors.append(f'当前发布面文件不存在: {path}')
        continue
    text = p.read_text(encoding='utf-8')
    for token in stale_tokens:
        if token in text:
            errors.append(f'{path} 仍残留旧发布口径: {token}')

privacy = Path('legal/times26001/privacy/index.html').read_text(encoding='utf-8')
for token in ('2026年8月27日', 'v1.1.14（versionCode 17 / API 36）', 'admin@qilylean.com', '不使用后台位置'):
    if token not in privacy:
        errors.append(f'Times26001隐私政策缺当前口径: {token}')

terms = Path('legal/times26001/terms/index.html').read_text(encoding='utf-8')
for token in ('2026年8月27日', 'v1.1.14（versionCode 17 / API 36）', 'admin@qilylean.com'):
    if token not in terms:
        errors.append(f'Times26001用户协议缺当前口径: {token}')

legal_css = Path('legal/app-legal.css').read_text(encoding='utf-8')
if '980px' in legal_css:
    errors.append('法律/协议共享样式仍残留980px旧版心')
for token in ('--qily-content-axis-max,1560px', 'text-decoration-skip-ink:none', 'white-space:nowrap'):
    if token not in legal_css:
        errors.append(f'法律/协议共享治理缺失: {token}')

global_links = Path('site-link-standard-v1.css').read_text(encoding='utf-8')
for token in ('a[href^="mailto:"]', 'text-decoration-skip-ink:none', 'white-space:nowrap'):
    if token not in global_links:
        errors.append(f'全站邮箱链接规范缺失: {token}')

for p in Path('legal').rglob('index.html'):
    text = p.read_text(encoding='utf-8')
    if '/legal/app-legal.css' in text and '/legal/app-legal.css?v=20260827-release-governance-v2' not in text:
        errors.append(f'法律页未同步共享样式版本: {p}')

# Visible official email addresses on active HTML surfaces must be actionable mailto links.
for p in Path('.').rglob('*.html'):
    if '.git' in p.parts or 'node_modules' in p.parts:
        continue
    text = p.read_text(encoding='utf-8', errors='ignore')
    if re.search(r'>\s*admin@qilylean\.com\s*<', text) and 'mailto:admin@qilylean.com' not in text:
        errors.append(f'页面存在未链接的官网邮箱: {p}')

# QilyLean Home keeps its own release cadence but remains protected by the same master manifest.
h = apps['qilyleanHome']
if (h['publicRelease'].get('versionName'), h['publicRelease'].get('versionCode')) != ('2.3.3', 11):
    errors.append('QilyLean Home官网安装包主数据异常')
if (h['latestBuild'].get('versionName'), h['latestBuild'].get('versionCode')) != ('2.3.3', 11):
    errors.append('QilyLean Home最新构建主数据异常')
if h['storeCandidate'].get('versionCode', 0) > h['latestBuild'].get('versionCode', 0):
    errors.append('QilyLean Home商店候选versionCode高于最新构建')

if errors:
    print('\n'.join(errors))
    sys.exit(1)

print('APP release association audit passed: current APK / store candidate / legal metadata / content axis / continuous mail underline / signing boundary are governed from current release data.')
