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
CN_VI_FILE="$ROOT_DIR/assets/qilylean-vi-v2.css"
CN_NAV_RAIL_JS="$ROOT_DIR/assets/cn-nav-rail-v1.js"
PRACTICE_PAGE="$ROOT_DIR/notes/index.html"
PRACTICE_CSS="$ROOT_DIR/assets/practice.css"
PRACTICE_SMED="$ROOT_DIR/assets/practice/smed-300t.svg"
PRACTICE_MOLD="$ROOT_DIR/assets/practice/mold-warehouse.svg"
PRACTICE_FUSE="$ROOT_DIR/assets/practice/fuse-process.svg"
PRACTICE_EVIDENCE="$ROOT_DIR/assets/practice/lean-improvement-evidence.svg"
PRACTICE_AUTOMOTIVE="$ROOT_DIR/assets/practice/automotive-lean.svg"
PRACTICE_FACTORY="$ROOT_DIR/assets/practice/factory-layout.svg"
PRACTICE_DIGITAL="$ROOT_DIR/assets/practice/digital-factory.svg"
PRACTICE_VISUAL="$ROOT_DIR/assets/practice/visual-management.svg"
PRACTICE_AWARD="$ROOT_DIR/assets/practice/award-6s-page-01.jpg"

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
[[ -f "$CN_VI_FILE" ]] || { echo "ERROR: CN unified VI stylesheet is missing."; exit 1; }
[[ -f "$CN_NAV_RAIL_JS" ]] || { echo "ERROR: CN primary-nav rail runtime is missing."; exit 1; }
[[ -f "$PRACTICE_PAGE" ]] || { echo "ERROR: CN practice archive page is missing."; exit 1; }
[[ -f "$PRACTICE_CSS" ]] || { echo "ERROR: CN practice archive stylesheet is missing."; exit 1; }
[[ -f "$PRACTICE_SMED" ]] || { echo "ERROR: CN SMED practice visual is missing."; exit 1; }
[[ -f "$PRACTICE_MOLD" ]] || { echo "ERROR: CN mold-warehouse practice visual is missing."; exit 1; }
[[ -f "$PRACTICE_FUSE" ]] || { echo "ERROR: CN fuse-process practice visual is missing."; exit 1; }
grep -Fq '玻璃管保险丝改善后成品照片' "$PRACTICE_FUSE" || { echo "ERROR: CN fuse practice visual is not the approved finished-product photo."; exit 1; }
[[ -f "$PRACTICE_EVIDENCE" ]] || { echo "ERROR: CN improvement-evidence visual is missing."; exit 1; }
[[ -f "$PRACTICE_AUTOMOTIVE" ]] || { echo "ERROR: CN automotive-lean practice visual is missing."; exit 1; }
[[ -f "$PRACTICE_FACTORY" ]] || { echo "ERROR: CN factory-layout practice visual is missing."; exit 1; }
[[ -f "$PRACTICE_DIGITAL" ]] || { echo "ERROR: CN digital-factory practice visual is missing."; exit 1; }
[[ -f "$PRACTICE_VISUAL" ]] || { echo "ERROR: CN visual-management practice visual is missing."; exit 1; }
[[ -s "$PRACTICE_AWARD" ]] || { echo "ERROR: CN local award evidence image is missing or empty."; exit 1; }
grep -Fq '/assets/qilylean-aircraft-hero-cn-20260918.png?v=20260918-cn-aircraft-v1' "$INDEX_FILE" || { echo "ERROR: CN homepage approved no-QR aircraft visual is missing."; exit 1; }
grep -Fq '/assets/qilylean-vi-v2.css?v=20260918-cn-mobile-vi-v9' "$INDEX_FILE" || { echo "ERROR: CN homepage unified VI cache version is missing."; exit 1; }
grep -Fq '/assets/cn-nav-rail-v1.js?v=20260918-nav-rail-v1' "$INDEX_FILE" || { echo "ERROR: CN homepage primary-nav rail runtime is missing."; exit 1; }
grep -Fq 'QILY-CN-NAV-RAIL-V1' "$CN_VI_FILE" || { echo "ERROR: CN international-style primary-nav rail contract is missing."; exit 1; }
grep -Fq 'qily-primary-nav-scroll-rail' "$CN_NAV_RAIL_JS" || { echo "ERROR: CN primary-nav rail runtime contract is missing."; exit 1; }
grep -Fq -- '--qily-cn-h3:clamp(21px,5.7vw,23px)' "$CN_VI_FILE" || { echo "ERROR: CN mobile heading hierarchy is not normalized."; exit 1; }
grep -Fq 'QILY-CN-AIRCRAFT-CENTERED-V2' "$CN_VI_FILE" || { echo "ERROR: CN aircraft centered layout contract is missing."; exit 1; }
grep -Fq 'object-position:50% 50%!important' "$CN_VI_FILE" || { echo "ERROR: CN aircraft image is not center-positioned."; exit 1; }
grep -Fq 'width:100%!important;' "$CN_VI_FILE" || { echo "ERROR: CN aircraft responsive width contract is missing."; exit 1; }
grep -Fq 'PRACTICE & EVIDENCE｜实践与成果' "$INDEX_FILE" || { echo "ERROR: CN homepage practice/evidence entry is missing."; exit 1; }
grep -Fq '实践与成果：把改善结果还原成可复用的工程方法' "$PRACTICE_PAGE" || { echo "ERROR: CN practice archive positioning marker is missing."; exit 1; }
grep -Fq '知识之外，更重要的是方法如何在现场落地' "$INDEX_FILE" || { echo "ERROR: CN homepage public-facing practice headline is missing."; exit 1; }
grep -Fq '精选 8 项制造实践' "$INDEX_FILE" || { echo "ERROR: CN homepage public-facing practice summary is missing."; exit 1; }
grep -Fq '从实践中提炼可复用方法' "$INDEX_FILE" || { echo "ERROR: CN homepage engineering-logic card is missing."; exit 1; }
grep -Fq '从现场问题，到可复用的方法' "$PRACTICE_PAGE" || { echo "ERROR: CN practice archive public-facing method headline is missing."; exit 1; }
grep -Fq '8项制造实践，从现场问题走向标准化沉淀' "$PRACTICE_PAGE" || { echo "ERROR: CN representative-practice public-facing headline is missing."; exit 1; }
grep -Fq '跨部门共同推进，评审、风险确认与结果复盘构成完整闭环' "$PRACTICE_PAGE" || { echo "ERROR: CN practice collaboration wording is missing."; exit 1; }
grep -Fq '/assets/practice/award-6s-page-01.jpg?v=20260918-practice-award-v1' "$PRACTICE_PAGE" || { echo "ERROR: CN practice archive must use the local award evidence asset."; exit 1; }
grep -Fq '/assets/practice/fuse-process.svg?v=20260918-fuse-finished-v2' "$PRACTICE_PAGE" || { echo "ERROR: CN fuse card must use the finished-product visual cache marker."; exit 1; }
grep -Fq '玻璃管保险丝切口与烧口工艺改善后的成品照片' "$PRACTICE_PAGE" || { echo "ERROR: CN fuse card finished-product alt text is missing."; exit 1; }
grep -Fq '/assets/practice.css?v=20260918-practice-visual-v2' "$PRACTICE_PAGE" || { echo "ERROR: CN practice visual V2 cache marker is missing."; exit 1; }
grep -Fq '6S改善运行机制摘要' "$PRACTICE_PAGE" || { echo "ERROR: CN 6S mechanism summary heading is missing."; exit 1; }
grep -Fq '6S改善机制：从稽核到激励的运行记录' "$PRACTICE_PAGE" || { echo "ERROR: CN 6S public-facing section headline is missing."; exit 1; }
grep -Fq '机制说明：' "$PRACTICE_PAGE" || { echo "ERROR: CN 6S mechanism explanation is missing."; exit 1; }
grep -Fq '/assets/practice/automotive-lean.svg?v=20260918-practice-map-v1' "$PRACTICE_PAGE" || { echo "ERROR: CN automotive lean representative practice is missing."; exit 1; }
grep -Fq '/assets/practice/factory-layout.svg?v=20260918-practice-map-v1' "$PRACTICE_PAGE" || { echo "ERROR: CN factory planning representative practice is missing."; exit 1; }
grep -Fq '/assets/practice/digital-factory.svg?v=20260918-practice-map-v1' "$PRACTICE_PAGE" || { echo "ERROR: CN digital factory representative practice is missing."; exit 1; }
grep -Fq '/assets/practice/visual-management.svg?v=20260918-practice-map-v1' "$PRACTICE_PAGE" || { echo "ERROR: CN visual management representative practice is missing."; exit 1; }
grep -Fq '汽车电子精益体系、VSM、单件流与SMED标准化' "$PRACTICE_PAGE" || { echo "ERROR: CN automotive lean practice title is missing."; exit 1; }
grep -Fq 'Factory Layout、精益物流与扩展边界规划' "$PRACTICE_PAGE" || { echo "ERROR: CN factory planning practice title is missing."; exit 1; }
grep -Fq '制造数据治理、IT/OT分层与系统验收' "$PRACTICE_PAGE" || { echo "ERROR: CN digital factory practice title is missing."; exit 1; }
grep -Fq '制造现场目视化系统设计与运行闭环' "$PRACTICE_PAGE" || { echo "ERROR: CN visual management practice title is missing."; exit 1; }
grep -Fq 'award-metrics-grid' "$PRACTICE_PAGE" || { echo "ERROR: CN 6S 2x2 mechanism metric grid is missing."; exit 1; }
grep -Fq 'award-flow' "$PRACTICE_PAGE" || { echo "ERROR: CN 6S closure flow is missing."; exit 1; }
grep -Fq 'QILY-CN-AWARD-MECHANISM-V2' "$PRACTICE_CSS" || { echo "ERROR: CN 6S award visualization V2 CSS contract is missing."; exit 1; }
grep -Fq 'grid-template-columns:repeat(2,minmax(0,1fr));' "$PRACTICE_CSS" || { echo "ERROR: CN 6S metric grid must render as 2x2 on desktop."; exit 1; }
grep -Fq 'white-space:nowrap;' "$PRACTICE_CSS" || { echo "ERROR: CN 6S metric values must avoid vertical wrapping."; exit 1; }

PUBLIC_COPY_INTERNAL_PATTERN='国际站当前|已全部映射为中国站|不引入国际站经营功能|首页仅展示精选入口|不设置国际站商务页面导流|个人非经营知识站|页面定位：|公开边界|展示经历，不包装成商业案例|中国站采用无二维码版本|不设置图片跳转入口|颁奖照片可以展示，但必须说明它证明的是什么|公开脱敏'
if grep -nE "$PUBLIC_COPY_INTERNAL_PATTERN" "$INDEX_FILE" "$PRACTICE_PAGE"; then
  echo "ERROR: Public CN pages contain internal/admin-facing copy."
  exit 1
fi
if grep -nE 'PUBLIC REDACTION|公开脱敏' "$PRACTICE_EVIDENCE"; then
  echo "ERROR: Public CN evidence visual contains internal redaction wording."
  exit 1
fi

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
