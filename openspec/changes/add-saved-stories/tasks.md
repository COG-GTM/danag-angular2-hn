## 1. Saved stories store

- [ ] 1.1 Add `SavedStoriesService` (`providedIn: 'root'`) in `src/app/shared/services/` holding the saved `Story[]` newest-first in a `BehaviorSubject`, exposing the list as an observable plus `isSaved(id)`, `toggle(story)`, and `remove(id)`; verify with unit tests that toggling twice returns the set to its previous contents
- [ ] 1.2 Load the set from a single `localStorage` key in the constructor and write it back on every mutation; verify with a unit test that a service constructed after a `toggle` sees the saved story
- [ ] 1.3 Wrap reads in try/catch falling back to an empty set, and wrap writes so a throwing `localStorage` leaves the in-memory set usable; verify with unit tests covering malformed JSON, a non-array payload, and a write that throws

## 2. Feed item star toggle

- [ ] 2.1 Add a star `button` to `ItemComponent`'s template with an `aria-label` stating the action and a class reflecting saved state, bound to `SavedStoriesService`; verify by unit test that the rendered control's state matches the service for a saved and an unsaved story
- [ ] 2.2 Have the click handler call `toggle` and stop event propagation/default; verify by unit test that clicking the star does not activate the title link and that the service is called once
- [ ] 2.3 Style the star in `item.component.scss` for both saved and unsaved states across the existing themes; verify visually on `/news/1` in the default and night themes

## 3. Saved page

- [ ] 3.1 Add `SavedComponent` (template, styles, component) rendering the service's list through the existing `item` component in the same `ol`/`li.post` structure the feed uses; verify by unit test that one `item` element is rendered per saved story
- [ ] 3.2 Render the empty state when the list is empty, explaining that no stories are saved and how to save one; verify by unit test with an empty service list
- [ ] 3.3 Confirm unsaving from the saved page removes the row without a reload; verify by unit test that the rendered rows shrink after a `remove`

## 4. Wiring

- [ ] 4.1 Declare `SavedComponent` in `AppModule` and add a `saved` route in `app.routes.ts`; verify `/saved` renders the page with `npm start`
- [ ] 4.2 Add the `saved` link to `header.component.html` alongside the existing feed links with `routerLinkActive`; verify by clicking it in the running app that it navigates and is marked active

## 5. Verification

- [ ] 5.1 Run `npm run lint` and `CHROME_BIN=$(find /opt/.devin/chrome -name chrome -type f | head -1) npm test -- --watch=false` and verify both pass
- [ ] 5.2 Walk the full flow in the running app — save two stories from a feed, reload, open `/saved`, unsave one, reload again — and verify the list matches expectations at each step
