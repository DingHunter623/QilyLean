#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = '\u4f01\u4e1a\u90ae\u7bb1'
NEW = '官网邮箱'
TEXT_EXTS = {
    '.html','.htm','.js','.css','.json','.md','.txt','.py','.java','.kt','.kts','.xml','.yml','.yaml',
    '.gradle','.properties','.svg','.rss','.xhtml','.csv','.ts','.tsx','.jsx','.sh'
}
SKIP_DIRS = {'.git','.github','node_modules','build','.gradle','.cache','dist'}
SKIP_EXACT = {
    'scripts/migrate-official-email-and-fix-brief-arrow-20260814.py',
}


def rel(p: Path) -> str:
    return str(p.relative_to(ROOT)).replace('\\', '/')


def eligible(p: Path) -> bool:
    if not p.is_file() or any(part in SKIP_DIRS for part in p.parts):
        return False
    if rel(p) in SKIP_EXACT:
        return False
    return p.suffix.lower() in TEXT_EXTS or p.name == 'CNAME'


changed = []
replacements = 0
for p in ROOT.rglob('*'):
    if not eligible(p):
        continue
    try:
        s = p.read_text(encoding='utf-8')
    except (UnicodeDecodeError, OSError):
        continue
    n = s.count(OLD)
    if n:
        p.write_text(s.replace(OLD, NEW), encoding='utf-8')
        replacements += n
        changed.append(rel(p))

# Scene diagram 02: use a clean upward process arrow instead of the visually ambiguous marker shape.
brief = ROOT / 'qilylean/daily/2026-08-14.html'
if not brief.exists():
    raise SystemExit('2026-08-14 brief missing')
s = brief.read_text(encoding='utf-8')
old_arrow = '<path d="M600 520 V445" stroke="#178b94" stroke-width="7" marker-end="url(#a3)"/>'
new_arrow = '<line x1="600" y1="515" x2="600" y2="462" stroke="#178b94" stroke-width="8" stroke-linecap="round"/><polygon points="600,438 584,466 616,466" fill="#178b94"/>'
if old_arrow in s:
    brief.write_text(s.replace(old_arrow, new_arrow, 1), encoding='utf-8')
    changed.append(rel(brief))
elif new_arrow not in s:
    raise SystemExit('scene diagram 02 arrow anchor not found')

# Product-facing validation: maintained website/app sources must use the new label.
remaining = []
for p in ROOT.rglob('*'):
    if not eligible(p):
        continue
    try:
        text = p.read_text(encoding='utf-8')
    except (UnicodeDecodeError, OSError):
        continue
    if OLD in text:
        remaining.append(rel(p))
if remaining:
    raise SystemExit('legacy email label remains in maintained product content: ' + ', '.join(remaining[:40]))

qhome = ROOT / 'android/qilylean-home/app/src/main/java/com/qilylean/home/MainActivity.java'
if qhome.exists() and 'webCard("官网邮箱", "admin@qilylean.com"' not in qhome.read_text(encoding='utf-8'):
    raise SystemExit('QilyLean Home 官网邮箱 label missing')

final_brief = brief.read_text(encoding='utf-8')
if new_arrow not in final_brief or old_arrow in final_brief:
    raise SystemExit('brief arrow V2 validation failed')

print(f'官网邮箱 migration complete: {replacements} replacements across {len(set(changed))} changed files.')
print('Brief scene diagram 02 upward arrow fixed.')
