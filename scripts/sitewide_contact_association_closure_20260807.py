from pathlib import Path
import re
import io
from PIL import Image, ImageDraw, ImageFont

ROOT = Path('.')
OFFICIAL_URL = 'https://qilylean.com/'
OFFICIAL_EMAIL = 'admin@qilylean.com'
NEW_HOVER = 'site-interactive-hover-contrast-v1.css?v=20260807-official-contact-hover-v3'


def update_hover_cache_refs():
    exts = {'.html', '.js', '.css', '.md', '.json', '.yml', '.yaml', '.txt'}
    for p in ROOT.rglob('*'):
        if not p.is_file() or p.suffix.lower() not in exts or '.git' in p.parts:
            continue
        try:
            s = p.read_text(encoding='utf-8')
        except Exception:
            continue
        old = s
        s = re.sub(
            r'site-interactive-hover-contrast-v1\.css\?v=20260805-interactive-hover-contrast-v[12]',
            NEW_HOVER,
            s,
        )
        if s != old:
            p.write_text(s, encoding='utf-8')


def update_navigation_runtime():
    nav = Path('site-navigation.js')
    s = nav.read_text(encoding='utf-8')
    s = s.replace('global VI, navigation, trust and contrast loader v11',
                  'global VI, navigation, trust and contrast loader v12')
    s = s.replace('__qilyGlobalAssetLoaderV11', '__qilyGlobalAssetLoaderV12')
    s = s.replace(
        '/site-interactive-hover-contrast-v1.css?v=20260805-interactive-hover-contrast-v2',
        '/site-interactive-hover-contrast-v1.css?v=20260807-official-contact-hover-v3',
    )
    marker = '/* QILY-OFFICIAL-CONTACT-RUNTIME-20260807 */'
    if marker not in s:
        s += r'''

/* QILY-OFFICIAL-CONTACT-RUNTIME-20260807 */
(function(d,w){
  'use strict';
  if(w.__qilyOfficialContactRuntime20260807)return;
  w.__qilyOfficialContactRuntime20260807=true;
  var URL='https://qilylean.com/';
  var EMAIL='admin@qilylean.com';
  function boot(){
    if(!d.body)return;
    var id='qilyOfficialContactRuntime';
    if(d.getElementById(id))return;
    var host=d.querySelector('footer.footer, footer.site-footer, footer.qily-footer, body > footer:last-of-type');
    if(!host){host=d.createElement('footer');host.className='qily-official-contact-footer';d.body.appendChild(host);}
    var box=d.createElement('div');box.id=id;box.className='qily-official-contact-runtime';
    box.innerHTML='<span class="qily-contact-label">官网网址：</span><a href="'+URL+'">'+URL+'</a><span class="qily-contact-sep">｜</span><span class="qily-contact-label">企业邮箱：</span><a href="mailto:'+EMAIL+'">'+EMAIL+'</a>';
    host.appendChild(box);
    if(!d.getElementById('qilyOfficialContactRuntimeStyle')){
      var style=d.createElement('style');style.id='qilyOfficialContactRuntimeStyle';
      style.textContent='.qily-official-contact-footer{padding:18px;text-align:center;background:#101916;color:#d7e8e2}.qily-official-contact-runtime{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:7px 5px;margin-top:10px;font-size:13px;font-weight:750;line-height:1.7}.qily-official-contact-runtime a{display:inline-flex;align-items:center;min-height:34px;padding:5px 9px;border:1px solid rgba(255,227,155,.45);border-radius:8px;color:#eaf7f3!important;-webkit-text-fill-color:#eaf7f3!important;background:#173e42;text-decoration:none}.qily-official-contact-runtime a:hover,.qily-official-contact-runtime a:focus-visible{color:#fff!important;-webkit-text-fill-color:#fff!important;background:#0b5662!important;border-color:#ffe39b!important;outline:3px solid #ffe39b!important;outline-offset:2px!important}.qily-official-contact-runtime a:active{color:#17231e!important;-webkit-text-fill-color:#17231e!important;background:#ffe39b!important}.qily-contact-label{font-weight:900}.qily-contact-sep{opacity:.6}@media(max-width:640px){.qily-contact-sep{display:none}.qily-official-contact-runtime{flex-direction:column;gap:6px}}';
      (d.head||d.documentElement).appendChild(style);
    }
  }
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(document,window);
'''
    nav.write_text(s, encoding='utf-8')


def update_trust_email_status():
    p = Path('site-trust-conversion-v2.js')
    s = p.read_text(encoding='utf-8')
    s = s.replace("var REVIEW_DATE = '2026-08-05';", "var REVIEW_DATE = '2026-08-07';")
    s = s.replace(
        '<tr><th>商务邮箱</th><td class="qtc-state-open">域名邮箱待验证</td><td>当前官网公开并实际使用的邮箱为admin@qilylean.com；域名邮箱完成真实收发与安全验证后再正式公开。</td></tr>',
        '<tr><th>企业邮箱</th><td class="qtc-state-ok">已启用</td><td>官网、APP支持、隐私与应用市场资料统一使用admin@qilylean.com；用于商务联系、技术支持与合规反馈。</td></tr>',
    )
    p.write_text(s, encoding='utf-8')


def update_app_support():
    p = Path('app-support/index.html')
    s = p.read_text(encoding='utf-8')
    s = re.sub(
        r'<footer class="footer">.*?</footer>',
        '<footer class="footer">丁启利（QilyLean｜启力精益） · 官网网址：<a href="https://qilylean.com/">https://qilylean.com/</a> · 企业邮箱：<a href="mailto:admin@qilylean.com">admin@qilylean.com</a></footer>',
        s,
        flags=re.S,
    )
    p.write_text(s, encoding='utf-8')


def update_one_piece_flow_shell():
    p = Path('qilylean/reference-one-piece-flow.html')
    if not p.exists():
        return
    s = p.read_text(encoding='utf-8')
    s = s.replace(
        '<footer class="footer">QilyLean｜单件流 · 节拍平衡 · 制造改善</footer>',
        '<footer class="footer">QilyLean｜单件流 · 节拍平衡 · 制造改善<br>官网网址：https://qilylean.com/　｜　企业邮箱：admin@qilylean.com</footer>',
    )
    p.write_text(s, encoding='utf-8')


def find_cjk_font():
    candidates = [
        '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
        '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',
        '/usr/share/fonts/opentype/noto/NotoSansCJKsc-Regular.otf',
    ]
    return next((x for x in candidates if Path(x).exists()), None)


def redraw_one_piece_flow_qly():
    qdir = Path('qilylean/reference/seat-switch-one-piece-flow')
    if not qdir.exists():
        return
    fp = find_cjk_font()
    if not fp:
        raise RuntimeError('Noto CJK font not found')
    key = b'QilyLeanFlowPreview2026'
    font = ImageFont.truetype(fp, 22)
    font_bold = ImageFont.truetype(fp, 23)
    pages = sorted(qdir.glob('page-*.qly'))
    if len(pages) != 14:
        raise RuntimeError(f'Expected 14 qly pages, got {len(pages)}')
    for f in pages:
        raw = f.read_bytes()
        dec = bytes(b ^ key[i % len(key)] for i, b in enumerate(raw))
        im = Image.open(io.BytesIO(dec)).convert('RGB')
        w, h = im.size
        band = max(80, int(h * 0.038))
        y0 = h - band
        d = ImageDraw.Draw(im)
        d.rectangle([0, y0, w, h], fill=(255, 255, 255))
        d.line([0, y0, w, y0], fill=(16, 103, 119), width=3)
        left = 'QilyLean｜启力精益'
        line1 = '官网网址：https://qilylean.com/'
        line2 = '企业邮箱：admin@qilylean.com'
        d.text((42, y0 + 27), left, font=font_bold, fill=(15, 75, 90))
        bbox1 = d.textbbox((0, 0), line1, font=font)
        bbox2 = d.textbbox((0, 0), line2, font=font)
        rw = max(bbox1[2] - bbox1[0], bbox2[2] - bbox2[0])
        rx = max(42, w - rw - 42)
        d.text((rx, y0 + 12), line1, font=font, fill=(38, 59, 54))
        d.text((rx, y0 + 43), line2, font=font, fill=(38, 59, 54))
        out = io.BytesIO()
        im.save(out, format='JPEG', quality=94, optimize=True)
        encoded = bytes(b ^ key[i % len(key)] for i, b in enumerate(out.getvalue()))
        f.write_bytes(encoded)


def update_store_docs():
    docs = [
        Path('app-store/times26001/README.md'),
        Path('app-store/qilylean-home/README.md'),
        Path('app-store/SOFTWARE_COPYRIGHT_AND_APP_FILING_MATERIALS.md'),
    ]
    for p in docs:
        if not p.exists():
            continue
        s = p.read_text(encoding='utf-8')
        s = s.replace('更新时间：2026-08-06', '更新时间：2026-08-07')
        if '企业邮箱：`admin@qilylean.com`' not in s and '支持邮箱：`admin@qilylean.com`' not in s:
            s = s.replace(
                '品牌：QilyLean｜启力精益',
                '品牌：QilyLean｜启力精益\n企业邮箱：`admin@qilylean.com`\n官网：`https://qilylean.com/`',
            )
        p.write_text(s, encoding='utf-8')


def write_persistent_audit():
    p = Path('scripts/audit-official-contact-association.py')
    p.write_text(
        """from pathlib import Path\nimport sys\nerrors=[]\nfor p in Path('.').rglob('*'):\n    if not p.is_file() or p.suffix.lower() not in {'.html','.js','.css','.md','.json','.yml','.yaml','.txt'} or '.git' in p.parts: continue\n    try:s=p.read_text(encoding='utf-8')\n    except Exception:continue\n    if '396767769@qq.com' in s: errors.append(f'旧邮箱残留: {p}')\n    if 'site-interactive-hover-contrast-v1.css?v=20260805-interactive-hover-contrast-v1' in s or 'site-interactive-hover-contrast-v1.css?v=20260805-interactive-hover-contrast-v2' in s: errors.append(f'旧hover缓存: {p}')\nif 'admin@qilylean.com' not in Path('app-support/index.html').read_text(encoding='utf-8'): errors.append('APP支持页缺企业邮箱')\nif '企业邮箱</th><td class=\\\"qtc-state-ok\\\">已启用' not in Path('site-trust-conversion-v2.js').read_text(encoding='utf-8'): errors.append('Trust邮箱状态未同步')\nif errors:\n    print('\\n'.join(errors)); sys.exit(1)\nprint('Official contact association audit passed.')\n""",
        encoding='utf-8',
    )


def main():
    update_hover_cache_refs()
    update_navigation_runtime()
    update_trust_email_status()
    update_app_support()
    update_one_piece_flow_shell()
    redraw_one_piece_flow_qly()
    update_store_docs()
    write_persistent_audit()
    print('Sitewide official contact and association closure applied.')


if __name__ == '__main__':
    main()
