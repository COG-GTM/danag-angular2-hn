## Purpose

Keeps story content a reader has already opened available on the device, so those stories stay readable when the network is slow, unreachable, or the device is offline.

## ADDED Requirements

### Requirement: Opened stories are retained for offline reading

The app SHALL retain the content of a story detail view (story metadata and its comments) on the device whenever that story is loaded successfully from the network.

#### Scenario: Story is opened while online

- **WHEN** a reader opens a story detail view and the content loads successfully from the network
- **THEN** the app retains that story's content on the device, together with the time it was retained

#### Scenario: Story is reopened while online

- **WHEN** a reader reopens a story that is already retained and the network load succeeds
- **THEN** the app replaces the retained content with the freshly loaded content and updates the retention time

#### Scenario: Local storage is unavailable

- **WHEN** the device refuses to retain story content (storage disabled, full, or otherwise erroring)
- **THEN** the app continues to display the story normally and reports no error to the reader

### Requirement: Retained stories remain readable without a network

The app SHALL fall back to a story's retained content when a story detail request fails, and SHALL only show the load error when no retained content exists for that story.

#### Scenario: Previously opened story is opened offline

- **WHEN** the story detail request fails and the app has retained content for that story
- **THEN** the app displays the retained story content instead of an error

#### Scenario: Never-opened story is opened offline

- **WHEN** the story detail request fails and the app has no retained content for that story
- **THEN** the app displays the existing load error message

### Requirement: Readers are told when content is a retained copy

The app SHALL indicate, on any story shown from retained content, that the content is a saved copy and when it was saved.

#### Scenario: Viewing a retained story

- **WHEN** a story detail view is populated from retained content
- **THEN** the view shows a notice identifying the content as a saved copy and stating when it was saved

#### Scenario: Viewing a freshly loaded story

- **WHEN** a story detail view is populated from a successful network load
- **THEN** no saved-copy notice is shown

### Requirement: Retained content is bounded

The app SHALL retain no more than the 50 most recently opened stories, discarding the least recently opened story when that limit is exceeded.

#### Scenario: Limit is exceeded

- **WHEN** a reader opens a story while 50 stories are already retained
- **THEN** the app retains the newly opened story and discards the least recently opened one
