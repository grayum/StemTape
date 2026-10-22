# v0.10.0 accepted review

## Base and scope

Based on public HTTPS main / release tag `v0.9.0`, both
`0a0dc8c73cf74a270610f3c7644413f6c998d5f2`, containing the reviewed v0.9.0 commits.
The user confirms v0.9.0 is deployed and working; no independent production test
is claimed. Work is isolated on `review/v0.10.0` in a Linux ARM64 Docker Sandbox.
No production configuration, CSP or Pages workflow changes.

## Alignment

The model already stored explicit left/center/right alignment. Those choices stay
intact: there is no reliable way to distinguish a chosen value from an old default.
New columns default to `auto`; absent values also resolve to Auto. Auto means right
for distance/time/numbers and left for text/symbols. The fixed position column has
the same configuration as other data columns; row-action controls do not.

Fixed allowlisted IDs `auto`, `left`, `center`, `right` are exposed as Auto, Left,
Centre, Right. Unknown imported values (including null) reject validation rather
than entering CSS or silently losing layout. The same column objects/IDs carry
alignment through reorder, hide/show, renaming, type changes, templates/recovery,
JSON, duplication and Undo/Redo. No new storage key/schema version is needed.

Shared preview/print SVG wraps with the existing width/font budget, then positions
the complete measured icon/text block inside the existing 0.8 mm horizontal cell
insets. Multiline text retains the selected anchor inside that block. Headers use
the same alignment. Icon size, rotation, colour, internal gap, grid geometry,
footer allocation and configured dimensions stay unchanged; fitting can reduce
actual sheet width as described below. Editor inputs
retain their existing behavior. Firefox ink extents can differ slightly from
canvas advances; browser geometry assertions allow 0.15 mm ink overhang inside
the padding, with no sheet or border enlargement.

## Duplicate row

The existing row-action icon group gains the audited copy icon, accessible name
“Duplicate row N” and matching tooltip. DOM order is Up, Down, Duplicate, Delete;
the existing responsive stack keeps the mobile table compact horizontally.

The pure row helper copies the stored row, including hidden Note/custom values,
blanks and primary-icon colour, assigns a fresh ID and inserts directly after the
source ID in the active mode. No position offset or sort. A valid pending field
edit completes first (including position-edit sorting); the handler then resolves
the source by stable ID. Invalid drafts remain visible and block copying. No
transient DOM or validation state enters the model.

A single existing commit validates the whole-library 2,000,000-byte UTF-8 budget
and records one “duplicate row” history action. The 200-row mode limit is checked
before mutation. Budget rejection rolls back without history or a partial copy;
failed localStorage writes retain valid in-memory data and history with honest
Not saved status and JSON export. The new position input gains focus and nearest
scrolling; an existing polite live region announces the result. Undo removes the
copy, Redo restores its exact ID/content. Keyboard history keeps row focus by ID
or moves to its predecessor when removed; toolbar history keeps toolbar focus.

## Icon-only display and plan-wide fitting

Only the stable primary cue column exposes **Cue display: Icon + text / Icon only**.
Editor and JSON/CSV text remain unchanged; None becomes a blank preview/print
cell. Names never determine the role. There is no cue-only automatic-width UI.

**Fit width to content** in Sheet size defaults off, retaining full configured
width and stored relative column shares. On uses natural full-line displayed
contents, formatted values, headings, icon ink, padding/grid and footer, up to
configured width. Spare width is not redistributed. If columns exceed the
maximum, existing shares/wrapping apply. Long headings remain visible and can
prevent compact sizing; explicit line breaks remain. Fonts and icon sizes never
shrink. Effective physical width is shown with the maximum; switching off restores
full width/shares. Length is fixed, including rotations; see the
[rotation-aware sizing algorithm](ARCHITECTURE.md#cue-presentation-and-plan-wide-content-fit-010-follow-up).

Optional strict boolean `layout.fitWidth` is preserved by JSON, plan duplication,
presets/recovery and one-action Undo/Redo. CSV omits layout but keeps cue text and
colours. Earlier development `column.widthMode` metadata is discarded on validation,
including templates/recovery, without enabling fit or changing stored widths/data.
Unknown display/fit values reject rather than entering CSS. Existing recovery,
invalid-draft, byte-budget and truthful storage-failure behaviour are retained.
See [rollback limitations](../UPGRADE.md).

On **2026-10-22** the user accepted the preceding implementation and reported an
actual physical print with manually checked measurements. This is user-reported
evidence, not broader device/accessibility coverage. That earlier physical print did not validate the later fit option. Separately,
the user accepts the final implementation including fitting and reports passing
manual review and physical print testing on 2026-10-22. No new measurement values
or exhaustive browser/device/accessibility coverage are inferred.

## Compatibility and review separation

Alignment lives in existing column records, not CSV. JSON and personal presets,
including their recovery revision, preserve it. Duplicated rows export as ordinary
rows with the existing v0.9.0 optional colour metadata. Old CSVs remain supported.

**Tested rollback limit:** the actual v0.9.0 validator rejects a new Auto column
with “Invalid alignment.” It accepts the same plan after explicit left/right
values are selected, but its old icon/text alignment rendering differs. Preserve
pre-upgrade JSON and current backups; test rollback in a separate profile/origin.
Do not assume an older app can safely open the current library. See [upgrade
instructions](../UPGRADE.md).

Alignment implementation/tests are in `alignment.js` / `alignment.test.mjs`;
duplication in `row-actions.js` / `duplicate-row.test.mjs`. Their app integration
hunks remain separate for review; shared browser and release documentation cover
both. Feature model/helpers are committed separately; shared UI/rendering integration,
content-fit/icon-only behaviour and release documentation complete the final commit.
No push, merge, tag or deployment is part of this handoff.

## Validation and remaining review

See the dated [validation record](VALIDATION.md) for exact completed checks.
Native browser tooling stays outside `dist/` and the production container.
The browser runner uses pinned Playwright **1.62.1**; focused Firefox can be run:

```sh
STEMTAPE_BROWSER=firefox BASE_URL=http://127.0.0.1:8080/ node tests/v010-native.mjs
```

Install the matching Firefox using that version's `playwright install firefox`
and `playwright install-deps firefox` for development only. There is no package
upgrade or runtime dependency. `PLAYWRIGHT_MODULE` may point to an existing local
installation. Complete Chromium regression runs include this focused suite;
`tests/v010-zoom.mjs` verifies actual browser zoom using a temporary local-only
extension, not CSS scaling.

Firefox manual checklist at the established preview URL:

1. In the cue column, try Icon only plus Fit width to content, a long heading and None;
   confirm text remains in the editor/CSV and returns with Icon + text.
2. Set each alignment on position, Fuel, Note and a custom column; compare headers,
   icons/text and printed preview. Reorder and hide/re-enable Note.
3. Duplicate a coloured cue containing hidden text; check unchanged position,
   immediate placement, focused new input, Undo and Redo.
4. Edit position then click Duplicate; verify the committed value is copied.
   Try an invalid draft: copying must wait for correction or explicit cancellation.
5. Check both themes, narrow viewport and 200% zoom; keyboard through row actions
   and column controls. Save/reload and test a JSON/preset round trip.
6. Inspect Firefox print preview at Scale 100% / Actual size. For the new fitted output, check cut marks, actual sheet width/length and the
   50 mm calibration line with a ruler at Scale 100% / Actual size.

Final user-reported acceptance dated **2026-10-22** includes fitting and passing
manual review/physical print testing. This is separate from the earlier measured
print; no additional measurement values or exhaustive device/browser/screen-reader
coverage are inferred. Chromium PDF measurements and Firefox checks remain
independent evidence. The branch is finalized locally for bundle handoff, not
pushed, merged, tagged or deployed.

## Changed-file inventory

- Alignment/model/rendering: `dist/alignment.js`, `dist/cue-display.js`, `dist/core.js`, alignment/display hunks
  in `dist/app.js`.
- Row duplication/focus: `dist/row-actions.js`, separate row/history hunks in
  `dist/app.js`.
- Version/help/templates: `dist/index.html`, `package.json`, `.env.example`,
  `deploy/.env.vps.example`, `docker-compose.example.yaml`,
  `scripts/container-smoke.sh`.
- Documentation: `README.md`, `CHANGELOG.md`, `UPGRADE.md`,
  `docs/ARCHITECTURE.md`, `docs/LOCAL-DEVELOPMENT.md`, `docs/VALIDATION.md`,
  `docs/REVIEW-v0.10.0.md`.
- Tests: `tests/alignment.test.mjs`, `tests/duplicate-row.test.mjs`,
  `tests/v010-browser.mjs`, `tests/v010-native.mjs`, `tests/v010-zoom.mjs`,
  `tests/cue-display.test.mjs`, `tests/cue-display-browser.mjs`,
  `tests/cue-display-native.mjs`, `tests/v010-rollback.mjs`,
  `tests/browser.mjs`, `tests/v041-browser.mjs`, `tests/v060-browser.mjs`,
  `tests/v090-refinements.mjs`.
