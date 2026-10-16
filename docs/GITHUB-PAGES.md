# GitHub Pages testing

Production remains the VPS at **https://stemtape.cc/**. The separate test target is
**https://grayum.github.io/StemTape/**. This work does not change DNS, configure a
custom domain, or deploy anything to the VPS. Custom-domain work is deferred and
requires a separate decision and authorization.

## Manual deployment, after review and merge

1. Review and merge these changes to `main`. No deployment runs on push or PR.
2. In repository **Settings → Pages**, select **GitHub Actions** as the source.
   Leave **Custom domain** empty. Do not add a CNAME file or modify DNS.
3. Configure the `github-pages` environment to allow deployments only from `main`
   (and any desired reviewer protection). The workflow also rejects other refs
   and repositories. Repository Pages availability/plan eligibility must be checked
   by the owner; no PAT or additional deployment credentials are needed.
4. In **Actions → Test on GitHub Pages → Run workflow**, select `main`.
5. Validation reuses `checks.yml`: Node 22 syntax/data checks, the full native
   Chromium suite at `/` and `/StemTape/`, Pages-specific resource/navigation/CSP
   checks, repository hygiene, and the existing container build/smoke test.
   Every checkout uses the dispatch's immutable `github.sha`, even if main moves.
6. Only after validation succeeds, the artifact job checks and uploads `dist/`.
   It inspects the actual tar produced by the pinned action, comparing every file's
   path and bytes with the checkout. Deployment depends on this inspection passing.
   The deploy job verifies Pages still targets the exact initial github.io URL,
   then publishes through the `github-pages` environment. Follow its deployment
   URL output and verify the live test site, downloads and actual-size printing.

`workflow_dispatch` is the only deployment trigger. Pages concurrency serializes
runs without cancelling an active deployment. Default permissions are
`contents: read`; only the deploy job receives `pages: write` and `id-token: write`.
It uses the automatic `GITHUB_TOKEN` and OIDC. `configure-pages` has automatic
enablement disabled and will fail if Pages has not been enabled manually.

## Static files and paths

`dist/` is checked-in application source, not generated output. There is no build
command or runtime package installation. Its relative module imports, stylesheet,
font/icon URLs and `./` home link work at both mount points without rewriting.
There are no application fetch calls, manifest or service worker. External credit
links and the production security.txt Canonical URL remain unchanged.

`upload-pages-artifact` v5.0.0 explicitly supports `include-hidden-files: true`.
Its Linux archive command includes `.well-known/security.txt` with that input;
the workflow checks the resulting `$RUNNER_TEMP/artifact.tar`, not only the input
directory. Only tracked `dist/` files are allowed. Symlinks, any CNAME (regardless
of case), unexpected hidden paths, extra/missing files and mismatched bytes fail
validation. The only allowed hidden paths are `.well-known/` and its security.txt.
Repository files, tests, workflows, private configuration and diagnostics are not
part of the Pages artifact. No Jekyll build is involved.

The file is available at `/StemTape/.well-known/security.txt` on the test site;
this does not establish the origin-wide `/.well-known/security.txt` endpoint
required for standard discovery on `grayum.github.io`. Its Canonical still names
production. The VPS continues serving the standard root endpoint unchanged.

## Security and privacy differences

GitHub Pages does **not** execute `deploy/nginx.conf` or `deploy/Caddyfile`.
The HTML now places a meta CSP immediately after the charset and before all
resource loads. It is derived verbatim from Nginx's policy except for
`frame-ancestors`, which browsers do not support in meta CSP. It keeps default
deny, self-only scripts/styles/fonts, local/data images, no connections, objects,
base overrides or form submissions. It adds no inline/eval or network exception.
The HTML also supplies `no-referrer` metadata. Both work alongside the unchanged
Docker response policies; browsers enforce all applicable CSPs.

| Protection on the VPS | Direct github.io test site |
| --- | --- |
| Response CSP, including `frame-ancestors 'none'`, and X-Frame-Options DENY | Meta CSP covers supported document directives only. No application-controlled anti-framing protection; the test site can be framed. |
| Referrer-Policy: no-referrer response header | HTML referrer metadata applies to the document; it does not provide a response policy for other resources. |
| X-Content-Type-Options: nosniff | Cannot configure the application's response header on Pages. Any GitHub-provided value is platform-owned. |
| Permissions-Policy disabling camera, microphone, geolocation and payment | No equivalent application-controlled response policy. Meta CSP does not replace it. |
| Caddy TLS, one-year HSTS and canonical-host routing | GitHub owns HTTPS/TLS/redirects/HSTS. The repository does not reproduce the VPS policy or configure a custom host. |
| Nginx hidden-path denial, GET/HEAD restriction, health endpoint and cache/compression settings | Not implemented by these files on Pages. Artifact inspection limits published files; Pages controls request handling and caching. |
| Nginx access logs disabled | GitHub controls hosting logs and receives normal connection metadata. No application analytics or telemetry is added. |

These are configuration differences, not a measurement of live github.io headers;
inspect the actual responses after an authorized first deployment. Meta CSP is
not a substitute for header-only protections, does not protect non-HTML resources
or Pages-generated error documents, and does not scope `'self'` to `/StemTape/`.

Browser storage belongs to the **origin**, not the path. The test site's data is
separate from `https://stemtape.cc`; transfer plans explicitly with JSON backups.
Other projects on `https://grayum.github.io` share that origin and can access the
same storage. Use synthetic test plans there. Storage keys/schema, application
logic, imports/exports, SVG geometry and printing have not changed.

## Verified action pins

Official release tags, peeled commit SHAs and pinned `action.yml` sources were
checked through GitHub's public API on 2026-10-16.

| Action | Release | Full commit SHA |
| --- | --- | --- |
| actions/checkout | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| actions/setup-node | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| actions/upload-artifact (QA diagnostics) | v7.0.2 | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |
| actions/configure-pages | v6.0.0 | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` |
| actions/upload-pages-artifact | v5.0.0 | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| actions/deploy-pages | v5.0.1 | `368f82528645a54fb793d4d04e342629a3f51346` |

All JavaScript actions above use Node.js 24. The Pages upload action is composite
and internally pins `actions/upload-artifact` v7.0.0 at
`bbbca2ddaa5d8feaa63e36b76fdaad77386f024f` (also Node.js 24). Hosted Ubuntu 24.04
runners support these runtimes. The checkout/setup-node documentation requires
runner v2.327.1+ for Node 24; checkout's authenticated Git from container actions
requires v2.329.0+ (not used here). The app checks explicitly use Node 22.

Sources: [Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
[pinned upload implementation](https://github.com/actions/upload-pages-artifact/blob/fc324d3547104276b827a68afc52ff2a11cc49c9/action.yml),
[checkout runtime requirements](https://github.com/actions/checkout/blob/3d3c42e5aac5ba805825da76410c181273ba90b1/README.md).

## Local validation

Install the existing development-only Playwright version as documented in the
README, then run `npm test`, `npm run check`, and
`sh scripts/browser-checks.sh`. The latter starts the existing hardened server at
`/` and Python's plain static server with `dist/` mounted in a temporary
`StemTape/` directory. It runs the complete Chromium suite against both and checks
project-path assets, home navigation, fonts, security.txt, real 404 behavior and
meta-only CSP enforcement. No Nginx fallback or security response headers are used
for the prefix tests. Diagnostics/PDF/screenshots stay under ignored `artifacts/`;
root screenshots/PDF are preserved in `artifacts/root/`.

Preparation base: public HTTPS main `949713eefd1fcbc11f2375093ad63f7eb439d4aa`,
verified against `ls-remote` before branching. Local validation results are recorded
below; they cover the uncommitted candidate based on that SHA, not a future merged
commit. The workflow reruns the gates against the actual dispatched commit.

Local results on 2026-10-16 (Node 22.22.1, Playwright 1.62.1 native Chromium,
Linux arm64):

| Check | Result |
| --- | --- |
| `npm test` / `npm run check` | 69 tests passed; application syntax passed. |
| `sh scripts/browser-checks.sh` | Full suite passed at both `/` and `/StemTape/`, including PDF generation; Pages resource/navigation/meta-CSP probes passed. |
| Container build and existing smoke script | Passed using resolved base `nginx@sha256:970364228b1e4f932abc22d321932816782cca8a20b85a77552a7cfe9acfb3b5`; UID 10001, read-only filesystem, security headers, security.txt bytes/type, hidden-path denial and gzip passed. |
| Pinned upload action's Linux archive command, with hidden files enabled | Ran locally from the pinned action source. Its tar contained exactly 28 expected files and matching bytes, including security.txt. Remote artifact upload/deployment was not run. |
| Artifact rejection probes | Rejected omitted security.txt, added CNAME, changed index bytes and a symlink. |
| `actionlint` v1.7.12 | Both workflows passed (shellcheck integration disabled); shell syntax checked separately. |
| Hygiene and diff checks | Existing tracked-file/private-pattern check, new publish-file gate, test-module/shell syntax and `git diff --check` passed. This is not a full secret scan. |
| Visual/PDF review | Light/dark desktop, mobile preview and narrow dark settings screenshots inspected. PDF has A4 media box (594.95996 × 841.91998 pt); existing suite verifies 32 × 90 sheet SVG dimensions. Actual 200% browser zoom and physical print not performed. |

No commit, push, merge or deployment was performed. First remote Actions execution,
Pages settings/environment verification, live response inspection and test-site
verification remain outstanding. Physical printing, production proxy TLS/host
checks, full secret/image scans and broader manual accessibility/device review
remain release gates under the development contract; this test workflow does not
establish production readiness. Block a production release until those gates pass.
