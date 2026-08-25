# Architecture decision records

Decisions that constrain how features are built here. An OpenSpec proposal that touches
persistence, offline behavior, or dependencies must state which ADRs apply and follow them,
or open with a proposal to supersede one.

| # | Decision | Status |
| --- | --- | --- |
| [0001](0001-device-local-state.md) | Device-local state goes through an Angular service over namespaced `localStorage` keys | Accepted |
| [0002](0002-offline-caching-is-the-service-worker.md) | Offline availability of API data is the service worker's job, not application code | Accepted |
| [0003](0003-bounded-device-storage.md) | Every device-local collection is bounded and evicts oldest first | Accepted |
