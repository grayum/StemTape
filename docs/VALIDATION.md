# Validation record

## 2026-10-01 — byte-boundary fix, user-reported manual passes

Graham van der Wielen reports all six requested manual checks passed against the fixed Docker development build, using synthetic fixtures through loopback HTTP:

1. A name edit adding 🍌 to the 1,999,996-byte fixture was accepted at exactly 2,000,000 UTF-8 bytes and persisted after reload.
2. Adding another 🍌 exceeded the limit by four bytes; the invalid draft remained visible with limit feedback and Cancel unaccepted edits available.
3. Sort, arrow-button reordering and mode switching were blocked while the invalid draft remained intact.
4. Correction cleared validation and the Cancel control; Escape cancelled a repeated invalid edit, and reload preserved the accepted name.
5. Complete JSON backup/export and restore retained the accepted name, two events, personal preset and both cue lists.
6. With the full-budget fixture, duplication was rejected without adding an event; an over-budget emoji name draft remained visible, and reload restored the saved original name.

The diagnosed application defect was microtask-dependent tracking of the edited input: cleanup could run between capture and target handlers, causing rejection to rerender and discard the draft. Saving handlers now pass their input explicitly. Independent regression fixtures calculate serialized UTF-8 bytes with JSON.stringify and Node Buffer, covering both modes, events and presets without using the application byte counter as the oracle. Browser regressions include accepted/rejected edits, reload, correction/cancellation and compact byte/validation diagnostics.

Local checks rerun on 2026-10-01:

- `npm test`: **29/29 passed**.
- `npm run check`: **passed**.
- `node --check` for `tests/core.test.mjs`, `tests/browser.mjs`, `tests/review-browser.mjs` and `tests/byte-budget-fixture.mjs`: **passed**.
- `git diff --check`: **passed**.
- Full browser suite attempted with `PLAYWRIGHT_MODULE=/tmp/stemtape-review-tools/node_modules/playwright npm run test:browser`: launch failed because Chromium headless shell is unavailable; automated browser assertions remain **unexecuted locally** and require CI verification.

The six passes above are user-reported manual results, not automated browser-suite results. The synthetic boundary fixtures intentionally overflow print layout; no new PDF or physical-print verification is claimed. No production deployment, proxy/TLS checks or production-readiness claim is included. Earlier dated records retain their historical status.

## 2026-09-30 — user-reported manual validation

Graham van der Wielen reports that the following manual checks passed on the current review build:

- Invalid time followed by Sort, arrow buttons, or mode switching.
- Distance editing followed immediately by an arrow click.
- Dragging and keyboard reordering, including persistence after reload.
- JSON backup/restore and custom-distance CSV round trips.
- Actual-size printing.

Local pre-commit checks rerun on 2026-09-30: `npm test` passed (27/27), `npm run check` passed, and `git diff --check` passed.

These are user-reported manual results, not automated browser-suite results or an independent physical-print verification by the agent. The automated browser suite remains unexecuted because Chromium is unavailable. These checks do not establish coverage of every edge case in the earlier checklist or resolve the separately reported CSV-label collisions, schema-valid fractional layout values, and deferred-refresh sorting concerns.

No production deployment checks are reported as run. Proxy/TLS/host-routing checks and the remaining release gates are still pending; this record does not claim production readiness. The dated records below describe their status at the time they were written.

## 2026-09-29 — review fixes, local evidence (not release approval)

Reproductions against the original checkpoint:
- Node: a valid 30-event/200-cue state exported 2,611,396 bytes and exceeded its own 2,000,000-byte import limit; 10,000 miles failed canonical total validation; a 32-character custom-distance label failed CSV export/import with `Invalid column name`.
- Temporary synthetic DOM harness against copies of the original HEAD: invalid `-1` became `20` after Sort; a row-arrow click lost focus and row identity. The patched handlers retained `-1` until cancellation and focused `Move row down 2` on the same row. This used jsdom with mocked canvas/fonts, not a browser; it does not verify layout, native pointer sequencing, accessibility output or rendering.

Executed after fixes:
- `npm test`: **27/27 passed**. Added exact-limit, one-byte-over, multibyte, both-mode/event/preset round trips, nonmutating rejection, reference-preserving rollback, canonical total limits, and typed CSV maximum/bracketed/reserved-label cases.
- `npm run check`: **passed** (app/core JavaScript syntax).
- `node --check tests/browser.mjs` and `node --check tests/review-browser.mjs`: **passed**.
- Temporary synthetic DOM checks: **passed** invalid-draft guarding/cancellation, arrow focus, exact-byte-budget duplication rollback, and preservation/cancellation of a rejected multibyte name draft. No development dependency was added to the project.
- `git diff --check`: **passed**.
- Exact comparison against HEAD: `makeSheet` and `preparePrint` are unchanged. This is source evidence only, not PDF or physical-print verification.

Browser execution:
- `npm run test:browser` failed before running assertions because the project has no Playwright module.
- Retried with the existing temporary Playwright installation via `PLAYWRIGHT_MODULE=/tmp/stemtape-review-tools/node_modules/playwright`: launch failed because Chromium headless shell is absent. No Chromium download or network-policy bypass was attempted in this fix session.
- The added browser regressions are **unexecuted**. They cover invalid-draft actions, correction/cancellation, miles validation, arrow focus and blur sorting, equal positions/manual reload order, whole-state budget rejection/round trip, recovery-original export, dialog naming and mobile storage failure status.

Not run: real-browser visual/light/dark/mobile/200% zoom checks, actual touch/pen/capture cancellation, PDF generation/dimension inspection, physical printing, container smoke/runtime checks, proxy/TLS/host routing, full secret scan or image scan. No production readiness is claimed; required release gates remain blocked.

### Manual verification checklist — UNEXECUTED

1. Edit distance/time, then Tab/Enter or click an arrow directly. Check stable equal positions, row identity, focused boundary arrows and movement announcements. Manually reorder and reload; text/icon edits must not sort.
2. Enter an invalid distance/time/total or layout value. Try Sort, all reorder methods, row add/delete, event/mode/unit/preset changes and dialogs. The draft must remain until correction, Escape or Cancel unaccepted edits. Check correction after refocusing an invalid field.
3. Drag by mouse/touch/pen, including long-list scrolling. Cancel with Escape, pointercancel and lost capture; confirm no unintended saved movement, including immediately after a position edit.
4. Exercise near-limit JSON with multibyte text, both modes and presets. Reject additions without changing saved data; export and restore the complete accepted state. Load an oversized/unreadable original and verify byte-for-byte recovery export before any explicit replacement.
5. Export/import maximum-length distance labels, labels containing `[km]`/`[mi]`, and reserved-prefix text. Check canonical values after changing units. Confirm invalid imports leave existing plans intact.
6. Inspect light/dark/System, mobile and 200% zoom; check dialog announcement and visible storage-failure status. Verify keyboard-only correction and cancellation.
7. Compare preview with actual-size A4/Letter PDF, copies and rotations; verify overflow blocks content printing. Measure the 50 mm scale and strip on physical output at 100%. Existing user-reported sizing is not a new verification.

## 0.3.0 — development candidate

- 21 Node tests and JavaScript syntax checks passed. Stable equal-position sorting, elapsed-time ordering and persistence after manual moves are covered.
- Browser suite updated for completed edits, direct arrow clicks, manual-order persistence, new copy and alphabetized symbols. Browser suite remains unexecuted: Chromium is unavailable in this workspace.
- `makeSheet` and `preparePrint` match 0.2.0 exactly; storage schema remains version 1.
- The Git-based private-file check could not run because this source directory is not a Git checkout. Archive entries were checked for private deployment files.
- Docker, browser visual/touch/PDF verification, production proxy checks and image/secret scanning remain pending. This archive is a development candidate for testing, not a release approved under AGENTS.md.


## 0.2.0 — 2026-09-28

Completed in this workspace:
- All 19 Node tests passed, including the five new icon keys through CSV/JSON, stable-ID row reordering, invalid move rejection and selectable vector-symbol coverage.
- Browser JavaScript and browser-test suite pass syntax checks.
- Default local Compose example and its uncommented Traefik form parse as YAML. Assertions confirm localhost-only ports by default and no app host ports in the Traefik form. Standalone VPS YAML parses too. This is not Docker runtime/Compose semantic validation.
- Exact source comparison confirms `makeSheet` and `preparePrint` are unchanged from 0.1.0.
- New symbols visually inspected together after SVG rendering.
- Browser tests expanded for drag/drop, keyboard movement, Escape cancellation, privacy copy, attribution link and new icon selection. They have not run successfully here: the environment previously lacked Chromium and its download failed. Mouse/touch/pen behavior and mobile visual layout still require browser verification.
- No Docker executable/daemon available here. No production deployment, image vulnerability scan or independent security audit performed.

User-reported evidence: on 2026-09-28 the user confirmed v0.1.0 runs in the homelab and their measured stem dimensions printed accurately at 100% scale. This is evidence for that version/setup; repeat the smoke test after upgrading.

## Before production

Run npm test, npm run check and npm run test:browser; inspect the generated light/dark/mobile screenshots and PDF. Verify touch dragging, pointer cancellation and long-list scrolling on actual devices. Run the container smoke test and selected proxy configuration/TLS/host routing checks. Run full secret/image scans. Keep a pre-upgrade JSON backup and pin tested image digests. None of these pending checks should be represented as passed.
