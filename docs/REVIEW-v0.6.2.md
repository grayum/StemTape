# v0.6.2 visual and text polish

Verified public HTTPS main: `9c6afe41e47563e1bd58d077d2eecfef67964484`,
including merged Pages migration commit `1c5630f0b06fee9ae581836ee03bd5655d139236`.
The public ref and fetched commit matched before branching. Work is isolated on
`review/v0.6.2` at `/Users/graham/Projects/StemTape/stemtape-v062` in the agent's
Linux ARM64 environment, not a macOS laptop checkout. Unrelated README work,
other worktrees and existing bundles/backups are preserved.

## Design and compatibility

- Bidon is the existing Bottle display icon with stored key `bottle`. Add SVG
  `rotate(45 12 12)` to its three fixed paths only. Screen y coordinates make
  positive rotation clockwise. The shared icon factory supplies picker, editor,
  preview and print. No CSS rotation of controls, scaling or viewBox change.
- Semantic `strong` wraps exactly “Scale 100% / Actual size.” in print guidance
  and Help. Help explains Fit to page and checking the printed 50 mm scale.
  Construct Help content with DOM APIs; keep the CSP unchanged.
- Move the existing Privacy & help button after print guidance as the final child
  of the preview frame, right-aligned to its existing padding with an automatic
  left margin. Normal flow, bounded width and a small top margin accommodate wrapping
  and the focus ring. No absolute positioning or fixed-height frame. On mobile,
  use Preview to reach it; the existing Help icon remains available in Edit.
  Native dialog opening, Escape, close button and focus restoration are retained.
- Remove only the requested self-hosting sentence from in-app Help. Keep the
  accurate GitHub Pages/Cloudflare explanation and operator guidance in docs.
- Move README sorting guidance to Cue ordering and Softdrink key compatibility
  to the CSV/format text. Credits contain attribution only.

No state/schema, storage keys, cue IDs, import/export, sorting, save protections,
physical sheet dimensions or printed calibration geometry changes. The Pages
workflow is unchanged; CI/self-hosting image labels now use 0.6.2. Future Undo,
presets/Tour of Flanders, colours and grids remain in the approved
[release sequence](ROADMAP.md), outside this release.

## Validation, 2026-10-17

- Node: 69/69 tests; application and new test-module syntax checks passed.
- Native Playwright 1.62.1 Chromium: full existing suites plus focused v0.6.2
  checks passed at both `/` and `/StemTape/`. Project-path assets, fonts,
  navigation, security.txt and meta-only CSP checks passed without Nginx rewrites.
- Focused regressions sample the actual transformed curves plus stroke bounds;
  compare picker/editor/preview/print artwork; check semantic emphasis, button
  placement, 1440/390/320px layout, both themes, keyboard opening and Escape focus
  return. The existing mobile recovery test now selects Preview before opening
  the relocated button; recovery assertions remain unchanged.
- Actual Chromium browser zoom 2.0 passed on the Docker preview in both themes:
  1440px window reflowed to 720 CSS pixels with devicePixelRatio 2. A temporary
  local-only extension uses Chromium's tabs.setZoom API; no CSS zoom, device-only
  scale emulation or narrowed viewport is substituted for this check.
- Real screenshots inspected: light/dark, desktop/mobile, picker, editor/preview,
  print rendering, Help and 200% zoom with expanded settings and focus. A small
  Help-button margin keeps its focus ring clear of print guidance.
- PDF generated using CSS page size. Existing full-suite assertions preserve
  32 × 90 mm sheet dimensions. Physical printing is not claimed.
- Docker build and smoke passed using
  `nginx@sha256:970364228b1e4f932abc22d321932816782cca8a20b85a77552a7cfe9acfb3b5`:
  UID 10001, read-only app, security headers, POST rejection, exact security.txt
  bytes/type, hidden-path denial and gzip. Final rebuilt image was smoke-tested.
- Publish-directory, basic tracked-file/credential-pattern, documentation-link
  and diff checks passed. Basic hygiene is not a full secret/image scan.

Reproduce with the README's existing development-only Playwright installation:

```sh
npm test
npm run check
sh scripts/browser-checks.sh
sh scripts/container-smoke.sh stemtape:0.6.2
BASE_URL=http://127.0.0.1:8080/ node tests/v062-zoom.mjs
```

`PLAYWRIGHT_MODULE` may point to an existing Playwright installation. Screenshots
and PDFs stay in ignored `artifacts/`; root suite diagnostics are also copied to
`artifacts/root/`. The zoom check requires the local Docker preview running.

## Local Docker manual review

Preview container: `stemtape-v062-preview`, image `stemtape:0.6.2`, built from this
release worktree. After the networking correction, Nginx explicitly listens on
`0.0.0.0:8080` using `/tmp/stemtape-v062-loopback-http.conf` (development HTTP only,
read-only mount; repository production configuration unchanged). Nested Docker
publishes **sandbox `0.0.0.0:8080` → container `8080`**. HTTP 200 and Nginx config
validation passed at `http://127.0.0.1:8080/` inside the sandbox. There is no nested
mapping on 18062 or 18080.

The established laptop route is **host `127.0.0.1:18080` → sandbox `8080`**,
as recorded for the working v0.6.1 preview. Reuse it at
**http://127.0.0.1:18080/**; no new host mapping is proposed. Host-side router
configuration and laptop browser reachability cannot be independently inspected
from this sandbox. The earlier suggestion to add a host 18062 mapping was
unnecessary and is superseded by restoring the established sandbox endpoint.

Investigation found the old `stemtape-review-http` container retained stopped,
with the same `0.0.0.0:8080:8080` publish and development HTTP configuration.
Docker records its exit on 2026-10-12; the available history does not establish
why it stopped. No other running container owns sandbox port 8080. The first
v0.6.2 launch published sandbox `127.0.0.1:18062` instead of sandbox 8080; it
therefore did not feed the established laptop route. The corrected v0.6.2
container now owns `0.0.0.0:8080`. Its HTTP config matches the old one apart from
the comment. All 28 served assets match this worktree byte-for-byte; this is
sandbox evidence, not a new laptop reachability pass. The full native Chromium
suite and actual 200% zoom checks also passed against this restored Docker
endpoint at sandbox `http://127.0.0.1:8080/`. No unrelated containers
were stopped and production configuration remains unchanged.

The container has init, UID/GID 10001, read-only root, constrained
tmpfs, dropped capabilities, no-new-privileges and resource limits.

- Select Bottle in the picker; compare its diagonal orientation in the editor,
  preview and Print / PDF. Check other icons remain unchanged.
- In both themes and mobile Preview, find Privacy & help below the print hint.
  Tab to it, open with Enter, close with Escape and check focus returns.
- At actual 200% browser zoom, expand settings and inspect wrapping, emphasis and
  access to Help. Review Fit to page/ruler guidance and hosted-service privacy text.
- Save a PDF at actual size. Before release, physically print at 100% and measure
  the sheet and 50 mm line with a ruler.

At initial preparation no user manual pass was recorded. On 2026-10-17 the user
reported completing preview review and accepting all reviewed changes except
right-alignment of Privacy & help, pending at that point. The alignment follow-up
is implemented; the user subsequently confirmed the final preview passed on
2026-10-18, including the right-aligned button. This is user-reported local testing,
not physical printing or exhaustive device coverage. Focused
root/project-path browser alignment/focus checks, actual 200% zoom, screenshot
inspection and rebuilt-container smoke passed again for the final right-aligned
button. All 28 served assets match; established host 18080 → sandbox 8080 →
container 8080 mapping is preserved. No physical
print, screen-reader/device matrix, production
verification, full secret/image scan or remote workflow execution is claimed.
These outstanding release gates remain; this candidate is not release approval.
On 2026-10-18 the user authorized two local finalization commits and a complete-
history bundle: release changes/documentation, then preview workflow instructions.
Final Node/syntax/diff and documentation/hygiene checks passed; completed native
browser/container evidence applies to the unchanged app. No push, merge, tag,
production deployment or infrastructure change is authorized. The working local
preview is preserved; screenshots/browser binaries/local artifacts are excluded
from the handoff.
