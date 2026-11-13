#!/usr/bin/env python3
"""Poka-yoke: two-phase translator resource byte equality, never bypassed."""
from __future__ import annotations

import ast
from pathlib import Path
import tempfile

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'services/cn-translation/verify-production.py').read_text()
workflow = (ROOT / '.github/workflows/deploy-cn-preprod.yml').read_text()

tree = ast.parse(source)
functions = [node for node in tree.body if isinstance(node, ast.FunctionDef)
             and node.name == 'approved_public_asset_bytes']
assert len(functions) == 1, 'Public translator asset verification helper missing'
namespace = {'Path': Path}
code = compile(ast.Module(body=functions, type_ignores=[]),
               '<isolated-asset-verification>', 'exec')
exec(code, namespace)
check = namespace['approved_public_asset_bytes']

with tempfile.TemporaryDirectory() as root:
    root = Path(root)
    live = root / 'current'
    staged = root / 'pending'
    (live / 'assets').mkdir(parents=True)
    staged.mkdir()
    for name in ('cn-translate-baidu-v1.js', 'cn-translate-baidu-v1.css'):
        (live / 'assets' / name).write_bytes(b'approved-current-byte-version')
        (staged / name).write_bytes(b'approved-pending-byte-version')
        assert check(name, pre_switch=True, live_root=live, staged_dir=staged) == b'approved-current-byte-version'
        assert check(name, pre_switch=False, live_root=live, staged_dir=staged) == b'approved-pending-byte-version'
        assert check(name, pre_switch=True, live_root=live, staged_dir=staged) != check(name, pre_switch=False, live_root=live, staged_dir=staged)
    try:
        check('unrelated.js', pre_switch=True, live_root=live, staged_dir=staged)
    except ValueError:
        pass
    else:
        raise AssertionError('Asset path whitelist bypassed')

assert "parser.add_argument('--pre-switch'" in source, 'Pre-switch CLI unavailable'
assert "if args.pre_switch and not args.production:" in source, 'Pre-switch must require full production verification'
assert "actual == approved_public_asset_bytes(name, pre_switch=args.pre_switch)" in source, 'Live public resource equality guard bypassed'
assert workflow.count("verify-production.py --production --pre-switch") == 2, 'Pre-switch and rollback must both check active release bytes'
assert workflow.count("verify-production.py --production'") == 1, 'Post-switch must check staged new release bytes'
assert 'Verify retained Youdao service before static-content switch' in workflow
assert 'Verify fresh Youdao translation through the production CN origin' in workflow
print('PASS: active current bytes before switch; staged release bytes after switch; rollback checks restored current bytes; strict asset whitelist and provider checks retained')
