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

# Localize the full-quality 150-page public IE/onsite-management training PDF.
# This public knowledge asset must never link visitors back to the commercial site.
TRAINING_PDF_SOURCE="$REPO_ROOT/现场管理.pdf"
TRAINING_PDF_TARGET="$CN_ROOT/assets/knowledge/现场管理.pdf"
test -s "$TRAINING_PDF_SOURCE"
mkdir -p "$(dirname "$TRAINING_PDF_TARGET")"
if [[ ! -f "$TRAINING_PDF_TARGET" ]] || ! cmp -s "$TRAINING_PDF_SOURCE" "$TRAINING_PDF_TARGET"; then
  cp "$TRAINING_PDF_SOURCE" "$TRAINING_PDF_TARGET"
fi
cmp -s "$TRAINING_PDF_SOURCE" "$TRAINING_PDF_TARGET"
echo "CN original training PDF verified at full source-byte quality."



# The international release is the approved immutable visual source. China
# builds must not reorder its styles or republish its non-footer presentation.

# Materialize the China-site local copy of eligible international public content.
python3 "$CN_ROOT/scripts/materialize-public-content-mirror.py"
python3 "$CN_ROOT/scripts/materialize-brief-visual-parity.py"
python3 "$CN_ROOT/scripts/materialize-nonbrief-visual-parity.py"
python3 "$CN_ROOT/scripts/materialize-public-interactions.py"
# Synchronize non-commercial public directory from the international SSOT.
python3 "$CN_ROOT/scripts/materialize-public-tech-directory.py" --cn-only
python3 "$CN_ROOT/scripts/build-content-discovery.py"

# Ensure two new independent OPL lessons, the glossary entries and the
# same-origin search manifest all enter the actual mainland release.
# Do not accept a 384-brief page alone as proof that knowledge assets synced.
python3 - "$CN_ROOT" <<'PYCNOPL'
import json, pathlib, sys
cn = pathlib.Path(sys.argv[1])
manifest = json.loads((cn / "archive/content-manifest.json").read_text(encoding="utf-8"))
items = manifest.get("items", [])
glossary = (cn / "archive/knowledge/terminology/index.html").read_text(encoding="utf-8")
for slug, code, chinese in (
    ("owner", "OWNER", "主理人"),
    ("baseline", "BASELINE", "基线"),
):
    source = f"knowledge/terminology/{slug}.html"
    route = f"/archive/knowledge/terminology/{slug}/"
    matches = [row for row in items if row.get("source") == source and row.get("url") == route]
    assert len(matches) == 1, f"CN OPL is not in same-origin search manifest: {code}"
    assert code.lower() in matches[0].get("title", "").lower(), f"CN OPL title is not searchable: {code}"
    local = cn / route.lstrip("/") / "index.html"
    assert local.is_file(), f"CN OPL page missing: {code}"
    content = local.read_text(encoding="utf-8")
    assert code in content and chinese in content, f"CN OPL explanation missing: {code}"
    assert f'id="term-{slug}"' in glossary, f"CN glossary card missing: {code}"
    assert route in glossary, f"CN glossary local OPL link missing: {code}"
    assert "qilylean.com/knowledge/terminology/" not in content, f"CN OPL uses international canonical: {code}"
print("PASS: BASELINE/OWNER localized glossary, 2 standalone lessons, and searchable CN content manifest.")
PYCNOPL


# The current public-content contract owns complete source mains and layouts.
# Legacy front-shelf wording/layout checks below apply only to legacy releases.
if [[ -f "$CN_ROOT/scripts/materialize-source-content-parity.py" ]]; then
  node "$REPO_ROOT/scripts/materialize-cn-footer-actions-v2.js"

  node --check "$CN_ROOT/assets/cn-footer-actions-v1.js"
  node - "$CN_ROOT/assets/cn-footer-actions-v1.js" <<'PYCNSHARE'
const fs=require('fs');
const runtime=fs.readFileSync(process.argv[2],'utf8');
const a=runtime.indexOf('function shareCurrent(){');
const b=runtime.indexOf('function openContactPage(){',a);
if(a<0||b<a)throw Error('China share handler missing');
const section=runtime.slice(a,b);
const copied=section.indexOf('copyText(text).then(');
const native=section.indexOf('navigator.share(');
if(copied<0||native<=copied||!section.includes('标题与网址已复制，正在打开系统分享')||!section.includes('复制失败，请手动复制地址栏网址'))throw Error('Copy-first and truthful feedback contract is missing');
if(!runtime.includes('navigator.clipboard.writeText(text)')||!runtime.includes("d.execCommand('copy')===true"))throw Error('Clipboard fallback and result validation missing');
console.log('PASS: CN share copies URL before native share and displays honest feedback.');
PYCNSHARE

# Generated China pages must reference the new immutable share runtime identity.
node - "$CN_ROOT" <<'PYCNSHARECACHE'
const fs=require('fs'),path=require('path'),root=process.argv[2];
const expected='/assets/cn-footer-actions-v1.js?v=20261023-cn-public-footer-source-v1&share=20261028-cn-copy-first-v1';
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):entry.name.endsWith('.html')?[path.join(dir,entry.name)]:[]);}
let count=0;
for(const filename of files(root)){
  const html=fs.readFileSync(filename,'utf8');
  if(!html.includes('/assets/cn-footer-actions-v1.js?v='))continue;
  if(!html.includes(expected))throw Error('CN page still caches old share runtime: '+path.relative(root,filename));
  count++;
}
if(count<25)throw Error('CN shared dock scope unexpectedly small: '+count);
console.log('PASS: '+count+' CN pages carry the current copy-first share cache identity.');
PYCNSHARECACHE
  python3 "$REPO_ROOT/scripts/materialize-cn-intent-prefetch.py"
  python3 "$CN_ROOT/scripts/materialize-source-content-parity.py"
  python3 "$CN_ROOT/scripts/enforce-fullsite-axis.py"
  # Apply the authorized About navigation hierarchy to generated, untracked CN mirror pages.
  node "$REPO_ROOT/scripts/materialize-about-nav-footer-v1.js" --cn-only
  python3 "$CN_ROOT/scripts/validate-source-content-parity.py"
  exit 0
fi
# New local international-knowledge mirror must be complete and link-safe.
python3 - "$CN_ROOT" <<'PYKNOWLEDGE'
import pathlib,re,sys,json
from html.parser import HTMLParser
cn=pathlib.Path(sys.argv[1])
raw=(cn/"knowledge/index.html").read_text(encoding="utf-8")
report=json.loads((cn/"archive/content-catalog.json").read_text(encoding="utf-8"))
assert 'data-qily-international-knowledge-mirror="v1"' in raw
assert 'knowledge-route-feedback-v3&anchors=20261013-v1' in raw
for name in ("knowledge-stats","ai-manufacturing-knowledge","terminology",
             "daily","tools","lean-series","documents"):
    assert raw.count(f'id="cn-global-{name}"')==1,name
assert raw.count('class="module-card"')>=16
assert f'data-qily-brief-total="{report["briefs"]}"' in raw
assert '193 项' in raw and '16 项' in raw
assert 'href="/archive/knowledge/terminology/"' in raw
assert 'href="/briefs/"' in raw
assert 'href="#cn-global-tools"' in raw
assert 'href="#cn-global-knowledge-architecture"' in raw
hub=raw.split('<div class="qily-cn-knowledge-hub"',1)[1].split('</div><!-- QILY-CN-INTERNATIONAL-KNOWLEDGE-HUB:END -->',1)[0]
assert 'qilylean.com/' not in hub and 'href="/cooperation/' not in hub
local=cn/"assets/knowledge/现场管理.pdf"
original=cn.parent/"现场管理.pdf"
assert local.read_bytes()==original.read_bytes(),"Knowledge PDF source-byte mismatch"
assert "湘ICP备2026041143号-1" in raw
assert "湘公网安备43020002000443号" in raw
print("CN full knowledge hub validated: seven noncommercial sections / 193 lessons / 16 tools-topics-docs / 381 brief library.")
PYKNOWLEDGE
python3 "$CN_ROOT/scripts/enforce-fullsite-axis.py"
test -f "$CN_ROOT/archive/index.html"
test -f "$CN_ROOT/briefs/archive/index.html"
test -f "$CN_ROOT/archive/content-manifest.json"
test -f "$CN_ROOT/archive/brief-visual-parity.json"
test -f "$CN_ROOT/archive/nonbrief-visual-parity.json"
test -f "$CN_ROOT/archive/content-catalog.json"
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


python3 - "$CN_ROOT/archive/content-catalog.json" "$CN_ROOT/index.html" "$CN_ROOT/knowledge/index.html" "$CN_ROOT/briefs/index.html" <<'PY'
import json, pathlib, sys
catalog=json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))
home=pathlib.Path(sys.argv[2]).read_text(encoding='utf-8')
knowledge=pathlib.Path(sys.argv[3]).read_text(encoding='utf-8')
briefs=pathlib.Path(sys.argv[4]).read_text(encoding='utf-8')
assert catalog["generated"] >= 400
assert catalog["briefs"] >= 350
assert "QILY-CN-KNOWLEDGE-ASSET-SUMMARY" in home
assert "QILY-CN-KNOWLEDGE-ASSET-CATALOG" in knowledge
assert 'data-qily-knowledge-discovery="v1"' in briefs
print(f'CN front discovery verified: {catalog["generated"]} pages / {catalog["briefs"]} briefs.')
PY

python3 "$CN_ROOT/scripts/validate-brief-visual-parity.py"
python3 "$CN_ROOT/scripts/validate-public-interactions.py"

python3 "$CN_ROOT/scripts/validate-dense-brief-tables.py"
