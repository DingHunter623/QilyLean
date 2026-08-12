#!/usr/bin/env python3
from pathlib import Path
import subprocess, sys
ROOT=Path(__file__).resolve().parents[1]

def text(rel): return (ROOT/rel).read_text(encoding='utf-8')

def patched():
    nav=text('site-music-persistent-navigation-v1.js')
    music=text('homepage-music-v5.js')
    footer=text('site-footer-standard-v28.js')
    loader=text('site-navigation.js')
    layout=text('site-layout-footer-closure-v1.css')
    return (
        'window.__qilySoftNavigationV4' in nav and
        'reconcileHeadAssets' in nav and
        'data-qily-soft-nav-scope' in nav and
        'resumeExpected' in music and
        "audio.addEventListener('timeupdate', writeState" not in music and
        '[80, 220, 520, 1000, 1800, 3000]' not in footer and
        '[120,600]' not in loader and
        '[250,900,1800]' not in loader and
        'QILY-RUNTIME-STABILITY-V20:START' in layout
    )

if not patched():
    subprocess.check_call([sys.executable, str(ROOT/'scripts/stabilize-runtime-navigation-20260812.py')], cwd=ROOT)
else:
    print('Runtime stability source already at V20/V29/V4 baseline; source patch skipped.')

# Materializers are intentionally rerun every time: they are the public-page cache/version contract.
for rel in ['scripts/publish-primary-contrast-music-continuity.js','scripts/materialize-footer-standard-v28.js']:
    subprocess.check_call(['node',str(ROOT/rel)],cwd=ROOT)

# Self-heal must be safe after the new baseline; regression guard then verifies that no old runtime loop returned.
subprocess.check_call(['node',str(ROOT/'scripts/apply-site-poka-yoke-v1.js')],cwd=ROOT)
subprocess.check_call(['node',str(ROOT/'scripts/materialize-footer-standard-v28.js')],cwd=ROOT)
subprocess.check_call(['node',str(ROOT/'scripts/site-regression-guard.js')],cwd=ROOT)
subprocess.check_call(['node','--check',str(ROOT/'site-navigation.js')],cwd=ROOT)
subprocess.check_call(['node','--check',str(ROOT/'site-music-persistent-navigation-v1.js')],cwd=ROOT)
subprocess.check_call(['node','--check',str(ROOT/'homepage-music-v5.js')],cwd=ROOT)
subprocess.check_call(['node','--check',str(ROOT/'site-footer-standard-v28.js')],cwd=ROOT)
print('Runtime stability closure passed.')
