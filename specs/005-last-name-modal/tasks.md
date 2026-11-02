---

description: "Task list for Last Name Modal and Homepage"
---

# Tasks: Last Name Modal and Homepage

**Input**: Design documents from `/specs/005-last-name-modal/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: REQUIRED by the constitution (Principle III, TDD). Each test task precedes the implementation it covers and MUST be seen failing for the right reason first. Static markup is tested with `renderToString`; open/close behaviour is verified by a scratch headless-Chrome script (T010) because it needs a real `<dialog>`.

**Organization**: Grouped by user story. US1 (the modal) is the MVP; US2 (homepage) is independent of it apart from sharing `routes.test.tsx`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: different files, no dependency on an incomplete task
- Paths are repo-root relative
- Contracts to match exactly: [contracts/ui.md](contracts/ui.md). Key strings: modal title `Set last name` (`id="last-name-title"`), field label `Last name`, buttons `Save last name` and `Close`, header button text `Set Last Name`, homepage heading `Baby Names`
- The modal is mounted only while open, so server-rendered pages contain no `<dialog>` and no `Save last name` unless a page's own form is shown

## Phase 1: Setup

- [X] T001 Run `pnpm test && pnpm lint && pnpm build` on the branch and confirm all green before changing anything (baseline; 154 tests expected)

## Phase 2: Foundational

None. The one shared test helper is replaced at the start of US1.

---

## Phase 3: User Story 1 - Set the last name in a modal (P1) 🎯 MVP

**Goal**: "Set Last Name" in the header opens a modal over the current page; it can save a valid last name or be closed without saving.

**Independent Test**: on any page, click Set Last Name: a modal opens and the address does not change; Save with a valid value closes it and updates names; Close, Escape and a click outside leave the saved name unchanged; focus returns to the header button (checked by the scripted browser run, T010).

### Tests (write first, must FAIL) ⚠️

- [X] T002 [US1] In `src/test/renderAt.tsx` replace `navLinks` with `navItems(html): { tag: 'a' | 'button'; href?: string; text: string }[]`, listing every `<a>` and `<button>` inside the first `<nav>` in document order (`href` only for anchors, `text` trimmed with tags stripped); remove `navLinks` (its only user is updated in T003)
- [X] T003 [US1] Update `src/pages/routes.test.tsx` to FAILING expectations: import `navItems` instead of `navLinks`; in the header `it.each` (paths `/`, `/boys`, `/girls`, `/boys/oliver`, `/boys/nope`, `/nope`, `/Boys/`, `/boys/oliver/extra`) expect `navItems(html)` to equal `[{tag:'a',href:'/boys',text:'Boys'},{tag:'a',href:'/girls',text:'Girls'},{tag:'button',text:'Set Last Name'}]`, expect the nav HTML to contain `aria-haspopup="dialog"` and a `<button type="button"`, and expect `html` not to contain `<dialog`; change the "colour-codes" test to match `/<(?:a|button)\b[^>]*>/g` (three tags: `pill-boys`, `pill-girls`, `pill-home`); scope the "no site title or tagline" test to the part of the page before `<main` (`html.slice(0, html.indexOf('<main'))` has no `<h1`, `<hgroup`, `Baby Names` or `Combine, organise`) because US2 adds a heading inside `<main`; delete the whole `last name wording on / (FR-011)` describe (superseded by T012)
- [X] T004 [P] [US1] Create `src/components/LastNameModal.test.tsx` with FAILING tests that render `<LastNameModal onClose={() => {}} />` via `renderToString` after `seed({ ...emptyStored, surname: 'Hannam' })` (reset after each): output contains `<dialog` with `aria-labelledby="last-name-title"` and no `open` attribute; an element `id="last-name-title"` containing `Set last name`; a `<label` containing `Last name` wrapping an `<input` with `value="Hannam"`; a `type="submit"` button `Save last name`; a `type="button"` button `Close`; with an empty store the input has no `value="Hannam"` and no `undefined`; the modal markup does not match `/surname/i` (the visible wording stays "last name"); also assert `renderToString(<SurnameForm />)` contains `Save last name` and does NOT contain `Close` (the in-page prompt is unchanged, FR-012)

### Implementation

- [X] T005 [US1] Update `src/components/SurnameForm.tsx`: add optional props `{ onSaved?: (persisted: boolean) => void; onClose?: () => void }`; on a valid submit compute `const persisted = store.save(r.value)`, set the notice to `Saved for this visit only. Browser storage is unavailable.` only when `!persisted`, then call `onSaved?.(persisted)`; when `onClose` is given render `<button type="button" className="secondary" onClick={onClose}>Close</button>` right after the Save button; with no props the form behaves exactly as today
- [X] T006 [US1] Create `src/components/LastNameModal.tsx`: props `{ onClose: () => void }`; `const ref = useRef<HTMLDialogElement>(null)`; `useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal() }, [])`; render `<dialog ref={ref} aria-labelledby="last-name-title" onClose={onClose} onMouseDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget }} onClick={(e) => { if (downOnBackdrop.current && e.target === e.currentTarget) e.currentTarget.close() }}>` with `const downOnBackdrop = useRef(false)`, so the dialog closes only when the press AND the release both land on the overlay (dragging a text selection out of the input must not close it) containing `<article><header><h2 id="last-name-title">Set last name</h2></header><SurnameForm onSaved={(persisted) => { if (persisted) ref.current?.close() }} onClose={() => ref.current?.close()} /></article>`; make T004 pass
- [X] T007 [US1] Update `src/App.tsx`: add `const [open, setOpen] = useState(false)`; replace the third nav `<Link>` with `<button type="button" className="pill pill-home" aria-haspopup="dialog" onClick={() => setOpen(true)}>Set Last Name</button>` (same `<li>`, same position); render `{open && <LastNameModal onClose={() => setOpen(false)} />}` inside the `.app` div after `</main>`; make T003 pass
- [X] T008 [US1] Update `src/app.css`: apply the existing `header nav a.pill` rules (base, `:hover`, `:focus-visible`) to `header nav button.pill` as well (add `border: 0; font-size: 1rem; cursor: pointer; font-family: inherit` for the button); add `.app dialog form > button { width: auto; margin: 0 0.5rem 0 0 }` so Save and Close sit side by side; do not change anything else
- [X] T009 [US1] Run `pnpm test`, `pnpm lint` and `pnpm build`; all green
- [X] T010 [US1] Verify the real behaviour with a scratch Node script OUTSIDE the repo (in the session scratchpad), driving headless Chrome over the DevTools protocol against `pnpm preview --port 4173` (same approach as the earlier screenshot script): seed `localStorage` key `baby-names:v1` with `{"surname":"Smith","boys":{"first":[],"middle":[]},"girls":{"first":[],"middle":[]}}`; on `/boys` click the `Set Last Name` button and assert `dialog[open]` exists, `location.pathname` is `/boys`, and the input is focused; type `Jones`, click `Close` and assert the dialog is gone, the stored surname is still `Smith` and `document.activeElement` is the header button; repeat closing with the `Escape` key and with a click on the overlay outside the card; reopen, assert the input value is `Smith`; clear it, click `Save last name`, assert the message `Enter a last name.`, the dialog still open and the stored surname still `Smith`; type `Jones`, save, assert the dialog closed, the stored surname is `Jones` and focus is on the header button; repeat the open on `/nope` and `/girls`; with the modal open press Tab 10 times (and Shift+Tab 10 times) and after each press assert `document.activeElement` is inside the `dialog`; press the mouse on the input, drag to the overlay outside the card, release, and assert the dialog is still open with the typed text intact; then, in a fresh page load that first installs `Storage.prototype.setItem = () => { throw new Error('blocked') }` via `Page.addScriptToEvaluateOnNewDocument`, open the modal, type `Jones`, Save, and assert the notice `Saved for this visit only. Browser storage is unavailable.` is visible, the dialog is still open, and closing then reopening shows `Jones` (applied for the visit); capture screenshots of the open modal at 1000 px and 390 px and read them to confirm it fits and uses the section colours; fix anything that fails (spec rows 2–10 of the quickstart)

**Checkpoint**: US1 works and is demoable; the `/` page still holds its old form until US2.

---

## Phase 4: User Story 2 - A homepage that says what the site is for (P2)

**Goal**: `/` is a short static homepage: heading plus at most two sentences, no form, no links.

**Independent Test**: render `/` with and without a saved last name: same output; one `<h1>`; purpose text of at most 2 sentences and 40 words; no `<form`, `<input`, `<button`, `<a ` or `<nav` in `<main>`.

### Tests (write first, must FAIL) ⚠️

- [X] T011 [US2] Add FAILING tests to `src/pages/routes.test.tsx` in a `homepage (FR-010, FR-011)` describe: `mainHtml(renderAt('/'))` contains `<h1>Baby Names</h1>` and exactly one `<p`; the paragraph text (tags stripped) has at most 2 sentences (`/[.!?](\s|$)/g` matches) and at most 40 words, and mentions `first and middle names`, `last name` and `boys and girls`; `mainHtml` contains none of `<form`, `<input`, `<button`, `<a `, `<nav`; it contains none of `Set your last name to see full names`, `Last name:` or `Save last name`; `mainHtml(renderAt('/'))` is identical with `seed(fixture)` and after `resetStore()`

### Implementation

- [X] T012 [US2] Rewrite `src/pages/Home.tsx` to a static card: `<article><header><h1>Baby Names</h1></header><p>Plan baby names the easy way: add first and middle names for boys and girls, set your last name, and see every full-name combination. Pick Boys or Girls above to start.</p></article>`; remove the form, the status line and the `useNames`/`SurnameForm` imports; in `src/app.css` extend the card-header rule so `h1` there uses the same ink colour as `h2` (`--pico-h1-color: var(--accent-ink)` alongside `--pico-h2-color`); make T011 pass, then `pnpm test`, `pnpm lint`, `pnpm build`

**Checkpoint**: both stories complete.

---

## Phase 5: Polish & cross-cutting

- [X] T013 [P] Add amendment notes (one line each, "Amended by 005-last-name-modal: …"): `specs/002-name-input/spec.md` and `contracts/ui.md` (the last-name prompt on `/` is replaced by the header modal; `/` is a static homepage); `specs/003-nav-header/spec.md` and `contracts/ui.md` (Set Last Name opens a modal instead of linking to `/`; it is a button, the other two stay links)
- [X] T014 [P] Grep guards: `grep -rn "Set Last Name" src --include='*.tsx' --exclude='*.test.tsx'` finds only the `<button>` in `src/App.tsx`; `grep -rn "SurnameForm" src --exclude='*.test.tsx'` finds only `LastNameModal.tsx`, `CategoryList.tsx`, `NamePage.tsx` and its own file; `grep -rn "navLinks" src` finds nothing
- [X] T015 Run `pnpm test` (with coverage), `pnpm lint`, `pnpm build`; confirm ≥ 80% lines on `src/lib` and `src/pages`, no `any` or `@ts-ignore`, test time under 30 s
- [X] T016 Take a 320 px wide screenshot of `/` with the scratch script from T010 and read it: the whole purpose text is visible without scrolling (SC-004); then walk the remaining manual rows of [quickstart.md](quickstart.md) (rows 1, 11, 12, 13, 14), especially blocked storage (row 13) and the back button (row 14); fix anything that fails and record the result in the commit message

---

## Dependencies & Execution Order

- Phase 1 → US1 → US2 → Polish. US2 follows US1 because both edit `src/pages/routes.test.tsx` and `src/app.css`.
- US1 order: T002 → T003 (T003 imports `navItems`); T004 [P] with T002/T003 (new file); then T005 → T006 → T007 (the modal needs the new form props, `App` imports the modal); T008 after T007; T009, then T010 last. T003 and T004 only go green once T006/T007 are done.
- US2: T011 → T012.
- Polish: T013 and T014 [P]; T015 after all code; T016 last.
- The page tests in `routes.test.tsx` stay red from T003 until T007 is done.

## Parallel Examples

```text
US1 tests:   T002 → T003, alongside T004   (helper+routes tests vs. a new modal test file)
US1 impl:    T005 → T006 → T007 → T008     (strictly sequential; each builds on the last)
Polish:      T013 + T014
```

## Implementation Strategy

- **MVP = US1**: the modal replaces the last-name page. The old `/` form stays until US2 swaps in the homepage, so nothing is ever without a way to set a last name.
- Per task: see the test fail for the right reason, minimal change to green, then refactor. Commit at each checkpoint.
- Open/close glue is not in `pnpm test`; T010 and T016 are the safety net and must not be skipped.
