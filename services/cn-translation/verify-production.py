#!/usr/bin/env python3
"""Actual mainland NMT calls and value-based secret audit; outputs public evidence only."""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import urllib.parse
import urllib.request
import uuid
import server

parser = argparse.ArgumentParser()
parser.add_argument('--production', action='store_true')
args = parser.parse_args()
keys = json.loads(Path('/etc/qilylean-cn/translate.json').read_text()) if args.production else server.credentials()
if not args.production:
    directory = os.environ.get('CREDENTIALS_DIRECTORY')
    raw_keys = json.loads((Path(directory) / 'youdao').read_text()) if directory else {name: os.environ.get(name, '') for name in ('YOUDAO_APP_KEY', 'YOUDAO_APP_SECRET')}
    def copied_format(name):
        value = raw_keys[name].strip()
        return {'assignment_wrapper': value.startswith(name + '=') or value.startswith(name + ' ='),
                'quote_wrapper': len(value) > 1 and value[0] in '\x22\x27`' and value[-1] == value[0],
                'normalized_changed': value != keys[name]}
    print(json.dumps({'credential_format': {name: copied_format(name) for name in raw_keys}}))
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
interfaces = json.loads(subprocess.check_output(['ip', '-j', 'link']))
tunnels = [item['ifname'] for item in interfaces if item.get('link_type') in ('wireguard', 'tun', 'gre', 'ipip') or item['ifname'].startswith(('tun', 'wg', 'tailscale'))]
assert not tunnels, 'VPN/tunnel interface detected; cannot assert direct mainland verification'
nonce = uuid.uuid4().hex[:12]
samples = [
    ('en', '从现场事实出发，把制造经验沉淀为可复用的知识资产。验收编号：' + nonce),
    ('zh-CN', 'Use engineering data to improve quality and delivery. Verification: ' + nonce),
]
evidence = {'requested_provider': 'youdao', 'endpoint': server.URL, 'proxy': 'explicit ProxyHandler({}); direct TLS', 'vpn_interfaces': tunnels, 'tests': []}
for target, source in samples:
    try:
        translated = server.youdao([source], target, keys, timeout=55)[0]
    except server.TranslationError as error:
        evidence['tests'].append({'target': target, 'text': source, 'translation': None, 'error': str(error)})
        continue
    assert translated != source and translated.strip(), 'NMT did not translate actual text'
    sample = {'target': target, 'text': source, 'translation': translated, 'provider': 'youdao'}
    if args.production:
        request = urllib.request.Request('https://qilylean.cn/translate', data=json.dumps({
            'target_language': target, 'texts': [source],
        }).encode(), headers={'Content-Type': 'application/json'})
        with opener.open(request, timeout=65) as response:
            result = json.load(response)
        assert result['ok'] and result['provider'] == 'youdao' and result['cached'] is False
        assert result['translations'] == [translated], 'Production result differs from actual Youdao NMT'
        sample['production_result'] = result
    evidence['tests'].append(sample)

if any(test.get('error') for test in evidence['tests']):
    print(json.dumps(evidence, ensure_ascii=False))
    raise SystemExit('FAIL: actual mainland NMT translation did not pass; no publication allowed')

if args.production:
    installed = Path('/opt/qilylean-cn-translation/server.py')
    with opener.open('http://127.0.0.1:8081/health', timeout=10) as response:
        health = json.load(response)
    assert health['build_sha256'] == hashlib.sha256(installed.read_bytes()).hexdigest() == server.BUILD_SHA256
    evidence['build_sha256'] = health['build_sha256']
    # Compare real values only inside this root process. Never print values, matches or lines.
    variants = set()
    for value in list(keys.values()) + list(server.normalize_credentials(keys).values()):
        variants.update([value.encode(), urllib.parse.quote(value, safe='').encode(), base64.b64encode(value.encode())])
    def safe(content):
        return not any(value in content for value in variants)
    root = Path('/var/www/qilylean-cn/current').resolve()
    files = [file for file in root.rglob('*') if file.is_file()]
    assert all(safe(file.read_bytes()) for file in files), 'Secret audit failed in webroot'
    journal = subprocess.check_output(['journalctl', '-u', 'qilylean-cn-translation', '--no-pager', '-o', 'cat'])
    assert safe(journal), 'Secret audit failed in service journal'
    logs = [file for file in Path('/var/log/nginx').glob('*.log') if file.is_file()]
    assert all(safe(file.read_bytes()) for file in logs), 'Secret audit failed in Nginx logs'
    unit = subprocess.check_output(['systemctl', 'cat', 'qilylean-cn-translation'])
    assert safe(unit) and b'LoadCredential=' in unit
    assert (Path('/etc/qilylean-cn/translate.json').stat().st_mode & 0o777) == 0o600
    assert (Path('/etc/qilylean-cn').stat().st_mode & 0o777) == 0o700
    environment = subprocess.check_output(['systemctl', 'show', 'qilylean-cn-translation', '-p', 'Environment'])
    assert safe(environment)
    evidence['secret_audit'] = {'webroot_files': len(files), 'service_journal': 'PASS', 'nginx_logs': 'PASS', 'systemd_environment': 'PASS', 'credential_mode': '0600 in 0700 directory', 'findings': 0}
    evidence['release'] = root.name
print(json.dumps(evidence, ensure_ascii=False))
