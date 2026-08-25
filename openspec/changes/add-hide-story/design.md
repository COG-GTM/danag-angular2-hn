## Context

The app is an Angular 9 HN PWA with no backend of its own: feeds come from the public HN API via `HackerNewsAPIService`, and all reader preferences already live in `localStorage` behind `SettingsService`. Feeds render a fixed page of 30 items from the API; `FeedComponent` holds the fetched array and `ItemComponent` renders a single row. See proposal.md - Why for motivation.

## Goals / Non-Goals

**Goals:**
- Filtering happens in one place so every feed type inherits it.
- Dismissal state is readable synchronously at render time (no async storage) and observable so open views update immediately.
- Storage failures degrade to in-memory-only behavior rather than breaking feeds.

**Non-Goals:**
- Cross-device sync, expiry/TTL of dismissals, or a "hidden stories" management list beyond a clear-all action.
- Backfilling the feed page with items from the next page after a hide (page size stays what the API returned).
- Hiding comments, users, or domains.

## Decisions

**Separate `HiddenStoriesService` rather than extending `SettingsService`.**
`SettingsService` models a small flat `Settings` object of scalar preferences bound directly into templates; a growing id set with add/remove/has semantics does not fit that shape. A dedicated root-provided service keeps the set, its persistence, and its change notifications together. Alternative considered: another `Settings` field — rejected because every consumer would then re-derive set membership from an array on each change-detection pass.

**Keep the set in memory as a `Set<number>`, mirrored to `localStorage` under a single key (`hiddenStories`), written on every mutation.**
Reads happen on every feed render, so they must be O(1) and synchronous; writes are rare (a click). Serializing the whole set as a JSON array on write is trivially cheap at the scale readers reach. Alternative considered: one storage key per hidden id — rejected as it pollutes the key space and makes clear-all a scan.

**Expose changes via an RxJS `BehaviorSubject` and let `FeedComponent` derive `visibleItems`.**
`FeedComponent` recomputes its filtered array when either the fetched items or the hidden set changes, so hiding from `ItemComponent` (a child) and clearing from settings (an unrelated component) both update the open feed without a route change. Alternative considered: filtering with a pipe in the template — rejected because an impure pipe would run on every change-detection cycle, and a pure pipe would not see mutations to the set.

**Undo lives in `FeedComponent`'s view state, not in the service.**
The service only answers "is this hidden"; the feed remembers which id was most recently hidden *in this view* and renders a placeholder row in its slot. Navigating away discards the component state, which is exactly the transient behavior the spec asks for. This also keeps the story's original position for free — the underlying `items` array is never mutated.

**All storage access is wrapped in try/catch, and any failure falls back to in-memory only.**
Safari private mode and disabled storage throw on `setItem`; malformed JSON throws on parse. The existing `SettingsService` does not guard this, but a feature that writes on user action needs to. On read failure the set starts empty; on write failure the in-memory set still applies for the session.

## Risks / Trade-offs

- Unbounded growth of the stored id set for heavy users → ids are small integers and the set is a single JSON array; clear-all in settings is the escape hatch. Revisit with a cap or LRU only if it becomes real.
- A hidden story shrinks the visible page below 30 items, so pages look uneven → accepted: backfilling would require speculative extra API calls and would make the "More ›" pagination boundaries inconsistent with the upstream API.
- Multiple tabs on the same origin can overwrite each other's set (last write wins) → accepted; no `storage` event listener for now, the loss window is small and the action is reversible via undo/clear.
