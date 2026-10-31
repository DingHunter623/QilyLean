#!/usr/bin/env bash
set -u
# Read-only network diagnostics. Does not modify either production site.
probe() {
  local label="$1" url="$2" headers
  headers="$(mktemp)"
  printf '\n[%s] %s\n' "$label" "$url"
  curl --silent --show-error --location --connect-timeout 6 --max-time 20 \
    --dump-header "$headers" --output /dev/null \
    --write-out 'http=%{http_code} dns=%{time_namelookup}s connect=%{time_connect}s tls=%{time_appconnect}s ttfb=%{time_starttransfer}s total=%{time_total}s bytes=%{size_download} speed=%{speed_download}B/s ip=%{remote_ip}\n' \
    "$url" || true
  grep -Ei '^(server|cf-cache-status|cf-ray|x-cache|age|via|cache-control|content-type):' "$headers" | tail -n 10 || true
  rm -f "$headers"
}
echo "===== DNS ====="
if command -v node >/dev/null 2>&1; then
  node - <<'NODE'
const dns = require('dns').promises;
(async () => {
  for (const host of ['qilylean.com', 'qilylean.cn']) {
    try { console.log('NS ' + host + ': ' + (await dns.resolveNs(host)).join(', ')); }
    catch (e) { console.log('NS ' + host + ': lookup failed (' + e.code + ')'); }
  }
})();
NODE
fi
for host in qilylean.com www.qilylean.com qilylean.cn www.qilylean.cn; do
  echo "-- $host"
  getent ahostsv4 "$host" 2>/dev/null | awk '!seen[$1]++ {print $1}' | head -n 4 || true
done
echo "===== HTTP probes (2 samples per endpoint) ====="
while IFS='|' read -r label url; do
  [ -n "$label" ] || continue
  probe "${label}_1" "$url"
  probe "${label}_2" "$url"
done <<'ENDPOINTS'
COM_HOME|https://qilylean.com/
COM_TEA_HTML|https://qilylean.com/links/anxi-tea/
COM_TEA_HERO|https://qilylean.com/assets/tea/01-hero-anxi-tieguanyin.jpg
COM_TEA_LARGE_IMAGE|https://qilylean.com/assets/tea/02-2026-spring-tea.jpg
COM_TEA_CSS|https://qilylean.com/tea-resource-visual-closure-v2.css?v=20261031-tea-vi-axis-gallery-contrast-v12
CN_HOME|https://qilylean.cn/
CN_HOME_IMAGE|https://qilylean.cn/assets/public-media/%E5%9B%AD%E5%8C%BA.png?v=64f33fb3077d276f
ENDPOINTS
