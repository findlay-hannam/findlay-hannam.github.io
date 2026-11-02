---

description: "Task list for Navigation Header"
---

# Tasks: Navigation Header

**Input**: Design documents from `/specs/003-nav-header/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: REQUIRED by the constitution (Principle III, TDD). Each test task precedes the implementation it covers and MUST be seen failing for the right reason first.

**Organization**: Grouped by user story. US1 (header and wording) is the MVP; US2 removes the old navigation. No new dependencies and no new source files in `src/` (only a test helper is extended).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: different files, no dependency on an incomplete task
- Paths are repo-root relative
- Header contract: exactly one `<nav aria-label="Main">`, three links in order: `Boys` → `/boys`, `Girls` → `/girls`, `Set Last Name` → `/` ([contracts/ui.md](contracts/ui.md))
- Wording: visible "surname" becomes "last name" ([research.md](research.md) R5); identifiers (`surname`, `SurnameForm`, `setSurname`) and the stored JSON are NOT renamed

## Phase 1: Setup

- [X] T001 Run `pnpm test && pnpm lint && pnpm build` on the branch and confirm all green before changing anything (baseline; 97 tests expected)

## Phase 2: Foundational

None. The header and removals are independent of shared infrastructure; the one test helper they share is added at the start of US1.

---

## Phase 3: User Story 1 - Navigate from any page with a header (P1) 🎯 MVP

**Goal**: Every page shows the same three-option header, and visible "surname" wording becomes "last name".

**Independent Test**: render `/`, `/boys`, `/girls`, a name page, `/boys/nope`, `/nope`: each has one `<nav aria-label="Main">` with Boys, Girls, Set Last Name in order, and no page shows the word "surname" to the visitor.

### Tests (write first, must FAIL) ⚠️

- [X] T002 [US1] Extend `src/test/renderAt.tsx` with pure test helpers `navLinks(html): { href: string; text: string }[]` (anchors inside the first `<nav …>…</nav>`), `navCount(html): number` (count of `<nav`) and `mainHtml(html): string` (content between `<main` and `</main>`); no production code touched
- [X] T003 [US1] Add FAILING tests to `src/pages/routes.test.tsx` (`it.each` over `/`, `/boys`, `/girls`, `/boys/oliver`, `/boys/nope`, `/nope`, `/Boys/`, `/boys/oliver/extra`): `navCount` is 1; the nav has `aria-label="Main"`; `navLinks` equals `[{Boys,/boys},{Girls,/girls},{Set Last Name,/}]` in that order; the nav HTML is identical across all routes; the nav appears before `<main` (FR-001–FR-005, SC-001)
- [X] T004 [US1] Add FAILING wording tests to `src/pages/routes.test.tsx` for `/`: unset shows label `Last name`, button `Save last name` and lead-in `Set your last name to see full names.`; set (`seed` last name `'Smith'`) shows `Last name: Smith` and `Save last name`; neither state contains the text `urname` outside attribute values (case-insensitive match on the visible text, FR-011)
- [X] T005 [P] [US1] Update `src/lib/rules.test.ts` to FAILING expectations: `clean(raw, 'surname')` errors become `Enter a last name.` and `Last name must be 50 characters or fewer.`; `setSurname` empty-input error becomes `Enter a last name.`; messages for `'name'` are unchanged
- [X] T006 [P] [US1] Update `src/pages/CategoryList.test.tsx` and `src/pages/NamePage.test.tsx`: every `'Save surname'` expectation becomes `'Save last name'`; delete the stale `not.toContain('Set a surname to see combinations.')` line in NamePage.test.tsx; test titles that say "surname prompt" say "last name prompt"

### Implementation

- [X] T007 [US1] Add `<nav aria-label="Main">` with a `<ul>` of three `wouter` `Link`s (Boys `/boys`, Girls `/girls`, Set Last Name `/`) inside the existing `<header>` of `src/App.tsx`, outside `<Switch>`; keep the `h1` and tagline as plain text; make T003 pass
- [X] T008 [US1] In `src/lib/rules.ts` change the user-facing messages in `clean` to use "last name" for the `'surname'` label (`Enter a last name.`, `Last name must be 50 characters or fewer.`); identifiers unchanged; make T005 pass
- [X] T009 [US1] Change visible text only: in `src/components/SurnameForm.tsx` label `Last name`, button `Save last name`; in `src/pages/Home.tsx` lead-in `Set your last name to see full names.` and status rendered as ONE string, `{`Last name: ${surname}`}`, so `renderToString` emits no `<!-- -->` between the label and the value; make T004 and T006 pass, then run `pnpm test`, `pnpm lint`, `pnpm build`

**Checkpoint**: header on every page and wording consistent. `/` temporarily still has its Boys/Girls list until US2.

---

## Phase 4: User Story 2 - Remove the other navigation (P2)

**Goal**: The header is the only navigation: no Boys/Girls list on `/`, no back links on name or not-found pages.

**Independent Test**: for `/`, a name page, `/boys/nope` and `/nope`, the `<main>` content contains no anchors except the last-name form controls and name links on lists, and none of "Back to the", "Back home".

### Tests (write first, must FAIL) ⚠️

- [X] T010 [P] [US2] In `src/pages/routes.test.tsx` replace the old `'%s shows not found with a link home'` test (now vacuous because the header links to `/`) with FAILING checks over `/nope`, `/nope/x`, `/boys/oliver/extra`, `/a/b/c`: `Page not found` shown, `Back home` absent, `mainHtml` contains no `<a `; add a FAILING `/` check that `mainHtml` has no `href="/boys"` or `href="/girls"` and no `<nav` (FR-006, FR-007); delete the old `'/ links to Boys and Girls'` test (T003 now covers the header links)
- [X] T011 [P] [US2] In `src/pages/NamePage.test.tsx` replace the old not-found test (vacuous `href="/boys"`) with FAILING checks: `/boys/nope` and `/boys/ada` show `Name not found`, no `Back to the`, `mainHtml` contains no `<a `; a found name page (`/boys/oliver`) has no `Back to the` and `mainHtml` contains no `<a ` (FR-007)
- [X] T012 [P] [US2] In `src/pages/CategoryList.test.tsx` add a check that every configured first name on `/boys` appears as an anchor `href="/boys/<slug>"` inside `mainHtml` and that the anchor count in `mainHtml` equals the number of listed names (FR-008; guards against removing content links by accident)

### Implementation

- [X] T013 [US2] Remove the Boys/Girls `<nav>` list and the now-unused `Link` import from `src/pages/Home.tsx`; make the `/` part of T010 pass
- [X] T014 [US2] Remove the not-found "Back to the {category} list" paragraph and the `<footer>` back link, and the now-unused `Link` import, from `src/pages/NamePage.tsx`; make T011 pass
- [X] T015 [US2] Remove the "Back home" paragraph and the unused `Link` import from `src/pages/NotFound.tsx`; make the rest of T010 pass

**Checkpoint**: header is the only navigation; list name links intact.

---

## Phase 5: Polish & cross-cutting

- [X] T016 Run `pnpm test` (with coverage), `pnpm lint` and `pnpm build`; confirm ≥ 80% lines on `src/lib` and `src/pages`, no `any` or `@ts-ignore`, test time under 30 s
- [X] T017 [P] Grep guards: `grep -rniE --exclude='*.test.ts*' "back (home|to the)" src` finds nothing; `grep -rn --exclude='*.test.ts*' "urname" src/pages src/components` finds only identifiers (imports, component and function names), no visible string
- [X] T018 [P] Add one-line amendment notes under **Status** in `specs/001-name-routing/spec.md` ("Amended by 003-nav-header: landing-page links and back links are replaced by the header") and `specs/002-name-input/spec.md`, `contracts/ui.md` and `quickstart.md` (each: "Amended by 003-nav-header: visible wording is 'last name'; messages now read 'Enter a last name.' and 'Last name must be 50 characters or fewer.'")
- [ ] T019 Walk the manual table in [quickstart.md](quickstart.md) (rows 1–9) in `pnpm dev`, especially 320 px width, keyboard order and back/forward; fix anything that fails and record the result in the commit message

---

## Dependencies & Execution Order

- Phase 1 → US1 → US2 → Polish. US2 follows US1 because both edit `src/pages/Home.tsx` and `src/pages/routes.test.tsx`.
- US1 order: T002 → T003 → T004 (same test file, in order); T005 and T006 [P] with each other and with T003/T004; T007 after T003; T008 after T005; T009 after T004 and T006.
- US2 order: T010, T011, T012 are [P] (three test files, T010 touches `routes.test.tsx` only after US1's edits); T013 after T010; T014 after T011; T015 after T010.
- Polish: T017 and T018 [P]; T016 after all code; T019 last.

## Parallel Examples

```text
US1 tests:   T005 + T006            (rules.test.ts, CategoryList/NamePage tests) alongside T003 → T004
US2 tests:   T010 + T011 + T012     (routes, NamePage, CategoryList tests)
Polish:      T017 + T018
```

## Implementation Strategy

- **MVP = through US1**: the header exists on every page and wording matches the nav label. The old links still exist at that point, so the site works but is not yet simplified.
- Then US2 (removals) completes the simplification.
- Per task: see the test fail for the right reason, minimal change to green, then refactor. Commit at each checkpoint.
