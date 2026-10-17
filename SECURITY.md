# Security policy and deployment boundary

The current hosted service at https://stemtape.cc/ uses GitHub Pages behind Cloudflare. The owner-confirmed migration and supplied response evidence do not constitute a production security audit. See the [migration and operational record](docs/GITHUB-PAGES.md).

## Threat model
An anonymous internet-facing static site serves trusted HTML/CSS/ES modules, fonts and SVG icons. The server has no accounts, sessions, database, import/upload endpoint, webhook, OAuth token or user-data API. CSV and JSON are read locally. Browser printing produces PDF via the user's print dialog. This removes the corresponding session/CSRF/SSRF surfaces; it does not remove XSS or supply-chain risk.

A compromised host, dependency or deployed JavaScript can access same-origin localStorage. Storage is not encryption or a secret vault. Do not enter secrets. GitHub and Cloudflare process hosting requests and connection metadata even when plan data stays in the browser. Cloudflare NEL was disabled and supplied responses no longer contained NEL/Report-To; this does not eliminate all hosting logs or provider data processing.

## Controls implemented
- HTML meta CSP supplies supported document restrictions on static hosts such as GitHub Pages; header-only protections on the canonical hosted service are supplied by the documented Cloudflare rules. Nginx/Caddy configurations apply to optional self-hosted installations. See [Pages security differences](docs/GITHUB-PAGES.md#security-and-privacy-differences).
- All data rendered through DOM textContent/SVG text nodes and fixed attributes. No user HTML/SVG, remote image URL, script eval or external fetch.
- CSP at the Cloudflare edge for the canonical hosted service and in the local/self-hosted server configurations: default deny, self scripts/styles/fonts, connect-src none, no objects/forms/frames. No inline script/style exceptions. X-Frame-Options DENY, nosniff, no-referrer and restricted permissions.
- Strict reconstruction/validation of imported JSON; schema version, scalar types, duplicate IDs, prototype keys and list/text/range limits. Unknown keys discarded. Invalid import never mutates the active state. Incompatible persisted state is preserved and offered for recovery.
- Bounded 2 MB imports, 200 cues per mode, 8 columns, 30 events, 20 personal presets. Spreadsheet formula-like text is prefixed on CSV export; JSON preserves exact strings. Spreadsheet software differs: do not re-enable formulas in untrusted files.
- Stable bundle of local Lucide SVG nodes and local fonts. User emojis use the OS font; never load external emoji images.
- Optional self-hosted static container runs as 10001:10001 with root-owned assets, read-only filesystem, restricted tmpfs, dropped capabilities, no-new-privileges, resource limits and no production app port.
- No application analytics or tracking scripts. Optional Nginx/Caddy examples disable access logs and bound Docker error logs; this is not a claim about GitHub/Cloudflare hosting logs.
- Immutable base-image digests required for self-hosted production; the local-test example uses an explicit version tag. No credentials inside images. Docker build context is allowlisted.

## Operational responsibilities

For the hosted service, preserve Cloudflare Full (strict), the documented response-header/cache rules, valid GitHub custom-domain TLS and canonical routing. GitHub Enforce HTTPS is required and was confirmed enabled by the user on 2026-10-17. Account-level domain verification is recommended and unconfirmed: GitHub did not prompt the user, and repository DNS validation/certificate provisioning do not establish account ownership verification. Keep repository/environment access private and review the [configured Pages destination guard](docs/GITHUB-PAGES.md#github-pages-settings-and-manual-deployment) before another deployment. The user confirmed on 2026-10-17 that the former VPS is turned off. Rollback requires starting it and checking application, TLS and configuration before traffic changes; deletion of the VPS, disks, snapshots and backups is unconfirmed.

For optional VPS/Docker installations, use a supported patched VPS OS and Docker. Restrict SSH by key and provider firewall/VPN, disable root/password login, expose only required web ports, retain out-of-band recovery access and keep management interfaces private. Check both IPv4 and IPv6 exposure. Docker published ports can bypass ordinary host firewall paths; only proxy ports should be public. Upstream DDoS protection/rate controls must be chosen with the host; a static app does not make denial of service impossible.

On those self-hosted installations, only the proxy is public. Restrict allowed hostnames there. Do not enable untrusted forwarded-header processing. Caddy example uses a single canonical domain, explicit HTTPS redirect and one-year HSTS (no includeSubDomains/preload). Add only after valid TLS; don't include unrelated subdomains. The optional Traefik configuration assumes an already hardened proxy and configured certificate resolver.

[Main CI run 36886880381](https://github.com/grayum/StemTape/actions/runs/36886880381) passed on 2026-10-01, including Chromium browser regressions, the container smoke test and basic tracked-file/credential-pattern checks. These checks are not a security audit or full secret/image-vulnerability scan. Outstanding scanning, manual/device/accessibility and physical-print gates remain in the [validation record](docs/VALIDATION.md). Owner-reported 2026-10-17 production testing and supplied curl evidence are recorded separately; they do not establish exhaustive verification or a security audit. Host/network exposure checks apply to optional self-hosted installations.

## Reporting
Report vulnerabilities privately to [securitytxt.reps@mail.gray-um.com](mailto:securitytxt.reps@mail.gray-um.com). GitHub private vulnerability reporting is an alternative when enabled: use the repository Security tab’s “Report a vulnerability” option. Do not post exploitable vulnerabilities or secrets in public issues.

The owner-authorized contact is published in `/.well-known/security.txt`, expiring on 2027-09-01. Review the mailbox and renew the expiry before that date (keep it less than one year ahead). Self-hosters must replace Contact and Canonical with their monitored private channel and HTTPS origin, and maintain their own expiry. The canonical hosted endpoint was verified in supplied evidence. The exact-path exception and general hidden-path denial in Nginx apply to optional container installations, not to Pages server configuration.

## v0.4.0 edge/origin review

The owner-reported Internet.nl baseline on 2026-10-02 scored 95%; remaining TLS findings belong to the Cloudflare edge and must be tested separately from Caddy. See the [security/deployment runbook](docs/SECURITY-DEPLOYMENT.md) for historical VPS review context and optional self-hosting guidance; use the [Pages migration record](docs/GITHUB-PAGES.md) for current hosting settings. The VPS example adds only `NET_BIND_SERVICE` to the proxy for execution of the official capability-marked Caddy binary, retaining all other restrictions. The v0.4.1 security.txt contact is supplied by the owner. Remaining Cloudflare cipher/key-exchange findings are accepted deployment limitations for now; no perfect score or completed remediation is claimed. No production or DNS settings were changed by this review.
