## 1. Service worker caching

- [x] 1.1 Add the `dataGroups` section to `ngsw-config.json` with the `hn-item`, `hn-feeds` and
  `hn-user` groups from design.md (order matters: item first), and verify `npm run build`
  emits an `ngsw.json` whose `dataGroups` contain the three names and their `maxSize`/`maxAge`
  values.

## 2. Connectivity state

- [x] 2.1 Add `ConnectivityService` in `src/app/shared/services/` exposing an `isOnline$`
  `BehaviorSubject` seeded from `navigator.onLine` and updated on `window` `online`/`offline`,
  with unit tests asserting the seed value and that dispatching each event emits the new state.
- [x] 2.2 Provide the service in `AppModule` and verify the app still bootstraps
  (`npm run build` succeeds).

## 3. Offline affordance

- [x] 3.1 Add an offline indicator component under `src/app/core/` that renders a fixed
  non-blocking bar only while `ConnectivityService` reports offline, with en-US copy saying the
  reader is offline and seeing previously loaded content; unit test asserts the bar is absent
  when online and present when offline.
- [x] 3.2 Render the indicator from `AppComponent` and style it with the existing theme mixins,
  verifying it inherits each theme (checked against the production build in task 5.1).
- [x] 3.3 Add an `offline` input to `ErrorMessageComponent` and make its second paragraph
  conditional — the offline-first-visit copy when offline, a load-failure line when online — with
  unit tests covering both branches.
- [x] 3.4 Pass the current connectivity state into `app-error-message` from
  `ItemDetailsComponent` and `FeedComponent`, and verify their error paths render the offline
  copy when offline in unit tests.

## 4. Tests and checks

- [x] 4.1 Run `npm run lint` and `npm test -- --watch=false` and verify both pass, including the
  new specs.

## 5. Offline verification against a production build

- [x] 5.1 Serve `dist/` from a static server, load a feed and open a story, then set the browser
  to offline and verify: reloading that story renders it from cache with the offline indicator
  visible, the cached feed still lists stories, and a never-opened story shows the offline error
  copy.
