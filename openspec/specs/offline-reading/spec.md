# offline-reading Specification

## Purpose
Defines what a reader can still read when the device loses its network connection, how long
previously fetched Hacker News content stays readable, and how the reader is told that what is
on screen came from the cache rather than the network.

## Requirements

### Requirement: A story the reader has opened stays readable offline

The application SHALL serve a previously fetched story detail — title, metadata, text and the
comment thread as it stood when last fetched — from the device cache when the network is
unavailable.

Content SHALL remain available offline for at least 24 hours after it was fetched, and the
cached story detail collection SHALL be bounded so it cannot grow without limit; the oldest
entries are evicted first.

This behavior SHALL be present in production builds. It is not required in a development server
run, where the service worker is not registered.

#### Scenario: Reopening an already-opened story while offline
- **WHEN** the reader has opened a story while online, the connection is subsequently lost, and
  the reader navigates to that story again — including after a page reload
- **THEN** the story detail and its comment thread are rendered from the cache, and no error
  page is shown

#### Scenario: Opening a story never opened before while offline
- **WHEN** the reader is offline and navigates to a story detail that has not been fetched on
  this device
- **THEN** the app shell loads and an error state explains that this story has not been read
  before and needs a connection

#### Scenario: A previously read story goes stale
- **WHEN** cached story content is older than the freshness window and the network is available
- **THEN** the app fetches the current version and displays it, replacing the cached copy

### Requirement: A feed the reader has viewed stays browsable offline

The application SHALL serve previously fetched feed listings (news, newest, ask, show, jobs) and
user profiles from the device cache when the network is unavailable, so a reader offline can
still see the list they last loaded and navigate from it into stories that are themselves
cached.

Feed listings are more volatile than story threads and SHALL use a shorter freshness window than
story detail; a bounded number of listing and profile responses is retained.

#### Scenario: Browsing a previously loaded feed offline
- **WHEN** the reader loaded a feed page while online and later opens the app with no connection
- **THEN** that feed's stories are listed rather than an error page

#### Scenario: Navigating from a cached feed to an uncached story offline
- **WHEN** the reader, while offline, taps a story in a cached feed that they never opened
- **THEN** the story detail shows the not-read-before error state, and the feed remains
  navigable when they go back

### Requirement: The reader is told when the app is offline

The application SHALL display a persistent, non-blocking indicator whenever the browser reports
that the device has no network connection, and SHALL remove it when connectivity returns without
requiring a reload.

The indicator SHALL state in en-US copy that the reader is offline and that they are seeing
previously loaded content.

#### Scenario: Connection drops while the app is open
- **WHEN** the device goes offline while the app is open
- **THEN** the offline indicator appears without a reload

#### Scenario: Connection returns
- **WHEN** the device regains connectivity
- **THEN** the offline indicator disappears without a reload

#### Scenario: App opened with no connection
- **WHEN** the app is opened from the home screen or a reload with no connection
- **THEN** the offline indicator is visible from first render

### Requirement: Content that cannot be loaded offline fails legibly

When a request cannot be satisfied from the network or the cache, the application SHALL show an
error state whose copy reflects the reason: being offline with nothing cached is distinguished
from a load failure while online.

#### Scenario: Load fails while offline
- **WHEN** a story or feed cannot be loaded and the device is offline
- **THEN** the error state says the content is not available offline and needs a connection

#### Scenario: Load fails while online
- **WHEN** a story or feed cannot be loaded and the device is online
- **THEN** the error state reports a load failure and does not blame the connection
