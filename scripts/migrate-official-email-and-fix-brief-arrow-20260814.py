#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TEXT_EXTS = {
    '.html','.htm','.js','.css','.json','.md','.txt','.py','.java','.kt','.kts','.xml','.yml','.yaml',
    '.gradle','.properties','.svg','.rss','.xhtml','.csv','.ts','.tsx','.jsx','.sh'
}
SKIP_DIRS = {'.git','node_modules','build','.gradle','.cache','dist'}

changed = []
replacements = 0

for p in ROOT.rglob('*'):
    if not p.is_file():
        continue
    if any(part in SKIP_DIRS for part in p.parts):
        continue
    if p.suffix.lower() not in TEXT_EXTS and p.name not in {'CNAME'}:
        continue
    try:
        s = p.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    n = s.count('企业邮箱')
    if n:
        s = s.replace('企业邮箱', '官网邮箱')
        p.write_text(s, encoding='utf-8')
        replacements += n
        changed.append(str(p.relative_to(ROOT)))

# Fix scene diagram 02: replace the visually ambiguous lower arrow with a clean upward arrow.
brief = ROOT / 'qilylean/daily/2026-08-14.html'
if not brief.exists():
    raise SystemExit('2026-08-14 brief missing')
s = brief.read_text(encoding='utf-8')
old = '<path d="M600 520 V445" stroke="#178b94" stroke-width="7" marker-end="url(#a3)"/>'
new = '<line x1="600" y1="515" x2="600" y2="462" stroke="#178b94" stroke-width="8" stroke-linecap="round"/><polygon points="600,438 584,466 616,466" fill="#178b94"/>'
if old in s:
    s = s.replace(old, new, 1)
    brief.write_text(s, encoding='utf-8')
    changed.append(str(brief.relative_to(ROOT)))
elif new not in s:
    raise SystemExit('scene diagram 02 arrow anchor not found')

# App release manifest wording + QilyLean Home public package baseline.
manifest = ROOT / 'app-release-manifest.json'
if manifest.exists():
    s = manifest.read_text(encoding='utf-8')
    s = s.replace('企业邮箱', '官网邮箱')
    manifest.write_text(s, encoding='utf-8')

# Hard validation: user-facing maintained text must no longer contain 企业邮箱.
remaining = []
for p in ROOT.rglob('*'):
    if not p.is_file() or any(part in SKIP_DIRS for part in p.parts):
        continue
    if p.suffix.lower() not in TEXT_EXTS:
        continue
    try:
        text = p.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    if '企业邮箱' in text:
        remaining.append(str(p.relative_to(ROOT)))

if remaining:
    raise SystemExit('企业邮箱 remains in maintained text: ' + ', '.join(remaining[:40]))

qhome = ROOT / 'android/qilylean-home/app/src/main/java/com/qilylean/home/MainActivity.java'
if qhome.exists() and 'webCard("官网邮箱", "admin@qilylean.com"' not in qhome.read_text(encoding='utf-8'):
    raise SystemExit('QilyLean Home 官网邮箱 label missing')

final_brief = brief.read_text(encoding='utf-8')
if new not in final_brief or old in final_brief:
    raise SystemExit('brief arrow V2 validation failed')

print(f'官网邮箱 migration complete: {replacements} replacements across {len(set(changed))} changed files.')
print('Brief scene diagram 02 upward arrow fixed.')
