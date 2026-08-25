## Purpose

Defines what a reader can still read, and what the app tells them, when the device has no usable
connection to the Hacker News API. Covers feed lists and item pages the reader has already
opened, the age of what they are shown, and what happens when the connection returns.

## ADDED Requirements

### Requirement: Previously opened content is readable offline

The app SHALL keep the responses behind feed lists (`news`, `newest`, `best`, `ask`, `show`,
`jobs`) and item pages (a story with its comment thread) available for reading after the
connection drops, for any feed page or item page the reader has opened before.

Content the app does not serve — external article links — is out of scope and SHALL NOT be
made available offline.

#### Scenario: Opening a cached story with no connection

- **WHEN** the reader opens an item page they have opened within the last 24 hours, with no
  connection
- **THEN** the story and its comment thread render as they normally do, with no loader and no
  error message

#### Scenario: Opening a cached feed with no connection

- **WHEN** the reader opens a feed page they have visited within the last hour, with no
  connection
- **THEN** the story list renders as it normally does

#### Scenario: Following an external link offline

- **WHEN** the reader activates a story's external article link with no connection
- **THEN** the app does not intercept it and the browser handles it as it would any other
  unreachable page

### Requirement: Offline content is labelled as possibly out of date

When the app serves content it cannot revalidate because the device is offline, it SHALL show a
persistent indicator on that view stating that the content may be out of date and when it was
last fetched.

The indicator SHALL be dismissible by the reader, SHALL stay dismissed for the remainder of that
offline period, and SHALL NOT obscure the content behind it.

#### Scenario: Indicator on cached content

- **WHEN** a cached item page or feed page renders while the device is offline
- **THEN** the view shows an indicator that the content may be out of date, including how long
  ago it was last fetched

#### Scenario: Reader dismisses the indicator

- **WHEN** the reader dismisses the indicator
- **THEN** it disappears and does not return while the device stays offline

#### Scenario: Online content is not labelled

- **WHEN** content is served while the device is online
- **THEN** no offline indicator is shown

### Requirement: Content that was never cached shows an offline empty state

When the device is offline and the requested feed page or item page has no usable cached copy,
the app SHALL show an empty state explaining that this content is not available offline yet and
offering a retry action. It SHALL NOT show an indefinite loader and SHALL NOT show an empty
list as if the content had loaded.

Activating retry SHALL attempt to load the content again, showing the loaded content on success
and the same empty state again on failure.

#### Scenario: Opening an uncached story offline

- **WHEN** the reader opens an item page they have never opened, with no connection
- **THEN** the view shows an offline empty state explaining the story is not available offline
  yet, with a retry action

#### Scenario: Retry while still offline

- **WHEN** the reader activates retry and the device is still offline
- **THEN** the offline empty state remains

#### Scenario: Retry after the connection returns

- **WHEN** the reader activates retry and the device has a connection again
- **THEN** the content loads and renders normally, with no offline indicator

### Requirement: Cached content expires

A cached feed list SHALL be served for at most 1 hour after it was fetched, and a cached item
page for at most 24 hours. Past that age, the app SHALL treat the cached copy as absent: it
goes to the network, and if the network is unavailable the reader gets the offline empty state
rather than expired content.

While the device is online, the app SHALL serve an unexpired cached copy first and refresh from
the network afterwards, rather than making the reader wait on the network.

#### Scenario: Expired feed offline

- **WHEN** the reader opens a feed page last fetched more than 1 hour ago, with no connection
- **THEN** the view shows the offline empty state, not the expired list

#### Scenario: Expired item page offline

- **WHEN** the reader opens an item page last fetched more than 24 hours ago, with no
  connection
- **THEN** the view shows the offline empty state, not the expired story

#### Scenario: Cached content served first when online

- **WHEN** the reader opens a feed page or item page with an unexpired cached copy while online
- **THEN** the cached copy renders without waiting for the network, and a fresher copy replaces
  it if the background refresh returns one

### Requirement: Reconnecting recovers the current view

When the device regains its connection, the app SHALL refresh the view the reader is on and
remove the offline indicator, without the reader reloading the page.

#### Scenario: Reconnect on a cached view

- **WHEN** the connection returns while the reader is looking at cached content
- **THEN** the indicator disappears and the view is refreshed from the network

#### Scenario: Reconnect on an offline empty state

- **WHEN** the connection returns while the reader is looking at the offline empty state
- **THEN** the content loads and replaces the empty state

### Requirement: Offline storage is bounded

The offline cache SHALL declare a maximum size and evict oldest first when it is exceeded, so
that reading more stories cannot grow device storage without limit.

At most 60 feed responses and 200 item responses SHALL be retained; the device-local record of
when each URL was last fetched SHALL hold at most 300 entries. Eviction SHALL be silent — the
reader is not asked to manage the cache and is not notified when an old page is dropped.

#### Scenario: Reading past the item cap

- **WHEN** the reader has opened more than 200 item pages
- **THEN** the oldest cached item pages are evicted, the most recent ones remain readable
  offline, and no cache-management prompt is shown

#### Scenario: Evicted content offline

- **WHEN** the reader opens an item page that was evicted, with no connection
- **THEN** the view shows the offline empty state
