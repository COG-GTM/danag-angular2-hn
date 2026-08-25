## Why

Readers browsing the feeds have no way to keep a story for later: the only options are opening it immediately or losing it once the feed rotates. A device-local bookmark gives readers a way to set stories aside without introducing accounts or a backend.

## What Changes

- Each story in a feed gains a star toggle that saves or unsaves that story. The toggle reflects the current saved state on render.
- Saved stories are stored on the device and survive page reloads and browser restarts.
- The saved set is capped at 200 stories; saving past the cap evicts the oldest saved story and tells the reader it happened.
- A new `saved` page lists all saved stories using the existing story item presentation, most recently saved first.
- The page shows an empty state when nothing is saved.
- The header navigation gains a `saved` link alongside `new`, `show`, `ask`, and `jobs`.
- No breaking changes; no existing behavior is removed.

## Capabilities

### New Capabilities
- `saved-stories`: bookmarking a story from a feed, device-local persistence of the bookmark set under a fixed cap, and the saved-stories page including its empty state and header entry point.

### Modified Capabilities
<!-- None: no existing spec captures feed item or header behavior yet, so all new behavior lands in the new capability. -->

## Impact

- `src/app/feeds/item/` — star toggle in the item template and component.
- `src/app/core/header/` — nav link to the saved page.
- `src/app/shared/services/` — new service owning the saved-story set and its persistence.
- `src/app/app.routes.ts`, `src/app/app.module.ts` — new route and declarations for the saved page.
- Browser `localStorage` becomes a store for saved stories, alongside the existing settings keys, bounded to roughly 200KB by the cap.
- No API, dependency, or build changes.
