# Security policy and deployment boundary

StemTape 0.3.0 is an initial implementation, not a production-audited release.

## Threat model
An anonymous internet-facing static site serves trusted HTML/CSS/ES modules, fonts and SVG icons. The server has no accounts, sessions, database, import/upload endpoint, webhook, OAuth token or user-data API. CSV and JSON are read locally. Browser printing produces PDF via the user's print dialog. This removes the corresponding session/CSRF/SSRF surfaces; it does not remove XSS or supply-chain risk.

A compromised host, dependency or deployed JavaScript can access same-origin localStorage. Storage is not encryption or a secret vault. Do not enter secrets. A host sees connection metadata even when plan data stays in the browser.

## Controls implemented
- All data rendered through DOM textContent/SVG text nodes and fixed attributes. No user HTML/SVG, remote image URL, script eval or external fetch.
- CSP at development and production servers: default deny, self scripts/styles/fonts, connect-src none, no objects/forms/frames. No inline script/style exceptions. X-Frame-Options DENY, nosniff, no-referrer and restricted permissions.
- Strict reconstruction/validation of imported JSON; schema version, scalar types, duplicate IDs, prototype keys and list/text/range limits. Unknown keys discarded. Invalid import never mutates the active state. Incompatible persisted state is preserved and offered for recovery.
- Bounded 2 MB imports, 200 cues per mode, 8 columns, 30 events, 20 personal presets. Spreadsheet formula-like text is prefixed on CSV export; JSON preserves exact strings. Spreadsheet software differs: do not re-enable formulas in untrusted files.
- Stable bundle of local Lucide SVG nodes and local fonts. User emojis use the OS font; never load external emoji images.
- Static container runs as 10001:10001 with root-owned assets, read-only filesystem, restricted tmpfs, dropped capabilities, no-new-privileges, resource limits and no production app port.
- Access logs off in app and default Caddy example; errors to bounded Docker logs. No application telemetry. Proxy/operator policy can change this.
- Immutable base-image digests required for production; the local-test example uses an explicit version tag. No credentials inside images. Docker build context is allowlisted.

## Operational responsibilities
Use a supported patched VPS OS and Docker. Restrict SSH by key and provider firewall/VPN, disable root/password login, expose only required web ports, retain out-of-band recovery access and keep management interfaces private. Check both IPv4 and IPv6 exposure. Docker published ports can bypass ordinary host firewall paths; only proxy ports should be public. Upstream DDoS protection/rate controls must be chosen with the host; a static app does not make denial of service impossible.

Only the proxy is public. Restrict allowed hostnames there. Do not enable untrusted forwarded-header processing. Caddy example uses a single canonical domain, explicit HTTPS redirect and one-year HSTS (no includeSubDomains/preload). Add only after valid TLS; don't include unrelated subdomains. The optional Traefik configuration assumes an already hardened proxy and configured certificate resolver.

Before production, execute the browser, container, proxy, vulnerability and secret-scan gates. No automated vulnerability scan or production deployment has been performed in this initial workspace. There is no Docker daemon here. Browser test installation was blocked by the execution environment. The supplied tests are a release gate, not proof they have passed.

## Reporting
Until a public repository/private reporting channel is established, contact the repository owner privately. Do not post exploitable vulnerabilities or secrets in public issues. Add a verified reporting contact and enable GitHub private vulnerability reporting before making the repository public.
