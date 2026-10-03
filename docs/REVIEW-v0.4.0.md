# v0.4.0 review order

Historical record: v0.4.0 is now merged. v0.4.1 supplies the owner-authorized security.txt contact, superseding the contact-pending decision below.

Base: bundled `origin/main` commit `60fa526389fa6940420a18cb1f4a92bdb9785cce`, verified before creating `review/v0.4.0`. No production files were read or changed. The changes are organized into the two commits below. No push, merge, tag or deployment is part of this review.

## 1. Security/deployment

Review `docs/SECURITY-DEPLOYMENT.md`, the links from `SECURITY.md` / `docs/DEPLOYMENT.md`, the proxy-only capability addition in `deploy/docker-compose.vps.example.yaml`, and `scripts/caddy-smoke.sh`. This change stands alone on the base: it does not change the application, save format or print code. It includes a representative pinned-image reproduction and leaves the exact live-image and security.txt-contact decisions open.

## 2. Save-status UX and release preparation

Review `dist/save-status.js`, the optional metadata validation in `dist/core.js`, the storage/status integration in `dist/app.js`, status markup/styles, `tests/save-status.test.mjs` and `tests/save-status-browser.mjs`. Browser entry-point wiring and the old save-label assertion follow the new UI. `docs/SAVE-STATUS.md`, architecture/upgrade/changelog/validation notes explain semantics and limitations. Version metadata and example/CI/smoke image tags move to 0.4.0 only in this second change. Existing historical v0.3.0 validation records are preserved.

Release remains blocked on the outstanding checks and decisions in the current validation record. In particular, native-browser testing and exact-live-image verification are not established by synthetic checks or the prior v0.3.0 CI pass.
