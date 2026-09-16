#!/usr/bin/env bash
set -euo pipefail

CONF_SRC="${1:-/tmp/qilylean.cn.conf}"
CONF_DST="/etc/nginx/sites-available/qilylean.cn"
ENABLED="/etc/nginx/sites-enabled/qilylean.cn"

if [[ ! -f "$CONF_SRC" ]]; then
  echo "Production nginx config not found: $CONF_SRC" >&2
  exit 2
fi

sudo install -m 0644 "$CONF_SRC" "$CONF_DST"
sudo ln -sfn "$CONF_DST" "$ENABLED"

sudo nginx -t
sudo systemctl reload nginx

for host in qilylean.cn www.qilylean.cn; do
  code="$(curl -sS -o /tmp/qilylean-cn-public-health.html -w '%{http_code}' -H "Host: $host" http://127.0.0.1/ || true)"
  if [[ "$code" != "200" ]]; then
    echo "Public HTTP health check failed for $host with HTTP $code" >&2
    exit 3
  fi
  echo "Public HTTP health check passed for $host: HTTP 200"
done

echo "QilyLean CN public HTTP listener is active on port 80. HTTPS remains a separate release gate."
