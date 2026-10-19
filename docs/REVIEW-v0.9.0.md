# v0.9.0 — cue icon colours and printable grids

Final user-reported manual preview acceptance: **2026-10-19**, including the
Bar/Bottle/Gel orientations upright at 0°. Physical printing
is unverified and, at the user's explicit request, is not a release gate for this
candidate. No deployment is claimed. Prepared in an isolated `review/v0.9.0` worktree from public HTTPS main
`76ccab4be602743c492c92330fac9151da1ee2ca`, the v0.8.0 tag target and merge of the
accepted v0.8.0 work. Repository verification is not a production health check.

## Primary icon colours

Open the existing cue-icon button. A labelled Icon colour fieldset offers fixed,
visible names with aria-pressed selection. Selecting a colour completes one action
and returns focus to that row's icon button. Escape/cancel changes nothing; a no-op
choice does not save or add history. The table gets no extra control/column.

| Stored ID | Display | Fixed sRGB |
| --- | --- | --- |
| default | Default / monochrome | Inherited screen colour; #111 in the sheet |
| blue | Blue | #2676c9 |
| orange | Orange | #b96a13 |
| green | Green | #278548 |
| red | Red | #c54040 |
| purple | Purple | #8b57b5 |

Colour is optional `row.iconColour`, independently in both cue lists. It travels
with stable row identity through automatic/explicit sorting, manual reordering,
delete/restore and ordinary cell edits. Changing the icon preserves it. None hides
the primary icon without deleting colour; choosing another icon reveals it again.
Default remains absent for new/legacy rows and inherits the existing theme-aware
editor appearance. Banana now uses the same monochrome artwork and button
surface as every other cue; its former yellow treatment is removed. No new
coloured background.

Each SVG was inspected individually. `icon-fills.js` supplies audited interior
layers beneath the original detail strokes for explicit palette selections. Filled
artwork uses the selected palette value with a fixed #202426 outline; default
continues to use monochrome outlines. Open detail strokes are never
blanket-filled or implicitly closed. The same layers render in picker, editor,
preview and print. Cue IDs, sizes and original outline paths stay. The final
orientation adjustment sets Bar, Bottle and Gel upright at 0°, removing their
artwork rotations from fill/detail layers together, per the final user correction. No
compensating groups or changes to other artwork/padding.

| Artwork | Filled region / preserved transparent detail |
| --- | --- |
| Banana | Enclosed fruit/peel body; open peel stroke stays visible above it. |
| Bidon / bottle | Neck, cap and bottle body; final orientation is upright, with +45° removed. |
| Bar | Upper bar, lower wrapper and folded flap; face stays dark; final orientation upright at 0°. |
| Gel | Packet silhouette; tear/top and bottom details remain outlined; final orientation upright at 0°. |
| Smile | Face circle, with dark eyes and mouth. |
| Climb | Mountain silhouette; original peaks unchanged. |
| Finish | Flag cloth only; pole remains a stroke. |
| Coffee | Cup body only; handle hole and steam remain transparent/open. |
| Caution | Triangle interior, with dark exclamation mark. |
| Cobbles | Individual stones only; gaps and open road edges remain unfilled. |
| Rice cake | Rounded body, with dark scoring/texture details. |
| Softdrink / can | Body and top ellipse, with dark rim/band details. |
| Neutral zone | Flag cloth, with dark N and pole. |
| Litter zone | Bin body, with dark slots; lid/handle stay open. |
| Feed zone | **Stroke-only exception:** open fork/knife artwork has no useful enclosed body. |

Custom symbol/text columns stay outside this feature. Names, shapes and cue text
remain useful without colour; no automatic water/drink meaning is assigned to a
hue. Riders choose their own convention.

## Shared grid geometry

The base renderer always drew row separators; it had no saved row-line control.
The new Appearance → Grid selector provides None / Row lines / Full grid. Absent
`layout.grid` keeps Row lines, preserving the current default/geometry. Optional
legacy boolean `layout.lines` maps true to rows, false to none; explicit grid wins.
Validation retains these optional fields without inflating old exact-budget state.

None removes all separators including the header rule. Row lines retains the old
header/body rules. Full grid uses one SVG path, drawing each horizontal boundary
and each visible column edge once, with a restrained 0.15 mm #777 stroke. Header
off means no header row/cells. Visible Note and custom columns follow current order
and widths; hidden columns create no dividers. Icons stay inside their host cell,
not a new printed icon column. No separate grid colour/weight controls.

Outer sides/top are inset half a stroke into the padded table allocation. Full-grid
content starts 0.15 mm lower; bottom ink reserves another 0.075 mm in the fit and
footer calculations. Horizontal cell padding is a shared **0.8 mm per side**, inside existing column
widths in every grid mode, replacing (not adding to) the former mixed offsets:
icons at the edge, text 0.5 mm from the left, right-aligned text 0.8 mm from the
right, and a separate 1.5 mm wrapping allowance. Icons now start at the padded
edge; wrapping subtracts 1.6 mm plus the existing icon/text reservation. Headers,
numbers, Note and custom columns use the same inset; left/right/center alignment
is preserved. This improves border clearance without grid-toggle shifts. A 1 mm
prototype wrapped the default narrow sheet's km header; 0.8 mm preserves it.
Row heights otherwise retain the existing wrapping/spacing.
No sheet dimension, font or column width is silently changed. Overflow remains
visible and blocks printing. Footer stays outside the cell grid, inside its
existing physical allocation. Preview and print use the exact same SVG; rotation
0/90/180/270, cut marks, paper dimensions and 50 mm scale remain unchanged.

## Data, history, recovery and compatibility

- Schema/key remain **v1 / stemtape.v1**. Optional colour and grid IDs are strict
  allowlists, never interpolated as CSS/HTML. Invalid values reject validation or
  import with a useful message; protected originals remain intact. No styling is
  silently normalized away. No runtime dependencies or new network permissions.
- Existing bounded per-plan history captures one colour choice or grid choice as
  one action; no-op/open/cancel adds none. Both settings survive reload, duplication,
  complete JSON restore, new personal presets, identity-based update and the one
  previous preset revision. Preset operations remain outside plan history.
- Existing invalid-draft guards block both controls. The normal validation/save
  path remains: over-budget choices are rejected and rolled back with feedback;
  quota failures can retain valid changed styling in memory marked Not saved,
  with working Undo/Redo and JSON recovery. No false Saved report.
- Coloured CSV exports add optional **`stemtape:column:["icon-colour",1]`** after
  icon, with one stable palette ID per row (including default rows and None icons).
  This is metadata, not a custom display column; cue/Note/distance values retain
  their positions and roles. Old CSVs import as monochrome. Entirely monochrome
  exports omit it and keep the existing format. Grid is absent from CSV.
- The actual **v0.8.0** strict CSV parser rejects this new tuple. Its JSON validator
  drops colour/grid metadata when saving. Keep complete v0.9.0 JSON originals and
  test any rollback only on copies in an isolated profile. No claim of lossless
  older-version round trips. Earlier preset identity/recovery limitations remain.
- Existing print CSS already requests exact colour adjustment. Browser/printer
  settings, ink and greyscale printers can alter/omit colours; exact reproduction
  is not promised. Black text/white paper and monochrome defaults stay available.

## Review separation and changed files

Colour logic/data: `dist/icon-colours.js`, row validation and versioned CSV hunks
in `dist/core.js`, picker/editor/primary-SVG colour hunks in `dist/app.js`, palette
styles and `tests/colours.test.mjs` and `tests/icon-artwork.test.mjs`. `dist/icon-fills.js` contains the separately
reviewable interior layers; `dist/icons.js` changes only the three approved
transforms, preserving all outline path data.

Grid logic/data: `dist/grid.js`, optional layout validation in `dist/core.js`, the
Appearance selector in `dist/index.html`, shared layout/boundary rendering and
selector handler in `dist/app.js`, and `tests/grid.test.mjs`.

Integration/validation: `tests/v090-browser.mjs`, `tests/v090-refinements.mjs`, `tests/v090-zoom.mjs`, `tests/v090-orientation.mjs`,
`tests/browser.mjs`, `tests/v062-browser.mjs` (identity-matrix bounds support), `tests/v060-browser.mjs` (padded icon-position expectations), `package.json`; version-only image examples/CI/smoke updates
in `.env.example`, `deploy/.env.vps.example`, `docker-compose.example.yaml`,
`.github/workflows/checks.yml`, `scripts/container-smoke.sh`, plus the UI version.
Documentation: README, changelog, upgrade, architecture, roadmap, local development,
validation and this review. Shared integration hunks are identified above so the
two features remain separately reviewable with separate artwork/palette and grid-model commits, followed by shared app/CSV integration and release documentation.

The earlier fill/Banana/padding preview is accepted by the user (2026-10-19);
the final upright three-icon orientations are also accepted (2026-10-19). Strict CSP, Pages workflow, Docker production configuration, icon IDs, naming,
preset identities/recovery, library/storage protections and state history limits
remain intact. Unrelated README edits, backups and older worktrees are preserved.
Screenshots/PDFs and tooling stay in ignored artifacts or temporary directories.

## Review checklist — user acceptance recorded 2026-10-19

1. At http://127.0.0.1:18080/, assign Blue/Orange to two Bidon cues; change an icon,
   choose None, restore it, sort/reorder and use Undo/Redo. Confirm row colours stay.
2. Try each palette choice in both themes and narrow/mobile/200% zoom layouts;
   verify names, selected state, keyboard focus and no clipping. Check every filled
   symbol, transparent gaps, the Feed zone stroke exception and monochrome Banana.
3. Toggle all three grids with headers on/off, hidden/reordered Note/custom columns,
   narrow/wide sheets, rotations and footer. Check overflow blocks printing.
4. Reload/duplicate; save, update and recover a personal preset; JSON round-trip.
   Export/import coloured CSV in v0.9.0 and check values. Retain original backups.
5. Recommended, non-blocking physical check: print at **Scale 100% / Actual size**,
   including a colour and a greyscale sample.
   Use a ruler on the 50 mm scale; inspect icon detail, borders, dimensions, footer
   and cut marks. PDF/browser checks do not establish physical-printer behavior.

Executed checks and remaining gates: [VALIDATION.md](VALIDATION.md).

Final user acceptance includes upright Bar/Gel/Bottle at 0°. The checklist remains
a repeatable review guide, not a claim that every listed manual/backup/physical
step was independently observed. Physical printing remains unverified and does not
block this release at the user's request; PDF checks do not establish a print pass.
