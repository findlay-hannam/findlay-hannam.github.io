# Research: Navigation Header

## R1. Where the header lives

- **Decision**: inside the existing `<header>` in `src/App.tsx`, as a sibling of `<hgroup>` and outside `<Switch>`.
- **Rationale**: anything outside the route switch renders on every route, including both not-found states, with no per-page wiring (FR-001, SC-001). Constitution I: no new component for three links.
- **Alternatives**: a `NavHeader` component (indirection for one use); render per page (easy to miss a page; the failure that SC-001 guards against).

## R2. Markup

- **Decision**: `<nav aria-label="Main"><ul><li><Link href="/boys">Boys</Link></li>…</ul></nav>` with `wouter` `Link` (real anchors).
- **Rationale**: semantic landmark, keyboard operable, back/forward and open-in-new-tab keep working (FR-005, FR-009); Pico styles `nav > ul` horizontally with no custom CSS.
- **Alternatives**: buttons with click handlers (not real links; breaks open-in-new-tab and a11y basics).

## R3. Set Last Name destination

- **Decision**: `/` (clarified 2026-11-02). Home keeps the last-name form and loses its Boys/Girls list.
- **Rationale**: no new route or page; 002's behaviour on `/` is unchanged.
- **Alternatives**: dedicated `/last-name` page (rejected in clarification: extra route and a redirect/content question for `/`).

## R4. What gets removed

- **Decision**: delete exactly these, nothing else:
  - `Home.tsx`: the `<nav>` with the Boys/Girls list
  - `NamePage.tsx`: the not-found "Back to the {category} list" paragraph and the `<footer>` link
  - `NotFound.tsx`: the "Back home" paragraph
  - Unused `Link` imports that result
- **Rationale**: FR-006, FR-007. List name links (`CategoryList`) are content (FR-008) and stay.

## R5. Wording: "last name" vs "surname"

- **Decision**: change visible strings only: `SurnameForm` label and button ("Last name", "Save last name"), `Home` lead-in and status line, and the user-facing messages in `rules.ts` ("Enter a last name.", "Last name must be 50 characters or fewer."). Keep identifiers, types, the storage key and shape unchanged.
- **Rationale**: FR-011 is about what the visitor sees. Renaming `surname` in code and the stored JSON would churn files and break existing saved data for no visitor benefit (I).
- **Alternatives**: full rename (needs a storage migration; rejected); leave "surname" visible (conflicts with the nav label "Set Last Name").

## R6. Testing without a DOM library

- **Decision**: `renderToString` through `renderAt`; test helper pulls out the `<nav>…</nav>` HTML and asserts its `href` values in order and the single `<nav` count; absence assertions check page text (e.g. no "Back to the", no "Back home").
- **Rationale**: keeps constitution I (no new dev dependency); the header is static markup, so server render is a faithful check.
- **Residual risk**: narrow-screen layout (FR-010) and visual placement are not asserted; covered by the manual steps in [quickstart.md](quickstart.md).

## R7. Current-page highlighting

- **Decision**: out of scope (spec Assumptions).
