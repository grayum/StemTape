# Architecture and data

`dist/` is the complete browser application; deploy only this directory. There is no framework or runtime package installation. `index.html` defines accessible controls, `app.js` owns the DOM, dialogs, local state, SVG layout and printing. `core.js` owns pure validation/conversion/CSV operations. `presets.js` holds the project owner's published example cues. `icons.js` contains a vendored Lucide subset with the upstream license and four original StemTape outline symbols (cobbles, rice cake, can, neutral zone). Assets contain fonts and independently editable vector brand files.

State in `stemtape.v1`: schema version, theme, active event ID, events, personal presets, optional remembered bike dimensions. Event: ID/name, preset, mode, distance/dimension units, total metres, remaining-distance switch, columns, independent distance/time row lists, physical layout. Values in distance columns are metres; primary time values are integer elapsed minutes. Unit changes never rewrite canonical data. Display rounding occurs only in UI/CSV; JSON retains precision.

Column: ID/label/type/relative width/visibility/alignment/bold. First column is fixed distance-or-time. Text/symbol columns accept arbitrary Unicode text (160 chars); number columns accept nonnegative finite values. Typed edits are validated. Reordering/removing columns preserves stable IDs; destructive changes require confirmation. Icons are stored separately per row and displayed in the first cue column.

No migration exists beyond v1 yet. Future schema versions must migrate explicitly and preserve unreadable originals. CSV creates a new event; JSON restore requires explicit confirmation and offers a pre-restore backup. A shared serializer validates and compactly encodes the complete state, enforcing a 2,000,000-byte UTF-8 budget before writes or acceptance of edits. The identical encoding is exported as JSON. Imports enforce both file bytes and the reconstructed serialized-state budget. The budget includes both modes, all events, personal presets, bike dimensions and preferences. Rejected mutations roll back in place; invalid input stays visible until corrected or explicitly cancelled. Existing oversized/unreadable storage is never automatically replaced: fallback editing remains in memory and the original raw string can be exported before explicit reset/restore. Recovery exports are originals, not necessarily valid or importable complete backups. Failed localStorage writes are reported and current in-memory data remains exportable.

## Rendering
Preview and print use the exact same DOM-built SVG. Millimetres are the SVG coordinate unit; font points are converted by 25.4/72. Text wraps using the bundled font's canvas metrics. Geometry stays in explicit SVG attributes, not dynamic inline styles. Physical page size is updated using CSSOM in the trusted stylesheet. Font size is never automatically reduced. Overflow and narrow columns block the app print action. Each requested copy prints on its own A4/Letter page with cut marks and a 50 mm line.

Pasted emoji rendering depends on installed OS fonts. Bundled Lucide icons remain consistent. This version does not embed a full Unicode emoji set or claim universal glyph coverage. Preview and actual printed content must be checked by the rider. Browser Save as PDF is the PDF workflow; there is no server PDF renderer or separate custom-label PDF export yet.

## Presets
Project-owner templates: edit `BUILTIN_CUES` in `dist/presets.js`; each cue is `[kilometres, iconKey, text]`. Templates are copied at event creation; changing them never rewrites an existing saved plan. Personal templates include both cue modes and layout and travel in JSON backup. Nutrition example entries are illustrations, not recommendations.

## Branding
Lime #C5F82A; charcoal #202426; off-white #F6F7F1. SVG wordmarks are outlined from bundled DejaVu Sans for portable rendering; this is a vector interpretation of the selected generated concept, not an extracted proprietary font. Transparent light/dark logos, standalone symbols, banners, SVG/ICO favicons are in assets. Keep accents out of print content. The working name StemTape is not domain/trademark-cleared.

## Row reordering (0.2)

Pointer events on the leading grip support mouse, touch and pen; the handle reserves touch movement for dragging while the rest of the table remains scrollable. Live row movement commits by stable row ID at drop. Escape, pointer cancellation and lost capture cancel without changing stored data. Keyboard Arrow Up/Down and Home/End work on the handle; existing arrow buttons remain. No dimensions, wrapping or print geometry changed in 0.2. Schema stays at version 1 for backwards-compatible loading of 0.1 data. Backups using new symbols require 0.2 or later.

## Automatic ordering (0.3)

The first distance/time cell sorts the active list after a changed valid value loses focus or Enter is pressed. Ties are stable. Text/icon changes and loading existing data never sort. Manual movement is retained until another primary-position edit or explicit Sort. DOM rebuilding waits until the pointer action finishes; row actions resolve stable IDs so a blur-triggered sort cannot redirect a click to another cue.

Invalid drafts block actions that could discard them, including pointer/keyboard ordering and changes to event/mode/units. Escape or Cancel unaccepted edits explicitly restores accepted values. Row arrows remain focusable at boundaries with aria-disabled state, and resolve moves/focus by stable row ID. CSV distance metadata uses a reserved header prefix with a JSON tuple; reserved-prefix text labels are escaped with a text tuple. Unmarked bracketed units remain literal labels to avoid guessing legacy column types.

## Save status (0.4)

`save-status.js` owns the storage-success boundary, optional validated `savedAt` metadata and relative-age formatting. See [save-status behavior and compatibility](SAVE-STATUS.md). A single state write includes metadata only when it fits the existing byte budget; metadata never displaces plan data. Display timers update status nodes only. Recovery remains protected until an explicitly requested replacement is successfully written, and stale tabs are warned rather than silently replacing known newer data.
