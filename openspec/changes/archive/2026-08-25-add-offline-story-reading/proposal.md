## Why

The app already caches its shell and static assets for offline use, but story content comes from the live Hacker News API on every view. When the connection drops, a story the reader already opened shows only "Could not load item comments." — the content they were reading a moment ago is gone.

## What Changes

- Story detail content (title, metadata, comments) is saved locally whenever a reader successfully opens a story.
- When the story detail request fails, the app falls back to the saved copy instead of showing an error, so previously opened stories stay readable offline.
- The reader is told when they are looking at a saved copy, including when it was saved.
- Saved copies are bounded: the app keeps the most recently opened stories and evicts the oldest, and it degrades gracefully when local storage is unavailable or full.

## Capabilities

### New Capabilities
- `offline-reading`: Local retention of story content the reader has opened, and its use as a fallback when the network is unavailable.

### Modified Capabilities

_None — this is the first capability spec in this project._

## Impact

- `src/app/shared/services/` — new service holding saved story content.
- `src/app/shared/services/hackernews-api.service.ts` — saves story detail responses and falls back to saved copies on failure.
- `src/app/item-details/` — surfaces the saved-copy notice.
- No new runtime dependencies; uses browser local storage.
