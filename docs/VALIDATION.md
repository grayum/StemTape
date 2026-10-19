# Validation record

## 2026-10-19 — final v0.9.0 manual acceptance and branch handoff

The user accepts the final v0.9.0 preview, including Bar, Bottle/Bidon and Gel
upright at **0°**, dated **2026-10-19**. This final user-reported manual acceptance
supersedes pending acceptance statements in the preparation history below.
Physical printing remains **unverified**, explicitly **not a release gate at the
user's request**. It is not recorded as passed. No physical-print, screen-reader,
exhaustive device/accessibility or independent production pass is inferred.

Final review confirms v0.9.0 package/UI/image metadata, changelog, help, palette,
fill/monochrome treatment, grid and shared 0.8 mm cell padding, CSV metadata,
optional v1 JSON fields and tested rollback limitations are consistent. Bar,
Bottle and Gel use no artwork rotation, including their fill/detail layers.
Strict CSP and the manual-only/main-only Pages workflow remain unchanged.

- **PASS:** final `npm test` (**100 tests**), `npm run check`, `git diff --check`.
  The existing artwork audit is now a separate test file for reviewable commits;
  runtime code is unchanged from the accepted preview.
- **REUSED PASS:** complete native Chromium suites at root and plain static
  `/StemTape/`, both themes, desktop/mobile, actual 200% zoom, grid geometry,
  state/history/preset/import/storage regressions and actual PDF inspection.
  Focused final upright-orientation checks pass at root and Docker, covering all
  three icons in monochrome/blue, both themes, picker/editor/preview/print
  equality, bounds, focus and unchanged state/history. These final captures/PDFs
  were visually inspected. The earlier −7° attempt is superseded.
- **REUSED PASS:** container smoke, Nginx syntax and byte comparison of all 34
  served assets with this worktree. The existing preview stays available at
  http://127.0.0.1:18080/ using unchanged forwarding. The accepted laptop preview
  is user-reported evidence, separate from sandbox HTTP/Chromium checks.

Handoff uses separate palette/artwork and grid-model commits, then shared app/CSV
integration, tests and release documentation. Screenshots, PDFs, browser binaries,
local artifacts and private local instructions are excluded. Unrelated README
edits, backups and prior worktrees are preserved. Bundle and standalone restore
verification are reported in the handoff. No push, merge, tag, deployment or
infrastructure change. Production proxy/TLS and full secret/image-scanner gates
remain unverified; this branch handoff does not claim deployment readiness on
those unrun gates. Physical printing is separately waived as described above.


## 2026-10-19 — final correction: Bar and Gel at 0°

The user corrected Bar and Gel to **0°**, superseding the −7° orientation in the
preceding entry. All three icons (Bar, Gel and Bottle) are now upright with no
artwork rotation, including filled interiors and detail outlines. No other icons,
colour data, history behavior or 0.8 mm grid padding changed. Final visual
acceptance remains pending; the previously reported preview acceptance and
non-blocking, unverified physical-print status remain as recorded below.

**PASS:** 100 Node tests, syntax/diff checks and focused native Chromium icon
checks at root and refreshed Docker, in monochrome/blue and both themes. Picker,
editor, preview and print match; stroke bounds stay unclipped and inspection
preserves state/history/focus. Updated print PDF visually inspected. Preview
reuses the same sandbox/container 8080 publication and laptop URL/forwarding
http://127.0.0.1:18080/. All 34 served assets match the worktree. Unaffected
validation is reused. No commit, push, merge, tag or deployment.

## 2026-10-19 — preview acceptance; final icon orientation awaits visual check

The user reports the v0.9.0 preview looks good and is accepted **apart from the
final Bar/Bottle/Gel orientation adjustment**. That adjustment remains pending
user visual acceptance. This is user-reported preview testing, not independent
production, physical-print, screen-reader or exhaustive device coverage.
**Physical printing remains unverified and is not a release gate for v0.9.0,
at the user's explicit request.** This overrides the earlier physical-print gate
statements below for this candidate only; it does not claim a physical-print pass.

Inspected existing transforms: Bottle +45°, Bar/Gel +38° clockwise. Final artwork
is 45° counter-clockwise relative to that preview: remove Bottle's rotation;
change Bar/Gel to −7°. Both original detail paths and added fill silhouettes use
the same final transform, without compensating groups. Stable IDs, colours,
state/schema, dimensions and shared 0.8 mm cell padding are unchanged.

- **PASS:** `npm test` (**100 tests**), `npm run check`, standalone browser-test
  syntax checks and `git diff --check`. Updated transform assertions and the
  earlier Bottle-bounds helper to support an absent transform/identity matrix.
- **PASS:** focused `tests/v090-orientation.mjs` in native Chromium at hardened
  root, plain static `/StemTape/`, and refreshed Docker root. Covers all three
  icons in monochrome/blue, both themes, picker/editor/preview/print equality,
  complete stroke/curve bounds within the existing 24×24 icon viewBox, restored
  focus/cancellation without state mutation, and no history entries on inspection.
  The existing v0.6.2 bounds/help/focus regression also passes with unrotated Bottle.
- **INSPECTED:** real native-browser captures of all three icons in default/blue
  in both themes, plus rasterized actual print PDFs from both themes. Interiors,
  dark detail outlines and transparent gaps stay aligned; no clipping observed.
  Both PDFs have one A4 page and the unchanged 50 mm calibration vector. This is
  PDF/browser evidence only; no physical-print result is inferred.
- **PASS:** semantic comparison with base `dist/icons.js`: only the transforms
  of Bar/Bottle/Gel changed; all path/shape attributes and all other icons remain
  unchanged. Reuse the previous full root/project-path browser suites, mobile/
  200% zoom, history/storage/import/preset/grid tests for unaffected behavior.
- **PASS:** Docker rebuild/replacement of only `stemtape-v090-preview`, Nginx
  syntax and container smoke. All **34** served assets match the release worktree.
  The existing HTTP config and sandbox 0.0.0.0:8080 → container 8080 mapping remain;
  laptop forwarding remains 127.0.0.1:18080 → sandbox 8080. Internal checks do not
  establish a new laptop-access result for this final orientation.

Run the focused check from the intended worktree with local Playwright available:
`BASE_URL=http://127.0.0.1:8080/ node tests/v090-orientation.mjs` (or set
`PLAYWRIGHT_MODULE` to its installed local module path). Outputs stay in ignored
`artifacts/`. No commit, push, merge, tag, deployment or infrastructure change.
Unrelated README edits, backups and worktrees are preserved.


## 2026-10-18 — v0.9.0 fill, monochrome Banana and cell-padding refinements

User feedback on the earlier preview was positive overall, with these visual
refinements requested. **Final manual acceptance remains pending.** This record
supersedes the initial outline-only treatment described in the earlier candidate
entry below; it is automated/browser/PDF evidence, not a user or physical-print pass.

- **PASS:** `npm test` (**100 tests**), `npm run check`, `git diff --check`.
  New coverage audits all 15 cue geometries, original-path/rotation preservation,
  explicit fill layers, and the Feed zone stroke-only exception. Palette IDs,
  persistence, CSV, history and transaction behavior are unchanged.
- **PASS:** complete native Chromium suites at hardened `/` and plain static
  `/StemTape/`, plus final focused v0.9.0 and refinement suites at Docker root.
  Filled icons are checked in screen/preview/print, all six palette choices and
  both themes. Banana button surfaces/text match other cues in default and selected
  states. Keyboard focus/cancellation and responsive 1440/390/320 px views pass.
  Existing history/draft/save/storage/preset/import regressions still pass.
- **PASS:** actual native Chromium 200% browser zoom in both themes, including
  palette keyboard/selected state/focus, responsive actions and grid controls.
  Real desktop/mobile and zoom screenshots were inspected. No screen-reader or
  exhaustive device/accessibility coverage is inferred.
- **PASS:** shared **0.8 mm** horizontal cell inset per side, replacing old uneven
  icon/left/right offsets and the separate wrapping allowance. Browser measurements
  check padded icon/text positions, existing left/right/center alignment, headers,
  visible/reordered Note and custom columns, and absent hidden-column dividers.
  All grid modes use the same inset inside existing widths. A 1 mm prototype made
  the default 32 mm sheet's km header wrap; 0.8 mm keeps that header intact and the
  existing narrow/footer regressions pass. The older column-identity test now
  expects the deliberate icon inset while continuing to verify its host column.
- **PASS:** 36 updated native Chromium PDFs checked for one A4 page, absence of
  application chrome and a 50 mm calibration vector; fixed palette fill values and
  visible Note/custom contents checked. Fixtures cover all 15 icons in all palette
  choices/both themes, narrow/wide sheets, four rotations, headers on/off and footer
  combinations. Actual PDF rasters were inspected for every icon's fill geometry,
  all palette colours on representative icons, narrow/rotated grids and Note/custom
  padding. Coffee handle, open peel/steam, cobble gaps and other transparent details
  remain visible. Feed zone intentionally stays coloured open utensil strokes.
- **PASS:** rebuilt/replaced only `stemtape-v090-preview` using the established
  read-only HTTP mount and **0.0.0.0:8080 → container 8080** publication; Nginx
  syntax and container smoke pass. All **34** served assets match this worktree.
  Laptop forwarding/URL remain **http://127.0.0.1:18080/**. Internal HTTP/Chromium
  success is distinct from a new user-confirmed laptop test of these refinements.

Repository hygiene, temporary-index artifact inspection (exactly 34 dist files,
including security.txt) and all 53 local links in changed docs also pass. The real
Git index remains unstaged. These are not full secret/image scans.

Audited fill layers are isolated in `dist/icon-fills.js`, with original outline
geometry unchanged in `dist/icons.js`. No palette/data/schema/history changes,
extra runtime dependencies, CSP relaxation, Pages trigger or production settings
changes. See [per-icon treatment and review checklist](REVIEW-v0.9.0.md).
Screenshots, PDFs and development tools remain ignored/temporary artifacts.
Unrelated work, README edits, backups and worktrees are preserved. No commit,
push, merge, tag or deployment performed. Physical printing and the outstanding
release gates recorded below remain unverified.


## 2026-10-18 — initial v0.9.0 candidate: icon colours and full grids

Prepared on `review/v0.9.0` from public HTTPS main
`76ccab4be602743c492c92330fac9151da1ee2ca`, verified against the annotated v0.8.0
tag target and merged v0.8.0 release. Environment: Linux ARM64 Docker Sandbox,
Node 22.22.1, native Chromium through Playwright 1.62.1. Repository verification
is not independent production verification. No user manual acceptance is claimed.

- **PASS:** `npm test` (**99 tests**), `npm run check`, `git diff --check`.
  Coverage includes optional/legacy fields, strict palette/grid validation,
  no-op/history behavior, row identity, None/icon changes, JSON/preset previous
  revisions, CSV metadata/value alignment (including time/custom distance columns),
  hidden columns and unchanged byte limits. One test fixture initially exceeded
  the existing 32-character column-label limit; it was corrected without relaxing
  application validation.
- **PASS:** complete native Chromium suites at hardened root `/`, plain static
  `/StemTape/` (no Nginx rewrites), and final Docker root. New regressions cover
  independent row colours, picker keyboard/focus/cancellation, sorting/reordering/
  deletion/Undo/Redo, grid changes/no-ops, reload/duplication/preset update/recovery,
  JSON/CSV import, invalid drafts, storage failures and exact-budget rejections.
  Existing naming, protected recovery, history and save tests also pass.
- **PASS:** actual Chromium 200% browser zoom in both themes, including final
  Docker preview; responsive action order, palette names/selected state/focus and
  grid controls. Real screenshots inspected for desktop/mobile (including 320 px),
  light/dark and 200% zoom, representative icons across all palette colours,
  all grid modes, headers on/off, hidden/reordered Note/custom columns and
  narrow/wide sheets. Condition-based waits and visible mobile controls are used.
- **PASS:** shared SVG preview/print comparisons, rotations 0/90/180/270,
  footer/overflow checks, and native Chromium print PDFs. PDF inspection confirms
  one A4 page per fixture, no application chrome, 50 mm calibration vectors and
  all five fixed colour strokes in light/dark palette PDFs. Rasterized actual
  PDFs were visually inspected for artwork, borders, rotated sheet placement,
  footer and cut marks. This does not establish physical dimensions on a printer
  or exact colour reproduction.
- **PASS:** container smoke using the pinned Nginx base documented in
  LOCAL-DEVELOPMENT: non-root/read-only application, security headers, methods,
  gzip, security.txt and hidden-path denial; `nginx -t`. The refreshed preview
  uses the existing sandbox 8080 → container 8080 mapping. All 33 served `dist/`
  assets match this worktree byte-for-byte. Laptop forwarding remains
  127.0.0.1:18080 → sandbox 8080; internal success is not a new laptop-access claim.
- **PASS:** temporary-index repository hygiene checks, all 52 local links in
  changed documentation, and a tar artifact containing exactly the 33 intended
  dist files, including security.txt and no unintended hidden files or CNAME.
  The real Git index remains unstaged.
- **CHECKED:** actual v0.8.0 CSV parser rejects the new versioned colour metadata
  rather than shifting it into cue text. Its JSON validator drops optional colour/
  grid settings; rollback is not lossless. Keep original v0.9.0 JSON backups.

Palette/grid modules and focused tests are separate; shared integration hunks are
identified in [REVIEW-v0.9.0.md](REVIEW-v0.9.0.md). No icon artwork, CSP, schema/key,
Pages deployment triggers or production configuration changes. No commit, push,
merge, tag or deployment performed. Unrelated README edits, backups and worktrees
are preserved; screenshots/PDFs and development tooling are excluded artifacts.

**Outstanding release gates:** user review and physical printing (including a
ruler check and colour/greyscale output), production proxy TLS/host-routing checks,
and full secret/image scanning. `gitleaks` and `trivy` are unavailable here.
Repository private-file/artifact checks are narrower than those scanners. No
screen-reader or exhaustive device/accessibility coverage is claimed. Required
unrun gates still block release under the development contract.


## 2026-10-18 — final v0.8.0 manual acceptance and branch handoff

The user accepts v0.8.0 after manual preview testing, including final button layout
and the Tour of Flanders built-in preset, dated **2026-10-18**. This supersedes
pending acceptance statements in earlier preparation entries below. It is
user-reported testing; physical printing, screen-reader testing and exhaustive
device/accessibility coverage are not inferred.

Final review confirms consistent v0.8.0 package/UI/image metadata, changelog, help,
separate naming namespaces, identity-based update/recovery, compatibility and
upgrade/rollback documentation. Schema/key remain v1; older versions may lose new
optional preset metadata and reject the Flanders key. Complete JSON originals
must be preserved before any rollback. Tour of Flanders route data is embedded
in local `dist/presets.js`, not fetched from the `/tmp` source CSV at runtime.
The committed BOM-bearing CSV is test data only; fidelity checks preserve all
19 cues, blank values, icons, order and visible Location contents.

- **PASS:** final `npm test` (**89 tests**), `npm run check`, and `git diff --check`.
  The existing Flanders fidelity test is now a separate test file for reviewable
  commits; runtime code remains unchanged from the accepted preview. A scoped
  `.gitattributes` rule preserves the supplied fixture BOM/CRLF bytes and treats
  its CR line endings correctly in whitespace checks.
- **REUSED PASS:** complete native Chromium final-layout suite at root, focused
  preset/naming regressions at plain static `/StemTape/` and Docker root, and
  actual 200% zoom/screenshots in both themes. These cover left/right action
  groups, Columns then Sort, DOM/tab order, focus, disabled states, responsive
  wrapping, existing history/save behavior and shared preview/print rendering.
  No relevant application code changed after those checks.
- **REUSED PASS:** final-layout Docker smoke (non-root, read-only root/app, security
  headers, methods, gzip, security.txt); preview remains healthy on its existing
  sandbox 8080 → container 8080 mapping. All 31 served assets rechecked against
  this worktree. User-reported laptop preview acceptance is distinct from these
  internal HTTP/browser checks. Forwarding remains 127.0.0.1:18080 → sandbox 8080.

Handoff uses separate commits for bundled route data/model/fidelity and the
preset/naming/UI/release integration. Only reviewed release files are included;
original-checkout README edits, backups, worktrees, private local instructions,
screenshots, PDFs, browser binaries and local artifacts are excluded/preserved.
Full-history branch bundle and standalone restore verification are reported in
the handoff. No push, merge, tag, deploy or infrastructure change is authorized.

Required physical-print, production proxy/TLS and full secret/image-scanner gates
remain unverified as previously recorded; manual acceptance does not establish
those checks or make this a deployed release. Basic file/credential-pattern
checks are not a substitute for full scanners.

## 2026-10-18 — v0.8.0 final button-layout follow-up

Final user manual acceptance remains **pending**. This follow-up changes only the
HTML/CSS placement, associated browser layout assertions and documentation; plan,
preset, naming, history, save, print, CSP and deployment behavior stay unchanged.

- **PASS:** `npm test` (**89 tests**), `npm run check`, relevant browser-test syntax
  and `git diff --check`.
- **PASS:** full native Chromium root suite and focused preset/naming regressions
  at plain static `/StemTape/`. Desktop 1440 and mobile 390/320 in light/dark themes:
  history group aligns left, preset group aligns right, flexible gap, ordered
  wrapping without page overflow. The history pair retains 6px spacing; wrapped
  groups have at least 12px vertical spacing and preset buttons retain 6px spacing.
- **PASS:** DOM order, actual Tab movement through Columns then Sort, Undo/Redo
  then Save as new preset / Update preset when enabled; button focus, disabled
  states, dialogs and existing functional regressions remain passing.
- **PASS:** actual native Chromium browser zoom 2.0 (720 CSS pixels, DPR 2), both
  themes, including the same alignment, wrap and keyboard assertions. Desktop,
  narrow mobile and zoom screenshots inspected in both themes. Earlier unaffected
  print/PDF evidence is reused; no physical printing or manual pass is inferred.
- **PASS:** refreshed only `stemtape-v080-preview` from `review/v0.8.0`, with the
  existing read-only HTTP config, sandbox **0.0.0.0:8080 → container 8080** and
  unchanged laptop forwarding/URL **http://127.0.0.1:18080/**. All **31** served
  assets match this worktree byte-for-byte; Nginx syntax, container smoke and
  focused native Chromium against Docker pass. Internal success does not verify
  new laptop reachability. No unrelated container or production setting changed.

Unrelated changes/backups are preserved; no commit, push, merge, tag or deployment.
The remaining release gates documented below are unchanged.

## 2026-10-18 — v0.8.0 separate Event/Preset name follow-up

Requested after the user-found duplicate-preset issue; this is automated candidate
validation, not final user acceptance. Synthetic browser fixtures preserve all
real user data. Separate name namespaces do not change schema v1, storage keys,
CSV conventions, physical dimensions, strict CSP or the manual-only Pages workflow.

- **PASS:** `npm test` (**89 tests**), `npm run check`, browser/zoom syntax and
  `git diff --check`. Pure tests cover separate namespaces, self-renaming,
  capitalization/whitespace, checked suffixes including length/Unicode limits,
  legacy duplicate round trips, repeated personal-preset use and history peeking.
- **PASS:** complete native Chromium root suite, including v0.7.0 grouping/save/
  recovery regressions, v0.8.0 identity/revision/import tests, preset collision
  validation and the new naming suite. A byte-limit history fixture now uses a
  whitespace-free name so normalization does not change its byte-limit premise;
  the rejected Undo still leaves both state and history unchanged.
- **PASS:** focused preset and naming regressions at plain static `/StemTape/`
  without rewrites and at the refreshed Docker root. The separate Pages browser
  check passes resource/font loading, navigation, security.txt and meta-only CSP.
- **PASS:** Event name helper and association line; same name allowed across
  namespaces; exact/case/trim collisions within each; own-ID exclusion; unchanged
  saved names and accessible preserved invalid drafts. Update keeps preset name,
  identifies its target, explains captured event name/settings and has no rename
  field. Separate Rename preserves the template and existing event names.
- **PASS:** checked unique names for New, Duplicate, repeated personal/built-in
  preset creation, CSV and spreadsheet import; actual complete JSON restore keeps
  legacy duplicates byte-equivalent with numbered selector labels. No name-based
  identity inference, merging or overwriting. Prior duplicate-preset import and
  independent update/recovery coverage remains passing.
- **PASS:** real Undo and Redo name conflicts leave storage, plan and history stacks
  unchanged, announce a live status and retain focus; freeing the name allows a
  retry. Quota failures retain valid in-memory names with Not saved, keep storage
  unchanged, and still prevent another plan taking that name. Undo/Redo remain
  usable after storage recovers; preset transactions retain their atomic behavior.
- **PASS:** desktop/mobile 1440/390/320 in light/dark themes, dialog focus/Escape,
  wrapping and no horizontal overflow. Actual Chromium browser zoom 2.0 (720 CSS
  pixels, DPR 2), both themes, covers association, invalid naming feedback, update/
  recovery dialogs and Help. Actual desktop, mobile and zoom screenshots inspected.
  Shared preview/print SVG remains identical after naming and history operations;
  existing full-suite PDF evidence is retained. No physical-print pass is claimed.
- **PASS:** Docker build with the previously pinned Nginx base; refreshed only
  `stemtape-v080-preview`, healthy and `nginx -t` clean. Smoke checks pass non-root,
  read-only app, HTTP/security headers, rejected POST, gzip and exact security.txt.
  All **31** served assets match this worktree byte-for-byte. Sandbox 8080 →
  container 8080 and established laptop 127.0.0.1:18080 forwarding are unchanged.
  Internal HTTP/Chromium is not independent evidence of current laptop access.
- **PASS:** temporary-index artifact/hygiene validation (real index untouched):
  exactly 31 dist files, security.txt included, no CNAME/unintended hidden files;
  basic private-file/credential-pattern checks. Local Markdown targets checked.

Help, README, changelog, architecture, upgrade and review docs describe the chosen
rules and compatibility exceptions. Full secret/image scanners are unavailable;
physical printing, screen-reader/exhaustive device testing, production proxy/TLS
validation and user acceptance of this follow-up remain unverified. Earlier
unaffected evidence remains applicable. No release/deployment authorization is
inferred, and required unrun release gates remain blocking for release.

## 2026-10-18 — user-found v0.8.0 preset-name collision follow-up

During manual candidate testing the user found that Save as new preset accepted
an indistinguishable duplicate name. This records a **user-found issue, not a
completed manual pass**. Final v0.8.0 acceptance and review of this fix are pending.
Existing user presets, including duplicates created during that testing, must
remain untouched; browser regression fixtures use synthetic data only.

- **PASS:** `npm test`, **84 tests**; `npm run check`, browser/zoom syntax and
  `git diff --check`. New saves/renames reject exact, case-only and trimmed name
  collisions against personal and built-in presets, preserving capitalization on
  accepted names. Rename excludes its own ID; unchanged-name content updates and
  recovery remain possible for existing duplicates.
- **PASS:** complete native Chromium suite at hardened root `/`, including prior
  v0.8.0 update/recovery/history tests and the new collision regressions. Focused
  name regressions also pass at plain static `/StemTape/` and the refreshed Docker
  root. Earlier unaffected full project-path/container evidence remains applicable.
- **PASS:** rejected save/rename preserves the exact raw stored state, association,
  recovery and dialog input; focus returns to the name field, with aria-invalid,
  described inline role=alert and the requested exact collision message. Editing
  the name clears the stale error; retry succeeds. No unrelated Update action is
  offered by name. The update target remains its stable association ID.
- **PASS:** real JSON import accepts existing duplicate names without merging or
  renaming them. Numbered personal-preset selector and confirmation labels
  distinguish entries without showing IDs. Each imported duplicate is independently
  applied, updated and recovered; the other preset stays unchanged. Names remain
  permitted in backup validation; duplicate identities are still rejected.
- **PASS:** desktop/mobile 1440/390/320, both themes, preserved input, modal Escape/
  focus return and no horizontal dialog overflow. Actual native Chromium 200%
  browser zoom, both themes, includes inline collision/error screenshots and
  unchanged storage assertions. Real mobile/zoom screenshots were visually inspected.
- **PASS:** refreshed `stemtape-v080-preview`, container smoke, Nginx syntax and
  all **30** served asset bytes match the release worktree. Existing read-only
  HTTP mount and **sandbox 0.0.0.0:8080 → container 8080** publication reused;
  laptop **http://127.0.0.1:18080/** forwarding unchanged. Internal checks do not
  constitute a new laptop-access or user-acceptance pass.

Help, review, README and changelog now explain collision validation and existing
name duplicates. There is no schema or backup-format change in this follow-up.
No commit, push, merge, tag, deployment or infrastructure change. Outstanding
physical-print, broader accessibility/device, production and full scanning gates
remain as recorded below.

## 2026-10-18 — v0.8.0 preset/recovery and supplied Flanders candidate

Environment: Linux aarch64 Docker Sandbox, Node 22.22.1 and native Playwright
1.62.1 Chromium. Isolated branch `review/v0.8.0` is based on verified public main
`9203a0872465aafb3dd963ae310eddfea0111063`; advertised/fetched main match. Annotated
v0.7.0 tag object `50c5212281f0606b07f15271c903fd582c56acd5` points to this main,
which contains the accepted v0.7.0 implementation. This is repository evidence,
not independent production verification. See [design/review](REVIEW-v0.8.0.md).

- **PASS:** `npm test` (81 tests), `npm run check`, new browser/zoom test syntax and
  `git diff --check`. Focused data tests cover stable identities/same names,
  independent plans, no-op/revision swaps, legacy loading, invalid references,
  CSV/JSON boundaries, atomic writes/failures, UTF-8 budgets and source CSV fidelity.
- **PASS:** complete existing native Chromium suite plus v0.8.0 regressions at
  hardened root HTTP, plain static `/StemTape/` without rewrites, and Docker root.
  Final focused v0.8.0 checks at Docker root and `/StemTape/` cover the final
  confirmation/delete focus refinement and Flanders print case; earlier full-suite
  evidence remains applicable to unchanged code.
- **PASS:** Save new associates, same-name update uses identity, cancellation and
  no-op preserve state/recovery, new plans use updated templates, existing plans
  stay independent, recovery swaps versions, failed update/new/recovery preserves
  state, invalid drafts block, blur-to-preset includes the latest field, deletion
  unlinks all plans and old Undo cannot restore links, duplicate/switch/history,
  rejected missing/duplicate imported references, replacement rather than merge,
  successful JSON recovery preservation and exact-budget rejection.
- **PASS:** Tour CSV BOM/escaping, all 19 rows/symbol keys/blanks/order, visible
  role-marked Location and Fuel, three Kwaremont cues and Finish; repeated use and
  reload do not inject duplicate defaults. Default dimensions are unchanged and
  overflow blocks print. With explicitly enlarged test dimensions, preview and
  print SVG match; generated PDF and print screenshot retain all cues/calibration.
- **PASS:** desktop 1440, mobile 390/320 in both themes; action DOM/tab order,
  6px Undo/Redo and 12px preset spacing, wrapping/no page overflow, accessible
  dialog names, input focus, Escape return, keyboard cancellation and focus after
  deletion. Actual Chromium browser zoom 2.0 (720 CSS px, DPR 2), both themes,
  preset actions/dialogs, history and Help. Real screenshots were opened and
  visually inspected; no CSS-transform substitute for browser zoom was used.
- **PASS:** container smoke: nonroot/read-only, headers, method restriction,
  security.txt exact bytes/type, hidden-path denial and gzip. Nginx syntax and
  health pass. All **30** served dist assets match the supplying worktree exactly.
  The existing HTTP mount and sandbox **0.0.0.0:8080 → container 8080** publication
  are reused. Established laptop URL **http://127.0.0.1:18080/** and forwarding are
  unchanged; internal verification does not establish new laptop reachability.
- **PASS:** `/StemTape/` resources/fonts/home/security.txt/meta-CSP browser gate;
  candidate artifact has exactly 30 dist files, including `.well-known/security.txt`,
  and no CNAME/unintended hidden files. A temporary index was used to validate
  newly added candidate files without staging the real worktree. Basic file/
  credential-pattern hygiene and local Markdown link/diff checks pass.
- **PASS:** tested actual v0.7.0 validator from main against candidate state:
  it drops new optional IDs/links/recovery and rejects `flanders`. Rollback is
  explicitly documented as potentially lossy/incompatible, despite schema v1.

No v0.8.0 user manual acceptance, physical printing, screen-reader/exhaustive
browser/device pass, production TLS/host-routing check or full secret/image
vulnerability scan is claimed. Those release gates remain outstanding and block
release under AGENTS.md. The pinned Nginx base was reused, not newly certified
free of vulnerabilities. Docker's existing missing-default-build-ARG advisory
remains; the required immutable base was explicitly supplied successfully.
CSP, plan history limits, Pages deployment triggers/permissions/gates and
production infrastructure are unchanged. No commit, push, merge, tag or deploy.


## 2026-10-18 — final v0.7.0 manual acceptance and handoff

The user accepts the complete v0.7.0 work, including the final Undo/Redo placement
immediately before Save as preset, dated **2026-10-18**. This supersedes the pending
placement review below. It is user-reported manual acceptance; no physical
printing, screen-reader testing or exhaustive device/browser coverage is inferred.

Final review confirms v0.7.0 package/UI/image metadata, changelog, history scope
and validation documentation. Final `npm test` (73 tests), `npm run check` and
`git diff --check` passed. Completed native Chromium/container evidence is reused
for unchanged code. The final placement has explicit root and `/StemTape/`
geometry/tab/focus coverage at desktop/mobile widths in both themes and actual
200% Chromium zoom on the Docker preview, as recorded below.

This handoff commits only the reviewed v0.7.0 source, tests, metadata and docs;
local screenshots, PDFs, browser binaries, artifacts, unrelated README edits and
backups are excluded. The existing Git author identity is retained. The working
preview remains available at http://127.0.0.1:18080/ with unchanged forwarding.
No push, merge, tag, deployment or infrastructure change is part of this handoff.
Outstanding physical-print, broader accessibility/device, production proxy and
full secret/image-scanning gates remain accurately recorded below; manual
acceptance does not supply those missing checks.

## 2026-10-18 — user-reported v0.7.0 review and action placement

The user reports that manual testing of the v0.7.0 preview passed on 2026-10-18.
This does not imply physical printing, screen-reader testing or exhaustive device
coverage. A subsequent placement-only adjustment moves Undo/Redo immediately
before Save as preset in DOM/tab order. Undo/Redo retain their 6px gap; the action
group uses the existing 12px spacing before the preset action and wraps on narrow
screens. History/saving behavior is unchanged. At this stage the placement
adjustment awaited the user's final visual check; final acceptance is recorded above.

Follow-up validation passed: native Chromium v0.7.0 regressions at the Docker
root and plain static `/StemTape/`; explicit geometry, 6px/12px spacing, DOM/tab
order and visible keyboard focus at 1440/390/320 widths in both themes; actual
200% browser zoom on the refreshed Docker preview. Real desktop/mobile and zoom
screenshots were opened for inspection. Test syntax and `git diff --check` passed.
Existing history/saving test evidence is retained; neither implementation changed.
Only the preview container was replaced using the same sandbox 8080 publish and
HTTP configuration; all 29 served assets match the worktree and Nginx syntax
passed. The laptop URL/forwarding remains http://127.0.0.1:18080/. The user's
initial passing test applied to the earlier placement; the later final acceptance
above includes the adjusted placement.


## 2026-10-18 — v0.7.0 Undo/Redo candidate

Environment: Linux aarch64 sandbox, Node 22.22.1, native Playwright 1.62.1
Chromium (not a WASM/browser substitute). Branch `review/v0.7.0` was isolated from
public HTTPS main `bf6fb4736745f0306ead5dac64744d07fb9dcb43`; fetched commit and
public main advertisement matched, and the released v0.6.2 tip is an ancestor.
The user's v0.6.2 deployment confirmation is separate from candidate validation.

- **PASS:** `npm test`, 73 tests; `npm run check`; explicit syntax checks for new
  browser/zoom tests; `git diff --check` and shell syntax checks.
- **PASS:** complete existing native Chromium suite plus v0.7.0 regressions at
  hardened root HTTP, plain static `/StemTape/` without rewrites, and the actual
  Docker preview. Focused final additions were rerun at both Docker root and
  project path; earlier full-suite evidence remains applicable (no later app edits).
- **PASS:** completed multi-keystroke field/no-op/Redo grouping; one-click
  blur-to-Undo; automatic value+sort restoration; insertion/deletion/manual and
  explicit ordering; stable column/Note identities, rename/type/width/order and
  hidden contents; plan name/layout/footer/copies, mode and unit snapshots.
- **PASS:** isolated histories across plan switches, empty new/duplicate/CSV/preset
  plans, excluded preset/bike changes, cancelled preset and failed import,
  successful restore clearing, failed quota restore preserving current plans and
  history, 20-action bound, no-op preservation and Redo invalidation, reload reset.
  Pure history tests cover shared-budget chain-end eviction and oversize boundaries.
- **PASS:** invalid drafts block Undo without losing text; platform shortcuts,
  native field shortcut noninterception, modal exclusion, disabled buttons and
  local focus fallback. Quota-failed Undo/Redo retain valid matching in-memory
  state/history and truthful Not saved status. UTF-8 budget-rejected Undo preserves
  current state/storage/stacks. Existing recovery/conflict save tests also passed.
- **PASS:** actual Chromium browser zoom **2.0**, 720 CSS px at DPR 2, using a
  temporary local test extension, both themes, edit/preview/Help, focus and wrapping;
  rerun against Docker. Desktop 1440 and mobile 390/320 screenshots in light/dark
  and actual zoom screenshots were opened for visual inspection. Mobile actions
  use the visible Edit/Preview tab. Condition-based readiness waits are used.
- **PASS:** identical preview/printed sheet SVG content after Undo/Redo, actual-size
  PDF generation and print-render screenshot inspection. Cut marks/calibration and
  the shared black-on-white print generator remain unchanged. This is not physical
  printing or a ruler measurement.
- **PASS:** Docker build from this worktree with the previously verified immutable
  Nginx digest documented in local development. Container smoke on temporary sandbox
  port 18081: UID 10001, read-only app, headers, GET/POST rejection, exact security.txt,
  hidden-path denial and gzip. Expected read-only write failure was part of the check.
- **PASS:** project-path resource/font/home/security.txt and meta-only CSP checks;
  basic tracked-file credential/privacy guard. Prospective Pages allowlist checked
  with a disposable Git index including new `dist/history.js`: exactly 29 files,
  no CNAME/symlinks/unintended hidden paths. The real Git index was not staged.
- **PASS:** preview replaced only the inspected v0.6.2 container, retained its image,
  reused explicit loopback-development HTTP configuration and sandbox 8080 publish.
  New `stemtape-v070-preview` is healthy; Nginx syntax and all 29 served assets
  match the candidate. Established laptop URL remains http://127.0.0.1:18080/;
  forwarding was preserved. Internal checks do not establish new laptop access.

At the initial preparation stage no v0.7.0 user manual pass had been supplied;
the later user report is recorded above. No physical print, exhaustive
browser/device or screen-reader pass is claimed. Production TLS/canonical-host routing were not rechecked for this
local candidate; production configuration/Pages deployment workflow are unchanged.
Full secret/image scanners were unavailable; the basic private-file guard is not
an equivalent scan. These required release gates remain outstanding; this is a
review candidate, not release approval. No commit, push, merge, tag or deployment
was performed. Unrelated original-checkout README edits and backups were preserved.

See [design, memory accounting, boundaries and manual checklist](REVIEW-v0.7.0.md)
and [the refreshed local preview record](LOCAL-DEVELOPMENT.md).


## 2026-10-18 — v0.6.2 final user review and local handoff

The user reports that the final manual preview check passed, including the
right-aligned Privacy & help button. This supersedes the pending alignment
acceptance recorded on 2026-10-17. It is user-reported testing of the local
preview, not physical printing, exhaustive device/browser coverage or independent
production verification.

Final diff review confirms consistent v0.6.2 package/UI/image metadata and release
notes. `npm test` (69/69), `npm run check`, new browser-module syntax, documentation
links, publish-directory/basic hygiene and `git diff --check` passed again.
Completed native Chromium evidence is reused: the full root/project-path suites,
follow-up right-alignment/focus checks at both mounts, both themes and actual 200%
zoom, screenshot inspection and container smoke cover the unchanged final app.
No relevant app/browser code changed during this finalization. All 28 served
assets still match the release worktree, and the working preview is preserved.

The authorized handoff contains two separate local commits: visual/text changes
and release documentation, then local-preview workflow instructions/documentation.
Earlier no-commit statements below describe preparation stages. Temporary
screenshots, browser installations, profiles and ignored local artifacts are
excluded. Unrelated README edits and existing backups are preserved. No push,
merge, tag, production deployment or infrastructure change is included. Physical
printing, broader device/accessibility review and full secret/image scans remain
unperformed gates; the user pass does not establish them.


## 2026-10-17 — user review and Help alignment follow-up

The user reports completing manual review of the v0.6.2 preview and accepting all
reviewed changes except right-alignment of Privacy & help. That adjustment was
pending at the time of the report. This does not establish physical printing,
exhaustive browser/device coverage or unreviewed release gates.

The follow-up right-aligns only that button within the preview frame's existing
padding using normal flow and an automatic left margin. Its width remains bounded
by the frame on narrow screens. User acceptance of this final adjustment is not
yet recorded at this stage; the 2026-10-18 user report above subsequently confirms
it. Prior automated evidence below retains its original scope.

Follow-up checks passed: focused native Chromium regressions at `/` on Docker
and `/StemTape/` on a plain static server, right-padding alignment at 1440/390/320px
in both themes, keyboard opening/Escape focus return, actual Chromium 200% zoom
with expanded settings in both themes, test syntax, container smoke and diff
checks. Real desktop/mobile and 200% zoom screenshots were inspected. Existing
Node/full-browser results are reused for unchanged application logic. No physical
printing or exhaustive test coverage is inferred.

Rebuilt and refreshed only the v0.6.2 preview container. All 28 served assets match
the updated worktree. Established sandbox `0.0.0.0:8080` → container `8080` remains;
the working laptop route is `127.0.0.1:18080` → sandbox `8080`. HTTP/browser checks
were executed in the sandbox; laptop reachability is not independently claimed.
No commit, push, merge, tag or production deployment was performed.


## 2026-10-17 — v0.6.2 polish candidate

Verified public main `9c6afe41e47563e1bd58d077d2eecfef67964484` includes the merged
Pages migration. Isolated worktree, design, exact check scope, screenshots and
local Docker review instructions are in [the v0.6.2 review](REVIEW-v0.6.2.md).

69 Node tests, syntax, full native Chromium suites at `/` and `/StemTape/`,
Pages-specific probes, focused icon/layout/focus regressions, actual 200% browser
zoom in both themes and final Docker smoke passed. Real screenshots were inspected
and PDFs generated. Documentation/link, publish-file, basic hygiene and diff checks
passed. State/schema, identities, import/export/sorting, save protections, sheet
geometry, CSP and the manual-only Pages workflow remain unchanged.

At this earlier preparation stage no physical printing, user manual pass, screen-reader/device matrix, production
verification, full secret/image scan or remote workflow run is inferred. No commit,
push, merge, tag, deployment or infrastructure change is authorized in preparation.


## 2026-10-17 — migration finalization

Reviewed the complete migration diff, including the two privacy strings and the
focused Pages destination guard. Earlier no-commit statements below describe
those preparation stages; this finalization is authorized for a local commit and
complete-history bundle only. No push, merge, deployment or infrastructure change
is included. Unrelated README edits and existing backups remain outside this change.

Final documentation/link, diff, file-hygiene and publish-directory checks passed.
Completed Node/syntax, native Chromium at `/` and `/StemTape/`, focused privacy
visual checks, actionlint and guard-case evidence below is reused: the relevant
application and workflow files have not changed since those checks. No remote
workflow execution, new container smoke, physical printing or broader device/
accessibility testing is claimed. Account-level domain verification and VPS/disk/
snapshot/backup deletion remain unconfirmed.

## 2026-10-17 — independent public retry after network approval

New curl observations, distinct from the user-supplied production evidence:

- **www:** HTTP 301 to `https://stemtape.cc/` (response Date 14:47:58 GMT).
  Exactly one `Cache-Control: no-cache` header, unqualified, with no max-age.
  Exactly one nosniff header; expected CSP, X-Frame-Options, Referrer-Policy and
  Permissions-Policy present. HSTS `max-age=31536000` observed, source rule not
  established. NEL and Report-To absent.
- **github.io project URL:** HTTP 301 directly to `https://stemtape.cc/` with no
  `/StemTape/` suffix (response Date 14:48:02 GMT). This public redirect does not
  make the workflow's shell metadata comparison redirect-aware.
- **Apex:** a subsequent direct retry succeeded with HTTP 200 and an HTML response
  (response Date 14:49:12 GMT). Exactly one unqualified `Cache-Control: no-cache`,
  expected CSP including frame-ancestors, X-Frame-Options, Referrer-Policy and
  Permissions-Policy, one nosniff header and HSTS `max-age=31536000` were observed;
  NEL/Report-To were absent. Header assertions passed, including an exact CSP
  comparison with the documented policy. The earlier redirect-follow attempt was
  policy-blocked; that was not an apex outage. These observations are HTTP/header
  checks, not an application/browser, physical-print or remote deployment test.

Automated inspection of the captured headers passed exact cache/redirect values,
security-header values, single nosniff and absent NEL/Report-To. Documentation
links and diff checks were run for this evidence-only update; application/workflow
files were not changed again. No commit, push, merge, deployment or infrastructure
change was performed. The earlier full local test results retain their scope.


## 2026-10-17 — confirmations, destination guard and powered-off VPS

User confirmation establishes **GitHub Pages Enforce HTTPS enabled** and the former
production **VPS turned off**, both dated 2026-10-17. These are user confirmations,
not independent authenticated settings or VPS lifecycle checks. The VPS is not
running or immediately available for rollback. Rollback requires separately
authorized startup and application/version, TLS and configuration verification
before switching traffic back. Turning it off does not establish deletion/full
decommissioning; deletion of the VPS, disks, snapshots and backups is unconfirmed.

GitHub did not prompt the user for account-level domain verification. Completion
and TXT value remain unconfirmed: account-level ownership verification is separate
from repository DNS validation and certificate provisioning.

The exact original pages.yml step was a shell string comparison of
`steps.pages.outputs.base_url` with `https://grayum.github.io/StemTape`.
Inspection of pinned configure-pages source confirms its URL comes from the Pages
API's `html_url`, normalized without a trailing slash. It does not follow site
redirects, append `/StemTape/` to the custom domain or validate public content.
Canonical settings fail the original check before deployment; stale github.io
settings can pass while naming the wrong intended destination. The focused fix
changes only the guard label and expected value to `https://stemtape.cc`, keeping
the configured output as input. Manual-only/main-only restrictions, permissions,
action pins, every validation/artifact gate and both local mount-point suites remain.

Initial attempted public checks were **not production-header evidence**: requests to
www and github.io were stopped by environment network policy, yielding HTTP 403
with “Approval required” bodies before a public response was available. The
suggested `sbx` approval utility is unavailable. No network bypass was attempted.
The corrected www Cache-Control was unverified at that point; the successful
independent retry above subsequently confirmed it. Supplied prior apex evidence
retains its original scope; the later independent apex retry above succeeded.

Local follow-up checks passed:

- Nine cases against the actual corrected shell guard: canonical root with/without
  trailing slash accepted; github.io, canonical `/StemTape/`, www, HTTP, unexpected
  host and empty input rejected. Original canonical failure/stale-github.io pass
  reproduced separately. Source comparison proves only two workflow lines change.
- `actionlint` v1.7.12: all workflows passed (shellcheck integration disabled).
  The unchanged browser harness passed shell syntax checking.
- `npm test`: **69/69 passed**; `npm run check`: **passed**.
- Full native Chromium suites at **`/` and `/StemTape/` passed again**, including
  PDF generation; Pages resource/navigation/security.txt/meta-CSP checks passed.
  No project-path coverage was removed or retargeted to the production domain.
- **48 local documentation links/anchors**, exact documented CSP/security.txt,
  tracked-file/basic credential-pattern and publish-file gates, and
  `git diff --check`: **passed**. The hygiene check is not a full secret scan.

No new container smoke, physical print or remote workflow execution was performed;
the container validation gate remains mandatory in the deployment workflow. No
commit, push, merge, deployment, DNS/Cloudflare edit or VPS start/stop/delete was
performed. All prior pending documentation/privacy changes remain in this branch.


## 2026-10-17 — Pages/Cloudflare migration: supplied production evidence

The owner confirms the hosted service now uses GitHub Pages behind Cloudflare at
https://stemtape.cc/. The apex returns HTTP 200; www returns HTTP 301 to the
canonical URL. Cloudflare Full (strict), the DNS/CAA export and the functional
response-header/cache/NEL settings are recorded in [Pages operations](GITHUB-PAGES.md).
The user subsequently confirmed on 2026-10-17 that the former VPS is turned off;
deletions of the VPS, disks, snapshots and backups remain unconfirmed. Rollback
requires startup and verification before any traffic switch.

User-reported testing: **“Manual checks passed as far as the user could tell.”**
The user previously confirmed saved plans, editing and print preview looked good
with the restored CSP active. No physical printing, exhaustive browser/device
coverage, screen-reader testing or independent automated production pass is inferred.

Supplied curl evidence confirms expected security headers on apex and www,
resolved duplicate nosniff, HSTS `max-age=31536000` (source setting unestablished),
and absence of NEL/Report-To on both after disabling NEL. The final corrected apex
header was `Cache-Control: no-cache`; that final corrected header was **not
separately rechecked on www**. The canonical security.txt endpoint/contents were
verified in the supplied evidence and match the repository. These are supplied
observations, not curl checks newly performed by the agent.

The user subsequently confirmed Enforce HTTPS enabled on 2026-10-17; the initial
agent check had no working authenticated access. Account-level domain ownership
verification remains recommended and unconfirmed despite repository DNS validation
and certificate provisioning. The destination guard inherited from main was
investigated and corrected in the focused follow-up above; all deployment triggers
and validation gates remain. No DNS, Cloudflare setting or VPS service was changed.

The documentation/privacy-text candidate is based on that verified public main
in the isolated `chore/document-pages-migration` worktree. Local validation of
this candidate is separate from the production evidence above:

- `npm test`: **69/69 passed**; `npm run check`: **passed**.
- Existing full native Chromium suites at `/` and `/StemTape/`: **passed**, including
  PDF generation. Pages-specific assets/navigation/security.txt/meta-CSP checks passed.
- Focused privacy-dialog check: **passed** at 1440px/390px in light/dark themes,
  with no horizontal overflow; desktop light and mobile dark screenshots inspected.
- Local Markdown file/heading links, exact documented CSP/security.txt values,
  tracked-file/basic credential-pattern and publish-file gates, and diff checks:
  **passed**. The hygiene gate is not a full secret scan.
- Source comparison confirms the only application change is two privacy strings.
  At the initial documentation stage workflows were unchanged; the follow-up
  changes only the Pages URL guard and label. Triggers, deployment configs, version,
  state/import/export/print logic and CHANGELOG.md remain unchanged. Docker/VPS support and prior release records remain.

No new container, physical-print, screen-reader or exhaustive device checks were
run for this documentation/text update. No independent automated production test,
commit, push, merge, deployment, DNS/Cloudflare modification or VPS shutdown was
performed. Unrelated README work and existing backups remain in place.


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
