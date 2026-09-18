#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$CN_ROOT/.." && pwd)"

SOURCE="$REPO_ROOT/assets/projects/lean-improvement-evidence/award/page-01.jpg"
TARGET="$CN_ROOT/assets/practice/award-6s-page-01.jpg"

test -f "$SOURCE"
test -s "$SOURCE"
mkdir -p "$(dirname "$TARGET")"

if [[ ! -f "$TARGET" ]] || ! cmp -s "$SOURCE" "$TARGET"; then
  cp "$SOURCE" "$TARGET"
fi

test -s "$TARGET"
cmp -s "$SOURCE" "$TARGET"
echo "CN practice award asset materialized locally."
