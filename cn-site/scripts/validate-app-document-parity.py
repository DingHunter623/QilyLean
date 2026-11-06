#!/usr/bin/env python3
"""Fail closed when a CN APP document diverges from its accepted COM source."""
from __future__ import annotations

import hashlib
import html
import importlib
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

CN = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(CN / 'scripts'))
documents = importlib.import_module('materialize-app-document-parity')


def digest_bytes(value):
    return hashlib.sha256(value).hexdigest()


def validate():
    manifest_path = CN / 'archive/app-document-parity.json'
    if not manifest_path.is_file():
        raise RuntimeError('APP document parity manifest missing; run materialize-app-document-parity.py')
    manifest = json.loads(manifest_path.read_text())
    if manifest['version'] != documents.VERSION:
        raise RuntimeError('APP document compiler version is stale')
    if {row['target'] for row in manifest['pages']} != set(documents.PAGES):
        raise RuntimeError('APP document coverage is incomplete')
    for row in manifest['pages']:
        name = row['target']
        source, target = documents.ROOT / row['source'], CN / name
        raw, published = source.read_text(), target.read_text()
        if documents.digest(source) != row['source_sha256']:
            raise RuntimeError('APP document source changed without regeneration: ' + name)
        main = re.search(r'<main\b[^>]*>[\s\S]*?</main>', published).group(0)
        if digest_bytes(main.encode()) != row['main_sha256']:
            raise RuntimeError('Generated APP document DOM changed: ' + name)
        hero, expected = documents.source_sections(raw, name)
        if hero not in main:
            raise RuntimeError('APP document hero differs from COM source: ' + name)
        actual = re.search(r'<div class="wrap qily-app-document-wrap(?: times-support-mirror)?">([\s\S]*)</div></main>$', main)
        if not actual or actual.group(1) != expected:
            raise RuntimeError('APP document body differs beyond approved CN facts: ' + name)
        if 'https://qilylean.com/' in main:
            raise RuntimeError('CN APP document contains international official-site facts: ' + name)
        gutter = 'stable' if '/site-closure-bundle-v24.css' in raw else 'auto'
        if 'data-cn-source-scrollbar-gutter="' + gutter + '"' not in main:
            raise RuntimeError('APP document viewport gutter differs from COM source: ' + name)
        if documents.parity.protected_dom(published) != row['protected']:
            raise RuntimeError('CN APP document shell changed: ' + name)
        if '湘ICP备2026041143号-1' not in published or 'cn-translate-baidu-v1.js' not in published:
            raise RuntimeError('CN APP document filing or translation missing: ' + name)
        if re.search(r'qilyCn(?:TimesReleaseDocsViV115|DualAppSupportParityV116)', published):
            raise RuntimeError('Hand-authored APP document CSS overrides source: ' + name)
        tags = re.findall(r'<link\b[^>]*data-cn-app-document-css[^>]*>', published)
        urls = [html.unescape(re.search(r'href="([^"]+)"', tag).group(1)) for tag in tags]
        if urls != row['style_urls']:
            raise RuntimeError('APP document source stylesheet cascade reordered: ' + name)
        inline = re.findall(r'<style\b[^>]*data-cn-app-document-css[^>]*>([\s\S]*?)</style>', published)
        if digest_bytes('\n'.join(inline).encode()) != row['inline_css_sha256']:
            raise RuntimeError('APP document inline source CSS changed: ' + name)
        if not urls[-1].startswith('/assets/app-document-source/site-visual-authority-r8.css?v='):
            raise RuntimeError('APP document source R8 authority is not last: ' + name)
    for row in manifest['styles']:
        source = documents.ROOT / row['source']
        target = CN / unquote(urlsplit(row['url']).path).lstrip('/')
        if documents.digest(source) != row['source_sha256'] or not target.is_file() or documents.digest(target) != row['sha256']:
            raise RuntimeError('APP document stylesheet provenance failed: ' + row['source'])
    return len(manifest['pages']), len(manifest['styles'])


if __name__ == '__main__':
    pages, styles = validate()
    print(f'PASS: {pages} complete APP document DOMs and {styles} source styles; only approved CN facts differ.')
