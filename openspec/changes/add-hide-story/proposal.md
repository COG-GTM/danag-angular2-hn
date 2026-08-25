## Why

Feeds mix in stories a reader has already seen or has no interest in, and there is no way to get them out of the way. Readers need a lightweight way to dismiss a story so their feeds stay relevant, without any account or server-side state.

## What Changes

- Readers can hide (dismiss) an individual story from any feed list (top, new, show, ask, jobs) via a control on the story row.
- Hidden stories are filtered out of every feed list, including subsequent pages and later visits.
- Dismissals are stored on the device only (browser local storage); no account, no network calls, no sync across devices.
- A hidden story can be restored: hiding shows a short-lived undo affordance in place of the story, and all dismissals can be cleared from the settings panel.
- Feed pagination continues to reflect the upstream API paging; hiding does not backfill items from the next page.

## Capabilities

### New Capabilities
- `hidden-stories`: Reader-initiated dismissal of stories from feeds, with device-local persistence of the dismissal set and the ability to undo or clear dismissals.

### Modified Capabilities

<!-- No existing specs in openspec/specs/; no existing capability requirements change. -->

## Impact

- `src/app/shared/services/` — new service owning the hidden-story set and its local-storage persistence.
- `src/app/feeds/feed/` — feed list filters hidden stories out of the rendered items.
- `src/app/feeds/item/` — story row gains a hide control and an undo state.
- `src/app/core/settings/` — settings panel gains a "clear hidden stories" action.
- No API, dependency, or build changes.
