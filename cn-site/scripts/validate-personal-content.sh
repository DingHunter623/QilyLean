#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-cn-site}"
INDEX_FILE="$ROOT_DIR/index.html"
ROBOTS_FILE="$ROOT_DIR/robots.txt"
SITEMAP_FILE="$ROOT_DIR/sitemap.xml"
GOOGLE_VERIFY_FILE="$ROOT_DIR/googleb7a991efbed3aa8a.html"
BAIDU_VERIFY_FILE="$ROOT_DIR/baidu_verify_codeva-Bp0VGliFcp.html"
INDEXNOW_FILE="$ROOT_DIR/b47ed759da519bd90586a7877122d7be.txt"
CN_AIRCRAFT_FILE="$ROOT_DIR/assets/qilylean-aircraft-hero-cn-20260918.png"
PRACTICE_PAGE="$ROOT_DIR/notes/index.html"
PRACTICE_CSS="$ROOT_DIR/assets/practice.css"
PRACTICE_SMED="$ROOT_DIR/assets/practice/smed-300t.svg"
PRACTICE_MOLD="$ROOT_DIR/assets/practice/mold-warehouse.svg"
PRACTICE_FUSE="$ROOT_DIR/assets/practice/fuse-process.svg"
PRACTICE_EVIDENCE="$ROOT_DIR/assets/practice/lean-improvement-evidence.svg"\nPRACTICE_AWARD="$ROOT_DIR/assets/practice/award-6s-page-01.jpg"

mapfile -t FILES < <(find "$ROOT_DIR" -type f \( \
  -name '*.html' -o -name '*.htm' -o -name '*.xml' -o -name '*.json' -o \
  -name '*.js' -o -name '*.css' -o -name '*.svg' -o -name '*.txt' \
\) ! -path '*/scripts/*' -print)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "No deployable CN site files found."
  exit 1
fi

FORBIDDEN_PATTERN='项目合作|商务合作|业务合作|业务承接|项目承接|签单|签约|报价|收费|付款|合同|发票|收款|咨询预约|预约咨询|获取方案|联系我们|立即咨询|服务套餐|招商|代理加盟|资源撮合|提成|分成|商业交付|咨询转化|销售线索|客户招揽|核心业务|直接交付|业务转化'

if grep -RniE --include='*.html' --include='*.htm' --include='*.xml' --include='*.json' --include='*.js' --include='*.css' --include='*.svg' --include='*.txt' \
  --exclude-dir='scripts' "$FORBIDDEN_PATTERN" "$ROOT_DIR"; then
  echo "ERROR: Mainland personal site contains forbidden commercial wording."
  exit 1
fi

# The CN personal site may reference exactly one curated, non-commercial bridge on the
# international domain. Any other qilylean.com URL is treated as a commercial-routing risk.
ALLOWED_GLOBAL_KNOWLEDGE_URL='https://qilylean.com/global-knowledge/'
COM_LINKS="$(grep -RhoE --include='*.html' --include='*.htm' --include='*.xml' --include='*.json' --include='*.js' --include='*.svg' \
  --exclude-dir='scripts' 'https?://(www\.)?qilylean\.com[^\"'"'"'<>[:space:]]*' "$ROOT_DIR" || true)"
if [[ -n "$COM_LINKS" ]]; then
  while IFS= read -r url; do
    [[ -z "$url" ]] && continue
    if [[ "$url" != "$ALLOWED_GLOBAL_KNOWLEDGE_URL" ]]; then
      echo "ERROR: Mainland personal site contains a non-whitelisted QilyLean international URL: $url"
      exit 1
    fi
  done <<< "$COM_LINKS"
fi

if grep -RniE --include='*.html' --include='*.htm' --include='*.xml' --include='*.json' --include='*.js' --include='*.svg' \
  --exclude-dir='scripts' '(tel:|mailto:|weixin:|weChat|whatsapp:)' "$ROOT_DIR"; then
  echo "ERROR: Mainland personal site contains direct contact/conversion hooks."
  exit 1
fi

# Dual-site relationship contract: the CN homepage must remain self-canonical and may
# only expose the isolated Global Knowledge page as its reciprocal language/knowledge bridge.
if [[ ! -f "$INDEX_FILE" ]]; then
  echo "ERROR: CN homepage is missing."
  exit 1
fi

grep -Fq '<meta name="robots" content="index,follow">' "$INDEX_FILE" || {
  echo "ERROR: CN homepage must remain indexable."
  exit 1
}

grep -Fq '<link rel="canonical" href="https://qilylean.cn/">' "$INDEX_FILE" || {
  echo "ERROR: CN homepage canonical must remain https://qilylean.cn/."
  exit 1
}

grep -Fq '<link rel="alternate" hreflang="zh-CN" href="https://qilylean.cn/">' "$INDEX_FILE" || {
  echo "ERROR: CN zh-CN hreflang is missing."
  exit 1
}

grep -Fq '<link rel="alternate" hreflang="en" href="https://qilylean.com/global-knowledge/">' "$INDEX_FILE" || {
  echo "ERROR: CN knowledge-only international hreflang bridge is missing."
  exit 1
}

grep -Fq '"@type":"WebSite"' "$INDEX_FILE" || {
  echo "ERROR: CN WebSite structured data is missing."
  exit 1
}

grep -Fq '"sameAs":["https://qilylean.com/global-knowledge/"]' "$INDEX_FILE" || {
  echo "ERROR: CN structured-data association must point only to Global Knowledge."
  exit 1
}

# Search-engine discovery contract: keep crawl permission, sitemap discovery and verification
# files intact so Google, Baidu and IndexNow access cannot be accidentally broken later.
[[ -f "$ROBOTS_FILE" ]] || { echo "ERROR: CN robots.txt is missing."; exit 1; }
[[ -f "$SITEMAP_FILE" ]] || { echo "ERROR: CN sitemap.xml is missing."; exit 1; }
[[ -f "$GOOGLE_VERIFY_FILE" ]] || { echo "ERROR: Google verification file is missing."; exit 1; }
[[ -f "$BAIDU_VERIFY_FILE" ]] || { echo "ERROR: Baidu verification file is missing."; exit 1; }
[[ -f "$INDEXNOW_FILE" ]] || { echo "ERROR: CN IndexNow key file is missing."; exit 1; }
[[ -f "$CN_AIRCRAFT_FILE" ]] || { echo "ERROR: CN approved no-QR aircraft asset is missing."; exit 1; }
[[ -f "$PRACTICE_PAGE" ]] || { echo "ERROR: CN practice archive page is missing."; exit 1; }
[[ -f "$PRACTICE_CSS" ]] || { echo "ERROR: CN practice archive stylesheet is missing."; exit 1; }
[[ -f "$PRACTICE_SMED" ]] || { echo "ERROR: CN SMED practice visual is missing."; exit 1; }
[[ -f "$PRACTICE_MOLD" ]] || { echo "ERROR: CN mold-warehouse practice visual is missing."; exit 1; }
[[ -f "$PRACTICE_FUSE" ]] || { echo "ERROR: CN fuse-process practice visual is missing."; exit 1; }
[[ -f "$PRACTICE_EVIDENCE" ]] || { echo "ERROR: CN improvement-evidence visual is missing."; exit 1; }\n[[ -s "$PRACTICE_AWARD" ]] || { echo "ERROR: CN local award evidence image is missing or empty."; exit 1; }
grep -Fq '/assets/qilylean-aircraft-hero-cn-20260918.png?v=20260918-cn-aircraft-v1' "$INDEX_FILE" || { echo "ERROR: CN homepage approved no-QR aircraft visual is missing."; exit 1; }
grep -Fq 'PRACTICE & EVIDENCE｜实践与成果' "$INDEX_FILE" || { echo "ERROR: CN homepage practice/evidence entry is missing."; exit 1; }
grep -Fq '实践与成果：把改善结果还原成可复用的工程方法' "$PRACTICE_PAGE" || { echo "ERROR: CN practice archive positioning marker is missing."; exit 1; }
grep -Fq '展示经历，不包装成商业案例' "$INDEX_FILE" || { echo "ERROR: CN homepage practice boundary marker is missing."; exit 1; }
grep -Fq '团队成果按组织推进口径呈现' "$PRACTICE_PAGE" || { echo "ERROR: CN practice archive team-result boundary is missing."; exit 1; }\ngrep -Fq '/assets/practice/award-6s-page-01.jpg?v=20260918-practice-award-v1' "$PRACTICE_PAGE" || { echo "ERROR: CN practice archive must use the local award evidence asset."; exit 1; }

grep -Fxq 'Allow: /' "$ROBOTS_FILE" || {
  echo "ERROR: CN robots.txt must allow crawling."
  exit 1
}

grep -Fxq 'Sitemap: https://qilylean.cn/sitemap.xml' "$ROBOTS_FILE" || {
  echo "ERROR: CN robots.txt must advertise the canonical sitemap."
  exit 1
}

grep -Fq '<urlset' "$SITEMAP_FILE" || {
  echo "ERROR: CN sitemap.xml is not a URL set."
  exit 1
}

grep -Fq '<loc>https://qilylean.cn/</loc>' "$SITEMAP_FILE" || {
  echo "ERROR: CN sitemap.xml is missing the homepage."
  exit 1
}

if grep -Eo '<loc>[^<]+</loc>' "$SITEMAP_FILE" | grep -vF '<loc>https://qilylean.cn/' >/dev/null; then
  echo "ERROR: CN sitemap.xml contains a non-CN URL."
  exit 1
fi

GOOGLE_VERIFY_VALUE="$(tr -d '\r\n' < "$GOOGLE_VERIFY_FILE")"
[[ "$GOOGLE_VERIFY_VALUE" == 'google-site-verification: googleb7a991efbed3aa8a.html' ]] || {
  echo "ERROR: Google verification file content changed."
  exit 1
}

BAIDU_VERIFY_VALUE="$(tr -d '\r\n' < "$BAIDU_VERIFY_FILE")"
[[ "$BAIDU_VERIFY_VALUE" == '8bdf47bc085187ab7717a549ec5b7904' ]] || {
  echo "ERROR: Baidu verification file content changed."
  exit 1
}

INDEXNOW_VALUE="$(tr -d '\r\n' < "$INDEXNOW_FILE")"
[[ "$INDEXNOW_VALUE" == 'b47ed759da519bd90586a7877122d7be' ]] || {
  echo "ERROR: CN IndexNow verification file content changed."
  exit 1
}

echo "CN personal-site non-commercial content gate passed."
echo "CN dual-site knowledge-only association contract passed."
echo "CN search-engine discovery and verification contract passed for Google, Baidu and IndexNow."
echo "CN practice/evidence archive boundary and local asset contract passed."
