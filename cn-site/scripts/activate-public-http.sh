#!/usr/bin/env bash
set -euo pipefail

CONF_SRC="${1:-/tmp/qilylean.cn.conf}"
CONF_DST="/etc/nginx/sites-available/qilylean.cn"
ENABLED="/etc/nginx/sites-enabled/qilylean.cn"
CERT_DIR="/etc/letsencrypt/live/qilylean.cn"

if [[ ! -f "$CONF_SRC" ]]; then
  echo "Production nginx config not found: $CONF_SRC" >&2
  exit 2
fi

if [[ ! -f "$CERT_DIR/fullchain.pem" || ! -f "$CERT_DIR/privkey.pem" ]]; then
  echo "Production TLS certificate is missing: $CERT_DIR" >&2
  exit 3
fi

sudo install -m 0644 "$CONF_SRC" "$CONF_DST"
sudo ln -sfn "$CONF_DST" "$ENABLED"

sudo nginx -t
sudo systemctl reload nginx

root_http="$(curl -sS -o /dev/null -w '%{http_code}' -H 'Host: qilylean.cn' http://127.0.0.1/ || true)"
www_http="$(curl -sS -o /dev/null -w '%{http_code}' -H 'Host: www.qilylean.cn' http://127.0.0.1/ || true)"
root_https="$(curl -sS -o /dev/null -w '%{http_code}' --resolve qilylean.cn:443:127.0.0.1 https://qilylean.cn/ || true)"
www_https="$(curl -sS -o /dev/null -w '%{http_code}' --resolve www.qilylean.cn:443:127.0.0.1 https://www.qilylean.cn/ || true)"

if [[ "$root_http" != "301" ]]; then
  echo "HTTP canonical redirect failed for qilylean.cn: HTTP $root_http" >&2
  exit 4
fi
if [[ "$www_http" != "301" ]]; then
  echo "HTTP canonical redirect failed for www.qilylean.cn: HTTP $www_http" >&2
  exit 5
fi
if [[ "$root_https" != "200" ]]; then
  echo "HTTPS health check failed for qilylean.cn: HTTP $root_https" >&2
  exit 6
fi
if [[ "$www_https" != "301" ]]; then
  echo "HTTPS www canonical redirect failed: HTTP $www_https" >&2
  exit 7
fi

echo "Canonical HTTP redirect passed for qilylean.cn: HTTP $root_http"
echo "Canonical HTTP redirect passed for www.qilylean.cn: HTTP $www_http"
echo "Canonical HTTPS health check passed for qilylean.cn: HTTP $root_https"
echo "Canonical HTTPS redirect passed for www.qilylean.cn: HTTP $www_https"
echo "QilyLean CN canonical HTTPS production listener is active."
