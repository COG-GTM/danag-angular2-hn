## 1. Read state service

- [x] 1.1 Add `ReadStoriesService` in `src/app/shared/services/` that loads the persisted id list into an in-memory `Set` at construction, exposes `isRead(id)` and `markAsRead(id)`, and persists the insertion-ordered array under a single `localStorage` key; verify by unit test that a marked id reads back as read and that a fresh service instance still reports it read.
- [x] 1.2 Make marking idempotent and cap the stored set at 1000 ids, evicting the entries recorded longest ago first; verify by unit test that re-marking stores no duplicate and that exceeding the cap keeps the most recently recorded ids only.
- [x] 1.3 Guard every storage read and write so unavailable storage or a corrupt/non-array stored value yields an empty set and no thrown error; verify by unit test with storage access stubbed to throw and with a garbage value in the key.

## 2. Feed marking and treatment

- [x] 2.1 Have `ItemComponent` expose the story's read state from the service and mark the story read when its title link is activated, in both the external-URL and internal-router branches, leaving the existing link behavior and `openLinkInNewTab` setting untouched; verify by unit test that clicking each title variant marks the story and that the anchor attributes are unchanged.
- [x] 2.2 Apply a `read` class to the title when the story is read and confirm by unit test that the class appears only for read stories and updates after the title is clicked without re-creating the component.
- [x] 2.3 Add a de-emphasised read-title colour to `_theme_variables.scss`, thread it through the `theme()` mixin in `_themes.scss`, and pass it for the default, night, and amoledblack themes; verify `npm run build` succeeds and the colour differs from the normal title colour in each theme.

## 3. Item details marking

- [x] 3.1 Mark the story read in `ItemDetailsComponent` when the route id resolves, so opening a story by comments link or direct URL counts; verify by unit test that navigating to an item id records it as read.

## 4. Verification

- [ ] 4.1 Run `npm run lint`, `npm test -- --watch=false`, and `npm run build`, and confirm all pass.
- [ ] 4.2 Exercise the app in a browser: open a story from a feed, return to the feed and confirm the title is de-emphasised without a reload, reload the page and confirm it stays de-emphasised, and confirm the same story shows as read in another feed that lists it.
