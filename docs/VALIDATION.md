# Validation record

## 2026-10-09 — user-reported v0.6.1 manual preview testing and final review

Graham van der Wielen reports that his manual check of the v0.6.1 Docker preview **passed**. This is user-reported local-preview testing. Individual checklist items and devices were not specified; physical printing, screen-reader/device testing and production verification are **not inferred**.

This result accompanies the separately executed evidence immediately below: the complete native Chromium suite against the locally built Docker app, agent inspection of real-browser desktop/mobile screenshots in both themes, actual 200% Chromium zoom checks, **69/69 Node tests**, syntax/diff checks and container smoke checks. Earlier unavailable-browser records are historical; synthetic checks remain separate from native-browser results.

Final release-diff review found only the v0.6.1 Import/settings/secondary-button presentation changes, focused regressions and version/release documentation. Package, visible app version, image examples, workflow/smoke image references and current release documents consistently identify v0.6.1. README validation wording now reflects executed checks. No application or test code changed during this finalization, so the successful native suite and zoom evidence applies to the final code. `npm test` **69/69 passed**, `npm run check` and `git diff --check` **passed** again before committing.

The configured author is Graham van der Wielen with the existing GitHub noreply address. Unrelated README changes remain byte-identical to their backup in the original checkout; browser binaries, screenshots, profiles and temporary artifacts are excluded from the release commit/bundle. Outstanding physical-print/measured-PDF, screen-reader/physical-device, production proxy/TLS, full secret/image-scan and large-active-plan performance checks remain open. This local commit/bundle is a review handoff, not production readiness or a deployment; no push, merge or tag is performed.

## 2026-10-09 — Chromium installation and Docker browser verification

The owner-requested retry of `npm_config_yes=false npx --no-install playwright install --with-deps chromium` **succeeded**, using the installed CI-pinned Playwright **1.62.1** as `agent` (UID 1000). Chromium/headless shell v1234 (Chrome 151.0.7922.34), FFmpeg and system dependencies installed. No dependency upgrade, lockfile change, alternate mirror or network-policy bypass was used. The earlier blocked attempts below are historical; local automated-browser execution is now verified for this v0.6.1 worktree.

Built `stemtape:0.6.1` from `/tmp/stemtape-v061-worktree`, retaining the pinned Nginx base. All 28 served public assets matched the current dist files byte-for-byte. Every browser test in this successful retry targeted **only the local Docker app** at http://127.0.0.1:8080/; the Python server was not used. The container retains UID 10001, read-only root/app, init, dropped capabilities, no-new-privileges and resource/tmpfs constraints. Browser tooling remains outside the production image.

`env -u PLAYWRIGHT_MODULE BASE_URL=http://127.0.0.1:8080 npm run test:browser` **passed the complete suite**, including the review, save-status, v0.4.1, v0.5.0, v0.6.0 and v0.6.1 regressions. Executed coverage includes imports/exports, byte boundaries and recovery-original protection, persistence, save failures, invalid drafts, ordering/Note, footer/rotation/overflow, keyboard focus, Chromium-emulated touch and PDF generation. The v0.6.1 assertions passed grouped settings, retained disabled footer text, file/paste import behavior and keyboard order, responsive Import card alignment/stacking, secondary borders/hover/44px targets/focus and style scoping. Screenshots were captured at 1440, 720, 390 and 320 CSS pixels in both themes. Logs and screenshots/PDF are ignored local artifacts in `artifacts/`.

Reviewed actual Chromium screenshots of desktop and narrow-mobile Import/settings in both themes, plus secondary keyboard-focus states. The inspected cards have bottom-aligned actions on desktop and stack on mobile; settings/helper text wrap, footer text remains on its full-width line, and focus indicators are visible. No related visual defect was found in the inspected images. This is agent inspection of real-browser screenshots, separate from synthetic DOM evidence and user-reported manual testing.

A separate temporary native-Chromium check against the same Docker app used a local development-only extension to set actual tab zoom with `chrome.tabs.setZoom(..., 2)` and verify `getZoom() === 2`: a 1440px window became 720 CSS pixels with devicePixelRatio 2. Both themes **passed** equal Import card widths/bottom-aligned actions, unclipped cards/no horizontal overflow, keyboard import order, all five settings groups, full-width disabled footer field below the toggle and lime secondary keyboard focus. Reviewed viewport screenshots captured directly through Chromium's DevTools screenshot API at this zoom. This is actual browser zoom, separate from the suite's 720px reflow case. The temporary extension/profile are outside the repository and app image.

`npm test` **69/69 passed**; `npm run check`, all browser-module syntax checks, smoke-shell syntax and `git diff --check` **passed**. `STEMTAPE_TEST_PORT=18081 sh scripts/container-smoke.sh stemtape:0.6.1` **passed** runtime hardening, health, headers/CSP, rejected POST, exact security.txt content/type, hidden-path protection and compression.

Preview remains http://127.0.0.1:18080/ through host loopback 18080 → sandbox 8080 → container 8080; no nested container port 18080 is published. Unrelated README work/backups remain preserved. No new user-reported v0.6.1 manual passes, physical printing, measured PDF geometry, screen-reader/physical-touch testing, production routing/TLS checks, full secret/image scans or large-active-plan profiling are claimed. Those outstanding gates remain open; successful local browser checks do not establish production readiness. No commit, push, merge, tag or production deployment was performed.

## 2026-10-09 — authorized browser installation attempt and secondary-action refinement

Preserved the pending v0.6.1 changes and unrelated README/backup. Added an explicit secondary-button class to Sort, Columns, Save as preset, Remember these bike dimensions, Column details and Privacy & help. Default neutral borders/tinted backgrounds, stronger hover styling, 44px minimum height and lime keyboard focus with a contrasting edge use local theme tokens. Links, native disclosures, drag handles, destructive actions and primary controls do not receive this class.

Inspected package.json and CI: browser tooling is installed only for development at pinned Playwright **1.62.1**; there is no project lockfile. `npm install --no-save --package-lock=false playwright@1.62.1` **succeeded**, and the local package/CLI both reported 1.62.1. No package/version/lockfile changes were made to install tooling. Installation and tests ran as `agent` (UID 1000), using that user's default browser cache; only the CLI's system-package phase elevated privileges.

Actual installation command: `npm_config_yes=false npx --no-install playwright install --with-deps chromium`. System dependencies **installed successfully**. The browser download **failed**, exit 1: `Download failed: server returned code 403 body 'Approval required for cdn.playwright.dev:443.'`; the CLI's normal fallback also returned `Approval required for playwright.download.prss.microsoft.com:443.` The blocked archive was Chromium v1234 / Chrome for Testing 151.0.7922.34, `chromium-linux-arm64.zip`. This is a sandbox network-policy approval block, not authentication failure or a missing installation attempt. No alternate mirror, insecure TLS flag or policy bypass was used. A subsequent owner-requested retry of the same pinned local CLI installation returned the same HTTP 403 approval blocks for both hosts. The sbx CLI is unavailable inside this sandbox (`sbx: command not found`); host-side approval is needed. No browser test ran after that retry. The next browser run is explicitly restricted to the locally built Docker preview, not the Python development server.

Started `python3 scripts/serve.py --diagnostics` from `/tmp/stemtape-v061-worktree` on CI's loopback port 8080 with the existing bounded HTTP readiness check; the server returned HTTP 200 and its log is in ignored `artifacts/stemtape-preview.log`. Then ran `env -u PLAYWRIGHT_MODULE npm run test:browser` using the locally installed pinned package. The **complete suite was attempted but could not execute any browser assertions**, failing at launch: `Executable doesn't exist at /home/agent/.cache/ms-playwright/chromium_headless_shell-1234/chrome-linux/headless_shell`. No native screenshots, native focus/hover/layout checks, actual 200% zoom or physical-print checks ran. Browser verification remains blocked until the download hosts are allowed, or an approved matching browser becomes available.

Executed checks: **69/69 Node tests passed**; application/browser-test syntax and `git diff --check` passed. Separate temporary synthetic actual-app checks passed grouped IDs, footer retention/invalid-draft safeguards and import action dispatch/parsing. Independent palette calculations give secondary-text contrast **14.43:1 light / 12.38:1 dark**, default-border contrast **3.45:1 / 3.53:1**, and hover-border contrast **4.47:1 / 4.78:1** against their respective backgrounds. These calculations and synthetic checks are not visual/browser verification. The light border was darkened after its initial calculated contrast was below 3:1.

Extended the focused native-browser regression to check default/hover styling, minimum touch target, keyboard focus and scoped application of secondary styles, with planned editor/settings focus screenshots in both themes and responsive widths. These assertions remain **unexecuted locally**. The 720 CSS-pixel reflow case is still explicitly distinguished from actual browser zoom. User-reported v0.6.0 manual/live results remain separate; no new v0.6.1 manual passes were supplied.

Rebuilt the final local preview image from the release worktree. Container smoke **passed** again, and all **28 served public assets** match the final worktree byte-for-byte. Checked the running image contains no project node_modules, tests or development browser cache; the allowlisted Docker context excludes development tooling/artifacts. The preview is restored at http://127.0.0.1:18080/ using the same sandbox 8080 → container 8080 mapping, with no nested 18080 mapping. No commit, push, merge, tag or production deployment is part of this work.

## 2026-10-09 — v0.6.1 import/settings presentation preparation

Fetched public main over HTTPS with prompts disabled and without changing the configured remote or accessing credentials. Verified origin/main and FETCH_HEAD `49a1fb8b8c3407c7892a9b15f6a4537b42f3d9e0`, including the merged v0.6.0 implementation and Note locator fix, before creating review/v0.6.1 in `/tmp/stemtape-v061-worktree`. The owner reports v0.6.0 is live and working; this is not an independent production check. Unrelated README work remains byte-identical to its preserved backup in the original checkout.

Inspected the actual Import handler/markup and native settings disclosure first. Existing import options were adjacent buttons without a layout wrapper. The patch gives them labelled responsive cards with equal grid tracks, flexible bottom-aligned actions and mobile stacking, preserving button names and handler dispatch. Existing settings now sit under Sheet size, Appearance, Columns, Footer and Printing. Dimensions/font are accessed by opening the existing lime-arrow disclosure. Footer text occupies its own full-width line below the toggle, stays visible/disabled when off and retains its value, with the requested short helper plus the existing limit explanation. No new settings or data fields are added.

Executed checks:

- `npm test`: **69/69 passed**. `npm run check`, all browser-test syntax checks, smoke-shell syntax and `git diff --check`: **passed**. The tracked-file/basic credential-pattern checker passed; it is not a full secret scan. New filenames were inspected separately.
- Temporary synthetic actual-app jsdom/canvas checks: **passed** grouped control IDs/placement, retained disabled footer content, import action names/dispatch and tab-separated import, invalid-footer guard/cancellation, ordering/Note focus, simulated pointer drop/cancellation, quota feedback, exact-budget rollback, protected recovery originals and shared preview/print/footer rotations/overflow. DOM, dialogs and pointer behavior are simulated; these are not native-browser, responsive-layout, keyboard, touch, screen-reader or physical-print results.
- Source comparison against verified main: **makeSheet, preparePrint, file-import and spreadsheet-parsing handlers are unchanged**. Data/CSV/JSON/storage modules are unchanged. This establishes implementation scope, not browser/physical-print verification.
- Application image built as `stemtape:0.6.1` with the existing pinned Nginx digest `sha256:0985e772fb9f729e6fa0980da05fca5d9c468e870eed43071545afa9d2e27d94`. Container smoke on loopback test port 18081 **passed** UID 10001/read-only app, health, CSP/headers, rejected POST, exact security.txt bytes/type, hidden-path protection and gzip. Both public Compose examples validated using only public example env files. The existing empty-default NGINX_IMAGE Dockerfile warning remains; an explicit digest was supplied.
- Local Docker preview runs at host http://127.0.0.1:18080/ → sandbox 8080 → container 8080, using explicit development HTTP and the existing non-root/read-only/init/capability/resource restrictions. The nested container publishes only 8080. All **28 public assets** match `/tmp/stemtape-v061-worktree` byte-for-byte; HTTP 200, served version and CSP checks passed. Previous v0.6.0 preview retained stopped. This is not production deployment.

Full browser suite attempted with the existing temporary Playwright installation: **unexecuted locally**, because Chromium headless shell is missing at launch; no browser assertions or screenshots ran. No browser installation or network-restriction bypass was attempted. Focused condition-based browser regressions are included for native disclosure/groups, Footer accessible name/visibility/retention/reload, import keyboard order and actual file/paste workflows, equal card widths/action alignment, mobile stacking/overflow and light/dark screenshots at 1440, 720, 390 and 320 CSS pixels. A 720px viewport exercises desktop reflow equivalent to 1440px at 200% zoom; it is not actual browser-zoom verification. The existing invalid-draft regression exposes the relocated sheet controls before creating its draft, retaining every prior assertion. CI must execute these tests in a native browser.

Manual visual review remains **unexecuted/unconfirmed for v0.6.1**: inspect Import cards/action alignment and keyboard order in both themes; open all five settings groups at narrow mobile widths and actual 200% browser zoom; verify disabled footer legibility, full-width text below its toggle and retained text after reload; confirm no wrapping/clipping/horizontal overflow, and unchanged preview/print behavior. No new PDF/physical-print passes or production checks are claimed. Production routing/TLS, full secret/image scans and large-active-plan performance remain outstanding. No commit/push/merge/tag/deploy is authorized as part of this preparation.

## 2026-10-08 — v0.6.0 Note dialog locator follow-up

The owner reports a native-browser CI timeout in the Note rename/hide/reload phase at `tests/v060-browser.mjs:40`, waiting for `getByLabel('Field type', {exact:true})`. This is a failed CI result, not a passing browser suite. The dialog uses an implicit wrapping label with a nested select. Playwright's label-text matcher includes all nested option text, producing `Field typetextnumberdistancesymbol`; its accessible-name calculation instead returns `Field type`, with role `combobox`.

A temporary synthetic actual-app reproduction using the installed Playwright selector/accessibility functions confirmed that the dialog is open, exactly the retained Note configuration exists after movement/rename, its ID/order remain valid, and the select is disabled with value `text`. Exact label-text matching returns no control, while the exact combobox role/name finds the intended control. jsdom/canvas and synthetic accessibility calculations are involved; this is not native-browser or screen-reader verification. No timing delay or application type/lifecycle defect was established.

The browser regression now waits for the Note configuration to be visible, checks the open dialog and unique configuration, then uses `getByRole('combobox', {name:'Field type', exact:true})`. It asserts exactly one control, value `text` and disabled state. This retains an accessible locator rather than masking missing labels with a generic select query. Existing rename/hide/reload identity, label, content and order checks remain, with an added persisted text-type assertion. Failure diagnostics report dialog state, Note index/type/configuration count and predefined select labels/values/disabled states without dumping saved plans. No application, print, storage or timeout increase is introduced.

Checks: `npm test` **69/69 passed**; `npm run check`, revised browser-test syntax and `git diff --check` **passed**. The synthetic actual-app ordering/Note/focus/invalid-draft/quota/footer/rotation checks passed separately. The complete browser suite was attempted and failed at Chromium launch because the headless-shell executable is unavailable; **no browser assertions executed locally**. CI must verify the revised regression in a native browser. Earlier user-reported local-preview testing remains limited to the scope recorded below; no new manual, physical-print or production passes are inferred. Unrelated README work and its backup remain preserved; no remote fetch or commit/push/merge/tag/deploy is part of this follow-up.

## 2026-10-08 — user-reported v0.6.0 local-preview testing and commit review

Graham van der Wielen reports testing v0.6.0 at http://127.0.0.1:18080/ and finding no issues. This is user-reported local-preview testing, not production verification. Individual checklist items, devices, accessibility methods, PDF dimensions and physical printing were not specified; no passes for those checks are inferred.

Automated browser execution remains **unexecuted locally** because Chromium is unavailable. The earlier synthetic checks remain separate evidence. Outstanding checklist coverage, physical printing, production proxy/TLS checks, full secret/image scans and large-active-plan rendering performance remain open.

Pre-commit release review: `npm test` **69/69 passed**, `npm run check` and `git diff --check` **passed**. The separately prepared column-ordering-only commit snapshot passed **61/61 Node tests** and its application syntax checks. The tracked-file/basic credential-pattern checker passed; this is not a full secret scan. The configured author is Graham van der Wielen with the existing GitHub noreply address. Unrelated README work matches its preserved backup, and temporary tooling/artifacts and local agent instructions are excluded from the release commits. Reviewed local commits and a verified complete-history bundle do not imply deployment or completed release gates.

## 2026-10-07 — v0.6.0 column ordering/Note preparation (not release approval)

Verified `/tmp/stemtape-v0.6.0-base.bundle`, FETCH_HEAD and origin/main against `a6db4443a9289c02eb5c7be2f0c4c4aed03c0202`, including merged v0.5.0 and its CI keyboard-test fix. Prepared in `/tmp/stemtape-v060-worktree` on review/v0.6.0. The owner confirms v0.5.0 is deployed and working; this satisfies the prior roadmap gate but is not a new independently executed production check. Unrelated README edits and their backup remain intact in the original checkout. Bundle-only handoff instructions were recorded locally outside the release; no further SSH/HTTPS fetches were attempted after that instruction.

Executed checks:

- `npm test`: **69/69 passed** (53 existing plus 16 ordering/Note tests). Coverage includes stable column/cell/icon identity, fixed first/boundaries, row-order and width retention, old-state byte-identical round trips, JSON/duplicates/presets, toggles/renaming in both modes/Custom, column limits, invalid references and role metadata, visible/hidden CSV alignment, older CSV support, time/custom-distance semantics, exact independent UTF-8 boundaries and quota failure.
- `npm run check`, syntax checks for all test modules, smoke-shell syntax, `git diff --check` and the tracked-file/basic credential-pattern checker: **passed**. New filenames were inspected separately. This is not a full secret scan.
- Temporary synthetic actual-app jsdom checks with native canvas metrics: **passed** movement/focus and boundary fallback, Note rename/hide/content, invalid-time draft guards, simulated pointer drop/cancellation, quota failure/no success check, exact-budget Note rollback, protected oversized recovery original/export access, narrow-sheet overflow and shared preview/print/footer content for all four rotations. Pointer hit boxes/capture are simulated; these are not real-browser, native focus/layout, physical-touch or screen-reader verification.
- Synthetic unchanged-plan footer-disabled SVG output for the same icon-free fixture was byte-identical to the verified base. In the actual-app synthetic scenario, hiding Note restored the original SVG including the cue icon and footer. Source comparisons confirmed preparePrint, footer.js and v0.5.0 icons.js are unchanged; makeSheet changes only its stable-ID icon-host comparison. No new physical-print verification is claimed.
- Executed v0.5.0 core compatibility check: older JSON parsing retains column order/cells/visibility/layout but drops cue/note identity metadata; the old importer rejects new role-marked CSV. Its second-column icon-host behavior remains an explicit rollback limitation, not a claim that older versions preserve new metadata.
- Application image built as stemtape:0.6.0 using `nginx@sha256:0985e772fb9f729e6fa0980da05fca5d9c468e870eed43071545afa9d2e27d94`. `STEMTAPE_TEST_PORT=18081 sh scripts/container-smoke.sh stemtape:0.6.0`: **passed** health, UID 10001, read-only app, CSP, POST rejection, exact security.txt bytes/type/headers, hidden-path denial and gzip. The existing Dockerfile empty-default NGINX_IMAGE lint warning remains; an explicit digest was supplied. Both public Compose examples validated with their public example env files only.
- Local preview is running with explicit development HTTP at host http://127.0.0.1:18080/ → sandbox 8080 → container 8080. The nested container publishes only 8080. All **28 public dist assets** match `/tmp/stemtape-v060-worktree` byte-for-byte; version, HTTP 200 and CSP checks passed. The previous preview container is retained stopped. This is a local preview, not a production deployment.

The complete browser suite was attempted against the local preview with the existing temporary Playwright installation. It failed at launch because Chromium headless shell is unavailable; **no browser assertions executed** and no browser installation/restriction bypass was attempted. New condition-based browser regressions include stable focus/boundaries, explicit mobile Preview selection, Chromium-emulated native touch movement/cancellation, Note persistence/imports, invalid drafts, failed saves, exact-budget rollback, preview icon/header order, footer/rotation equivalence and overflow. They remain **unexecuted locally** and require CI or a supported browser. Emulated touch, even when executed, is not physical-device testing.

At this preparation stage, no v0.6.0 manual passes had been supplied; the later local-preview report is recorded separately above. The [manual checklist](REVIEW-v0.6.0.md) covers both themes, mobile/200% zoom, keyboard/screen reader, physical touch/cancellation, narrow/wide layouts, backup/recovery and actual-size PDF/physical printing at 100% with measured sheet/calibration dimensions. Production proxy/TLS checks, live Caddy pin verification, full secret/image scans and the large-active-plan performance concern remain outstanding. Required gates remain open; no production readiness, security audit, perfect Internet.nl score or deployment is claimed. No commit/push/merge/tag was part of this preparation stage.

## v0.5.0 — mobile disclosure browser-test follow-up

The owner reports that CI executed the browser suite and failed at `tests/v050-browser.mjs:65`, where the test expected `.more-settings.open` to be true after Space. This is a failed real-browser CI result, not a successful suite run. The rotation loop opens and closes settings for each rotation, leaving it closed. Reloads leave the mobile workspace on Edit; no Preview selection occurs before resizing to 390 px. Below 740 px the stylesheet hides `.preview-card` unless `body[data-tab=preview]` is selected. The summary is inside that hidden card, so calling programmatic focus does not put the keyboard target on the summary; Space cannot open that disclosure. The source/setup trace identifies a test precondition defect, rather than a demonstrated delayed toggle or application keyboard defect.

The test now selects the visible mobile Preview button, waits at most five seconds for the preview card to be visible, and explicitly asserts selection, summary visibility, initially closed settings and focus on the summary. Its button locator is scoped to `.mobile-tabs`, since the body also acquires a data-tab attribute on selection. Descriptive Space assertions retain the expected open state and also check closing and reopening. No arbitrary sleep, larger suite timeout, forced open state or application change is introduced. Failure diagnostics include test phase, viewport, selected view, calculated display/boxes, focused element identifiers, disclosure state, invalid-input count and page-error count, without stored plans or input contents.

Checks: `npm test` **53/53 passed**; `npm run check`, syntax checks for all test modules and `git diff --check` **passed**. A temporary synthetic actual-app/CSS check passed: applying the actual matching mobile stylesheet rules hides the preview ancestor in Edit, and the actual Preview handler exposes it and updates selection without replacing the summary or writing storage. jsdom does not provide native responsive layout/focus/key activation; those are not verified by this check. Full local browser execution was attempted again and failed at launch because Chromium headless shell is unavailable, so the revised browser assertions remain **unexecuted locally** and require CI verification. No Chromium installation, production check or new automated browser pass is claimed.

## 2026-10-07 — v0.5.0 icons/footer/settings preparation (not release approval)

Verified `/tmp/stemtape-v0.5.0-base.bundle` and bundled origin/main `cd196fbcd7754414841aee5fe37077aa7fa79872`. Prepared on review/v0.5.0 in the isolated `/tmp/stemtape-v050-worktree`. Existing unrelated README changes remain in the original docs/readme-v0.4.1 checkout and their backup; they were not included. All four supplied PNG references were available and inspected before drawing fixed SVG replacements. They are design references only, not runtime assets.

Executed checks:

- `npm test`: **53/53 passed** (45 existing plus eight footer/icon tests). Coverage includes legacy byte-identical loading, footer JSON/preset/duplicate round trips, retained text when disabled, single-line/80-unit validation, cue-only CSV, independent exact UTF-8 budget boundaries with emoji/footer fields, quota failure, rotated bounds and existing icon keys.
- `npm run check`, syntax checks for all test modules, shell syntax and `git diff --check`: **passed**. The tracked-file/basic credential-pattern checker passed; new filenames were inspected separately. This is not a full secret scan.
- Temporary synthetic actual-app jsdom checks with native canvas metrics: **passed** disabled/empty geometry equality, toggle retention, over-limit draft preservation and guarded Sort/cancellation, literal markup/emoji text, horizontal overflow, quota-failure status and saved-state protection, all four rotations and shared preview/print footer text. These are not native-browser or screen-reader checks.
- Synthetic footer-disabled SVG output for the same icon-free fixture was byte-identical to the verified base. `preparePrint` source remains unchanged. `makeSheet` has only the required footer addition; the original table draw/physical dimensions/calibration behavior is retained. These checks are not a new physical-print verification.
- Enlarged light/dark icon previews with 24 px and 11 pt samples were rendered and inspected. Actual-size 32 × 90 mm sheet SVGs (off/on and four rotations) and print-page SVGs with calibration/cut marks were generated from the app renderer using native canvas metrics and bundled fonts. PNG versions are enlarged review images. Artifact generation used temporary external development tooling only; no runtime dependency was added. The generated previews are synthetic standalone artifacts, not browser/PDF or physical-print evidence.
- Application container built as stemtape:0.5.0 using `nginx@sha256:0985e772fb9f729e6fa0980da05fca5d9c468e870eed43071545afa9d2e27d94`. `STEMTAPE_TEST_PORT=18081 sh scripts/container-smoke.sh stemtape:0.5.0`: **passed** health, UID 10001, read-only app, CSP header, POST rejection, security.txt bytes/type/headers, hidden-path denial and gzip. The existing empty-default NGINX_IMAGE Dockerfile warning remains; an explicit digest was supplied. The nested test did not publish port 18080.
- Both public local/VPS Compose examples validated with only their public example env files. No private deployment files were read.

Browser suite attempted with the existing temporary Playwright installation: **unexecuted**, missing Chromium headless shell at launch. No Chromium installation or restriction bypass was attempted. Added condition-based regressions cover disclosure keyboard/themes/mobile, footer toggles/invalid drafts/reload/duplicate/JSON restore, quota feedback, horizontal/vertical overflow and preview/print equivalence for every rotation. They require CI or a supported real browser.

User-reported manual results are recorded separately below. Mobile/200% zoom, keyboard/screen-reader accessibility, emoji glyph availability, browser PDF dimensions, failed-save/recovery and exact-byte manual checks remain unconfirmed. The [manual checklist and artifact guide](REVIEW-v0.5.0.md) includes measuring the sheet and 50 mm calibration line and checking footer/icon readability. Production routing/TLS, live Caddy pin, full secret/image scans and large-active-plan performance concern remain outstanding. No live deployment or Internet.nl re-test is claimed. Approved column features remain deferred until successful v0.5.0 deployment and verification on stemtape.cc, as recorded in ROADMAP.md and the deployment completion checklist.

Pre-commit review reran all 53 Node tests, application/test/shell syntax and diff checks, the synthetic actual-app checks with native canvas metrics, the footer-disabled baseline comparison and the application-container smoke checks successfully. No further application defect was confirmed. The complete browser suite was attempted again and failed at launch because Chromium is unavailable; no browser assertions ran. The existing Git author configuration was verified as Graham van der Wielen with the configured GitHub noreply address. At that point, no v0.5.0 user-reported manual passes had been supplied; the later report is recorded below. The review commits exclude generated previews, temporary tooling and the unrelated README checkout/backup; committing the candidate does not satisfy the outstanding release gates or authorize deployment.

### 2026-10-07 — user-reported manual checks

Graham van der Wielen reports these checks passed immediately after the v0.5.0 Docker preview was started at http://127.0.0.1:18080/:

- Replacement icons at actual cue size.
- Footer toggle and reload persistence.
- Backup/restore.
- Themes and rotation.
- Printing, with physical output measured after printing.
- Footer overflow blocking, subsequently confirmed as passed on 2026-10-07.

The preview was built from `/tmp/stemtape-v050-worktree`; its served public assets were checked byte-for-byte against that worktree. These are user-reported manual results, not automated browser-suite results or independent physical-print verification. Specific print scaling, measured values and calibration-line measurements were not supplied. Footer overflow was initially reported as not retested; the owner has now confirmed the manual check passed on 2026-10-07. Local automated browser execution remains **unexecuted**; the separately reported CI run failed as described above. No production deployment checks are implied.

## 2026-10-03 — v0.4.1 SVG header assertion follow-up

The owner-reported CI failure extracted `h:mmFuelWaterdistance (mi)1:00Water2` from the whole preview. `cueHeader` produces the full `Water distance (mi)` label. The print renderer places each wrapped line in its own SVG text element, consumes a space when wrapping at a word boundary, and also supports hard wrapping inside words. DOM textContent concatenates those separate lines and cells without separators. This is a test extraction defect; the reported concatenation is not evidence of a missing word or incorrect distance unit in the rendered sheet.

The test now waits for fonts, scopes to exactly one printable SVG, identifies the third header column by its x position above the header rule, and checks its lines against the complete expected label. The test helper restores only a single expected ASCII space at a line boundary, preserving hard wraps and rejecting changed text/units or whitespace within a line. It does not broadly normalize the preview. The same column's rendered cue must equal exactly `2`, alongside the existing editor value and unit-preference checks. No application, fixture dimensions, makeSheet or preparePrint code changed.

Checks: `npm test` **45/45 passed**; `npm run check`, browser/helper test syntax and `git diff --check` **passed**. Added independent examples cover word/hard wraps and reject missing spaces inside a line, incorrect units, missing letters, doubled spaces and reordered lines. A temporary synthetic actual-app SVG check ran the same extraction callback successfully with mocked font metrics, producing header lines `["Wat","er","dis","tan","ce","(mi",")"]` and cue `["2"]`. This is not real-browser, font-layout, PDF or physical-print verification.

Full browser suite attempted: **unexecuted**, Chromium headless shell remains unavailable. CI must verify the revised extraction against native SVG/font rendering. No browser installation, commit, push or production action is part of this follow-up.

## 2026-10-03 — v0.4.1 preparation (not release approval)

Verified the refreshed bundle and its `origin/main` hash `4c45af7c4b79e9590eab90111806afb2a0672dd6`, including the merged v0.4.0 commits. Created `review/v0.4.1` from that exact commit. The three uncommitted formatting files were inspected/backed up before switching and reconciled into the tooltip. No untracked files were present before switching. [Review groups](REVIEW-v0.4.1.md) separate security.txt/static serving from application presentation and metadata.

Executed:

- `npm test`: **44/44 passed**. The four added tests cover new Fuel defaults, preservation of old/custom/imported/preset labels, time plans with additional distance columns and locale/timezone date formatting. Existing save success/failure, recovery and independent exact-byte boundary tests remain passing.
- `npm run check`, syntax checks for all test modules, `sh -n scripts/container-smoke.sh` and `git diff --check`: **passed**.
- Actual application image built as `stemtape:0.4.1` using `nginx@sha256:0985e772fb9f729e6fa0980da05fca5d9c468e870eed43071545afa9d2e27d94`. `STEMTAPE_TEST_PORT=18081 sh scripts/container-smoke.sh stemtape:0.4.1`: **passed** health, UID 10001, read-only root, CSP and POST rejection, plus security.txt HTTP 200/exact source bytes/`text/plain; charset=utf-8`/CSP, hidden-path 403 responses and gzip for app.js. Port 18080 was not published by the nested test container. The existing Dockerfile empty-default ARG lint warning remains; an explicit digest was supplied.
- Temporary synthetic jsdom checks of the actual app: **passed** save-age and read-only timer behavior, failures/recovery/budget exportability, tooltip focus/Escape and invalid-draft access, and time-mode unit preference preservation. Mocked canvas/dialogs are involved: these are **not real-browser, visual or screen-reader results**.
- `python3 scripts/check-private-files.py`: **passed** its tracked-file/basic-pattern checks; not a full secret scan. New filenames were inspected separately; no private files or generated artifacts are part of the diff.
- Exact source comparison: `makeSheet` and `preparePrint` are unchanged from the verified base. This is not new PDF/physical-print evidence.

Full browser suite attempted using the existing temporary Playwright module: **unexecuted**, because Chromium headless shell is missing at launch. No browser download or network bypass attempted. New browser tests include touch/focus/Escape, overlay geometry, previous time during invalid drafts, unit disabling/reload/restoration and custom distance-column formatting; they still require CI or a supported local browser. No new manual checks are reported as passed.

The owner supplied the security.txt contact, resolving the older contact-pending notes below. Expiry is 2027-09-01; review/renew beforehand. The owner accepts remaining Cloudflare cipher/key-exchange findings for now. No new Internet.nl score, public endpoint test, DNS/Cloudflare change, security audit or production deployment is claimed. Exact live Caddy-pin verification, full secret/image scans, browser visual/accessibility/PDF/physical checks and large-active-plan performance profiling remain outstanding.

Pre-commit review confirmed and fixed one tooltip defect: mouse hover could open details while focus stayed in an input, but Escape only worked on the status button and could cancel an invalid draft instead. A synthetic actual-app reproduction failed before the fix and passed afterward. Escape now dismisses an open tooltip before editor cancellation handlers. Browser regressions cover hover-to-tooltip movement, hover dismissal with editor focus, draft preservation and absence of a success check after quota failure; these remain unexecuted locally.

The 44 Node tests, application/test/shell syntax checks, diff checks, four synthetic DOM scenarios and rebuilt application-container smoke checks were rerun successfully. Browser launch was attempted again and remains blocked by missing Chromium. Git author identity was verified as the existing Graham van der Wielen GitHub noreply configuration. The original formatting backup remains intact. Changes are committed as separate security/serving and application/metadata groups; no push or deployment is part of this review.

### v0.4.1 manual checklist — unexecuted

1. Save, wait a minute and reload: relative age remains honest. Hover or Tab to status for localized date/time and explicit timezone; Escape dismisses. Test 12/24-hour locales and screen-reader description without repeated age announcements.
2. On touch/mobile, tap status then outside. Inspect light/dark and 200% zoom: no clipped tooltip, hidden failure text, layout shift or editor focus disruption.
3. Test invalid drafts, blocked/quota writes, recovery originals and exact-limit session-only timestamps. The check disappears when unsaved; known previous time stays available. Reload must not invent a missing timestamp. Export/restore both modes/presets and original recovery bytes.
4. Choose Miles, switch to Time and reload: units are grey/disabled, physical dimensions remain enabled, additional distance columns stay in miles. Switch back: Miles remains selected and both mode lists are intact.
5. New nutrition plans show Fuel in both modes; existing/custom/imported labels and personal templates remain unchanged. Exercise cue ordering and invalid-draft guards, then compare preview/PDF and actual-size printing in the test setup.
6. After a separately authorized deployment, verify public security.txt content/type/security headers through Cloudflare, contact/expiry maintenance and compression. Local container results do not establish this public check.

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
