#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/qilylean/c919-strategy-hero-v12.webp.b64"
OUT="$ROOT/qilylean/c919-strategy-hero-v12.webp"
if [ ! -s "$SRC" ]; then
  echo "C919 v12 base64 source missing: $SRC" >&2
  exit 1
fi
base64 -d "$SRC" > "$OUT"
SIZE=$(wc -c < "$OUT" | tr -d ' ')
if [ "$SIZE" -lt 150000 ]; then
  echo "C919 v12 materialized image too small: $SIZE bytes" >&2
  exit 1
fi
printf 'C919 final v12 WebP materialized: %s bytes\n' "$SIZE"
