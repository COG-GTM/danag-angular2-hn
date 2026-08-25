## 1. Service worker configuration

- [x] 1.1 Add an `api-items` dataGroup to `ngsw-config.json` matching `https://node-hnapi.herokuapp.com/item/**`, with `strategy: performance`, `maxSize: 200`, `maxAge: 1d`; verify `ng build --prod` emits the group into `dist/*/ngsw.json` with those values
- [x] 1.2 Add an `api-feeds` dataGroup matching the feed paths (`news`, `newest`, `ask`, `show`, `jobs`, with and without a `page` query), with `strategy: performance`, `maxSize: 50`, `maxAge: 1h`; verify the built `ngsw.json` lists both groups and that the feed patterns do not also match `/item/**`
- [x] 1.3 Confirm no application source changed for this capability — `git diff --stat` shows `ngsw-config.json` and `openspec/` only

## 2. Verification against a production build

- [x] 2.1 Build with `ng build --prod` and serve `dist/` over HTTP (the service worker is inactive under `ng serve`); verify in DevTools > Application that the service worker is activated
- [x] 2.2 Load a feed, open a story, then go offline (DevTools > Network > Offline) and reload that story; verify the story and its comments render — covers "Previously opened stories remain readable offline"
- [x] 2.3 While still offline, navigate back to the feed; verify the list renders — covers "Previously viewed feeds remain browsable offline"
- [x] 2.4 While still offline, navigate to a story never opened in this session; verify the app reports the content as unavailable rather than rendering unrelated content — covers the "Story was never opened" scenario
- [x] 2.5 Inspect DevTools > Application > Cache Storage; verify entries appear under the `ngsw:*:dynamic` caches for both groups, and verify Local Storage contains only settings/bookmark/read-id keys and no API payloads — covers "API payloads are not stored in localStorage"
- [x] 2.6 Capture screenshots of the offline story render and the Cache Storage/Local Storage panes for the PR

## 3. Repo checks and change closeout

- [x] 3.1 Run `yarn lint` and `yarn test --watch=false --browsers=ChromeHeadless`; verify both pass — both fail identically on the unmodified base branch (52 tslint errors across `src/`, and karma exits non-zero because the repo contains no `.spec.ts` files), and no application source changed here
- [x] 3.2 Run `openspec validate add-offline-story-reading --strict`; verify it reports no errors
- [x] 3.3 Run the archive workflow so the delta spec is promoted into `openspec/specs/offline-reading/spec.md` and the change moves under `openspec/changes/archive/`, then open the PR against `devin/1787628339-openspec-init`
