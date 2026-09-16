#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-cn-site}"

mapfile -t FILES < <(find "$ROOT_DIR" -type f \( \
  -name '*.html' -o -name '*.htm' -o -name '*.xml' -o -name '*.json' -o \
  -name '*.js' -o -name '*.css' -o -name '*.txt' \
\) ! -path '*/scripts/*' -print)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "No deployable CN site files found."
  exit 1
fi

FORBIDDEN_PATTERN='项目合作|商务合作|业务合作|业务承接|项目承接|签单|签约|报价|收费|付款|合同|发票|收款|咨询预约|预约咨询|获取方案|联系我们|立即咨询|服务套餐|招商|代理加盟|资源撮合|提成|分成|商业交付|咨询转化|销售线索|客户招揽|核心业务|直接交付|业务转化'

if grep -RniE --include='*.html' --include='*.htm' --include='*.xml' --include='*.json' --include='*.js' --include='*.css' --include='*.txt' \
  --exclude-dir='scripts' "$FORBIDDEN_PATTERN" "$ROOT_DIR"; then
  echo "ERROR: Mainland personal site contains forbidden commercial wording."
  exit 1
fi

if grep -RniE --include='*.html' --include='*.htm' --include='*.xml' --include='*.json' --include='*.js' \
  --exclude-dir='scripts' 'https?://(www\.)?qilylean\.com([/"'"'"'?#]|$)' "$ROOT_DIR"; then
  echo "ERROR: Mainland personal site must not link to QilyLean international commercial pages."
  exit 1
fi

if grep -RniE --include='*.html' --include='*.htm' --include='*.xml' --include='*.json' --include='*.js' \
  --exclude-dir='scripts' '(tel:|mailto:|weixin:|weChat|whatsapp:)' "$ROOT_DIR"; then
  echo "ERROR: Mainland personal site contains direct contact/conversion hooks."
  exit 1
fi

echo "CN personal-site non-commercial content gate passed."
