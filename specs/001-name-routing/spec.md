# Feature Specification: Name Routing

**Feature Branch**: `001-name-routing`

**Created**: 2026-11-02

**Status**: Draft

> Amended by 002-name-input: the fixed surname is removed; the visitor enters their own surname; combinations skip self-pairing (a first name is never its own middle name).

**Input**: User description: "I want to enable basic routing. A user should be able to land on /boys or /girls and see their full list of configured boys or girls names. If they go to e.g boys/[first-name-slug] it should show the combinations for that first name only"

**Constitution fit**: Serves *list* (name lists) and *combine* (combinations per first name).

## Clarifications

### Session 2026-11-02

- Q: How are a first name's combinations formed? → A: Every first name is combined with every configured middle name; the surname is fixed for the single user.
- Q: Are middle names shared across boys and girls? → A: No; each category has its own middle-name list.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse a full list of names (Priority: P1)

A visitor opens `/boys` or `/girls` and sees every configured name for that category, each linking to its own page.

**Why this priority**: The core listing. Without it nothing else is reachable.

**Independent Test**: Open `/boys` and `/girls` directly and compare each page to the configured names.

**Acceptance Scenarios**:

1. **Given** boys names are configured, **When** the visitor opens `/boys`, **Then** all configured boys names are shown and no girls names are.
2. **Given** girls names are configured, **When** the visitor opens `/girls`, **Then** all configured girls names are shown and no boys names are.
3. **Given** a category has no configured names, **When** the visitor opens its page, **Then** a clear "no names yet" message is shown.

---

### User Story 2 - View combinations for one first name (Priority: P2)

A visitor opens `/boys/<first-name-slug>` (or `/girls/...`) and sees the combinations for that first name only.

**Why this priority**: Delivers the "combine" purpose, but depends on the list existing.

**Independent Test**: Open `/boys/<slug>` for a configured name and check only that name's combinations appear.

**Acceptance Scenarios**:

1. **Given** a configured first name, **When** the visitor opens its slug page, **Then** only the combinations for that first name are shown.
2. **Given** a slug that matches no configured name in that category, **When** the visitor opens it, **Then** a "name not found" message is shown with a link back to the category list.
3. **Given** a name is in the girls list only, **When** the visitor opens `/boys/<that-slug>`, **Then** "name not found" is shown.

---

### User Story 3 - Move between pages naturally (Priority: P3)

A visitor moves between the lists and name pages using links, the back button and shared or bookmarked URLs.

**Why this priority**: Makes routing feel like a real site rather than a single page.

**Independent Test**: Load a name page URL cold, then use links and back to reach the list.

**Acceptance Scenarios**:

1. **Given** the visitor is on a list, **When** they select a name, **Then** the name page opens and back returns to the same list.
2. **Given** a bookmarked name page URL, **When** it is opened in a fresh session, **Then** the page renders correctly.
3. **Given** any URL that matches no route (including `/`), **When** opened, **Then** the visitor sees a not-found page, or for `/`, a landing page linking to Boys and Girls.

---

### Edge Cases

- Slug case and trailing slash (`/boys/`, `/Boys`, `/boys/ADA`): render the same page as the lowercase, no-trailing-slash path. No redirect; the address bar is left as typed.
- Names with spaces, accents or apostrophes: slugs are lowercase, URL-safe and unique within a category.
- Two names producing the same slug in one category: configuration MUST be rejected or flagged rather than silently shadowed.
- A first name with no combinations (no middle names configured for its category): shows an empty-state message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST serve a boys list at `/boys` and a girls list at `/girls`, each showing only its own category's configured names.
- **FR-002**: Each listed name MUST link to its own page at `/<category>/<first-name-slug>`.
- **FR-003**: A name page MUST show the combinations for that first name only.
- **FR-004**: A combination MUST be a full name made of the first name, a middle name and the fixed surname; each combination MUST be shown in full (e.g. "First Middle Surname"). A name page MUST show one combination per configured middle name (the category's full set of middle names crossed with that first name).
- **FR-005**: An unknown slug or category MUST show a not-found page with a link back to a valid page.
- **FR-006**: Any route MUST work when opened directly, refreshed or bookmarked, not only via in-site navigation.
- **FR-007**: Browser back and forward MUST move between pages without a full page reload.
- **FR-008**: `/` MUST show a landing page linking to Boys and Girls.
- **FR-009**: Names and combinations MUST come from configuration shipped with the site, not user input or a server.
- **FR-010**: Slugs MUST be unique within a category and derived consistently from the first name.

### Key Entities

- **Category**: Boys or Girls; owns its own list of first names and its own list of middle names.
- **First name**: A display name plus its URL slug; belongs to one category.
- **Middle name**: A configured name belonging to one category; combined with every first name in that category.
- **Surname**: A single configured family name, fixed for the whole site (one user).
- **Combination**: A full name of first name + middle name + surname (FR-004).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of configured names are reachable from their category list, and every name page URL opens correctly when loaded directly.
- **SC-002**: A visitor can get from the landing page to a name's combinations in at most 3 selections.
- **SC-003**: Every page shows its content or a clear not-found/empty message; no blank pages for any URL.
- **SC-004**: Page-to-page navigation feels instant (under 1 second) on a typical connection.

## Assumptions

- Boys and girls are separate, fixed categories; no other categories in v1.
- Configuration is a static, checked-in data set; editing it means committing and deploying.
- Public, read-only site with no accounts, per the constitution's Purpose & Scope.
- Combinations are displayed, not edited, in this feature.
- Middle names and the surname come from the same static configuration as first names.
- Single user: one surname for the whole site; no per-name overrides or exclusions.
- Visual styling reuses the existing Pico layout; no new design work.
