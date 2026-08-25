## Context

See proposal.md — Why. The relevant current state: `@angular/service-worker` 9 is registered in `app.module.ts` for production builds only, and `ngsw-config.json` declares two `assetGroups` (shell, assets) and no `dataGroups`. All content is fetched by `HackerNewsAPIService` from `https://node-hnapi.herokuapp.com` via `unfetch`, wrapped in an Observable. `localStorage` is already used for settings, bookmark ids, and read ids, and shares a 5MB per-origin budget.

## Goals / Non-Goals

**Goals:**
- Satisfy the offline-reading requirements purely through service worker configuration, leaving `HackerNewsAPIService` and the components untouched.
- Keep on-device storage bounded and predictable.

**Non-Goals:**
- No offline UI affordances (offline banner, "saved for offline" indicator, retry button).
- No explicit "save this story" action — caching follows what the reader actually opened.
- No background sync or prefetching of unopened stories.
- No change to how bookmarks or read ids are stored.

## Decisions

**Cache in the service worker via `dataGroups`, not in `localStorage`.**
`dataGroups` store responses in the Cache Storage API, which is asynchronous, has a far larger quota than `localStorage`, and is evicted by the browser under storage pressure. Copying payloads into `localStorage` would consume the same 5MB budget that settings, bookmark ids, and read ids depend on, and would require serializing every response through the application layer. Alternative considered: an interceptor or wrapper in `HackerNewsAPIService` writing to IndexedDB — rejected because it duplicates infrastructure the app already ships and spreads caching logic through application code.

**Use the `performance` strategy, bounded by `maxAge`.**
This follows the direction given for the change. `performance` serves from cache when an entry is younger than `maxAge` and goes to the network otherwise, so freshness is controlled by the age bound rather than by a per-request network attempt. The alternative, `freshness` with a `timeout`, tries the network first and falls back to cache — fresher while online, but it pays a network round trip on every navigation and still shows stale content when the network is merely slow. `maxAge` is therefore the lever that keeps content current: short for feeds, longer for items, whose content changes little after publication.

**Two separate groups with different budgets.**
Items and feeds have different access patterns. Item responses are what a reader returns to read and include full comment threads, so they get the larger entry budget (`maxSize: 200`) and the longer `maxAge` (`1d`). Feed lists are volatile and few in number (five feeds × a handful of pages), so a smaller budget (`maxSize: 50`) and shorter `maxAge` (`1h`) is enough to make the list browsable offline without pinning stale front pages. Separate groups also mean feed churn cannot evict the stories a reader saved by opening them — a single shared group with LRU eviction would let a browsing session push out previously read items.

**Match on the API origin by URL pattern.**
`urls` patterns target `https://node-hnapi.herokuapp.com/item/**` and the feed paths explicitly rather than a blanket wildcard, so a future endpoint is not silently cached under the wrong budget.

## Risks / Trade-offs

- **With `performance`, a reader online can be shown a feed up to an hour old, and offline can be shown one with no visual cue that it is stale** → Bounded by the short feed `maxAge`; offline, the alternative is an empty screen. Offline UI affordances are a deliberate non-goal, tracked separately.
- **Cache Storage is evictable by the browser under storage pressure, so offline availability is best-effort** → Inherent to the platform; the bounded `maxSize` keeps the app a small target for eviction.
- **The service worker is inactive under `ng serve`, so this behavior cannot be verified in the normal dev loop** → Verification runs against `ng build --prod` served over HTTP, with the browser's offline mode toggled.
- **Comment threads on large stories are sizeable, so 200 item entries is a real amount of disk** → `maxAge: 1d` bounds how long that peak persists, and entries are evicted LRU.

## Migration Plan

Configuration-only change; it takes effect when the updated service worker activates. Existing installs pick it up on the next service worker update cycle. Rollback is reverting `ngsw-config.json` — the next activation drops the `dataGroups` and their caches.
