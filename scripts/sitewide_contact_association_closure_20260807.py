from pathlib import Path
import re

ROOT = Path('.')
OFFICIAL_URL = 'https://qilylean.com/'
OFFICIAL_EMAIL = 'admin@qilylean.com'


def remove_obsolete_navigation_contact_runtime():
    """Remove the retired runtime that injected an extra URL/email row into every footer."""
    nav = Path('site-navigation.js')
    if not nav.exists():
        return
    s = nav.read_text(encoding='utf-8')
    s = re.sub(
        r'\n?/\* QILY-OFFICIAL-CONTACT-RUNTIME-20260807 \*/.*?\}\)\(document,window\);\s*',
        '\n',
        s,
        flags=re.S,
    )
    nav.write_text(s, encoding='utf-8')


def normalize_page_level_contact_footers():
    """For pages using the shared shell, remove page-local contact rows and leave the global standard footer as the single source of truth."""
    for p in ROOT.rglob('*.html'):
        if '.git' in p.parts:
            continue
        try:
            s = p.read_text(encoding='utf-8')
        except Exception:
            continue
        if 'site-navigation.js' not in s:
            continue

        def normalize(match):
            attrs = match.group(1)
            inner = match.group(2)
            if 'qilyGlobalContactFooter' in inner:
                return match.group(0)
            plain = re.sub(r'<[^>]+>', ' ', inner)
            plain = re.sub(r'\s+', ' ', plain)
            has_url = OFFICIAL_URL in inner or 'qilylean.com' in plain
            has_email = OFFICIAL_EMAIL in inner or OFFICIAL_EMAIL in plain
            has_labels = '官方网址' in plain or '官网邮箱' in plain
            if (has_url and has_email) or (has_labels and (has_url or has_email)):
                return f'<footer{attrs}></footer>'
            return match.group(0)

        updated = re.sub(r'<footer([^>]*)>(.*?)</footer>', normalize, s, flags=re.S | re.I)
        if updated != s:
            p.write_text(updated, encoding='utf-8')


def keep_app_support_cache_busted():
    p = Path('app-support/index.html')
    if not p.exists():
        return
    s = p.read_text(encoding='utf-8')
    s = re.sub(
        r'/site-navigation\.js\?v=[^\"\']+',
        '/site-navigation.js?v=20260808-footer-dedupe-v1',
        s,
    )
    p.write_text(s, encoding='utf-8')


def main():
    remove_obsolete_navigation_contact_runtime()
    normalize_page_level_contact_footers()
    keep_app_support_cache_busted()
    print('Unified footer normalization applied: duplicate page-level URL/email rows removed.')


if __name__ == '__main__':
    main()
