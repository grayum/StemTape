#!/bin/sh
# Print immutable image references; never rewrite the user's environment file.
set -eu
for image in nginx:stable-alpine caddy:2-alpine; do
  docker pull "$image" >/dev/null
  docker image inspect --format '{{index .RepoDigests 0}}' "$image"
done
