## Purpose

Lets a reader dismiss stories they do not want to see so those stories stop appearing in feeds on that device, with the dismissal set kept locally and reversible.

## ADDED Requirements

### Requirement: Reader can hide a story from a feed

Every story row in a feed list SHALL offer a hide control. Activating it SHALL remove that story from the rendered feed immediately, without a page reload and without navigating away.

#### Scenario: Hiding a story removes it from the list
- **WHEN** a reader activates the hide control on a story in a feed
- **THEN** that story is no longer shown among the feed's stories and the remaining stories stay in their original relative order

#### Scenario: Hide control is reachable by keyboard and assistive tech
- **WHEN** a reader focuses a story's hide control using the keyboard
- **THEN** the control exposes an accessible label identifying it as hiding that story, and activating it with the keyboard hides the story

### Requirement: Hidden stories stay hidden across feeds, pages, and visits

A hidden story SHALL be excluded from every feed list on the device — any feed type, any page — until it is un-hidden. The dismissal SHALL survive reloads and browser restarts.

#### Scenario: Hidden story does not reappear in another feed
- **WHEN** a reader hides a story in one feed and then opens another feed that also contains that story
- **THEN** the story is not shown in that feed

#### Scenario: Hidden story does not reappear after reload
- **WHEN** a reader hides a story and later reloads the application on the same device
- **THEN** the story is still excluded from the feeds

#### Scenario: Story detail remains reachable
- **WHEN** a reader navigates directly to the item detail route of a hidden story
- **THEN** the story's details and comments are still displayed

### Requirement: Dismissals are stored only on the device

The set of hidden story ids SHALL be persisted in the browser's local storage for the current origin. The system SHALL NOT send dismissals to any server and SHALL NOT require an account.

#### Scenario: No dismissal data leaves the device
- **WHEN** a reader hides a story
- **THEN** the story id is written to local storage and no request carrying dismissal data is made

#### Scenario: Persistence is unavailable
- **WHEN** local storage cannot be read or written (for example, storage is disabled or full)
- **THEN** the application continues to work, hiding still applies for the current session, and no error is surfaced to the reader

#### Scenario: Stored data is unreadable
- **WHEN** the stored dismissal data is missing or not valid data
- **THEN** the application treats the dismissal set as empty rather than failing to render feeds

### Requirement: Reader can undo a dismissal

Immediately after hiding a story, the feed SHALL show an undo affordance in place of that story. Activating undo SHALL restore the story to its original position in the feed and remove it from the dismissal set.

#### Scenario: Undo restores the story
- **WHEN** a reader hides a story and then activates the undo affordance shown in its place
- **THEN** the story is displayed again in its original position and is no longer part of the dismissal set

#### Scenario: Undo affordance is transient
- **WHEN** the reader navigates to another feed or page after hiding a story
- **THEN** the undo affordance is no longer shown and the story remains hidden

### Requirement: Reader can clear all dismissals

The settings panel SHALL offer an action that clears every dismissal on the device, and SHALL indicate how many stories are currently hidden.

#### Scenario: Clearing restores all hidden stories
- **WHEN** a reader activates the clear action in settings while stories are hidden
- **THEN** the dismissal set becomes empty, the persisted data is removed, and previously hidden stories appear again in feeds

#### Scenario: Nothing hidden
- **WHEN** no stories are hidden
- **THEN** the settings panel reports that no stories are hidden and the clear action performs no change
