---

description: "Task list for Name Input"
---

# Tasks: Name Input

**Input**: Design documents from `/specs/002-name-input/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: REQUIRED by the constitution (Principle III, TDD). Each test task precedes the implementation it covers and MUST be seen failing for the right reason first.

**Organization**: Grouped by user story. US1 is the MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: different files, no dependency on an incomplete task
- Paths are repo-root relative
- Shared names (use exactly): `Role = 'both' | 'middle'`; `Stored`, `Names`, `Result<T>`, `emptyStored`, `clean`, `setSurname`, `addName`, `merge` exported from `src/lib/rules.ts`; `store` (with `subscribe`, `getSnapshot`, `getServerSnapshot`, `save`), `createStore(storage?)` and `useNames()` exported from `src/lib/store.ts`. Types and messages: [data-model.md](data-model.md), [contracts/ui.md](contracts/ui.md).

## Phase 1: Setup

- [X] T001 Run `pnpm test && pnpm lint && pnpm build` on the branch and confirm all green before changing anything (baseline; no new dependencies are added by this feature)

---

## Phase 2: Foundational (blocks all stories)

**⚠️ CRITICAL**: removes the built-in surname, adds self-pairing exclusion, and builds the store. No story work starts until done. The build stays green at the end of this phase; T004–T010 leave page tests red until T011.

- [X] T002 [P] Update `src/lib/names.test.ts`: drop `surname` from the `Config` fixture; change `combinations` calls to `combinations(category, first, surname, cfg)` (surname `'Smith'`); add FAILING cases: a middle name equal to the first name is skipped (`'Fin'` with middle `['Fin','Noah']` → only `Fin Noah Smith`); the skip ignores case (`'fin'` vs `'Fin'`); a first name with other middles is unaffected (FR-015)
- [X] T003 [P] Remove the `has a non-empty surname` assertion from `src/data/config.test.ts`
- [X] T004 Remove `surname` from `Config` (`Config = Record<CategoryId, CategoryConfig>`) and the sample data in `src/data/config.ts`; change `combinations` in `src/lib/names.ts` to `(category, first, surname, cfg = config)` skipping middles equal to `first` ignoring case; make T002 pass (`pnpm vitest run src/lib/names.test.ts src/data`)
- [X] T005 [P] Create `src/lib/rules.test.ts` with FAILING tests for `emptyStored` (`{ boys: {first:[],middle:[]}, girls: {first:[],middle:[]} }`, no surname) and `merge(cfg, stored): Names`: built-in names first then added; per-category separation; case-insensitive dedupe (stored `'oliver'` does not duplicate built-in `'Oliver'`); `surname` passed through (undefined when unset); inputs not mutated
- [X] T006 Create `src/lib/rules.ts` exporting types `Role`, `Added`, `Stored`, `Names`, `Result<T>` (`{ok:true,value:T}|{ok:false,error:string}`), `emptyStored`, and `merge`, per [data-model.md](data-model.md); make T005 pass
- [X] T007 [P] Create `src/lib/store.test.ts` with FAILING tests for `createStore(storage?)` using a fake `Storage`: empty snapshot when storage is empty; loads valid JSON from key `baby-names:v1`; corrupt JSON → empty; wrong shape (e.g. `{"boys":1}`) → empty; `getItem` throwing → empty; `getServerSnapshot()` returns the same value as `getSnapshot()`; `save(s)` updates the snapshot, notifies subscribers, writes JSON under the key, returns `true`; `setItem` throwing → `save` returns `false` but the snapshot still updates; unsubscribe stops notifications; snapshot identity is stable between saves; no `storage` argument → in-memory only, never throws
- [X] T008 Create `src/lib/store.ts`: `createStore(storage)` per [data-model.md](data-model.md) (all storage access in try/catch, shape check on load), `store = createStore(<localStorage or undefined, guarded by try/catch>)`, and `useNames(): Names` using `useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)` plus `useMemo(() => merge(config, stored))`; make T007 pass
- [X] T009 Extend `src/test/renderAt.tsx` with `seed(stored: Stored)` (calls `store.save`) and `resetStore()` (`store.save(emptyStored)`); keep `renderAt(path)` unchanged
- [X] T010 Update `src/pages/CategoryList.test.tsx`, `src/pages/NamePage.test.tsx`, `src/pages/routes.test.tsx`: (needs `seed`/`resetStore` from T009) seed surname `'Hannam'` in `beforeEach` via `seed({ ...emptyStored, surname: 'Hannam' })` and `resetStore()` in `afterEach`; replace `cfg: Config` fixtures with `names: Names` (`{ surname: 'X', cfg: {...} }`) passed as a `names` prop; replace `config.surname` with `'Hannam'`; add a FAILING NamePage case: first name `Fin` whose category middles include `Fin` and `Noah` shows `Fin Noah Hannam` but not `Fin Fin Hannam`. Expect failures until T011
- [X] T011 Change `src/pages/CategoryList.tsx` and `src/pages/NamePage.tsx` to take optional `names?: Names` (default from `useNames()`, called unconditionally) and read `names.cfg` instead of `cfg`; NamePage passes `names.surname` to `combinations`, and when `names.surname` is undefined renders `<p>Set a surname to see combinations.</p>` in place of the list (temporary text, replaced in US3); make T010 pass, then `pnpm build` and `pnpm lint` green

**Checkpoint**: no built-in surname anywhere; store works; existing 001 behaviour intact.

---

## Phase 3: User Story 1 - Set a surname (P1) 🎯 MVP

**Goal**: `/` prompts for a surname when unset; once saved it persists and is shown with a way to change it.

**Independent Test**: render `/` unset (prompt shown), save a surname via `setSurname` + `store.save`, render `/` again (surname shown, no prompt); empty submit is rejected with a message.

### Tests (write first, must FAIL) ⚠️

- [X] T012 [P] [US1] Add FAILING tests to `src/lib/rules.test.ts` for `clean(raw, label)` (label `'surname'|'name'`): trims; empty/whitespace → `Enter a surname.` / `Enter a name.`; over 50 chars → `Surname must be 50 characters or fewer.` / `Name must be 50 characters or fewer.`; exactly 50 is accepted; internal spacing, accents and apostrophes preserved; and for `setSurname(stored, raw)`: returns a new `Stored` with the trimmed surname, overwrites an existing surname (FR-005), keeps added names, rejects empty/too long, does not mutate the input
- [X] T013 [P] [US1] Add FAILING route tests in `src/pages/routes.test.tsx` (store reset = unset): `/` contains a labelled `Surname` input, a `Save surname` button and still links to `/boys` and `/girls`; with surname `'Smith'` seeded `/` shows `Smith`, a change form (same input and button) and the links, and no unset prompt text

### Implementation

- [X] T014 [US1] Add `clean` and `setSurname` to `src/lib/rules.ts`; make T012 pass
- [X] T015 [US1] Create `src/components/SurnameForm.tsx`: `<form>` with `<label>` "Surname" and text input (prefilled with the current surname when set), submit button "Save surname"; on submit call `setSurname(store.getSnapshot(), value)`; on error show it in an element with `role="alert"` and set `aria-invalid` on the input; on success `store.save(...)`, clear the error, and if `save` returned `false` show "Saved for this visit only. Browser storage is unavailable." (`role="status"`)
- [X] T016 [US1] Update `src/pages/Home.tsx`: render `SurnameForm` (with a short lead-in "Set your surname to see full names.") when unset, or the current surname plus `SurnameForm` for changing when set; keep the Boys/Girls links; make T013 pass

**Checkpoint**: US1 works alone and is demoable.

---

## Phase 4: User Story 2 - Add a name to a category (P2)

**Goal**: with a surname set, `/<category>` has a form to add a name as "First and middle name" or "Middle name only"; additions appear immediately and persist.

**Independent Test**: seed a surname, add names through `addName` + `store.save`, render the pages: first-and-middle appears in the list and in combinations; middle-only appears only in combinations; the other category is untouched; duplicates are rejected.

### Tests (write first, must FAIL) ⚠️

- [X] T017 [P] [US2] Add FAILING tests to `src/lib/rules.test.ts` for `addName(stored, cfg, category, raw, role)` (cfg = built-in `Config` fixture): role `'both'` appends the trimmed name to `first` and `middle`; `'middle'` appends to `middle` only; missing role → `Choose how to use this name.`; empty/too long reuse `clean` messages; duplicate rejected ignoring case in **either role** against built-in first, built-in middle, added first and added middle → `{name} is already in the {category} names.` (e.g. `'fin'` when `'Fin'` is a middle name, submitted as `'both'`; `'Fin'` as `'middle'` when it is a first name); slug collision for `'both'` (`"Finn OBrien"` vs built-in `"Finn O'Brien"`) → `{name} clashes with {existing}, which has the same page address.`; `'middle'` role skips the slug check; same name in the other category is allowed; input `stored` not mutated; check order: empty, length, role, duplicate, collision
- [X] T018 [P] [US2] Add FAILING page tests: in `src/pages/CategoryList.test.tsx` with surname seeded — an `Add name` form with a `Name` label, a `fieldset` with `legend` "Use as", radios "First and middle name" and "Middle name only" with neither `checked`, and a submit button "Add name"; a seeded added `both` name appears as a link in the list, a seeded added `middle` name does not appear in the list; an added boys name does not appear on `/girls`. In `src/pages/NamePage.test.tsx`: a seeded added middle name appears in every first name's combinations on that category, with the surname; `/boys/noah` works for an added `both` name; an added boys name is absent from `/girls` and its combinations (self-pairing is already covered by T010)

### Implementation

- [X] T019 [US2] Add `addName` to `src/lib/rules.ts` using `slugify` from `src/lib/slug.ts`, `merge`, and the messages above; make T017 pass
- [X] T020 [US2] Create `src/components/AddNameForm.tsx` taking `{ category }`: controlled `<input>` with `<label>` "Name"; `<fieldset><legend>Use as</legend>` with two radios (`both` = "First and middle name", `middle` = "Middle name only"), none preselected, `required`; submit "Add name"; on submit call `addName(store.getSnapshot(), config, category, value, role)`; error → `role="alert"` text and `aria-invalid`; success → `store.save(...)`, clear input and error (keep the radio choice), show the persistence notice if `save` returned `false`
- [X] T021 [US2] Update `src/pages/CategoryList.tsx`: when `names.surname` is set render `<AddNameForm category={category} />` above the list; make T018 pass

**Checkpoint**: US1 and US2 work; the list and combinations reflect additions immediately.

---

## Phase 5: User Story 3 - Surname required before adding names (P3)

**Goal**: deep links and bookmarks without a surname show the surname prompt instead of the add form (category) or the combinations (name page); saving updates the page in place.

**Independent Test**: with the store empty, render `/girls` and `/girls/ada`: each shows the surname prompt and neither the add form nor combinations; seed a surname and render again: the add form / combinations appear.

### Tests (write first, must FAIL) ⚠️

- [X] T022 [P] [US3] Add FAILING tests: `src/pages/CategoryList.test.tsx` — unset surname renders the `Save surname` prompt, not the `Add name` form, and still lists the names; after seeding a surname the form appears and the prompt is gone. `src/pages/NamePage.test.tsx` — unset surname on a found name renders the prompt and none of the combinations (and not the temporary T011 text); seeded surname renders combinations; an unknown slug still shows "Name not found" with unset surname

### Implementation

- [X] T023 [US3] Update `src/pages/CategoryList.tsx` to render `<SurnameForm />` instead of `<AddNameForm />` when `names.surname` is unset; update `src/pages/NamePage.tsx` to render `<SurnameForm />` in place of the combinations (replacing the T011 temporary paragraph) when unset, keeping the not-found branch first; make T022 pass

**Checkpoint**: all three stories complete.

---

## Phase 6: Polish & cross-cutting

- [X] T024 Run `pnpm test` (with coverage) and confirm ≥ 80% lines on `src/lib` and `src/pages` and total test time under 30 s; add tests for any uncovered branch in `src/lib/store.ts` or `src/lib/rules.ts`
- [X] T025 Run `pnpm lint` and `pnpm build`; fix any `any`, unused import or type error (no `@ts-ignore`); confirm `grep -rn "surname" src/data` finds nothing
- [ ] T026 Walk the manual table in [quickstart.md](quickstart.md) (rows 1–14, including 11b/11c) in `pnpm dev`; fix any row that fails and record the result in the commit message
- [X] T027 [P] Add a one-line note at the top of `specs/001-name-routing/spec.md` under **Status**: "Amended by 002-name-input: the fixed surname is removed; surname is entered by the visitor; combinations skip self-pairing."

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → Phases 3–5 → Phase 6.
- Phase 2 order: T002/T003 [P] → T004; T005 → T006; T007 → T008 (T005–T008 independent of T002–T004); T009 after T008; T010 after T009; T011 after T010. T004–T010 leave page tests red (pages still use the old `combinations` signature); T011 restores green.
- US1 (Phase 3) needs Phase 2 only. US2 needs Phase 2 and `clean` from T014, so run after US1. US3 needs `SurnameForm` (T015) and `AddNameForm` (T020), so run after US2.
- `src/lib/rules.ts` and `src/pages/CategoryList.tsx` are edited by several phases: do not parallelise those edits.

## Parallel Examples

```text
Phase 2 start:  T002 + T003 + T005 + T007   (four different test files)
US1 tests:      T012 + T013
US2 tests:      T017 + T018
```

## Implementation Strategy

- **MVP = through Phase 3** (surname entry): visible, persistent, and combinations already use it.
- Then US2 (the main input), then US3 (deep-link gating). Commit at each checkpoint.
- Per task: see the test fail for the right reason, minimal code to green, then refactor.
