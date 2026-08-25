## Why

A reader who opens a story and then loses connection — subway, plane, dead cell — loses the
story too. The app shell stays up because the service worker prefetches it, but every HN API
response goes to the network and fails, so the reader gets the skull error page on content they
were already reading a moment ago.

## What Changes

- Responses from the Hacker News API are cached by the service worker, configured through
  `dataGroups` in `ngsw-config.json`: one group for story detail (`/item/*`), one for feed
  listings, one for user profiles.
- A story the reader has already opened renders from that cache when the network is unavailable,
  including its comment thread as it was when last fetched.
- The app tells the reader when it is offline, and marks content served from cache as
  potentially stale rather than presenting it as live.
- The failure page distinguishes "you are offline and have not opened this before" from a
  generic load error.

No new persistence layer and no new dependency: this is service worker configuration plus a UI
affordance for the offline state.

## Capabilities

### New Capabilities
- `offline-reading`: what stays readable without a network, how long it stays readable, and how
  the reader is told that what they are looking at came from the cache.

### Modified Capabilities

None — no existing spec in `openspec/specs/` covers this behavior.

## Impact

- `ngsw-config.json` — new `dataGroups` section. Offline behavior only exists in a production
  build; `ng serve` does not register the service worker.
- `src/app/shared/services/` — a small connectivity service exposing online/offline state.
- `src/app/core/` and `src/app/item-details/` — offline indicator and the reworked failure copy.
- No change to `HackerNewsAPIService` call sites: caching happens below `fetch`.

## ADRs

- **0002 (offline caching is the service worker's job)** — governs this change directly and is
  followed: caching is `dataGroups` configuration, application code does not copy API payloads
  into `localStorage`, and the strategy is `performance` with a bounded `maxAge`.
- **0001 (device-local state through a service)** — applies to the connectivity service, which
  holds no persisted state and exposes online/offline through a `BehaviorSubject`. No new
  `localStorage` key.
- **0003 (bounded device-local collections)** — no new device-local collection is introduced.
  The service worker cache is bounded by `maxSize` per data group and evicted by the platform.

No ADR needs to be superseded.
