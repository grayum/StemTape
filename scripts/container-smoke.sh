#!/bin/sh
set -eu
image=${1:-stemtape:0.5.0}
name="stemtape-smoke-$$"
port=${STEMTAPE_TEST_PORT:-18080}
repo=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
response=$(mktemp)
headers=$(mktemp)
cleanup() { docker stop "$name" >/dev/null 2>&1 || true; rm -f "$response" "$headers"; }
trap cleanup EXIT INT TERM
docker run --rm --init -d --name "$name" --user 10001:10001 --read-only --cap-drop ALL --security-opt no-new-privileges --tmpfs /tmp:rw,noexec,nosuid,nodev,size=16m,mode=1777 --pids-limit 100 --memory 128m --cpus .5 -p 127.0.0.1:$port:8080 "$image" >/dev/null
n=0
until curl --fail --silent http://127.0.0.1:$port/healthz >/dev/null; do
  n=$((n+1)); [ "$n" -lt 15 ] || { docker logs "$name"; exit 1; }; sleep 1
done
[ "$(docker exec "$name" id -u)" = 10001 ]
if docker exec "$name" touch /srv/stemtape/should-not-exist; then echo 'ERROR: app root writable'; exit 1; fi
curl --fail --silent --head http://127.0.0.1:$port/ | grep -qi 'content-security-policy:'
[ "$(curl --silent -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:$port/)" = 405 ]
echo 'PASS: non-root, read-only app, HTTP headers, GET and rejected POST.'

# Check the bytes served by the image, not just the source file or Docker COPY rules.
[ "$(curl --silent --show-error -D "$headers" -o "$response" -w '%{http_code}' "http://127.0.0.1:$port/.well-known/security.txt")" = 200 ]
cmp "$repo/dist/.well-known/security.txt" "$response"
tr -d '\r' < "$headers" | grep -qi '^content-type: text/plain; charset=utf-8$'
grep -qi '^content-security-policy:' "$headers"
for path in /.env /.git/config /.well-known/other.txt /.well-known/security.txt/extra; do
 [ "$(curl --silent -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port$path")" = 403 ]
done
curl --fail --silent -H 'Accept-Encoding: gzip' -D "$headers" -o /dev/null "http://127.0.0.1:$port/app.js"
grep -qi '^content-encoding: gzip' "$headers"
echo 'PASS: exact security.txt bytes/type/security headers, hidden-path denial and gzip.'
