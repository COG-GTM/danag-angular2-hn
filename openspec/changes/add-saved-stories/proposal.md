## Why

Readers scan the feed on a phone and want to come back to a story later, but the app keeps nothing
between visits: the only way to hold on to a story today is a browser bookmark or an open tab.
Every other reading surface in this app (theme, font size, list spacing) already persists locally,
so the expectation is set.

## What Changes

- A star toggle on every feed item that saves or unsaves that story.
- A new `saved` page listing saved stories, most recently saved first.
- A `saved` link in the header nav alongside `new` / `show` / `ask` / `jobs`.
- Bookmarks are kept on the device and survive a reload. No accounts, no backend, no sync.
- The saved page reuses the existing item presentation and shows an empty state when nothing is
  saved.
- No breaking changes. No new dependency.

## Capabilities

### New Capabilities

- `saved-stories`: saving and unsaving a story from the feed, listing saved stories, persisting
  them on the device across reloads.

### Modified Capabilities

None. No existing spec files exist in this repo.

## Impact

- `src/app/feeds/item/` — star control on each item.
- `src/app/core/header/` — nav link.
- `src/app/app.routes.ts`, `src/app/app.module.ts` — the `saved` route and component declaration.
- `src/app/shared/services/` — a new persistence service alongside `SettingsService`.
- Browser `localStorage`. No API surface changes; node-hnapi is untouched.
