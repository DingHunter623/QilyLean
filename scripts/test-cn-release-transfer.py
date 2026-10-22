#!/usr/bin/env python3
"""Credential-free tests for the CN artifact pull and resumable upload boundary."""
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import Mock
import urllib.error
import zipfile

SPEC = importlib.util.spec_from_file_location('cn_release_transfer', Path(__file__).with_name('cn-release-transfer.py'))
transfer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(transfer)


class TransferTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.archive = self.root / transfer.ARCHIVE_NAME
        self.content = b'current approved CN content' * 100
        self.archive.write_bytes(self.content)
        self.destination = self.root / 'server' / transfer.ARCHIVE_NAME
        self.destination.parent.mkdir()
        self.destination.write_bytes(b'previous verified archive')
        self.request = {'url': 'https://example.blob.core.windows.net/private?sig=test-only',
                        'sha256': hashlib.sha256(self.content).hexdigest(),
                        'bytes': len(self.content), 'filename': transfer.ARCHIVE_NAME}

    def zip(self, target, content=None, name=transfer.ARCHIVE_NAME, extra=False):
        with zipfile.ZipFile(target, 'w') as bundle:
            bundle.writestr(name, self.content if content is None else content)
            if extra:
                bundle.writestr('unexpected.txt', 'reject')

    def test_artifact_redirect_does_not_follow_or_forward_token(self):
        opener = Mock()
        opener.open.side_effect = urllib.error.HTTPError(
            'https://api.github.com/test', 302, 'Found', {'Location': self.request['url']}, io.BytesIO())
        result = transfer.artifact_request('owner/repo', '123', self.archive, 'runner-only-token', opener)
        self.assertEqual(result, self.request)
        self.assertEqual(opener.open.call_count, 1)
        request = opener.open.call_args.args[0]
        self.assertEqual(request.get_header('Authorization'), 'Bearer runner-only-token')
        self.assertIsNone(transfer.NoRedirect().redirect_request(None, None, 302, '', {}, self.request['url']))

    def test_artifact_api_error_is_private(self):
        opener = Mock()
        opener.open.side_effect = urllib.error.HTTPError(
            'https://api.github.com/test', 403, 'Forbidden', {}, io.BytesIO())
        with self.assertRaisesRegex(ValueError, '^Artifact redirect unavailable$'):
            transfer.artifact_request('owner/repo', '123', self.archive, 'private-token', opener)

    def test_http_and_config_injection_are_rejected(self):
        for url in ('http://example.com/file', 'https://user:password@example.com/file',
                    'https://example.com/file\noutput = "unwanted"', 'https://example.com:80/file'):
            with self.subTest(url=url), self.assertRaises(ValueError):
                transfer.validate_request(dict(self.request, url=url))

    def test_pull_hides_url_and_enforces_tls_speed_and_time_limits(self):
        def curl(command, **kwargs):
            self.assertNotIn(self.request['url'], command)
            self.assertIn(self.request['url'], kwargs['input'])
            self.assertEqual(command[command.index('--proto') + 1], '=https')
            self.assertEqual(command[command.index('--proto-redir') + 1], '=https')
            self.assertEqual(command[command.index('--speed-limit') + 1], '65536')
            self.assertEqual(command[command.index('--speed-time') + 1], '30')
            self.assertEqual(command[command.index('--max-time') + 1], '2700')
            self.assertEqual(kwargs['stderr'], subprocess.DEVNULL)
            self.zip(command[command.index('--output') + 1])
            return subprocess.CompletedProcess(command, 0)
        transfer.pull(self.request, self.destination, run=curl)
        self.assertEqual(self.destination.read_bytes(), self.content)

    def test_slow_pull_preserves_previous_archive(self):
        with self.assertRaises(ValueError):
            transfer.pull(self.request, self.destination, run=Mock(return_value=Mock(returncode=28)))
        self.assertEqual(self.destination.read_bytes(), b'previous verified archive')

    def test_failure_diagnostics_never_include_private_exception_data(self):
        secret = 'https://private.example/archive?sig=secret-token'
        cases = (
            (transfer.TransferError(secret), 'validation'),
            (ValueError(secret), 'unexpected_error'),
            (PermissionError(13, secret, '/private/secret-key'), 'filesystem errno=13'),
            (urllib.error.URLError(secret), 'network'),
            (subprocess.TimeoutExpired(secret, 1), 'timeout'),
            (transfer.TransferError('Chunk checksum differs'), 'chunk_checksum'),
            (transfer.TransferError('Artifact download failed or fell below speed threshold',
                                    exit_code=28), 'artifact_download curl_exit=28'),
        )
        for error, reason in cases:
            with self.subTest(reason=reason):
                message = transfer.failure_diagnostic(error, 'accept')
                self.assertIn('stage=accept', message)
                self.assertIn('reason=' + reason, message)
                self.assertNotIn(secret, message)
                self.assertNotIn('/private/secret-key', message)
        self.assertIn('stage=startup', transfer.failure_diagnostic(ValueError(secret), secret))

    def test_cli_failure_reports_stage_without_echoing_private_input(self):
        result = subprocess.run([sys.executable, transfer.__file__, 'pull'],
                                input='{"url":"https://private.example/?sig=secret-token",',
                                text=True, capture_output=True)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout, '')
        self.assertIn('stage=pull reason=invalid_json', result.stderr)
        self.assertNotIn('secret-token', result.stderr)

    def test_zip_extra_member_traversal_and_wrong_hash_never_replace_archive(self):
        path = self.root / 'artifact.zip'
        for options in ({'extra': True}, {'name': '../' + transfer.ARCHIVE_NAME},
                        {'content': b'x' * len(self.content)}):
            with self.subTest(options=options):
                self.zip(path, **options)
                with self.assertRaises(ValueError):
                    transfer.extract_verified(path, self.request, self.destination)
                self.assertEqual(self.destination.read_bytes(), b'previous verified archive')
                self.assertEqual(list(self.destination.parent.glob('.qily-cn-archive-*')), [])

    def chunks(self):
        self.archive.write_bytes(b'A' * transfer.CHUNK_BYTES + b'B' * 91)
        self.parts = self.root / 'parts'
        self.cache = self.root / 'cache'
        return transfer.make_manifest(self.archive, self.parts)

    def accept(self, manifest, index):
        staging = transfer.cache_directory(manifest, self.cache)
        incoming = staging / f'.incoming-test-{index}'
        incoming.write_bytes((self.parts / f'part.{index:04d}').read_bytes())
        transfer.accept_chunk(manifest, index, incoming, self.cache)

    def test_interrupted_upload_resumes_only_verified_chunks(self):
        manifest = self.chunks()
        self.assertEqual(transfer.missing_chunks(manifest, self.cache), [0, 1])
        self.accept(manifest, 0)
        staging = transfer.cache_directory(manifest, self.cache)
        (staging / '.incoming-interrupted').write_bytes(b'partial')
        self.assertEqual(transfer.missing_chunks(manifest, self.cache), [1])
        self.accept(manifest, 1)
        transfer.assemble(manifest, self.destination, self.cache)
        self.assertEqual(self.destination.read_bytes(), self.archive.read_bytes())
        self.assertEqual(transfer.missing_chunks(manifest, self.cache), [])

    def test_four_parallel_cli_accepts_preserve_resumable_integrity(self):
        self.archive.write_bytes(b'A' * transfer.CHUNK_BYTES * 4 + b'last')
        self.parts, self.cache = self.root / 'parts', self.root / 'cache'
        manifest = transfer.make_manifest(self.archive, self.parts)
        manifest_path = self.root / 'manifest.json'
        manifest_path.write_text(json.dumps(manifest))
        staging = transfer.cache_directory(manifest, self.cache)
        processes = []
        for index in range(4):
            incoming = staging / f'.incoming-run-1-{index:04d}'
            incoming.write_bytes((self.parts / f'part.{index:04d}').read_bytes())
            processes.append(subprocess.Popen(
                [sys.executable, transfer.__file__, 'accept', '--manifest', str(manifest_path),
                 '--cache-root', str(self.cache), '--index', f'{index:04d}',
                 '--incoming', str(incoming)], stdout=subprocess.PIPE, stderr=subprocess.PIPE))
        for process in processes:
            stdout, stderr = process.communicate(timeout=10)
            self.assertEqual(process.returncode, 0, stderr.decode())
            self.assertEqual(stdout, b'')
        self.assertEqual(transfer.missing_chunks(manifest, self.cache), [4])
        self.accept(manifest, 4)
        transfer.assemble(manifest, self.destination, self.cache)
        self.assertEqual(self.destination.read_bytes(), self.archive.read_bytes())

    def test_corrupt_chunk_is_missing_and_cannot_be_accepted(self):
        manifest = self.chunks()
        self.accept(manifest, 0)
        staging = transfer.cache_directory(manifest, self.cache)
        (staging / 'part.0000').write_bytes(b'wrong')
        incoming = staging / '.incoming-bad'
        incoming.write_bytes(b'wrong')
        with self.assertRaises(ValueError):
            transfer.accept_chunk(manifest, 1, incoming, self.cache)
        self.assertFalse(incoming.exists())
        self.assertEqual(transfer.missing_chunks(manifest, self.cache), [0, 1])
        with self.assertRaises(ValueError):
            transfer.assemble(manifest, self.destination, self.cache)
        self.assertEqual(self.destination.read_bytes(), b'previous verified archive')

    def test_full_archive_checksum_is_required_even_with_valid_chunk_hashes(self):
        manifest = self.chunks()
        manifest['sha256'] = '0' * 64
        self.accept(manifest, 0)
        self.accept(manifest, 1)
        with self.assertRaises(ValueError):
            transfer.assemble(manifest, self.destination, self.cache)
        self.assertEqual(self.destination.read_bytes(), b'previous verified archive')

    def test_wrong_release_cache_cannot_satisfy_resume(self):
        manifest = self.chunks()
        self.accept(manifest, 0)
        changed = dict(manifest, sha256='f' * 64)
        self.assertEqual(transfer.missing_chunks(changed, self.cache), [0, 1])

    def test_invalid_manifest_cannot_address_arbitrary_paths(self):
        manifest = self.chunks()
        for changed in (dict(manifest, sha256='../outside'), dict(manifest, chunks=[]),
                        dict(manifest, bytes=-1)):
            with self.assertRaises(ValueError):
                transfer.validate_manifest(changed)

    def test_only_week_old_checksum_named_caches_are_pruned(self):
        manifest = self.chunks()
        self.cache.mkdir()
        old = self.cache / ('e' * 64)
        old.mkdir()
        os.utime(old, (0, 0))
        unrelated = self.cache / 'keep-unrelated'
        unrelated.mkdir()
        os.utime(unrelated, (0, 0))
        transfer.missing_chunks(manifest, self.cache)
        self.assertFalse(old.exists())
        self.assertTrue(unrelated.exists())

    def test_chunk_upload_does_not_consume_the_manifest_stdin(self):
        """SSH spawned inside the while-read loop must not drain its input file."""
        workflow = (Path(__file__).resolve().parents[1] /
                    '.github/workflows/deploy-cn-preprod.yml').read_text()
        self.assertIn('done < "$LOCAL_PARTS/missing.txt"', workflow)
        self.assertIn('"$USER_NAME@$CN_PREPROD_HOST:$incoming" </dev/null &&', workflow)
        self.assertIn('timeout 90s ssh -n "${SSH_OPTS[@]}"', workflow)

    def test_workflow_archive_is_deterministic_across_checkout_mtimes(self):
        tar = shutil.which('gtar') or shutil.which('tar')
        if not tar or 'GNU tar' not in subprocess.check_output([tar, '--version'], text=True):
            self.skipTest('GNU tar test runs on the Ubuntu Actions runner')
        workflow = Path(__file__).resolve().parents[1] / '.github/workflows/deploy-cn-preprod.yml'
        match = re.search(r'(?m)^          (tar --sort=name[\s\S]*?\| gzip -n > /tmp/qilylean-cn-site.tar.gz)\n',
                          workflow.read_text())
        self.assertIsNotNone(match, 'Workflow must use the reviewed deterministic archive command')
        source = self.root / 'site'
        source.mkdir()
        (source / 'second.txt').write_text('second')
        first = source / 'first.txt'
        first.write_text('first')
        packed = self.root / 'deterministic.tar.gz'
        command = match.group(1).replace('tar ', shlex.quote(tar) + ' ', 1)
        command = command.replace('-C cn-site .', '-C ' + shlex.quote(str(source)) + ' .')
        command = command.replace('/tmp/qilylean-cn-site.tar.gz', shlex.quote(str(packed)))
        subprocess.run(['bash', '-eo', 'pipefail', '-c', command], check=True)
        expected = packed.read_bytes()
        os.utime(first, (1700000000, 1700000000))
        os.utime(source, (1750000000, 1750000000))
        subprocess.run(['bash', '-eo', 'pipefail', '-c', command], check=True)
        self.assertEqual(packed.read_bytes(), expected)
        first.write_text('changed source bytes')
        subprocess.run(['bash', '-eo', 'pipefail', '-c', command], check=True)
        self.assertNotEqual(packed.read_bytes(), expected)


if __name__ == '__main__':
    unittest.main()
