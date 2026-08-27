from pathlib import Path
import json
import sys

m = json.loads(Path('app-release-manifest.json').read_text(encoding='utf-8'))
errors = []

if m.get('officialWebsite') != 'https://qilylean.com':
    errors.append('官方网址主数据错误')
if m.get('supportEmail') != 'admin@qilylean.com':
    errors.append('官网邮箱主数据错误')

apps = m.get('apps', {})
for key in ['times26001', 'qilyleanHome']:
    if key not in apps:
        errors.append(f'主数据缺少应用: {key}')
        continue
    app = apps[key]
    public = app['publicRelease']
    latest = app['latestBuild']
    store = app['storeCandidate']

    for field in ['apk', 'sha256']:
        rel = public[field].lstrip('/')
        if not Path(rel).exists():
            errors.append(f'{key} 官网{field}不存在: {rel}')

    if latest.get('targetSdk') != 36 or store.get('targetSdk') != 36:
        errors.append(f'{key} targetSdk未统一到36')
    if not latest.get('versionName') or not latest.get('versionCode'):
        errors.append(f'{key} 最新构建版本字段不完整')
    if not store.get('versionName') or not store.get('versionCode'):
        errors.append(f'{key} 应用市场候选版本字段不完整')

# Times26001：官网独立分发继续使用已公开的 v1.1.13 / code16；
# Google Play 最新构建与封闭测试候选统一到 v1.1.14 / code17。
t = apps['times26001']
t_public = t['publicRelease']
t_latest = t['latestBuild']
t_store = t['storeCandidate']
if (t_public['versionName'], t_public['versionCode']) != ('1.1.13', 16):
    errors.append('times26001 官网公开包不是 v1.1.13 / versionCode 16')
if (t_store['versionName'], t_store['versionCode']) != (t_latest['versionName'], t_latest['versionCode']):
    errors.append('times26001 最新构建与 Google Play 候选版本不一致')
if (t_store['versionName'], t_store['versionCode']) != ('1.1.14', 17):
    errors.append('times26001 Google Play封闭测试候选不是 v1.1.14 / versionCode 17')
if 'Google Play' not in (t_store.get('label', '') + t_store.get('status', '')):
    errors.append('times26001 未明确 Google Play 封闭测试候选状态')
if 'Upload Key' not in (t_store.get('status', '') + t_latest.get('status', '')):
    errors.append('times26001 未明确固定 Upload Key 签名状态')
if '不作为Google Play' not in t_public.get('status', ''):
    errors.append('times26001 官网包未明确不作为 Google Play 签名基线')
if '官方网址与官网邮箱' not in t.get('officialWebsiteLinkPolicy', ''):
    errors.append('times26001 发布清单联系字段未统一为“官方网址与官网邮箱”')
validation = t.get('realDeviceValidation', {})
if validation.get('versionName') != '1.1.14' or validation.get('versionCode') != 17:
    errors.append('times26001 三星C55真机验证版本未绑定到 v1.1.14 / code17')
if 'Samsung C55' not in validation.get('device', ''):
    errors.append('times26001 未记录三星C55真机验证')
for screenshot in validation.get('screenshots', []):
    if not Path(screenshot.lstrip('/')).exists():
        errors.append(f'times26001 真机截图不存在: {screenshot}')

# QilyLean Home：官网安装包/最新构建 v2.3.3 code 11，商店候选 v2.3.2 code 10；
# 两条链路可不同，但候选不得反向高于最新构建，且签名状态必须明确。
h = apps['qilyleanHome']
h_public = h['publicRelease']
h_latest = h['latestBuild']
h_store = h['storeCandidate']
if (h_public['versionName'], h_public['versionCode']) != ('2.3.3', 11):
    errors.append('qilyleanHome 当前官网安装包不是 v2.3.3 / versionCode 11')
if (h_latest['versionName'], h_latest['versionCode']) != ('2.3.3', 11):
    errors.append('qilyleanHome 最新构建不是 v2.3.3 / versionCode 11')
if (h_store['versionName'], h_store['versionCode']) != ('2.3.2', 10):
    errors.append('qilyleanHome 应用市场候选不是 v2.3.2 / versionCode 10')
if h_store['versionCode'] > h_latest['versionCode']:
    errors.append('qilyleanHome 商店候选versionCode高于最新构建')
if '签名' not in (h_store.get('status', '') + h_latest.get('status', '')):
    errors.append('qilyleanHome 未明确签名状态')

# 关联文件按真实职责检查：官网静态下载仍守住 v1.1.13；商店资料明确 v1.1.14 候选。
checks = {
    'times26001-home-card.js': ['v1.1.13', 'versionCode 16', '查看APP介绍与发布状态'],
    'tools/times26001/index.html': ['Times26001', 'v1.1.13', 'API 36', 'admin@qilylean.com'],
    'capabilities/index.html': ['Times26001', 'QilyLean Home'],
    'app-support/index.html': ['Times26001', 'v1.1.13', 'v2.3.3', 'v2.3.2', '官方网址', '官网邮箱'],
    'app-store/times26001/README.md': ['1.1.14', 'versionCode `17`', 'Upload Key', '近似坐标', '官方网址', '三星 C55'],
    'app-store/qilylean-home/README.md': ['2.3.3', 'versionCode `11`', '2.3.2', 'versionCode `10`', '官方网址'],
    'legal/times26001/privacy/index.html': ['v1.1.13', '前台位置权限', '精确位置或粗略位置', '不使用后台位置', '官方网址、官网邮箱'],
}

for path, terms in checks.items():
    p = Path(path)
    if not p.exists():
        errors.append(f'关联文件不存在: {path}')
        continue
    s = p.read_text(encoding='utf-8')
    for term in terms:
        if term not in s:
            errors.append(f'{path} 缺关联口径: {term}')

if errors:
    print('\n'.join(errors))
    sys.exit(1)

print('APP release association audit passed: website v1.1.13 distribution / Google Play v1.1.14 closed-test candidate / signing / real-device validation / privacy / official contact naming are consistent.')
