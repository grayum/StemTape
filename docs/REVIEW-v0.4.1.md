# v0.4.1 review groups

Base: verified bundle `/tmp/stemtape-main-v0.4.1-base.bundle`, bundled `origin/main` at `4c45af7c4b79e9590eab90111806afb2a0672dd6`. This merge contains both reviewed v0.4.0 commits. Work is on `review/v0.4.1`, organized into the two logical commits below. No production changes are part of this review.

The three pre-existing formatting files were inspected and copied, with their diff and status, to `/tmp/stemtape-v041-formatting-backup` before switching branches. No untracked files existed at that point. The work carried across unchanged and was then reconciled into the locale-aware tooltip, its tests and documentation; the old formatting patch remains recoverable.

## 1. security.txt and static serving

Review `dist/.well-known/security.txt`, `deploy/nginx.conf`, `scripts/container-smoke.sh`, `SECURITY.md` and `docs/SECURITY-DEPLOYMENT.md`. This group provides the exact owner-authorized endpoint and maintenance guidance, preserves hidden-path restrictions and headers, tests the actual Docker response, and makes static gzip explicit. It does not alter application state or print code. Remaining Cloudflare cipher/key-exchange findings are accepted limitations, not repository fixes.

## 2. Application presentation and release documentation

Review the app/core/save-status/HTML/CSS changes, focused Node/browser tests, README, architecture/save-status/upgrade/changelog/validation notes and v0.4.1 version references in public examples/workflow/package metadata. The saved-state format and byte policy are unchanged. New templates use Fuel; existing data is never relabelled speculatively. The already-disabled time-mode distance control gains styling and accessible explanation, with tests for custom distance columns.

The original formatting backup remains outside the repository. See [validation](VALIDATION.md) for evidence, the hover/Escape defect fixed during review, limitations and manual checks; these commits are not release approval.
