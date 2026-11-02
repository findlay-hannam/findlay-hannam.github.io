# Research: Manage Names

## R1. What happens to the built-in config

- **Decision**: delete `src/data/config.ts` and its test, delete `merge` and the `Names`/`cfg` plumbing. The stored lists are the only data; `CategoryId` moves to `src/lib/rules.ts`.
- **Rationale**: FR-001 empties the shipped data. An empty constant that is merged with stored data on every read is exactly "config for constant values" (constitution I), and deleting is preferred over adding. Pages and tests that depended on samples must be rewritten anyway.
- **Alternatives**: keep `config.ts` with empty lists (dead abstraction plus a merge step for nothing); keep it as a place to put future samples (speculative).

## R2. Role representation

- **Decision**: keep the stored shape per category `{ first: string[], middle: string[] }`, with the invariant that every first name is also in `middle`. "Middle only" is derived: `middle` minus `first` (case-insensitive).
- **Rationale**: FR-013 requires saved data to keep working, so no migration. It also matches 002's rule that a first name is always a middle name. Promote appends to `first`; demote removes from `first`; delete removes from both.
- **Alternatives**: store `{ name, role }` entries (needs a migration of saved data and a rewrite of every reader).

## R3. Ordering (clarified: alphabetical, ignoring case)

- **Decision**: one `tidy` step, applied on load and by every writing function (`addName`, `promote`, `demote`, `removeName`), that dedupes case-insensitively and sorts each list with `localeCompare(b, 'en', { sensitivity: 'base' })`. Readers never sort.
- **Rationale**: lists are small; sorting at write/load keeps reads trivial and gives FR-014 for free, because combinations iterate the sorted `middle` list. A moved name lands in its alphabetical place without special handling. `tidy` on load also re-sorts data saved by 002 (insertion order) and protects against hand-edited duplicates, which replaces what `merge` used to do.
- **Alternatives**: sort at render in each page (three places to remember); insertion order (rejected in clarification).

## R4. Delete confirmation

- **Decision**: `window.confirm(`Delete ${name}?`)` inside `DeleteButton`; cancel returns without any state change.
- **Rationale**: platform feature, keyboard operable, announced by assistive technology, zero code for focus handling (constitution I and accessibility basics). Satisfies FR-006 and SC-001 (two selections: Delete, OK).
- **Alternatives**: inline "Delete? Yes / Cancel" state (more state and focus management); `<dialog>` (more markup and handling for the same outcome); undo toast (rejected in clarification).

## R5. Redirect after deleting on a name page

- **Decision**: `DeleteButton` takes an optional `onDeleted`; `NamePage` passes `() => navigate(`/${category}`)` using wouter's `useLocation`.
- **Rationale**: FR-004. The page would otherwise re-render as "Name not found" because its name no longer exists.
- **Alternatives**: leave the visitor on "Name not found" (rejected by FR-004).

## R6. Promote validation

- **Decision**: `promote` reuses the slug checks that `addName` applies to first names (empty slug, clash with an existing first name), extracted into one helper so both give the same messages. Demote cannot fail.
- **Rationale**: FR-008, FR-011 and constitution I (one rule, one place).
- **Alternatives**: duplicate the checks (drift risk).

## R7. Dead role check

- **Decision**: remove the "Choose how to use this name." check and message from `addName`; its `role` parameter becomes `Role`, not `Role | undefined`.
- **Rationale**: with a default selection (FR-009) and radios that can't be unselected, no input reaches that branch. Unreachable code and its test go (constitution I).
- **Alternatives**: keep as defensive code (untestable through the UI; the type already forbids it).

## R8. Control labels

- **Decision**: real `<button type="button">` elements. Delete: visible "Delete", `aria-label="Delete {name}"`. Move: visible "Make middle only" or "Make first and middle", `aria-label="{visible text}: {name}"`.
- **Rationale**: FR-003 and FR-012. Each accessible name contains its visible text (label-in-name) and the name it acts on.
- **Alternatives**: visually hidden spans (more markup, same result).

## R9. Testing without a DOM library

- **Decision**: pure functions tested directly; pages via `renderToString` with the store seeded: group headings, per-name buttons and their `aria-label`s, absence of sample names, default checked radio, empty state. Click handlers (confirm, save, redirect, promote error) have no automated test.
- **Rationale**: no new dev dependency (constitution I); handlers are three-line glue over tested functions.
- **Residual risk**: confirm-cancel, redirect after delete and the promote error display are checked only by the manual steps in [quickstart.md](quickstart.md).
- **Alternatives**: `@testing-library/react` + jsdom (new dev dependencies for ~4 handlers).

## R11. Telling the visitor when a change can't be saved

- **Decision**: a small `persist(next)` helper in `src/lib/store.ts`: `if (!store.save(next)) window.alert('Saved for this visit only. Browser storage is unavailable.')`. `DeleteButton` and `MoveButton` use it.
- **Rationale**: the spec edge case requires the visitor to be told. An inline message would vanish with the deleted item or the redirected page, and carrying notice state up to every page is more code than one `alert`. The add and last-name forms keep their inline notices (their elements stay mounted).
- **Alternatives**: per-page notice state with callbacks (more plumbing); silent failure (violates the edge case).

## R10. Radio default and reset

- **Decision**: `useState<Role>('both')` in `AddNameForm`; after a successful add call `setRole('both')`; a rejected add returns before touching state, so the current choice and typed name stay.
- **Rationale**: FR-009 and the clarification. A rejected add already returns early today.
