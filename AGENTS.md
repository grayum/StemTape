# StemTape development contract

Read README.md, SECURITY.md and docs/ARCHITECTURE.md before making changes.

- Capitalize the first letter of built-in cue display labels; preserve stored icon keys and user-entered text.
- Local-first static app. All events/imports/exports/printing remain browser-side. No analytics, accounts, external assets, server data APIs, GPX or inferred climbs.
- Metric defaults regardless of locale; explicit overrides. Never convert time into distance using guessed speed. Preserve both mode lists.
- All user/imported/stored data is untrusted. Use textContent/DOM APIs, never innerHTML, document.write, eval or user-controlled SVG/HTML. Icon data is a fixed audited local subset.
- Strict CSP: do not add unsafe-inline/unsafe-eval or network permissions to bypass an implementation bug.
- No silent text clipping, font shrinking, or data loss. Block printing on overflow; dimensions must use physical units and include a calibration scale.
- Preserve original data on failed imports, incompatible local schema or upgrades. Schema changes require migration and round-trip tests.
- Never commit .env, private compose.yaml/docker-compose.yaml, runtime/, data/, databases, certificates, credentials or user cue sheets. Public *.example files are templates only.
- Containers: UID/GID 10001, read-only application/root, constrained tmpfs, drop ALL caps, no-new-privileges, init, resources and no published app port in production. Never mount Docker socket into app.
- TLS/HSTS and canonical-host routing at trusted proxy. Public application is anonymous; management remains private. No assumption that UFW alone filters Docker published ports.
- Keep app runtime free of package dependencies. Vendored fonts/icons retain licenses and version attribution.
- Use isolated development branches/checkouts and PR review. Do not change production secrets/data/config or deploy without explicit destination authorization.
- Required checks before release: npm test, npm run check, browser suite + visual inspection (light/dark, mobile, 200% zoom), actual-size PDF and physical print, container-smoke, proxy TLS/host-routing checks, secret and image scanning. Record skipped checks accurately. Block release if required gates cannot run.
- Website default theme System; user Light/Dark override saved locally. Printed sheet always black on white.
