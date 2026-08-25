## Context

See proposal.md — Why. Story detail loads go through `HackerNewsAPIService.fetchItemContent()`, which wraps `fetch` in an `Observable`; `ItemDetailsComponent` subscribes and sets `errorMessage` on failure. Angular's service worker (`ngsw-config.json`) precaches the shell and assets only; API responses are not in any asset group. Settings already persist through `localStorage` in `SettingsService`, so the project has an established pattern for device-local state.

## Goals / Non-Goals

**Goals:**

- Fallback is transparent to every existing caller of `fetchItemContent()`.
- Retention failures never surface to the reader.

**Non-Goals:**

- Retaining feed lists, user profiles, or linked article pages.
- Background refresh or prefetching of unread stories.
- Cross-device sync of retained content.

## Decisions

**Store retained stories in `localStorage`, not the service worker cache.** The API is called through `unfetch`, so a service-worker runtime cache would work in production builds only (`ServiceWorkerModule` is registered with `enabled: environment.production`) and would be invisible to unit tests and `ng serve`. `localStorage` matches `SettingsService`, works in every build, and lets the app attach the retention timestamp and enforce an entry-count limit itself. Alternative considered: a Workbox/ngsw runtime caching rule for `node-hnapi.herokuapp.com` — rejected because it cannot express "only stories the reader opened" and gives no hook for the saved-copy notice.

**Do the retention and fallback inside `HackerNewsAPIService`.** The fallback then applies to any consumer of `fetchItemContent()` rather than only `ItemDetailsComponent`, and the component keeps its current error handling for the no-retained-copy case. Alternative considered: handling it in the component — rejected as it duplicates the logic per consumer.

**Expose retained content as a wrapper with provenance.** The saved-copy notice needs to know both that the content is retained and when it was retained, so a new `OfflineStoryStoreService` returns `{ story, savedAt }` and `fetchItemContent()` emits the story while the component reads provenance from the store. Alternative considered: stamping fields onto the `Story` model — rejected because it pollutes the API shape shared with feeds.

**Enforce the 50-entry limit by opened-at order.** Entries carry their retention timestamp; on write, the oldest entries beyond the limit are dropped. A single `localStorage` key holding an id→entry map keeps reads and eviction to one parse. Alternative considered: one key per story — rejected because eviction would then need a full key scan.

**Treat all storage errors as "not retained".** Reads that fail to parse, writes that throw `QuotaExceededError`, and environments without `localStorage` (Safari private mode) all degrade to normal online behavior.

## Risks / Trade-offs

- Retained comment threads can be large and `localStorage` is capped at ~5 MB → the 50-entry limit plus quota-error handling that evicts the oldest entry and retries once keeps writes bounded and non-fatal.
- Retained content goes stale, and a failed refresh silently shows old data → the saved-copy notice states when it was saved so the reader can judge.
- Retained content is readable by any script on the origin → only public Hacker News content is retained; no reader-identifying data is stored.
