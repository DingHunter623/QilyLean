#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$CN_ROOT/.." && pwd)"

# Full-site content-axis SSOT: China production ships the exact same canonical
# width authority as the international site.
cp "$REPO_ROOT/site-content-axis-v1.css" "$CN_ROOT/site-content-axis-v1.css"
cmp -s "$REPO_ROOT/site-content-axis-v1.css" "$CN_ROOT/site-content-axis-v1.css"

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


# Materialize the China-site local copy of eligible international public content.
python3 "$CN_ROOT/scripts/materialize-public-content-mirror.py"
python3 "$CN_ROOT/scripts/enforce-fullsite-axis.py"
test -f "$CN_ROOT/archive/index.html"
test -f "$CN_ROOT/briefs/archive/index.html"
test -f "$CN_ROOT/archive/content-manifest.json"
test -f "$CN_ROOT/assets/content-mirror.css"

python3 - "$CN_ROOT/archive/content-manifest.json" <<'PY'
import json, pathlib, sys
path=pathlib.Path(sys.argv[1])
data=json.loads(path.read_text(encoding='utf-8'))
total=int(data.get('generated',0))
briefs=int(data.get('categories',{}).get('精选简报',0))
if total < 400:
    raise SystemExit(f'CN content mirror unexpectedly small: {total}')
if briefs < 350:
    raise SystemExit(f'CN selected-brief mirror unexpectedly small: {briefs}')
print(f'CN full public-content mirror materialized: {total} pages / {briefs} selected briefs.')
PY
