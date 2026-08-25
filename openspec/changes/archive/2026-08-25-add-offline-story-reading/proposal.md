## Why

The app is installable and its shell already works offline, but every piece of content comes from the Hacker News API at runtime and none of it is cached. A reader who opens a story, walks into a tunnel, and comes back to the tab gets an empty screen — the shell loads and the content does not. Stories a reader has already opened should still be readable when the connection drops.

## What Changes

- Cache Hacker News API responses in the service worker so previously fetched content is served when the network is unavailable.
- Item responses (a story and its comment thread) are cached with the largest budget, since these are what a reader returns to read.
- Feed list responses (news, newest, ask, show, jobs) are cached so a reader can still see the list they were browsing and navigate into stories they already opened.
- Caching is bounded: entries expire after a fixed age and each cache holds a fixed maximum number of entries, so the app cannot grow without limit on a reader's device.
- Cached content is only served while it is within its age bound — short for feeds, longer for item content — so the cache does not become a stale replacement for live data.
- No API payloads are written to `localStorage`; that budget stays reserved for user intent (today the display settings written by `settings.service.ts`, plus any future id lists such as bookmarks or read stories).

## Capabilities

### New Capabilities
- `offline-reading`: what content remains available when the device is offline, how long it stays available, and how much of it is retained.

### Modified Capabilities

(none — no existing spec's requirements change)

## Impact

- `ngsw-config.json`: gains `dataGroups` covering the Hacker News API origin.
- No application source changes: `HackerNewsAPIService` keeps issuing the same requests, and the service worker intercepts them.
- Behavior differs between `ng serve` (service worker inactive, no caching) and a production build (service worker active). Verification must use a production build.
- Storage lives in the Cache Storage API, separate from the shared 5MB `localStorage` budget.
