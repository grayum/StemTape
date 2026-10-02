#!/bin/sh
# Local, offline capability/startup probe. Pass the exact public deployment pin.
set -eu
image=${1:?Pass the pinned Caddy image reference}
case "$image" in *@sha256:*) ;; *) echo 'Use an immutable image digest.' >&2; exit 1;; esac
name="stemtape-caddy-smoke-$$"
config=$(mktemp)
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; rm -f "$config"; }
trap cleanup EXIT INT TERM
printf 'http://localhost:8080 {\n respond "ok"\n}\n' > "$config"
chmod 644 "$config"
if docker run --rm --init --user 10001:10001 --read-only --cap-drop ALL --security-opt no-new-privileges --network none "$image" caddy version; then
 echo 'NOTE: this image executes without NET_BIND_SERVICE; inspect its file capabilities before adding permissions.'
else
 echo 'Negative probe failed; compare its exec error with the capability-enabled probe below.'
fi
docker run --rm --init --user 10001:10001 --read-only --cap-drop ALL --cap-add NET_BIND_SERVICE --security-opt no-new-privileges --network none "$image" caddy version
docker run -d --name "$name" --init --user 10001:10001 --read-only --cap-drop ALL --cap-add NET_BIND_SERVICE --security-opt no-new-privileges --network none --pids-limit 100 --memory 192m --cpus .5 --tmpfs /tmp:rw,noexec,nosuid,nodev,size=16m,mode=1777 --mount "type=bind,source=$config,target=/etc/caddy/Caddyfile,readonly" "$image" caddy run --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null
n=0
until docker exec "$name" wget -q -O - http://localhost:8080/ | grep -qx ok; do
 n=$((n+1)); [ "$n" -lt 15 ] || { docker logs "$name"; exit 1; }; sleep 1
done
[ "$(docker exec "$name" id -u)" = 10001 ]
echo 'PASS: capability-enabled non-root Caddy startup and offline HTTP response. No public TLS/ACME verification.'
