#!/usr/bin/env python3
"""Deploy the shared intent-only native navigation helper on China pages."""
import hashlib
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CN = ROOT / 'cn-site'
source = ROOT / 'site-native-prefetch-v1.js'
target = CN / 'assets/site-native-prefetch-v1.js'
target.write_bytes(source.read_bytes())
version = hashlib.sha256(target.read_bytes()).hexdigest()[:12]
tag = '<script defer data-cn-native-prefetch="v2" src="/assets/site-native-prefetch-v1.js?v=' + version + '"></script>'
changed = 0
for page in CN.rglob('*.html'):
    original = page.read_text()
    updated = re.sub(r'<script\b[^>]*src=[\x22\x27]/(?:assets/)?site-native-prefetch-v1\.js[^>]*>[\s\S]*?</script>\s*', '', original, flags=re.I)
    if '</body>' not in updated:
        continue
    updated = updated.replace('</body>', tag + '\n</body>', 1)
    if original != updated:
        page.write_text(updated)
        changed += 1
print('CN native navigation: shared intent-only prefetch, ' + str(changed) + ' pages updated; no speculative media downloads.')
