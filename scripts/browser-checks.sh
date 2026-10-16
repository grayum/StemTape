#!/bin/sh
# Shared CI/Pages gate: hardened root hosting and plain static project hosting.
set -eu
mkdir -p artifacts/root
mount_dir=$(mktemp -d)
root_pid=
pages_pid=
cleanup() {
  [ -z "$root_pid" ] || kill "$root_pid" 2>/dev/null || true
  [ -z "$pages_pid" ] || kill "$pages_pid" 2>/dev/null || true
  rm -rf "$mount_dir"
}
trap cleanup EXIT INT TERM
python3 scripts/serve.py --diagnostics > artifacts/root-server.log 2>&1 &
root_pid=$!
ln -s "$PWD/dist" "$mount_dir/StemTape"
python3 -m http.server 8081 --bind 127.0.0.1 --directory "$mount_dir" > artifacts/pages-server.log 2>&1 &
pages_pid=$!
for url in http://127.0.0.1:8080/ http://127.0.0.1:8081/StemTape/; do
  attempt=0
  until curl -fsS "$url" >/dev/null; do
    attempt=$((attempt+1))
    [ "$attempt" -lt 15 ] || exit 1
    sleep 1
  done
done
BASE_URL=http://127.0.0.1:8080/ npm run test:browser
for file in artifacts/*.png artifacts/*.pdf; do
  [ ! -f "$file" ] || cp "$file" artifacts/root/
done
BASE_URL=http://127.0.0.1:8081/StemTape/ npm run test:browser
BASE_URL=http://127.0.0.1:8081/StemTape/ node tests/pages-browser.mjs
