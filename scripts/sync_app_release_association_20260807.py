from pathlib import Path
import json

ROOT = Path('.')
manifest = json.loads(Path('app-release-manifest.json').read_text(encoding='utf-8'))
t = manifest['apps']['times26001']
h = manifest['apps']['qilyleanHome']
email = manifest['supportEmail']
website = manifest['officialWebsite']


def update(path, replacements):
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    old = s
    for a, b in replacements:
        if a not in s:
            print(f'WARN missing pattern in {path}: {a[:90]}')
        s = s.replace(a, b)
    if s != old:
        p.write_text(s, encoding='utf-8')


# 首页数字工具卡：明确官网公开版与应用市场候选版，不再把公开APK当作“最新商店版”。
update('times26001-home-card.js', [
    (
        '形成可直接使用、可持续迭代的移动端工具；Android v1.1.4现已开放官网下载。',
        '形成可直接使用、可持续迭代的移动端工具；官网公开版 v1.1.4 可直接下载，应用市场候选版 v1.1.5 / API 36 正在发布准备。'
    ),
    (
        '<li>Android v1.1.4已开放直接下载</li>',
        '<li>官网公开版 v1.1.4｜应用市场候选 v1.1.5 / API 36</li>'
    ),
    (
        '>Android直接下载 v1.1.4</a>',
        '>官网下载公开版 v1.1.4</a>'
    ),
    (
        '<a class="secondary" href="/tools/times26001/">查看APP介绍</a>',
        '<a class="secondary" href="/tools/times26001/">查看APP介绍与发布状态</a>'
    ),
    (
        'Times26001 Android v1.1.4支持闹钟响铃、秒表分段、总时长汇总、按秒倒计时及结束响铃通知，现已开放官网直接下载。',
        'Times26001 官网公开版 v1.1.4 支持闹钟响铃、秒表分段、总时长汇总、按秒倒计时及结束响铃通知；应用市场候选版为 v1.1.5 / API 36。'
    ),
])

# Times26001独立产品页：SEO、正文、下载区、QilyLean Home关联均统一版本语义。
update('tools/times26001/index.html', [
    (
        'Android v1.1.4现已开放直接下载。',
        '官网公开版 v1.1.4 已开放直接下载；应用市场候选版 v1.1.5 / API 36 正在发布准备。'
    ),
    (
        'Android v1.1.4支持闹钟响铃、秒表分段、按秒倒计时与结束响铃通知。',
        '官网公开版 v1.1.4 可直接下载；应用市场候选版 v1.1.5 / API 36 正在发布准备。'
    ),
    (
        '<strong>现已接入QilyLean Home v2.2，可从品牌桌面直接启动；未安装时自动进入本页。</strong>',
        '<strong>现已接入官网公开版 QilyLean Home v2.2，可从品牌桌面直接启动；QilyLean Home 应用市场候选版为 v2.3.0 / API 36。</strong>'
    ),
    (
        '>Android直接下载 v1.1.4</a>',
        '>官网下载公开版 v1.1.4</a>'
    ),
    (
        '<h2>公开下载</h2><p>Android正式使用版本已开放直接下载，无须添加微信或单独索取安装包。</p>',
        '<h2>官网公开下载版</h2><p>当前官网核验公开包为 Android v1.1.4，可直接下载；应用市场候选版单独管理，避免把商店候选源码与官网公开APK混为同一版本。</p>'
    ),
    (
        '<h3>Times26001 Android v1.1.4</h3>',
        '<h3>Times26001 官网公开版 v1.1.4</h3>'
    ),
    (
        '安装包文件名：Times26001-Android-v1.1.4-IE-Stopwatch.apk。</p>',
        '安装包文件名：Times26001-Android-v1.1.4-IE-Stopwatch.apk。该文件是当前官网公开核验版，不等同于应用市场候选版。</p>'
    ),
    (
        'v1.1.4已修复倒计时无按秒显示以及闹钟、倒计时无响铃通知的问题；后续Android新版本将在本页持续更新。iPhone版本暂缓研究与发布。</div>',
        'v1.1.4已修复倒计时无按秒显示以及闹钟、倒计时无响铃通知的问题；后续Android新版本将在本页持续更新。iPhone版本暂缓研究与发布。</div><div class="tool-note"><strong>应用市场候选状态：</strong>Times26001 v1.1.5｜versionCode 8｜targetSdk 36。正式签名发布包完成后再更新为可提交商店包；开发者支持统一使用官网邮箱 admin@qilylean.com，官网 https://qilylean.com/。商店正式上架状态以对应应用市场审核结果为准。</div>'
    ),
])

# 能力画像：同一模块直接展示“官网公开版 / 商店候选版”双状态。
update('capabilities/index.html', [
    (
        '<div class="module-result">Android v1.1.4｜按秒倒计时｜闹钟与倒计时响铃通知｜分段计时与文本复制</div>',
        '<div class="module-result">官网公开版 v1.1.4｜应用市场候选版 v1.1.5 / API 36｜按秒倒计时｜闹钟与倒计时响铃通知｜分段计时与文本复制</div>'
    ),
    (
        '>Android直接下载</a>',
        '>官网下载公开版 v1.1.4</a>'
    ),
    (
        '<h3>QilyLean Home</h3><p>Android官网全导航通用版 v2.2</p>',
        '<h3>QilyLean Home</h3><p>Android 官网公开版 v2.2｜应用市场候选版 v2.3.0 / API 36</p>'
    ),
    (
        '<div class="module-result">Android通用版 v2.2｜秒级时钟｜公历＋农历＋周次｜Times26001直达｜免Root</div>',
        '<div class="module-result">官网公开版 v2.2｜应用市场候选版 v2.3.0 / API 36｜秒级时钟｜公历＋农历＋周次｜Times26001直达｜免Root</div>'
    ),
    (
        '>Android通用版 v2.2下载</a>',
        '>官网下载公开版 v2.2</a>'
    ),
])

# Times26001概览图：可视化也标注版本性质，避免图片传播后失去上下文。
update('assets/tools/times26001-overview.svg', [
    (
        '展示Times26001 Android v1.1.4的统一软件图标、北京时间、万年历、闹钟响铃、秒表计时、按秒倒计时和黄历功能。',
        '展示Times26001官网公开版 Android v1.1.4 的统一软件图标、北京时间、万年历、闹钟响铃、秒表计时、按秒倒计时和黄历功能；应用市场候选版为v1.1.5 / API 36。'
    ),
    (
        'Android v1.1.4 · 统一软件安装图标',
        '官网公开 v1.1.4 · 商店候选 v1.1.5 / API36'
    ),
])

# APP支持中心：公开说明两条版本链路和统一联系身份。
p = Path('app-support/index.html')
s = p.read_text(encoding='utf-8')
status_block = '''<section class="card"><h2>官网公开版与应用市场候选版</h2><ul><li><strong>Times26001：</strong>官网公开版 v1.1.4；应用市场候选版 v1.1.5 / targetSdk 36。</li><li><strong>QilyLean Home：</strong>官网公开版 v2.2；应用市场候选版 v2.3.0 / targetSdk 36。</li><li><strong>统一开发者支持：</strong>官网 <a href="https://qilylean.com/">https://qilylean.com/</a>；官网邮箱 <a href="mailto:admin@qilylean.com">admin@qilylean.com</a>。</li></ul><p>“官网公开版”表示当前官网提供并可核验下载的APK；“应用市场候选版”表示面向商店提交准备的源码/构建版本。未正式上架前，不把候选版描述为已上市版本。</p></section>'''
if '官网公开版与应用市场候选版' not in s:
    s = s.replace('<section class="card"><h2>版本与安全</h2>', status_block + '\n<section class="card"><h2>版本与安全</h2>')
p.write_text(s, encoding='utf-8')

# 商店资料增加版本关联状态，作为提交时的单一口径。
for path, public_v, candidate_v, package_name in [
    ('app-store/times26001/README.md', '1.1.4', '1.1.5', 'com.qilylean.times26001'),
    ('app-store/qilylean-home/README.md', '2.2', '2.3.0', 'com.qilylean.home'),
]:
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    marker = '## 0. 官网与应用市场版本关联'
    if marker not in s:
        block = f'''\n{marker}\n\n- 官网公开版：`{public_v}`\n- 应用市场候选版：`{candidate_v}` / Android API 36\n- 包名：`{package_name}`\n- 开发者支持官网：`{website}`\n- 官网邮箱：`{email}`\n- 规则：官网公开版与应用市场候选版分开管理；只有正式签名发布包完成并提交对应商店后，才更新“已上架/正式商店版”状态。\n\n'''
        s = s.replace('## 1. 商店名称与文案', block + '## 1. 商店名称与文案')
    p.write_text(s, encoding='utf-8')

# 永久审计：页面版本必须与主数据一致，且官网公开APK与校验文件必须真实存在。
audit = Path('scripts/audit-app-release-association.py')
audit.write_text('''from pathlib import Path\nimport json,sys\nm=json.loads(Path('app-release-manifest.json').read_text(encoding='utf-8'))\nerrors=[]\nfor key in ['times26001','qilyleanHome']:\n    app=m['apps'][key]\n    for field in ['apk','sha256']:\n        rel=app['publicRelease'][field].lstrip('/')\n        if not Path(rel).exists(): errors.append(f\"{key} 官网公开{field}不存在: {rel}\")\nchecks={\n 'times26001-home-card.js':['官网公开版 v1.1.4','应用市场候选版 v1.1.5 / API 36'],\n 'tools/times26001/index.html':['官网公开版 v1.1.4','应用市场候选版 v1.1.5 / API 36','admin@qilylean.com'],\n 'capabilities/index.html':['官网公开版 v1.1.4','应用市场候选版 v1.1.5 / API 36','官网公开版 v2.2','应用市场候选版 v2.3.0 / API 36'],\n 'app-support/index.html':['官网公开版 v1.1.4','应用市场候选版 v1.1.5','官网公开版 v2.2','应用市场候选版 v2.3.0','admin@qilylean.com'],\n 'app-store/times26001/README.md':['官网公开版：`1.1.4`','应用市场候选版：`1.1.5`'],\n 'app-store/qilylean-home/README.md':['官网公开版：`2.2`','应用市场候选版：`2.3.0`'],\n}\nfor path,terms in checks.items():\n    s=Path(path).read_text(encoding='utf-8')\n    for term in terms:\n        if term not in s: errors.append(f'{path} 缺关联口径: {term}')\nif errors:\n    print('\\n'.join(errors));sys.exit(1)\nprint('APP release association audit passed.')\n''', encoding='utf-8')

print('APP release association synchronized.')
