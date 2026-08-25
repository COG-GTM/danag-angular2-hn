## Purpose

Let a reader bookmark stories they see in the feeds and read them back later on a dedicated saved page, with the bookmarks stored on the reader's own device so they survive reloads without an account or a server.

## ADDED Requirements

### Requirement: Bookmark toggle on story items

Every story item rendered in a feed SHALL present a star toggle control that saves the story when it is not saved and removes it when it is. The control SHALL indicate the current saved state of that story whenever the item is rendered, and SHALL be reachable by keyboard with an accessible label that names the action.

#### Scenario: Saving a story from the feed
- **WHEN** the reader activates the star toggle on a story that is not saved
- **THEN** the story is added to the saved stories list and the toggle shows the saved state without navigating away or reloading the feed

#### Scenario: Unsaving a story from the feed
- **WHEN** the reader activates the star toggle on a story that is already saved
- **THEN** the story is removed from the saved stories list and the toggle shows the unsaved state

#### Scenario: Saved state is reflected on render
- **WHEN** a feed renders a story that is already in the saved stories list
- **THEN** that story's toggle is rendered in the saved state

#### Scenario: Toggling does not follow the story link
- **WHEN** the reader activates the star toggle on a story item
- **THEN** the story's link and comment navigation are not triggered

### Requirement: Device-local persistence of bookmarks

Saved stories SHALL be persisted in the browser's local storage on the device and SHALL be restored on subsequent visits. Persistence SHALL be per-device and per-browser: no account, no server call, and no cross-device sync. Each saved entry SHALL retain enough story data — at minimum id, title, url, domain, points, author, comment count, age text and type — to render the item without contacting the Hacker News API, plus the time it was saved.

#### Scenario: Bookmarks survive a reload
- **WHEN** the reader saves one or more stories and then reloads the application or reopens it later in the same browser
- **THEN** those stories are still saved and their toggles render in the saved state

#### Scenario: The same story is never saved twice
- **WHEN** a story whose id is already in the saved stories list is saved again
- **THEN** the list still contains exactly one entry for that id

#### Scenario: Unavailable or unreadable storage degrades gracefully
- **WHEN** local storage cannot be read or written (unavailable, full, or containing malformed data)
- **THEN** the application continues to render feeds and the saved page normally, treating the saved stories list as empty rather than failing

### Requirement: Saved page

The application SHALL provide a `/saved` page that lists every saved story, most recently saved first, using the same story item presentation as the feeds — including the star toggle, which on this page removes the story.

#### Scenario: Viewing saved stories
- **WHEN** the reader opens `/saved` with saved stories present
- **THEN** each saved story is listed in the feed's item presentation, ordered most recently saved first

#### Scenario: Removing a story from the saved page
- **WHEN** the reader activates the star toggle on an item on the saved page
- **THEN** that story is removed from the saved stories list and disappears from the list without a reload

#### Scenario: Empty state
- **WHEN** the reader opens `/saved` with no saved stories
- **THEN** the page shows an empty-state message explaining that stories can be saved with the star on any feed item, instead of an empty list

### Requirement: Saved navigation entry

The header navigation SHALL include a `saved` link to the saved page alongside the existing feed links, and SHALL mark it active while the saved page is displayed.

#### Scenario: Navigating to saved from the header
- **WHEN** the reader activates the `saved` link in the header
- **THEN** the saved page is displayed and the `saved` link is marked active
