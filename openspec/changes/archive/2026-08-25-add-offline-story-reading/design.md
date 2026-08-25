## Context

See proposal.md — Why. Constraints that shape the approach:

- `@angular/service-worker` is already a dependency and `ServiceWorkerModule` is registered when
  `environment.production`. `ngsw-config.json` currently declares only `assetGroups`.
- All HN data is fetched from `https://node-hnapi.herokuapp.com` through a thin `fetch` wrapper
  in `HackerNewsAPIService`. There is no `HttpClient` usage.
- ADR 0002 makes the service worker the only place API responses are cached; ADR 0003 requires
  any device-local collection to state a bound.
- The service worker does not run under `ng serve`, so this behavior is only observable in a
  production build served over http(s).

## Goals / Non-Goals

**Goals:**

- Story detail, feed listings and user profiles the reader has already fetched render offline,
  including after a reload.
- The offline state is visible to the reader and the "nothing cached" failure reads differently
  from a generic error.
- Zero new runtime dependencies; no application-level cache.

**Non-Goals:**

- Prefetching stories the reader has not opened, or a "save for offline" action.
- Offline access to the linked article itself — only the HN item and thread are cached.
- Queuing writes (voting, commenting): the app is read-only.
- Cache introspection or management UI.

## Decisions

**Cache HN API responses with `dataGroups`, one group per shape of data.**
Three groups, matched in order, all `strategy: performance`:

| group | urls | maxSize | maxAge | timeout |
| --- | --- | --- | --- | --- |
| `hn-item` | `/item/**` | 200 | 7d | 5s |
| `hn-feeds` | `/news*`, `/newest*`, `/ask*`, `/show*`, `/jobs*` | 40 | 1h | 5s |
| `hn-user` | `/user/**` | 100 | 1d | 5s |

`performance` is required by ADR 0002 and is also what makes offline reading work on a reload:
within `maxAge` the cached response is returned without touching the network, and when the entry
is stale Angular's data group falls back to the cached response after the network request fails
or exceeds `timeout`. So a story stays readable offline past its `maxAge` as long as it is still
within `maxSize`. The spec's "at least 24 hours" is satisfied with room to spare by 7d on items.

`maxSize` is the ADR 0003 bound: 200 stories with threads is the largest collection here and is
evicted LRU by the platform, not by us. Feeds are capped low because they are rewritten hourly.

*Alternative rejected:* a single group over `node-hnapi.herokuapp.com/**`. One `maxAge` would
have to serve both a comment thread (wants days) and the front page (wants an hour), and one
`maxSize` would let feed churn evict stories the reader saved by reading them.

*Alternative rejected:* `strategy: freshness`. Contradicts ADR 0002, and it makes every
navigation wait out a network timeout before showing content the app already has.

*Alternative rejected:* snapshotting stories into `localStorage` on open — ADR 0002's explicitly
rejected shortcut, and it would need its own eviction under ADR 0003.

**Connectivity is exposed by a service, not read from `navigator` in components.**
A `ConnectivityService` in `src/app/shared/services/` seeds a `BehaviorSubject<boolean>` from
`navigator.onLine` and updates it from the `window` `online`/`offline` events. This follows ADR
0001's mechanism (service + `BehaviorSubject`, no new library) even though nothing is persisted —
so it declares no storage key and no cap, and ADR 0003 does not apply.

*Alternative rejected:* `navigator.onLine` read directly in each component. It cannot react to
the events, and it makes three components own the same browser API.

**The offline indicator is a core component, rendered once by `AppComponent`.**
It sits with the other chrome in `src/app/core/`, subscribes to `ConnectivityService`, and
renders a fixed, non-blocking bar using the existing theme mixins so it inherits every theme.

**The error state takes the reason, not just a message.**
`ErrorMessageComponent` gains an `offline` input. Its current hardcoded second paragraph — which
already assumes an offline reader — becomes conditional: shown when offline, replaced with a
retry-suggesting line when online. `ItemDetailsComponent` and `FeedComponent` pass the current
connectivity state when they set `errorMessage`.

*Alternative rejected:* branching on the caught error. `fetch` reports a network failure and a
CORS failure identically, so it cannot tell "offline" from "the API is down".

**`navigator.onLine` is the signal.** It is unreliable in one direction — it reports online for a
captive portal — but the failure mode is only mislabelled copy on an error page the reader is
already looking at. Probing the network to do better is not worth a request per navigation.

## Risks / Trade-offs

- **The API is cross-origin; only CORS responses are cacheable, opaque ones are not.** →
  `node-hnapi.herokuapp.com` returns `Access-Control-Allow-Origin`, so responses reach the
  service worker as CORS responses and cache normally. Verified against a production build in
  the tasks; if the API ever drops CORS the app breaks online first, so this cannot regress
  silently.
- **`unfetch` is XHR-based, not native `fetch`.** → Service workers intercept XHR from a
  controlled page the same as `fetch`, so `dataGroups` still apply. Confirmed against a
  production build rather than assumed.
- **A reader can be shown a stale thread with no indication of age when offline.** → The offline
  indicator states that they are seeing previously loaded content. Per-item timestamps are out
  of scope.
- **Cache is bounded, so a heavy reader loses the oldest stories.** → Silent by ADR 0003: losing
  an old story from the offline cache is not something the reader chose to keep.
- **Behavior only exists in production builds.** → Verification runs against `ng build` output
  served locally with DevTools offline, as ADR 0002 requires; unit tests cover the connectivity
  service and the two components, not the service worker.

## Migration Plan

Configuration only. The updated `ngsw-config.json` ships in the next production build; existing
clients pick up the new service worker on their next visit and start caching from then on. There
is no data to migrate and no state to roll back — reverting the file restores the previous
behavior on the following deploy.
