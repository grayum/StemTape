# Upgrade 0.1.x / 0.2.x → 0.3.0

1. Export a complete JSON backup from the running app. Keep the same browser profile and hostname to retain local plans.
2. Extract the new ZIP into a fresh directory. Keep your old directory/image for rollback.
3. Copy your existing private `docker-compose.yaml` and `.env` into the new directory. Do **not** overwrite them with the public examples. Preserve any private hosting/runtime files.
4. If your existing Compose uses an older `image: stemtape:…`, change it to `image: ${STEMTAPE_IMAGE:-stemtape:0.3.0}` and set `STEMTAPE_IMAGE=stemtape:0.3.0` in `.env`. Merely changing `.env` does not change a hardcoded image label.
5. Keep your working Traefik domain, network, certificate resolver and pinned Nginx reference. No new environment variables are needed for the UI changes.
6. From the new directory, validate and rebuild using your private configuration:

```sh
docker compose -f docker-compose.yaml config --quiet
docker compose -f docker-compose.yaml up -d --build
```

7. Reload the browser (hard-refresh if old assets remain cached). Confirm v0.3.0, existing events, drag ordering, new icon selection and a test print.

The storage key `stemtape.v1` and schema version 1 are unchanged. 0.1 and 0.2 backups remain valid in 0.3. Backups containing new icon keys will not import into 0.1; keep the pre-upgrade JSON if rollback is needed. Print sizing and SVG layout code are unchanged.

## Config examples changed

The new `docker-compose.example.yaml` is a single local-test configuration with optional **commented** Traefik sections. It replaces the old `compose.example.yaml` plus local/Traefik overlays. You do not need to adopt it if your private Compose already works.

The standalone Caddy/VPS file is now `deploy/docker-compose.vps.example.yaml`; it is independent, not an overlay. Caddy settings are in `deploy/.env.vps.example`. The default `.env.example` contains no Caddy setting.
