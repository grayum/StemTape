# GitHub Pages behind Cloudflare

## Current hosted service

As confirmed by the owner on 2026-10-17, **https://stemtape.cc/** is served by
**GitHub Pages, proxied through Cloudflare**. The apex returns HTTP 200;
**https://www.stemtape.cc/** returns HTTP 301 to the canonical apex URL.
Cloudflare SSL/TLS mode is **Full (strict)**. The owner confirmed on 2026-10-17
that the former VPS is **turned off**. Deletion of the VPS, disks, snapshots and
backups is **not confirmed**; it is not an immediately available rollback host. Docker/Caddy/Traefik remain optional
[self-hosting installations](DEPLOYMENT.md), not the current hosted-service path.

This record distinguishes owner-confirmed configuration and supplied curl output
from independent checks. No production deployment, DNS/rule edit or VPS shutdown
is authorized by this documentation update.

## GitHub Pages settings and manual deployment

The service uses `.github/workflows/pages.yml` from `main`, with the existing
validation gates. Deployment remains **manual-only** through `workflow_dispatch`,
restricted to `main` in `grayum/StemTape`. No deployment trigger is changed here.
Repository Pages uses GitHub Actions and the custom domain `stemtape.cc`.
**Enforce HTTPS is required** in repository Settings → Pages and was confirmed
**enabled by the user on 2026-10-17**. This is user confirmation, not an independent
authenticated settings check. A working proxied HTTPS response alone does not prove
that setting is enabled.

Account-level GitHub Pages domain ownership verification is **recommended** to
protect against domain takeover. Completion and the verification TXT value are
**unconfirmed**. On 2026-10-17 the user reported that GitHub did not prompt for
account-level verification; that does not establish ownership verification. It is
separate from repository DNS validation, custom-domain setup and certificate
provisioning, which do not prove account-level verification is complete. If
configured later, use the exact TXT record GitHub supplies in account Pages settings
and keep it after verification. Do not invent a challenge value.

For a future authorized deployment, review/merge the candidate, then use
**Actions → Test on GitHub Pages → Run workflow → main**. CI checks the immutable
`github.sha`: Node syntax/data tests, full Chromium suites at `/` and `/StemTape/`,
Pages resource/navigation/meta-CSP tests, file hygiene and container smoke. The
artifact job checks `dist/`, uploads it and inspects the resulting tar before the
deploy job can run. The `github-pages` environment exposes the deployment URL;
concurrency serializes deployments. Default permissions are `contents: read`;
only deployment receives `pages: write` and `id-token: write`. Automatic
`GITHUB_TOKEN` and OIDC are used, without a PAT or separate deployment credentials.

### Workflow destination guard: focused correction

Inspected main `c07446315de85975fb59580b2b76e4a1543380e1` used this check:

```sh
test "${PAGES_BASE_URL%/}" = 'https://grayum.github.io/StemTape'
```

`PAGES_BASE_URL` comes from `steps.pages.outputs.base_url`. The pinned
[`configure-pages` entry point](https://github.com/actions/configure-pages/blob/45bfe0192ca1faeb007ade9deae92b16b8254a0d/src/index.js) obtains the Pages API's `html_url`; its
[output helper](https://github.com/actions/configure-pages/blob/45bfe0192ca1faeb007ade9deae92b16b8254a0d/src/output-pages-base-url.js) removes the trailing slash from that parsed URL. Neither the shell check nor that output helper
requests the website, follows its custom-domain redirect, or appends `/StemTape/`
to `stemtape.cc`. A configured canonical `https://stemtape.cc/` fails the old
comparison and stops the deploy job before `deploy-pages`; stale github.io
configuration could pass while pointing at the wrong intended destination. This
is a configuration guard, not live content or redirect validation.

The focused correction in this change keeps the configured Pages output as its
input and requires the canonical root, accepting an optional trailing slash:

```sh
test "${PAGES_BASE_URL%/}" = 'https://stemtape.cc'
```

It rejects github.io, www, HTTP and `https://stemtape.cc/StemTape/` targets. Only
this expected URL and its step label change; manual-only/main-only restrictions,
permissions, action pins, environment/concurrency and every validation/artifact
gate remain intact. Local browser suites still cover **both `/` and `/StemTape/`**.
The guard still does not certify a live deployment or redirect. No deployment was
performed to investigate this issue.

## DNS and certificate settings

The supplied configuration/export identifies these origin targets. The production
A, AAAA and www CNAME records are **proxied through Cloudflare**; public DNS answers
may therefore expose Cloudflare addresses rather than these configured targets.

| Name | Type | Configured target(s) |
| --- | --- | --- |
| `@` | A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `@` | AAAA | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| `www` | CNAME | `grayum.github.io` |

Configured CAA entries from the supplied export:

```text
0 issue "letsencrypt.org"
0 issue "pki.goog; cansignhttpexchanges=yes"
```

These are the confirmed configured entries, not a claim that all effective DNS
answers contain only these records. Cloudflare may expose additional CAA records
for managed certificate issuance. Distinguish exported configuration from live
responses; do not remove provider-managed authorizations based on that difference.

Full (strict) validates the origin certificate as well as encrypting traffic.
GitHub's custom-domain certificate must be valid for the requested hostname;
keep origin validation enabled and GitHub Enforce HTTPS required.

## Cloudflare rules

Dashboard names may differ. The functional settings for all three rules below
use this shared matching expression:

```text
(http.host in {"stemtape.cc" "www.stemtape.cc"})
```

### Response Header Transform Rule

Use **Set static**, rather than Add, for these response headers:

| Header | Value |
| --- | --- |
| Content-Security-Policy | `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Referrer-Policy | `no-referrer` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), payment=()` |

Set replaces existing values and avoids duplicate `X-Content-Type-Options` headers.
The supplied curl evidence confirms the duplicate nosniff header was resolved.
`Strict-Transport-Security: max-age=31536000` was also observed; its originating
rule/setting has not been established. Do not attribute it to this Transform Rule
without evidence or add unverified preload/includeSubDomains claims.

### Cache Rule

Set **Cache eligibility → Bypass cache**. This controls Cloudflare edge caching,
not browser storage or GitHub's upstream CDN caching. `CF-Cache-Status: DYNAMIC`
is consistent with bypass but does not, by itself, prove a specific rule matched.

### Cache Response Rule

Use **Modify Cache-Control** with these operations:

- Remove `max-age`.
- Set `no-cache` with **no qualifiers/header names**.
- Keep **Cloudflare only disabled**, so the directive reaches browsers.

The verified final apex response was exactly:

```text
Cache-Control: no-cache
```

`no-cache` permits storage but requires revalidation before reuse; it is not
`no-store`. It does not clear browser localStorage or saved plans. These rules do
not control GitHub's upstream caching.

Two migration pitfalls were observed: setting Cache-Control through the response
header Transform Rule was rejected in this setup, so the Cache Response Rule was
used. Entering “Set” as a qualifier produced `no-cache="Set"`; qualifiers are
header names, not the action name. That value was corrected to unqualified
`no-cache` for whole-response revalidation. The final corrected cache header was
not separately rechecked on www in the supplied evidence. After network access
was allowed, a new independent public check on 2026-10-17 confirmed the www 301
response has exactly `Cache-Control: no-cache`, with no qualifier or max-age.
See the newly observed results below; the initial attempt had been policy-blocked.

### Network Error Logging

Cloudflare **NEL was disabled**. Subsequent supplied apex and www responses no
longer contained `NEL` or `Report-To`. This does not eliminate all hosting logs
or provider data processing: Cloudflare and GitHub still process hosting requests
and normal connection metadata. Under the existing application design, plan
contents, imports, exports, storage and printing remain client-side. StemTape
adds no application analytics or tracking scripts.

## Migration sequence and troubleshooting

The initial proxied cutover returned **Cloudflare 526** while GitHub's custom-domain
certificate was not yet ready. The records were temporarily changed to **DNS only**,
www pointed directly to `grayum.github.io`, and GitHub provisioned its certificate.
Proxying was restored afterward with **Full (strict)**.

This is the observed migration sequence, not a requirement to disable proxying
for every renewal. Investigate origin certificate readiness, hostname coverage,
DNS and issuer authorization when diagnosing 526. Do not use weaker TLS validation
as the normal solution. Any future DNS/proxy change needs separate authorization.

Keeping **https://stemtape.cc** preserved the browser origin and therefore access
to existing local plans in the same browser/profile. The initial
`https://grayum.github.io/StemTape/` test hostname had separate storage. Storage is
origin-scoped, not path-scoped: projects under `https://grayum.github.io` share an
origin, whereas the canonical custom domain does not share that storage. Export
JSON for intentional transfer or backup; a hosting migration does not upload plans.
After custom-domain configuration, do not assume the github.io URL remains an
independent test endpoint; check its routing before using it for testing.

## Security and privacy differences

Pages does **not** run the repository's Nginx/Caddy configuration. The canonical
Cloudflare-proxied site receives the response headers above at the edge. The HTML
meta CSP remains an additional supported-document policy, derived from Nginx's
policy without `frame-ancestors`; it does not replace header-only anti-framing
protection. Both applicable policies are enforced. HTML also has no-referrer
metadata. No unsafe-inline/eval or extra network permission is introduced.

Direct GitHub Pages responses bypass Cloudflare's custom rules. Do not assume
they have the same CSP, X-Frame-Options, Permissions-Policy, cache policy or NEL
behavior. Meta CSP cannot set `frame-ancestors` and does not protect non-HTML
resources or provider error documents. Any GitHub-provided response headers are
platform-owned. Nginx hidden-path denial, method restrictions, health endpoint,
logging, caching and compression settings apply only to optional container hosts.

## security.txt

Owner-supplied retrieval evidence verified
**https://stemtape.cc/.well-known/security.txt** with these contents, matching
`dist/.well-known/security.txt`:

```text
Contact: mailto:securitytxt.reps@mail.gray-um.com
Expires: 2027-09-01T00:00:00Z
Preferred-Languages: en, nl
Canonical: https://stemtape.cc/.well-known/security.txt
```

Maintain the mailbox and renew Expires before 2027-09-01, keeping expiry less than
one year ahead. The artifact must retain `.well-known/security.txt`. A project-path
copy at `/StemTape/.well-known/security.txt` is not the origin-wide discovery
endpoint; the canonical production endpoint above is the verified one.

## Static artifact and paths

`dist/` is checked-in application source, not generated output. There is no build
step or runtime package installation. Relative module, CSS, font/icon and `./`
home paths support both `/` and `/StemTape/`; external credit links stay unchanged.
There is no application fetch API, manifest or service worker.

Pinned `upload-pages-artifact` v5.0.0 supports `include-hidden-files: true`, preserving
security.txt. The publish gate compares the action's actual tar paths and bytes
with tracked `dist/` files and rejects symlinks, unexpected hidden paths, CNAME,
extra/missing files and byte mismatches. No repository root or diagnostics are
published. With an Actions custom workflow, GitHub documents that a repository
CNAME file is not required for the custom domain; the existing no-CNAME gate stays.

## Rollback and powered-off VPS

The user confirmed on **2026-10-17** that the former production VPS is **turned
off**. It is not running or immediately available for rollback. Turning it off
does not establish deletion or full decommissioning: deletion of the VPS, disks,
snapshots and backups is **not confirmed**. Preserve existing source, private
configuration, certificate state, tested images, reviewed Pages artifacts and
backups; do not overwrite working files with public examples. No VPS lifecycle
action is part of this documentation update.

Before a separately authorized rollback, export complete current JSON, close older
tabs and verify the target app version against current browser state in an isolated
profile. The same hostname preserves storage access; it does not establish schema
or optional-field compatibility. Older code may drop fields on save even when it
accepts the same v1 schema. Review [version-specific limitations](../UPGRADE.md),
particularly cue/note identities and footer data. Restore an appropriate backup
only after preserving the current state. A separately authorized VPS rollback
would first require **starting the VPS** and verifying its application/version,
configuration, valid TLS/certificates, canonical routing, security headers and
assets **before switching traffic back**. Do not assume old certificates or
configuration are ready just because disks were retained; do not weaken Full
(strict). No VPS start, rollback or DNS change was performed here.

## Production evidence and remaining confirmations

User-reported testing dated **2026-10-17**: **“Manual checks passed as far as the
user could tell.”** The user previously confirmed saved plans, editing and print
preview looked good with the restored CSP active. These reports do not establish
physical printing, exhaustive browser/device coverage, screen-reader testing or
independent automated production testing.

Supplied curl evidence, not newly executed production tests:

| Check | Supplied result |
| --- | --- |
| Apex | HTTP 200. |
| www | HTTP 301 to canonical URL. |
| Security headers | Expected headers on both; duplicate nosniff resolved. |
| HSTS | `max-age=31536000` observed; source rule not established. |
| NEL / Report-To | Absent on both after disabling NEL. |
| Corrected Cache-Control | Final apex `no-cache` passed; final corrected www header **not separately rechecked**. |
| security.txt | Canonical endpoint and contents above verified. |

New independent public observations on **2026-10-17**, after network permissions
were allowed, are separate from the supplied evidence and earlier blocked attempts:

| Request | Newly observed result |
| --- | --- |
| `https://www.stemtape.cc/` | HTTP 301; `Location: https://stemtape.cc/`. Response Date: 14:47:58 GMT. |
| www Cache-Control | Exactly one header with unqualified `no-cache`; no `max-age` or `no-cache="Set"`. |
| www security headers | Expected CSP including `frame-ancestors 'none'`, one `X-Content-Type-Options: nosniff`, X-Frame-Options DENY, no-referrer and the documented Permissions-Policy. HSTS `max-age=31536000` observed without attributing its source rule. |
| www reporting headers | Neither NEL nor Report-To present. |
| `https://grayum.github.io/StemTape/` | HTTP 301 directly to `https://stemtape.cc/`, with no `/StemTape/` suffix. Response Date: 14:48:02 GMT. |
| Apex retry, `https://stemtape.cc/` | Subsequently succeeded: HTTP 200, HTML response, exactly one unqualified `Cache-Control: no-cache`, expected CSP/X-Frame-Options/Referrer-Policy/Permissions-Policy, one nosniff header and HSTS `max-age=31536000`; NEL/Report-To absent. Response Date: 14:49:12 GMT. HSTS source rule remains unestablished. |

The live redirect confirms why project-path coverage must remain separate from
production URL handling. It does not change the original workflow diagnosis: the
shell guard compares configured metadata and never follows that redirect itself.
Earlier www/github.io HTTP 403 attempts were also environment-policy responses;
these successful retries supersede the earlier www/apex network-check uncertainty.
The later direct apex retry also passed HTTP/header assertions and returned HTML;
it does not establish an application/browser, physical-print or deployment test.

User confirmations on 2026-10-17 establish Enforce HTTPS enabled and the former
VPS turned off. Account-level ownership verification and its TXT value remain
unconfirmed (no prompt was presented). Corrected www Cache-Control is now
independently confirmed as above. Deletion of the VPS, disks, snapshots and backups remains
unconfirmed. The workflow guard is corrected in this change, but
its next remote execution has not been tested. Supplied evidence does not establish all release gates or a security
audit. The [validation record](VALIDATION.md) keeps local and production evidence
separate.

## Provider guidance checked 2026-10-17

GitHub's current documentation was read directly. Cloudflare's documentation site
returned HTTP 403 in this environment; the current official documentation was read
from `cloudflare/cloudflare-docs` on its `production` branch instead. The functional
settings above are the supplied production configuration; dashboard names may vary.

- GitHub [custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Enforce HTTPS and certificates](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https), and [account domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).
- Cloudflare [Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/), [Response Header Transform Rules](https://developers.cloudflare.com/rules/transform/response-header-modification/), [Cache Rule settings](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/), [Cache Response Rule settings](https://developers.cloudflare.com/cache/how-to/cache-response-rules/settings/), [CAA](https://developers.cloudflare.com/ssl/edge-certificates/caa-records/) and [NEL](https://developers.cloudflare.com/network-error-logging/).
- [Official Cloudflare documentation source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs).

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

## 2026-10-16 preparation validation (historical)

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

At that preparation stage no commit, push, merge or deployment had been performed;
remote Actions, Pages settings and live checks were then outstanding. The migration
and supplied production evidence above supersede that hosting-status snapshot. Physical printing, production proxy TLS/host
checks, full secret/image scans and broader manual accessibility/device review
remain release gates under the development contract; this test workflow does not
establish production readiness. Block a production release until those gates pass.
