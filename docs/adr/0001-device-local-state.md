# 0001 — Device-local state goes through an Angular service over namespaced `localStorage` keys

Status: Accepted

## Context

The app has no backend of its own and no user accounts. Everything a reader configures or
accumulates — theme, font size, bookmarks — lives on the device. `SettingsService` already does
this, but with bare keys (`theme`, `titleFontSize`) written from several call sites.

## Decision

Device-local state is owned by an injectable service. Components never touch `localStorage`
directly.

Keys are namespaced and versioned: `hn:<feature>:v1`. A service that cannot parse its key
returns empty state rather than throwing; a storage write that fails (quota, private mode)
degrades to in-memory for the session.

No new state-management dependency. RxJS `BehaviorSubject` is the mechanism for sharing state
between components.

## Consequences

Adding a feature that persists something means adding a service and a key, not a library.
`SettingsService`'s bare keys predate this ADR and are grandfathered; new keys are namespaced.

## Alternatives rejected

**NgRx or Akita.** The store would be larger than the state it holds. Two services and a
`BehaviorSubject` cover every case we have.

**IndexedDB.** Justified only above a few MB. Revisit if a feature needs to persist API payloads
rather than ids — see ADR 0002.
