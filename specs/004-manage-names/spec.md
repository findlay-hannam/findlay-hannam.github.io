# Feature Specification: Manage Names

**Feature Branch**: `004-manage-names`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "I want to make names easier to manage. Add functionality for the following: Delete names (from /:category and /:category/:name); Up/downgrade names from middle to first names and back; When adding a new name, "First and middle name" radio button should be selected by default; Remove placeholders e.g Oliver, Arthur, Finn O'Brien"

**Constitution fit**: Serves *organise* (delete and re-role names), *list* (what appears in each list) and *combine* (what feeds combinations). Changes stay in the browser; no accounts or backend.

## Clarifications

### Session 2026-11-02

- Q: What happens when a visitor deletes a name? → A: Ask to confirm first; cancelling changes nothing.
- Q: In what order do names appear within each group? → A: Alphabetical within each group, ignoring case, whatever the history; a moved name takes its alphabetical place in its new group.
- Q: After a name is added, which radio is selected for the next add? → A: "First and middle name" again: the form resets to the default after every successful add.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete a name (Priority: P1)

A visitor removes a name they no longer want, from the category list (`/<category>`) or from a first name's own page (`/<category>/<name>`).

**Why this priority**: Without deletion, a mistyped or unwanted name stays forever. It is the core of managing names.

**Independent Test**: Add a name, delete it from `/<category>`, confirm it is gone from the list and from every combination; repeat from its own page and confirm the visitor is returned to the list.

**Acceptance Scenarios**:

1. **Given** a name in a category's list, **When** the visitor deletes it from `/<category>`, **Then** it disappears from the list and from the combinations of every other name in that category, and stays gone after a refresh.
2. **Given** a first name's page, **When** the visitor deletes that name from the page, **Then** the visitor is taken to `/<category>`, where the name no longer appears.
3. **Given** a middle-only name (shown on `/<category>`), **When** the visitor deletes it, **Then** it no longer appears in any combination in that category.
4. **Given** a name in `/boys`, **When** it is deleted, **Then** `/girls` is unchanged, even if it holds a name spelled the same.
5. **Given** the last remaining name is deleted, **When** the category list is shown, **Then** the empty-state message appears.
6. **Given** the visitor selects delete on a name, **When** the confirmation appears, **Then** the name is removed only if the visitor confirms; cancelling leaves every list and combination unchanged.

---

### User Story 2 - Move a name between first and middle roles (Priority: P2)

A visitor changes how a name is used without deleting and re-adding it: promote a middle-only name to "first and middle", or demote a first-and-middle name to "middle only".

**Why this priority**: Fixes a wrong choice made at add time, which today can't be undone.

**Independent Test**: Add a name as middle only, promote it and see it join the list with its own page; demote it and see the page and list entry go while it still appears in combinations.

**Acceptance Scenarios**:

1. **Given** `/<category>` shows middle-only names in their own group, **When** the visitor promotes one, **Then** it moves to the first-and-middle group, gets a link to its own name page, and still appears as a middle name in other names' combinations.
2. **Given** a first-and-middle name, **When** the visitor demotes it, **Then** it moves to the middle-only group, its name page stops existing (the address shows "Name not found"), and it still appears as a middle name in other names' combinations.
3. **Given** a middle-only name whose page address would clash with an existing first name, **When** the visitor promotes it, **Then** nothing changes and a message explains the clash.
4. **Given** a move was made, **When** the visitor refreshes or returns later, **Then** the new role is still in place.

---

### User Story 3 - Sensible default when adding (Priority: P3)

When the add-name form appears, "First and middle name" is already selected, so the common case needs no extra choice.

**Why this priority**: Saves a selection on most additions.

**Independent Test**: Open `/<category>` with a last name set and confirm the first radio is selected; add a name without touching the radios and confirm it is added as first and middle.

**Acceptance Scenarios**:

1. **Given** a last name is set, **When** `/<category>` opens, **Then** "First and middle name" is selected and "Middle name only" is not.
2. **Given** the default selection, **When** the visitor types a name and submits, **Then** it is added as first and middle with no further choice.
3. **Given** the visitor selects "Middle name only", **When** they submit, **Then** it is added as middle only.
4. **Given** a name was just added as middle only, **When** the form is shown for the next name, **Then** "First and middle name" is selected again.
5. **Given** an add was rejected (e.g. duplicate), **When** the message appears, **Then** the visitor's radio choice and typed name are unchanged so they can correct and resubmit.

---

### User Story 4 - Start with no placeholder names (Priority: P3)

A new visitor sees empty lists, not sample names such as Oliver, Arthur or Finn O'Brien.

**Why this priority**: Placeholder names are noise that the visitor would have to delete.

**Independent Test**: Open the site in a fresh browser; no sample names appear on any list, name page or combination.

**Acceptance Scenarios**:

1. **Given** a fresh browser with no stored data, **When** `/boys` or `/girls` opens, **Then** the empty-state message is shown and no sample names are listed.
2. **Given** a fresh browser, **When** a former sample address such as `/boys/oliver` is opened, **Then** "Name not found" is shown.
3. **Given** a visitor who already added names, **When** the change ships, **Then** their own names are still there and only the shipped samples are gone.

---

### Edge Cases

- Deleting or moving a name opened in another tab: the next refresh shows the current state; no cross-tab live sync.
- A bookmarked page for a deleted or demoted name shows "Name not found".
- A name that is both a first name and, via the rules from 002, a middle name: deleting it removes both uses; demoting keeps only the middle use.
- Promotion that would make a name its own middle in a combination: the self-pairing exclusion (002 FR-015) still applies.
- Promoting or demoting does not change the name's spelling. The moved name takes its alphabetical place in its new group; other names keep their relative order.
- Names that differ only in case cannot coexist (002 FR-011), so alphabetical order is never ambiguous between two names.
- Browser storage unavailable: changes apply for the visit and the visitor is told they will not persist, as for adding names.
- Deleting the only name on a page with no last name set: same behaviour as with a last name; controls need no last name to be used.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST ship no names. With no stored data, every category has no first names and no middle names.
- **FR-002**: `/<category>` MUST list the category's names in two groups: first-and-middle names (each linking to its own page) and middle-only names (not linked). Within each group names are in alphabetical order, ignoring case; a name appears once.
- **FR-003**: Each name on `/<category>` MUST have a delete control whose accessible name includes the name (e.g. "Delete Noah").
- **FR-004**: A first name's page MUST have a delete control for that name. After deleting there, the visitor MUST land on `/<category>`.
- **FR-005**: Deleting a name MUST remove it from every role in that category, from the lists, and from all combinations. It MUST NOT affect the other category.
- **FR-006**: Deleting a name MUST ask the visitor to confirm, naming the name, before it is removed. Cancelling MUST change nothing. The confirmation MUST be keyboard operable.
- **FR-007**: Each first-and-middle name on `/<category>` MUST have an action that makes it a middle-only name. Its list entry and page MUST stop existing; it MUST remain a middle name for the category.
- **FR-008**: Each middle-only name on `/<category>` MUST have an action that makes it a first-and-middle name. It MUST gain a list entry and a name page. If its page address clashes with an existing first name, or it has no letters or digits to make a page address from, nothing MUST change and a visible message MUST say why.
- **FR-009**: When the add-name form is shown, "First and middle name" MUST be selected by default, and MUST be selected again after every successful add. A rejected add MUST keep the visitor's current choice.
- **FR-010**: Every delete or move MUST take effect on screen immediately, persist across refreshes and later visits in the same browser, and need no account or server.
- **FR-011**: The existing rules MUST still hold: no name combined with itself (002 FR-015), no duplicate names in a category (002 FR-011).
- **FR-012**: All new controls MUST be keyboard operable and labelled with the name they act on; any rejection message MUST be announced to assistive technology.
- **FR-013**: Names a visitor added before this change MUST be kept; only shipped sample names are removed.
- **FR-014**: Combinations on a first name's page MUST list middle names in alphabetical order, ignoring case.

### Key Entities

- **Name (per category)**: Spelling plus a role: first-and-middle, or middle-only. Role can change; the name can be deleted.
- **Category lists**: Each category has a first-and-middle group and a middle-only group, both made only of the visitor's names.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can delete a name from either page in at most 2 selections.
- **SC-002**: A visitor can change a name's role in 1 selection.
- **SC-003**: 100% of deletes and role changes are still in effect after a page refresh.
- **SC-004**: A fresh visitor sees 0 names on every list, name page and combination.
- **SC-005**: 100% of loads of an add-name form show "First and middle name" selected, and a name can be added without touching the radios.
- **SC-006**: Every rejected move shows a visible, specific message; none fails silently.

## Assumptions

- Placeholder names are removed entirely, with no built-in names at all; every name a visitor sees is one they added. Stored data is untouched.
- "Up/downgrade" follows 002's role model: a first name is always also a middle name. Promotion makes a middle-only name first-and-middle; demotion makes a first-and-middle name middle-only. A "first name only" role is not introduced.
- To make middle-only names manageable, `/<category>` now shows them in their own group. Previously they were visible only inside combinations.
- Role changes (promote and demote) are on `/<category>` only. A first name's own page offers delete only.
- Deleting from a name page returns the visitor to the category list because that page no longer exists.
- This amends 001 (FR-009: names from shipped configuration, and sample data) and 002 (editing and removing out of scope; "upgrade" not possible; no radio preselected).
- Combinations on a name page list the middle names in the same alphabetical order, so every list on the site has one predictable order.
- No bulk delete, no rename, no undo.
- Visual styling reuses the existing Pico layout.
- After 004, the role choice is a dropdown on the same row as the name input and the Add name button, not radio buttons. Where this spec says a "radio" is selected, read it as that dropdown option being selected.
