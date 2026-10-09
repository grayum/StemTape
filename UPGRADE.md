# Upgrade to 0.6.1 (review candidate)

This is a presentation-only patch from v0.6.0. Existing state/schema, CSV/JSON, column identities, save timestamps/recovery and physical sheet/print generation are unchanged. Export a complete JSON backup and keep the tested v0.6.0 image before any separately authorized deployment. Preserve private proxy configuration, certificates and the browser origin/profile. No automatic migration or data reset is required.

Sheet dimensions and font controls now live inside Layout & print settings, with the existing controls grouped under five headings. Both import actions retain their names and behavior. Footer text stays visible but disabled when off; its stored content is unchanged.

Rollback to the tested v0.6.0 image on the same browser origin does not introduce new metadata loss: this patch adds no data fields. Older v0.5.0 limitations described below still apply. Verify import cards/keyboard order, grouped settings and retained footer in both themes, narrow widths and actual 200% browser zoom before release; v0.6.0 live confirmation does not validate the new presentation. No production rebuild or deployment is part of preparation.

# Upgrade to 0.6.0 (review candidate)

Use a verified bundle/base for this private repository; do not substitute a stale checkout. Export complete JSON, close other tabs, retain the previous tested image and private configuration before any separately authorized deployment. Use `vim` for later operator edits. This preparation changes no production settings.

Schema/key stay v1. Column-array order and existing visibility flags remain authoritative. Optional event fields `cueColumnId` and `noteColumnId` identify existing non-primary columns; Note must be text and distinct from the cue-icon column. Invalid references are rejected, leaving imports/storage originals protected. Old plans acquire no metadata on load. First movement or Note creation adds identity metadata within the existing 2,000,000-byte UTF-8 budget; an over-budget action rolls back, and failed writes remain visibly unsaved. Both modes and presets remain included.

Show note column is off by default for existing and new templates, including Custom. First enable creates a distinct text column with width share 25 and empty cells in both modes; it never reuses a similarly named existing column. Other widths, fonts and sheet dimensions are unchanged. Subsequent toggles use visibility, preserving name, text, order and width. Its type/removal/visibility controls in Column details are protected to avoid conflicting with the toggle; rename, width, alignment and emphasis remain editable. Other custom columns retain their controls. The icon-host column can be explicitly removed only when another non-Note data column can replace it.

CSV now omits hidden data columns; mandatory position/icon fields remain. Editor hidden data columns are also hidden, while primary position and icon editing stay available. JSON retains everything. Existing three-field CSV metadata imports still work. A fourth cue/note role field is emitted for identified columns, including renamed notes; duplicates, unknown roles and invalid role/type combinations are rejected. This preserves visible data/icon alignment and prevents repeated toggles from duplicating an explicitly imported Note. CSV exports containing these roles require v0.6.0; v0.5.0 rejects them. If no visible non-Note data remains, import adds an empty Fuel column to meet the existing two-column model; omitted hidden content is recoverable only from JSON. CSV still follows existing formula/precision/type limitations.

Rollback: restore the previous tested image without changing browser origin/profile or private proxy/certificate data. **Keep a v0.6.0 JSON backup first.** v0.5.0 can read column order, values, visibility and footer, but its validated save/re-export drops cue/note identity metadata. Its print renderer then attaches icons to the second data column, which may now be Note. Reopening such modified data in v0.6.0 cannot safely infer the optional Note by label; restore the retained v0.6.0 JSON rather than enabling another Note. Do not edit the same storage from older tabs. No reset or destructive automatic migration is required.

Validate the [manual checklist](docs/REVIEW-v0.6.0.md), including narrow/wide sheets, rotations, actual-size PDF and physical printing at 100% with the 50 mm calibration line. Prior physical-print evidence is not verification of this candidate.

# Upgrade to 0.5.0 (review candidate)

Export a complete JSON backup, close other StemTape tabs and retain the previous tested app image and private proxy configuration. This preparation does not authorize deployment. Use `vim` for any later operator edits; keep private configuration and certificate volumes in place. Rebuild from the reviewed source with a pinned base image only after the outstanding validation gates pass.

Schema/key remain v1. Footer settings are optional layout fields `footerEnabled` and `footerText`; absent fields mean off/empty. Loading old data does not add these fields or consume extra bytes. Footer metadata, both mode lists, presets and preferences share the existing 2,000,000-byte UTF-8 budget. Rejected edits and failed storage writes preserve saved data and recovery originals. The footer is one centered line at the plan font, maximum 80 UTF-16 units; actual overflow blocks printing. JSON backups and duplication preserve it, while cue CSV intentionally carries only cues. Icon keys stay unchanged; existing bar/bottle/gel/cobbles cues display the replacements automatically.

Rollback: restore the previous tested image and compatible public proxy configuration, preserving browser origin/profile and certificate volumes. v0.4.1 reads the plan/cues but ignores the new optional footer fields; its next save or re-export drops them. Keep a v0.5.0 JSON backup before rollback so footer settings can be restored later. Do not let an older tab overwrite newer state. No migration or reset is required. Recheck actual-size output when changing print setup; no new physical-print verification is claimed here.

After a separately authorized v0.5.0 deployment and successful verification on stemtape.cc, revisit the [approved column follow-ups](docs/ROADMAP.md). Their implementation belongs to a subsequent stage, not this release.

# Upgrade to 0.4.1 (review candidate)

Export a complete JSON backup, close other StemTape tabs and retain the previous tested image digest and private configuration before an operator-authorized upgrade. No deployment is part of this preparation. Rebuild the static image to include `dist/.well-known/security.txt`; preserve browser origin/profile and existing volumes/config. Do not copy examples over working private configuration. Use `vim` for operator edits.

Schema/key remain v1. Optional savedAt, the 2,000,000-byte budget, session-only time fallback and original recovery protection are unchanged. Existing Eat / drink (or customized) labels stay intact; only newly created nutrition templates use Fuel. There is no reliable default-label provenance in older records, so no migration guesses user intent. To rename an existing plan, edit its column label explicitly.

Distance preferences are retained across Time mode; additional distance columns continue to use that preference. Switch to Distance to change it, then back to Time. Physical mm/in settings remain available. Custom-preset plans themselves still use distance mode; customized nutrition plans and time CSV imports may contain additional distance columns.

Self-hosters must customize security.txt Contact, Canonical and Expires and maintain the reporting channel. The bundled contact is for stemtape.cc. Public endpoint/headers and existing Cloudflare compression should be checked after an authorized deployment. Remaining edge cipher/key-exchange findings are accepted limitations, not fixed by this patch.

Rollback: restore the previous tested application image and its compatible public proxy configuration, retaining certificate volumes and browser data. v0.4.0 reads v0.4.1 v1 data; it may show the older status UI but keeps Fuel/custom labels. Older versions may drop optional savedAt on their next write. Restore JSON only if needed and after exporting the current state; unreadable original recovery files may require offline repair. No data migration or storage reset is required. Removing the security.txt endpoint on rollback also removes the published discovery channel; check it explicitly.

# Upgrade to 0.4.0 (review candidate)

Keep a complete JSON backup and the prior tested image. This review does not authorize deployment. Source remains at `/opt/docker/stemtape`; preserve private configuration and certificate data under `/opt/docker/stemtape-config`. Use `vim` for any later operator edits; do not copy public examples over private files.

- Review the [security/deployment runbook](docs/SECURITY-DEPLOYMENT.md) independently first. Cloudflare edge TLS settings and CAA are manual operator changes, separate from Caddy. The VPS example adds NET_BIND_SERVICE only to proxy; verify against the exact live image digest before adopting it. The application retains cap_drop ALL with no added capability.
- Review [save status](docs/SAVE-STATUS.md) second. Schema version and storage key remain v1. Optional `savedAt` shares the validated byte budget and atomic state write. Legacy timestamps remain unknown; older versions ignore/drop this optional field without losing plans. Exact-limit plans omit timestamp metadata if necessary and explicitly show session-only time. No startup rewrite occurs.
- A stale tab must export its in-memory plan before reloading. Close old-version tabs before upgrading: old code cannot enforce the new stale-tab guard. Recovery originals stay protected until a successful explicit replacement. Complete backups remain the rollback path; unreadable originals may need offline repair.
- Run the documented checks for this candidate and review native-browser/mobile/accessibility behavior. Recheck actual-size printing if the printing environment changes. Existing v0.3.0 CI/manual records do not establish v0.4.0 release readiness.

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

## Review fixes: byte policy and CSV compatibility

Schema version and `stemtape.v1` stay unchanged; no migration rewrites existing data. Valid backups within 2,000,000 UTF-8 bytes still restore. Oversized or unreadable browser storage opens recovery mode, preserving the exact original and offering its export before explicit replacement. Recovery originals may require offline repair or splitting before import; never discard them. New complete backups use the same compact encoding and byte budget as saved state. Browser quota failures still leave accepted in-memory data exportable.

New CSV custom-distance headers use explicit metadata to preserve labels and units, including 32-character labels and literal bracketed units. Older versions do not understand these headers; use JSON for full fidelity. Old unmarked headers such as `Water [km]` continue to import as literal text rather than guessing whether the suffix was generated.
