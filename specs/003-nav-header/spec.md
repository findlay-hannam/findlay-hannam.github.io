# Feature Specification: Navigation Header

**Feature Branch**: `003-nav-header`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "I want to simplify navigation. Create a nav header for all pages. Three options: Boys, Girls, Set Last Name. Get rid of the other navigation elements below the page content on other pages"

**Constitution fit**: Serves *list* (one-step access to the boys and girls lists) and *combine* (one-step access to setting the last name that combinations use). No accounts or backend.

## Clarifications

### Session 2026-11-02

- Q: Where does "Set Last Name" lead? → A: The existing landing page `/`, which becomes the last-name page; no new route.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate from any page with a header (Priority: P1)

A visitor sees the same navigation header on every page, with three options: **Boys**, **Girls** and **Set Last Name**. From any page, one selection reaches the boys list, the girls list, or the last-name page.

**Why this priority**: This is the whole feature; one consistent way to move around.

**Independent Test**: Open each kind of page (landing, a list, a name page, a not-found page) and confirm the header is present with exactly three options that lead to the right places.

**Acceptance Scenarios**:

1. **Given** any page, **When** it is shown, **Then** a navigation header appears at the top with exactly three options in this order: Boys, Girls, Set Last Name.
2. **Given** the header on any page, **When** the visitor selects Boys, **Then** the boys list opens; selecting Girls opens the girls list.
3. **Given** the header on any page, **When** the visitor selects Set Last Name, **Then** the landing page `/` opens, showing the last-name form.
4. **Given** a not-found page, **When** it is shown, **Then** the header is present, so the visitor can move on without any other link.
5. **Given** the header, **When** the visitor uses only the keyboard, **Then** every option is reachable and can be activated.
6. **Given** the visitor moves between pages, **When** each page loads, **Then** the header looks and behaves the same, in the same place.

---

### User Story 2 - Remove the other navigation (Priority: P2)

Navigation links that sit with or below page content are removed, so the header is the only navigation.

**Why this priority**: Without removal the header adds a second way to do the same thing, which is the opposite of simplifying.

**Independent Test**: Open each kind of page and confirm no navigation links remain in the page content apart from lists of names and the last-name form.

**Acceptance Scenarios**:

1. **Given** the landing page, **When** it is shown, **Then** it has no Boys/Girls link list in its content.
2. **Given** a name page, **When** it is shown, **Then** it has no "Back to the … list" link below the combinations.
3. **Given** a name-not-found or page-not-found page, **When** it is shown, **Then** it has no "Back to the … list" or "Back home" link in its content; the header is the way onward.
4. **Given** a category list, **When** it is shown, **Then** each listed name still links to its own name page (these are content, not navigation).

---

### Edge Cases

- Narrow (phone) screens: the three options remain reachable without horizontal page scrolling.
- Deep link, refresh and bookmark: the header is present on first load of any URL, not only after in-site navigation.
- Uppercase or trailing-slash URLs (e.g. `/Boys/`): the header is present and behaves the same.
- Browser back and forward: the header persists without reloading the page.
- Last name already set: the Set Last Name option is still shown with the same label.
- Not-found names and pages: the header is present and not hidden by the error state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every page, including not-found pages, MUST show a navigation header above the page content.
- **FR-002**: The header MUST offer exactly three options, in this order: "Boys", "Girls", "Set Last Name".
- **FR-003**: "Boys" MUST open the boys list and "Girls" MUST open the girls list.
- **FR-004**: "Set Last Name" MUST open the landing page `/`, which shows the form for entering or changing the last name.
- **FR-005**: The header MUST be identical on every page and MUST NOT reload the page when used.
- **FR-006**: The Boys/Girls link list on the landing page MUST be removed.
- **FR-007**: The "Back to the … list" links on name pages and name-not-found pages, and the "Back home" link on the page-not-found page, MUST be removed.
- **FR-008**: Names listed on a category list MUST still link to their name pages.
- **FR-009**: The header MUST be keyboard operable and expose its options as a labelled navigation landmark.
- **FR-010**: The header MUST remain usable on narrow screens without horizontal page scrolling.
- **FR-011**: All visible text about the last name MUST use the term "last name" (replacing "surname"): the nav option, the last-name form wherever it appears (landing, category and name pages), its button, and its validation messages.

### Key Entities

- **Header option**: One of Boys, Girls, Set Last Name; has a label and a destination.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pages (landing, lists, name pages, both not-found pages) show the header with exactly three options.
- **SC-002**: A visitor can reach any name's combinations from any page in at most 2 selections (list, then name).
- **SC-003**: A visitor can reach the last-name form from any page in 1 selection.
- **SC-004**: 0 pages contain navigation links outside the header (name links within lists and in-form controls excepted).
- **SC-005**: Navigation between pages feels instant (under 1 second) on a typical connection.

## Assumptions

- This amends 001: the landing page's "Boys and Girls" links (001 FR-008) and the not-found and back links (001 FR-005, User Story 2 scenario 2) are replaced by the header.
- The site title stays as a heading in the page header and is not a fourth navigation option. (Superseded: the title and tagline were later removed to save space; the header holds only the centred nav.)
- The in-page last-name prompts from 002 (category and name pages with no last name set) are forms, not navigation, and stay.
- `/` is the last-name page. 002's FR-001 (prompt on `/`) still holds unchanged; 001's FR-008 (landing page linking to Boys and Girls) is replaced by the header.
- The Set Last Name label is fixed; it does not change to "Change Last Name" once a last name exists.
- "Last name" and "surname" mean the same thing. The visible wording moves to "last name"; internal names and existing spec history are unchanged.
- No highlighting of the current option is required in this feature.
- Visual styling reuses the existing Pico layout.
