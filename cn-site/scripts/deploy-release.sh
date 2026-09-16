#!/usr/bin/env bash
set -euo pipefail

SITE_ROOT="/var/www/qilylean-cn"
ARCHIVE="${1:-/tmp/qilylean-cn-site.tar.gz}"
RELEASE_ID="${2:-$(date +%Y%m%d-%H%M%S)}"
RELEASE_DIR="$SITE_ROOT/releases/$RELEASE_ID"

if [[ ! -f "$ARCHIVE" ]]; then
  echo "Archive not found: $ARCHIVE" >&2
  exit 2
fi

mkdir -p "$RELEASE_DIR"
tar -xzf "$ARCHIVE" -C "$RELEASE_DIR"

for required in index.html robots.txt sitemap.xml favicon.ico assets/site.css assets/portal.css; do
  if [[ ! -f "$RELEASE_DIR/$required" ]]; then
    echo "Release validation failed: missing $required" >&2
    rm -rf "$RELEASE_DIR"
    exit 3
  fi
done

if ! grep -q '湘ICP备2026041143号-1' "$RELEASE_DIR/index.html"; then
  echo "Release validation failed: ICP number missing from homepage" >&2
  rm -rf "$RELEASE_DIR"
  exit 4
fi

if ! grep -q '<urlset' "$RELEASE_DIR/sitemap.xml"; then
  echo "Release validation failed: sitemap is invalid" >&2
  rm -rf "$RELEASE_DIR"
  exit 5
fi

if [[ -L "$SITE_ROOT/current" ]]; then
  CURRENT_TARGET="$(readlink -f "$SITE_ROOT/current" || true)"
  if [[ -n "$CURRENT_TARGET" && -d "$CURRENT_TARGET" ]]; then
    ln -sfn "$CURRENT_TARGET" "$SITE_ROOT/previous"
  fi
fi

ln -sfn "$RELEASE_DIR" "$SITE_ROOT/current"

sudo nginx -t
sudo systemctl reload nginx

HTTP_CODE="$(curl -sS -o /tmp/qilylean-cn-health.html -w '%{http_code}' -H 'Host: qilylean.cn' http://127.0.0.1/ || true)"
if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "301" && "$HTTP_CODE" != "302" ]]; then
  echo "Health check failed with HTTP $HTTP_CODE" >&2
  if [[ -L "$SITE_ROOT/previous" ]]; then
    ln -sfn "$(readlink -f "$SITE_ROOT/previous")" "$SITE_ROOT/current"
    sudo nginx -t && sudo systemctl reload nginx
  fi
  exit 6
fi

find "$SITE_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
  | sort -nr \
  | tail -n +6 \
  | cut -d' ' -f2- \
  | xargs -r rm -rf

echo "Release deployed: $RELEASE_ID"
echo "Health check: HTTP $HTTP_CODE for qilylean.cn"
