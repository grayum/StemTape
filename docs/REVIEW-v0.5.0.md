# v0.5.0 review

Base: `/tmp/stemtape-v0.5.0-base.bundle`, verified bundled origin/main `cd196fbcd7754414841aee5fe37077aa7fa79872`. Work is isolated on review/v0.5.0 at `/tmp/stemtape-v050-worktree`. The unrelated README edits remain in the original docs/readme-v0.4.1 checkout and `/tmp/stemtape-v050-readme-backup-a7qmt0p5`; they are not mixed into this release.

## 1. Approved icon replacements

Review only dist/icons.js first. The four sandbox PNG references were inspected and recreated as fixed SVG geometry in the existing 24 × 24 system. Bar has an exposed smile and wrapper without a face circle; Bottle has a pull nozzle/cap/shoulders/grip; Gel has diagonal blank body/notch/seal; Cobbles has converging road sides and rounded stones. PNG references are not shipped. Keys and labels are unchanged. Inner stone strokes are slightly lighter to retain separation at 11 pt cue size. Lucide notices remain for the untouched subset.

## 2. Footer/settings and release preparation

Review dist/core.js, dist/footer.js, the limited makeSheet addition, controls/styles, focused tests and metadata/documentation. Legacy layout fields remain absent, defaulting to footer off. Footer text is a single line, up to 80 UTF-16 units; actual ink/advance and vertical bounds may impose a shorter limit. Over-limit typed or pasted input is retained as an invalid draft, rather than clipped by maxlength. It uses the plan font with 1 mm spacing, inside the rotated content group. Disable retains text and reserves no space. CSV stays cue-only. Failed saves and recovery preserve the existing guarantees. preparePrint is unchanged.

The native disclosure keeps its whole heading click target and keyboard/expanded semantics. Its arrow is lime with a charcoal outline: the outline supplies light-theme contrast where lime alone is insufficient. No unrelated disclosure is styled. Approved column features remain gated in ROADMAP.md and the deployment completion checklist.

## Review artifacts and manual checklist

Generated, ignored artifacts are in artifacts/v0.5.0: icons-enlarged.svg/png includes both themes and 24 px/11 pt samples; icons-actual-size.svg uses physical units; sheet-footer-32x90mm.svg/png, sheet-no-footer-32x90mm.svg/png and four rotation samples use the actual renderer with native canvas metrics. Sheet SVGs embed the bundled fonts; print-page rotation SVGs include the unchanged cut marks and 50 mm calibration line. They are standalone synthetic previews, not browser/PDF/physical-print evidence. PNGs are enlarged for inspection; print SVGs at 100% to preserve their declared size.

1. Compare the four designs with approved references, enlarged and at actual cue sizes in light/dark. Check the bar face, bidon silhouette, gel notch and cobble separation.
2. Keyboard-open Layout & print settings; inspect lime triangle/outline and focus at 200% zoom/mobile. Only this disclosure should change.
3. Enable a short footer, add plain text/emojis/markup-like text, toggle off/on and reload. Text must stay literal and retained; old plans start off.
4. Force overlong/wide and vertically overflowing footers. Warnings must identify overflow and block Print. Correct or explicitly cancel invalid edits; try ordering/mode/unit/event actions while invalid.
5. Test failed/quota saves, exact-byte plans and recovery originals; JSON backup/restore/duplicate/preset must retain footers and both modes. CSV must contain only cues.
6. Compare preview and PDF for 0/90/180/270°, footer off/empty/on, A4/Letter and copies. Physically print at 100%/Actual size and measure the sheet and 50 mm line; confirm footer remains inside the requested dimensions and readable. These manual checks are unexecuted unless separately recorded.

See VALIDATION.md for executed checks and outstanding gates. Changes are grouped into two review commits: approved icon replacements, then footer/settings/tests/release documentation. These commits do not establish release approval or authorize deployment. No pushes, merges, tags, DNS changes or production deployment are part of this review.
