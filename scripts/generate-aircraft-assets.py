#!/usr/bin/env python3
"""Derive responsive lossless aircraft delivery assets from the uploaded PNGs.

Original source files are never rewritten. --check verifies every delivery
image against its source pixels (or the declared Lanczos resize) and manifest.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import quote

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'assets/aircraft/manifest.json'
VERSION = '20261019-aircraft-refresh-v1'
SITES = {
    'international': ('飞机模型国际站.png', 'assets/aircraft'),
    'china': ('cn-site/飞机模型中国站.png', 'cn-site/assets/aircraft'),
}
WIDTHS = (912, 1824, 2736)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def generate(check=False):
    previous = json.loads(MANIFEST.read_text()) if check else None
    manifest = {'version': VERSION, 'format': 'webp-lossless', 'sites': {}}
    for site, (name, folder) in SITES.items():
        source = ROOT / name
        data = source.read_bytes()
        with Image.open(source) as opened:
            assert opened.format == 'PNG', 'Uploaded artwork must remain PNG'
            image = opened.convert('RGBA')
            profile = opened.info.get('icc_profile')
        assert image.size == (2736, 1536), 'Unexpected uploaded artwork dimensions'
        public_source = name.removeprefix('cn-site/')
        record = {'source': name, 'source_url': '/' + quote(public_source, safe='/'),
                  'sha256': digest(data), 'bytes': len(data), 'width': image.width,
                  'height': image.height, 'variants': []}
        for width in WIDTHS:
            height = image.height * width // image.width
            assert image.height * width % image.width == 0, 'Derivative aspect ratio changed'
            pixels = image if width == image.width else image.resize((width, height), Image.Resampling.LANCZOS)
            target = ROOT / folder / f'aircraft-{site}-20261019-{width}.webp'
            if not check:
                target.parent.mkdir(parents=True, exist_ok=True)
                options = {'lossless': True, 'quality': 100, 'method': 6, 'exact': True}
                if profile:
                    options['icc_profile'] = profile
                pixels.save(target, format='WEBP', **options)
            with Image.open(target) as delivered:
                assert delivered.size == pixels.size and delivered.convert('RGBA').tobytes() == pixels.tobytes(), 'Delivery pixels differ from approved source: ' + str(target)
                assert delivered.info.get('icc_profile') == profile, 'Artwork color profile changed'
            relative = target.relative_to(ROOT).as_posix()
            public_path = relative.removeprefix('cn-site/')
            encoded = target.read_bytes()
            record['variants'].append({'path': relative, 'url': '/' + public_path,
                                       'width': width, 'height': height,
                                       'bytes': len(encoded), 'sha256': digest(encoded)})
        manifest['sites'][site] = record
    if check:
        assert previous == manifest, 'Aircraft manifest no longer matches sources and delivery bytes'
    else:
        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    for site, record in manifest['sites'].items():
        print(site, json.dumps({'source_bytes': record['bytes'], 'dimensions': [record['width'], record['height']],
                               'lossless_webp_bytes': {row['width']: row['bytes'] for row in record['variants']}}, ensure_ascii=False))
    print('PASS: source originals unchanged; every delivery image has exact approved pixels at its declared size.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    generate(parser.parse_args().check)
