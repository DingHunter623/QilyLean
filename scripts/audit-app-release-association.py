from pathlib import Path
import json
import sys

m = json.loads(Path('app-release-manifest.json').read_text(encoding='utf-8'))
errors = []

if m.get('officialWebsite') != 'https://qilylean.com/':
    errors.append('官网主数据错误')
if m.get('supportEmail') != 'admin@qilylean.com':
    errors.append('企业邮箱主数据错误')

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

    if latest['versionName'] != store['versionName']:
        errors.append(f'{key} 最新构建与应用市场候选版本不一致')
    if latest.get('versionCode') != store.get('versionCode'):
        errors.append(f'{key} 最新构建与应用市场候选versionCode不一致')
    if latest['targetSdk'] != 36 or store['targetSdk'] != 36:
        errors.append(f'{key} targetSdk未统一到36')

# Times26001：官网独立分发与 Google Play 发布链允许版本不同，但 Play 基线必须唯一且明确。
t = apps['times26001']
t_public = t['publicRelease']
t_latest = t['latestBuild']
t_store = t['storeCandidate']
if (t_store['versionName'], t_store['versionCode']) != ('1.1.11', 14):
    errors.append('times26001 Google Play基线不是 v1.1.11 / versionCode 14')
if t_latest['versionName'] != '1.1.11' or t_latest['versionCode'] != 14:
    errors.append('times26001 最新构建不是 v1.1.11 / versionCode 14')
if 'Google Play' not in (t_store.get('label', '') + t_store.get('status', '')):
    errors.append('times26001 未明确 Google Play 首发候选状态')
if 'Upload Key' not in (t_store.get('status', '') + t_latest.get('status', '')):
    errors.append('times26001 未明确固定 Upload Key 签名状态')
if '官网' not in t_public.get('label', '') or '非Google Play' not in t_public.get('label', ''):
    errors.append('times26001 官网独立分发包与 Google Play 发布链边界不清')
if '不作为Google Play' not in t_public.get('status', ''):
    errors.append('times26001 官网包未明确不作为 Google Play 签名基线')

# QilyLean Home 尚未进入正式商店签名链，保持“待启用”状态即可，不应被 Times26001 的 Play 规则误判。
h = apps['qilyleanHome']
if (h['storeCandidate']['versionName'], h['storeCandidate']['versionCode']) != ('2.3.1', 9):
    errors.append('qilyleanHome 应用市场候选基线不是 v2.3.1 / versionCode 9')
if '签名' not in (h['storeCandidate'].get('status', '') + h['latestBuild'].get('status', '')):
    errors.append('qilyleanHome 未明确签名状态')
if '旧Debug签名' not in h['publicRelease'].get('label', ''):
    errors.append('qilyleanHome 历史官网包未标明旧Debug签名')

# 关联文件按其真实职责检查：官网页面检查官网分发口径，商店资料检查 Play 首发口径。
checks = {
    'times26001-home-card.js': ['v1.1.10', 'versionCode 13', '查看APP介绍与发布状态'],
    'tools/times26001/index.html': ['Times26001', 'v1.1.10', 'API 36', 'admin@qilylean.com'],
    'capabilities/index.html': ['Times26001', 'QilyLean Home'],
    'app-support/index.html': ['Times26001', 'admin@qilylean.com'],
    'app-store/times26001/README.md': ['1.1.11', 'versionCode `14`', 'Upload Key', '前台粗略位置'],
    'app-store/qilylean-home/README.md': ['2.3.1', 'versionCode `9`', '旧Debug签名'],
    'legal/times26001/privacy/index.html': ['V1.3', '前台粗略位置', '不使用后台位置'],
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

print('APP release association audit passed: website distribution / Google Play candidate / signing / privacy / support association are consistent.')
