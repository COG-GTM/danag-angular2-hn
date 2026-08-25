## Purpose

Lets a reader bookmark stories they come across in the feeds and revisit them later on a dedicated page, with the bookmark set kept on the reader's own device.

## ADDED Requirements

### Requirement: Bookmark toggle on feed stories
Every story rendered in a feed SHALL present a star control that toggles whether that story is saved. The control SHALL reflect the story's current saved state whenever it is rendered, and SHALL expose an accessible name that states which action it performs.

#### Scenario: Saving a story from the feed
- **WHEN** a reader activates the star control on a story that is not saved
- **THEN** the story becomes saved and the control renders in its saved state

#### Scenario: Unsaving a story from the feed
- **WHEN** a reader activates the star control on a story that is already saved
- **THEN** the story is no longer saved and the control renders in its unsaved state

#### Scenario: Toggle does not navigate
- **WHEN** a reader activates the star control on a story
- **THEN** the current page stays in place and no story link is followed

#### Scenario: Saved state shown on load
- **WHEN** a feed page renders stories that were saved earlier
- **THEN** each of those stories shows its star control in the saved state

### Requirement: Device-local persistence of saved stories
Saved stories SHALL be stored on the reader's device and SHALL remain saved across page reloads and browser restarts. They SHALL NOT be sent to any server or shared across devices. Each saved story SHALL retain enough information to be displayed on the saved page without refetching it.

#### Scenario: Bookmarks survive a reload
- **WHEN** a reader saves a story and then reloads the application
- **THEN** the story is still saved and appears on the saved page

#### Scenario: Unsaved story does not return
- **WHEN** a reader unsaves a story and then reloads the application
- **THEN** the story is absent from the saved page

#### Scenario: Corrupt or unreadable device storage
- **WHEN** the stored bookmark data is missing, unreadable, or not in the expected shape
- **THEN** the application treats the saved set as empty and continues to work, and subsequent saves overwrite the unusable data

#### Scenario: Device storage rejects a write
- **WHEN** persisting a bookmark fails because device storage is unavailable or full
- **THEN** the application continues to work with the in-memory saved set and does not surface an unhandled error

### Requirement: Bounded saved set with oldest-first eviction
The saved set SHALL hold at most 200 stories. Saving a story when the set is already at the cap SHALL evict the oldest saved story to make room, and the application SHALL inform the reader that this happened, naming what was removed. The eviction SHALL be persisted along with the new bookmark.

#### Scenario: Saving at the cap evicts the oldest
- **WHEN** a reader saves a story while 200 stories are already saved
- **THEN** the new story is saved, the story saved longest ago is no longer saved, and the set still holds 200 stories

#### Scenario: Eviction is reported to the reader
- **WHEN** a save causes an eviction
- **THEN** the reader is shown a notice identifying the story that was removed to make room

#### Scenario: No notice without an eviction
- **WHEN** a reader saves a story while fewer than 200 stories are saved
- **THEN** nothing is evicted and no eviction notice is shown

#### Scenario: Eviction survives a reload
- **WHEN** a save causes an eviction and the reader then reloads the application
- **THEN** the evicted story is still absent and the newly saved story is present

#### Scenario: Stored set already exceeds the cap
- **WHEN** the stored bookmark data holds more than 200 stories
- **THEN** the application keeps the 200 most recently saved and discards the rest

### Requirement: Saved stories page
The application SHALL provide a `saved` page that lists every saved story using the same story presentation as the feeds, ordered most recently saved first. Removing a story from that page SHALL remove it from the list immediately.

#### Scenario: Listing saved stories
- **WHEN** a reader opens the saved page with saved stories present
- **THEN** each saved story is listed with the same presentation used in the feeds, most recently saved first

#### Scenario: Unsaving from the saved page
- **WHEN** a reader activates the star control of a story listed on the saved page
- **THEN** that story is removed from the list without a reload

#### Scenario: Empty state
- **WHEN** a reader opens the saved page with no saved stories
- **THEN** the page shows a message explaining that no stories are saved and how to save one

### Requirement: Header navigation to saved stories
The header navigation SHALL include a `saved` entry that opens the saved page, presented consistently with the existing feed navigation entries and marked as active while that page is shown.

#### Scenario: Navigating to the saved page
- **WHEN** a reader activates the `saved` entry in the header
- **THEN** the saved page is shown and the entry is marked active
