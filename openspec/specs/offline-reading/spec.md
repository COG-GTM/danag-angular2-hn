# offline-reading Specification

## Purpose

Defines what Hacker News content remains readable when the device has no usable network connection, how long that content stays available, and how much of it the app retains on the device.

## Requirements

### Requirement: Previously opened stories remain readable offline

The app SHALL serve a previously fetched item response (a story and its comment thread) from its own storage when the network is unavailable, so a reader who has opened a story can still read it after the connection drops.

#### Scenario: Reader reopens a story with no connection

- **WHEN** a reader has opened a story while online and later navigates to that same story with no network connection
- **THEN** the story and its comments render from stored content instead of an empty or errored view

#### Scenario: Story was never opened

- **WHEN** a reader navigates to a story they have never opened and there is no network connection
- **THEN** the app reports the content as unavailable rather than rendering stale or unrelated content

### Requirement: Previously viewed feeds remain browsable offline

The app SHALL serve a previously fetched feed list response (news, newest, ask, show, jobs) from its own storage when the network is unavailable, so a reader can still see the list they were browsing and navigate into stories they already opened.

#### Scenario: Reader returns to a feed with no connection

- **WHEN** a reader has loaded a feed page while online and later opens that same feed page with no network connection
- **THEN** the feed renders the previously fetched list of stories

### Requirement: Stored content stays current within its age bound

Stored content SHALL be served only while it is within its configured maximum age; beyond that age the app SHALL fetch live content when the network is available. Feed lists SHALL have a shorter maximum age than item content, because feeds change continuously while a published story and its thread change little.

#### Scenario: Stored copy is within its age bound

- **WHEN** a reader loads a feed or story that was fetched recently enough to be within its maximum age
- **THEN** the app renders the stored copy without waiting on the network

#### Scenario: Stored copy has aged out and the network is available

- **WHEN** a reader loads a feed or story whose stored copy is older than its maximum age, and the network is available
- **THEN** the app fetches and renders live content, and that response replaces the stored copy

### Requirement: Offline content retention is bounded

The app SHALL bound what it retains on a reader's device by both age and entry count: stored API responses SHALL expire after a fixed maximum age, and each cache SHALL retain at most a fixed maximum number of entries, evicting the least recently used entries beyond that limit.

#### Scenario: Stored response exceeds its maximum age

- **WHEN** a stored API response is older than the configured maximum age
- **THEN** the app does not serve it, and treats the content as not stored

#### Scenario: Entry count exceeds the maximum

- **WHEN** a reader opens more items than the configured maximum entry count
- **THEN** the app retains the most recently used entries up to that limit and evicts the rest

### Requirement: API payloads are not stored in localStorage

The app SHALL NOT persist Hacker News API payloads in `localStorage`. That storage remains reserved for user intent — today the reader's display settings, and any future id lists such as bookmarks or read stories — which shares a 5MB per-origin budget.

#### Scenario: Reader browses many stories

- **WHEN** a reader loads feeds and opens stories
- **THEN** no API response body is written to `localStorage`, and the app's `localStorage` footprint stays limited to user-intent keys
