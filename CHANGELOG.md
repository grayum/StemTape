# Changelog

## 0.4.1 — review candidate (2026-10-03)

- Publish owner-authorized security.txt with exact-path Nginx access, UTF-8 plain text, inherited headers and expiry/self-hosting guidance. Keep HTTP compression and document accepted edge cipher/key-exchange limitations.
- Replace the permanent ISO timestamp with locale-aware hover/focus/touch details including timezone; retain relative save status and all v0.4.0 storage guarantees.
- Visually disable time-mode distance units without changing the preference, distance columns or physical dimensions.
- Use Fuel for new nutrition templates; preserve existing/custom/imported labels without a speculative migration.
- Update hosted-app README, upgrade/rollback guidance and focused regressions. See validation for executed and pending checks.

## 0.4.0 — review candidate (2026-10-02)

### Security/deployment change

- Add an owner-specific Cloudflare/DNS/Caddy runbook based on the 95% Internet.nl baseline, preserving passing controls and separating edge TLS from origin checks.
- Add only NET_BIND_SERVICE to the VPS proxy for capability-marked official Caddy images; retain non-root, read-only, dropped capabilities and no-new-privileges. Include an offline digest-specific startup probe. Live-pin verification and a verified security.txt contact remain decisions.

### Save-status UX change

- Show relative successful-save age and accessible exact UTC time only after successful storage; preserve prior time on failures and remove success for invalid/pending drafts or protected recovery.
- Keep optional validated timing metadata within the atomic v1 state byte budget; preserve exact-limit data with explicit session-only timing when metadata cannot fit. No timestamp invented for old data.
- Detect known stale-tab storage changes and retain recovery originals when explicit replacement fails. Timers do not write storage, rebuild the editor/preview or repeatedly announce age.
- Add focused Node and condition-based browser regressions. Print geometry, makeSheet and preparePrint remain unchanged; see the validation record for executed and pending checks.

## 0.3.0 — review fixes (2026-09-29, uncommitted)

- Share a validated 2,000,000-byte UTF-8 policy across accepted state, storage, JSON exports and imports; reject oversized mutations without truncation and preserve original oversized/unreadable storage for recovery export.
- Validate total distance in canonical metres and derive unit-specific limits before saving.
- Guard invalid drafts across ordering and full rerenders; provide explicit cancellation. Keep row-arrow focus by stable identity and announce movement, including boundary arrivals.
- Preserve custom distance column labels and units through explicit CSV metadata; keep literal bracketed-unit text labels unambiguous.
- Name the dialog accessibly, retain mobile storage status, distinguish recovery originals from temporary fallback plans, and match container smoke configuration with `--init`.
- Add core boundary/round-trip tests and browser regressions. Print generation and physical geometry are unchanged. See VALIDATION.md for executed checks and blocked browser verification.

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
