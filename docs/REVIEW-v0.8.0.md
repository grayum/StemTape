# v0.8.0 — personal preset revisions and supplied example

Review candidate accepted by the user after manual preview testing on 2026-10-18,
including final button layout and Tour of Flanders. This is user-reported testing,
not production verification, physical printing or exhaustive device/accessibility
coverage. Acceptance does not authorize deployment. Prepared in an isolated
`review/v0.8.0` worktree from verified public main
`9203a0872465aafb3dd963ae310eddfea0111063`. The annotated v0.7.0 tag object
`50c5212281f0606b07f15271c903fd582c56acd5` points to that main commit, which contains
v0.7.0 implementation `79d7a53271182f5d8ddac18b13ea1c8fb69b2679`.
Tag/main inspection does not independently verify production v0.7.0.

## Final layout follow-up (2026-10-18)

Final manual acceptance was reported by the user on **2026-10-18**. The lower action row now keeps
Undo/Redo together on the left and Save as new preset… / Update preset… together
on the right, using flexible free space between the groups. At narrow widths the
groups wrap in DOM order with a 12px row gap; preset buttons can wrap within their
right-aligned group with a 6px gap. No fixed positioning or CSS reordering.
Columns now precedes Sort in both DOM/tab and visual order. Accessible group
labels, existing button names, handlers, disabled states and focus rules remain.
This follow-up changes only HTML/CSS layout plus browser assertions and docs.

Native Chromium covers desktop/mobile in both themes and actual 200% zoom;
the user subsequently accepted the refreshed preview. See the latest validation entry.

## User-found name collision issue (2026-10-18)

The user found that Save as new preset accepted duplicate display names during
manual v0.8.0 testing. This is an issue report, **not a completed manual pass**;
acceptance was pending at that point and is now superseded by the final acceptance above.

New saves and explicit renames now compare trimmed names case-insensitively
against all user presets and built-in display names (Nutrition plan, Route notes,
Custom, Tour of Flanders). Chosen capitalization is preserved; surrounding
whitespace is trimmed on accepted new names/renames. Renames exclude their own
identity. A rejected collision keeps the dialog/input, focuses the name field,
sets aria-invalid and announces a described inline alert:
“A preset with this name already exists. Choose a different name.”
No preset, recovery revision, association, history or storage write changes.
Matching a name never offers an overwrite target; Update uses only association ID.

Existing same-name records, including legacy records and complete JSON imports,
remain valid and unchanged. Content updates with the exact existing name are
allowed even for duplicates; an explicit rename must pass collision validation.
Recovery swaps are intentionally not new-name validation: they preserve a
previously accepted name even if it now duplicates another record. Nothing is
silently merged, deleted or renamed. The selector, Update tooltip and overwrite,
recovery/delete confirmations show **personal preset 1**, **personal preset 2**,
etc. These are library-position display labels, may shift after deletion, and
never replace stable stored identities. IDs themselves are not displayed.

## Event name versus Preset name

These are separate namespaces: an event and a preset may share a name. Event
names must be unique among saved ride plans on explicit rename; preset names
among personal and built-in presets. Both compare trimmed lowercase names,
preserve capitalization for display, and exclude the renamed item's stable ID.
The Event name helper reads **“Names this ride plan, not its preset.”** A separate
Preset name field appears in Save as new preset and Rename preset dialogs.

The association line shows **Based on preset: [name]**, with a personal-preset
ordinal to distinguish duplicates, or **Custom plan** without a personal link.
Bundled template type is not reliable provenance for an edited plan; it is not
used to infer a personal association. No name match links records or overwrites.

Event collisions preserve the entered draft and last accepted name, with described
inline role=alert feedback: “A ride plan with this event name already exists.
Choose another name.” Existing invalid-draft guards block switching, printing,
preset operations and history until corrected or explicitly cancelled with Escape.
Valid edits follow the existing save path: a quota failure can leave an accepted
name in memory marked Not saved; byte-budget rejection retains the invalid draft.

New plans, duplicates, preset-created plans and CSV/spreadsheet imports suggest
checked unique event names by adding (2), (3), etc., scanning all saved plans and
respecting the 80-character limit. The result is immediately visible and editable.
Duplicates retain association, not history. Complete JSON restore replaces the
library only after confirmation/successful write and preserves legacy duplicate
names exactly. Selectors add **ride plan N** only to colliding event names, never
raw IDs; labels can shift after deletion. Nothing is silently merged or renamed.
An explicit rename of a legacy duplicate must choose a unique name.

Undo/Redo validates a changed historical event name before applying anything.
If another plan now uses it, the action announces the conflict, keeps current
state and both history stacks untouched, and can be retried after renaming that
other plan. It neither silently suffixes the historical name nor discards the
blocked action. Legacy duplicates remain editable/undoable for non-name changes.

## Personal preset rules

- **Save as new preset** creates a new personal identity only after its name
  passes collision validation, and associates the current plan with it. Bundled examples can only be
  copied; their records are never placed in or overwritten by personal storage.
- **Update preset…** appears only for a valid associated personal identity.
  The confirmation identifies the target and preserves its preset name. It captures
  event name; both mode cue lists, manual order, icons and all cells including hidden
  Note; column labels/types/widths/order/visibility/alignment/bold; mode, units,
  total/remaining distance; sheet dimensions, font, padding, gap, rotation, header,
  footer, paper and copies. Theme, bike preferences and history are excluded.
  Subsequent plans use the captured event name, suffixed if needed. Cancel/Escape
  changes nothing. **Rename preset…** is a separate dialog/action: it preserves
  the stored template and every existing event name, checks uniqueness excluding
  its own ID, and retains the previous version. Event renames never rename presets.
  Existing plans remain untouched by updates. Duplication retains association
  with empty history.
- One previous `{name,event}` revision is retained per personal preset. **Restore
  previous version** in its Update dialog confirms and swaps current/previous
  versions; this lets a mistaken recovery itself be reversed. No revision chains.
  A no-op update retains the existing recovery version and performs no write.
- **Delete personal preset** in that dialog confirms deletion of the template and
  recovery revision, keeping and unlinking every associated plan. To manage a
  template with no associated open plan, select it to create a plan first.
- Both revisions and any association changes are validated on an isolated
  candidate against the same whole-library **2,000,000 UTF-8 byte** budget, then
  written in one existing atomic localStorage operation. The success boundary is
  the actual write. Quota, conflict, protected-recovery or validation failure
  leaves prior plans, associations, histories and both revisions unchanged;
  feedback reports failure and does not announce success. Export JSON for safety.
  This intentionally differs from ordinary plan edits/Undo, which may remain
  valid but unsaved in memory on storage failure.
- Preset operations remain outside plan Undo/Redo. Successful association changes
  reset the working snapshot baseline without adding history; Undo/Redo explicitly
  preserves the current association. Old snapshots cannot undo linking/deletion.
  Existing per-plan history limits, grouping and storage-failure rules are unchanged.
- Invalid drafts block preset operations. Accepted field changes finish through
  existing blur/sort/save handlers before opening the dialog; no stale template
  is silently saved. A failed Save/Update transaction leaves its dialog available; recovery/deletion
  can be retried by reopening Update.

## Data and compatibility

Schema version **1** and key **stemtape.v1** remain. Optional personal `id`, event
`presetId`, and personal `previous` fields are strictly reconstructed. Legacy
ID-less templates load without added bytes; a successful use assigns their ID
atomically with creating the new associated plan. IDs are never derived from names.
Duplicate, empty, unsafe and dangling IDs/references reject a backup as a whole.
Templates/recovery cannot themselves contain association references. Unknown
fields are discarded as before. Whole JSON restore replaces (does not merge)
the library: an imported identity cannot bind to an unrelated local template.
A missing referenced template rejects import rather than guessing or relinking.
Failed/cancelled restore retains the old library/history. Successful restore
clears history; new CSV/duplicate/preset-created plans start empty.

Complete JSON preserves identities, links, one previous revision, hidden content,
both modes and layout within the shared budget. CSV remains cue-only and carries
no preset association or recovery revision. Keep JSON before any rollback.
Older v0.7.0 validation discards optional preset IDs/links/recovery on saving;
it rejects the new `flanders` built-in key. Sharing v1 therefore does **not** make
a round trip through an older app lossless. Test older apps only against copies
in isolated profiles, retain original exports, and never reset protected storage
to bypass an incompatible-version warning. No automatic downgrade is supplied.

## Tour of Flanders

The bundled distance/km example derives from the supplied
`Tour-of-Flanders-distance.csv`; an exact BOM-bearing fixture is retained under
`tests/fixtures/` for fidelity checks. It contains 19 cues from 20–272 km, Kwaremont
at 135/217/255 km and Finish at 272 km. All symbol keys, blank cells, text, row order
and role-marked **Location** (visible Note) / **Fuel** columns are retained. The CSV
contains no row UUIDs; each created plan receives fresh independent row/column IDs.
No edition/year or official-current-route verification is asserted. All runtime
route data is embedded in `dist/presets.js`; the `/tmp` source is not needed to
run or deploy the application. The committed fixture is used only by tests.

Uses existing built-in plan creation; no default records are injected into saved
state on startup/upgrades. Repeated selection creates independent editable plans,
never duplicates personal templates or overwrites earlier plans. Default physical
sheet/layout settings stay unchanged (remembered bike settings apply as usual).
Nineteen cues can overflow the default strip: adjust dimensions/spacing/columns;
printing stays blocked until content fits. No silent resizing or clipping.

## Manual review checklist (user-reported final acceptance, 2026-10-18)

1. Check Event name versus Preset name: the same name is allowed across namespaces;
   exact/case/whitespace collisions within each are rejected. Check the helper,
   association, independent renames, captured event name and unique suggestions.
   Create a name conflict for Undo, verify history remains, free the name and retry.
   Try exact/case/whitespace duplicate preset names and built-in names. Verify inline
   validation preserves input/state. Use an existing duplicate-name backup to
   check numbered targets and independent Update/recovery; new duplicate names
   must be rejected. Cancel then confirm an update and check a newly created plan.
2. Restore the previous template, then restore again. Delete a personal template
   and check associated plans survive; exercise Undo/Redo before and after linking.
3. Try invalid cell text, reload, JSON backup/restore and a CSV copy. Confirm the
   documented session/recovery and association boundaries.
4. Select Tour of Flanders twice; check 19 cues, visible Location, three Kwaremont
   entries and Finish. Adjust layout before checking preview/PDF; verify printed
   50 mm scale physically before riding.
5. Check left history/right preset groups, responsive wrapping, Columns then Sort,
   tab/focus and dialogs on mobile, both themes and
   actual 200% browser zoom. Laptop preview URL remains http://127.0.0.1:18080/.

Executed checks and remaining release gates are recorded in [VALIDATION.md](VALIDATION.md).
No icon colours or full grids, application network dependencies, CSP changes,
Pages trigger changes or infrastructure changes are included.

## Changed files and review separation

Preset behavior: `dist/preset-actions.js`, `dist/core.js` validation,
`dist/app.js`, `dist/index.html`, `dist/styles.css`, `tests/presets.test.mjs`,
`tests/v080-browser.mjs`, `tests/v080-zoom.mjs`. Naming follow-up: `dist/names.js`,
`tests/names.test.mjs`, `tests/naming-browser.mjs` and related app/help/test hunks.

Supplied example: `dist/presets.js`, the separate Flanders creation/validation
hunks in `dist/core.js`, its selector/help hunks in `dist/app.js`, and
`tests/fixtures/Tour-of-Flanders-distance.csv`, `tests/flanders.test.mjs` and its
byte-preserving `.gitattributes` rule. Fidelity tests are distinct from
preset-operation tests, allowing separate review in a dedicated built-in data/model/fidelity commit.

Integration/metadata: `package.json`, `.env.example`, `deploy/.env.vps.example`,
`docker-compose.example.yaml`, `.github/workflows/checks.yml`,
`scripts/container-smoke.sh`, `tests/browser.mjs`, `tests/v061-browser.mjs`,
`tests/v070-browser.mjs`. Old test selectors use the new button text and explicit
button elements to avoid matching body[data-tab]. Pages workflow is untouched.

Documentation: `README.md`, `CHANGELOG.md`, `UPGRADE.md`, `docs/ARCHITECTURE.md`,
`docs/ROADMAP.md`, `docs/LOCAL-DEVELOPMENT.md`, `docs/VALIDATION.md`, this review.
Unrelated edits in the original checkout, local AGENTS instructions, backups and
worktrees are outside this candidate. Screenshots/PDFs/browser binaries remain
ignored local evidence, not release files.
