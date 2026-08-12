#!/usr/bin/env python3
from pathlib import Path

path = Path(__file__).with_name('stabilize-runtime-navigation-20260812.py')
source = path.read_text(encoding='utf-8')
old = "    src, n = re.subn(fn_pattern, fn_repl, src, count=1)"
new = "    src, n = re.subn(fn_pattern, lambda _m: fn_repl, src, count=1)"

if old in source:
    source = source.replace(old, new, 1)
    path.write_text(source, encoding='utf-8')
    print('Hotfixed stabilizer replacement: regex replacement now uses a callable.')
elif new in source:
    print('Stabilizer replacement hotfix already present.')
else:
    raise RuntimeError('Expected stabilizer replacement line not found; refusing an ambiguous edit.')
