# v0.6.0 review

Verified base: `/tmp/stemtape-v0.6.0-base.bundle`, origin/main `a6db4443a9289c02eb5c7be2f0c4c4aed03c0202`. Work is isolated on review/v0.6.0 in `/tmp/stemtape-v060-worktree`. The base contains merged v0.5.0, including its mobile keyboard regression fix. The owner confirmed v0.5.0 is deployed and working, satisfying the prior roadmap gate. No independent production check or v0.6.0 deployment is claimed.

The unrelated README edits and `/tmp/stemtape-v050-readme-backup-a7qmt0p5` remain in the original checkout. Bundle-only private-repository handoffs are recorded in local agent instructions outside the release; AGENTS.md is not changed here. The owner authorized reviewed local commits and a bundle handoff on 2026-10-08; no push, merge, tag or production changes are authorized.

## 1. Column ordering

Review `dist/columns.js`, `dist/column-controls.js` and `tests/column-order.test.mjs` first, then shared integration in app.js/core.js, scoped styles and the ordering phases in v060-browser.mjs. Existing column-array order is authoritative, with distance/time fixed first. Values, widths and labels follow stable IDs. Optional cueColumnId captures the legacy icon host before a move. No cue-row ordering is changed.

The compact Columns list supports mouse/touch pointer capture, accessible left/right buttons and arrow/Home/End keyboard movement. Native boundary buttons are disabled; focus falls back to the same column handle when a movement button becomes disabled. Visible/live feedback reports position, including in the modal details dialog. A gesture moves only DOM list items until drop; cancellation/lost capture/Escape or a full mode/event render abandons it without writing state. Invalid drafts block mutations through the existing guard. Byte rejection rolls back; quota failures leave memory changes clearly unsaved and the previous storage untouched.

## 2. Optional Note

Review `dist/note-column.js` and `tests/note-column.test.mjs`, then noteColumnId validation, Show note column integration, managed controls and the Note/browser/CSV phases. Note uses the existing text-column/cell model and visibility flag. It is absent/off by default, and first enable inserts a distinct Note after distance/time with width share 25 and empty cells in both modes. It never guesses identity from a Note/Location label. Hide/restore preserves label, content, width, ID and position, including in JSON, presets and duplication.

Custom plans use the same toggle. Managed Note can be renamed, moved and styled through Column details; its type/removal/generic visibility controls are disabled to avoid conflicting with the explicit toggle or deleting retained content. At eight columns, creation is unavailable with visible guidance; an existing hidden Note can still be restored. Existing width shares, fonts and physical dimensions remain unchanged; narrow layouts may overflow and block printing.

Shared CSV changes export visible data in order, plus mandatory position/icon fields. The existing reserved tuple accepts an optional fourth cue/note role, so renamed/imported Notes do not duplicate and icons keep their association. Older CSV/three-field tuples remain importable; malformed/duplicate roles reject without changing current state. Literal reserved labels are escaped as text metadata. If no non-Note data remains visible, import creates an empty Fuel column to satisfy the existing model; it cannot recover omitted hidden data. Complete JSON is required for hidden content, exact types/layout and lossless backups. Older-version limitations are in UPGRADE.md.

`makeSheet` only changes its icon-host comparison to a stable ID. Footer measurement, dimensions, rotation transforms and preparePrint are retained. Unchanged-plan synthetic geometry matches the base; this is not physical-print evidence.

## Manual checklist — individual coverage unconfirmed for v0.6.0

The owner reports local-preview testing with no issues on 2026-10-08. Individual checklist coverage and physical printing were not specified. These items remain to be explicitly confirmed; automated browser execution remains unexecuted locally.

1. Load an existing plan and confirm its order, row order, labels, units, footer and symbols remain unchanged. In light/dark, keyboard-open Layout & print settings; on mobile select Preview first. Check the list and focus at 200% zoom.
2. Use left/right buttons and handle arrows/Home/End. The primary stays fixed, boundaries disable correctly, focus follows the column and position is announced. Drag with mouse and physical touch; cancel with Escape/pointer cancellation. Reload and verify order/data persistence.
3. Enable Note, enter text/emojis/markup-like text and rename it Location. Move it, hide it, switch modes, reload and restore it: no content loss or duplicate column. Repeat in Custom and with an unrelated user column named Note. Exercise the eight-column limit and hidden-only layouts.
4. While a time, position, footer, label or width draft is invalid, try toggling/moving/dragging columns. Drafts must remain until correction or cancellation. Test quota/blocked storage, exact-byte rejection and recovery original export; these actions must not claim a successful save or overwrite protected data.
5. Duplicate and JSON-backup/restore both modes/presets, including a hidden Note. Export/import visible CSV after movement and confirm labels, distance units, values and icon host align. Hidden data/layout must use JSON, not CSV.
6. Compare preview/PDF on narrow stem and wider top-tube sheets, all rotations, footer off/on, headers, copies and A4/Letter. Adding columns must not change dimensions or shrink fonts. Overflow must block Print. Physically print at 100%/Actual size and measure the sheet and 50 mm calibration line.

See VALIDATION.md for executed checks and remaining release gates. Do not treat prior v0.5.0 manual/live results as v0.6.0 validation.
