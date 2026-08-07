#!/usr/bin/env python3
from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
p=root/'knowledge'/'terminology.html'
s=p.read_text('utf-8')
old=s
email='admin@qilylean.com'

s=s.replace('每个术语代码配套独立网址单点培训课件，仅供在线阅览与链接分享。','每个术语代码配套独立网址单点培训课件，支持在线阅览、链接分享与下载/保存PDF。')
s=s.replace('/* terminology-opl-v4 · document template + independent lesson URLs + online-only */','/* terminology-opl-v5 · document template + independent lesson URLs + PDF enabled */')

# Remove the legacy CSS that deliberately blanked all printable content.
s=re.sub(r'/\* terminology-opl-print-disabled-v1 \*/\s*@media print\{\s*body>\*\{display:none!important\}\s*body \.term-opl-modal\{display:none!important\}\s*body::before\{content:\\?"本课件仅供在线阅览，已关闭打印与保存PDF功能。\\?";[\s\S]*?\}\s*\}',
         '/* terminology-opl-print-enabled-v2 */',s,count=1)

# Toolbar gets an explicit PDF action.
needle='<button type="button" data-opl-link>复制课件链接</button><span class="term-opl-page" id="termOplPage"></span>'
repl='<button type="button" data-opl-link>复制课件链接</button><button type="button" data-opl-print>下载 / 保存PDF</button><span class="term-opl-page" id="termOplPage"></span>'
if needle in s:
    s=s.replace(needle,repl,1)
elif 'data-opl-print' not in s:
    raise SystemExit('Dynamic OPL toolbar insertion point missing')

# Brand/contact blocks: website first, enterprise email immediately after it.
s=s.replace('<span>微信 Qily259 · 134 5001 4003 / 151 6812 0722 / 176 8178 8259</span>',
            '<span>企业邮箱 admin@qilylean.com · 微信 Qily259 · 134 5001 4003 / 151 6812 0722 / 176 8178 8259</span>')
s=s.replace('官网：<a href="https://qilylean.com/">qilylean.com</a><br>微信：Qily259',
            '官网：<a href="https://qilylean.com/">qilylean.com</a><br>企业邮箱：<a href="mailto:admin@qilylean.com">admin@qilylean.com</a><br>微信：Qily259')
s=s.replace('<span>官网网址：https://qilylean.com/</span></div>\';',
            '<span>官网网址：https://qilylean.com/<br>企业邮箱：admin@qilylean.com</span></div>\';')

# Explicit PDF action calls the browser print dialog, which supports Save as PDF.
link_branch="""  if(event.target.closest('[data-opl-link]')){\n    copyText(canonicalLink(lesson(cards[current],current))).then(function(){toast('课件链接已复制');}).catch(function(){toast('复制失败，请从地址栏复制');});\n    return;\n  }"""
if "data-opl-print" in s and "window.print();return;" not in s:
    s=s.replace(link_branch, """  if(event.target.closest('[data-opl-print]')){window.print();return;}\n"""+link_branch,1)

# Remove old Ctrl/Cmd+P / Ctrl/Cmd+S blocker.
s=s.replace("  var commandKey=event.ctrlKey||event.metaKey,key=String(event.key||'').toLowerCase();\n  if(commandKey&&(key==='p'||key==='s')){event.preventDefault();toast('本课件仅供在线阅览，已关闭打印与保存功能');return;}\n",
            "  var key=String(event.key||'').toLowerCase();\n")

if s==old:
    raise SystemExit('No dynamic OPL changes were applied')
for required in ['data-opl-print','下载 / 保存PDF',email,'terminology-opl-print-enabled-v2']:
    if required not in s: raise SystemExit('Missing required marker: '+required)
for forbidden in ['已关闭打印与保存PDF功能','已关闭打印与保存功能']:
    if forbidden in s: raise SystemExit('Legacy print blocker remains: '+forbidden)

p.write_text(s,'utf-8')
print('DYNAMIC_OPL_OK')
