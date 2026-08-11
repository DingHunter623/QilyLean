#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260811-hero-summary-relocation-v3"

SUMMARY = '''<!-- QILY-HOME-HERO-SUMMARY:START -->
<div class="portrait-badge hero-summary-strip" data-qily-hero-summary="v3" aria-label="专业实践与合作机制摘要">
  <div><strong>20年</strong><span>制造工程与精益改善实践</span></div>
  <div><strong>合同闭环</strong><span>范围、交付、付款与验收分阶段明确</span></div>
</div>
<!-- QILY-HOME-HERO-SUMMARY:END -->'''

CSS = r'''/* QilyLean 首页 Hero 摘要条布局 V3｜2026-08-11
 * PC：摘要从人物图底部移至左侧 CTA 下方，人物图恢复纯净展示。
 * Tablet/Mobile：摘要自动降为单列，避免人物图和文字信息互相挤压。
 */
body:is(.qily-home-commercial-focus,.qily-home-balanced) .hero-summary-strip{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:12px!important;
  width:min(760px,100%)!important;
  margin:18px 0 0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
  overflow:visible!important;
}
body:is(.qily-home-commercial-focus,.qily-home-balanced) .hero-summary-strip>div{
  display:grid!important;
  grid-template-columns:auto minmax(0,1fr)!important;
  align-items:center!important;
  gap:10px!important;
  min-width:0!important;
  min-height:64px!important;
  padding:11px 14px!important;
  border:1px solid rgba(255,232,173,.34)!important;
  border-radius:14px!important;
  background:rgba(255,255,255,.08)!important;
  box-shadow:0 8px 24px rgba(5,42,51,.10)!important;
  backdrop-filter:blur(8px)!important;
}
body:is(.qily-home-commercial-focus,.qily-home-balanced) .hero-summary-strip strong{
  display:block!important;
  margin:0!important;
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  font-size:20px!important;
  font-weight:950!important;
  line-height:1.18!important;
  white-space:nowrap!important;
  opacity:1!important;
}
body:is(.qily-home-commercial-focus,.qily-home-balanced) .hero-summary-strip span{
  display:block!important;
  min-width:0!important;
  margin:0!important;
  color:#e2f2ef!important;
  -webkit-text-fill-color:#e2f2ef!important;
  font-size:14px!important;
  font-weight:720!important;
  line-height:1.48!important;
  letter-spacing:0!important;
  white-space:normal!important;
  word-break:normal!important;
  overflow-wrap:break-word!important;
  opacity:1!important;
}
/* 防止旧 DOM / 旧缓存短暂把摘要继续挂在人物图下方。 */
body:is(.qily-home-commercial-focus,.qily-home-balanced) .portrait-frame>.portrait-badge{
  display:none!important;
}
body:is(.qily-home-commercial-focus,.qily-home-balanced) .portrait-frame{
  overflow:hidden!important;
}
@media(max-width:1120px){
  body:is(.qily-home-commercial-focus,.qily-home-balanced) .hero-summary-strip{
    width:100%!important;
  }
}
@media(max-width:820px){
  body:is(.qily-home-commercial-focus,.qily-home-balanced) .hero-summary-strip{
    grid-template-columns:1fr!important;
    gap:10px!important;
    margin-top:15px!important;
  }
  body:is(.qily-home-commercial-focus,.qily-home-balanced) .hero-summary-strip>div{
    min-height:56px!important;
    padding:10px 12px!important;
  }
  body:is(.qily-home-commercial-focus,.qily-home-balanced) .portrait-frame{
    width:min(430px,100%)!important;
    margin:20px auto 0!important;
  }
}
@media(max-width:520px){
  body:is(.qily-home-commercial-focus,.qily-home-balanced) .hero-summary-strip>div{
    grid-template-columns:1fr!important;
    gap:4px!important;
    align-items:start!important;
  }
  body:is(.qily-home-commercial-focus,.qily-home-balanced) .hero-summary-strip strong{
    font-size:18px!important;
  }
  body:is(.qily-home-commercial-focus,.qily-home-balanced) .hero-summary-strip span{
    font-size:13.5px!important;
    line-height:1.5!important;
  }
}
'''

def read(path):
    return (ROOT / path).read_text(encoding='utf-8')

def write(path, text):
    p = ROOT / path
    if not text.endswith('\n'):
        text += '\n'
    old = p.read_text(encoding='utf-8') if p.exists() else None
    if old == text:
        return False
    p.write_text(text, encoding='utf-8')
    return True

def patch_index(text):
    # Remove any previously materialized V3 summary block, then remove legacy portrait figcaption.
    text = re.sub(r'\s*<!-- QILY-HOME-HERO-SUMMARY:START -->[\s\S]*?<!-- QILY-HOME-HERO-SUMMARY:END -->\s*', '\n', text, count=1)
    text = re.sub(r'\s*<figcaption class="portrait-badge">[\s\S]*?</figcaption>\s*', '\n', text, count=1)
    # Insert summary directly after the first Hero CTA actions block.
    m = re.search(r'<div class="actions">[\s\S]*?</div>', text)
    if not m:
        raise RuntimeError('Homepage Hero actions block not found')
    text = text[:m.end()] + '\n' + SUMMARY + text[m.end():]
    text = re.sub(r'home-portrait-badge-fix-v1\.css\?v=[^"\']+', f'home-portrait-badge-fix-v1.css?v={VERSION}', text)
    return text

def patch_ia_js(text):
    old = re.compile(r"    var portraitBadge=homeHero\.querySelector\('\.portrait-badge'\);\n    if\(portraitBadge\)\{\n      portraitBadge\.innerHTML='[^']*';\n    \}", re.M)
    new = """    var portraitBadge=homeHero.querySelector('.portrait-badge');
    if(portraitBadge){
      portraitBadge.classList.add('hero-summary-strip');
      portraitBadge.setAttribute('data-qily-hero-summary','v3');
      portraitBadge.setAttribute('aria-label','专业实践与合作机制摘要');
      portraitBadge.innerHTML='<div><strong>20年</strong><span>制造工程与精益改善实践</span></div><div><strong>合同闭环</strong><span>范围、交付、付款与验收分阶段明确</span></div>';
      if(actionBox&&actionBox.parentNode&&portraitBadge!==actionBox.nextElementSibling){
        actionBox.parentNode.insertBefore(portraitBadge,actionBox.nextSibling);
      }
    }"""
    text, count = old.subn(new, text, count=1)
    if count != 1:
        raise RuntimeError('IA portraitBadge source block not found')
    return text

def patch_materializer(text):
    old_line = "  html = html.replace(/<figcaption class=\\\"portrait-badge\\\">[\\s\\S]*?<\\/figcaption>/m, '<figcaption class=\\\"portrait-badge\\\"><div><strong>20年</strong><span>制造工程与精益改善实践</span></div><div><strong>合同闭环</strong><span>范围、交付、付款与验收分阶段明确</span></div></figcaption>');"
    if old_line not in text:
        # Accept current source variant with regular quote escaping.
        candidates = [line for line in text.splitlines() if 'figcaption class=\\"portrait-badge\\"' in line and '合同闭环' in line]
        if not candidates:
            raise RuntimeError('Static materializer portrait badge line not found')
        old_line = candidates[0]
    new_lines = """  const heroSummary = `<!-- QILY-HOME-HERO-SUMMARY:START -->
<div class=\"portrait-badge hero-summary-strip\" data-qily-hero-summary=\"v3\" aria-label=\"专业实践与合作机制摘要\">
  <div><strong>20年</strong><span>制造工程与精益改善实践</span></div>
  <div><strong>合同闭环</strong><span>范围、交付、付款与验收分阶段明确</span></div>
</div>
<!-- QILY-HOME-HERO-SUMMARY:END -->`;
  html = html.replace(/\\s*<!-- QILY-HOME-HERO-SUMMARY:START -->[\\s\\S]*?<!-- QILY-HOME-HERO-SUMMARY:END -->\\s*/m, '\\n');
  html = html.replace(/\\s*<figcaption class=\"portrait-badge\">[\\s\\S]*?<\\/figcaption>\\s*/m, '\\n');
  html = html.replace(/(<div class=\"actions\">[\\s\\S]*?<\\/div>)/m, `$1\\n${heroSummary}`);"""
    text = text.replace(old_line, new_lines)
    return text

def patch_versions(text):
    return re.sub(r'home-portrait-badge-fix-v1\.css\?v=[^\'"\s]+', f'home-portrait-badge-fix-v1.css?v={VERSION}', text)

changed = []
if write('home-portrait-badge-fix-v1.css', CSS): changed.append('home-portrait-badge-fix-v1.css')

index = read('index.html')
index2 = patch_index(index)
if write('index.html', index2): changed.append('index.html')

ia = read('site-information-architecture-v1.js')
ia2 = patch_ia_js(ia)
if write('site-information-architecture-v1.js', ia2): changed.append('site-information-architecture-v1.js')

materializer = read('scripts/materialize-static-core-pages.js')
materializer2 = patch_materializer(materializer)
if write('scripts/materialize-static-core-pages.js', materializer2): changed.append('scripts/materialize-static-core-pages.js')

for path in ['site-navigation.js', 'scripts/publish-global-link-standard.js']:
    src = read(path)
    dst = patch_versions(src)
    if write(path, dst): changed.append(path)

# Validation: structural and regression checks.
final_index = read('index.html')
if final_index.count('data-qily-hero-summary="v3"') != 1:
    raise RuntimeError('Homepage summary must exist exactly once')
if re.search(r'<figcaption class="portrait-badge">', final_index):
    raise RuntimeError('Legacy portrait badge still present inside portrait frame')
if f'home-portrait-badge-fix-v1.css?v={VERSION}' not in final_index:
    raise RuntimeError('Homepage summary CSS cache version not refreshed')
final_ia = read('site-information-architecture-v1.js')
if "actionBox.parentNode.insertBefore(portraitBadge,actionBox.nextSibling)" not in final_ia:
    raise RuntimeError('Runtime relocation logic missing')
final_materializer = read('scripts/materialize-static-core-pages.js')
if 'QILY-HOME-HERO-SUMMARY:START' not in final_materializer or 'heroSummary' not in final_materializer:
    raise RuntimeError('Static materializer summary source missing')

print('Relocated homepage Hero summary:', ', '.join(changed) if changed else 'no file changes')
