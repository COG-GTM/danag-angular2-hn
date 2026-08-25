## Context

See proposal.md - Why. The app is an Angular SPA with no backend of its own: `HackerNewsAPIService` reads a public HN API and `SettingsService` already persists user preferences as individual `localStorage` keys. Feeds render `Story` objects through the `ItemComponent` (`selector: item`), declared in `AppModule` together with `FeedComponent`. Routing is a single static `Routes` table in `app.routes.ts`, with `item` and `user` lazy-loaded as feature modules. There is no state container and no test coverage convention beyond the default Karma setup.

## Goals / Non-Goals

**Goals:**
- One source of truth for the saved set, shared by the feed item toggle and the saved page, so both stay in sync without a reload.
- Persistence that follows the existing `localStorage` convention rather than introducing storage infrastructure.
- Reuse `ItemComponent` unchanged in structure so feed and saved presentations cannot drift.

**Non-Goals:**
- Syncing bookmarks across devices, accounts, or the real Hacker News "favorites".
- Bookmarking comments or users, or bookmarking from the item-details page.
- Migrating existing settings keys to the new storage shape.

## Decisions

**Store whole `Story` snapshots, not just ids.** The saved page must render items without network access to per-item endpoints, and re-fetching every saved id on page load would make the page slow and failure-prone. Storing the snapshot means a saved story shows the points and comment count as of when it was saved; that staleness is acceptable for a bookmark list and is the trade-off recorded below. Alternative considered: store ids and refetch each on visit — rejected for load cost and partial-failure handling.

**A single `localStorage` key holding a JSON array, newest first.** Ordering is then implicit in the array, and the whole set is read and written atomically. Alternative considered: one key per story id — rejected because listing requires scanning all keys and ordering needs a separate timestamp field.

**A `SavedStoriesService` (`providedIn: 'root'`) owning the set, exposing a `BehaviorSubject`-backed observable plus `isSaved`, `toggle`, and `remove`.** A root singleton is what lets the header count, the feed toggles, and the saved page observe the same state; the existing `SettingsService` establishes the pattern of a service that reads/writes `localStorage` in its constructor. Alternative considered: component-local state with a storage read per component — rejected because unsaving on the saved page would not update a feed rendered behind it.

**All reads and writes wrapped in try/catch, with a parse-failure falling back to an empty set.** `localStorage` throws in private-browsing and quota-exceeded cases, and the stored JSON can be hand-edited; the spec requires the app to keep working in both cases. The in-memory set stays authoritative for the session when a write fails.

**The star lives in `ItemComponent`, next to the title.** That is the only component the saved page and feeds share, so putting it there satisfies "reuse the existing story item presentation" with no duplicate markup. It renders as a `button` with an `aria-label` that states the action, and calls `preventDefault`/`stopPropagation` so it never triggers the surrounding title link.

**The saved page is a plain eagerly-declared component with a static `saved` route, not a lazy feature module.** It is one small component with no extra dependencies, so a lazy module would add a chunk boundary for no benefit; `FeedComponent` sets the precedent for eagerly declared top-level pages. The route is `saved`, without the `:page` child pattern the feeds use, since the list is not paginated.

## Risks / Trade-offs

- Saved snapshots go stale (points, comment count, time ago) → accepted; the title, link, and comments link stay valid, and the item-details page always shows live data.
- `localStorage` is per-browser and per-device, so a reader who clears site data loses bookmarks → accepted and stated in the empty state's wording rather than mitigated; syncing requires accounts, which is a non-goal.
- Unbounded growth of the saved array could hit the storage quota → the write path handles the quota error without breaking the app; a cap is deliberately left out until there is evidence it is needed.
- A future spec covering feed items or header nav will overlap this capability → the delta keeps toggle behavior described in terms of the story item, not of `ItemComponent`, so it can be split later without a rewrite.
