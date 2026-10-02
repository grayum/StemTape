# v0.4.0 save status

The app reports a successful save only after the single `localStorage.setItem('stemtape.v1', …)` call succeeds. The status shows a check and relative age, plus the exact UTC timestamp as visible `<time datetime>` text. Time updates are not live announcements; a separate polite status region announces meaningful state changes. Errors and previous successful timestamps remain visible on mobile and both themes.

A fresh in-memory example says `Not saved yet`. Previously stored v1 data without a timestamp says `Stored on this device — save time unknown`; loading/rendering it does not create a timestamp or write storage. Invalid or pending drafts remove the check. Correction/cancellation can reveal the previous save without changing its time; a valid edit that is actually written records a new time. Quota, blocked storage and failed reads/writes show `Not saved` and retain the previous successful time when known. Accepted in-memory changes remain exportable after a failed write.

## Metadata and compatibility

Optional `savedAt` is a positive integer Unix timestamp in milliseconds, validated within the JavaScript Date range, inside the existing schema-v1 record. It travels with complete JSON backups and shares their 2,000,000-byte UTF-8 budget. Plan data and timestamp are written atomically in one storage operation; no separate metadata key can misrepresent a failed plan write.

Metadata must not prevent an otherwise-valid exact-limit legacy plan from saving. The serializer first validates the entire plan without timing metadata, then adds the timestamp only if the resulting complete representation fits. When there is no room, it saves the complete plan without `savedAt`, keeps the successful time in memory, and explicitly marks that time as available in this tab only. Reload then reports unknown save time. No event, mode, preset or user text is truncated. Backups remain restorable at the exact byte boundary.

Older versions ignore the optional field and can restore the plan; saving in an older version loses only the optional timing metadata. No startup migration rewrites existing data. Invalid timestamps cause validation/recovery rather than inventing an age. Recovery protects the original raw string and ignores any supposed timestamp in unreadable data. Fallback edits stay unsaved. Explicit restore/reset replaces the original only after a successful storage write; failed replacement retains original export access. Imported backup timestamps never become the current local save time: only a successful restore write sets that time.

## Clocks and tabs

Relative age uses the current wall clock and the persisted successful-write time. A backwards clock/future timestamp shows `Saved clock changed` with the exact time instead of a negative age. Forward jumps reflect wall-clock time, not a trusted elapsed-duration measurement. An invalid clock does not generate a fabricated timestamp. The 15-second display timer changes only status text; it never writes storage or rebuilds the cue editor/preview.

A storage event, a window-focus check, or the pre-write comparison detects changes/removal by another tab. This tab then says `Not saved — storage changed in another tab; export this plan, then reload`. It does not silently load over drafts or overwrite known newer data. Reopening/reloading adopts the latest stored plan. All metadata remains local. localStorage offers atomic individual writes but no cross-tab compare-and-swap: truly simultaneous writes can still race between the comparison and write; the subsequent storage event/focus check exposes the divergence. This is not a collaborative editor or a merge protocol. Export either tab before reloading if needed.

## Focused browser checklist — pending execution

1. Load legacy data: time stays unknown. Edit a name: check, relative age and exact time appear. Reload: the same timestamp remains.
2. Advance the test clock or wait a minute: age changes without a storage write, cue/preview rebuild, focus change or repeated screen-reader announcement.
3. Enter invalid input or a pending layout edit: check disappears. Correct or cancel; verify previous timestamp behavior.
4. Force quota/blocked storage: `Not saved` remains visible on light/dark mobile layouts with the previous successful time. Retry successfully and reload.
5. Open two tabs, save in one, then try editing the stale tab: newer storage must remain intact; export/reload guidance appears.
6. Restore a backup containing an old timestamp: local successful restore gets the current write time. Exercise protected recovery and a failed replacement; export original bytes unchanged.
7. Save at exact budget including optional timestamp bytes, then at full plan-only budget: plan data must round-trip, session-only time must be explicit, and reload must not invent a time. Check backwards clock behavior.

Node tests cover storage success/failure, legacy/timestamp round trips, imports, recovery, tabs, clocks and exact UTF-8 metadata boundaries. Browser tests use bounded state waits and a controlled clock rather than sleep-based synchronization. Synthetic DOM checks do not replace native browser, accessibility or visual verification.
