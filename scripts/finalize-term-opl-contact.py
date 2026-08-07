#!/usr/bin/env python3
from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
email='admin@qilylean.com'
for p in sorted((root/'knowledge'/'terminology').glob('*.html')):
    s=p.read_text('utf-8')
    old=s
    # Remove the previously appended fallback block so layout can be materialized inside footer.
    s=re.sub(r'<div class="qily-term-enterprise-contact">企业邮箱：<a href="mailto:admin@qilylean\.com">admin@qilylean\.com</a></div><button class="qily-term-pdf-action"[^>]*>下载 / 保存PDF</button>','',s)
    # Remove historical keyboard print/save blocker.
    s=re.sub(r'<script>\(function\(\)\{document\.addEventListener\(\'keydown\',[\s\S]*?</script>','',s)
    # Materialize a consistent footer: website, then enterprise email, then PDF action.
    m=re.search(r'<(?P<tag>div|footer)\s+class="footer"[^>]*>[\s\S]*?</(?P=tag)>',s,re.I)
    if not m:
        raise SystemExit(f'{p}: footer missing')
    footer=m.group(0)
    tag=m.group('tag')
    first=re.search(r'<span>[\s\S]*?</span>',footer,re.I)
    brand=first.group(0) if first else '<span>QilyLean｜启力精益 · 全站术语单点培训课件</span>'
    new_footer=(
        f'<{tag} class="footer">'+brand+
        '<span class="qily-term-footer-contact">'
        '<span>官网：<a href="https://qilylean.com/">https://qilylean.com/</a></span>'
        '<span>企业邮箱：<a href="mailto:'+email+'">'+email+'</a></span>'
        '<button class="qily-term-pdf-action" type="button" onclick="window.print()">下载 / 保存PDF</button>'
        f'</span></{tag}>'
    )
    s=s[:m.start()]+new_footer+s[m.end():]
    if '.qily-term-footer-contact{' not in s:
        s=s.replace('</style>','.qily-term-footer-contact{display:flex;flex-direction:column;align-items:flex-start;gap:5px}.qily-term-footer-contact a{color:#0f4b5a;text-underline-offset:.18em}@media(max-width:760px){.qily-term-footer-contact{width:100%}}\n</style>',1)
    if s!=old:
        p.write_text(s,'utf-8')
        print('UPDATED',p.relative_to(root))
    if email not in s or '下载 / 保存PDF' not in s or 'qily-term-footer-contact' not in s:
        raise SystemExit(f'{p}: contact/pdf action validation failed')
print('TERM_OPL_CONTACT_OK')
