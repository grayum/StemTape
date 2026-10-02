# v0.4.0 security and deployment review

This is an operator runbook, not a record of production changes. The owner-provided [Internet.nl baseline](https://internet.nl/site/stemtape.cc/4328313/) tested on 2026-10-02 scored 95%. Headers, HSTS, certificate, HTTPS redirect, IPv6, DNSSEC and RPKI passed; preserve those controls. No after-change public result is recorded.

## Ownership

| Finding / control | Owner | Action |
| --- | --- | --- |
| Public TLS 1.0/1.1 accepted | Cloudflare edge | Set minimum TLS 1.2; keep TLS 1.3 on. |
| Public CBC/SHA suites | Cloudflare edge | Retest after protocol change; investigate the remaining TLS 1.2 suites separately. |
| Public SHA-1 key-exchange signatures | Cloudflare edge | Inspect the handshake signature result, not just the certificate's signature; raise remaining findings with Cloudflare. |
| CAA | Authoritative DNS / Cloudflare DNS | Permit edge issuance and origin renewal, including wildcard/backup certificates. |
| Origin certificate, TLS, host routing and container execution | Caddy origin on DigitalOcean | Verify independently using the canonical Host and SNI. |
| security.txt | Application/repository plus verified security contact owner | Do not publish until the private reporting endpoint is verified. |

Traffic is visitor → Cloudflare → DigitalOcean → Caddy → static app. The internal alias resolves directly to Droplet IPv4; it is an address-discovery aid, not the public certificate name. A Caddy cipher change cannot fix a Cloudflare edge handshake. Keep client-side plans, imports and exports out of server requests/logs.

## Manual Cloudflare changes (not executed)

1. Select the `stemtape.cc` zone. Record the current SSL/TLS mode, minimum version, TLS 1.3, cipher settings, per-hostname overrides and certificate issuers/algorithms for rollback. Keep this operator record outside the source checkout.
2. Verify the origin certificate as below. In **SSL/TLS → Overview**, select/configure **Full (strict)**. It requires an unexpired trusted certificate whose SAN matches `stemtape.cc`. Do not use Flexible or disable certificate verification to conceal an origin error. Investigate 526 errors at the origin.
3. In **SSL/TLS → Edge Certificates**, set **Minimum TLS Version → TLS 1.2** and **TLS 1.3 → On**. Both zone-level controls are available on Free, Pro, Business and Enterprise. Zone changes affect other proxied hostnames; review them first. Per-hostname minimum versions require Advanced Certificate Manager and are configured via API; inspect existing overrides.
4. Retest the public endpoint. Minimum TLS 1.2 alone does not remove every CBC/SHA suite available in TLS 1.2, and a cipher's hash name is not its handshake signature algorithm.
5. If remaining suites are unacceptable, Cloudflare currently requires **Advanced Certificate Manager** for edge cipher customization, including Universal certificates. With that entitlement, **Edge Certificates → Cipher suites → Configure → By security level → Next → Modern → Save** selects Cloudflare's forward-secret AEAD TLS 1.2 set; keep TLS 1.3 enabled. Check RSA/ECDSA compatibility and hostname overrides. TLS 1.3 suites are not individually configurable. Without entitlement, record the limitation and request an owner decision on ACM/support; do not pretend a Caddy setting substitutes for it.
6. Retest SHA-1 key-exchange signatures independently. Capture the exact failed protocol, offered signature algorithms, certificate type and server handshake signature with a current TLS test tool. A SHA-256 certificate does not prove a SHA-1 handshake is disabled. Escalate persistent edge signature findings to Cloudflare; do not assume changing suites guarantees removal.

## CAA without breaking renewal (not executed)

Inventory existing CAA at `stemtape.cc`, inherited parent records and any CNAME targets before editing. Cloudflare's official guidance says it adds CAA for its managed issuance; inspect effective authoritative answers as well as dashboard entries. Do not delete provider-managed authorizations or add an exclusive Let's Encrypt-only policy while using Cloudflare certificates.

In **DNS → Records → Add record**, choose **CAA**, **Name: @**, **Flags: 0**, **Tag: issue**, and the CA domain value below. Repeat for `issuewild` when authorizing wildcard issuance (Cloudflare edge certificates commonly include wildcards). CAA is a DNS record, not a proxy switch.

| CA role | CA value for `issue` / `issuewild` |
| --- | --- |
| Let's Encrypt origin renewal and possible edge issuance | `letsencrypt.org` |
| Google Trust Services edge issuance | `pki.goog; cansignhttpexchanges=yes` |
| SSL.com edge issuance | `ssl.com` |
| Sectigo Cloudflare backup certificates | `sectigo.com` |

The set above accommodates Cloudflare's currently documented managed/backup CAs plus Let's Encrypt. Recheck the official CA list and actual certificate products before saving. Existing `issuewild` overrides wildcard `issue` behavior: do not accidentally deny edge wildcard renewal. Do not use restrictive `accounturi` or `validationmethods` parameters without validating both issuance paths. If the origin enables any additional ACME issuer/fallback, authorize it too or intentionally configure the origin for the supported issuer before renewal. Never remove `letsencrypt.org` while relying on Let's Encrypt renewal. Monitor issuance/renewal after propagation; an already-valid certificate is not proof the next renewal will succeed.

## Origin checks with verified Host/SNI (not executed)

Run from an authorized machine with access to the origin. Set `STEMTAPE_ORIGIN_IPV4` to the Droplet address obtained from the internal alias; do not use the alias as the URL or SNI:

```sh
curl --resolve "stemtape.cc:443:${STEMTAPE_ORIGIN_IPV4}" --fail --show-error --head https://stemtape.cc/
openssl s_client -connect "${STEMTAPE_ORIGIN_IPV4}:443" -servername stemtape.cc -verify_hostname stemtape.cc -verify_return_error -tls1_2 </dev/null
openssl s_client -connect "${STEMTAPE_ORIGIN_IPV4}:443" -servername stemtape.cc -verify_hostname stemtape.cc -verify_return_error -tls1_3 </dev/null
```

Use the normal system trust store with the Let's Encrypt certificate. Never use `curl -k` or omit verification. If an intentional Cloudflare Origin CA certificate replaces Let's Encrypt, use the verified Origin CA trust root explicitly; it is not publicly trusted. A blocked direct connection can be an intended firewall restriction; do not open the origin publicly merely to test it. Check canonical Host rejection and redirection separately. The repository Caddyfile already inherits modern TLS 1.2–1.3 defaults; no speculative cipher list is added.

## Caddy executable capability and private config

The official Alpine Caddy Dockerfile applies `setcap cap_net_bind_service=+ep /usr/bin/caddy`. With every capability removed from the bounding set, execution of a capability-marked executable can fail with `Operation not permitted`, even though this configuration binds high internal ports 8080/8443. The VPS example adds **only `NET_BIND_SERVICE` to proxy**, retaining `cap_drop: [ALL]`, UID/GID 10001, read-only root, no-new-privileges, init and limits. The app retains no added capability. Do not grant privileged mode, root, SYS_ADMIN or remove no-new-privileges.

The public example requires an operator-supplied image digest; it does not contain the live pin. The deployed digest has not been supplied, so exact-image verification remains required. On a local Docker test machine, set `STEMTAPE_CADDY_IMAGE` to that public pinned image and compare:

```sh
docker run --rm --init --user 10001:10001 --read-only --cap-drop ALL --security-opt no-new-privileges --network none "$STEMTAPE_CADDY_IMAGE" caddy version
docker run --rm --init --user 10001:10001 --read-only --cap-drop ALL --cap-add NET_BIND_SERVICE --security-opt no-new-privileges --network none "$STEMTAPE_CADDY_IMAGE" caddy version
```

The first command is the negative reproduction, not a required failure for all possible custom images. If the pin lacks file capabilities or either result differs, investigate the actual binary/runtime before broadening permissions. Test configuration startup as well as `version`. Re-run this check when changing the pin.

Source lives at `/opt/docker/stemtape`; private deployment config lives at `/opt/docker/stemtape-config`. Keep private files and certificate volumes outside Git. For a manual operator change, use `vim /opt/docker/stemtape-config/docker-compose.yaml` (adjust the basename to the existing private file). Add `cap_add: [NET_BIND_SERVICE]` to **proxy only**. If editing the private Caddyfile, use `vim /opt/docker/stemtape-config/Caddyfile`. Preserve the existing absolute source/config mounts, persistent certificate storage, private env-file location and project name. Do not copy the example over a working deployment or relocate its data. Review `docker compose --project-directory /opt/docker/stemtape --env-file /opt/docker/stemtape-config/.env -f /opt/docker/stemtape-config/docker-compose.yaml config --quiet` locally as operator before separately authorizing any restart. No production command was executed in this review.

## security.txt decision

No verified private vulnerability-report URL/email is currently recorded. The owner's website, public issues and an unverified GitHub advisory URL are not substitutes. The owner must confirm a monitored private endpoint and permission to publish it. Then add `/.well-known/security.txt` with a verified `Contact`, canonical HTTPS URL and a maintained `Expires` date (RFC 9116, less than one year ahead), and verify public retrieval through both proxies. Until then no placeholder endpoint or contact file is shipped. Nginx currently denies dot paths; any future well-known exception must be limited to that exact public file and tested without exposing other dotfiles.

## Before/after and rollback

Before changing anything, save the baseline report, effective public DNS/CAA answers, Cloudflare settings and a private copy of working deployment settings and image digests. Test public `https://stemtape.cc` separately from the verified origin commands above. Use a current Internet.nl re-test and TLS scanner supporting old protocol probes: a local OpenSSL build refusing TLS 1.0 is not evidence that the server refused it. Record IPv4/IPv6, TLS versions, cipher and handshake-signature results, headers, certificate chain, redirect and date. Recheck the previously passing tests after each change. Do not claim a new score until the public report exists.

If a change breaks access, revert only that change to the recorded settings; restoring a legacy TLS/cipher policy reintroduces its documented risk and needs an explicit operator decision. Prefer fixing origin trust while retaining Full (strict), not bypassing verification. For CAA, restore the prior record set (including wildcard policy), allow propagation and verify renewals; never remove required issuer permissions blindly. For proxy config/image changes, restore the previous private config and image digest, preserving certificate volumes and browser backups. Retest after rollback. No push, deployment, DNS or Cloudflare changes are authorized by this document.

## Official guidance checked 2026-10-02

Public documentation sites returned HTTP 403 in this sandbox; the same official sources were read from their maintainers' GitHub repositories:

- [Cloudflare minimum TLS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/minimum-tls/), [TLS 1.3](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/tls-13/), [Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/).
- [Cloudflare cipher customization](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/cipher-suites/customize-cipher-suites/), [dashboard steps](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/cipher-suites/customize-cipher-suites/dashboard/), [security levels](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/cipher-suites/recommendations/).
- [CAA records](https://developers.cloudflare.com/ssl/edge-certificates/caa-records/) and [CA authorizations](https://developers.cloudflare.com/ssl/reference/certificate-authorities/#caa-records); [official documentation source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ssl).
- [Caddy TLS defaults](https://caddyserver.com/docs/caddyfile/directives/tls), [official documentation source](https://github.com/caddyserver/website/blob/master/src/docs/markdown/caddyfile/directives/tls.md), [official Alpine image Dockerfile](https://github.com/caddyserver/caddy-docker/blob/master/2.11/alpine/Dockerfile).

## Local container evidence (2026-10-02)

On official `caddy:2.10.2-alpine`, resolved to `caddy@sha256:4c6e91c6ed0e2fa03efd5b44747b625fec79bc9cd06ac5235a779726618e530d`, the all-capabilities-dropped probe failed with `[FATAL tini] exec caddy failed: Operation not permitted`. Adding only NET_BIND_SERVICE passed `caddy version`, offline HTTP startup via `scripts/caddy-smoke.sh`, and validation of the repository Caddyfile with a synthetic `stemtape.test` hostname and networking disabled. Public-example Compose validation also passed. This is a representative official image test, not verification of the unidentified live pin or a recommendation to deploy that version. A probe for `caddy:2.11.6-alpine` (referenced by the current official source) was unavailable in the accessible registry; no result for it is claimed. No ACME issuance, origin connection, DNS or Cloudflare setting was tested or changed.
