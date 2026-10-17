#!/usr/bin/env python3
"""Change only translator asset query versions in existing production HTML."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import uuid

VERSION = b'20261017-cn-mainland-nmt-v2'
PATTERN = re.compile(rb'(/assets/cn-translate-baidu-v1\.(?:js|css)\?v=)[^\s\x22\x27&<>]+')


def replace(path, content, metadata, keep_mtime=False):
    temporary = path.with_name('.' + path.name + '.translation-' + uuid.uuid4().hex)
    try:
        with temporary.open('xb') as stream:
            stream.write(content)
        shutil.copystat(metadata, temporary)
        stat = metadata.stat()
        os.chown(temporary, stat.st_uid, stat.st_gid)
        if not keep_mtime:
            os.utime(temporary, None)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def refresh(root, backup):
    root = root.resolve()
    backup.mkdir(mode=0o700)
    manifest = {'root': str(root), 'files': []}
    (backup / 'manifest.json').write_text(json.dumps(manifest))
    # Both approved assets are already live; this repair changes references only.
    for name in ('cn-translate-baidu-v1.js', 'cn-translate-baidu-v1.css'):
        expected = Path(__file__).with_name(name).read_bytes()
        assert (root / 'assets' / name).read_bytes() == expected, 'Unexpected translator asset build'
    for path in root.rglob('*.html'):
        if path.is_symlink() or not path.resolve().is_relative_to(root):
            continue
        original = path.read_bytes()
        updated = PATTERN.sub(lambda match: match[1] + VERSION, original)
        if updated == original:
            continue
        relative = str(path.relative_to(root))
        saved = backup / relative
        saved.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, saved)
        stat = path.stat()
        os.chown(saved, stat.st_uid, stat.st_gid)
        manifest['files'].append(relative)
        (backup / 'manifest.json').write_text(json.dumps(manifest))
        # Replacing the version tokens is the only permitted byte difference.
        assert PATTERN.sub(rb'\1VERSION', updated) == PATTERN.sub(rb'\1VERSION', original)
        replace(path, updated, path)
    homepage = (root / 'index.html').read_bytes()
    assert b'cn-translate-baidu-v1.js?v=' + VERSION in homepage
    print(json.dumps({'translator_cache_version': VERSION.decode(), 'html_files_updated': len(manifest['files']),
                      'javascript_sha256': hashlib.sha256((root / 'assets/cn-translate-baidu-v1.js').read_bytes()).hexdigest()}))


def restore(backup):
    manifest_path = backup / 'manifest.json'
    if not manifest_path.exists():
        return
    manifest = json.loads(manifest_path.read_text())
    root = Path(manifest['root'])
    for relative in manifest['files']:
        target = root / relative
        assert target.resolve().is_relative_to(root.resolve())
        replace(target, (backup / relative).read_bytes(), backup / relative, keep_mtime=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path)
    parser.add_argument('--backup', type=Path, required=True)
    parser.add_argument('--restore', action='store_true')
    args = parser.parse_args()
    if args.restore:
        restore(args.backup)
    else:
        assert args.root is not None
        refresh(args.root, args.backup)
