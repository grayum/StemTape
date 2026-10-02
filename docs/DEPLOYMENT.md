# Deployment: laptop → homelab → VPS

## Local laptop / SDX

Copy `docker-compose.example.yaml` to private `docker-compose.yaml`, and `.env.example` to `.env`. The defaults use `127.0.0.1:8080` only. Run:

```sh
docker compose -f docker-compose.yaml config --quiet
docker compose -f docker-compose.yaml up --build -d
```

For frontend-only work use `python3 scripts/serve.py`. Neither local server is a public production endpoint. Run the data and browser tests from README before promoting changes.

## Existing Traefik (homelab or VPS)

Edit the private Compose file:

1. Remove the two-line `ports` block.
2. Uncomment `- traefik` under the app's networks.
3. Uncomment the complete Traefik labels block.
4. Uncomment the external `traefik` network definition at the bottom.
5. Set `STEMTAPE_DOMAIN`, `TRAEFIK_NETWORK`, and `TRAEFIK_CERTRESOLVER` in `.env` to your actual values.

Do not change the existing proxy or start Caddy. The example assumes the `websecure` entrypoint and existing HTTP-to-HTTPS redirection. The resolver/network must already exist. No app host port or authentication is required for the public tool. Protect administrative interfaces separately. The Traefik labels include rate limiting and HSTS on HTTPS; do not set includeSubDomains/preload without checking the wider domain.

## Standalone VPS with Caddy (optional)

Use only if you do not already have a reverse proxy. Copy the settings from `deploy/.env.vps.example` to the project-root `.env` and set the real domain plus verified Nginx/Caddy alpine digests. Prepare certificate directories and run from the project root:

```sh
sudo install -d -o 10001 -g 10001 -m 700 runtime/caddy-data runtime/caddy-config
docker compose --project-directory . --env-file .env -f deploy/docker-compose.vps.example.yaml config --quiet
docker compose --project-directory . --env-file .env -f deploy/docker-compose.vps.example.yaml up --build -d
```

`--project-directory .` is important: build context and bind mounts are relative to the project root. This file includes the app and Caddy and must not be combined with the local-test/Traefik example. It publishes only proxy ports 80/443. Caddy runs non-root internally on 8080/8443, obtains/renews TLS, and keeps certificates in the private runtime directories. Admin API and access logging are disabled in the example.

## Base-image pinning and release

An explicit Nginx version tag is supplied for local testing. For production resolve the selected alpine image to a digest, scan it and set `NGINX_IMAGE=nginx@sha256:...`. The supplied Dockerfile requires Alpine. Pinning does not replace updates.

Build and scan once, push to your registry, then use the exact same application digest in homelab and production via STEMTAPE_IMAGE. After pulling it, run Compose with `up -d --no-build`. Keep the previous digest and pre-upgrade JSON for rollback; preserve TLS state. Never automatically overwrite private .env, docker-compose.yaml or runtime directories.

## Host and network checks

Use a supported, patched VPS OS/Docker and key-based restricted SSH. Keep management off the public network. Verify provider and Docker-aware firewall rules, IPv4 and IPv6; do not rely only on UFW for published Docker ports. DNS must resolve to the proxy. Verify valid TLS, exact-host routing, HTTP redirection, CSP/security headers and no exposed app port/dashboard. Check external Host/IP-only requests do not serve the application. Provider-level denial-of-service protection is a separate hosting concern; the standalone Caddy example has timeouts/resource limits but no third-party rate-limit module.

Only plan content stays client-side: servers necessarily receive ordinary connection metadata. No access logging is enabled by the app example; operator proxy logging may differ. A server compromise could change delivered JavaScript and threaten browser data. Keep the build/deployment supply chain protected.

## Cloudflare in front of the Caddy origin

For `stemtape.cc` (Cloudflare → DigitalOcean → Caddy → app), use the [v0.4.0 security runbook](SECURITY-DEPLOYMENT.md). It distinguishes edge TLS from origin TLS, gives manual Cloudflare/CAA and verified Host/SNI checks, and records the proxy-only `NET_BIND_SERVICE` requirement for capability-marked Caddy images. The live private deployment path is `/opt/docker/stemtape-config`; source is `/opt/docker/stemtape`. Keep the working private mounts and certificate data rather than replacing them with example-relative paths.
