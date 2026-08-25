# 0002 — Offline availability of API data is the service worker's job, not application code

Status: Accepted

## Context

The app is already a PWA: `@angular/service-worker` is a dependency, `ServiceWorkerModule` is
registered in production, and `ngsw-config.json` prefetches the shell and assets. It does not
yet cache anything from the Hacker News API, so a reader who loses connection keeps the shell
and loses the content.

There is a tempting shortcut: write story payloads into `localStorage` when a reader opens them,
and read from there when offline.

## Decision

Content fetched over HTTP is cached by the service worker, configured through `dataGroups` in
`ngsw-config.json`. Application code does not copy API responses into `localStorage`.

`localStorage` holds user intent — settings, bookmark ids, read ids. It does not hold API
payloads.

Freshness strategy for HN data is `performance` with a bounded `maxAge`, not `freshness`: a
slightly stale story list beats a spinner, and comment threads are append-mostly.

## Consequences

Offline reading is a configuration change plus a UI affordance for the offline state, not a new
persistence layer. Cache eviction, quota and staleness are handled by the platform.

The service worker is inactive in `ng serve`, so offline behavior is verified against a
production build. Any change to `ngsw-config.json` must be tested that way.

## Alternatives rejected

**Snapshot stories into `localStorage` on open.** Duplicates a cache the platform already
provides, competes with it for the same quota, and requires hand-written invalidation. It also
puts multi-KB payloads into a 5MB store shared with settings and bookmarks — see ADR 0003.

**A custom `HttpInterceptor` cache.** Works in-tab, does nothing after a reload, which is the
case offline reading exists for.
