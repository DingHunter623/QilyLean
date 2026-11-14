#!/usr/bin/env bash
# QILY-CN-INCREMENTAL-1B — incremental China-site release sync.
#
# Purpose (step 1b of the approved CN deploy speed-up plan):
#   Replace the ~192 MB whole-bundle transfer for routine releases with an
#   rsync of only the changed files against the live previous release.
#   Measured (1a, 2026-11-14): one-sentence brief change, whole bundle
#   201,029,397 bytes / 384 chunks -> rsync --checksum sends 103,446 bytes
#   (99.95% less). The new release directory is built by hard-link copying
#   the previous release (cp -al, near-zero cost) and syncing the delta in.
#
# HARD REQUIREMENT — rsync MUST run with --checksum:
#   Materialization rewrites every file's mtime, so plain rsync (size+mtime)
#   retransmits the whole 231 MB tree (measured 239 MB, worse than the
#   bundle). --checksum is what makes the increment work. Do not remove it.
#
# Safety contract (identical to the existing parity deploy path in
# .github/workflows/deploy-cn-preprod.yml, "Deploy release on mainland
# server" step):
#   * Same release layout: $SITE_ROOT/releases/<sha12>-<run>-<attempt>,
#     $SITE_ROOT/current symlink, atomic flip via temp symlink + mv -Tf.
#   * Same STATE dir /tmp/qily-cn-content-<run>-<attempt> with
#     previous/expected markers and the same rollback watchdog, so the
#     existing "Accept verified static-content release" and
#     "Restore previous static release after failed acceptance" steps work
#     unchanged.
#   * A per-file SHA256 manifest of the materialized tree is verified on the
#     server before the flip; any mismatch aborts to the whole-bundle
#     fallback (no flip happens).
#   * On any failure before the flip, the new release dir and STATE are
#     removed and the script reports incremental_ok=false (exit 0) so the
#     workflow falls back to the whole-bundle path. Only a failed rollback
#     after a successful flip exits non-zero (loud failure, state kept).
#
# Excludes mirror the whole-bundle build exactly (tar --exclude list):
#   scripts, nginx, *.md, assets/qilylean-aircraft-hero-cn-20260918.png
#
# Local-test mode (QILY_CN_LOCAL_TEST=1): SSH is bypassed, remote commands
# run locally via `bash -s`, SITE_ROOT/SRC_DIR/RELEASE_ID come from
# QILY_CN_* overrides, and sudo/nginx/curl must be stubbed on PATH.
# Test mode only — never in production.
set -euo pipefail

SITE_ROOT="${QILY_CN_SITE_ROOT:-/var/www/qilylean-cn}"
SRC_DIR="${QILY_CN_SRC_DIR:-cn-site}"
LOCAL_TEST="${QILY_CN_LOCAL_TEST:-0}"
USER_NAME="${CN_PREPROD_USER:-ubuntu}"
REMOTE_HOST="${CN_PREPROD_HOST:-}"
RELEASE_ID="${QILY_CN_RELEASE_ID:-${GITHUB_SHA:0:12}-${GITHUB_RUN_ID:-0}-${GITHUB_RUN_ATTEMPT:-0}}"
STATE_DIR="${QILY_CN_STATE_DIR:-/tmp/qily-cn-content-${GITHUB_RUN_ID:-0}-${GITHUB_RUN_ATTEMPT:-0}}"
MANIFEST_FILE="${RUNNER_TEMP:-/tmp}/qily-cn-incremental-manifest-${GITHUB_RUN_ID:-0}-${GITHUB_RUN_ATTEMPT:-0}.sha256"
RSYNC_LOG="${RUNNER_TEMP:-/tmp}/qily-cn-incremental-rsync-${GITHUB_RUN_ID:-0}-${GITHUB_RUN_ATTEMPT:-0}.log"

SSH_OPTS=(-o ConnectTimeout=20 -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o BatchMode=yes -i "$HOME/.ssh/qilylean_cn")
RSYNC_EXCLUDES=(--exclude=scripts --exclude=nginx --exclude='*.md' --exclude=assets/qilylean-aircraft-hero-cn-20260918.png)

write_output() { # $1 key, $2 value
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    printf '%s=%s\n' "$1" "$2" >> "$GITHUB_OUTPUT"
  fi
  echo "OUTPUT $1=$2"
}

# Soft failure: report fallback and exit 0 so the workflow continues with
# the whole-bundle path.
report_false() { # $1 reason
  echo "INCREMENTAL_SYNC ok=false reason=$1"
  write_output incremental_ok false
  write_output incremental_reason "$1"
  exit 0
}

# Run a bash script on the server (script on stdin, args as $1..).
# In local-test mode the same script runs locally.
remote_bash() {
  if [[ "$LOCAL_TEST" == "1" ]]; then
    bash -se -- "$@"
  else
    # shellcheck disable=SC2029
    ssh "${SSH_OPTS[@]}" "$USER_NAME@$REMOTE_HOST" "bash -se -- $(printf "'%s' " "$@")"
  fi
}

# Copy a local file onto the server (plain cp in local-test mode).
put_file() { # $1 local path, $2 remote path
  if [[ "$LOCAL_TEST" == "1" ]]; then
    cp "$1" "$2"
  else
    scp -q "${SSH_OPTS[@]}" "$1" "$USER_NAME@$REMOTE_HOST:$2"
  fi
}

rsync_stat() { # $1 label, $2 field number -> value from --stats output
  awk -v label="$1" -v field="$2" 'index($0, label) { gsub(/,/, "", $field); print $field; exit }' "$RSYNC_LOG"
}

# Per-file SHA256 manifest of the materialized tree, with the same excludes
# as the whole-bundle build. Deterministic order (LC_ALL=C sort).
build_manifest() {
  ( cd "$SRC_DIR" && find . \( -type d \( -name scripts -o -name nginx \) -prune \) -o \( -type f ! -name '*.md' ! -path './assets/qilylean-aircraft-hero-cn-20260918.png' -print0 \) | LC_ALL=C sort -z | xargs -r -0 sha256sum ) > "$MANIFEST_FILE"
}

run_rsync() { # $1 destination dir on the server
  local dest="$1" attempt
  for attempt in 1 2 3; do
    echo "rsync attempt $attempt/3 -> $dest"
    if [[ "$LOCAL_TEST" == "1" ]]; then
      if timeout 1200s rsync -a --checksum --delete "${RSYNC_EXCLUDES[@]}" --itemize-changes --stats "$SRC_DIR/" "$dest/" > "$RSYNC_LOG" 2>&1; then
        return 0
      fi
    else
      if timeout 1200s rsync -a --checksum --delete "${RSYNC_EXCLUDES[@]}" --itemize-changes --stats -e "ssh ${SSH_OPTS[*]}" "$SRC_DIR/" "$USER_NAME@$REMOTE_HOST:$dest/" > "$RSYNC_LOG" 2>&1; then
        return 0
      fi
    fi
    sleep 5
  done
  echo '--- rsync log (last attempt) ---'
  cat "$RSYNC_LOG"
  return 1
}

# Phase 1 (server): lock, STATE dir, rollback watchdog, hard-link copy of
# the previous release into the new release dir.
phase1_prepare() {
  remote_bash "$RELEASE_ID" "$STATE_DIR" "$SITE_ROOT" <<'REMOTE'
set -euo pipefail
RELEASE_ID="$1"
STATE="$2"
SITE_ROOT="$3"
[[ "$RELEASE_ID" =~ ^[a-f0-9]{12}-[0-9]+-[0-9]+$ ]]
[[ "$STATE" =~ ^/tmp/qily-cn-content-[0-9]+-[0-9]+$ ]]
[[ "$SITE_ROOT" =~ ^/[A-Za-z0-9_./-]+$ ]]
command -v rsync >/dev/null
command -v flock >/dev/null
command -v sha256sum >/dev/null
exec 9>"$SITE_ROOT/.content-deploy.lock"
flock -w 600 9
# NB: readlink -f resolves a missing final component lexically, so a
# missing/dangling `current` symlink must be rejected explicitly first.
test -L "$SITE_ROOT/current"
test -d "$SITE_ROOT/current"
PREVIOUS="$(readlink -f "$SITE_ROOT/current")"
[[ "$PREVIOUS" == "$SITE_ROOT/releases/"* ]]
test -d "$PREVIOUS"
EXPECTED="$SITE_ROOT/releases/$RELEASE_ID"
test ! -e "$EXPECTED"
mkdir -m 700 "$STATE"
printf '%s\n' "$PREVIOUS" > "$STATE/previous"
printf '%s\n' "$EXPECTED" > "$STATE/expected"
trap 'status=$?; trap - EXIT; touch "$STATE/deployer-finished"; if test "$status" -ne 0; then touch "$STATE/failed"; fi; exit "$status"' EXIT
trap 'touch "$STATE/failed"; exit 129' HUP
trap 'touch "$STATE/failed"; exit 130' INT
trap 'touch "$STATE/failed"; exit 143' TERM
cat > "$STATE/watchdog.sh" <<'WATCHDOG'
#!/usr/bin/env bash
set -euo pipefail
STATE="$1"
PREVIOUS="$2"
EXPECTED="$3"
SITE_ROOT="$4"
# Keep the previous static release until all public verification passes.
# An abandoned/terminated CI run cannot leave unaccepted content active.
# Exact-source and browser gates allow 40 + 30 minutes; reserve
# another 20 for article parity, evidence upload and acceptance.
# NOTE: keep in sync with the watchdog in deploy-cn-preprod.yml
# ("Deploy release on mainland server" step); only the site-root path
# is parameterized here (arg $4) instead of hard-coded.
for attempt in $(seq 1 2700); do
  if test -f "$STATE/committed"; then touch "$STATE/accepted"; exit 0; fi
  if test -f "$STATE/failed"; then break; fi
  sleep 2
done
touch "$STATE/failed"
# Stop a late switch after cancellation/timeout. If the deployer was
# already switching, let its atomic rename finish before restoration.
for attempt in $(seq 1 30); do
  if test -f "$STATE/switched" || test -f "$STATE/deployer-finished"; then break; fi
  sleep 1
done
rollback() {
  local current
  current="$(readlink -f "$SITE_ROOT/current")"
  if test "$current" = "$EXPECTED"; then
    test -d "$PREVIOUS" || return 1
    local next="$SITE_ROOT/.current-content-rollback-${EXPECTED##*/}"
    ln -sfn "$PREVIOUS" "$next" || return 1
    mv -Tf "$next" "$SITE_ROOT/current" || return 1
    sudo nginx -t || return 1
  elif test "$current" != "$PREVIOUS"; then
    echo 'A different release owns current; refusing to overwrite it.' >&2
    return 1
  fi
  test "$(readlink -f "$SITE_ROOT/current")" = "$PREVIOUS" || return 1
  test "$(curl --silent --show-error --connect-timeout 5 --max-time 20 --resolve qilylean.cn:443:127.0.0.1 -o /dev/null -w '%{http_code}' https://qilylean.cn/)" = 200
}
if rollback; then
  touch "$STATE/rolled-back"
  echo 'Previous static release restored; translation service was not changed.'
else
  touch "$STATE/rollback-failed"
  echo "Static rollback incomplete; recovery state retained at $STATE" >&2
  exit 1
fi
WATCHDOG
chmod 700 "$STATE/watchdog.sh"
nohup bash "$STATE/watchdog.sh" "$STATE" "$PREVIOUS" "$EXPECTED" "$SITE_ROOT" > "$STATE/watchdog.log" 2>&1 &
echo "$!" > "$STATE/watchdog.pid"
mkdir -p "$EXPECTED"
# --no-preserve=ownership: hard links share the source inode, so ownership
# is preserved by construction; the chown that plain -a attempts is
# redundant and fails outright on files the deploy user cannot chown
# (seen in test: cp -al exits 1 on root-owned trees).
cp -al --no-preserve=ownership "$PREVIOUS/." "$EXPECTED/"
# Mirror the whole-bundle excludes: a previous release must not leak deploy
# scripts, nginx config or markdown into the new release (the tarball build
# excludes them, so production never serves them; normally this is a no-op
# because a tarball-deployed previous release has none of them).
rm -rf "$EXPECTED/scripts" "$EXPECTED/nginx" "$EXPECTED/assets/qilylean-aircraft-hero-cn-20260918.png"
find "$EXPECTED" -name '*.md' -type f -delete
echo "PREVIOUS=$PREVIOUS"
echo "EXPECTED=$EXPECTED"
REMOTE
}

# Phase 3 (server): manifest + content checks, then the atomic flip.
# Runs only after rsync has populated the new release dir.
phase3_verify_flip() {
  remote_bash "$RELEASE_ID" "$STATE_DIR" "$SITE_ROOT" <<'REMOTE'
set -euo pipefail
RELEASE_ID="$1"
STATE="$2"
SITE_ROOT="$3"
[[ "$RELEASE_ID" =~ ^[a-f0-9]{12}-[0-9]+-[0-9]+$ ]]
[[ "$STATE" =~ ^/tmp/qily-cn-content-[0-9]+-[0-9]+$ ]]
EXPECTED="$SITE_ROOT/releases/$RELEASE_ID"
PREVIOUS="$(cat "$STATE/previous")"
test -d "$EXPECTED"
test -d "$PREVIOUS"
test ! -f "$STATE/failed"
test ! -f "$STATE/rolled-back"
# Per-file SHA256 manifest verification (source of truth: the runner).
cd "$EXPECTED" && sha256sum --quiet -c "$STATE/manifest.sha256"
# Content checks identical to the whole-bundle deploy step.
test -s "$EXPECTED/about/index.html"
test -s "$EXPECTED/assets/cn-sitewide-visual-parity-v1.css"
grep -Fq 'id="qilyCnWechatPillAlignment20261026"' "$EXPECTED/about/index.html"
grep -Fq 'id="qilyCnWechatValue"' "$EXPECTED/about/index.html"
grep -Fq 'background-color:#0f4b5a!important' "$EXPECTED/about/index.html"
grep -Fq 'QILY-CN-ABOUT-CONTACT-PARITY-20261025' "$EXPECTED/assets/cn-sitewide-visual-parity-v1.css"
for required in index.html robots.txt sitemap.xml favicon.ico assets/site.css assets/portal.css archive/source-content-parity.json meta/cn-content-release.json; do
  test -s "$EXPECTED/$required"
done
grep -Fq '湘ICP备2026041143号-1' "$EXPECTED/index.html"
grep -Fq '湘公网安备43020002000443号' "$EXPECTED/index.html"
grep -Fq '<urlset' "$EXPECTED/sitemap.xml"
sudo nginx -t
test ! -f "$STATE/failed"
test ! -f "$STATE/rolled-back"
NEXT="$SITE_ROOT/.current-content-$RELEASE_ID"
ln -s "$EXPECTED" "$NEXT"
mv -Tf "$NEXT" "$SITE_ROOT/current"
touch "$STATE/switched"
test "$(readlink -f "$SITE_ROOT/current")" = "$EXPECTED"
test "$(curl --silent --show-error --connect-timeout 5 --max-time 20 --resolve qilylean.cn:443:127.0.0.1 -o /dev/null -w '%{http_code}' https://qilylean.cn/)" = 200
echo 'Static content switched provisionally; independent rollback watchdog is active.'
REMOTE
}

# Ask the watchdog to roll back (if it is running) and report the state.
# Prints CURRENT=... PREVIOUS=... ROLLED_BACK=0/1 ROLLBACK_FAILED=0/1.
probe_cleanup_state() {
  remote_bash "$STATE_DIR" "$SITE_ROOT" <<'REMOTE'
set +e
STATE="$1"
SITE_ROOT="$2"
if test -d "$STATE"; then
  touch "$STATE/failed" 2>/dev/null || true
  for attempt in $(seq 1 60); do
    if test -f "$STATE/rolled-back" || test -f "$STATE/rollback-failed"; then break; fi
    if test -f "$STATE/watchdog.pid"; then
      if ! kill -0 "$(cat "$STATE/watchdog.pid")" 2>/dev/null; then break; fi
    else
      break
    fi
    sleep 2
  done
fi
# NB: readlink -f resolves a missing final component lexically, so only
# report a live release when the symlink exists and points at a directory.
if test -L "$SITE_ROOT/current" && test -d "$SITE_ROOT/current"; then
  CURRENT="$(readlink -f "$SITE_ROOT/current" 2>/dev/null || true)"
else
  CURRENT=""
fi
PREVIOUS="$(cat "$STATE/previous" 2>/dev/null || true)"
echo "CURRENT=$CURRENT"
echo "PREVIOUS=$PREVIOUS"
if test -f "$STATE/rolled-back"; then echo 'ROLLED_BACK=1'; else echo 'ROLLED_BACK=0'; fi
if test -f "$STATE/rollback-failed"; then echo 'ROLLBACK_FAILED=1'; else echo 'ROLLBACK_FAILED=0'; fi
REMOTE
}

# Failure path: roll back via the watchdog, then remove the failed release
# and STATE only when the previous release is live again (so the
# whole-bundle fallback can proceed with the same release id). If the
# current symlink does not point at the previous release, the state is
# unsafe: keep everything and fail loudly instead of guessing.
cleanup_after_failure() { # $1 reason
  local reason="$1" info current previous
  echo "Incremental sync failed ($reason); requesting watchdog rollback."
  info="$(probe_cleanup_state || true)"
  echo "$info"
  current="$(printf '%s\n' "$info" | awk -F= '/^CURRENT=/ { print $2 }')"
  previous="$(printf '%s\n' "$info" | awk -F= '/^PREVIOUS=/ { print $2 }')"
  if [[ -n "$current" && -n "$previous" && "$current" == "$previous" ]]; then
    echo 'Previous release is live again; removing the failed release and state.'
    remote_bash "$STATE_DIR" "$SITE_ROOT/releases/$RELEASE_ID" "$SITE_ROOT" <<'REMOTE' || true
set +e
STATE="$1"
EXPECTED="$2"
SITE_ROOT="$3"
[[ "$EXPECTED" == "$SITE_ROOT/releases/"* ]] || exit 0
rm -rf "$STATE" "$EXPECTED"
REMOTE
    report_false "$reason"
  fi
  if [[ -z "$current" && -z "$previous" ]]; then
    # Nothing was ever deployed by this run (e.g. no previous release
    # exists at all): no flip happened, nothing is live-but-bad.
    echo 'No previous release and no live release from this run; removing any partial state.'
    remote_bash "$STATE_DIR" "$SITE_ROOT/releases/$RELEASE_ID" "$SITE_ROOT" <<'REMOTE' || true
set +e
STATE="$1"
EXPECTED="$2"
SITE_ROOT="$3"
[[ "$EXPECTED" == "$SITE_ROOT/releases/"* ]] || exit 0
rm -rf "$STATE" "$EXPECTED"
REMOTE
    report_false "$reason"
  fi
  echo "Unsafe state after incremental failure (current=$current previous=$previous); keeping state for inspection." >&2
  write_output incremental_ok false
  write_output incremental_reason "unsafe-state-after-$reason"
  exit 1
}

main() {
  if [[ "${SOURCE_PARITY:-}" != "true" ]]; then
    report_false 'parity-disabled'
  fi
  if [[ ! "$RELEASE_ID" =~ ^[a-f0-9]{12}-[0-9]+-[0-9]+$ ]]; then
    echo "Invalid RELEASE_ID: $RELEASE_ID" >&2
    exit 2
  fi
  if [[ "$LOCAL_TEST" != "1" ]]; then
    if [[ -z "$REMOTE_HOST" ]]; then echo 'CN_PREPROD_HOST is empty' >&2; exit 2; fi
    if [[ ! -s "$HOME/.ssh/qilylean_cn" ]]; then echo 'SSH key ~/.ssh/qilylean_cn is missing' >&2; exit 2; fi
  fi
  command -v rsync >/dev/null 2>&1 || report_false 'rsync-missing-runner'
  if [[ ! -d "$SRC_DIR" ]]; then echo "Source dir missing: $SRC_DIR" >&2; exit 2; fi

  local expected="$SITE_ROOT/releases/$RELEASE_ID"

  echo "Incremental sync: $SRC_DIR -> $expected (release $RELEASE_ID)"
  if ! phase1_prepare; then
    cleanup_after_failure 'prepare-failed'
  fi
  if ! build_manifest; then
    cleanup_after_failure 'manifest-failed'
  fi
  if ! put_file "$MANIFEST_FILE" "$STATE_DIR/manifest.sha256"; then
    cleanup_after_failure 'manifest-upload-failed'
  fi
  if ! run_rsync "$expected"; then
    cleanup_after_failure 'rsync-failed'
  fi
  if ! phase3_verify_flip; then
    cleanup_after_failure 'verify-or-flip-failed'
  fi

  local bytes_sent files_transferred
  bytes_sent="$(rsync_stat 'Total bytes sent:' 4)"
  files_transferred="$(rsync_stat 'Number of regular files transferred:' 6)"
  echo "INCREMENTAL_SYNC ok=true bytes_sent=${bytes_sent:-unknown} files_transferred=${files_transferred:-unknown}"
  write_output incremental_ok true
  write_output incremental_bytes_sent "${bytes_sent:-0}"
  write_output incremental_files_transferred "${files_transferred:-0}"
  exit 0
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
