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
elif new not in source:
    raise RuntimeError('Expected stabilizer fn replacement line not found; refusing an ambiguous edit.')

# 2) The V4 navigation source itself contains regular-expression backslashes.
# Embed it in the JS self-heal source with String.raw and use a callable Python
# replacement. This prevents JS template-literal parsing from eating \., \?, etc.
old_escape = "    escaped=SOFT_NAV_SOURCE.replace('\\\\','\\\\\\\\').replace('`','\\\\`').replace('${','\\\\${')"
new_escape = "    escaped=SOFT_NAV_SOURCE.replace('`','\\\\`').replace('${','\\\\${')"
source = source.replace(old_escape, new_escape)
old_embed = "    src, n = re.subn(r'const softNavigationSource = `\\[\\s\\S\\]*?`;\\n\\nfunction patchSoftNavigation', 'const softNavigationSource = `'+escaped+'`;\\n\\nfunction patchSoftNavigation', src, count=1)"
# Match the actual source line directly; the pattern text contains [\s\S], not escaped brackets.
actual_old_embed = "    src, n = re.subn(r'const softNavigationSource = `[\\s\\S]*?`;\\n\\nfunction patchSoftNavigation', 'const softNavigationSource = `'+escaped+'`;\\n\\nfunction patchSoftNavigation', src, count=1)"
actual_new_embed = "    replacement = 'const softNavigationSource = String.raw`'+escaped+'`;\\n\\nfunction patchSoftNavigation'\n    src, n = re.subn(r'const softNavigationSource = (?:String.raw)?`[\\s\\S]*?`;\\n\\nfunction patchSoftNavigation', lambda _m: replacement, src, count=1)"
if actual_old_embed in source:
    source = source.replace(actual_old_embed, actual_new_embed, 1)
elif 'const softNavigationSource = String.raw`' not in source and 'replacement = \'const softNavigationSource = String.raw`\'' not in source:
    raise RuntimeError('Expected softNavigationSource embed line not found; refusing an ambiguous edit.')

stabilizer.write_text(source, encoding='utf-8')
print('Stabilizer hotfix applied: callable replacements + String.raw soft-navigation source.')

# 3) The runtime baseline is now soft-navigation V4. Update the regression guard
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
