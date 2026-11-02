---

description: "Task list for Manage Names"
---

# Tasks: Manage Names

**Input**: Design documents from `/specs/004-manage-names/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: REQUIRED by the constitution (Principle III, TDD). Each test task precedes the implementation it covers and MUST be seen failing for the right reason first.

**Organization**: Grouped by user story. Removing the sample names (US4) deletes the built-in config that every page and function reads, so it is delivered inside Phase 2 and the other stories build on it. MVP = Phase 2 + US1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: different files, no dependency on an incomplete task
- Paths are repo-root relative
- Data model, function signatures and messages: [data-model.md](data-model.md), [contracts/ui.md](contracts/ui.md). Exact names to use:
  - `src/lib/rules.ts` exports: `CategoryId`, `Role`, `Lists`, `Stored`, `Result<T>`, `emptyStored`, `tidy`, `clean`, `setSurname`, `addName(stored, category, raw, role)`, and (later phases) `removeName(stored, category, name)`, `demote(stored, category, name)`, `promote(stored, category, name)`
  - `src/lib/names.ts` exports: `isCategory`, `firstNames(lists)`, `findName(lists, slug)`, `middleOnly(lists)`, `combinations(lists, first, surname)`
  - `src/lib/store.ts` exports: `createStore`, `store`, `useNames(): Stored`, `persist(next, s = store)`
  - Removed: `merge`, `Names`, `Config`, `CategoryConfig`, `src/data/`
- Sort order everywhere: `a.localeCompare(b, 'en', { sensitivity: 'base' })`

## Phase 1: Setup

- [X] T001 Run `pnpm test && pnpm lint && pnpm build` on the branch and confirm all green before changing anything (baseline; 109 tests expected)

---

## Phase 2: Foundational + US4 (ship no names) 🎯

**Purpose**: one data source (the visitor's stored lists), always deduped and alphabetical, and no sample names. Blocks every story.

**Goal (US4)**: a fresh visitor sees no names anywhere; saved names are kept.

**Independent Test**: with an empty store, `/boys` and `/girls` show "No names yet." and no list items; `/boys/oliver` and `/girls/ada` show "Name not found"; names saved by 002 (unsorted) load intact and sorted.

### Tests (write first, must FAIL) ⚠️

- [X] T002 [P] Update `src/lib/rules.test.ts` to the new API (FAILING until T005): delete the `merge` describe and the `Config` import; keep the `emptyStored` test; add a `tidy` describe (dedupes ignoring case keeping the first spelling; sorts ignoring case, e.g. `['bob','Alice','carl']` → `['Alice','bob','carl']` and `['Émile','Eve','Adam']` → `['Adam','Émile','Eve']`; applies to `first` and `middle` of both categories; leaves `surname` alone; does not mutate; a name in `first` but missing from `middle` is added to `middle`, e.g. `{ first: ['Amy'], middle: [] }` → `middle: ['Amy']`); change every `addName(stored, cfg, category, raw, role)` call to `addName(stored, category, raw, role)`, replacing the `built` config fixture with a `stored` value holding the same names so the duplicate and slug-clash cases still assert the same messages; add: a successful add returns lists in alphabetical order (add `Noah` to `['Zed']` → `['Noah','Zed']`)
- [X] T003 [P] Rewrite `src/lib/names.test.ts` for the one-category API: `firstNames(lists)` returns `{ name, slug }[]` in list order; `findName(lists, slug)` finds a slug or returns `undefined`; `middleOnly(lists)` returns names in `middle` not in `first` ignoring case, order preserved; `combinations(lists, first, surname)` crosses one first name with `middle` in list order, skips a middle equal to the first name ignoring case (FR-015), is empty with no middles; remove all `Config`/category arguments
- [X] T004 [P] Add FAILING tests to `src/lib/store.test.ts`: loading saved data with unsorted names and a case-duplicate (`{"boys":{"first":["zed","Amy","amy"],"middle":["zed","Amy","amy"]},"girls":{"first":[],"middle":[]}}`) returns sorted, deduped lists with no other name lost (FR-013, FR-002); `persist(next, store)` with a store whose `setItem` throws calls a stubbed `window.alert` exactly once with `Saved for this visit only. Browser storage is unavailable.` (use `vi.stubGlobal('window', { alert })` and restore after); with a working fake storage `alert` is not called; the change still applies to the snapshot in both cases
- [X] T005 [P] Rewrite `src/pages/CategoryList.test.tsx` for stored-only data (FAILING until T011–T014): remove `config` and `Names` imports; seed with `seed({ ...emptyStored, surname: 'Hannam', boys: { first: ['Arthur','Oliver'], middle: ['Arthur','Oliver'] }, girls: { first: ['Ada'], middle: ['Ada'] } })`; keep the existing assertions (own category only, links `href="/boys/oliver"`, empty-state, add form, last-name prompt cases, added names) but derive expectations from the seed; the `names` prop for direct renders is a `Stored`; also change `seed` in `src/test/renderAt.tsx` to `seed = (stored: Stored) => void store.save(tidy(stored))` (import `tidy` from `../lib/rules`) so seeded data follows the same sorted, deduped invariant as saved data; add FAILING fresh-visitor tests with `resetStore()`: `/boys` and `/girls` contain `No names yet.` and no `<li`; the HTML contains none of `Oliver`, `Arthur`, `Finn`, `Ada`, `Zoë`, `Mary Ann` (FR-001, SC-004)
- [X] T006 [P] Rewrite `src/pages/NamePage.test.tsx` for stored-only data (FAILING until T011–T014): remove `config` and `Names` imports; seed the same lists as T005 plus middle names (`boys.middle: ['Arthur','Edward','Oliver']`); replace "renders every configured name page" with "renders every seeded name page" derived from the seed; the direct-render `names` props are `Stored`; add FAILING fresh-visitor tests: with `resetStore()`, `/boys/oliver` and `/girls/ada` show `Name not found`
- [X] T007 [P] Update `src/pages/routes.test.tsx`: seed `boys: { first: ['Oliver'], middle: ['Oliver'] }` and `girls: { first: ['Ada'], middle: ['Ada'] }` in `beforeEach` so the case/trailing-slash equality tests (`/boys/OLIVER` vs `/boys/oliver`, `/Girls/Ada/` vs `/girls/ada`) compare real pages instead of two not-found pages; no other change

### Implementation

- [X] T008 Rewrite `src/lib/rules.ts` to the data model: export `CategoryId`, `Role`, `Lists` (renamed from `Added`), `Stored`, `Result<T>`, `emptyStored`; add `tidy` (dedupe, append any `first` name missing from `middle`, then sort); keep `clean`, `setSurname`; change `addName` to `(stored, category, raw, role)` (still accepts `role: Role | undefined` and keeps the "Choose how to use this name." check until US3), checking duplicates against `stored[category].first` and `.middle`, and returning a tidied result; move the slug rules (empty slug, clash with an existing first name) into one shared helper `firstNameError(first, name)`; delete `merge`, `Names` and the old `dedupe`; make T002 pass
- [X] T009 Rewrite `src/lib/names.ts` per the data model (`isCategory` imports `CategoryId` from `./rules`; functions take one category's `Lists`; add `middleOnly`); remove every `config`/`Config` import; make T003 pass
- [X] T010 Update `src/lib/store.ts`: `parse` returns `tidy(...)` of valid data; `useNames()` returns the `Stored` snapshot directly (drop `merge`, `useMemo`, the `config` import); add `export function persist(next: Stored, s = store): void { if (!s.save(next)) window.alert('Saved for this visit only. Browser storage is unavailable.') }`; make T004 pass
- [X] T011 [P] Delete `src/data/config.ts` and `src/data/config.test.ts`
- [X] T012 [P] In `src/components/AddNameForm.tsx` remove the `config` import and call `addName(store.getSnapshot(), category, value, role)`; behaviour otherwise unchanged
- [X] T013 [P] Update `src/pages/CategoryList.tsx` to read stored-only data: prop `names?: Stored` (default `useNames()`), `const lists = names[category]`, `firstNames(lists)`; remove `Names`/`cfg`; render exactly as today for now (grouping comes in US1)
- [X] T014 [P] Update `src/pages/NamePage.tsx` the same way: prop `names?: Stored`, `findName(lists, slug)`, `combinations(lists, found.name, surname)`; remove `Names`/`cfg`
- [X] T015 Run `pnpm test`, `pnpm lint`, `pnpm build`; make T005–T007 pass; confirm no import of `../data/config` remains (`grep -rn "data/config" src` is empty)

**Checkpoint**: one data source, sorted, no sample names; behaviour otherwise as in 003.

---

## Phase 3: User Story 1 - Delete a name (P1) 🎯 MVP

**Goal**: delete any name, with a confirm, from `/<category>` or its own page; middle-only names become visible so they can be deleted.

**Independent Test**: render with seeded names: `/<category>` shows two groups in alphabetical order, each name with a `Delete {name}` button; a name page shows a `Delete {name}` button; `removeName` removes a name from both lists in one category only.

### Tests (write first, must FAIL) ⚠️

- [X] T016 [P] [US1] Add FAILING tests to `src/lib/rules.test.ts` for `removeName(stored, category, name)`: removes the name from `first` and `middle` ignoring case; leaves the other category untouched even if it holds the same spelling; a name not present returns an equal value; a middle-only name is removed from `middle`; does not mutate its input; result is tidy
- [X] T017 [P] [US1] Add FAILING tests to `src/pages/CategoryList.test.tsx` (seed `boys: { first: ['Oliver','arthur'], middle: ['arthur','Oliver','lee','James'] }`; `seed` tidies it): headings `First and middle names` and `Middle names only` appear; first group lists `arthur` then `Oliver` as links (`href="/boys/arthur"`); middle-only group lists `James` then `lee` as plain text with no link (alphabetical because seeded data is tidy; sorting itself is proven in T002); a name appears once; each name has a button with `aria-label="Delete {name}"` (all four); with both groups empty `No names yet.` is shown and no group heading; with only first names the `Middle names only` heading is absent (FR-002, FR-003); delete buttons are present with no last name set
- [X] T018 [P] [US1] Add FAILING tests to `src/pages/NamePage.test.tsx`: a found name page contains a button `aria-label="Delete Oliver"`; it is also present with no last name set; the not-found page contains no Delete button; the 003 checks still hold (no `<a ` in `mainHtml`, no `Back to the`)

### Implementation

- [X] T019 [US1] Add `removeName` to `src/lib/rules.ts` (pure; returns `tidy` of the new value); make T016 pass
- [X] T020 [US1] Create `src/components/DeleteButton.tsx`: props `{ category: CategoryId; name: string; onDeleted?: () => void }`; renders `<button type="button" aria-label={`Delete ${name}`}>Delete</button>`; on click: `if (!window.confirm(`Delete ${name}?`)) return`, then `persist(removeName(store.getSnapshot(), category, name))`, then `onDeleted?.()`
- [X] T021 [US1] Update `src/pages/CategoryList.tsx` to the two-group layout in [contracts/ui.md](contracts/ui.md): `<h3>` plus `<ul>` per non-empty group (first-and-middle: link + `DeleteButton`; middle-only from `middleOnly(lists)`: text + `DeleteButton`), `No names yet.` when both are empty; make T017 pass
- [X] T022 [US1] Update `src/pages/NamePage.tsx`: render `<DeleteButton category={category} name={found.name} onDeleted={() => navigate(`/${category}`)} />` after the content of a found name (use `useLocation` from `wouter` for `navigate`); make T018 pass

**Checkpoint**: delete works from both pages (confirm and redirect verified manually); US1 demoable.

---

## Phase 4: User Story 2 - Move a name between first and middle roles (P2)

**Goal**: promote a middle-only name to first-and-middle, or demote the reverse, in one selection.

**Independent Test**: seeded page shows the right button per group; `demote` and `promote` change roles and ordering correctly; a promote that clashes on page address returns the clash message and changes nothing.

### Tests (write first, must FAIL) ⚠️

- [X] T023 [P] [US2] Add FAILING tests to `src/lib/rules.test.ts`: `demote(stored, category, name)` removes the name from `first`, keeps it in `middle`, leaves other names and the other category unchanged, result tidy, no mutation; `promote(stored, category, name)` returns `{ ok: true }` with the name added to `first` in alphabetical place; returns `{ ok: false, error: "Mary Ann clashes with Mary-Ann, which has the same page address." }` (format `{name} clashes with {existing}, which has the same page address.`) when promoting `Mary Ann` while `Mary-Ann` is already a first name (both slugify to `mary-ann`); returns `Name must include a letter or number.` for a name with an empty slug; a promote error leaves the input untouched
- [X] T024 [P] [US2] Add FAILING tests: in `src/pages/CategoryList.test.tsx`, each first-and-middle item has a button `aria-label="Make middle only: {name}"` and each middle-only item has `aria-label="Make first and middle: {name}"`, with visible text `Make middle only` / `Make first and middle`; in `src/pages/NamePage.test.tsx`, after seeding the result of `demote` for `Oliver`, `/boys/oliver` shows `Name not found` and another first name's page still lists `Oliver` as a middle name in alphabetical order, with no `Oliver Oliver` (FR-007, FR-014); after seeding a promote of a middle-only name, `/boys/<slug>` shows its combinations

### Implementation

- [X] T025 [US2] Add `demote` and `promote` to `src/lib/rules.ts` (`promote` uses the shared `firstNameError` helper; both return tidied results); make T023 pass
- [X] T026 [US2] Create `src/components/MoveButton.tsx`: props `{ category: CategoryId; name: string; to: 'first' | 'middle' }`; `to='middle'` renders visible `Make middle only`, `aria-label={`Make middle only: ${name}`}`, click calls `persist(demote(...))`; `to='first'` renders `Make first and middle`, `aria-label={`Make first and middle: ${name}`}`, click calls `promote(...)`, on `ok` `persist(r.value)`, on error sets local state shown as `<small role="alert">{error}</small>` beside the button
- [X] T027 [US2] Update `src/pages/CategoryList.tsx`: add `<MoveButton to="middle" />` in each first-and-middle item and `<MoveButton to="first" />` in each middle-only item, before `DeleteButton`; make T024 pass

**Checkpoint**: US1 and US2 work; roles can be corrected.

---

## Phase 5: User Story 3 - Sensible default when adding (P3)

**Goal**: "First and middle name" is selected when the form shows and again after each successful add.

**Independent Test**: render `/<category>` with a last name set: the first radio is `checked`, the second is not; no "Choose how to use this name." branch remains.

### Tests (write first, must FAIL) ⚠️

- [X] T028 [P] [US3] In `src/pages/CategoryList.test.tsx` replace the old "no radio checked" assertion with FAILING checks: the `First and middle name` radio carries `checked` and the `Middle name only` radio does not (extract each radio tag with `/<input[^>]*type="radio"[^>]*>/g`; the one for `First and middle name` matches `/checked/`, the other does not); in `src/lib/rules.test.ts` delete the "requires a role" test and the role-missing assertion in the "reuses the empty and length messages" test, and call `addName` only with a `Role` (FR-009)

### Implementation

- [X] T029 [US3] In `src/components/AddNameForm.tsx` use `useState<Role>('both')` and call `setRole('both')` after a successful add (a rejected add returns before touching state); in `src/lib/rules.ts` change `addName`'s `role` parameter to `Role`, and delete the "Choose how to use this name." check and message; make T028 pass

**Checkpoint**: all four stories complete.

---

## Phase 6: Polish & cross-cutting

- [X] T030 Run `pnpm test` (with coverage), `pnpm lint`, `pnpm build`; confirm ≥ 80% lines on `src/lib` and `src/pages`, no `any` or `@ts-ignore`, test time under 30 s; add tests for any uncovered branch in `src/lib/rules.ts` or `src/lib/store.ts`
- [X] T031 [P] Grep guards: `grep -rniwE --exclude='*.test.ts*' "oliver|arthur|finn|zoë|zoe|mary ann|ada|james|edward|rose|grace" src` finds nothing; `grep -rnE --exclude='*.test.ts*' "\bcfg\b|merge\(|data/config|\bNames\b" src` finds only the `Baby Names` site heading. Add `--exclude-dir=test` (the shared test fixture in `src/test/renderAt.tsx` legitimately holds sample names); also confirm `dist/assets/*.js` contains none of the sample names
- [X] T032 [P] Add amendment notes (one line each, "Amended by 004-manage-names: …"): `specs/001-name-routing/spec.md` under its notes (FR-009 shipped configuration and sample data are removed); `specs/002-name-input/spec.md`, `contracts/ui.md` and `data-model.md` (editing/removing is now in scope, a middle-only name can be promoted, "First and middle name" is preselected, `merge`/`Names` are gone)
- [ ] T033 Walk the manual table in [quickstart.md](quickstart.md) (rows 1–16) in `pnpm dev`, especially: confirm Cancel and OK (rows 10–12), redirect after delete from a name page, the promote clash message, keyboard-only delete, 002-shaped saved data, blocked storage; fix anything that fails and record the result in the commit message

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → US1 → US2 → US3 → Polish. US2 follows US1 (both edit `CategoryList.tsx`, `rules.ts`, and their tests); US3 follows US2 (same files).
- Phase 2: tests T002–T007 are [P]; T008 (rules) before T009 (names) and T010 (store); T011–T014 are [P] after T008–T010; T015 last.
- US1: T016–T018 [P]; T019 → T020 → T021 and T022 (T021, T022 are different files, [P] after T020).
- US2: T023, T024 [P]; T025 → T026 → T027.
- Polish: T031, T032 [P]; T030 after all code; T033 last.
- Phase 2 leaves page tests red from T005 until T011–T014 are all done; the build is only green again at T015.

## Parallel Examples

```text
Phase 2 tests:  T002 + T003 + T004 + T005 + T006 + T007   (six different test files)
Phase 2 impl:   T011 + T012 + T013 + T014                 (four different source files, after T008–T010)
US1 tests:      T016 + T017 + T018
US1 wiring:     T021 + T022                                (after T020)
US2 tests:      T023 + T024
Polish:         T031 + T032
```

## Implementation Strategy

- **MVP = Phase 2 + US1**: no sample names and deletable names. Then US2 (re-role), then US3 (default radio).
- Per task: see the test fail for the right reason, minimal change to green, then refactor. Commit at each checkpoint.
- Click handlers (confirm, redirect, promote error, form reset) have no automated test; they are verified in T033.
