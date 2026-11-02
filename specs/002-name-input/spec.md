# Feature Specification: Name Input

**Feature Branch**: `002-name-input`

**Created**: 2026-11-02

**Status**: Draft

> Amended by 003-nav-header: visible wording is 'last name'; messages now read 'Enter a last name.' and 'Last name must be 50 characters or fewer.'

> Amended by 004-manage-names: names can now be deleted and promoted/demoted between roles; "First and middle name" is preselected; the built-in config, `merge` and `Names` are gone (the visitor's `Stored` lists are the only data).

> Amended by 005-last-name-modal: the last-name prompt on `/` is replaced by a modal opened from the header; `/` is now a static homepage. The in-page prompts on category and name pages stay.

**Input**: User description: "I want user input. If no surname is set up, users should be prompted to add that on the index page, or before they enter another name. Users on /<category> should be presented with an option to add a name to the list for that category, either as a first/middle name or only a middle name."

**Constitution fit**: Serves *list* (users add names to category lists) and *combine* (the surname and middle names feed combinations). Input is kept in the browser only; no accounts or backend.

## Clarifications

### Session 2026-11-02

- Q: Is the role reading correct ("first and middle name" = used as both; "only a middle name" = middle only)? → A: Yes.
- Q: Is browser-only storage correct? → A: Yes.
- Q: What happens to the built-in fixed surname? → A: Removed entirely; the visitor-entered surname is the only source of a surname.
- Q: Can a name be combined with itself? → A: No. A first name is never combined with itself as its middle name (compared ignoring case).
- Q: Can a name already in a category's lists be submitted again? → A: No. If a name is already an option in that category (as a first or middle name, built-in or added), submitting it again, in either role, is rejected.
- Q: What does a name page show when no surname is set? → A: The surname prompt in place of the combinations; combinations appear after saving, without navigating away.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set a surname (Priority: P1)

A visitor with no surname set sees a prompt on the landing page (`/`) asking for their surname. Once saved, combinations use it.

**Why this priority**: Combinations are meaningless without a surname, and name entry is gated on it.

**Independent Test**: Open `/` with no stored data, submit a surname, then open a name page and confirm combinations end with it.

**Acceptance Scenarios**:

1. **Given** no surname is set, **When** the visitor opens `/`, **Then** a surname prompt is shown.
2. **Given** the prompt is shown, **When** the visitor submits a valid surname, **Then** it is saved, the prompt is replaced by confirmation of the surname, and it is still set after a refresh.
3. **Given** the prompt is shown, **When** the visitor submits an empty or whitespace-only value, **Then** nothing is saved and a clear message explains why.
4. **Given** a surname is set, **When** the visitor opens `/`, **Then** the surname is shown with a way to change it, and no blocking prompt appears.

---

### User Story 2 - Add a name to a category (Priority: P2)

On `/boys` or `/girls`, a visitor adds a name and chooses how it is used: as a **first and middle name**, or as a **middle name only**.

**Why this priority**: The core input; depends on a surname existing.

**Independent Test**: With a surname set, add a name on `/boys` as "first and middle", confirm it appears in the list and in every other first name's combinations; add another as "middle only" and confirm it appears in combinations but not as a list entry.

**Acceptance Scenarios**:

1. **Given** a surname is set, **When** the visitor opens `/<category>`, **Then** an add-name form is shown with a choice between "First and middle name" and "Middle name only".
2. **Given** the visitor adds a name as "First and middle name", **When** it is saved, **Then** it appears in that category's list with its own page, and is used as a middle name in combinations for every first name in the category.
3. **Given** the visitor adds a name as "Middle name only", **When** it is saved, **Then** it does not appear in the list, and is used as a middle name in combinations for every first name in the category.
4. **Given** a name was added to `/boys`, **When** the visitor opens `/girls`, **Then** the added name is not there.
5. **Given** the visitor has added names, **When** they refresh or return in a later visit in the same browser, **Then** the added names are still present.
6. **Given** the visitor submits an empty name, **When** they submit, **Then** nothing is added and a clear message explains why.
7. **Given** a name is already an option in that category (e.g. "Fin" as a first or middle name), **When** the visitor submits it again (any case, either role), **Then** nothing is added and a message says it already exists.
8. **Given** a first name that is also a middle name in its category, **When** its page is shown, **Then** no combination pairs it with itself (e.g. no "Fin Fin Smith"); all other combinations remain.

---

### User Story 3 - Surname required before adding names (Priority: P3)

A visitor with no surname who reaches a category page is asked for a surname before they can add any name.

**Why this priority**: Covers deep links and bookmarks that skip the landing page.

**Independent Test**: With no stored data, open `/girls` directly and confirm the surname prompt appears in place of the add-name form.

**Acceptance Scenarios**:

1. **Given** no surname is set, **When** the visitor opens `/<category>`, **Then** the surname prompt is shown instead of the add-name form.
2. **Given** the prompt is shown on a category page, **When** the visitor saves a surname, **Then** the add-name form appears on the same page without navigating away.
3. **Given** no surname is set, **When** the visitor opens `/<category>/<slug>` for an existing name, **Then** the surname prompt replaces the combinations, and saving shows them in place.

---

### Edge Cases

- Names with surrounding whitespace: trimmed before saving; internal spacing, accents and apostrophes preserved.
- Added first-and-middle name whose slug collides with an existing first name in the category: rejected with a clear message (consistent with unique slugs in 001).
- Same name added as middle-only then as first-and-middle (or the reverse): rejected as a duplicate. A name that must be both is added once, as "First and middle name".
- A name that is a first name and a middle name: its own page omits the self-pairing (FR-015); it still pairs with every other first/middle name.
- Browser storage unavailable or cleared: pages still render with the built-in configured names; the visitor is told entries cannot be saved rather than seeing a silent failure.
- Surname changed after names exist: combinations everywhere show the new surname.
- Surname unset on a name page: surname prompt replaces combinations (FR-014).
- Input over 50 characters: rejected with a clear message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: If no surname is set, `/` MUST show a surname prompt.
- **FR-002**: If no surname is set, every `/<category>` page MUST show the surname prompt in place of the add-name form, and no name can be added until a surname is saved.
- **FR-003**: The site MUST NOT ship any built-in surname. A visitor-saved surname is the only surname used in combinations.
- **FR-004**: Surname and name input MUST be trimmed and rejected when empty or longer than 50 characters, with a visible message.
- **FR-005**: The visitor MUST be able to change a saved surname.
- **FR-006**: When a surname is set, each `/<category>` page MUST show an add-name form with a required choice of role: "First and middle name" or "Middle name only".
- **FR-007**: A name added as "First and middle name" MUST appear in that category's list, get its own name page, and be included in the middle names of that category.
- **FR-008**: A name added as "Middle name only" MUST be included in the middle names of that category and MUST NOT appear in the list or get a name page.
- **FR-009**: Added names MUST apply to the chosen category only.
- **FR-010**: Added names and the surname MUST persist across refreshes and later visits in the same browser, and MUST NOT require an account or server.
- **FR-011**: A name MUST NOT be added if it already exists in that category as a first or middle name, built-in or added, compared ignoring case and regardless of the chosen role. For names added as "First and middle name" (which get a page), a slug collision with an existing first name MUST also be rejected; "Middle name only" names have no page, so no slug check applies. Each rejection MUST show a visible message.
- **FR-012**: Added names MUST be combined with all other names exactly as configured names are (FR-004 of 001): every first name × every middle name × surname.
- **FR-013**: The form MUST be keyboard operable with labelled controls, and validation messages MUST be announced to assistive technology.
- **FR-014**: If no surname is set, `/<category>/<first-name-slug>` MUST show the surname prompt in place of the combinations; after saving, the combinations MUST appear on the same page without navigation.
- **FR-015**: A combination MUST NOT use the same name as both first and middle name (compared ignoring case). This applies to all combinations, built-in or added.

### Key Entities

- **Surname**: The visitor's single family name; unset until entered; there is no built-in surname.
- **Added name**: A name entered by the visitor, belonging to one category, with a role (first and middle, or middle only).
- **Category lists (extended)**: Each category's first-name and middle-name lists are the built-in names plus the visitor's added names.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can set a surname and add their first name in under 1 minute.
- **SC-002**: 100% of attempts to add a name without a surname are blocked and lead the visitor to the surname prompt.
- **SC-003**: 100% of added names are still present after a page refresh in the same browser.
- **SC-004**: Every rejected input (empty, duplicate, collision) shows a visible, specific message; none fails silently.
- **SC-005**: A newly added name appears in the relevant list and combinations immediately, without leaving the page.

## Assumptions

- Input is stored only in the visitor's browser (per the constitution); it is not shared between devices or visitors.
- "Add a name... as a first/middle name" means the name is used both as a first name and as a middle name; "only a middle name" means middle use only. A first-name-only option is not offered.
- This feature removes 001's fixed, configured surname entirely (no default, no fallback); 001's combination requirement (FR-004) and its surname entity/assumption are amended accordingly.
- Editing or removing added names (other than changing the surname) is out of scope for this feature.
- Because duplicates are rejected in any role, a name cannot later be "upgraded" from middle-only to first-and-middle; editing and removal are out of scope.
- FR-015 amends 001's FR-004: its "one combination per configured middle name" excludes a middle name equal to the first name.
- Built-in configured names remain and cannot be changed by the visitor.
- Single visitor per browser; no per-name overrides.
- Visual styling reuses the existing Pico layout.
