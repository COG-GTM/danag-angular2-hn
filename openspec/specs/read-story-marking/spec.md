## Purpose

Tracks which stories a reader has already opened on this device and reflects that in the feeds, so a returning reader can tell at a glance what is new without re-reading titles they have already seen.

## Requirements

### Requirement: Opening a story records it as read

The application SHALL record a story as read on the current device when the reader opens it, whether by following the story's external link from a feed or by viewing the story's item-details page.

#### Scenario: Reader follows a story's external link

- **WHEN** the reader activates the title link of a story that has an external URL
- **THEN** that story is recorded as read on this device
- **AND** the link still opens as before, honouring the "open links in new tab" setting

#### Scenario: Reader opens a story's item-details page

- **WHEN** the reader navigates to a story's item-details page, from a feed or directly by URL
- **THEN** that story is recorded as read on this device

#### Scenario: Reader opens a story that is already read

- **WHEN** the reader opens a story already recorded as read
- **THEN** the story remains recorded as read exactly once and no duplicate entry is created

### Requirement: Read stories are visibly marked in feeds

The application SHALL visibly distinguish stories recorded as read from unread stories in every feed listing, using a de-emphasised title treatment that remains legible in every available theme.

#### Scenario: Read story appears de-emphasised

- **WHEN** a feed listing renders a story that is recorded as read
- **THEN** the story's title is displayed with the read treatment, distinct from unread story titles

#### Scenario: Unread story appears normally

- **WHEN** a feed listing renders a story that is not recorded as read
- **THEN** the story's title is displayed with the normal unread treatment

#### Scenario: Marking takes effect without a reload

- **WHEN** the reader opens a story from a feed and returns to that feed without reloading the page
- **THEN** that story is shown with the read treatment

#### Scenario: Marking is shared across feeds

- **WHEN** a story recorded as read from one feed also appears in another feed
- **THEN** it is shown with the read treatment in that other feed too

### Requirement: Read state persists on the device

The application SHALL persist the set of read stories in device-local storage, so it survives page reloads and browser sessions on the same device, and SHALL never transmit it to the Hacker News API.

#### Scenario: Read state survives a reload

- **WHEN** the reader reloads the application after opening a story
- **THEN** that story is still shown with the read treatment

#### Scenario: Device-local storage is unavailable or unreadable

- **WHEN** device-local storage cannot be read or written, or holds a value that is not a valid read-story set
- **THEN** the application treats all stories as unread and continues to work normally without raising an error to the reader

### Requirement: Stored read state is bounded

The application SHALL cap the number of retained read-story entries and SHALL discard the least recently recorded entries first once the cap is exceeded, so device-local storage cannot grow without bound.

#### Scenario: Cap is exceeded

- **WHEN** the reader has recorded more read stories than the cap allows
- **THEN** the most recently recorded entries up to the cap are retained
- **AND** the entries recorded longest ago are discarded
