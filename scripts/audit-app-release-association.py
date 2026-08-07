from pathlib import Path
import json
import sys

m = json.loads(Path('app-release-manifest.json').read_text(encoding='utf-8'))
errors = []

if m.get('officialWebsite') != 'https://qilylean.com/':
    errors.append('官网主数据错误')
if m.get('supportEmail') != 'admin@qilylean.com':
    errors.append('企业邮箱主数据错误')

for key in ['times26001', 'qilyleanHome']:
    app = m['apps'][key]
    public = app['publicRelease']
    latest = app['latestBuild']
    store = app['storeCandidate']

    for field in ['apk', 'sha256']:
        rel = public[field].lstrip('/')
        if not Path(rel).exists():
            errors.append(f'{key} 历史官网{field}不存在: {rel}')

    if latest['versionName'] != store['versionName']:
        errors.append(f'{key} 最新构建与应用市场候选版本不一致')
    if latest['versionCode'] != store['versionCode']:
        errors.append(f'{key} 最新构建与应用市场候选versionCode不一致')
    if latest['targetSdk'] != 36 or store['targetSdk'] != 36:
        errors.append(f'{key} targetSdk未统一到36')
    if '旧Debug签名' not in public['label']:
        errors.append(f'{key} 历史官网包未标明旧Debug签名')
    if '生产签名' not in latest['status'] or '生产签名' not in store['status']:
        errors.append(f'{key} 未明确生产签名状态')

checks = {
    'times26001-home-card.js': ['v1.1.6', '历史官网', '生产签名'],
    'tools/times26001/index.html': ['v1.1.6', 'versionCode 9', 'API 36', 'admin@qilylean.com', '生产签名'],
    'capabilities/index.html': ['v1.1.6', 'v2.3.1', '历史官网包'],
    'app-support/index.html': ['v1.1.6', 'v2.3.1', 'admin@qilylean.com', '旧Debug签名', '生产签名'],
    'app-store/times26001/README.md': ['1.1.6', 'versionCode `9`', '旧Debug签名'],
    'app-store/qilylean-home/README.md': ['2.3.1', 'versionCode `9`', '旧Debug签名'],
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

print('APP release association audit passed: historical APK / latest build / store candidate / website / email are consistent.')
