## Context

See proposal.md — Why. Constraints that shape the approach: Angular 9 with no state library, no
backend of its own, and node-hnapi as the only data source. `SettingsService` already establishes
the pattern for device-local state — a root-provided service reading `localStorage` synchronously
at construction and writing on every mutation — and templates bind to it directly with no
observables.

The relevant API limitation: node-hnapi exposes `/news`, `/item/:id`, and per-feed endpoints. There
is no endpoint that takes a list of ids.

## Goals / Non-Goals

**Goals:**

- Saved stories render with no network request.
- The save control fits the existing item layout at palm and laptop breakpoints, in both themes.
- Failure of `localStorage` never breaks feed rendering.

**Non-Goals:**

- Syncing between devices or browsers.
- Refreshing a saved story's points or comment count.
- Saving comments, users, or jobs as distinct entities.

## Decisions

**Store whole `Story` objects, not ids.** node-hnapi has no batch item endpoint, so an id-only list
would need one request per saved story on every visit to the saved page — 40 saved stories, 40
requests — and would render nothing offline. Storing the snapshot makes the saved page a pure local
read. Alternative rejected: ids plus a refetch on view, which fails the offline requirement and is
slower in every case.

**A single `localStorage` key holding a JSON array.** Mirrors `SettingsService`. Alternative
rejected: one key per story, which makes ordering and enumeration the caller's problem for no gain
at this size.

**Newest-first ordering, maintained on write.** Prepend on save. The list is read far more often
than written, and no timestamp field needs storing.

**An in-memory `Set` of ids for membership.** Every feed item asks "am I saved?" on every render;
scanning the array would be O(n) per item. Rebuild the `Set` on mutation.

**A native `<button>` with `aria-pressed`, not a styled anchor or a div.** Keyboard and screen
reader behavior come free, and the item title is already a link — nesting interactive elements
inside it would be invalid. The handler calls `preventDefault()` and `stopPropagation()` so saving
never navigates.

**Cap the list at 200, evicting the oldest on write.** A snapshot is roughly 1KB against a ~5MB
`localStorage` budget shared with `SettingsService`, so an uncapped list eventually throws
`QuotaExceededError` on a write the reader believes succeeded. 200 is two orders of magnitude below
the budget and above any plausible reading backlog. Newest-first ordering makes eviction a `pop()`.
Alternatives rejected: evicting only on quota failure, which makes the failure browser-dependent and
untestable; and rejecting the save at the cap, which makes the star silently stop working.

**Announce eviction in the UI rather than dropping silently.** Losing a bookmarked story without
notice is the worse failure. The application shell renders a dismissible line naming the evicted
story, so the reader sees it where the save happened — on the feed — not only on the saved page.
No new dependency.

**Read state synchronously, no observable.** Matches `SettingsService` and lets the template bind
to a getter. An observable would be the right call if two components could mutate concurrently;
none can.

## Risks / Trade-offs

- **Snapshots go stale — points and comment counts freeze at save time.** → Accepted and stated in
  the spec's offline scenario. Mitigation if it ever matters: refetch on click-through, which the
  item route already does.
- **The cap loses stories for a heavy user.** → Eviction is oldest-first and announced, so it is
  never silent. Writes stay wrapped so a quota failure from any other source still degrades to
  in-memory for the session rather than throwing.
- **200 is a judgment call, not a measurement.** → It is a single constant in one service; raising
  it changes no behavior other than the bound.
- **Whole-array writes mean two tabs clobber each other** — the last tab to write wins. → Accepted;
  cross-tab sync via the `storage` event is a follow-up, not part of this change.
- **A saved story without a `url` renders differently** (title links to the item page, not out). →
  The saved page reuses the same item component, so it inherits the correct behavior.

## Open Questions

None.
