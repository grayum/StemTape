# Validation record

## 2026-10-02 — v0.4.0 review preparation (not release approval)

Prepared from bundled `origin/main` `60fa526389fa6940420a18cb1f4a92bdb9785cce` on `review/v0.4.0`, in [two reviewable changes](REVIEW-v0.4.0.md): security/deployment first, save-status UX and version metadata second. The owner-provided Internet.nl baseline for `stemtape.cc` was 95% on 2026-10-02; no new public test or production change was performed. Official Cloudflare/Caddy guidance was read from their maintainers' GitHub sources after documentation sites returned HTTP 403.

Executed locally:

- `npm test`: **40/40 passed** (30 existing tests plus 10 save-status tests covering successful/failed writes, reload/legacy compatibility, drafts, imports, recovery, clocks, tab conflicts and exact UTF-8 metadata boundaries).
- `npm run check`, browser/test JavaScript syntax checks, `sh -n scripts/caddy-smoke.sh`, and `git diff --check`: **passed**.
- Temporary synthetic jsdom app checks: **passed** success/time display, read-only timer behavior with unchanged editor/preview nodes and storage, draft correction/cancellation, quota failure/retry, pending total edits, protected fallback editing, retained original-export access after failed recovery replacement, and exportability when a quota failure coincides with timestamp metadata no longer fitting. These are **not native-browser or visual/accessibility verification**.
- `python3 scripts/check-private-files.py`: **passed** its tracked-file/basic-pattern checks; not a full secret scan.
- Source comparison: `makeSheet` and `preparePrint` remain unchanged from the base. This is not new PDF or physical-print evidence.
- Application container built with `nginx@sha256:0985e772fb9f729e6fa0980da05fca5d9c468e870eed43071545afa9d2e27d94`; local smoke checks **passed** health, UID 10001, read-only application root, CSP-header presence and POST rejection. The included smoke script was copied to `/tmp` with only sandbox port 18080 changed to 18081, to avoid mapping the reserved router port in nested Docker. The build emitted the existing empty-default NGINX_IMAGE lint warning; the required explicit digest was supplied successfully.
- Public local/VPS Compose examples validated using only their public example env files. The repository Caddyfile validated with synthetic hostname `stemtape.test`, no network and the restricted capability-enabled container.
- `scripts/caddy-smoke.sh` on official `caddy:2.10.2-alpine`, digest `sha256:4c6e91c6ed0e2fa03efd5b44747b625fec79bc9cd06ac5235a779726618e530d`: all capabilities dropped reproduced `exec caddy failed: Operation not permitted`; adding only NET_BIND_SERVICE passed version and offline non-root HTTP startup. This proves the mechanism for this image, **not the unidentified live pin**. A requested `caddy:2.11.6-alpine` probe was unavailable in the accessible registry and was not tested.

Pre-commit review reran the 40 Node tests, syntax/diff and basic tracked-file checks, all three synthetic app scenarios, the application smoke test and the representative pinned-Caddy probe above; all passed. The existing Git author identity was verified. Only the reviewed repository files are included in the two logical changes; private configuration and generated artifacts are excluded.

Browser execution: the complete suite was attempted with the existing temporary Playwright installation but failed before assertions because Chromium headless shell is unavailable. No Chromium download or restriction bypass was attempted. New condition-based browser regressions are **unexecuted**; the [manual checklist](SAVE-STATUS.md#focused-browser-checklist--pending-execution) is also unexecuted. The v0.3.0 CI/manual results below are not evidence for v0.4.0.

Remaining decisions and gates: supply the exact public live Caddy image digest for verification; verify a private vulnerability-report contact before publishing security.txt; perform the manual Cloudflare/CAA changes and separate public/origin TLS retests only under operator authorization. No DNS, Cloudflare, Droplet or deployment settings were changed. Native browser/mobile/themes/screen-reader behavior, actual-size PDF/physical print, production proxy routing/TLS and full secret/image scans remain pending. Very large active-plan rendering still needs profiling; save-status timers do not rebuild it. No security audit or production-readiness claim is made.

## 2026-10-01 — successful main CI validation

Main GitHub Actions run [36886880381](https://github.com/grayum/StemTape/actions/runs/36886880381) **passed** on 2026-10-01. The repository owner supplied this run result; coverage below was checked against `.github/workflows/checks.yml` and its test scripts at the supplied main commit `51de86501a5dded7c3c691d906bc5ca902cda3a9`. This records execution in GitHub CI, not a new local browser run or independent inspection of the CI artifacts.

Automated coverage of the successful workflow:

- **Syntax and data:** `npm run check` checks `dist/app.js` and `dist/core.js` syntax; `npm test` runs all **30 Node tests**, including validation/import limits, prototype-key rejection, literal untrusted text, CSV formula escaping and metadata round trips, ordering, canonical distance validation, UTF-8 boundaries and rollback.
- **Chromium browser workflows:** `npm run test:browser` runs `tests/browser.mjs` and `tests/review-browser.mjs` against the loopback development server. Assertions cover mouse/keyboard ordering and cancellation, automatic sorting and focus, persistence, themes, time/distance modes, invalid drafts, import/export, literal HTML input, overflow, mobile layout/storage feedback, exact-byte accepted/rejected edits, backup round trips, oversized-original preservation and byte-for-byte recovery exports, and the asynchronous recovery-confirmation actions. The suite checks page errors and, in the primary browser workflow, unexpected external requests. A synthetic touch event used by one assertion is not physical touch-device verification.
- **Print and visual artifacts:** the browser suite generates desktop light/dark and mobile screenshots and `test-print.pdf`. It asserts exactly one printable sheet with SVG width/height attributes of 32 × 90 in the millimetre-based print layout. It does not measure the generated PDF or physical paper, or perform a human visual review of the screenshots.
- **Repository hygiene:** `scripts/check-private-files.py` checks tracked filenames and a small set of credential patterns. This is not a full secret scan or security audit.
- **Container smoke:** CI resolves `nginx:stable-alpine` to a digest, builds the application image and runs `scripts/container-smoke.sh`. The container is started with init, UID/GID 10001, read-only root, constrained tmpfs, dropped capabilities, no-new-privileges and resource limits. Assertions check the health endpoint, UID 10001, inability to write the application root, presence of the CSP header and POST rejection with HTTP 405. This does not validate production proxy routing or prove every hardening property independently.
- **Artifacts:** the workflow uploads browser artifacts and the development-server log, including on failure. No publishing or deployment step is present.

User-reported manual checks remain separate: the 2026-10-01 six-check byte-boundary/recovery record and the 2026-09-30 UI/round-trip/actual-size-print record below retain their original scope. The CI pass is not an additional physical-print verification.

Outstanding checks: human review of screenshots and PDF geometry; broader light/dark/mobile/200% zoom and accessibility checks; real touch/pen, pointer-cancellation and long-list behavior beyond the recorded manual checks; production proxy TLS/HSTS, canonical-host routing, redirects and host/network exposure; full secret and image-vulnerability scans. No security audit or production deployment is recorded, and the remaining release gates still apply.

**Performance concern retained:** the byte-limit fixture now keeps the active plan small. Passing CI confirms that the revised suite completes; it does not prove the precise cause of the earlier timeout or fix rendering of very large active plans. That application performance concern still requires real-browser profiling.

The investigation and development records below are historical evidence. Their statements about unavailable local Chromium or pending CI describe the situation at that time; this successful main run supersedes the pending automated-browser/container status, not the outstanding production checks.

## 2026-10-01 — recovery-confirmation test synchronization

The user reports that CI run 36884169684 completed the boundary-edit and backup round-trip phases, then failed at `tests/review-browser.mjs:149` with count 0 instead of 1. That line counted the exact accessible button names `Export original recovery data` and `Back up temporary in-memory plan` immediately after `setInputFiles`. Both labels match the application. The file handler awaits `File.text()` before opening `Restore backup?` and adding these actions; locator `count()` does not wait for that asynchronous transition. The shared readiness helper only reads DOM/storage state and does not close or alter the recovery dialog. Earlier assertions in this sequence check entry into recovery, original export byte-for-byte, and preservation while editing fallback data.

A temporary Node VM harness ran the actual import handler with a deferred file read: while pending, the heading remained `Import from your device` and the original-export button count was 0; after resolving the read, the heading became `Restore backup?`, the original-export count was 1, and the temporary-plan backup was offered. This reproduces a test synchronization defect, not an incorrect accessible name or a demonstrated application recovery failure. It is synthetic handler evidence, not real-browser verification.

The test now waits (bounded to 10 seconds) for the visible restore-confirmation heading before retaining both exact count-of-one assertions scoped to the dialog. A deliberately gated file read exercises the pending transition without sleeps. Assertions preserve the oversized original while reading and before confirmation; the original is also downloaded byte-for-byte from the restore dialog. Failure diagnostics report dialog heading/open state, button labels, stored byte count, invalid-input count and save status, without plan contents. No application recovery code, fixture-readiness helper, byte limits or existing recovery assertions were removed or weakened.

Checks: `npm test` **30/30 passed**; `npm run check`, syntax checks for all five test/helper JavaScript files, `git diff --check`, and the tracked-file/basic-credential-pattern check **passed**. Full browser execution was attempted using the temporary Playwright installation but failed at launch because Chromium headless shell is missing; the new browser regression remains **unexecuted locally**. The CI progress above is user-reported evidence for the preceding version, not proof that this change passed in a real browser. No new manual, physical-print or production checks ran.

## 2026-10-01 — CI reload timeout investigation (local evidence)

Run 36862213689 reported a 30-second `page.reload()` timeout waiting for `load` after cancelling an over-budget name draft. The saved state was still the accepted 2,000,000-byte state. Fixture inspection found 200 active rows, 1,600 inputs and 224,490 active cell characters. Startup synchronously renders the editor and SVG preview, then renders the preview again after fonts load; cancellation also rebuilds the editor/preview. This confirms an unnecessarily heavy rendering workload in the byte-budget test, but does not prove the precise cause of the CI timeout. CI log retrieval failed with HTTP 401, and Chromium is unavailable locally.

The byte-budget fixture now keeps six active rows (12 inputs, 64 cell characters), moving bulk text into the inactive event and personal preset. Both bulk objects retain 200 rows in each mode and eight columns. Independent exact-byte, accepted/rejected emoji, duplicate rollback, reload and backup round-trip assertions remain. No application rendering, print geometry, byte limits or navigation timeouts changed. Test setup no longer navigates through the previous fixture before seeding the next one. Reload still waits for `load`, then verifies fonts, preview, active selection and row count.

Added phase/elapsed-time and fixture-size/count diagnostics, with Node-side page-error, failed-request and pending-resource capture on failure. CI now uploads browser artifacts and the development-server log with `if: always()`. Server request timing/status logging is opt-in, omits queries/headers/bodies and retains loopback binding. The upload-artifact v4.6.2 SHA was verified against the official repository tag.

Checks for this follow-up:

- `npm test`: **30/30 passed**; `npm run check`, all browser/test JavaScript syntax checks and `git diff --check`: **passed**.
- Python server syntax and 20 concurrent HTTP resource requests with CSP/timing/query-redaction checks: **passed**.
- Temporary EventEmitter diagnostic-failure simulation: **passed** report creation, counts, page errors, pending/failed URLs and query redaction without querying the page. This is **not browser verification**.
- `python3 scripts/check-private-files.py`: **passed** its tracked-file/basic-pattern checks; not a full secret scan.
- Full browser suite attempted via the temporary Playwright installation: **unexecuted**, missing Chromium headless shell. No download or network restriction bypass attempted.
- Automated workflow YAML parsing could not run: PyYAML is unavailable. Workflow changes were inspected as source only.

Pending: CI must verify the revised suite and collect failure diagnostics if the timeout recurs. No pending-resource/server-connection cause has been demonstrated. Rendering very large active plans remains a separate performance concern requiring browser profiling; reducing this fixture is not an application performance fix. The earlier six user-reported manual passes apply to the prior build/fixture, not this follow-up. No new physical-print or production verification is claimed.

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

### Historical manual verification checklist — unexecuted when written (2026-09-29)

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

The automated data, syntax, Chromium and container smoke checks passed in the main CI run recorded above. Rerun them for subsequent release candidates. Complete the outstanding human visual/PDF, device, proxy/TLS/host-routing and full secret/image-scan checks listed above; CI does not replace them. Keep a pre-upgrade JSON backup and pin tested image digests. User-reported physical-print results apply to the tested setup; recheck at actual size when the print path or setup changes. No production readiness or deployment is established by this record.
