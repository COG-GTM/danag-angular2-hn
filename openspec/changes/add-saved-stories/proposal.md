## Why

Readers browsing the feeds have no way to keep a story for later: the only way back to an interesting item is to re-find it in a paginated feed that changes constantly. A device-local bookmark list closes that gap without introducing accounts or a backend.

## What Changes

- Add a star toggle control to every story item in the feeds. Clicking it saves the story; clicking it again removes it. The control reflects saved state on render.
- Persist bookmarks on the device (browser `localStorage`) so they survive reloads and browser restarts. No account, no server, no cross-device sync.
- Add a `saved` page at route `/saved` that lists all saved stories using the existing story item presentation, most recently saved first.
- Add a `saved` link to the header navigation alongside `new | show | ask | jobs`.
- Show an empty state on the saved page when nothing is saved.
- Saved stories are rendered from the story data captured at save time, so the saved page requires no Hacker News API calls.

## Capabilities

### New Capabilities
- `saved-stories`: bookmarking a story from a feed, persisting bookmarks on the device, and viewing them on a dedicated saved page with an empty state.

### Modified Capabilities
<!-- No existing specs under openspec/specs/; nothing to modify. -->

## Impact

- `src/app/feeds/item/` — story item template and component gain the star toggle.
- `src/app/shared/services/` — new bookmark service owning the `localStorage` read/write and the in-memory list.
- `src/app/shared/models/` — a stored bookmark shape derived from `Story`.
- `src/app/app.routes.ts`, `src/app/app.module.ts` — new `/saved` route and component registration.
- `src/app/core/header/header.component.html` — new nav link.
- No API, dependency, or build changes; no server-side impact.
