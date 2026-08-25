## 1. Bookmark storage

- [ ] 1.1 Add a `SavedStory` model in `src/app/shared/models/` holding the display subset of `Story` (id, title, url, domain, points, user, comments_count, time_ago, type) plus `saved_at`; verify `npm run build` compiles with the model imported where used.
- [ ] 1.2 Add root-provided `BookmarksService` in `src/app/shared/services/` with a `BehaviorSubject<SavedStory[]>` seeded from the `savedStories` `localStorage` key, exposing `savedStories$` ordered most-recent-first, `isSaved(id)`, `toggle(story: Story)`, and `remove(id)`; verify unit tests cover save, toggle-off, and the no-duplicate-id case.
- [ ] 1.3 Wrap every `localStorage` read/parse/write in try/catch and validate the parsed payload is an array of entries with a numeric `id`, falling back to an empty list; verify unit tests cover malformed JSON, a non-array payload, and a throwing `localStorage`.
- [ ] 1.4 Write the full list back to `localStorage` on every mutation; verify a unit test asserts the stored JSON after a toggle, and manually that saved items persist across a page reload in `npm start`.

## 2. Star toggle on story items

- [ ] 2.1 Inject `BookmarksService` into `ItemComponent` and expose the saved state for the current item; verify the component test renders an item that is already saved in the saved state.
- [ ] 2.2 Add the star button to `item.component.html` with `aria-pressed` and an action-naming `aria-label`, calling `toggle()` and stopping event propagation/default; verify a test asserts clicking the star does not trigger the title link navigation and that the toggle is keyboard-activatable.
- [ ] 2.3 Style the saved/unsaved star in `item.component.scss` using the existing theme variables so it works in default and night themes; verify visually in `npm start` under both themes.

## 3. Saved page

- [ ] 3.1 Create `SavedComponent` (`src/app/saved/`) rendering `savedStories$` through the existing `item` component with `async`; verify a component test lists two saved stories in most-recent-first order.
- [ ] 3.2 Add the empty state to the saved template, shown when the list is empty, telling the reader to save stories with the star on any feed item; verify a component test asserts the empty state renders with no saved stories and no list is shown.
- [ ] 3.3 Verify that toggling the star on a row of the saved page removes that row immediately, with a component test asserting the row disappears without a reload.
- [ ] 3.4 Register `SavedComponent` in `AppModule` and add the `saved` route to `app.routes.ts`; verify navigating to `/saved` renders the page in `npm start`.

## 4. Navigation and verification

- [ ] 4.1 Add the `saved` link with `routerLinkActive="active"` to `core/header/header.component.html` next to `jobs`; verify the link is marked active while on `/saved`.
- [ ] 4.2 Run `npm run lint` and `CHROME_BIN=$(find /opt/.devin/chrome -name chrome -type f | head -1) npm test -- --watch=false` and verify both pass.
- [ ] 4.3 Walk the end-to-end flow in the browser — save two stories from different feeds, reload, open `/saved` from the header, unsave one, confirm the remaining one and then the empty state — and verify each spec scenario is observed.
