## 1. Device-local persistence

- [ ] 1.1 Add `SavedStoriesService` under `src/app/shared/services/`, root-provided like
  `SettingsService`, holding a newest-first `Story[]` plus a `Set<number>` of ids, loaded once from
  a single `localStorage` key; verify by injecting it in a spec and reading an empty list on a
  clean store
- [ ] 1.2 Guard the load path so a missing, unparseable, or non-array stored value yields an empty
  list instead of throwing; verify with specs for each of the three cases
- [ ] 1.3 Implement `isSaved(id)`, `toggle(story)` and `remove(id)` — mutate the array, rebuild the
  `Set`, write the whole array back inside a try/catch so a quota failure degrades to in-memory;
  verify with specs for toggle on, toggle off, newest-first ordering, and a persistence round-trip

## 2. Save control on feed items

- [ ] 2.1 Inject `SavedStoriesService` into `ItemComponent` and expose the saved state and toggle
  handler to the template; verify the component spec still compiles and passes
- [ ] 2.2 Add the control to `item.component.html` as a `<button>` with `aria-pressed` and a
  state-dependent `aria-label`, calling the handler with `preventDefault()` and
  `stopPropagation()`; verify in the browser that activating it never follows the story link
- [ ] 2.3 Style saved and unsaved states in `item.component.scss`, with a hover shade distinct from
  the saved shade; verify against the light and night themes and both the palm and laptop subtext
  layouts

## 3. Saved page

- [ ] 3.1 Add `SavedStoriesComponent` rendering the service's list through the existing `<item>`
  component, with an en-US empty state; verify both states render in the browser
- [ ] 3.2 Declare it in `AppModule` and register a flat `saved` route in `app.routes.ts`; verify
  `/saved` resolves on a cold load, not only via in-app navigation
- [ ] 3.3 Add the `saved` nav link to `header.component.html` with `routerLinkActive="active"` and
  the existing `scrollTop()` handler; verify the header still fits on one row at 320px

## 4. Verification

- [ ] 4.1 Run the full unit suite with `CHROME_BIN=$(find /opt/.devin/chrome -name chrome -type f |
  head -1) npm test -- --watch=false` and confirm the new specs pass with no regressions
- [ ] 4.2 Confirm `NODE_OPTIONS=--openssl-legacy-provider npm run build` succeeds
- [ ] 4.3 Walk every spec scenario in the browser: save from the feed, unsave from the feed, unsave
  from the saved page, newest-first ordering, the empty state, and bookmarks surviving a reload
