#!/usr/bin/env python3
from pathlib import Path
import hashlib
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
EMAIL = 'admin@qilylean.com'
SITE = 'https://qilylean.com'
VERSION = '20260807-sitewide-closure-v4'

TEXT_EXT = {'.html','.htm','.js','.css','.json','.md','.txt','.xml','.yml','.yaml','.toml'}
BINARY_EXT = {'.png','.jpg','.jpeg','.webp','.gif','.svg','.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.mp3','.mp4','.mov','.apk','.aab','.zip','.7z','.rar'}

changed = []
removed = []
stamped_pdfs = []
term_pages = []


def read(path):
    return path.read_text('utf-8')


def write_if_changed(path, text):
    old = read(path)
    if old != text:
        path.write_text(text, 'utf-8')
        changed.append(path.as_posix())


def tracked_files(pattern=None):
    args = ['git','ls-files','-z']
    if pattern:
        args.append(pattern)
    raw = subprocess.check_output(args, cwd=ROOT).split(b'\0')
    return [ROOT / x.decode('utf-8', errors='surrogateescape') for x in raw if x]


# A. 全站跳转首屏：取消最多5秒的正文隐藏，保留极短视觉保护但正文始终可见。
for path in tracked_files('*.html'):
    try:
        s = read(path)
    except Exception:
        continue
    old = s
    s = s.replace('html.qily-first-paint-pending body{visibility:hidden!important}',
                  'html.qily-first-paint-pending body{visibility:visible!important}')
    s = s.replace('w.setTimeout(w.__qilyLeanRevealCurrentShell,5000)',
                  'w.setTimeout(w.__qilyLeanRevealCurrentShell,180)')
    s = re.sub(r'/site-navigation\.js\?v=[^\"\'\s<]+', f'/site-navigation.js?v={VERSION}', s)
    if s != old:
        path.write_text(s, 'utf-8')
        changed.append(path.relative_to(ROOT).as_posix())

# B. 术语单点培训：企业邮箱 + 恢复下载/保存PDF能力。
for path in sorted((ROOT / 'knowledge' / 'terminology').glob('*.html')):
    s = read(path)
    old = s
    # 旧规则曾显式禁止打印；现在恢复为可打印/保存PDF。
    s = re.sub(r'@media\s+print\s*\{\s*body\s*\{\s*display\s*:\s*none\s*!important\s*;?\s*\}\s*\}',
               '@media print{body{display:block!important;background:#fff!important}.qily-site-header,.qily-float-dock,.qily-global-contact-footer{display:none!important}}', s)
    # 统一补充样式。
    if 'qily-term-enterprise-contact' not in s:
        style = '''\n<style id="qily-term-enterprise-contact">\n.qily-term-enterprise-contact{margin-top:8px;font-weight:850;color:#0f4b5a}.qily-term-enterprise-contact a{color:#0f4b5a;text-underline-offset:.18em}.qily-term-pdf-action{display:inline-flex;align-items:center;justify-content:center;margin-top:10px;min-height:38px;padding:7px 14px;border:1px solid #0f4b5a;border-radius:999px;background:#0f4b5a;color:#fff!important;font:inherit;font-weight:900;cursor:pointer}@media print{.qily-term-pdf-action{display:none!important}}\n</style>\n'''
        s = s.replace('</head>', style + '</head>', 1)
    if 'class="qily-term-enterprise-contact"' not in s:
        contact = f'<div class="qily-term-enterprise-contact">企业邮箱：<a href="mailto:{EMAIL}">{EMAIL}</a></div><button class="qily-term-pdf-action" type="button" onclick="window.print()">下载 / 保存PDF</button>'
        # 优先放在术语培训页现有 footer 内；结构异常时放在 body 末尾。
        m = re.search(r'<div\s+class=["\']footer["\'][^>]*>', s, flags=re.I)
        if m:
            close = s.find('</div>', m.end())
            if close != -1:
                s = s[:close] + contact + s[close:]
            else:
                s = s.replace('</body>', contact + '</body>', 1)
        else:
            s = s.replace('</body>', contact + '</body>', 1)
    if s != old:
        path.write_text(s, 'utf-8')
        changed.append(path.relative_to(ROOT).as_posix())
    term_pages.append(path.relative_to(ROOT).as_posix())

# C. 全局导航/悬浮模块：内置回顶部、全站内部链接预取、文档末页邮箱增强。
core = ROOT / 'site-navigation-core.js'
s = read(core)
old = s
s = re.sub(r"var SHARED_ASSET_VERSION = '[^']+';", f"var SHARED_ASSET_VERSION = '{VERSION}';", s, count=1)
s = s.replace("document.querySelectorAll('.qily-global-nav a[href],.site-nav a[href]').forEach(function (link) {",
              "document.querySelectorAll('a[href]').forEach(function (link) {")
# 主 dock 必须原生带回顶部，不再依赖后置补丁。
dock_start = s.find('dock.innerHTML')
dock_end = s.find('document.body.appendChild(dock)', dock_start)
segment = s[dock_start:dock_end] if dock_start >= 0 and dock_end >= 0 else ''
if 'data-action="top"' not in segment:
    needle = "'<button class=\"qily-float-btn qily-float-home\" data-action=\"home\" type=\"button\">首页</button>',"
    repl = needle + "\n      '<button class=\"qily-float-btn qily-float-top\" data-action=\"top\" type=\"button\">回<br>顶部</button>',"
    s = s.replace(needle, repl, 1)
if "action === 'top'" not in s:
    s = s.replace("if (action === 'home') location.href = '/';\n      else if (action === 'search') {",
                  "if (action === 'home') location.href = '/';\n      else if (action === 'top') { document.documentElement.scrollTop=0; document.body.scrollTop=0; window.scrollTo(0,0); requestAnimationFrame(function(){ window.scrollTo(0,0); }); }\n      else if (action === 'search') {", 1)

if 'function ensureKnowledgeDocumentEnhancements()' not in s:
    addon = r'''  function ensureKnowledgeDocumentEnhancements() {
    var title = document.title || '';
    var isTerm = /^\/knowledge\/terminology\/[^/]+\.html$/i.test(location.pathname);
    var isDoc = /\/(?:qilylean\/reference|reference|trust\/nda-preview|gbt2828)/i.test(location.pathname) || /参考资料|程序文件|PDF|标准作业|抽样检验/i.test(title);
    if (!document.getElementById('qilyDocumentUtilityStyle')) {
      var style=document.createElement('style');
      style.id='qilyDocumentUtilityStyle';
      style.textContent='.qily-document-email-tail{padding:9px 12px;border-top:1px solid #cbdcda;color:#0f4b5a;background:#f7fbfa;font-size:13px;font-weight:850;text-align:center}.qily-document-email-tail a{color:#0f4b5a;text-underline-offset:.18em}@media print{html.qily-shell-pending body,html.qily-first-paint-pending body{visibility:visible!important}.qily-site-header,.qily-global-header,.qily-float-dock,.qily-modal-mask,.qily-global-contact-footer{display:none!important}body{display:block!important;background:#fff!important}}';
      document.head.appendChild(style);
    }
    if (isDoc) {
      function addTail(){
        var pages=document.querySelectorAll('.viewer .page,.pdf-page,.document-page,.paper-page');
        var last=pages.length?pages[pages.length-1]:null;
        if(last && !last.querySelector('.qily-document-email-tail')){
          var tail=document.createElement('div'); tail.className='qily-document-email-tail';
          tail.innerHTML='官网：https://qilylean.com　｜　企业邮箱：<a href="mailto:'+CONTACT_EMAIL+'">'+CONTACT_EMAIL+'</a>';
          last.appendChild(tail);
        }
      }
      addTail(); setTimeout(addTail,120); setTimeout(addTail,600);
    }
    if(isTerm){ document.documentElement.classList.remove('qily-first-paint-pending','qily-shell-pending'); }
  }

'''
    marker = '  function revealCurrentShell() {'
    s = s.replace(marker, addon + marker, 1)
if 'ensureKnowledgeDocumentEnhancements();' not in s:
    s = s.replace('      ensureGlobalContactFooter();\n      protectControlledPage();',
                  '      ensureGlobalContactFooter();\n      ensureKnowledgeDocumentEnhancements();\n      protectControlledPage();', 1)
if s != old:
    core.write_text(s, 'utf-8')
    changed.append('site-navigation-core.js')

# D. 回顶部后置闭环：处理拖拽冲突与旧页面兼容。
p = ROOT / 'site-core-service-dock-closure-v1.js'
s = read(p)
old = s
start = s.find('  function bindBackToTop(top){')
end = s.find('\n  function normalizeDock()', start)
if start != -1 and end != -1:
    replacement = '''  function bindBackToTop(top){\n    if(top.dataset.qilyBound==='2')return;\n    top.dataset.qilyBound='2';\n    var startY=0,moved=false;\n    function goTop(event){if(event){event.preventDefault();event.stopPropagation();}d.documentElement.scrollTop=0;d.body.scrollTop=0;w.scrollTo(0,0);w.requestAnimationFrame(function(){w.scrollTo(0,0);});}\n    top.addEventListener('pointerdown',function(event){startY=event.clientY;moved=false;},{capture:true,passive:true});\n    top.addEventListener('pointermove',function(event){if(Math.abs(event.clientY-startY)>8)moved=true;},{capture:true,passive:true});\n    top.addEventListener('pointerup',function(event){if(!moved)goTop(event);},{capture:true,passive:false});\n    top.addEventListener('click',goTop,true);\n  }\n'''
    s = s[:start] + replacement + s[end:]
# 模块加载时主动解除旧的正文遮罩，防止个别老页停在空白态。
if "classList.remove('qily-shell-pending'" not in s:
    s = s.replace("  function apply(){alignCoreServices();normalizeDock();}",
                  "  function apply(){d.documentElement.classList.remove('qily-shell-pending','qily-first-paint-pending');alignCoreServices();normalizeDock();}", 1)
if s != old:
    p.write_text(s, 'utf-8')
    changed.append('site-core-service-dock-closure-v1.js')

# E. 旧悬浮交互也识别 top，避免捕获事件后吞掉新功能。
p = ROOT / 'qilylean' / 'floating-ui-repair.js'
if p.exists():
    s = read(p)
    old = s
    if "action==='top'" not in s:
        s = s.replace("}else if(action==='share'){",
                      "}else if(action==='top'){document.documentElement.scrollTop=0;document.body.scrollTop=0;window.scrollTo(0,0);requestAnimationFrame(function(){window.scrollTo(0,0);});\n      }else if(action==='share'){", 1)
    if s != old:
        p.write_text(s, 'utf-8')
        changed.append('qilylean/floating-ui-repair.js')

# F. 全站 shell CSS / 未来生成器：正文不再因统一导航初始化而整页隐藏。
p = ROOT / 'site-shell.css'
s = read(p)
old = s
s = s.replace('html.qily-shell-pending body {\n  visibility: hidden !important;\n}',
              'html.qily-shell-pending body {\n  visibility: visible !important;\n}')
if s != old:
    p.write_text(s, 'utf-8')
    changed.append('site-shell.css')

p = ROOT / 'scripts' / 'normalize-first-paint-fouc.js'
if p.exists():
    s = read(p)
    old = s
    s = s.replace('html.qily-first-paint-pending body{visibility:hidden!important}',
                  'html.qily-first-paint-pending body{visibility:visible!important}')
    s = s.replace('w.setTimeout(w.__qilyLeanRevealCurrentShell,5000)',
                  'w.setTimeout(w.__qilyLeanRevealCurrentShell,180)')
    s = re.sub(r"const version = '[^']+';", f"const version = '{VERSION}';", s, count=1)
    if s != old:
        p.write_text(s, 'utf-8')
        changed.append('scripts/normalize-first-paint-fouc.js')

# G. 导航包装层版本同步；构建契约新增 top。
p = ROOT / 'site-navigation.js'
s = read(p)
old = s
s = re.sub(r'/site-navigation-legacy-20260802\.js\?v=[^\'\"\s]+', f'/site-navigation-legacy-20260802.js?v={VERSION}', s)
if 'data-action="top"' not in s[s.find('dockActions'):]:
    s = s.replace("dockActions:['data-action=\"home\"',", "dockActions:['data-action=\"home\"','data-action=\"top\"',", 1)
if s != old:
    p.write_text(s, 'utf-8')
    changed.append('site-navigation.js')

p = ROOT / 'site-navigation-legacy-20260802.js'
if p.exists():
    s = read(p)
    old = s
    s = re.sub(r'/site-navigation-core\.js\?v=[^\'\"\s]+', f'/site-navigation-core.js?v={VERSION}', s)
    if s != old:
        p.write_text(s, 'utf-8')
        changed.append('site-navigation-legacy-20260802.js')

# H. 所有仓库PDF最后一页写入官网+企业邮箱（只写英文/URL，确保字体兼容）。
try:
    import fitz
    for pdf in tracked_files('*.pdf'):
        try:
            doc = fitz.open(pdf)
            if doc.page_count < 1:
                doc.close(); continue
            last = doc[-1]
            if EMAIL in last.get_text('text'):
                doc.close(); continue
            r = last.rect
            stamp = f'QilyLean | {SITE} | {EMAIL}'
            y = max(r.y0 + 8, r.y1 - 7)
            last.insert_text((r.x0 + 18, y), stamp, fontsize=6.2, color=(0.06,0.29,0.35), overlay=True)
            tmp = pdf.with_suffix(pdf.suffix + '.qilytmp')
            doc.save(tmp, garbage=4, deflate=True)
            doc.close()
            tmp.replace(pdf)
            stamped_pdfs.append(pdf.relative_to(ROOT).as_posix())
        except Exception as exc:
            print(f'PDF_SKIP {pdf.relative_to(ROOT)}: {exc}')
except Exception as exc:
    raise SystemExit(f'PyMuPDF unavailable: {exc}')

# I. 高置信度冗余清理：系统垃圾、临时/备份文件、完全相同且未被任何源码引用的二进制副本。
for path in list(ROOT.rglob('*')):
    if not path.is_file() or '.git' in path.parts or path.parts[:2] == ('.github','workflows'):
        continue
    rel = path.relative_to(ROOT).as_posix()
    low = path.name.lower()
    if low in {'.ds_store','thumbs.db'} or low.endswith(('.bak','.tmp','.temp','~')):
        path.unlink(); removed.append(rel)

corpus_parts = []
for path in ROOT.rglob('*'):
    if not path.is_file() or '.git' in path.parts:
        continue
    if path.suffix.lower() in TEXT_EXT:
        try: corpus_parts.append(path.read_text('utf-8', errors='ignore'))
        except Exception: pass
corpus = '\n'.join(corpus_parts)
by_hash = {}
for path in ROOT.rglob('*'):
    if not path.is_file() or '.git' in path.parts or path.suffix.lower() not in BINARY_EXT:
        continue
    try: digest = hashlib.sha256(path.read_bytes()).hexdigest()
    except Exception: continue
    by_hash.setdefault(digest, []).append(path)
for group in by_hash.values():
    if len(group) < 2: continue
    referenced = []; unreferenced = []
    for path in group:
        rel = path.relative_to(ROOT).as_posix()
        token1 = rel
        token2 = path.name
        (referenced if token1 in corpus or token2 in corpus else unreferenced).append(path)
    if referenced:
        for path in unreferenced:
            rel = path.relative_to(ROOT).as_posix()
            if path.exists():
                path.unlink(); removed.append(rel)

# J. 必要契约校验。
core_text = read(ROOT/'site-navigation-core.js')
assert 'data-action="top"' in core_text
assert "action === 'top'" in core_text
assert 'admin@qilylean.com' in core_text
assert 'function ensureKnowledgeDocumentEnhancements()' in core_text
assert "document.querySelectorAll('a[href]')" in core_text
assert 'visibility: hidden !important' not in read(ROOT/'site-shell.css')[:320]
for rel in term_pages:
    t = read(ROOT/rel)
    assert EMAIL in t and '下载 / 保存PDF' in t

print('SITEWIDE_CLOSURE_OK')
print('changed_text_files=', len(set(changed)))
print('terminology_pages=', len(term_pages))
print('stamped_pdfs=', len(stamped_pdfs))
print('removed_high_confidence_files=', len(removed))
for rel in stamped_pdfs:
    print('PDF_STAMP', rel)
for rel in removed:
    print('CLEANED', rel)
