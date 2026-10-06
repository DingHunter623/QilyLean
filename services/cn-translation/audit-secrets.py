#!/usr/bin/env python3
"""Value-based audit in a private Actions process; never output credentials or matches."""
import base64
import io
import json
import os
import subprocess
import urllib.parse
import urllib.request
import urllib.error
import zipfile

values = [os.environ[name].encode() for name in ('YOUDAO_APP_KEY', 'YOUDAO_APP_SECRET')]
assert all(values)
patterns = set(values)
for value in values:
    patterns.update([base64.b64encode(value), urllib.parse.quote_from_bytes(value, safe='').encode()])

def safe(data):
    return not any(pattern in data for pattern in patterns)

objects = subprocess.check_output(['git', 'rev-list', '--objects', '--all']).splitlines()
count = 0
process = subprocess.Popen(['git', 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
for line in objects:
    oid = line.split(b' ', 1)[0]
    process.stdin.write(oid + b'\n');process.stdin.flush()
    header = process.stdout.readline().split()
    size = int(header[2])
    remaining, tail = size, b''
    while remaining:
        block = process.stdout.read(min(remaining, 1024 * 1024))
        assert block
        assert safe(tail + block), 'Credential match in repository objects; details withheld'
        tail = block[-max(map(len, patterns)):]
        remaining -= len(block)
    process.stdout.read(1)
    count += 1
process.stdin.close();process.wait()

token = os.environ.get('GH_TOKEN')
logs = 0
if token:
    base = 'https://api.github.com/repos/' + os.environ['GITHUB_REPOSITORY']
    headers = {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'User-Agent': 'QilyLean-Secret-Audit'}
    with urllib.request.urlopen(urllib.request.Request(base + '/actions/workflows/deploy-cn-preprod.yml/runs?status=completed&per_page=3', headers=headers), timeout=25) as response:
        runs = json.load(response)['workflow_runs']
    for run in runs:
        # urllib strips Authorization on redirected archive domains in a fresh request.
        request = urllib.request.Request(base + f"/actions/runs/{run['id']}/logs", headers=headers)
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *args):
                return None
        try:
            urllib.request.build_opener(NoRedirect).open(request, timeout=25)
        except urllib.error.HTTPError as redirect:
            if redirect.code == 404 and run.get('conclusion') == 'cancelled':
                continue  # A cancelled queued job may have produced no log archive.
            assert redirect.code == 302
            location = redirect.headers['Location']
            with urllib.request.urlopen(location, timeout=25) as response:
                archive = zipfile.ZipFile(io.BytesIO(response.read()))
        for name in archive.namelist():
            assert safe(archive.read(name)), 'Credential match in Actions logs; details withheld'
            logs += 1
print(json.dumps({'secret_audit': {'repository_objects_checked': count, 'completed_actions_log_files_checked': logs, 'findings': 0}}))
