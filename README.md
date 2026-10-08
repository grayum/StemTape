# StemTape

**A little tape. A clear plan.**

**[Free hosted app / live demo](https://stemtape.cc/)** — ride plans stay in your browser. Docker self-hosting remains available.

Local-first cycling cue sheets for a stem or top tube. A portable static web app with light/dark/system themes and a lime folded-tape identity. All editing, imports, storage and printing happen in the browser.

## Start on your laptop

Python 3 and a modern browser are sufficient. No npm install or build is needed to use the app.

```sh
python3 scripts/serve.py
```

Open **http://127.0.0.1:8080**. Use this local server rather than opening `index.html` as a file: ES modules require HTTP. The development server binds to loopback only and is not intended for public hosting.

## Included in StemTape

- Saved events, duplication/deletion and project-owner presets.
- Relative last-save status with honest failure/recovery feedback (shipped in v0.4.0).
- Deployment hardening and Cloudflare/Caddy guidance, including the proxy-only capability fix (shipped in v0.4.0). Edge settings are separate from repository fixes.
- Nutrition by distance **or elapsed h:mm**, with separate cue lists; route and custom presets.
- Metric defaults and explicit mile/inch overrides; canonical distance storage.
- Local Lucide outline icon picker plus pasted emojis/text.
- Mouse/touch drag handles and keyboard/arrow-button reordering; custom typed columns, visibility, width, alignment and emphasis.
- Live white print preview, physical dimensions, padding, font, spacing, rotation and headers.
- Overflow warnings; printing blocked when content does not fit.
- A4/Letter printing and browser Save as PDF; copies, cut marks and calibration scale.
- CSV file import/export and tab-separated spreadsheet paste. JSON full backup/restore with confirmation.
- Remembered bike dimensions, local personal presets, storage failure/recovery handling.
- Transparent SVG logos, symbol files, banners and SVG/ICO favicon assets.
- Hardened Docker recipe and local / standalone VPS / existing Traefik examples.

Custom Unicode emojis use the user's system font. The outlined symbols combine **Lucide** with original StemTape symbols, including the approved Bar, Bottle, Gel and Cobbles replacements, not Font Awesome. Lucide 1.8.0 and DejaVu font notices are bundled in `dist/assets/`. No CDN assets or analytics.

## v0.6.0 changes (review candidate)

- Compact Columns list under Layout & print settings: drag with mouse/touch, use Move left/right, or use arrow keys/Home/End on a handle. Distance/time stays fixed first; data follows column IDs. Boundary buttons are disabled and movement restores focus and announces position.
- Optional **Show note column**, off by default. Initially insert Note before Cue/Fuel; rename it to Location, reorder it, or hide it without deleting its text. Column details uses the same labels, widths and cells as other custom columns. Existing columns named Note are not reclassified.
- CSV exports visible data columns in display order, plus the required position/icon fields. Complete JSON retains hidden content, both modes, column identities, presets and layout. Existing width shares and physical sheet dimensions stay unchanged; adding a column can cause overflow and block printing.

The new Note starts with a relative width share of 25; other shares are preserved. Review [design and manual checks](docs/REVIEW-v0.6.0.md), [validation](docs/VALIDATION.md) and [upgrade/rollback](UPGRADE.md). The owner confirmed v0.5.0 is deployed and working before this stage began; v0.6.0 has not been deployed.

## v0.5.0 changes

- Four approved local SVG replacements: smiling unwrapped Bar, cycling Bottle, diagonal blank Gel sachet and perspective Cobbles/Pavé. Existing icon keys and saved cues keep their identity.
- Optional per-plan printed footer under Layout & print settings, off by default. Plain text/emojis stay inside the chosen sheet dimensions; overflow blocks printing. Turning it off preserves the text; JSON includes it, cue CSV stays unchanged.
- Lime expand/collapse arrow on Layout & print settings, retaining native keyboard operation.

Footer text uses the plan font on one centered line, with a maximum of 80 UTF-16 units (most emojis use two). The actual measured line must also fit. Review [compatibility and manual checks](docs/REVIEW-v0.5.0.md), [validation](docs/VALIDATION.md) and [upgrade/rollback](UPGRADE.md). The previously deferred column features are now prepared for v0.6.0 following the owner’s live v0.5.0 confirmation; see the [roadmap](docs/ROADMAP.md).

## v0.4.1 changes

- Publish the owner-authorized security.txt with maintained expiry and an exact hidden-path exception.
- Keep the relative save status; hover, focus or tap it for the localized saved date/time and explicit timezone. No permanent ISO line.
- Grey out distance units in Time mode, retaining the preference and formatting of additional distance columns. Sheet dimensions stay editable.
- Use **Fuel** in newly created nutrition templates, in both modes. Existing/imported labels remain unchanged because v1 stores no reliable marker distinguishing an untouched default from a chosen label.

Remaining Cloudflare cipher/key-exchange findings are accepted deployment limitations for now. No perfect Internet.nl score, security audit or production check is claimed. See [upgrade/rollback instructions](UPGRADE.md).

## Data and privacy

Plans live in your current browser's localStorage, not the server. Different domains, profiles and browsers have separate data. Clearing site data removes plans. Export JSON backups regularly; CSV preserves cue data, not full layout/types. Remembered bike dimensions are included in JSON. Optional last-save timing metadata shares the same atomic state record and byte budget; exact-limit plans preserve their data and explicitly retain time only for the current tab when metadata cannot fit. Old data with no timestamp keeps an unknown save time. See [save-status behavior](docs/SAVE-STATUS.md). Saved state, complete JSON backups and imported files share a 2,000,000-byte UTF-8 limit. State includes all events, both cue modes, presets and preferences; changes exceeding the limit are rejected without truncation. Existing oversized or unreadable storage remains protected with an original-data recovery export. Imports also allow at most 200 rows per mode and 8 columns. No GPX parsing, accounts, automatic nutrition advice or route detection.

CSV example:

```csv
distance_km,icon,Fuel
20,banana,Banana
40,bottle,Drink
```

Time example:

```csv
time,icon,Fuel
0:30,bar,Bar
1:00,gel,Gel
```

Use point decimal separators in CSV numbers. A comma in text must be quoted. Supported icon keys: banana, bottle, bar, gel, smile, mountain, feed, flag, coffee, warning, cobbles, ricecake, can, neutral, litter (or empty). Unknown icons are rejected. Export includes the active mode, cumulative position values, icons and visible data columns in display order. Hidden content requires JSON backup. The position column stays in the editor and CSV even when hidden in print. If no other data column is visible, a position/icon-only CSV import creates an empty Fuel column; it does not recover omitted hidden data. Custom distance columns export explicit `stemtape:column:` JSON metadata in their CSV headers, preserving labels and distance units. v0.6.0 extends that tuple with an optional validated cue/note role to preserve identity when columns move or are renamed; marked exports require v0.6.0 for import. Older CSV files remain supported. CSV still does not preserve all custom types, exact text, precision, hidden content or layout; use JSON for complete backups. Literal labels ending in `[km]` or `[mi]` remain text unless explicitly marked; legacy CSV suffixes are not inferred. Use JSON for lossless backups.

## Print workflow

Measure the **usable surface**, not the nominal stem length. Set width/length, adjust text and print at **100% / Actual size**; disable browser headers/footers. Save as PDF from that dialog if wanted. Measure the printed **50 mm calibration line** before fitting the strip. Each copy gets its own page. Actual printer scaling and readability still require a physical test. The app never silently shrinks fonts; default is 11 pt, minimum 8 pt.

## Docker development

Copy the examples once into your private configuration files:

```sh
cp docker-compose.example.yaml docker-compose.yaml
cp .env.example .env
docker compose -f docker-compose.yaml config --quiet
docker compose -f docker-compose.yaml up --build -d
```

The default is local testing at **http://127.0.0.1:8080**. The `.env` uses an official, versioned Alpine Nginx tag for convenience. Resolve and scan an immutable digest before a production build. The application image, domain, network and resolver references are all parameterised.

For an existing **Traefik** proxy, remove the local `ports` section and uncomment all three marked sections in your private `docker-compose.yaml`: the service's `traefik` network entry, the labels block, and the external network definition. Configure `STEMTAPE_DOMAIN`, `TRAEFIK_NETWORK` and `TRAEFIK_CERTRESOLVER` in `.env` to match your installation. The proxy should already handle HTTP-to-HTTPS redirection. No Caddy configuration is needed.

An independent Caddy/VPS example is in `deploy/docker-compose.vps.example.yaml`, with `deploy/.env.vps.example`. See [deployment instructions](docs/DEPLOYMENT.md) for the exact command and certificate-directory setup.

For upgrades, preserve your existing private `.env` and `docker-compose.yaml`. See [UPGRADE.md](UPGRADE.md). No private files are included in this archive.

## Checks

Node 22+ for the dependency-free data tests:

```sh
npm test
npm run check
```

Browser tests (development-only dependency):

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install chromium
# Keep the local server running in another terminal:
npm run test:browser
```

This creates screenshots and an actual PDF in ignored `artifacts/`. Review all screenshots and verify PDF dimensions; passing assertions alone is not visual QA.

```sh
sh scripts/container-smoke.sh stemtape:0.6.0
```

**v0.6.0 validation:** this review candidate has pending release gates. See [current validation](docs/VALIDATION.md). Prior v0.5.0 manual checks and the owner’s live confirmation are separate evidence; they do not verify v0.6.0.

**Prior v0.4.1 validation:** see [current evidence and remaining gates](docs/VALIDATION.md) and [separate security/application review groups](docs/REVIEW-v0.4.1.md). v0.4.0 was merged to main; that does not establish unperformed production checks.

**Prior v0.3.0 validation:** [Main CI run 36886880381](https://github.com/grayum/StemTape/actions/runs/36886880381) passed on 2026-10-01: 30 data tests, app/core syntax checks, Chromium browser regressions with screenshot/PDF generation, basic tracked-file checks and the container smoke test. User-reported manual and actual-size-print checks are recorded separately. Production proxy checks, full secret/image scans, broader visual/device checks and large-active-plan performance profiling remain outstanding; this is not a security audit or production-deployment verification. See the [validation record](docs/VALIDATION.md) for coverage and limitations.

## Repository workflow

Unzip into a fresh development directory, review, then initialise Git and create your chosen private GitHub repository. Keep `.env`, actual deployment overrides and `runtime/` outside version control. CI is included and does not publish or deploy. Public release needs a chosen project license, domain/trademark checks and release gates. First-party code/brand licensing remains for the owner to choose; bundled third-party assets retain their own notices.

## Credits

[StemTape](https://github.com/grayum/StemTape) is developed and maintained by [Graham van der Wielen](https://grahamofthewheels.com/).

Created with assistance from ChatGPT & Codex (OpenAI).

Editing the primary distance or time sorts cues when you leave the field or press Enter. Manual reordering then persists until the next valid position edit (or Sort). Equal positions retain their relative order. Text and symbol edits do not sort. The Softdrink symbol retains CSV/JSON key `can`.
