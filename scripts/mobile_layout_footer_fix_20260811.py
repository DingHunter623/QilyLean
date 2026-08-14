from pathlib import Path
import re

ROOT = Path('.')
NAV_VERSION = '20260811-mobile-layout-v20'
INFO_VERSION = '20260811-mobile-no-break-v3'
FOOTER_VERSION = '20260811-mobile-footer-linebreak-v34'

changed = []

def write_if_changed(path: Path, text: str, new: str):
    if new != text:
        path.write_text(new, encoding='utf-8')
        changed.append(str(path))

# 1) 能力画像｜“PMO／阶段门／横向复制”移动端保持完整词组，不再人为强制换行。
p = ROOT / 'site-information-architecture-v1.js'
s = p.read_text(encoding='utf-8')
old = "heading.innerHTML='PMO／<br><span class=\"qily-no-break\">阶段门</span>／横向复制';"
new = "heading.innerHTML='<span class=\"qily-no-break\">PMO／阶段门／横向复制</span>';"
if old not in s and new not in s:
    raise SystemExit('未找到能力画像 PMO／阶段门／横向复制 的受控换行源')
s2 = s.replace(old, new)
write_if_changed(p, s, s2)

# 2) 全站统一页脚｜手机版固定在“官方网址：”后换行。
p = ROOT / 'site-footer-standard-v28.js'
s = p.read_text(encoding='utf-8')
s2 = s
s2 = s2.replace('if (w.__qilyFooterStandardV33) return;', 'if (w.__qilyFooterStandardV34) return;')
s2 = s2.replace('w.__qilyFooterStandardV33 = true;', 'w.__qilyFooterStandardV34 = true;')
s2 = s2.replace(
    "'    <span class=\"qily-footer-v31-field\">官方网址：<a href=\"' + HOME_URL + '\">' + HOME_URL + '</a></span>',",
    "'    <span class=\"qily-footer-v31-field\">官方网址：<br class=\"qily-footer-v34-mobile-break\"><a href=\"' + HOME_URL + '\">' + HOME_URL + '</a></span>',"
)
s2 = s2.replace(
    "footer.className = 'qily-global-footer-v31 qily-global-footer-v32 qily-global-footer-v33';",
    "footer.className = 'qily-global-footer-v31 qily-global-footer-v32 qily-global-footer-v33 qily-global-footer-v34';"
)
s2 = s2.replace("footer.setAttribute('data-qily-footer-standard', 'v33');", "footer.setAttribute('data-qily-footer-standard', 'v34');")
if 'qily-footer-v34-mobile-break' not in s2:
    raise SystemExit('页脚官方网址移动端换行标记注入失败')
write_if_changed(p, s, s2)

p = ROOT / 'site-footer-standard-v28.css'
s = p.read_text(encoding='utf-8')
s2 = s
s2 = s2.replace('/* QilyLean Global Footer V33 | one authoritative two-row footer across root and nested pages */',
                '/* QilyLean Global Footer V34 | mobile website-label line break + one authoritative footer */')
s2 = s2.replace('.qily-footer-v33-legacy-hidden,', '.qily-footer-v33-legacy-hidden,\n.qily-footer-v34-legacy-hidden,')
s2 = s2.replace('#qilyGlobalFooter.qily-global-footer-v33{', '#qilyGlobalFooter.qily-global-footer-v33,\n#qilyGlobalFooter.qily-global-footer-v34{')
marker = "#qilyGlobalFooter .qily-footer-v31-contact-title{color:#fff;font-weight:850}\n"
if '.qily-footer-v34-mobile-break{display:none}' not in s2:
    if marker not in s2:
        raise SystemExit('未找到页脚 contact-title CSS 注入锚点')
    s2 = s2.replace(marker, marker + '#qilyGlobalFooter .qily-footer-v34-mobile-break{display:none}\n')
mobile_marker = "  #qilyGlobalFooter .qily-footer-v31-contact>*{display:inline}\n"
if '  #qilyGlobalFooter .qily-footer-v34-mobile-break{display:block}\n' not in s2:
    if mobile_marker not in s2:
        raise SystemExit('未找到手机版页脚 CSS 注入锚点')
    s2 = s2.replace(mobile_marker, mobile_marker + '  #qilyGlobalFooter .qily-footer-v34-mobile-break{display:block}\n')
write_if_changed(p, s, s2)

# 3) 共享导航运行层强制重新加载信息架构脚本，避免手机端旧缓存继续注入 <br>。
p = ROOT / 'site-navigation.js'
s = p.read_text(encoding='utf-8')
s2 = re.sub(r'/site-information-architecture-v1\.js\?v=[^\'\"\s<]+',
            f'/site-information-architecture-v1.js?v={INFO_VERSION}', s)
write_if_changed(p, s, s2)

# 4) 全站 HTML 统一缓存版本：导航运行层 + 页脚 CSS/JS。
html_changed = 0
footer_ref_pages = 0
for p in ROOT.rglob('*.html'):
    if '.git' in p.parts:
        continue
    s = p.read_text(encoding='utf-8')
    s2 = s
    s2 = re.sub(r'/site-navigation\.js\?v=[^\'\"\s<]+', f'/site-navigation.js?v={NAV_VERSION}', s2)
    if 'site-footer-standard-v28.css' in s2 or 'site-footer-standard-v28.js' in s2:
        footer_ref_pages += 1
    s2 = re.sub(r'/site-footer-standard-v28\.css\?v=[^\'\"\s<]+',
                f'/site-footer-standard-v28.css?v={FOOTER_VERSION}', s2)
    s2 = re.sub(r'/site-footer-standard-v28\.js\?v=[^\'\"\s<]+',
                f'/site-footer-standard-v28.js?v={FOOTER_VERSION}', s2)
    s2 = s2.replace('data-qily-footer-standard="v33"', 'data-qily-footer-standard="v34"')
    if s2 != s:
        p.write_text(s2, encoding='utf-8')
        changed.append(str(p))
        html_changed += 1

# 5) 发布前强制验收。
info = (ROOT / 'site-information-architecture-v1.js').read_text(encoding='utf-8')
footer_js = (ROOT / 'site-footer-standard-v28.js').read_text(encoding='utf-8')
footer_css = (ROOT / 'site-footer-standard-v28.css').read_text(encoding='utf-8')
nav = (ROOT / 'site-navigation.js').read_text(encoding='utf-8')

errors = []
if 'PMO／<br>' in info:
    errors.append('能力画像仍存在 PMO 后强制换行')
if '<span class="qily-no-break">PMO／阶段门／横向复制</span>' not in info:
    errors.append('能力画像完整词组 nowrap 标记缺失')
if '官方网址：<br class="qily-footer-v34-mobile-break">' not in footer_js:
    errors.append('页脚未在“官方网址：”后建立移动端受控换行')
if '#qilyGlobalFooter .qily-footer-v34-mobile-break{display:none}' not in footer_css:
    errors.append('页脚桌面端隐藏换行规则缺失')
if '#qilyGlobalFooter .qily-footer-v34-mobile-break{display:block}' not in footer_css:
    errors.append('页脚手机版换行规则缺失')
if f'/site-information-architecture-v1.js?v={INFO_VERSION}' not in nav:
    errors.append('共享导航未刷新信息架构脚本缓存版本')
if footer_ref_pages == 0:
    errors.append('未发现任何页脚公共资源引用页面')

for p in ROOT.rglob('*.html'):
    if '.git' in p.parts:
        continue
    text = p.read_text(encoding='utf-8')
    if 'site-footer-standard-v28.css' in text and f'/site-footer-standard-v28.css?v={FOOTER_VERSION}' not in text:
        errors.append(f'{p}: 页脚 CSS 仍为旧缓存版本')
    if 'site-footer-standard-v28.js' in text and f'/site-footer-standard-v28.js?v={FOOTER_VERSION}' not in text:
        errors.append(f'{p}: 页脚 JS 仍为旧缓存版本')

if errors:
    raise SystemExit('\n'.join(errors))

print(f'Mobile layout/footer patch applied. HTML changed: {html_changed}; footer pages checked: {footer_ref_pages}; total changed: {len(changed)}')
for item in changed[:60]:
    print(' -', item)
if len(changed) > 60:
    print(f' - ... and {len(changed) - 60} more')
