from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import re
import sys

manifest = json.loads(Path('app-release-manifest.json').read_text(encoding='utf-8'))
errors = []

if manifest.get('officialWebsite') != 'https://qilylean.com/':
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
# The Google Play AAB remains an explicitly historical candidate, not the
# official website's latest Release-JKS APK. Treating them as interchangeable
# could corrupt the store signing chain.
if t_store.get('versionCode', 0) > t_latest.get('versionCode', 0):
    errors.append('Times26001 Google Play候选版本不应超过未提交的官网最新版本')
if t_public.get('targetSdk') != 36:
    errors.append('Times26001 官网包targetSdk未记录为36')
if 'Release JKS' not in t_public.get('status', '') or '应用市场' not in t_public.get('status', ''):
    errors.append('Times26001 官网正式签名及未上架边界说明缺失')
if 'Upload Key' not in (t_store.get('status', '') + t_latest.get('status', '')):
    errors.append('Times26001 Google Play Upload Key状态说明缺失')
if '官方网址与官网邮箱' not in t.get('officialWebsiteLinkPolicy', ''):
    errors.append('Times26001 联系字段未统一为官方网址与官网邮箱')

validation = t.get('realDeviceValidation', {})
if validation.get('versionCode') != 17 or 'Samsung C55' not in validation.get('device', ''):
    errors.append('Times26001 v1.1.14历史三星C55验收记录不可篡改')
latest_device = t.get('currentRealDeviceValidation', {})
if (latest_device.get('versionName'), latest_device.get('versionCode'), latest_device.get('targetSdk')) != (
    t_latest.get('versionName'), t_latest.get('versionCode'), t_latest.get('targetSdk')
):
    errors.append('Times26001 v1.1.15正式版真机验收与当前构建不一致')
if 'Samsung' not in latest_device.get('device', ''):
    errors.append('Times26001 最新正式版未记录三星真机验收')
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
for token in ('2026年8月27日', '2026年11月4日', 'v1.1.15（versionCode 18 / API 36）', 'admin@qilylean.com', '不使用后台位置'):
    if token not in privacy:
        errors.append(f'Times26001隐私政策缺当前口径: {token}')

terms = Path('legal/times26001/terms/index.html').read_text(encoding='utf-8')
for token in ('2026年8月27日', '2026年11月4日', 'v1.1.15（versionCode 18 / API 36）', 'admin@qilylean.com'):
    if token not in terms:
        errors.append(f'Times26001用户协议缺当前口径: {token}')

# Current legal/support documents on BOTH independently filed sites must
# advertise the actual signed APK, while preserving their original legal dates.
# Historical store-candidate screenshots remain explicitly outside this gate.
current_legal_support = (
    'legal/times26001/privacy/index.html',
    'legal/times26001/terms/index.html',
    'app-support/index.html',
    'cn-site/legal/times26001/privacy/index.html',
    'cn-site/legal/times26001/terms/index.html',
    'cn-site/app-support/index.html',
)
for path in current_legal_support:
    published = Path(path).read_text(encoding='utf-8')
    if 'v1.1.15' not in published or 'versionCode 18' not in published:
        errors.append(f'双站当前法律/支持页面版本缺失: {path}')
    if re.search(r'v1\.1\.14\s*[/（]\s*versionCode\s*17', published):
        errors.append(f'双站法律/支持页面误把历史版本写成当前版: {path}')
    marker = 'qilyCnTimesReleaseDocsViV115' if path.startswith('cn-site/') else 'qilyTimesReleaseDocsViV115'
    if marker not in published or 'max-width:1140px!important' not in published:
        errors.append(f'双站法律/支持页面视觉宽度未统一: {path}')
    if 'privacy' in path or 'terms' in path:
        if '2026年8月27日' not in published or '2026年11月4日' not in published or '<strong>修订日期：</strong>' not in published:
            errors.append(f'法律文件初始生效日/本次修订日标注不完整: {path}')
for path in ('app-support/index.html', 'cn-site/app-support/index.html'):
    published = Path(path).read_text(encoding='utf-8')
    if '+86 134-5001-4003' not in published or 'tel:+8613450014003' not in published:
        errors.append(f'双站技术支持手机号展示格式不一致: {path}')
for path in ('tools/times26001/index.html', 'app-support/index.html'):
    if '真机功能待验收' in Path(path).read_text(encoding='utf-8') or '功能仍待用户验收' in Path(path).read_text(encoding='utf-8'):
        errors.append(f'当前正式签名版仍使用过期的真机待验收文字: {path}')

# Cross-site Times26001 support cards: preserve matching content order while
# allowing local legal routes, domain, filing and the independent CN Home APK.
cn_support = Path('cn-site/app-support/index.html').read_text(encoding='utf-8')
com_support = Path('app-support/index.html').read_text(encoding='utf-8')
for token in (
    'qilyCnDualAppSupportParityV116',
    'QilyLean APP技术支持中心',
    'times-support-mirror',
    'QilyLean Home · 中国站桌面',
    'cn.qilylean.home',
    'v1.0.0 / versionCode 1',
    'v1.1.15 / versionCode 18',
    'https://qilylean.cn/',
    'href="/legal/qilylean-cn-home/privacy/"',
    'href="/legal/qilylean-cn-home/terms/"',
    '湘ICP备2026041143号-1',
):
    if token not in cn_support:
        errors.append(f'中国站双APP技术支持中心未克隆国际站内容/本地官网差异缺失: {token}')
if len(re.findall(r'<section class="card">', cn_support)) != len(re.findall(r'<section class="card">', com_support)):
    errors.append('中国站双APP技术支持中心卡片数量或顺序与国际站不一致')
if 'https://qilylean.com/' in cn_support:
    errors.append('中国站双APP技术支持中心残留国际站域名')
# Immutable SSOT parity: all international public-support content is mirrored,
# except the CN domain, independent Chinese Android launcher, legal routes,
# and their own verifiable release-channel facts.
com_main_match = re.search(r'<main class="wrap">([\s\S]*?)</main>', com_support)
cn_main_match = re.search(r'<div class="times-support-mirror"[^>]*>([\s\S]*?)</div></div></section></main>', cn_support)
if com_main_match is None or cn_main_match is None:
    errors.append('双APP支持中心正文结构不完整，无法验证国际站 SSOT')
else:
    expected = com_main_match.group(1)
    adjustments = (
        ('当前国际站正式签名验收版','当前双站官网正式签名验收版'),
        ('当前官网安装包 / 最新构建 v2.3.3 / versionCode 11 / targetSdk 36；腾讯应用宝首发候选版 v2.3.3 / versionCode 11 / targetSdk 36。',
         '中国站桌面现有可安装包 v1.0.0 / versionCode 1 / Android API 36（包名 cn.qilylean.home）；用户确认三星手机已安装并在使用。中国站与国际站 QilyLean Home 各自独立管理版本。'),
        ('/legal/qilylean-home/privacy/','/legal/qilylean-cn-home/privacy/'),
        ('/legal/qilylean-home/terms/','/legal/qilylean-cn-home/terms/'),
        ('https://qilylean.com/','https://qilylean.cn/'),
        ('<span class="pill">QilyLean Home</span>','<span class="pill">QilyLean Home · 中国站桌面</span>'),
        ('当前官网安装包、最新构建与应用市场候选状态以统一发布清单为准。','当前中国站安装包与应用市场候选状态以各自真实发布记录为准。'),
    )
    for old, new in adjustments:
        if old not in expected:
            errors.append('国际站 SSOT 支持页面基准变化，需要重新审查本地化替换: ' + old[:50])
        expected = expected.replace(old, new)
    if expected != cn_main_match.group(1):
        errors.append('双APP技术支持正文与国际站不一致（超出已批准的 CN 本地差异）')

for path in ('legal/times26001/privacy/index.html','legal/times26001/terms/index.html',
             'cn-site/legal/times26001/privacy/index.html','cn-site/legal/times26001/terms/index.html'):
    legal = Path(path).read_text(encoding='utf-8')
    if '<strong>最近修订：</strong>' in legal or '2026年11月5日' in legal:
        errors.append(f'APP法律文件存在已弃用修订口径: {path}')

# Shared legal/support visual governance: header and hero must not reuse the same horizontal flex behavior.
legal_css = Path('legal/app-legal.css').read_text(encoding='utf-8')
if '980px' in legal_css:
    errors.append('法律/协议共享样式仍残留980px旧版心')
for token in (
    '--qily-content-axis-max,1560px',
    'text-decoration-skip-ink:none',
    'white-space:nowrap',
    '.top>.top-inner',
    '.hero>.top-inner',
    'flex-direction:column!important',
    'align-items:flex-start!important',
    'justify-content:flex-start!important',
    'text-align:left!important',
    'QILY-SHARED-HERO-LEFT-AXIS:20260827',
):
    if token not in legal_css:
        errors.append(f'法律/协议共享治理缺失: {token}')

# The historical root cause was an unscoped .top-inner horizontal flex rule that affected both header and hero.
if re.search(r'(?<![>\w-])\.top-inner\s*\{[^}]*justify-content\s*:\s*space-between', legal_css):
    errors.append('共享法律样式再次出现未限定作用域的 .top-inner 横向分散布局')

# Every active shared-hero page must use the same DOM sequence: eyebrow -> h1 -> lead copy.
shared_hero_pages = [Path('app-support/index.html')] + sorted(Path('legal').rglob('index.html'))
hero_pattern = re.compile(
    r'<section\s+class="hero"[^>]*>\s*<div\s+class="top-inner"[^>]*>\s*'
    r'<span\s+class="eyebrow"[^>]*>.*?</span>\s*<h1[^>]*>.*?</h1>\s*<p[^>]*>.*?</p>',
    re.S,
)
for p in shared_hero_pages:
    text = p.read_text(encoding='utf-8', errors='ignore')
    if '<section class="hero"><div class="top-inner">' in text and not hero_pattern.search(text):
        errors.append(f'共享Hero结构未遵循眉题→H1→说明文案统一顺序: {p}')

# No legal page may introduce page-specific right-alignment hacks inside inline styles.
for p in Path('legal').rglob('index.html'):
    text = p.read_text(encoding='utf-8', errors='ignore')
    inline_styles = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', text, flags=re.S | re.I))
    risky = (
        'text-align:right',
        'text-align: right',
        'margin-left:auto',
        'margin-left: auto',
        'align-items:flex-end',
        'align-items: flex-end',
        'justify-content:flex-end',
        'justify-content: flex-end',
    )
    for token in risky:
        if token in inline_styles:
            errors.append(f'法律页存在破坏全站统一左轴的单页样式 {token}: {p}')

global_links = Path('site-link-standard-v1.css').read_text(encoding='utf-8')
for token in ('a[href^="mailto:"]', 'text-decoration-skip-ink:none', 'white-space:nowrap'):
    if token not in global_links:
        errors.append(f'全站邮箱链接规范缺失: {token}')

for p in Path('legal').rglob('index.html'):
    text = p.read_text(encoding='utf-8')
    if '/legal/app-legal.css' in text and '/legal/app-legal.css?v=20260827-release-governance-v2' not in text:
        errors.append(f'法律页未同步共享样式版本: {p}')

# International email addresses remain mailto links. The protected CN contact
# page uses its existing copy control; CN legal/support pages retain informational
# email fields and reach that control through the shared contact action.
cn_information_pages = {
    'cn-site/app-support/index.html',
    'cn-site/app-support/qilylean-cn-home/index.html',
    'cn-site/legal/times26001/privacy/index.html',
    'cn-site/legal/times26001/terms/index.html',
    'cn-site/legal/qilylean-cn-home/privacy/index.html',
    'cn-site/legal/qilylean-cn-home/terms/index.html',
}


class OfficialEmailAudit(HTMLParser):
    def __init__(self, allow_copy=False, allow_information=False):
        super().__init__()
        self.allow_copy = allow_copy
        self.allow_information = allow_information
        self.stack = []
        self.unlinked = False

    def handle_starttag(self, tag, attrs):
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append((tag, dict(attrs)))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        if 'admin@qilylean.com' not in data or any(tag in {'script', 'style'} for tag, _ in self.stack):
            return
        mailto = any(tag == 'a' and attrs.get('href') == 'mailto:admin@qilylean.com' for tag, attrs in self.stack)
        copy = self.allow_copy and any(
            tag == 'button' and attrs.get('type') == 'button'
            and attrs.get('data-qily-copy') == 'admin@qilylean.com'
            and 'qily-about-action' in attrs.get('class', '').split()
            for tag, attrs in self.stack
        )
        if not (mailto or copy or self.allow_information):
            self.unlinked = True


cn_contact = Path('cn-site/about/index.html').read_text(encoding='utf-8')
cn_copy_handler = all(token in cn_contact for token in (
    "document.querySelectorAll('.qily-about-action[data-qily-copy]')",
    "getAttribute('data-qily-copy')",
    'copyText(value)',
    'navigator.clipboard.writeText(value)',
))
cn_footer_runtime = Path('cn-site/assets/cn-footer-actions-v1.js').read_text(encoding='utf-8')
cn_contact_route = "location.href='/about/#contact'" in cn_footer_runtime
for p in Path('.').rglob('*.html'):
    if '.git' in p.parts or 'node_modules' in p.parts:
        continue
    text = p.read_text(encoding='utf-8', errors='ignore')
    allow_information = p.as_posix() in cn_information_pages and cn_copy_handler and cn_contact_route and all(token in text for token in (
        'href="https://qilylean.cn/', 'data-qily-footer-action="contact"', '/assets/cn-footer-actions-v1.js?',
    ))
    # Current CN Times26001 product page may print the verified developer
    # support address as noncommercial information next to its local support link.
    # No off-site website redirect or mailto CTA is permitted in this mirror.
    allow_information = allow_information or (
        p.as_posix() == 'cn-site/archive/tools/times26001/index.html'
        and 'href="/app-support/"' in text
        and 'https://qilylean.cn/' in text
        and '<span class="notranslate" translate="no">admin@qilylean.com</span>' in text
        and 'mailto:admin@qilylean.com' not in text
    )
    email_audit = OfficialEmailAudit(
        allow_copy=p.as_posix() == 'cn-site/about/index.html' and cn_copy_handler,
        allow_information=allow_information,
    )
    email_audit.feed(text)
    if email_audit.unlinked:
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

print('APP release association audit passed: current release data, shared 1560px axis, legal/support left-aligned hero, continuous mail underline and signing boundaries are governed consistently.')
