## Context

See proposal.md — Why. The relevant current state: `@angular/service-worker` is registered in
production builds only, `ngsw-config.json` prefetches the shell and assets and caches nothing
from the API, and `HackerNewsAPIService` wraps `unfetch` in a hand-rolled `Observable`
(`lazyFetch`) that discards the `Response` object once it has parsed the body.

ADRs 0001, 0002 and 0003 constrain this change; see proposal.md — Impact. Requirements are in
`specs/offline-reading/spec.md`.

## Goals / Non-Goals

**Goals:**

- Offline availability comes from service worker configuration, so a reload works offline.
- The UI can tell three states apart: fresh content, cached content viewed offline, and nothing
  cached.
- Application-level logic is small enough to unit test without a service worker.

**Non-Goals:**

- Caching anything the app does not serve to itself (external article links, user profile pages
  are not part of this change).
- A general offline-aware HTTP layer. Only feeds and item pages need this.
- Making `ng serve` behave like production. The service worker stays disabled in development.

## Decisions

### Cache API responses in `ngsw-config.json` `dataGroups`, not in application code

Two data groups on the `node-hnapi.herokuapp.com` origin:

| group | URL patterns | strategy | maxAge | maxSize | timeout |
| --- | --- | --- | --- | --- | --- |
| `hn-feeds` | `/news*`, `/newest*`, `/best*`, `/ask*`, `/show*`, `/jobs*` | performance | 1h | 60 | 5s |
| `hn-items` | `/item/*` | performance | 1d | 200 | 5s |

`performance` is cache-first: within `maxAge` the service worker answers from cache without
touching the network, which is what "serve from cache first when online too" asks for, and it
is the freshness strategy ADR 0002 mandates for HN data. Past `maxAge` the worker drops the
entry and goes to the network — an expired entry is a miss, exactly the staleness rule in the
spec, with no invalidation logic of our own. `maxSize` gives the bounded, oldest-first eviction
ADR 0003 requires: 60 feed responses and 200 item responses, evicted by the platform.

Alternatives rejected:

- **`freshness` with a cache fallback.** Network-first: every view online waits on the network,
  which the spec explicitly rules out.
- **Writing payloads to `localStorage` on open.** Rejected by ADR 0002, and multi-KB comment
  threads would crowd out settings and bookmarks in a 5MB store (ADR 0003).
- **A larger `maxSize`.** 200 item pages is roughly a week of heavy reading and stays well
  inside the origin quota alongside the prefetched shell.

### A device-local ledger of fetch times, holding timestamps only

The service worker does not expose the age of a cached response to the page, and the API is
cross-origin so its `Date` header is not readable. The UI needs an age for the indicator, and
the components need to distinguish "cached" from "never cached" before a request comes back.

`OfflineCacheLedgerService` owns key `hn:offline-cache-ledger:v1`: a URL → epoch-milliseconds
map, capped at 300 entries, evicting oldest first, silently (ADR 0003 — the reader cannot
notice a dropped timestamp). It stores no API payloads, so ADR 0002 holds: this is a record of
what the reader fetched and when, the same class of device-local state as read ids.

The ledger mirrors the worker's own expiry by only recording a timestamp when the existing one
is absent or older than that group's `maxAge` — the case where the worker must have gone to the
network. A response served from within `maxAge` keeps its original timestamp, so "last fetched"
stays truthful. The two clocks can drift apart if the worker evicts an entry for `maxSize`
before its `maxAge` elapses: the ledger then claims a cached copy that is gone, the request
fails, and the component falls back to the offline empty state. The ledger is an optimisation
for what to render first, never the authority on what is cached.

Alternative rejected: **deriving age from the response.** `Date` is not a CORS-safelisted
response header and the API does not expose it, so it reads as `null` in the browser.

### Connectivity as an observable, not `navigator.onLine` reads scattered in components

`ConnectivityService` seeds a `BehaviorSubject<boolean>` from `navigator.onLine` and updates it
from `window` `online`/`offline` events (RxJS only, per ADR 0001 — no new dependency). Feed and
item-details components subscribe: a false→true transition re-runs the current request and
clears the indicator, satisfying the reconnect requirement without a page reload.

`navigator.onLine` is optimistic — a captive portal reports `true`. That is acceptable here: a
request that fails while `onLine` is `true` lands in the same handler as an offline failure, and
the component shows the offline empty state either way.

### Background refresh after a cache-first render

Angular 9's service worker has no `refreshAheadMs` (Angular 13+), so a `performance` group
serves cache and stops. To honour "refresh in the background", `HackerNewsAPIService` emits a
second value: when online and the ledger says the served copy is past half its group's `maxAge`
(30 minutes for feeds, 12 hours for items), it re-requests the URL with `ngsw-bypass=1`, which
the worker passes straight to the network, and emits the fresh payload if it arrives. Failures
are swallowed — the reader already has content on screen. Components render each emission, so
this is one extra request per view at most, and only in the second half of the window.

The bypassed response is not stored by the worker, so the offline copy can lag the on-screen
copy by up to one `maxAge`; the worker refreshes it on the first request after expiry. The
alternative — no background refresh at all — would leave a reader who returns hourly looking at
a copy up to 24 hours old with no way to pull a fresh one short of expiry.

Alternative rejected: **writing the bypassed response into the worker's cache from the page via
the Cache API.** It reaches around the worker into storage it owns, and ADR 0002 puts that
storage under the worker's control.

### Two small shared components, no new state in them

`OfflineNoticeComponent` (dismissible banner, takes a last-fetched timestamp) and
`OfflineEmptyStateComponent` (message plus a `retry` output) live in
`src/app/shared/components/` beside `LoaderComponent` and `ErrorMessageComponent`, styled with
the existing theme mixins. Dismissal is component state that resets on the next offline
transition, not persisted state: it needs no key and no cap.

The existing `ErrorMessageComponent` keeps its role for genuine load failures while online. Its
copy already gestures at offline viewing; that line moves into the offline empty state where it
belongs.

## Risks / Trade-offs

- **Ledger and worker cache diverge** (eviction by `maxSize`, worker updated without the page,
  storage cleared) → the ledger only chooses the first render; a failed request still ends in
  the offline empty state, so divergence degrades to today's behavior rather than a wrong page.
- **`ngsw-bypass` requests are invisible to the worker** → the offline copy can be up to one
  `maxAge` behind what the reader saw online. Accepted, and stated above; the indicator reports
  the cached copy's age, which is the copy the reader is actually looking at.
- **Development and production diverge** — no worker under `ng serve`, so cache-hit and
  cache-miss paths cannot be exercised there → application logic (ledger, connectivity, API
  emissions) is unit tested with no worker involved, and the end-to-end paths are verified
  against a production build served statically with devtools offline mode.
- **`localStorage` unavailable** (private mode, quota) → the ledger degrades to in-memory for
  the session per ADR 0001; the reader loses the age label, not the content.
- **HN API origin changes** → the `dataGroups` URL patterns are pinned to
  `node-hnapi.herokuapp.com`, the same host `HackerNewsAPIService` hard-codes today. Both move
  together.

## Migration Plan

No data migration: a new namespaced key that starts empty, and cache groups that fill as the
reader browses. Rollback is reverting the change; readers keep whatever the worker already
cached until it expires, and the orphaned ledger key is inert.
