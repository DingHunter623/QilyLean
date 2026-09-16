#!/usr/bin/env bash
set -euo pipefail

DOMAIN="qilylean.cn"
WWW_DOMAIN="www.qilylean.cn"
EXPECTED_IPV4="${1:-1.117.71.235}"

if ! command -v getent >/dev/null 2>&1; then
  echo "getent is required." >&2
  exit 1
fi

resolve_v4() {
  getent ahostsv4 "$1" | awk '{print $1}' | sort -u
}

ROOT_IPS="$(resolve_v4 "$DOMAIN" || true)"
WWW_IPS="$(resolve_v4 "$WWW_DOMAIN" || true)"

if ! grep -qx "$EXPECTED_IPV4" <<<"$ROOT_IPS"; then
  echo "$DOMAIN is not yet resolving to $EXPECTED_IPV4" >&2
  echo "Current IPv4 answers: ${ROOT_IPS:-<none>}" >&2
  exit 10
fi

if ! grep -qx "$EXPECTED_IPV4" <<<"$WWW_IPS"; then
  echo "$WWW_DOMAIN is not yet resolving to $EXPECTED_IPV4" >&2
  echo "Current IPv4 answers: ${WWW_IPS:-<none>}" >&2
  exit 11
fi

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx

sudo nginx -t

sudo certbot --nginx \
  -d "$DOMAIN" \
  -d "$WWW_DOMAIN" \
  --non-interactive \
  --agree-tos \
  --redirect \
  --register-unsafely-without-email

sudo nginx -t
sudo systemctl reload nginx

curl -fsSIL --max-time 20 "https://$DOMAIN/" >/tmp/qilylean-cn-https-root.headers
curl -fsSIL --max-time 20 "https://$WWW_DOMAIN/" >/tmp/qilylean-cn-https-www.headers

grep -Eq '^HTTP/.* 200|^HTTP/.* 301|^HTTP/.* 302' /tmp/qilylean-cn-https-root.headers
grep -Eq '^HTTP/.* 200|^HTTP/.* 301|^HTTP/.* 302' /tmp/qilylean-cn-https-www.headers

if systemctl list-unit-files | grep -q '^certbot.timer'; then
  sudo systemctl enable --now certbot.timer || true
fi

echo "HTTPS enabled for $DOMAIN and $WWW_DOMAIN."
