## Why

Readers scan the same feeds repeatedly and have no way to tell which stories they already opened, so they re-read titles and lose their place between visits. Hacker News itself does not track this per device, so the client must.

## What Changes

- Stories the reader has opened are visibly de-emphasised in every feed (news, newest, ask, show, jobs) with a "read" treatment that works in all themes.
- A story is recorded as read when the reader opens it: following the story's external link, or navigating to its item-details page (from a feed or directly by URL).
- Read state persists on the device across reloads and sessions via `localStorage`, keyed per story id, and is shared across all feeds.
- Read state is capped so the stored set cannot grow without bound; the oldest entries are dropped first.
- Read state is device-local and is never sent to the Hacker News API.

## Capabilities

### New Capabilities
- `read-story-marking`: recording which stories a reader has opened, persisting that set on the device, and reflecting it in the feed listings.

### Modified Capabilities
<!-- None: no existing spec files under openspec/specs/. -->

## Impact

- `src/app/shared/services/`: new service owning the read-story set and its `localStorage` persistence.
- `src/app/feeds/item/`: item component reads and records read state; template/styles gain the read treatment.
- `src/app/item-details/`: opening an item's details records it as read.
- `src/app/shared/scss/`: theme variables gain a read-title colour so the treatment holds in every theme.
- No API, dependency, or build changes.
