#!/usr/bin/env python3
from pathlib import Path
import re
import sys

CSS = Path('site-commercial-quality-closure-v1.css')
HTML = Path('cooperation/index.html')
VI = Path('site-visual-governance-v2.css')
MARKER = 'QILY-R10-COOPERATION-AXIS-CURRENT-TEXT-WHITE'
VERSION = '20260904-cooperation-axis-current-white-r10'

vi = VI.read_text(encoding='utf-8')
required_current = 'body:has(header a[href="/cooperation/"][aria-current="page"]) .qily-system-axis__step[href="/cooperation/"]'
required_white = 'color:#fff!important;-webkit-text-fill-color:#fff!important;background:var(--qily-axis-green)!important;border:2px solid var(--qily-axis-gold)!important'
if required_current not in vi or required_white not in vi:
    raise SystemExit('VI contract check failed: current operating-axis card is not confirmed as deep teal + gold + white text.')

css = CSS.read_text(encoding='utf-8')
html = HTML.read_text(encoding='utf-8')

block = '''

/* QILY-R10-COOPERATION-AXIS-CURRENT-TEXT-WHITE | 2026-09-04
 * VI依据：site-visual-governance-v2.css 02A明确规定当前制造运营轴卡片为深青底+金边+白字。
 * 范围：只恢复项目合作页05当前卡片文字为白色；不改背景、边框、尺寸、布局及其它卡片状态。
 */
html:root:root body.cooperation-page:has(header a[href="/cooperation/"][aria-current="page"]) main .qily-system-axis__step[href="/cooperation/"],
html:root:root body.cooperation-page:has(header a[href="/cooperation/"][aria-current="page"]) main .qily-system-axis__step[href="/cooperation/"]:link,
html:root:root body.cooperation-page:has(header a[href="/cooperation/"][aria-current="page"]) main .qily-system-axis__step[href="/cooperation/"]:visited,
html:root:root body.cooperation-page:has(header a[href="/cooperation/"][aria-current="page"]) main .qily-system-axis__step[href="/cooperation/"] > strong,
html:root:root body.cooperation-page:has(header a[href="/cooperation/"][aria-current="page"]) main .qily-system-axis__step[href="/cooperation/"] > span,
html:root:root body.cooperation-page:has(header a[href="/cooperation/"][aria-current="page"]) main .qily-system-axis__step[href="/cooperation/"]:visited > strong,
html:root:root body.cooperation-page:has(header a[href="/cooperation/"][aria-current="page"]) main .qily-system-axis__step[href="/cooperation/"]:visited > span{
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  opacity:1!important;
  text-shadow:none!important;
}
'''

if MARKER in css:
    css, n = re.subn(
        r'\n/\* QILY-R10-COOPERATION-AXIS-CURRENT-TEXT-WHITE[\s\S]*?\n}\s*$',
        block.rstrip() + '\n',
        css,
        count=1,
    )
    if n != 1:
        raise SystemExit('Existing R10 marker found but block replacement failed.')
else:
    css = css.rstrip() + block

html, n = re.subn(
    r'/site-commercial-quality-closure-v1\.css\?v=[^"\']+',
    f'/site-commercial-quality-closure-v1.css?v={VERSION}',
    html,
    count=1,
)
if n != 1:
    raise SystemExit(f'Expected exactly one commercial stylesheet reference, got {n}.')

if '--apply' in sys.argv:
    CSS.write_text(css, encoding='utf-8')
    HTML.write_text(html, encoding='utf-8')
    print('APPLIED', MARKER, VERSION)
else:
    if MARKER not in CSS.read_text(encoding='utf-8') or VERSION not in HTML.read_text(encoding='utf-8'):
        raise SystemExit('R10 fix not materialized.')
    print('PASS', MARKER, VERSION)
