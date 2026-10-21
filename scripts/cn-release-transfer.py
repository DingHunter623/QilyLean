#!/usr/bin/env python3
"""Stage a CN release without publishing it or sending GitHub credentials abroad.

Only artifact-request runs on the Actions runner. Its private JSON output travels
directly to pull over SSH stdin. All other commands need only the Python stdlib
and curl on the mainland host. Verified SCP chunks survive interrupted runs.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile

ARCHIVE_NAME = 'qilylean-cn-site.tar.gz'
CHUNK_BYTES = 512 * 1024
SHA256 = re.compile(r'^[a-f0-9]{64}$')
DEFAULT_CACHE = Path('/tmp/qily-cn-release-cache')
DEFAULT_ARCHIVE = Path('/tmp') / ARCHIVE_NAME


class TransferError(ValueError):
    """Internal validation failure with a fixed, non-sensitive diagnostic code."""
    CODES = {
        'Artifact redirect unavailable': 'artifact_redirect',
        'Artifact download failed or fell below speed threshold': 'artifact_download',
        'Artifact checksum differs': 'artifact_checksum',
        'Invalid cache directory': 'cache_directory',
        'Invalid staging directory': 'staging_directory',
        'Invalid chunk number': 'chunk_number',
        'Invalid incoming chunk path': 'chunk_path',
        'Chunk checksum differs': 'chunk_checksum',
        'Missing or corrupt release chunk': 'missing_chunk',
        'Assembled archive checksum differs': 'archive_checksum',
    }

    def __init__(self, message, exit_code=None):
        super().__init__(message)
        self.code = self.CODES.get(message, 'validation')
        self.exit_code = exit_code if type(exit_code) is int else None


def failure_diagnostic(error, command):
    """Do not include exception text, URLs, filesystem paths or request data."""
    stages = {'artifact-request', 'pull', 'split', 'missing', 'accept', 'assemble'}
    stage = command if command in stages else 'startup'
    if isinstance(error, TransferError):
        reason = error.code
        if error.exit_code is not None:
            reason += f' curl_exit={error.exit_code}'
    elif isinstance(error, (subprocess.TimeoutExpired, TimeoutError)):
        reason = 'timeout'
    elif isinstance(error, (InterruptedError, KeyboardInterrupt)):
        reason = 'interrupted'
    elif isinstance(error, urllib.error.HTTPError):
        reason = f'http_status={error.code}' if type(error.code) is int else 'http_error'
    elif isinstance(error, urllib.error.URLError):
        reason = 'network'
    elif isinstance(error, OSError):
        reason = 'filesystem'
        if type(error.errno) is int:
            reason += f' errno={error.errno}'
    elif isinstance(error, json.JSONDecodeError):
        reason = 'invalid_json'
    else:
        reason = 'unexpected_error'
    return f'Release transfer failed: stage={stage} reason={reason}; private details withheld.'


def require(condition, message):
    if not condition:
        raise TransferError(message)


def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def valid_url(value):
    require(isinstance(value, str) and len(value) <= 32768, 'Invalid download address')
    require(not any(ord(c) < 32 or ord(c) == 127 for c in value), 'Invalid download address')
    parsed = urllib.parse.urlsplit(value)
    require(parsed.scheme == 'https' and parsed.hostname and not parsed.username
            and not parsed.password and not parsed.fragment, 'HTTPS download required')
    require(parsed.port in (None, 443), 'HTTPS download required')
    return value


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def artifact_request(repository, artifact_id, archive, token, opener=None):
    """Capture only GitHub's 302 Location; never forward Authorization to storage."""
    require(re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repository), 'Invalid repository')
    require(artifact_id.isdigit() and int(artifact_id) > 0, 'Invalid artifact identity')
    require(bool(token), 'Runner authentication missing')
    request = urllib.request.Request(
        f'https://api.github.com/repos/{repository}/actions/artifacts/{artifact_id}/zip',
        headers={'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json',
                 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'QilyLean-CN-Release/1.0'})
    opener = opener or urllib.request.build_opener(NoRedirect())
    location = None
    try:
        with opener.open(request, timeout=30) as response:
            if response.status == 302:
                location = response.headers.get('Location')
    except urllib.error.HTTPError as error:
        if error.code == 302:
            location = error.headers.get('Location')
        error.close()
    require(location is not None, 'Artifact redirect unavailable')
    return {'url': valid_url(location), 'sha256': digest(archive),
            'bytes': Path(archive).stat().st_size, 'filename': ARCHIVE_NAME}


def validate_request(request):
    require(isinstance(request, dict), 'Invalid download request')
    require(SHA256.fullmatch(str(request.get('sha256', ''))), 'Invalid archive checksum')
    require(type(request.get('bytes')) is int and 0 < request['bytes'] <= 5 * 1024**3,
            'Invalid archive size')
    require(request.get('filename') == ARCHIVE_NAME, 'Invalid archive filename')
    valid_url(request.get('url'))
    return request


def extract_verified(zip_path, request, destination):
    """No extractall: reject extra files, paths, symlinks and oversized members."""
    destination = Path(destination)
    with zipfile.ZipFile(zip_path) as bundle:
        entries = bundle.infolist()
        require(len(entries) == 1, 'Artifact must contain exactly one archive')
        member = entries[0]
        mode = member.external_attr >> 16
        require(member.filename == ARCHIVE_NAME and not member.is_dir()
                and (mode & 0o170000) != 0o120000 and not (member.flag_bits & 1),
                'Invalid artifact member')
        require(member.file_size == request['bytes'], 'Artifact size differs')
        destination.parent.mkdir(parents=True, exist_ok=True)
        fd, temporary = tempfile.mkstemp(prefix='.qily-cn-archive-', dir=destination.parent)
        try:
            h, size = hashlib.sha256(), 0
            with os.fdopen(fd, 'wb') as output, bundle.open(member) as source:
                for block in iter(lambda: source.read(1024 * 1024), b''):
                    size += len(block)
                    require(size <= request['bytes'], 'Artifact size differs')
                    h.update(block)
                    output.write(block)
                output.flush()
                os.fsync(output.fileno())
            require(size == request['bytes'] and h.hexdigest() == request['sha256'],
                    'Artifact checksum differs')
            os.replace(temporary, destination)
        finally:
            Path(temporary).unlink(missing_ok=True)


def pull(request, destination=DEFAULT_ARCHIVE, run=subprocess.run):
    request = validate_request(request)
    # curl's URL is supplied on stdin, absent from argv, process listings and logs.
    # Its stderr is deliberately withheld: storage errors can include signed URLs.
    with tempfile.TemporaryDirectory(prefix='qily-cn-artifact-') as staging:
        zip_path = Path(staging) / 'artifact.zip'
        config = 'url = "' + request['url'].replace('\\', '\\\\').replace('"', '\\"') + '"\n'
        command = ['curl', '--config', '-', '--fail', '--silent', '--location',
                   '--proto', '=https', '--proto-redir', '=https',
                   '--connect-timeout', '20', '--speed-limit', '65536',
                   '--speed-time', '30', '--max-time', '2700',
                   '--max-filesize', str(request['bytes'] + 1024 * 1024),
                   '--output', str(zip_path)]
        result = run(command, input=config, text=True, stdout=subprocess.DEVNULL,
                     stderr=subprocess.DEVNULL, timeout=2715, check=False)
        if result.returncode != 0:
            raise TransferError('Artifact download failed or fell below speed threshold',
                                exit_code=result.returncode)
        extract_verified(zip_path, request, destination)


def make_manifest(archive, chunks_directory):
    archive, chunks_directory = Path(archive), Path(chunks_directory)
    chunks_directory.mkdir(parents=True, exist_ok=True)
    rows, h, size = [], hashlib.sha256(), 0
    with archive.open('rb') as source:
        for index, block in enumerate(iter(lambda: source.read(CHUNK_BYTES), b'')):
            h.update(block)
            size += len(block)
            (chunks_directory / f'part.{index:04d}').write_bytes(block)
            rows.append({'sha256': hashlib.sha256(block).hexdigest(), 'bytes': len(block)})
    manifest = {'version': 1, 'filename': ARCHIVE_NAME, 'sha256': h.hexdigest(),
                'bytes': size, 'chunkBytes': CHUNK_BYTES, 'chunks': rows}
    validate_manifest(manifest)
    return manifest


def validate_manifest(manifest):
    require(isinstance(manifest, dict) and manifest.get('version') == 1, 'Invalid chunk manifest')
    require(manifest.get('filename') == ARCHIVE_NAME
            and SHA256.fullmatch(str(manifest.get('sha256', ''))), 'Invalid archive identity')
    size, rows = manifest.get('bytes'), manifest.get('chunks')
    require(type(size) is int and 0 < size <= 5 * 1024**3, 'Invalid archive size')
    require(manifest.get('chunkBytes') == CHUNK_BYTES and isinstance(rows, list)
            and len(rows) == math.ceil(size / CHUNK_BYTES), 'Invalid chunk count')
    for index, row in enumerate(rows):
        expected_size = min(CHUNK_BYTES, size - index * CHUNK_BYTES)
        require(isinstance(row, dict) and row.get('bytes') == expected_size
                and SHA256.fullmatch(str(row.get('sha256', ''))), 'Invalid chunk identity')
    return manifest


def cache_directory(manifest, cache_root=DEFAULT_CACHE):
    cache_root = Path(cache_root)
    cache_root.mkdir(parents=True, exist_ok=True, mode=0o700)
    require(not cache_root.is_symlink(), 'Invalid cache directory')
    staging = cache_root / manifest['sha256']
    require(not staging.is_symlink(), 'Invalid staging directory')
    staging.mkdir(exist_ok=True, mode=0o700)
    os.utime(staging, None)
    return staging


def verified_chunk(path, row):
    path = Path(path)
    return (not path.is_symlink() and path.is_file() and path.stat().st_size == row['bytes']
            and digest(path) == row['sha256'])


def missing_chunks(manifest, cache_root=DEFAULT_CACHE):
    staging = cache_directory(manifest, cache_root)
    # Only prune checksum-named, inactive caches. Keep this release and a full
    # week of resumable uploads; a single production job is bounded to five hours.
    cutoff = time.time() - 7 * 86400
    for other in Path(cache_root).iterdir():
        if (other != staging and SHA256.fullmatch(other.name) and not other.is_symlink()
                and other.is_dir() and other.stat().st_mtime < cutoff):
            shutil.rmtree(other)
    return [index for index, row in enumerate(manifest['chunks'])
            if not verified_chunk(staging / f'part.{index:04d}', row)]


def accept_chunk(manifest, index, incoming, cache_root=DEFAULT_CACHE):
    require(0 <= index < len(manifest['chunks']), 'Invalid chunk number')
    incoming = Path(incoming)
    staging = cache_directory(manifest, cache_root)
    require(incoming.parent.resolve() == staging.resolve()
            and incoming.name.startswith('.incoming-'), 'Invalid incoming chunk path')
    try:
        require(verified_chunk(incoming, manifest['chunks'][index]), 'Chunk checksum differs')
        os.replace(incoming, staging / f'part.{index:04d}')
    finally:
        incoming.unlink(missing_ok=True)


def assemble(manifest, destination=DEFAULT_ARCHIVE, cache_root=DEFAULT_CACHE):
    staging, destination = cache_directory(manifest, cache_root), Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix='.qily-cn-archive-', dir=destination.parent)
    try:
        h, size = hashlib.sha256(), 0
        with os.fdopen(fd, 'wb') as output:
            for index, row in enumerate(manifest['chunks']):
                part = staging / f'part.{index:04d}'
                require(verified_chunk(part, row), 'Missing or corrupt release chunk')
                with part.open('rb') as source:
                    for block in iter(lambda: source.read(1024 * 1024), b''):
                        h.update(block)
                        size += len(block)
                        output.write(block)
            output.flush()
            os.fsync(output.fileno())
        require(size == manifest['bytes'] and h.hexdigest() == manifest['sha256'],
                'Assembled archive checksum differs')
        os.replace(temporary, destination)
    finally:
        Path(temporary).unlink(missing_ok=True)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    request = commands.add_parser('artifact-request')
    request.add_argument('--repository', required=True)
    request.add_argument('--artifact-id', required=True)
    request.add_argument('--archive', type=Path, default=DEFAULT_ARCHIVE)
    download = commands.add_parser('pull')
    download.add_argument('--destination', type=Path, default=DEFAULT_ARCHIVE)
    split = commands.add_parser('split')
    split.add_argument('--archive', type=Path, default=DEFAULT_ARCHIVE)
    split.add_argument('--directory', type=Path, required=True)
    for name in ('missing', 'accept', 'assemble'):
        sub = commands.add_parser(name)
        sub.add_argument('--manifest', type=Path, required=True)
        sub.add_argument('--cache-root', type=Path, default=DEFAULT_CACHE)
        if name == 'accept':
            sub.add_argument('--index', type=int, required=True)
            sub.add_argument('--incoming', type=Path, required=True)
        if name == 'assemble':
            sub.add_argument('--destination', type=Path, default=DEFAULT_ARCHIVE)
    args = parser.parse_args(argv)
    if args.command == 'artifact-request':
        # Never tee, log or save this output: it contains the expiring storage URL.
        print(json.dumps(artifact_request(args.repository, args.artifact_id,
                                         args.archive, os.environ.get('GH_TOKEN', ''))))
    elif args.command == 'pull':
        data = sys.stdin.read(65537)
        require(len(data) <= 65536, 'Download request too large')
        pull(json.loads(data), args.destination)
        print('Artifact pulled and release archive checksum verified.')
    elif args.command == 'split':
        print(json.dumps(make_manifest(args.archive, args.directory), sort_keys=True))
    else:
        manifest = validate_manifest(json.loads(args.manifest.read_text()))
        if args.command == 'missing':
            for index in missing_chunks(manifest, args.cache_root):
                print(f'{index:04d}')
        elif args.command == 'accept':
            accept_chunk(manifest, args.index, args.incoming, args.cache_root)
        else:
            assemble(manifest, args.destination, args.cache_root)
            print('Resumed release archive checksum verified.')


if __name__ == '__main__':
    def interrupted(signum, frame):
        raise InterruptedError('Transfer interrupted')
    signal.signal(signal.SIGTERM, interrupted)
    try:
        main()
    except (Exception, KeyboardInterrupt) as error:
        # In particular, never stringify urllib/curl exceptions or the request:
        # exception messages may contain a signed URL or runner credentials.
        print(failure_diagnostic(error, sys.argv[1] if len(sys.argv) > 1 else ''),
              file=sys.stderr)
        sys.exit(1)
