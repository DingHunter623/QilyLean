#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR="$ROOT/qilylean"
SRC="$DIR/c919-strategy-hero-v10.svg"
TMP="$DIR/.c919-strategy-hero-v11-render.svg"
OUT="$DIR/c919-strategy-hero-v11.png"

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "rsvg-convert is required to build the standalone C919 PNG" >&2
  exit 2
fi

# SVG v10 is intentionally authored with site-root image hrefs for the browser.
# For CI rasterization, make those references local to the /qilylean directory.
sed 's#href="/qilylean/#href="#g' "$SRC" > "$TMP"
trap 'rm -f "$TMP"' EXIT

rsvg-convert --width 1672 --height 941 --output "$OUT" "$TMP"

bytes="$(stat -c%s "$OUT")"
if [ "$bytes" -lt 500000 ]; then
  echo "Standalone C919 PNG is unexpectedly small: ${bytes} bytes" >&2
  exit 3
fi

echo "Standalone C919 raster built: $OUT (${bytes} bytes)"
