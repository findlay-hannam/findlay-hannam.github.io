# Feature Specification: Last Name Modal and Homepage

**Feature Branch**: `005-last-name-modal`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "The Surname page is redundant. "Set Last Name" should open a modal rather than navigate away. Modal should allow user to set last name or close without setting it. The root URL should be a homepage, telling the user the point of the page in a concise way"

**Constitution fit**: Serves *combine* (the last name feeds every full-name combination) and *list* (a clear starting point into the lists). Input stays in the browser; no accounts or backend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set the last name in a modal (Priority: P1)

A visitor selects **Set Last Name** in the header. A modal opens over the current page, where they can enter or change their last name and save it, or close the modal without changing anything. They never leave the page they were on.

**Why this priority**: This replaces the separate last-name page with something faster and keeps the visitor in context. It is the main change.

**Independent Test**: On any page, open the modal, save a last name and see combinations update behind it; open it again and close it with each close method and confirm nothing changed.

**Acceptance Scenarios**:

1. **Given** any page, **When** the visitor selects Set Last Name, **Then** a modal opens over the page, the address does not change, and the page behind is unchanged.
2. **Given** the modal is open, **When** it is shown, **Then** it has a labelled last-name field (showing the current last name if one is saved, otherwise empty), a Save button and a Close button.
3. **Given** the modal is open, **When** the visitor saves a valid last name, **Then** it is saved, the modal closes, and every place that shows full names reflects the new last name without a reload.
4. **Given** the modal is open, **When** the visitor saves an empty or too-long value, **Then** nothing is saved, the modal stays open, and a clear message explains why.
5. **Given** the modal is open and the visitor has typed a new value, **When** they close it with the Close button, with the Escape key, or by clicking outside it, **Then** the modal closes, the saved last name is unchanged, and the typed text is discarded.
6. **Given** the modal is open, **When** the visitor uses only the keyboard, **Then** focus moves into the modal, stays inside it while open, and returns to the Set Last Name control when it closes.
7. **Given** a not-found page, **When** the visitor selects Set Last Name, **Then** the modal opens there too.

---

### User Story 2 - A homepage that says what the site is for (Priority: P2)

The root address shows a short homepage that tells a new visitor, in a sentence or two, what the site is for. It no longer holds a last-name form.

**Why this priority**: With the last-name page gone, `/` needs its own purpose. A brief explanation helps first-time visitors, but the modal works without it.

**Independent Test**: Open `/` with no stored data and read it: it explains the site's purpose briefly, has no form, and has no links in its content.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they open `/`, **Then** they see a short statement of what the site is for.
2. **Given** a returning visitor with a saved last name, **When** they open `/`, **Then** they see the same statement.
3. **Given** the homepage, **When** it is shown, **Then** it contains no last-name form, no Boys/Girls link list and no other navigation links in its content; the header is the only navigation.
4. **Given** the homepage on a phone-width screen, **When** it loads, **Then** the whole statement is visible without scrolling.

---

### Edge Cases

- Modal open and the visitor uses the browser back button: the visitor leaves the page as normal and no modal is left open on the page they arrive at.
- Refreshing with the modal open: the page reloads with the modal closed.
- The last name is also set through an in-page prompt (category and name pages with no last name): saving from either place updates the other.
- Browser storage unavailable: saving still applies for the visit, and the modal shows the "saved for this visit only" notice instead of closing silently.
- Very small screens: the modal fits the screen without horizontal scrolling and its controls remain reachable.
- While the modal is open the page behind cannot be used, so there is never a second modal.
- Pasting very long text: rejected with the same message as before, modal stays open.
- Opening the modal in any section: it uses that section's colours.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The header's "Set Last Name" option MUST open a modal over the current page without navigating; the address and the page behind MUST NOT change.
- **FR-002**: The header MUST still offer exactly three options in this order: Boys, Girls, Set Last Name.
- **FR-003**: The modal MUST contain a labelled last-name field (prefilled with the saved last name, or empty), a Save button and a Close button.
- **FR-004**: Saving a valid last name (trimmed, 1 to 50 characters) MUST store it, close the modal, and update all full-name views immediately without a reload.
- **FR-005**: Saving an invalid value MUST store nothing, keep the modal open, and show a visible message that is announced to assistive technology.
- **FR-006**: The visitor MUST be able to close the modal without saving by the Close button, the Escape key, or clicking outside it. Closing MUST NOT change the saved last name and MUST discard unsaved text.
- **FR-007**: The modal MUST be an accessible dialog: it has an accessible name; focus moves into it on open and is contained while it is open; focus returns to the Set Last Name control on close; the page behind is not operable while it is open.
- **FR-008**: The modal MUST be available on every page, including not-found pages.
- **FR-009**: If the last name could not be persisted, the modal MUST show the "saved for this visit only" notice and stay open.
- **FR-010**: `/` MUST be a homepage that states in at most 2 sentences (at most 40 words) what the site is for: combining first and middle names with a last name into full names, for boys and girls, and keeping the lists.
- **FR-011**: The homepage MUST NOT contain a last-name form, a link list or any other navigation link in its content, and MUST read the same whether or not a last name is saved.
- **FR-012**: The in-page last-name prompts on category and name pages when no last name is set MUST remain as they are.
- **FR-013**: The modal MUST use the colours of the section the visitor is in and MUST fit narrow screens without horizontal scrolling.

### Key Entities

- **Last name**: The visitor's single family name (existing); set or changed through the modal; no longer through a page.
- **Header option**: Boys and Girls remain destinations; Set Last Name becomes an action that opens the modal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can set or change the last name from any page in at most 3 steps (open, type, save) without leaving the page.
- **SC-002**: 100% of closes by the Close button, the Escape key or a click outside leave the saved last name unchanged.
- **SC-003**: Focus returns to the Set Last Name control after 100% of modal closes.
- **SC-004**: The homepage purpose statement is at most 40 words and fully visible without scrolling on a 320 px wide screen.
- **SC-005**: 0 pages other than the header contain a last-name page link; the homepage contains 0 links in its content.

## Assumptions

- This amends 003 (the Set Last Name destination `/`, its FR-002 and FR-004 and US1 scenario 3) and 002 (its FR-001: a last-name prompt on `/`). The label "Set Last Name" and its position in the header do not change.
- Saving closes the modal only on success; a failed or invalid save keeps it open.
- Clicking outside the modal counts as closing it without saving.
- The modal does not open by itself on first visit; the visitor chooses to open it.
- The homepage is plain text: a short heading and the purpose statement, no imagery and no forms.
- The in-page last-name prompts on category and name pages stay, as they cover visitors who arrive on those pages first.
- The modal adds no browser history entries.
- Visual styling reuses the existing Pico layout and section colours.
