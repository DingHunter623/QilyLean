#!/usr/bin/env bash
set -euo pipefail
STAGED=/tmp/qilylean-cn-translation
KEYS=/tmp/qilylean-cn-youdao
DEST=/opt/qilylean-cn-translation
UNIT=/etc/systemd/system/qilylean-cn-translation.service
CONF=/etc/qilylean-cn/translate.json
test "$(id -u)" = 0
command -v python3 >/dev/null
test -s "$KEYS/youdao"
trap 'rm -rf "$KEYS"' EXIT

# Verify the staged code and credentials against Youdao before changing the service.
CREDENTIALS_DIRECTORY="$KEYS" python3 "$STAGED/server.py" --verify
BACKUP="$(mktemp -d)"
HAD_SERVICE=false
if test -f "$UNIT"; then
  HAD_SERVICE=true
  cp -a "$DEST" "$BACKUP/service"
  cp -a "$UNIT" "$BACKUP/unit"
  cp -a "$CONF" "$BACKUP/credentials"
fi
rollback() {
  if "$HAD_SERVICE"; then
    cp -a "$BACKUP/service/." "$DEST/"
    cp -a "$BACKUP/unit" "$UNIT"
    cp -a "$BACKUP/credentials" "$CONF"
    systemctl daemon-reload
    systemctl restart qilylean-cn-translation
  else
    systemctl disable --now qilylean-cn-translation || true
    rm -f "$UNIT" "$CONF"
    systemctl daemon-reload
  fi
}
trap 'rollback; rm -rf "$KEYS" "$BACKUP"' ERR
install -d -m 0755 "$DEST"
install -d -m 0700 /etc/qilylean-cn
install -m 0644 "$STAGED/server.py" "$STAGED/protected-tokens.json" "$DEST/"
install -m 0600 "$KEYS/youdao" "$CONF"
install -m 0644 "$STAGED/qilylean-cn-translation.service" "$UNIT"
systemctl daemon-reload
systemctl enable qilylean-cn-translation
systemctl restart qilylean-cn-translation
EXPECTED_BUILD="$(sha256sum "$STAGED/server.py" | cut -d' ' -f1)"
for attempt in {1..10}; do
  if EXPECTED_BUILD="$EXPECTED_BUILD" python3 - <<'PY'
import json, os, urllib.request, uuid
with urllib.request.urlopen('http://127.0.0.1:8081/health', timeout=2) as response:
    health = json.load(response)
assert health.get('build_sha256') == os.environ['EXPECTED_BUILD'], 'Wrong service build on loopback port'
source = '服务就绪验收 ' + uuid.uuid4().hex
payload = json.dumps({'target_language': 'en', 'texts': [source]}).encode()
request = urllib.request.Request('http://127.0.0.1:8081/translate', data=payload, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(request, timeout=60) as response:
    result = json.load(response)
assert result.get('provider') == 'youdao' and result.get('cached') is False and result.get('ok') is True
assert len(result.get('translations', [])) == 1 and result['translations'][0].strip() and result['translations'][0] != source
PY
  then
    echo 'PASS: loopback direct Youdao service is ready.'
    rm -rf "$BACKUP"
    trap - ERR
    exit 0
  fi
  sleep 1
done
echo 'Direct Youdao service failed readiness; restoring previous service.' >&2
false
