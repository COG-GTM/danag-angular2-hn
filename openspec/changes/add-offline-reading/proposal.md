## Why

A reader on a train or a plane keeps the app shell when the connection drops but loses every
story they were reading: the shell renders and the content area shows a loader that never
resolves. Stories and feeds the reader already opened were fetched over the network once and
should still be readable without one.

## What Changes

- Cache Hacker News API responses in the service worker: feed lists (`news`, `newest`, `best`,
  `ask`, `show`, `jobs`) and item pages (story plus its comment thread), configured as
  `dataGroups` in `ngsw-config.json`.
- Show a persistent, dismissible indicator on cached content viewed offline, stating that the
  content may be out of date and when it was last fetched.
- Show an offline empty state with a retry action when the reader opens a feed or story that
  was never cached, replacing today's indefinite loader.
- Refresh the current view automatically and clear the indicator when the connection returns,
  with no manual reload.
- Track, on the device, when each cached URL was last fetched from the network, so the
  indicator can state an age and so a never-cached or expired URL is recognized as a miss.

Not in scope: offline writing (voting, commenting), background sync, cache-management UI, and
external article links — those origins are not ours to cache. No new runtime dependency.

## Capabilities

### New Capabilities
- `offline-reading`: what a reader can read, and what they are told, when the device has no
  usable connection.

### Modified Capabilities

None. No existing capability spec covers feed or item behavior yet.

## Impact

- `ngsw-config.json`: two new `dataGroups`. Verified against a production build, not `ng serve`.
- `src/app/shared/services/`: a connectivity service and an offline-cache ledger service; the
  Hacker News API service records fetch times through the ledger.
- `src/app/shared/components/`: an offline indicator and an offline empty state.
- `src/app/feeds/feed/` and `src/app/item-details/`: wire both states in and refresh on
  reconnect.
- ADRs that constrain this change: 0001 (device-local state through a service over namespaced
  `localStorage` keys, no new state dependency), 0002 (API payloads are cached by the service
  worker, never copied into `localStorage`), 0003 (every device-local collection declares a cap
  and evicts oldest first). This change follows all three; none is superseded.
