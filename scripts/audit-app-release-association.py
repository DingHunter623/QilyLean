from pathlib import Path
import json,sys
m=json.loads(Path('app-release-manifest.json').read_text(encoding='utf-8'))
errors=[]
for key in ['times26001','qilyleanHome']:
    app=m['apps'][key]
    for field in ['apk','sha256']:
        rel=app['publicRelease'][field].lstrip('/')
        if not Path(rel).exists(): errors.append(f"{key} 官网公开{field}不存在: {rel}")
checks={
 'times26001-home-card.js':['官网公开版 v1.1.4','应用市场候选版 v1.1.5 / API 36'],
 'tools/times26001/index.html':['官网公开版 v1.1.4','应用市场候选版 v1.1.5 / API 36','admin@qilylean.com'],
 'capabilities/index.html':['官网公开版 v1.1.4','应用市场候选版 v1.1.5 / API 36','官网公开版 v2.2','应用市场候选版 v2.3.0 / API 36'],
 'app-support/index.html':['官网公开版 v1.1.4','应用市场候选版 v1.1.5','官网公开版 v2.2','应用市场候选版 v2.3.0','admin@qilylean.com'],
 'app-store/times26001/README.md':['官网公开版：`1.1.4`','应用市场候选版：`1.1.5`'],
 'app-store/qilylean-home/README.md':['官网公开版：`2.2`','应用市场候选版：`2.3.0`'],
}
for path,terms in checks.items():
    s=Path(path).read_text(encoding='utf-8')
    for term in terms:
        if term not in s: errors.append(f'{path} 缺关联口径: {term}')
if errors:
    print('\n'.join(errors));sys.exit(1)
print('APP release association audit passed.')
