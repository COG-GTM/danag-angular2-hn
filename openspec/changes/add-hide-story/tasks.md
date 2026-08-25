## 1. Dismissal state

- [x] 1.1 Add `HiddenStoriesService` (root-provided) holding a `Set<number>` plus a `BehaviorSubject` stream, with `isHidden`, `hide`, `unhide`, `clear`, and a hidden count; verify by unit tests covering add/remove/clear and stream emission
- [x] 1.2 Load and persist the set under a single `hiddenStories` local-storage key, wrapping every read/write in try/catch so failures fall back to in-memory only; verify by unit tests for malformed JSON, missing key, and a throwing storage stub

## 2. Feed integration

- [x] 2.1 Derive `visibleItems` in `FeedComponent` from the fetched items and the hidden-set stream, unsubscribing on destroy, and render that array instead of `items`; verify the feed template no longer shows a hidden story and ordering is unchanged
- [x] 2.2 Add a hide control to `ItemComponent` with an accessible label, emitting the story id upward; verify by keyboard-focusing the control and activating it
- [x] 2.3 Render a transient undo placeholder in the hidden story's slot in `FeedComponent`, clearing it on navigation; verify undo restores the story to its original position

## 3. Settings

- [x] 3.1 Add a "Hidden stories" section to the settings panel showing the hidden count and a clear-all action wired to `HiddenStoriesService.clear()`; verify clearing while a feed is open makes previously hidden stories reappear

## 4. Verification

- [x] 4.1 Run `yarn build` and confirm it succeeds, and run `yarn lint` and confirm the new files add no errors (the repo has pre-existing lint errors)
- [x] 4.2 Exercise the flow in the browser: hide a story, undo, hide again, reload, confirm it stays hidden, then clear from settings
