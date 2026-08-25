# 0003 — Every device-local collection is bounded and evicts oldest first

Status: Accepted

## Context

`localStorage` is capped near 5MB per origin and shared across every feature. A collection that
grows with use — bookmarks, read ids, history — eventually throws `QuotaExceededError` on write,
and the failure surfaces in whichever feature happens to write next, not the one that filled it.

## Decision

Any collection persisted on the device declares a maximum size in its service and evicts oldest
first when it exceeds it.

Eviction that a reader would notice — losing a bookmark they saved — is shown to them. Eviction
they would not notice, such as trimming read ids, is silent.

A feature that cannot state a bound is not ready to be built.

## Consequences

Every persistence proposal answers "how many, and what happens at the limit" before
implementation. Present caps: bookmarks 200 (visible eviction), read ids 1000 (silent).

## Alternatives rejected

**Grow until the write fails, then handle the error.** The failure lands in an unrelated feature
and the reader cannot tell what was lost.

**Prompt the reader to clean up.** A storage-management UI for a news reader nobody asked for.
