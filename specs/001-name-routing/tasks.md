---

description: "Task list for Name Routing"
---

# Tasks: Name Routing

**Input**: Design documents from `/specs/001-name-routing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/routes.md, quickstart.md

**Tests**: REQUIRED by the constitution (Principle III, TDD). Each test task precedes the implementation it covers and MUST be seen failing first.

**Organization**: Grouped by user story. US1 is the MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: different files, no dependency on an incomplete task
- Paths are repo-root relative

## Phase 1: Setup

- [ ] T001 Add the `wouter` dependency with `pnpm add wouter` (package.json, pnpm-lock.yaml)
- [ ] T002 Update package.json scripts: `test` → `vitest run --coverage --passWithNoTests`; `build` → also copy `dist/index.html` to `dist/404.html` (deep links on GitHub Pages). Add `@vitest/coverage-v8` and a Vitest config enforcing 80% lines on `src/lib` and `src/pages` (package.json, vitest.config.ts)

---

## Phase 2: Foundational (blocks all stories)

**⚠️ CRITICAL**: no user story work starts until this phase is done.

- [ ] T003 [P] Write failing tests for `slugify` (lowercase, accents stripped, apostrophes dropped, spaces to `-`, trimmed dashes) in src/lib/slug.test.ts
- [ ] T004 Implement `slugify` in src/lib/slug.ts to pass T003
- [ ] T005 Define types `CategoryId`, `CategoryConfig`, `Config` and add sample data (surname, 2+ boys, 2+ girls, 2+ middle names per category) in src/data/config.ts
- [ ] T006 Write config invariants test (slugs unique per category, no empty strings, every slug non-empty, surname non-empty) against the real config in src/data/config.test.ts; make it pass (FR-010)
- [ ] T007 Add `src/test/renderAt.tsx` (renders `<App/>` at a path via wouter `<Router ssrPath>` + `renderToString`) and an App shell with Pico layout, `<Router>` and an empty `<Switch>` in src/App.tsx

**Checkpoint**: slugs, config and the render harness are ready.

---

## Phase 3: User Story 1 - Browse a full list of names (P1) 🎯 MVP

**Goal**: `/boys` and `/girls` list only their category's names, each linking to its name page.

**Independent Test**: render `/boys` and `/girls`; each shows exactly its configured names and links, and an empty category shows "No names yet".

### Tests (write first, must FAIL) ⚠️

- [ ] T008 [P] [US1] Failing tests for `firstNames(category)` returning `{ name, slug }[]` for the right category only in src/lib/names.test.ts
- [ ] T009 [P] [US1] Failing route tests for `/boys` and `/girls`: only own names, links `href="/<category>/<slug>"`, empty-state message when list is empty, names rendered as `<a href>` links inside a list, in src/pages/CategoryList.test.tsx

### Implementation

- [ ] T010 [US1] Implement `firstNames` in src/lib/names.ts to pass T008
- [ ] T011 [US1] Implement the CategoryList page (uses `firstNames`, semantic `<ul>`/`<a href>`, empty state) in src/pages/CategoryList.tsx
- [ ] T012 [US1] Register `/boys` and `/girls` routes in src/App.tsx to pass T009

**Checkpoint**: US1 works alone and is demoable.

---

## Phase 4: User Story 2 - View combinations for one first name (P2)

**Goal**: `/<category>/<slug>` shows one `First Middle Surname` per middle name of that category, for that first name only.

**Independent Test**: render `/boys/<slug>`; it shows exactly the boys middle names crossed with that first name and the fixed surname.

### Tests (write first, must FAIL) ⚠️

- [ ] T013 [P] [US2] Failing tests for `findName(category, slug)` (found, unknown slug, slug from the other category) and `combinations(category, first)` (one per middle name, `full` formatted, empty when no middles) in src/lib/names.test.ts
- [ ] T014 [P] [US2] Failing route tests for `/boys/<slug>` and `/girls/<slug>`: only that name's combinations, other names absent, unknown slug shows "name not found" with a link to the category list, empty-state when no middles; plus one test that loops over EVERY first name in the real config and asserts `/<category>/<slug>` renders its combinations (SC-001), in src/pages/NamePage.test.tsx

### Implementation

- [ ] T015 [US2] Implement `findName` and `combinations` in src/lib/names.ts to pass T013 (same file as T010, so after it)
- [ ] T016 [US2] Implement the NamePage page (heading with the first name, combinations in a semantic list, not-found state, back link) in src/pages/NamePage.tsx
- [ ] T017 [US2] Register `/boys/:slug` and `/girls/:slug` routes in src/App.tsx to pass T014

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 - Move between pages naturally (P3)

**Goal**: landing page, not-found, case/trailing-slash tolerance, and deep links on the deployed site.

**Independent Test**: load any URL cold (including `/`, `/Boys`, `/boys/`, unknown paths) and get the right page or a not-found with a way back; `dist/404.html` mirrors `dist/index.html`.

### Tests (write first, must FAIL) ⚠️

- [ ] T018 [P] [US3] Failing route tests in src/pages/routes.test.tsx: `/` links to Boys and Girls; unknown path and unknown category show NotFound with a link to `/`; `/Boys`, `/boys/` and `/boys/<SLUG-IN-CAPS>` render the same HTML as their lowercase canonical paths (research R6)

### Implementation

- [ ] T019 [P] [US3] Implement Home in src/pages/Home.tsx
- [ ] T020 [P] [US3] Implement NotFound in src/pages/NotFound.tsx
- [ ] T021 [US3] Add `/` and catch-all routes and a lowercase path-normalisation step in src/App.tsx (wouter matching is case-sensitive by default; verify with T018 and drop the step only if T018 passes without it) to pass T018
- [ ] T022 [US3] Verify T002: run `pnpm build && cmp dist/index.html dist/404.html` (must exit 0)

**Checkpoint**: all three stories complete.

---

## Phase 6: Polish

- [ ] T023 [P] Run `pnpm lint`, `pnpm test` (coverage >= 80%) and `pnpm build`; fix findings
- [ ] T024 Run the manual steps in specs/001-name-routing/quickstart.md with `pnpm build && pnpm preview` (back/forward, refresh, deep links). Covers FR-007 (back/forward), SC-002 (≤3 selections) and SC-004 (<1 s): manual by design, as wouter owns history
- [ ] T025 After merge and deploy, repeat quickstart steps 2, 3 and 5 on the live site

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → Polish.
- T001 gates anything importing `wouter` (T007 onwards). T002 follows T001 (same file).
- T004 needs T003; T006 needs T005; T007 needs T001.
- US2 reuses `names.ts` (T015 after T010) and `App.tsx` (T017 after T012).
- US3 stories are otherwise independent but share `App.tsx` (T021 after T017).

## Parallel Opportunities

- Setup: none (T001 → T002, same file).
- Foundational: T003 ∥ T005; then T004 ∥ T006.
- US1: T008 ∥ T009. US2: T013 ∥ T014. US3: T018 first, then T019 ∥ T020.

```bash
# US1 tests together:
Task: "Failing tests for firstNames in src/lib/names.test.ts"
Task: "Failing route tests for /boys and /girls in src/pages/CategoryList.test.tsx"
```

## Implementation Strategy

### MVP First (US1 only)
1. Setup, Foundational.
2. US1 (T008–T012).
3. **Validate**: `/boys` and `/girls` render correctly; push to deploy the MVP.

### Incremental Delivery
1. Setup + Foundational.
2. US1 → test → deploy.
3. US2 → test → deploy.
4. US3 → test → deploy.

## Notes

- Red-green-refactor per constitution Principle III; commit after each green.
- Every logic change keeps `pnpm test` green (pre-push and CI gate).
- Keep dependencies at `wouter` only (Principle I).
