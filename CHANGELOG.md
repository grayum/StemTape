# Changelog

## 0.10.0 — accepted review (2026-10-22)

- Add Auto/Left/Centre/Right column alignment for shared preview/print, including
  primary position and complete icon/text groups inside unchanged cell padding.
  Retain existing explicit saved alignment; new columns default to Auto.
- Add Icon only cue display, retaining editor/export text, and plan-wide Fit width
  to content (off by default). Measure displayed contents/headings/icons and footer;
  compact the physical width up to its configured maximum, without redistributing
  spare space or changing fonts, length or stored shares. Fall back to existing
  shares/wrapping above the maximum; remove development-only cue autosizing.
- Duplicate a row immediately after its source without sorting or changing its
  distance/time; retain colour, hidden values and blanks with a fresh stable ID.
  One Undo/Redo action, new-row position focus and accessible feedback.
- Preserve alignment in JSON/presets/history; validate imported values strictly.
  CSV stays unchanged and omits alignment. Schema/key stay v1; older apps reject
  Auto, so preserve pre-upgrade JSON originals before rollback.
- Add focused native Chromium/Firefox and model regressions. The user accepted
  the preceding implementation and reports a measured physical print on 2026-10-22.
  Separately, final manual review and physical print testing, including fitting,
  passed according to the user on 2026-10-22; no new measurements or exhaustive
  device/browser coverage are inferred.

## 0.9.0 — review candidate (2026-10-19)

- Add independent per-cue primary-icon colours from a fixed named palette,
  with labelled picker choices, selected state and focus restoration. Keep
  transparent areas, existing solid details and cue identities.
  Fill audited interiors beneath dark detail outlines; Feed zone keeps coloured
  strokes. Remove Banana's special yellow default.
- Set Bar, Bottle/Bidon and Gel upright at 0°, removing their artwork rotations
  from filled interiors and detail outlines together. Retain bounds and padding.
- Add None / Row lines / Full grid through the shared preview/print renderer;
  draw boundaries once, reserve outer stroke space and keep the footer outside.
  Use a shared 0.8 mm horizontal inset per cell side across grid modes.
- Preserve colours/grid across history, duplicates, JSON and preset revisions.
  Validate optional v1 styling without inflating legacy load-time byte budgets.
- Extend coloured CSVs with a versioned icon-colour metadata column that older
  importers reject. Preserve monochrome CSV and all role/value alignment.
- Add data, native-browser, geometry and PDF checks. Final user-reported manual
  acceptance dated **2026-10-19** includes Bar, Bottle/Bidon and Gel at 0°.
  Physical printing remains unverified and is not a release gate at the user's
  request. No deployment or infrastructure changes.

## 0.8.0 — review candidate (2026-10-18)

Final user-reported manual preview acceptance: 2026-10-18, including the final
button layout and Tour of Flanders. Physical printing and exhaustive
device/accessibility testing are not inferred.

- Align history actions left and preset actions right with flexible spacing and
  responsive wrapping; place Columns before Sort in DOM/tab and visual order.

- Fix user-found duplicate preset-name UX: reject new/renamed collisions against
  personal/built-in names, preserving dialog input with an accessible inline alert.
  Keep existing duplicates/imports, distinguish numbered targets and retain ID-based
  update/recovery.

- Separate event/preset naming namespaces with accessible draft-preserving collision
  feedback, checked unique creation/import suggestions and legacy duplicate labels.
  Block conflicting Undo/Redo names without changing state or discarding history.
- Separate preset content updates from explicit preset renames; identify the target
  and explain captured settings, including event name. Neither rename affects the
  other namespace. Preserve names and data in complete backup restores.
- Separate Save as new preset and identity-based Update preset, keeping
  Undo/Redo in the left action group. Confirm overwrite; protect bundled defaults.
- Retain one recoverable previous personal preset version in the atomic state
  write. Preserve existing plans, invalid drafts and both versions on failure;
  exclude preset actions from plan history without restoring stale associations.
- Validate optional v1 identities, plan links and recovery in complete JSON; retain
  legacy templates without inflating load-time byte budgets. CSV remains unchanged.
  Older apps may discard metadata or reject the new example: back up before rollback.
- Add the supplied Tour of Flanders distance/km example: 19 cues, visible Location
  Note and Fuel, original symbols/blanks/order, no invented year or route claim.


## 0.7.0 — review candidate (2026-10-18)

- Add per-plan, session-only Undo/Redo for completed field edits, rows, columns,
  Note, names, modes/units and plan print settings; preserve stable identities.
- Group position edits with automatic sorting and continuous field changes at
  completion. Keep native text undo in fields; add accessible buttons, feedback
  and platform shortcuts outside fields/modal dialogs. Place Undo/Redo together
  immediately before Save as preset, with responsive wrapping and matching tab order.
- Bound retained history to 20 actions per plan and 8 MiB shared snapshot budget;
  new/duplicate/imported plans start empty. Successful library replacement clears
  history; failed restore keeps current plans and history.
- Preserve invalid drafts, existing save/recovery protections, schema v1, export
  formats, strict CSP and print geometry. History never enters storage or exports.

## 0.6.2 — review candidate (2026-10-18)

- Rotate only Bidon/Bottle artwork 45° clockwise around its existing centre in the shared icon definition; retain `bottle` identity and all other icons.
- Emphasize “Scale 100% / Actual size.” semantically in print guidance and Help; explain Fit to page scaling and ruler checks.
- Move Privacy & help into normal flow, right-aligned within the bottom of the preview frame and trim its self-hosting sentence. Keep the GitHub Pages/Cloudflare privacy explanation and self-hosting documentation.
- Move misplaced README sorting/format notes out of Credits. No state/schema, storage, import/export, sorting, save-protection or sheet-dimension changes.

## 0.6.1 — review candidate (2026-10-09)

- Align the two existing import options in equal-width responsive cards, with bottom-aligned actions and natural mobile stacking. Keep action names, keyboard order and import handlers.
- Group existing controls under Sheet size, Appearance, Columns, Footer and Printing inside the native lime-arrow disclosure. Footer text occupies its own full-width line below Show footer, remains visible when disabled and retains its value.
- Give secondary actions a consistent neutral border/tinted background, stronger hover state, lime keyboard-focus ring and comfortable touch targets; scope the treatment to action buttons.
- Use theme tokens, consistent labels/checkbox spacing and responsive grids without fixed card heights. No state/schema, CSV/JSON, column identity, save protection or sheet/print geometry changes.

## 0.6.0 — review candidate (2026-10-07)

- Add a compact column-order list with mouse/touch handles, keyboard movement, left/right buttons, boundary disabling, stable focus and position feedback. Keep distance/time first and cue icons attached to a stable data column.
- Add an optional text Note column, initially before Cue/Fuel. Hide/restore without deleting its name, width, order or either mode’s content; reuse Custom column controls, including renaming. Do not infer identity from old Note/Location labels.
- Keep old state byte-compatible on load. Validate optional cue/note references and CSV role metadata, preserving JSON/preset/duplicate identity and the existing atomic storage/recovery guarantees.
- Export visible CSV columns in order; retain old CSV import support. Extend reserved metadata only where cue/note identity is needed. Use JSON to preserve hidden content and full layout.
- Preserve explicit width shares, physical dimensions, v0.5.0 icons/footer and shared preview/print geometry; overflow continues to block printing.

## 0.5.0 — review candidate (2026-10-07)

- Replace bar, bottle, gel and cobbles artwork with lightweight local SVGs based on the four owner-approved references. Preserve icon keys, labels and transparent/theme behavior.
- Add optional per-plan Show footer / Footer text settings, off by default for old and new plans. Keep text on toggle-off, duplicate/preset/JSON round trips; do not add footer data to cue CSV.
- Measure one centered footer line inside the physical sheet, blocking print on horizontal/vertical overflow. Disabled/empty footers keep the previous geometry; calibration and preparePrint remain unchanged.
- Use a scoped lime settings disclosure arrow with a contrasting outline and native heading/keyboard semantics.
- Record column ordering and optional Note columns as approved follow-ups gated on successful live deployment verification; no column features are implemented here.

## 0.4.1 — review candidate (2026-10-03)

- Publish owner-authorized security.txt with exact-path Nginx access, UTF-8 plain text, inherited headers and expiry/self-hosting guidance. Keep HTTP compression and document accepted edge cipher/key-exchange limitations.
- Replace the permanent ISO timestamp with locale-aware hover/focus/touch details including timezone; retain relative save status and all v0.4.0 storage guarantees.
- Visually disable time-mode distance units without changing the preference, distance columns or physical dimensions.
- Use Fuel for new nutrition templates; preserve existing/custom/imported labels without a speculative migration.
- Update hosted-app README, upgrade/rollback guidance and focused regressions. See validation for executed and pending checks.

## 0.4.0 — review candidate (2026-10-02)

### Security/deployment change

- Add an owner-specific Cloudflare/DNS/Caddy runbook based on the 95% Internet.nl baseline, preserving passing controls and separating edge TLS from origin checks.
- Add only NET_BIND_SERVICE to the VPS proxy for capability-marked official Caddy images; retain non-root, read-only, dropped capabilities and no-new-privileges. Include an offline digest-specific startup probe. Live-pin verification and a verified security.txt contact remain decisions.

### Save-status UX change

- Show relative successful-save age and accessible exact UTC time only after successful storage; preserve prior time on failures and remove success for invalid/pending drafts or protected recovery.
- Keep optional validated timing metadata within the atomic v1 state byte budget; preserve exact-limit data with explicit session-only timing when metadata cannot fit. No timestamp invented for old data.
- Detect known stale-tab storage changes and retain recovery originals when explicit replacement fails. Timers do not write storage, rebuild the editor/preview or repeatedly announce age.
- Add focused Node and condition-based browser regressions. Print geometry, makeSheet and preparePrint remain unchanged; see the validation record for executed and pending checks.

## 0.3.0 — review fixes (2026-09-29, uncommitted)

- Share a validated 2,000,000-byte UTF-8 policy across accepted state, storage, JSON exports and imports; reject oversized mutations without truncation and preserve original oversized/unreadable storage for recovery export.
- Validate total distance in canonical metres and derive unit-specific limits before saving.
- Guard invalid drafts across ordering and full rerenders; provide explicit cancellation. Keep row-arrow focus by stable identity and announce movement, including boundary arrivals.
- Preserve custom distance column labels and units through explicit CSV metadata; keep literal bracketed-unit text labels unambiguous.
- Name the dialog accessibly, retain mobile storage status, distinguish recovery originals from temporary fallback plans, and match container smoke configuration with `--init`.
- Add core boundary/round-trip tests and browser regressions. Print generation and physical geometry are unchanged. See VALIDATION.md for executed checks and blocked browser verification.

## 0.3.0 — development candidate

- Keep one header tagline: A little tape. A clear plan.; refresh logo/banner assets.
- Alphabetize cue symbols with None first; rename Can / cola to Softdrink (stored key stays `can`).
- Shorten the footer privacy promise and link the StemTape GitHub project in the credits.
- Sort on completion of a changed, valid distance/time edit. Keep equal positions stable and preserve later manual ordering until the next position edit.
- Preserve storage schema and physical print geometry. Pending release checks are listed in docs/VALIDATION.md.

## 0.2.0 — 2026-09-28

- Explicit client-side privacy statement in the footer and privacy help.
- Developer/maintainer attribution linking to Graham van der Wielen, plus ChatGPT & Codex assistance credit.
- Drag handles before cue numbers for mouse, pen and touch; keyboard movement and existing up/down buttons retained. Cancellation does not save reordering.
- Five new cue symbols: cobbles / pavé, rice cake, can / cola, neutral zone and litter zone.
- CSV/JSON and local-storage validation accept the new symbols. Existing v1 data remains compatible.
- One `docker-compose.example.yaml` with local-only port binding and commented Traefik sections, matching `.env.example`, separate standalone Caddy example, and upgrade guide.
- Print geometry, physical units and layout algorithm unchanged. User confirmed v0.1.0 dimensions matched a real stem when printed at 100%.

## 0.1.0

Initial local-first editor, presets, themes, CSV/JSON, SVG print preview, branding and Docker deployment examples.
