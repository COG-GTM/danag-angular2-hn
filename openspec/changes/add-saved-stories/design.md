## Context

See proposal.md — Why. Relevant current state:

- Feeds are rendered by `FeedComponent` (declared in `AppModule`) which fetches `Story[]` from `HackerNewsAPIService` and delegates each row to the `item` component (`src/app/feeds/item/`). `ItemComponent` takes `@Input() item: Story` and reads display settings from `SettingsService`.
- `SettingsService` is the existing precedent for device-local state: a root-provided service holding a plain object read from and written to `localStorage` key by key, read once in the field initializer.
- Routing is a single eager `Routes` array in `app.routes.ts`; `item` and `user` are lazy feature modules, feeds are eager in `AppModule`.
- Header nav is static markup in `core/header/header.component.html` using `routerLink` + `routerLinkActive`.

## Goals / Non-Goals

**Goals:**
- One source of truth for saved state shared by the feeds and the saved page, so a toggle in one place is reflected in the other without a reload.
- Saved page renders with zero network calls.
- Reuse `ItemComponent` unchanged in presentation, so feed and saved rows stay visually identical by construction.

**Non-Goals:**
- Cross-device sync, export/import, or migration of an existing bookmark store (there is none).
- Saving comments, users, or polls; only feed stories.
- A storage quota strategy beyond failing soft.

## Decisions

**Bookmarks live in a root-provided `BookmarksService` exposing an observable list.**
The saved page and every visible item must react to the same mutations. A `BehaviorSubject<SavedStory[]>` (seeded from `localStorage` in the constructor, written back on every mutation) gives the saved page an async list and gives `ItemComponent` a cheap `isSaved(id)` check. Alternative considered: `SettingsService`-style plain mutable array with no observable — rejected because the saved page must drop a row the moment its own toggle fires, and OnPush-free change detection over a shared array is workable but leaves the list ordering/refresh logic duplicated in the page component.

**Persist a `SavedStory` snapshot, not just ids.**
Storing ids would force the saved page to fetch each item from the Hacker News API (one request per story, and stories eventually 404), which contradicts the "renders without API calls" requirement in the spec. The snapshot is the display subset of `Story` plus `saved_at`; it is written under a single `localStorage` key (`savedStories`) as one JSON array so the whole list is read and written atomically. Alternative considered: one key per story id — rejected, no atomic ordering and messy enumeration.

**All storage access is wrapped in try/catch and defaults to an empty list.**
`localStorage` throws in Safari private mode and when the quota is exceeded, and hand-edited or truncated JSON must not white-screen the feed. The service parses defensively (array check, entries must have a numeric `id`) and drops the payload rather than propagating.

**The star lives inside `ItemComponent`, not in a wrapper around it.**
The saved page then reuses the component verbatim and the toggle appears in both places from one template edit. The button calls `event.preventDefault()`/`stopPropagation()` so it never triggers the surrounding title or comment links, and carries an `aria-label`/`aria-pressed` pair for the accessible-label requirement.

**Saved page is an eager component in `AppModule` at `/saved`, mirroring `FeedComponent`.**
It renders from the service's observable with `async`, so it needs no resolver or lazy module; a lazy module for a single template-only component would add a chunk for no benefit. Ordering is most-recent-first by `saved_at`, applied in the service so the page stays presentational.

**Nav link is added to the existing static header markup** next to `jobs`, with `routerLinkActive="active"` like its siblings — no dynamic nav config exists to extend.

## Risks / Trade-offs

- Snapshots go stale (points and comment counts freeze at save time) → accepted for a device-local reading list; the item still links to the live story and comments. Refreshing on visit would reintroduce the API dependency the spec rules out.
- `localStorage` is synchronous and shared with settings keys → the payload is a single small key written only on toggle, so write frequency stays proportional to user clicks.
- Storage growth is unbounded if a user saves thousands of stories → each snapshot is a few hundred bytes; a cap is deliberately not specified, and quota failure already degrades soft.
- Multiple tabs each hold their own in-memory copy, so the last writer wins → out of scope; no `storage` event listener in this change.

## Migration Plan

None. Additive feature with no existing data; rollback is reverting the change, which leaves an unread `savedStories` key that is harmless.
