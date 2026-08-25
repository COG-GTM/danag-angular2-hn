## Purpose

Lets a reader keep stories from any feed on their own device and come back to them later, without
an account and without a network connection.

## Requirements

### Requirement: Saving a story from a feed

Every story in a feed SHALL offer a control that saves it. The control SHALL be operable by
keyboard and SHALL expose its pressed state to assistive technology.

#### Scenario: Saving from the feed

- **WHEN** the reader activates the save control on an unsaved story
- **THEN** the story is added to the saved list
- **AND** the control renders as saved without the feed reloading

#### Scenario: Saving does not open the story

- **WHEN** the reader activates the save control
- **THEN** the story link is not followed and the current route does not change

### Requirement: Unsaving a story

A saved story SHALL be removable from the same control on the feed and from the saved list itself.

#### Scenario: Unsaving from the feed

- **WHEN** the reader activates the save control on a story that is already saved
- **THEN** the story is removed from the saved list
- **AND** the control renders as unsaved

#### Scenario: Unsaving from the saved page

- **WHEN** the reader unsaves a story while viewing the saved list
- **THEN** that story disappears from the list without a page reload

### Requirement: Viewing saved stories

The application SHALL provide a `saved` page, reachable from the header navigation, listing saved
stories most recently saved first, using the same presentation as a feed.

#### Scenario: Listing saved stories

- **WHEN** the reader opens the saved page with three saved stories
- **THEN** all three are listed, the most recently saved first

#### Scenario: Nothing saved yet

- **WHEN** the reader opens the saved page with no saved stories
- **THEN** the page explains that no stories are saved instead of rendering an empty list

### Requirement: Persistence on the device

Saved stories SHALL persist on the device across reloads and browser restarts, SHALL NOT be sent
to any server, and SHALL be scoped to that browser only.

#### Scenario: Surviving a reload

- **WHEN** the reader saves a story and reloads the application
- **THEN** the story is still listed on the saved page and still renders as saved in the feed

#### Scenario: Rendering without the network

- **WHEN** the reader opens the saved page while offline
- **THEN** the saved stories render from local data with no request to the stories API

### Requirement: Bounded saved list

The saved list SHALL hold at most 200 stories. Saving beyond that SHALL remove the oldest saved
story, and the reader SHALL be told that it happened.

#### Scenario: Saving at the cap

- **WHEN** the reader saves a story while 200 stories are already saved
- **THEN** the new story is saved, the oldest saved story is removed, and the list still holds 200

#### Scenario: Eviction is visible

- **WHEN** a save evicts the oldest story
- **THEN** the reader is shown a message naming the evicted story

#### Scenario: Stored data above the cap

- **WHEN** stored data holds more than 200 stories
- **THEN** the application keeps the 200 most recently saved and discards the rest

### Requirement: Tolerating unusable storage

Unreadable or unwritable local storage SHALL degrade the feature, never break the application.

#### Scenario: Corrupted stored data

- **WHEN** the stored value is missing, unparseable, or not a list
- **THEN** the application starts with an empty saved list and does not throw during startup

#### Scenario: Storage refuses a write

- **WHEN** a save cannot be written to local storage
- **THEN** the story still appears as saved for the remainder of the session and the application
  does not throw
