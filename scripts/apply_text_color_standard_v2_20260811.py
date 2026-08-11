from pathlib import Path
import re

ROOT = Path('.')
CONTRAST_VERSION = '20260811-text-color-standard-v2'
NAV_VERSION = '20260811-mobile-layout-v20'

changed = []

def write_if_changed(path: Path, before: str, after: str):
    if before != after:
        path.write_text(after, encoding='utf-8')
        changed.append(str(path))

# 1) 全站文字色彩语义规范：标题、正文、辅助字、控件、深底分别管理。
p = ROOT / 'site-vi-contrast-restoration-v1.css'
s = p.read_text(encoding='utf-8')
s2 = s
s2 = s2.replace(
    '/* QilyLean 全站VI可读性恢复与对比度保险层｜2026-08-03\n * 原则：恢复既定橄榄绿／深青绿、品牌红、品牌金；深底白字，浅底深字。\n * 本文件只修复可读性、控件形态与交互辨识，不重构业务内容及页面结构。\n */',
    '/* QilyLean 全站文字色彩语义规范 V2｜2026-08-11\n * 原则：按标题、正文、辅助信息、控件、深色表面分别管理文字颜色；禁止通用 span 规则污染标题。\n * 保留既定深青绿、品牌红、品牌金；深底白字，浅底深字，并确保 PC／平板／手机一致。\n */'
)

old_root = '''  --qily-read-ink:#182420;\n  --qily-read-copy:#496565;\n  --qily-read-line:#d5e4e3;'''
new_root = '''  --qily-read-ink:#182420;\n  --qily-read-heading:#073c47;\n  --qily-read-copy:#496565;\n  --qily-read-muted:#5f7474;\n  --qily-read-accent:#93691d;\n  --qily-read-on-dark:#fff;\n  --qily-read-line:#d5e4e3;'''
if old_root in s2:
    s2 = s2.replace(old_root, new_root)
elif '--qily-read-heading:#073c47;' not in s2:
    raise SystemExit('未找到 V2 色阶变量注入锚点')

old_light = '''html body :is(.module-section,.section,.qily-ia-section,.daily-section,.content-section,.knowledge-section,.trust-card,.module-card,.card,.metric,.record,.post,.bar,.chat,.qily-modal-panel) :is(h1,h2,h3,h4,h5,h6,strong,b){\n  color:var(--qily-read-deep)!important;\n  -webkit-text-fill-color:var(--qily-read-deep)!important;\n}\nhtml body :is(.module-section,.section,.qily-ia-section,.daily-section,.content-section,.knowledge-section,.trust-card,.module-card,.card,.metric,.record,.post,.bar,.chat,.qily-modal-panel) :is(p,li,span,small,dd,figcaption,.lead,.summary,.meta,.fine){\n  color:var(--qily-read-copy)!important;\n  -webkit-text-fill-color:var(--qily-read-copy)!important;\n  opacity:1!important;\n}\n'''
new_light = '''html body :is(.module-section,.section,.qily-ia-section,.daily-section,.content-section,.knowledge-section,.trust-card,.module-card,.card,.metric,.record,.post,.bar,.chat,.qily-modal-panel) :is(h1,h2,h3,h4,h5,h6,strong,b){\n  color:var(--qily-read-heading)!important;\n  -webkit-text-fill-color:var(--qily-read-heading)!important;\n  opacity:1!important;\n}\n\n/* 正文只管理正文语义节点，不再把所有 span／small 一刀切成正文色。 */\nhtml body :is(.module-section,.section,.qily-ia-section,.daily-section,.content-section,.knowledge-section,.trust-card,.module-card,.card,.metric,.record,.post,.bar,.chat,.qily-modal-panel) :is(p,li,dd,figcaption,.lead,.summary,.description,.meta,.fine,.note){\n  color:var(--qily-read-copy)!important;\n  -webkit-text-fill-color:var(--qily-read-copy)!important;\n  opacity:1!important;\n}\n\n/* 标题内部包裹元素必须继承标题色：修复 nowrap/span 导致的局部发浅。 */\nhtml body :is(h1,h2,h3,h4,h5,h6) :is(span,strong,b,em,small),\nhtml body .qily-no-break{\n  color:inherit!important;\n  -webkit-text-fill-color:inherit!important;\n  opacity:1!important;\n  filter:none!important;\n  text-shadow:inherit!important;\n}\n\n/* 正文内部普通包裹元素继承正文，不自行建立新色阶。 */\nhtml body :is(p,li,dd,figcaption,.lead,.summary,.description,.meta,.fine,.note) :is(span,small,em){\n  color:inherit!important;\n  -webkit-text-fill-color:inherit!important;\n  opacity:1!important;\n}\n\n/* 控件内部文字继承控件自身前景色，避免按钮／链接中的 span 被正文规则覆盖。 */\nhtml body :is(a[href],button,[role="button"],[role="link"]) :is(span,strong,b,small,em){\n  color:inherit!important;\n  -webkit-text-fill-color:inherit!important;\n  opacity:1!important;\n}\n\n/* 卡片小标题／标签使用统一辅助色；主标题始终使用标题色。 */\nhtml body :is(.module-card,.paper-card,.career-full-card,.project-story,.project-list-content,.evidence-card,.qily-ia-card) > small{\n  color:var(--qily-read-muted)!important;\n  -webkit-text-fill-color:var(--qily-read-muted)!important;\n  opacity:1!important;\n}\nhtml body :is(.module-card,.paper-card,.career-full-card,.project-story,.project-list-content,.evidence-card,.qily-ia-card) :is(h2,h3,h4),\nhtml body :is(.module-card,.paper-card,.career-full-card,.project-story,.project-list-content,.evidence-card,.qily-ia-card) :is(h2,h3,h4) *{\n  color:var(--qily-read-heading)!important;\n  -webkit-text-fill-color:var(--qily-read-heading)!important;\n  opacity:1!important;\n  filter:none!important;\n}\n\n/* 结果条、重点输出属于强调信息，使用深青而不是灰化正文。 */\nhtml body :is(.module-result,.career-result,.qily-ia-result,.project-result,.result,.output){\n  color:var(--qily-read-heading)!important;\n  -webkit-text-fill-color:var(--qily-read-heading)!important;\n  opacity:1!important;\n}\n'''
if old_light in s2:
    s2 = s2.replace(old_light, new_light)
elif '标题内部包裹元素必须继承标题色' not in s2:
    raise SystemExit('未找到浅色内容文字规则，无法升级为 V2 语义色阶')

# 深色区内任何标题包裹元素与控件文字必须继续继承白／金，不被浅色规则抢回。
dark_guard = '''\n/* V2 深色表面保险：标题与正文子元素保持反白，强调信息保持浅金。 */\nhtml body :is(.module-hero,.daily-hero,.hero,.project-hero,.projects-hero,.knowledge-hero,.trust-hero,.cooperation-hero,.capability-hero,.experience-hero,.improvement-hero,.qily-ia-dark) :is(h1,h2,h3,h4,h5,h6,p,.lead,.module-lead,.summary,.subtitle) *,\nhtml body :is(.module-footer,.footer,footer) :is(p,span,strong,b,small,em){\n  color:inherit!important;\n  -webkit-text-fill-color:inherit!important;\n  opacity:1!important;\n}\n'''
if 'V2 深色表面保险' not in s2:
    s2 += dark_guard

write_if_changed(p, s, s2)

# 2) 运行层立即刷新对比度 CSS 缓存版本，构建契约同步。
p = ROOT / 'site-navigation.js'
s = p.read_text(encoding='utf-8')
s2 = re.sub(r'site-vi-contrast-restoration-v1\.css\?v=[^\'\"\s,\]]+',
            f'site-vi-contrast-restoration-v1.css?v={CONTRAST_VERSION}', s)
write_if_changed(p, s, s2)

# 3) 发布源同步新版色彩规范，并顺手封死旧导航/1800ms 首屏回退。
p = ROOT / 'scripts' / 'publish-site-system-v2.js'
s = p.read_text(encoding='utf-8')
s2 = s
s2 = re.sub(r"const NAV_VERSION = '[^']+';", f"const NAV_VERSION = '{NAV_VERSION}';", s2)
s2 = re.sub(r"const CONTRAST_VERSION = '[^']+';", f"const CONTRAST_VERSION = '{CONTRAST_VERSION}';", s2)
s2 = s2.replace('setTimeout(window.__qilyLeanRevealCurrentShell,1800)', 'setTimeout(window.__qilyLeanRevealCurrentShell,180)')
s2 = s2.replace("[contrast, 'QilyLean 全站VI可读性恢复与对比度保险层', 'Contrast restoration'],",
                "[contrast, 'QilyLean 全站文字色彩语义规范 V2', 'Text color semantic standard V2'],")
write_if_changed(p, s, s2)

# 4) 当前所有 HTML 直接引用统一刷新缓存版本；不改变页面结构和业务内容。
html_checked = 0
html_changed = 0
for p in ROOT.rglob('*.html'):
    if '.git' in p.parts or 'node_modules' in p.parts:
        continue
    s = p.read_text(encoding='utf-8')
    s2 = re.sub(r'/site-vi-contrast-restoration-v1\.css\?v=[^\'\"\s<]+',
                f'/site-vi-contrast-restoration-v1.css?v={CONTRAST_VERSION}', s)
    if 'site-vi-contrast-restoration-v1.css' in s2:
        html_checked += 1
    if s2 != s:
        p.write_text(s2, encoding='utf-8')
        changed.append(str(p))
        html_changed += 1

# 5) 强制验收：标题 span 不再被正文色污染；缓存版本、发布源、首屏策略一致。
css = (ROOT / 'site-vi-contrast-restoration-v1.css').read_text(encoding='utf-8')
nav = (ROOT / 'site-navigation.js').read_text(encoding='utf-8')
publisher = (ROOT / 'scripts' / 'publish-site-system-v2.js').read_text(encoding='utf-8')

errors = []
if 'QilyLean 全站文字色彩语义规范 V2' not in css:
    errors.append('V2 文字色彩规范标记缺失')
if ':is(p,li,span,small,dd,figcaption,.lead,.summary,.meta,.fine)' in css:
    errors.append('仍存在会污染标题 span 的旧通用颜色选择器')
if 'html body .qily-no-break{' not in css:
    errors.append('qily-no-break 标题继承保险缺失')
if '卡片小标题／标签使用统一辅助色' not in css:
    errors.append('卡片文字角色规范缺失')
if f'site-vi-contrast-restoration-v1.css?v={CONTRAST_VERSION}' not in nav:
    errors.append('site-navigation 未刷新 V2 对比度资源版本')
if '20260803-vi-contrast-hotfix-v1' in nav:
    errors.append('site-navigation 仍残留旧对比度缓存版本')
if f"const CONTRAST_VERSION = '{CONTRAST_VERSION}';" not in publisher:
    errors.append('发布源未同步 V2 对比度版本')
if f"const NAV_VERSION = '{NAV_VERSION}';" not in publisher:
    errors.append('发布源导航版本仍可能回退')
if 'setTimeout(window.__qilyLeanRevealCurrentShell,1800)' in publisher:
    errors.append('发布源仍存在 1800ms 首屏回退')
if html_checked == 0:
    errors.append('未发现直接引用对比度 CSS 的 HTML 页面')

for p in ROOT.rglob('*.html'):
    if '.git' in p.parts or 'node_modules' in p.parts:
        continue
    text = p.read_text(encoding='utf-8')
    if 'site-vi-contrast-restoration-v1.css' in text and f'/site-vi-contrast-restoration-v1.css?v={CONTRAST_VERSION}' not in text:
        errors.append(f'{p}: 对比度 CSS 仍为旧缓存版本')

if errors:
    raise SystemExit('\n'.join(errors))

print(f'Text color semantic standard V2 applied. HTML checked: {html_checked}; HTML changed: {html_changed}; total changed: {len(changed)}')
for item in changed[:80]:
    print(' -', item)
if len(changed) > 80:
    print(f' - ... and {len(changed)-80} more')
