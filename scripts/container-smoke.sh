#!/bin/sh
set -eu
image=${1:-stemtape:0.4.0}
name="stemtape-smoke-$$"
cleanup() { docker stop "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT INT TERM
docker run --rm --init -d --name "$name" --user 10001:10001 --read-only --cap-drop ALL --security-opt no-new-privileges --tmpfs /tmp:rw,noexec,nosuid,nodev,size=16m,mode=1777 --pids-limit 100 --memory 128m --cpus .5 -p 127.0.0.1:18080:8080 "$image" >/dev/null
n=0
until curl --fail --silent http://127.0.0.1:18080/healthz >/dev/null; do
  n=$((n+1)); [ "$n" -lt 15 ] || { docker logs "$name"; exit 1; }; sleep 1
done
[ "$(docker exec "$name" id -u)" = 10001 ]
if docker exec "$name" touch /srv/stemtape/should-not-exist; then echo 'ERROR: app root writable'; exit 1; fi
curl --fail --silent --head http://127.0.0.1:18080/ | grep -qi 'content-security-policy:'
[ "$(curl --silent -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:18080/)" = 405 ]
echo 'PASS: non-root, read-only app, HTTP headers, GET and rejected POST.'
