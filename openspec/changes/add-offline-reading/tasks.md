## 1. Service worker configuration

- [ ] 1.1 Add the `hn-feeds` and `hn-items` `dataGroups` to `ngsw-config.json` with the
  strategies, `maxAge` and `maxSize` values from design.md, and verify `yarn build` emits both
  group names into `dist/angular-hnpwa/ngsw.json`

## 2. Application-level offline state

- [ ] 2.1 Add offline cache constants (feed and item max ages, refresh thresholds, ledger cap)
  in one shared module so the values in `ngsw-config.json` have a single counterpart in code
- [ ] 2.2 Implement `ConnectivityService` over `navigator.onLine` and the `window`
  `online`/`offline` events, exposing an observable, and verify unit tests cover the initial
  value and both transitions
- [ ] 2.3 Implement `OfflineCacheLedgerService` on key `hn:offline-cache-ledger:v1` with
  record, last-fetched and freshness reads, a 300-entry cap with silent oldest-first eviction,
  and unparsable-value and write-failure fallbacks, and verify unit tests cover each
- [ ] 2.4 Record feed and item fetch times through the ledger in `HackerNewsAPIService`,
  updating a timestamp only when the existing one is absent or older than that group's max age,
  and verify unit tests cover both cases
- [ ] 2.5 Emit a background-refreshed payload from `HackerNewsAPIService` when online and the
  ledger entry is past half its max age, using an `ngsw-bypass` request whose failure is
  swallowed, and verify unit tests cover the refresh, the no-refresh and the failure cases

## 3. Offline UI

- [ ] 3.1 Add `OfflineNoticeComponent` — persistent, dismissible, showing how long ago the
  content was fetched — to the shared components module, and verify unit tests cover the age
  copy and the dismiss output
- [ ] 3.2 Add `OfflineEmptyStateComponent` with explanatory copy and a retry output to the
  shared components module, and verify a unit test covers the retry emission
- [ ] 3.3 Wire both components into `FeedComponent`: notice when offline with a usable cached
  list, empty state when offline with none, retry re-runs the request, and verify unit tests
  cover the three states
- [ ] 3.4 Wire both components into `ItemDetailsComponent` with the same three states and
  verify unit tests cover them
- [ ] 3.5 Refresh the current view and clear the notice when connectivity returns in both
  components, and verify unit tests cover the offline→online transition

## 4. Verification

- [ ] 4.1 Run `yarn lint` and the unit suite headless, and verify both pass
- [ ] 4.2 Serve a production build statically and verify, with devtools offline mode, the
  cached-hit, cached-miss, stale-expiry and reconnect paths from
  `specs/offline-reading/spec.md`
