from pathlib import Path
import sys
errors=[]
for p in Path('.').rglob('*'):
    if not p.is_file() or p.suffix.lower() not in {'.html','.js','.css','.md','.json','.yml','.yaml','.txt'} or '.git' in p.parts: continue
    try:s=p.read_text(encoding='utf-8')
    except Exception:continue
    if '396767769@qq.com' in s: errors.append(f'旧邮箱残留: {p}')
    if 'site-interactive-hover-contrast-v1.css?v=20260805-interactive-hover-contrast-v1' in s or 'site-interactive-hover-contrast-v1.css?v=20260805-interactive-hover-contrast-v2' in s: errors.append(f'旧hover缓存: {p}')
if 'admin@qilylean.com' not in Path('app-support/index.html').read_text(encoding='utf-8'): errors.append('APP支持页缺企业邮箱')
if '企业邮箱</th><td class=\"qtc-state-ok\">已启用' not in Path('site-trust-conversion-v2.js').read_text(encoding='utf-8'): errors.append('Trust邮箱状态未同步')

core=Path('site-navigation-core.js').read_text(encoding='utf-8')
if '官网网址：https://qilylean.com/' not in core: errors.append('核心导航/文档尾注缺官网网址标准字段')
if '企业邮箱' not in core or 'admin@qilylean.com' not in core: errors.append('核心导航缺企业邮箱')
term=Path('knowledge/terminology.html').read_text(encoding='utf-8')
if '独立网址：在线阅览' not in term: errors.append('OPL入口说明未统一')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print('Official contact association audit passed.')
