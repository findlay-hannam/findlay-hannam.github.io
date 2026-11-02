# Research: Name Input

## R1. Sharing state across pages without a library

- **Decision**: a module-level store read with React's `useSyncExternalStore` (`subscribe`, `getSnapshot`, `getServerSnapshot`). Snapshot is the parsed state, cached and replaced (new object) on each write so React sees a change.
- **Rationale**: built into React 19, zero bytes added, works with `renderToString` in tests (`getServerSnapshot` = `getSnapshot`; tests seed the store). Constitution I and II: no state library until local state fails; it does here because a form on one page changes lists on another, and a page can change under `wouter` without remount.
- **Alternatives**: React context + `useState` (needs a provider and a second copy of the persistence code); zustand/jotai (new dependency); per-component `useState` + read on mount (stale after navigation).

## R2. Persistence format

- **Decision**: one key `baby-names:v1`, value is JSON of the stored shape in [data-model.md](data-model.md). Any read or parse failure, or a shape mismatch, is treated as empty state (never throws). Write failure keeps the in-memory state and reports `persisted: false` so the form can tell the visitor.
- **Rationale**: constitution V requires try/catch; spec edge case requires a visible message rather than silent failure. A version suffix makes a later migration possible without code now.
- **Alternatives**: IndexedDB (async, overkill for a few strings); one key per field (more reads, torn state).

## R3. Role model

- **Decision**: store added names as two lists per category, `first` and `middle`. "First and middle" appends to both; "middle only" appends to `middle`. The merged view is built-in plus added, deduped case-insensitively.
- **Rationale**: matches the existing `CategoryConfig` shape, so `firstNames` and `combinations` keep working unchanged on a merged `Config`. Spec: the first-and-middle role means the name is used as both.
- **Alternatives**: list of `{name, role}` entries (needs translation to lists on every read).

## R4. Validation and duplicate rules

- **Decision**: input trimmed; rejected if empty or over 50 characters. Rejected as duplicate if the lower-cased name equals any first or middle name in that category (built-in or added), whatever the role. For role "first and middle" also reject if its slug equals an existing first name's slug (collision). Slug via existing `slugify`.
- **Rationale**: FR-011 and the spec edge cases. One check, no upgrade path: simpler than role-aware rules, and matches "if Fin is already an option I shouldn't be able to submit it again". Reusing `slugify` keeps FR-010 consistent with 001.
- **Alternatives**: allow duplicates (duplicate combinations and duplicate React keys).

## R4b. No self-pairing

- **Decision**: `combinations` skips any middle name equal (case-insensitive) to the first name.
- **Rationale**: FR-015. Done in the one function that builds combinations, so built-in and added names are both covered and callers cannot forget it.
- **Alternatives**: filter at render time (every caller must remember); prevent such names being entered (built-in config can still contain them, and the user wants "Fin" usable as both).

## R5. Built-in surname removal

- **Decision**: delete `surname` from `Config` and `config.ts`; `combinations` takes the surname as a parameter; the surname lives only in the store.
- **Rationale**: clarification: "removed entirely". Removing the type field makes any leftover use a compile error.
- **Alternatives**: keep as a default (explicitly rejected).

## R6. Testing form behaviour without a DOM library

- **Decision**: all decisions live in pure functions (`rules.ts`, `store.ts` with injected `Storage`), tested directly. Pages tested with `renderToString`, the merged view seeded into the store (`seed()`) or passed as a `names` prop for direct renders. Form components are thin: controlled input, call rule, call store, show the returned error.
- **Rationale**: no new dev dependency (constitution I); presentational markup is coverage-exempt (III). Residual risk: submit wiring is not exercised by a test; covered by the manual steps in [quickstart.md](quickstart.md).
- **Alternatives**: `@testing-library/react` + jsdom (two or three dev dependencies for ~3 handlers).

## R7. Name page and `/` with no surname

- **Decision**: unset surname renders `SurnameForm` where combinations (name page) or the add form (category page) would be; on `/` it is the main content. Saving updates the store and the page re-renders in place (no navigation), satisfying FR-002, FR-014 and User Story 3.
- **Alternatives**: redirect to `/` (rejected in clarification).
