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
for attempt in {1..10}; do
  if curl --fail --silent --show-error --max-time 2 http://127.0.0.1:8081/health >/dev/null; then
    echo 'PASS: loopback direct Youdao service is ready.'
    rm -rf "$BACKUP"
    trap - ERR
    exit 0
  fi
  sleep 1
done
echo 'Direct Youdao service failed readiness; restoring previous service.' >&2
false
