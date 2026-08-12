#!/usr/bin/env python3
from pathlib import Path

scripts_dir = Path(__file__).parent

# 1) Python re.sub replacement contains JS regex text; use a callable so backslashes
# are treated as literal replacement content instead of Python replacement escapes.
stabilizer = scripts_dir / 'stabilize-runtime-navigation-20260812.py'
source = stabilizer.read_text(encoding='utf-8')
old = "    src, n = re.subn(fn_pattern, fn_repl, src, count=1)"
new = "    src, n = re.subn(fn_pattern, lambda _m: fn_repl, src, count=1)"
if old in source:
    source = source.replace(old, new, 1)
    stabilizer.write_text(source, encoding='utf-8')
    print('Hotfixed stabilizer replacement: regex replacement now uses a callable.')
elif new in source:
    print('Stabilizer replacement hotfix already present.')
else:
    raise RuntimeError('Expected stabilizer replacement line not found; refusing an ambiguous edit.')

# 2) The runtime baseline is now soft-navigation V4. Update the regression guard
# before the closure runner invokes it, so the quality gate validates the new
# contract instead of requiring the retired V3 marker.
guard = scripts_dir / 'site-regression-guard.js'
guard_source = guard.read_text(encoding='utf-8')
replacements = {
    'window.__qilySoftNavigationV3': 'window.__qilySoftNavigationV4',
    "const NAV_VERSION = '20260811-soft-navigation-v3'": "const NAV_VERSION = '20260812-soft-navigation-v4'",
    'data-qily-persistent-music-navigation="v3"': 'data-qily-persistent-music-navigation="v4"',
}
for before, after in replacements.items():
    guard_source = guard_source.replace(before, after)
if 'window.__qilySoftNavigationV4' not in guard_source or 'data-qily-persistent-music-navigation="v4"' not in guard_source:
    raise RuntimeError('Soft-navigation V4 regression baseline was not materialized.')
guard.write_text(guard_source, encoding='utf-8')
print('Regression guard baseline synchronized to soft-navigation V4.')
