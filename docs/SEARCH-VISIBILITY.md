# Search visibility and sharing

StemTape is a static browser-local app. `dist/index.html` supplies the descriptive
title, description, canonical and social metadata without JavaScript. The existing
1200 × 400 `assets/banner-light.png` supplies share artwork. `dist/robots.txt` allows
the public app and assets; `dist/sitemap.xml` contains only `https://stemtape.cc/`.
Dialogs, local plans and exports are not public pages. No `lastmod` is supplied:
a build date would not reliably describe a page content change.

## Self-hosting URLs

There is no new configuration or build step. Before serving a self-hosted copy,
edit the checked-in static files in your own source/artifact:

- In `dist/index.html`, replace the canonical href and `og:url` with your chosen
  public HTTPS app URL, including any path prefix and trailing slash. Replace
  `og:image` and `twitter:image` with your own absolute URL for the bundled banner.
- In `dist/sitemap.xml`, replace the sole `loc` with that public app URL. In
  `dist/robots.txt`, replace the `Sitemap` URL with your absolute sitemap URL.
  Robots discovery uses the origin's `/robots.txt`; when hosting under a path,
  arrange the sitemap reference in the origin's robots file with its operator.
- Alternatively, omit the canonical link, `og:url`, image metadata (including
  image type/dimensions/alt), the sitemap file and the robots `Sitemap` line if
  you do not want to advertise production-specific URLs. Change the social card
  to `summary` if omitting the image. Keep the general crawl rules as appropriate
  for your host. The Pages artifact gate requires the sitemap for this project's
  production artifact; adapt that gate in a fork that intentionally omits it.

Keep module, CSS, font, icon and home paths relative; root and project-path hosting
remain supported. Private `.env` files do not rewrite static metadata. Do not copy
public templates over private configuration. Also customize security.txt as
explained in [the security policy](../SECURITY.md). The existing manually dispatched
Pages workflow remains specific to stemtape.cc; a self-hoster chooses their own
publishing destination separately.

## Repository, served artifact and Cloudflare

The repository previously had no robots or sitemap file. Live inspection on
2026-11-06 returned a **200** robots response with a Cloudflare Managed Content
block, `User-agent: *`, `Allow: /` and `Content-Signal: search=yes,ai-train=no,use=reference`,
plus specific crawler disallows, but **no Sitemap directive**. This differs from
both the prior repository and the candidate's minimal locally served robots file.
The live response may be supplied or modified by Cloudflare; adding a repository
file does not establish that the final public response will use it.

After a separately authorized deployment, compare the raw public robots response
with `dist/robots.txt`. Confirm the canonical sitemap reference survives and the
public app/assets remain crawlable for search crawlers. If Cloudflare continues to
replace or modify it, the operator must review the managed robots configuration
and arrange the sitemap reference there as appropriate, preserving the intended
crawler policy. No Cloudflare or security setting was changed for this patch.

The same inspection requests to `/` and `/sitemap.xml` returned **Cloudflare HTTP
403**, body **`error code: 1010`**, with no redirects observed. They supplied plain
text error responses, so live HTML title/canonical/indexing directives and sitemap
contents could not be verified. No `X-Robots-Tag` appeared on these three responses;
that does not establish the directives on successfully served HTML. The 403s
establish that these inspection requests were blocked, not that Googlebot is
blocked or that sitemap.xml is absent. No block bypass was attempted. See the
[dated validation record](VALIDATION.md) for local artifact and browser evidence.

## Manual Search Console setup

1. In [Google Search Console](https://search.google.com/search-console), add a
   **Domain** property for `stemtape.cc` under the owner's Google account.
2. Copy the exact DNS TXT verification record Google supplies. In the authorized
   DNS dashboard, add that TXT record at the name Google specifies, preserving
   existing records. Wait for DNS propagation, then select Verify. Retain the
   verification TXT record. No token is included in this repository; this guide
   does not authorize a DNS change.
3. After an approved deployment and public response checks, submit
   `https://stemtape.cc/sitemap.xml` in Sitemaps. Check its retrieval result and any
   errors rather than assuming it was accepted.
4. Use URL inspection for `https://stemtape.cc/` and **Test live URL** to check
   Google's actual access, robots/indexing status and rendered page. Review the
   declared and Google-selected canonical when available. If Google reports an
   access problem, investigate its result and Cloudflare security events separately;
   do not weaken security to work around this environment's blocked inspection.
   Request indexing if appropriate and review later reports.

Verification, sitemap submission and requesting indexing do not guarantee indexing
or ranking. Googlebot access and final public metadata remain external checks.
