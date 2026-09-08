#!/usr/bin/env bash
# Deploy the Lysp frontend from GitHub.
#
#   git fetch (with retry) -> build in a sibling checkout -> swap .next -> pm2 reload -> verify
#
# One build serves all three surfaces. They differ only by APP_MODE, which the middleware reads
# to decide which routes it owns; running them as separate processes on separate ports is what
# gives each domain its own browser origin, and that is what keeps a firm session and a client
# session from ever colliding in localStorage.
#
# Run it detached — a Next build takes minutes and a dropped SSH session would otherwise kill it
# partway:
#
#   setsid nohup bash /root/deploy-lysp-frontend.sh > /var/log/lysp-fe-deploy.log 2>&1 < /dev/null &
#
set -euo pipefail

SRC=/srv/lysp/frontend
BUILD=/srv/lysp/frontend-build
BRANCH="${1:-main}"
ECOSYSTEM="$SRC/ecosystem.config.cjs"

started=$(date +%s)

# GitHub over SSH drops the occasional connection; the first attempt today timed out and the
# deploy stopped there having done nothing, which was correct but wasted a round trip. Retry
# with backoff before giving up.
fetch_with_retry() {
  local attempt=1 delay=10
  until git fetch --quiet origin "$BRANCH"; do
    if [ "$attempt" -ge 5 ]; then
      echo "  git fetch failed after $attempt attempts - nothing has been changed"; return 1
    fi
    echo "  fetch attempt $attempt failed, retrying in ${delay}s"
    sleep "$delay"; attempt=$((attempt + 1)); delay=$((delay + 10))
  done
}

echo "== fetching $BRANCH =="
cd "$SRC"
fetch_with_retry
BEFORE="$(git rev-parse --short HEAD)"
git reset --hard --quiet "origin/$BRANCH"
AFTER="$(git rev-parse --short HEAD)"
echo "  $BEFORE -> $AFTER  $(git log -1 --format=%s | head -c 70)"

echo "== installing dependencies =="
# npm ci installs exactly what the lockfile says and fails if it disagrees with package.json.
# Done in the serving checkout: the build below shares this node_modules, so the two cannot
# drift apart.
npm ci --no-audit --no-fund > /tmp/lysp-fe-install.log 2>&1 || {
  echo "  npm ci FAILED - nothing has been changed"; tail -20 /tmp/lysp-fe-install.log; exit 1; }
echo "  ok"

echo "== building =="
# Next serves out of .next and reads it lazily per request. Building in place rewrote that
# directory under the running processes, and for the length of the build every surface
# answered 500 ("Cannot find module load-manifest.external.js"). That window is real — it
# broke a live check today. So the build happens in a sibling checkout that shares
# node_modules, and .next is swapped in with two renames that take milliseconds.
mkdir -p "$BUILD"
rsync -a --delete --exclude node_modules --exclude .next "$SRC/" "$BUILD/"
# Hardlinks, not a symlink. Turbopack refuses to resolve packages through a symlink that
# points outside the project root (TurbopackInternalError: find_package failed), which is
# how the first run of this script failed. cp -al gives the build a real node_modules that
# shares every file's inode with the serving one: near-instant, no extra disk, and safe
# because npm replaces files rather than editing them in place.
rm -rf "$BUILD/node_modules"
cp -al "$SRC/node_modules" "$BUILD/node_modules"
cd "$BUILD"
if ! NEXT_PUBLIC_API_URL=/ NODE_ENV=production npx next build > /tmp/lysp-fe-build.log 2>&1; then
  echo "  BUILD FAILED - the running surfaces have not been touched"
  grep -iE 'error|failed' /tmp/lysp-fe-build.log | head -20
  exit 1
fi
echo "  built in $(( $(date +%s) - started ))s"

echo "== swapping build =="
cd "$SRC"
rm -rf "$SRC/.next.old"
[ -d "$SRC/.next" ] && mv "$SRC/.next" "$SRC/.next.old"
mv "$BUILD/.next" "$SRC/.next"
echo "  .next replaced; previous kept as .next.old until the surfaces are verified"

echo "== reloading surfaces =="
# pm2 reload restarts a process but will not move it to a different working directory, so
# reloading against this config while the surfaces run elsewhere quietly re-runs the OLD build
# and reports success. Recreate them in that case.
running_cwd="$(pm2 jlist 2>/dev/null \
  | python3 -c "import sys,json; a=[x for x in json.load(sys.stdin) if x['name']=='lysp-landing']; print(a[0]['pm2_env'].get('pm_cwd','') if a else '')" 2>/dev/null || true)"

if [ "$running_cwd" != "$SRC" ]; then
  echo "  surfaces were running from '${running_cwd:-nowhere}', recreating them here"
  pm2 delete lysp-landing lysp-app lysp-portal > /dev/null 2>&1 || true
  pm2 start "$ECOSYSTEM" > /dev/null
else
  pm2 reload "$ECOSYSTEM" --update-env > /dev/null
fi
pm2 save > /dev/null

echo "== verifying =="
fail=0

for app in lysp-landing lysp-app lysp-portal; do
  cwd="$(pm2 jlist 2>/dev/null | python3 -c "import sys,json; a=[x for x in json.load(sys.stdin) if x['name']=='$app']; print(a[0]['pm2_env'].get('pm_cwd','') if a else 'MISSING')" 2>/dev/null || echo '?')"
  if [ "$cwd" != "$SRC" ]; then
    printf '  %-14s SERVING FROM %s, not the checkout\n' "$app" "$cwd"; fail=1
  fi
done

for pair in "3020:landing" "3021:firm app" "3022:client portal"; do
  port="${pair%%:*}"; name="${pair#*:}"
  code=""
  for i in $(seq 1 30); do
    code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/" 2>/dev/null || true)"
    case "$code" in 200|307|308) break;; esac
    sleep 2
  done
  case "$code" in
    200|307|308) printf '  %-14s :%s  %s\n' "$name" "$port" "$code" ;;
    *)           printf '  %-14s :%s  %s  FAILED\n' "$name" "$port" "${code:-no answer}"; fail=1 ;;
  esac
done

if [ "$fail" = "1" ]; then
  echo "== a surface did not come up - rolling .next back =="
  if [ -d "$SRC/.next.old" ]; then
    rm -rf "$SRC/.next" && mv "$SRC/.next.old" "$SRC/.next"
    pm2 reload "$ECOSYSTEM" > /dev/null || true
    echo "  previous build restored; check: pm2 logs"
  fi
  exit 1
fi

rm -rf "$SRC/.next.old"
echo "== done in $(( $(date +%s) - started ))s   running commit $AFTER =="
