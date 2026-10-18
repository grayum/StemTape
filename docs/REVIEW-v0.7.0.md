# v0.7.0 session Undo/Redo review

Candidate branch: `review/v0.7.0`, based on public main
`bf6fb4736745f0306ead5dac64744d07fb9dcb43` (merged v0.6.2). The user confirms
v0.6.2 is deployed and working. No deployment of this candidate is authorized.

## Scope and design

`dist/history.js` owns in-memory before/after JSON snapshots of **one plan** per
action. It never snapshots the saved library, theme, personal presets or remembered
bike settings. No schema, storage keys, CSV/JSON or icon identities change.
`app.js` integrates the store with the existing edit, validation, render and save
paths; `core.js` and the preview/print generator are unchanged.

Each plan retains at most **20 combined Undo/Redo actions**. A shared **8 MiB**
retained-snapshot budget counts UTF-16 code units at two bytes each, plus 256 bytes
per entry. This is a conservative accounting policy for serialized payloads,
not a measured total JavaScript heap limit. The oldest reachable chain ends are
evicted under pressure; large plans can keep fewer actions. A single action too
large for the budget clears that plan's history instead of leaving a gap. The UI
announces trimming. Deleted plan histories are pruned; the existing library limit
is 30 plans, with 200 rows per mode, 8 columns and 160 characters per cell.

Only the active accepted plan and a field's pre-edit snapshot are retained outside
that store. Each is bounded by the existing 2,000,000 UTF-8 byte library limit
(conservatively up to 4 MB of UTF-16 payload per working string). Thus working
strings add at most about 8 MB beyond the retained-history budget. Existing state,
accepted-library serialization, transient validation/render allocations and engine
object overhead are additional. No action duplicates the entire saved library.

## Grouping and boundaries

- Each completed field interaction is one action. Valid keystrokes still use the
  existing immediate save path; history finalizes on blur. Number spinner/repeated
  changes in one focus interaction coalesce. Row/column dragging records only the
  completed drop; cancellation does not record.
- Primary distance/time blur sorts before history finalization: value and stable
  row order undo together. Explicit Sort and manual movement are separate actions.
- Rows, symbols, column labels/types/widths/order/visibility/alignment/bold, Note,
  plan name and plan-owned layout/footer/print settings are undoable. Complete
  plan snapshots keep cells attached to stable row/column IDs across both modes.
  Hiding Note/footer preserves contents. Modes, presets' Custom mode switch and
  units are atomic plan actions, retaining both independent cue lists and canonical
  distances; no guessed speed conversion is introduced.
- Switching plans keeps separate session histories. New plans, CSV/pasted plans,
  duplicate plans and preset-created plans start empty. Duplicating never copies
  history. Preset creation/replacement/deletion, plan creation/deletion, global theme and bike
  preferences are excluded. Cancelled/failed imports leave existing history.
  There is no in-place CSV/preset plan-replacement path in this application.
- Successful whole-library JSON restore/reset clears all histories, even if IDs
  match. Failed replacement retains the previous library and histories, and
  unreadable original recovery data stays protected. The replacement must reach
  the single-key atomic storage write before it is accepted. This intentionally
  differs from ordinary edits retained in memory on storage failure.
- No-op edits do not record or clear Redo. A new meaningful edit after Undo clears
  only that plan's Redo. Reload/closing the tab clears all history. History is never
  written to localStorage, JSON backups or CSV and is not a recovery backup.

## Drafts, saving and accessibility

Correct or explicitly cancel invalid drafts before Undo/Redo. Buttons disable
while invalid text is present; shortcuts cannot discard it. Blur can accept a
valid field before a pointer click: the one Undo click then reverses that completed
field, including its automatic sort, rather than an older action. Only accepted
valid values enter history; cancelling an invalid suffix preserves prior accepted
values according to the existing draft convention.

Undo/Redo validates the target plan and routes it through the existing whole-state
UTF-8 validation and save path without recording another action. Stacks move only
when the restored state is accepted. Validation/budget rejection keeps current
state/history. If storage is unavailable, protected or changed in another tab,
valid restored state remains in memory with matching history and **Not saved**
status; export JSON before reloading. Saved is shown only after a successful write.

Compact secondary buttons provide action-specific accessible names and disabled
states. A polite status announces the completed action and unsaved result. Focus
stays on the initiating connected control; if it becomes disabled/disconnected,
it stays in the local history group. Outside fields and modal dialogs,
Cmd/Ctrl+Z undoes, Cmd/Ctrl+Shift+Z redoes, and non-Mac Ctrl+Y redoes. Native input,
textarea and editable-content text undo is left alone. Modal dialogs block plan
history shortcuts; complete column edits there, then close to undo them.

## Manual review checklist

Open the established laptop preview at **http://127.0.0.1:18080/**; see
[local preview procedure](LOCAL-DEVELOPMENT.md). Internal checks do not prove
laptop reachability. The user reports passing manual preview testing on
2026-10-18; no physical-print, screen-reader or exhaustive device coverage is
inferred. Undo/Redo were subsequently moved immediately before Save as preset,
with their existing 6px spacing and a 12px gap before the preset action. This
placement adjustment and the complete v0.7.0 work were accepted by the user on
2026-10-18. This is user-reported manual acceptance, not physical printing,
screen-reader testing or exhaustive device coverage.

1. Edit a cell and a position, then click Undo once; confirm value and sorted order
   restore together. Redo; reorder/delete a cue and repeat.
2. Rename/reorder a column, edit and hide Note, change units/mode and print settings.
   Confirm stable data, hidden text and physical dimensions after Undo/Redo.
3. Switch plans, duplicate/import, undo then branch with a new edit; reload only
   after saving/exporting. Confirm histories are isolated and reload starts empty.
4. Try invalid text, keyboard shortcuts outside/inside fields and dialogs, tab
   focus, both themes, narrow mobile views and actual 200% browser zoom.
5. Review print preview/PDF and physically check the 50 mm scale at actual size.
   Physical printing, exhaustive devices and screen-reader review remain unclaimed.

Automated evidence and remaining release gates are recorded in
[validation](VALIDATION.md). Future presets, Tour of Flanders, colours and grids
are outside this release. The manual-only, main-only Pages workflow is unchanged.


## Changed files

Application: `dist/app.js`, new `dist/history.js`, `dist/index.html`, `dist/styles.css`.
Checks: `tests/browser.mjs`, new `tests/history.test.mjs`, `tests/v070-browser.mjs`,
`tests/v070-zoom.mjs`, and `package.json` test/syntax commands.
Version/image labels: `package.json`, `.env.example`, `deploy/.env.vps.example`,
`docker-compose.example.yaml`, `scripts/container-smoke.sh`, `.github/workflows/checks.yml`.
Documentation: `README.md`, `CHANGELOG.md`, `UPGRADE.md`, `docs/ARCHITECTURE.md`,
`docs/ROADMAP.md`, `docs/VALIDATION.md`, `docs/LOCAL-DEVELOPMENT.md`, and this review.
No Pages triggers, production configuration, schema/core serialization or SVG/icon
artwork changes. Browser binaries, screenshots and PDFs remain outside tracked
release files. Local parent/private AGENTS instructions are not copied into changes.
