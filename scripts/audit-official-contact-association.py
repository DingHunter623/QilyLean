from pathlib import Path
import re
import sys

errors=[]
for p in Path('.').rglob('*'):
    if not p.is_file() or p.suffix.lower() not in {'.html','.js','.css','.md','.json','.yml','.yaml','.txt'} or '.git' in p.parts:
        continue
    try:
        s=p.read_text(encoding='utf-8')
    except Exception:
        continue
    if '396767769@qq.com' in s:
        errors.append(f'旧邮箱残留: {p}')
    if 'site-interactive-hover-contrast-v1.css?v=20260805-interactive-hover-contrast-v1' in s or 'site-interactive-hover-contrast-v1.css?v=20260805-interactive-hover-contrast-v2' in s:
        errors.append(f'旧hover缓存: {p}')

app_support=Path('app-support/index.html').read_text(encoding='utf-8')
if 'admin@qilylean.com' not in app_support:
    errors.append('APP支持页缺官网邮箱')
if '<h2>官方网址与官网邮箱</h2>' not in app_support:
    errors.append('APP支持页联系模块未统一为“官方网址与官网邮箱”')
if '<strong>统一开发者支持：</strong>官方网址 <a href="https://qilylean.com">' not in app_support:
    errors.append('APP支持页统一开发者支持仍未使用“官方网址”')

if '官网邮箱</th><td class=\"qtc-state-ok\">已启用' not in Path('site-trust-conversion-v2.js').read_text(encoding='utf-8'):
    errors.append('Trust邮箱状态未同步')

core=Path('site-navigation-core.js').read_text(encoding='utf-8')
if '官方网址：https://qilylean.com' not in core:
    errors.append('核心导航/文档尾注缺官方网址标准字段')
if '<div>官网</div>' in core:
    errors.append('核心导航仍存在概述式“官网”联系标签，应统一为“官方网址”')
if '官网邮箱' not in core or 'admin@qilylean.com' not in core:
    errors.append('核心导航缺官网邮箱')

nav=Path('site-navigation.js').read_text(encoding='utf-8')
if 'qilyOfficialContactRuntime' in nav or 'qily-official-contact-runtime' in nav:
    errors.append('全站页脚存在重复官网/官网邮箱运行时行')

# R5 contact naming gate: when a URL is presented as a public contact field, use “官方网址”; email stays “官网邮箱”.
# “官网安装包 / 官网导航 / 官网主标题 / 官网回写”等表示网站或发布渠道的业务语义，不在此处做机械替换。
contact_targets = [
    Path('app-support/index.html'),
    Path('legal/times26001/privacy/index.html'),
    Path('legal/times26001/terms/index.html'),
    Path('app-store/times26001/README.md'),
    Path('app-store/qilylean-home/README.md'),
    Path('app-store/TWO_APP_STORE_RELEASE_RUNBOOK_20260808.md'),
    Path('app-store/SOFTWARE_COPYRIGHT_AND_APP_FILING_MATERIALS.md'),
    Path('app-release-manifest.json'),
    Path('.github/workflows/repack-times26001-official-email-20260814.yml'),
    Path('scripts/sync_app_release_association_20260807.py'),
    Path('scripts/correct_app_website_release_status_20260807.py'),
]
for p in contact_targets:
    if not p.exists():
        continue
    s=p.read_text(encoding='utf-8')
    checks = [
        ('官网与官网邮箱', '“官网与官网邮箱”应改为“官方网址与官网邮箱”'),
        ('官网、官网邮箱', '“官网、官网邮箱”应改为“官方网址、官网邮箱”'),
        ('开发者支持官网：', '“开发者支持官网”应改为“开发者支持官方网址”'),
        ('开发者支持官网:', '“开发者支持官网”应改为“开发者支持官方网址”'),
        ('>官网</', 'HTML联系字段仍存在单独“官网”标签'),
        ('官网：`https://qilylean.com', 'Markdown联系字段仍使用“官网”标签'),
        ('官网 `https://qilylean.com`', 'Markdown联系字段仍使用“官网”标签'),
    ]
    for needle, message in checks:
        if needle in s:
            errors.append(f'{p}: {message}')
    if re.search(r'统一开发者支持[^\n<]{0,40}官网\s*<a[^>]+href="https://qilylean\.com', s):
        errors.append(f'{p}: “统一开发者支持”网址字段必须命名为“官方网址”')

# Patch/generator source may legitimately contain an old token as the match-side of a migration.
# Verify the generated/runtime target instead of flagging the migration pattern itself.
patch=Path('scripts/sitewide_contact_core_patch_20260807.py').read_text(encoding='utf-8')
if '<div>官方网址</div>' not in patch or 'https://qilylean.com">https://qilylean.com</a>' not in patch:
    errors.append('联系核心补丁未固化“官方网址”输出')

term=Path('knowledge/terminology.html').read_text(encoding='utf-8')
sponsor=Path('knowledge/terminology-sponsor-v1.js').read_text(encoding='utf-8')
if '独立网址：在线阅览' in term or '独立网址 · 在线阅览' in term:
    errors.append('术语页仍残留独立网址/在线阅览说明')
if '独立网址：在线阅览' in sponsor or '独立网址 · 在线阅览' in sponsor:
    errors.append('Sponsor术语入口仍残留独立网址/在线阅览说明')

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print('Official contact association audit passed.')
