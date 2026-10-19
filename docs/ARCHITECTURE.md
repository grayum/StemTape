# Architecture and data

`dist/` is the complete browser application; deploy only this directory. There is no framework or runtime package installation. `index.html` defines accessible controls, `app.js` owns the DOM, dialogs, local state, SVG layout and printing. `core.js` owns pure validation/conversion/CSV operations. `presets.js` holds the project owner's published example cues. `icons.js` contains a vendored Lucide subset with the upstream license and original StemTape outline symbols (bar, bottle, gel, cobbles, rice cake, can, neutral zone). Assets contain fonts and independently editable vector brand files.

The current hosted service is GitHub Pages behind Cloudflare at https://stemtape.cc/.
Cloudflare supplies the documented response-header/cache policies; Pages does not
execute Nginx/Caddy configuration. Docker/VPS remains optional self-hosting. See
[hosting operations and privacy](GITHUB-PAGES.md). The hostname stayed the same
during migration, preserving browser origin; plans remain client-side.

State in `stemtape.v1`: schema version, theme, active event ID, events, personal presets, optional remembered bike dimensions. Event: ID/name, preset, mode, distance/dimension units, total metres, remaining-distance switch, columns, independent distance/time row lists, physical layout. Values in distance columns are metres; primary time values are integer elapsed minutes. Unit changes never rewrite canonical data. Display rounding occurs only in UI/CSV; JSON retains precision.

Column: ID/label/type/relative width/visibility/alignment/bold. First column is fixed distance-or-time. Text/symbol columns accept arbitrary Unicode text (160 chars); number columns accept nonnegative finite values. Typed edits are validated. Reordering/removing columns preserves stable IDs; destructive changes require confirmation. Icons are stored separately per row. Legacy state uses its second data column for printed icons; optional cueColumnId preserves that association when columns move or Note is inserted. Hidden data columns remain stored but are hidden in the editor, print and CSV; the mandatory position/icon editor and CSV fields remain available.

No numbered schema migration exists beyond v1; optional v0.8.0 preset metadata is assigned lazily on successful use. Future schema versions must migrate explicitly and preserve unreadable originals. CSV creates a new event; JSON restore requires explicit confirmation and offers a pre-restore backup. A shared serializer validates and compactly encodes the complete state, enforcing a 2,000,000-byte UTF-8 budget before writes or acceptance of edits. The identical encoding is exported as JSON. Imports enforce both file bytes and the reconstructed serialized-state budget. The budget includes both modes, all events, personal presets, bike dimensions and preferences. Rejected mutations roll back in place; invalid input stays visible until corrected or explicitly cancelled. Existing oversized/unreadable storage is never automatically replaced: fallback editing remains in memory and the original raw string can be exported before explicit reset/restore. Recovery exports are originals, not necessarily valid or importable complete backups. Failed localStorage writes are reported and current in-memory data remains exportable.

## Rendering
Preview and print use the exact same DOM-built SVG. Millimetres are the SVG coordinate unit; font points are converted by 25.4/72. Text wraps using the bundled font's canvas metrics. Geometry stays in explicit SVG attributes, not dynamic inline styles. Physical page size is updated using CSSOM in the trusted stylesheet. Font size is never automatically reduced. Overflow and narrow columns block the app print action. Each requested copy prints on its own A4/Letter page with cut marks and a 50 mm line.

Pasted emoji rendering depends on installed OS fonts. Bundled Lucide icons remain consistent. This version does not embed a full Unicode emoji set or claim universal glyph coverage. Preview and actual printed content must be checked by the rider. Browser Save as PDF is the PDF workflow; there is no server PDF renderer or separate custom-label PDF export yet.

## Presets
Project-owner templates: edit `BUILTIN_CUES` in `dist/presets.js`; each cue is `[kilometres, iconKey, text]`. Templates are copied at event creation; changing them never rewrites an existing saved plan. Personal templates include both cue modes and layout and travel in JSON backup. Nutrition example entries are illustrations, not recommendations.

## Branding
Lime #C5F82A; charcoal #202426; off-white #F6F7F1. SVG wordmarks are outlined from bundled DejaVu Sans for portable rendering; this is a vector interpretation of the selected generated concept, not an extracted proprietary font. Transparent light/dark logos, standalone symbols, banners, SVG/ICO favicons are in assets. Keep UI accents out of print content; only explicit per-cue palette selections
add artwork colour. The working name StemTape is not domain/trademark-cleared.

## Row reordering (0.2)

Pointer events on the leading grip support mouse, touch and pen; the handle reserves touch movement for dragging while the rest of the table remains scrollable. Live row movement commits by stable row ID at drop. Escape, pointer cancellation and lost capture cancel without changing stored data. Keyboard Arrow Up/Down and Home/End work on the handle; existing arrow buttons remain. No dimensions, wrapping or print geometry changed in 0.2. Schema stays at version 1 for backwards-compatible loading of 0.1 data. Backups using new symbols require 0.2 or later.

## Automatic ordering (0.3)

The first distance/time cell sorts the active list after a changed valid value loses focus or Enter is pressed. Ties are stable. Text/icon changes and loading existing data never sort. Manual movement is retained until another primary-position edit or explicit Sort. DOM rebuilding waits until the pointer action finishes; row actions resolve stable IDs so a blur-triggered sort cannot redirect a click to another cue.

Invalid drafts block actions that could discard them, including pointer/keyboard ordering and changes to event/mode/units. Escape or Cancel unaccepted edits explicitly restores accepted values. Row arrows remain focusable at boundaries with aria-disabled state, and resolve moves/focus by stable row ID. CSV distance metadata uses a reserved header prefix with a JSON tuple; reserved-prefix text labels are escaped with a text tuple. Unmarked bracketed units remain literal labels to avoid guessing legacy column types.

## Save status (0.4)

`save-status.js` owns the storage-success boundary, optional validated `savedAt` metadata and relative-age formatting. See [save-status behavior and compatibility](SAVE-STATUS.md). A single state write includes metadata only when it fits the existing byte budget; metadata never displaces plan data. Display timers update status nodes only. Recovery remains protected until an explicitly requested replacement is successfully written, and stale tabs are warned rather than silently replacing known newer data.

## v0.4.1 presentation and reporting

The saved timestamp uses an overlay tooltip with locale date/time and explicit timezone offset; hover, focus and tap expose the same accessible description. Unknown timestamps remain absent. Display ticks do not rebuild the editor or preview. Native disabled distance units are visually muted in Time mode, without changing stored units; extra distance columns still use the retained preference. New nutrition templates use Fuel; existing labels lack provenance and are preserved.

The static image includes the exact `/.well-known/security.txt` resource. Nginx allows that exact location with inherited security headers and UTF-8 text/plain; the general hidden-path denial remains. No reporting API or server-side plan handling is added.

## Footer and approved artwork (0.5)

Optional layout fields footerEnabled/footerText are absent in old state and default to off/empty without inflating legacy byte-budget records. Footer text is a validated single line, limited to 80 UTF-16 units; markup-like text/emojis use SVG textContent. Both mode lists share per-plan layout settings. Footer fields remain in JSON/personal presets/duplicates, while CSV keeps its cue-only format.

`footer.js` calculates measured ink/advance width and baseline/descent bounds in the existing millimetre coordinate system. makeSheet appends the centered line below the cue table inside its rotated content group only when enabled and nonempty. It uses the plan font, reserves 1 mm above it and reports width/length overflow. preparePrint still clones that shared SVG and adds the unchanged calibration/cut marks. No sheet size, font shrinking or unrelated rendering redesign is introduced.

Four icon keys retain their identities with owner-approved lightweight fixed geometry. Native details/summary handles settings disclosure semantics; only its arrow is styled lime, with a charcoal outline for light-theme contrast. The owner confirmed the live v0.5.0 gate before column features were prepared for v0.6.0.

## Column ordering and optional Note (0.6)

`columns.js` owns stable-ID movement and explicit removal; `note-column.js` owns managed Note creation/visibility. `column-controls.js` owns the compact native button/list UI and pointer gesture. It previews DOM order only until a valid drop; pointer cancellation, lost capture, Escape and mode/event rerenders abandon the gesture without writing model state. Keyboard movement and valid drops use the existing commit/rollback path. Boundary movement buttons are disabled; focus returns to the same column’s handle if the requested button becomes disabled. Live movement feedback is available in the list and inside the modal details dialog.

Order is the existing columns array; no parallel order list is added. Optional event references cueColumnId/noteColumnId must resolve to non-primary columns; the Note reference must resolve to a distinct text column. They are absent in legacy data and added only by a relevant mutation. Note visibility is the existing column.visible flag, not a second boolean. Creating Note fills an empty cell in every row of both modes and retains existing shares/dimensions. Turning it off retains cells and position. The managed Note cannot be deleted or retyped through generic controls; the explicit toggle controls visibility. Existing user-created columns named Note/Location are ordinary custom columns.

CSV uses ordered visible data columns after mandatory position/icon fields. The existing reserved metadata tuple accepts an optional fourth field, cue or note, to preserve those roles without guessing labels. Older three-field metadata remains accepted. Invalid/duplicate roles reject the import. An icon-only or only-Note export imports with a blank Fuel column so the model still has a separate non-primary icon host. Hidden content and complete types/layout require JSON. `makeSheet` changes only the stable-ID icon-host comparison; physical layout, footer measurement and preparePrint remain unchanged.

## Session history (0.7)

`history.js` retains per-plan snapshot pairs in memory, capped at 20 combined
Undo/Redo entries per plan and an 8 MiB shared serialized-payload accounting
budget. App-level field completion groups accepted keystrokes and position sorts;
completed drags are single actions. Restore uses existing validation/save paths,
with no recursive history capture. Invalid drafts block history; ordinary storage
failures retain valid in-memory state with truthful status. Whole-library replacement
is accepted and clears history only after successful storage; failure retains the
prior plans/history. Nothing is persisted or exported. See [history design,
boundaries and memory accounting](REVIEW-v0.7.0.md).

## Personal preset revisions (0.8)

`preset-actions.js` constructs isolated, byte-validated candidates. Optional
personal IDs, plan presetId references and one previous name/event revision are
validated by core.js and preserved in JSON. Legacy records remain byte-stable
until used. App acceptance requires successful atomic storage, unlike ordinary
unsaved in-memory plan edits. Plan history restores preserve current associations.
Duplicate/missing references reject imports, and library restore never merges.
`names.js` applies separate event/preset naming namespaces only at explicit naming
actions. Comparisons trim and lowercase, never infer identities. New-plan paths
use checked numeric suffixes; compatibility validation/complete restore allows
legacy duplicate names unchanged, distinguished by library-position display labels.
Event collision drafts never mutate the accepted name. History peeks validate a
changed target name before touching state or stacks; conflicting actions stay
available for retry after the other plan is renamed. Preset content updates retain
the preset name; explicit rename retains template contents and all event names.
See [v0.8.0 design and rollback limits](REVIEW-v0.8.0.md).

The supplied Tour of Flanders example uses fixed local FLANDERS_CUES and existing
creation machinery, with visible role-marked Location/Fuel. Defaults are copied
only on explicit creation and are never injected into stored libraries.

## Cue colours and grids (0.9)

`icon-colours.js` holds fixed named IDs/sRGB values. Optional row.iconColour is
validated in both modes; primary icon SVGs inherit the palette colour through
currentColor. `icon-fills.js` adds audited interior layers beneath dark original
outline/detail strokes for selected colours; Feed zone remains stroke-only.
Default Banana no longer has a yellow surface/colour exception. Text,
custom symbol columns, icon shapes and IDs are unchanged. Default omits styling
and keeps the theme-aware editor and black-on-white print conventions.

`grid.js` owns the grid allowlist, legacy mapping and pure boundary geometry.
Optional layout.grid defaults to row lines (or a validated legacy lines boolean).
Full grid is one path: visible column edges and each row boundary once, with a
0.15 mm stroke. Outer sides/top are inset half a stroke; content starts 0.15 mm
lower and bottom ink reserves another 0.075 mm before fit/footer allocation.
A shared 0.8 mm per-side cell inset replaces the former uneven offsets in every
grid mode; wrapping budgets it inside column widths, including icon space.
Column width shares/fonts/sheet dimensions are unchanged. Row-line mode retains
its existing separator style; None removes separators, including the header rule. Preview
and print clone the same SVG. No grid boundaries extend into the footer.

Both fields pass through existing validation/serialization, byte budgets, preset
candidate transactions and bounded plan history. Defaults do not inflate old
records. Coloured CSV uses a reserved versioned metadata tuple after icon; old
strict metadata parsers reject it. See [v0.9.0 review](REVIEW-v0.9.0.md).

The final v0.9.0 orientation follow-up sets Bar, Gel and Bottle upright at 0°,
removing rotations from original outline paths and audited fill layers together.
Path data, bounds, IDs, colour data and shared 0.8 mm padding remain unchanged.
