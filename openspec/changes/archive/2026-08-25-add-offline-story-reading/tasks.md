## 1. Offline story store

- [x] 1.1 Add `OfflineStoryStoreService` in `src/app/shared/services/` that saves and reads story entries (`{ story, savedAt }`) under one `localStorage` key; verify unit tests cover save-then-read round-tripping
- [x] 1.2 Enforce the 50-entry limit by evicting the least recently saved entry, and retry a quota-failed write once after evicting; verify a unit test that saves 51 stories keeps the newest 50 and drops the oldest
- [x] 1.3 Make every read and write failure (missing `localStorage`, unparsable JSON, throwing setter) resolve to "not retained" without throwing; verify unit tests with a throwing storage stub
- [x] 1.4 Register the service as a provider so it is injectable app-wide; verify the app builds

## 2. Fallback on failed loads

- [x] 2.1 Save the story in `HackerNewsAPIService.fetchItemContent()` on a successful load; verify a unit test that the store holds the story after a mocked successful fetch
- [x] 2.2 Emit the retained story instead of erroring when the request fails and a copy exists, and keep propagating the error when it does not; verify unit tests for both branches
- [x] 2.3 Confirm the existing "Could not load item comments." error still shows for a story that was never opened; verify the item-details error path test

## 3. Saved-copy notice

- [x] 3.1 Have `ItemDetailsComponent` determine whether the displayed story came from retained content and when it was saved; verify a unit test covering both fresh and retained loads
- [x] 3.2 Render a saved-copy notice with the saved time in the item-details template, styled with the existing theme variables, and hide it for fresh loads; verify by screenshot of a story viewed offline
- [x] 3.3 Run `npm run build`, `npm run lint`, and the unit test suite; verify all three pass
