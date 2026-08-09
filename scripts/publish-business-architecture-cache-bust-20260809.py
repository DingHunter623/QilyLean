from pathlib import Path

OLD_NAV = '/site-navigation.js?v=20260807-sitewide-closure-v4'
NEW_NAV = '/site-navigation.js?v=20260809-business-architecture-v2'

changed = []

# Force all current HTML pages that use the shared navigation/runtime loader to fetch the new loader.
for path in Path('.').rglob('*.html'):
    if '.git' in path.parts:
        continue
    text = path.read_text(encoding='utf-8')
    new = text.replace(OLD_NAV, NEW_NAV)
    if new != text:
        path.write_text(new, encoding='utf-8')
        changed.append(str(path))

# Force the shared loader to fetch the corrected business architecture runtime assets.
path = Path('site-navigation.js')
text = path.read_text(encoding='utf-8')
new = text
new = new.replace('/site-brand-trust-v1.js?v=20260802-project-rolebar-v3', '/site-brand-trust-v1.js?v=20260809-project-delivery-strategy-v2')
new = new.replace('/site-information-architecture-v1.js?v=20260802-commercial-focus-v1', '/site-information-architecture-v1.js?v=20260809-six-capabilities-v2')
new = new.replace('/site-navigation-legacy-20260802.js?v=20260807-contact-label-v5', '/site-navigation-legacy-20260802.js?v=20260809-core-project-pricing-v2')
if new != text:
    path.write_text(new, encoding='utf-8')
    changed.append(str(path))

print(f'Cache-bust updated files: {len(changed)}')
for item in changed[:40]:
    print(' -', item)
if len(changed) > 40:
    print(f' - ... and {len(changed)-40} more')

if 'site-navigation.js' not in changed:
    raise SystemExit('Shared loader cache versions were not updated')
if not any(item.endswith('index.html') for item in changed):
    raise SystemExit('No HTML pages were cache-busted')
