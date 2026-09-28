# Changelog

## 0.3.0 — development candidate

- Keep one header tagline: A little tape. A clear plan.; refresh logo/banner assets.
- Alphabetize cue symbols with None first; rename Can / cola to Softdrink (stored key stays `can`).
- Shorten the footer privacy promise and link the StemTape GitHub project in the credits.
- Sort on completion of a changed, valid distance/time edit. Keep equal positions stable and preserve later manual ordering until the next position edit.
- Preserve storage schema and physical print geometry. Pending release checks are listed in docs/VALIDATION.md.

## 0.2.0 — 2026-09-28

- Explicit client-side privacy statement in the footer and privacy help.
- Developer/maintainer attribution linking to Graham van der Wielen, plus ChatGPT & Codex assistance credit.
- Drag handles before cue numbers for mouse, pen and touch; keyboard movement and existing up/down buttons retained. Cancellation does not save reordering.
- Five new cue symbols: cobbles / pavé, rice cake, can / cola, neutral zone and litter zone.
- CSV/JSON and local-storage validation accept the new symbols. Existing v1 data remains compatible.
- One `docker-compose.example.yaml` with local-only port binding and commented Traefik sections, matching `.env.example`, separate standalone Caddy example, and upgrade guide.
- Print geometry, physical units and layout algorithm unchanged. User confirmed v0.1.0 dimensions matched a real stem when printed at 100%.

## 0.1.0

Initial local-first editor, presets, themes, CSV/JSON, SVG print preview, branding and Docker deployment examples.
