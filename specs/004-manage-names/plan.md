# Implementation Plan: Manage Names

**Branch**: `004-manage-names` | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-manage-names/spec.md`

## Summary

Add delete (with a confirm) and promote/demote of names, show middle-only names in their own
group, preselect "First and middle name", and ship no sample names. Removing the samples
leaves the built-in config empty, so the config module and the merge step are deleted: the
visitor's stored lists become the only data. Lists are kept deduped and alphabetical (case
ignored) on every write and on load, which also orders combinations. New pure functions
(`removeName`, `demote`, `promote`, `tidy`) are built test-first; two small button
components call them. Storage shape and key are unchanged, so existing saved names survive.

## Technical Context

**Language/Version**: TypeScript (strict), React 19, Node 22

**Primary Dependencies**: none new (`wouter`: `useLocation` for the redirect after deleting on a name page)

**Storage**: `localStorage`, key `baby-names:v1`, shape unchanged ([data-model.md](data-model.md))

**Testing**: Vitest; pure functions unit-tested; pages via `renderToString` with the store seeded or a `names` prop. No DOM test library.

**Target Platform**: Static site on GitHub Pages

**Project Type**: Single-page web app (static)

**Performance Goals**: Changes visible immediately, no reload (FR-010); sync work only

**Constraints**: Zero runtime cost; no backend; native `window.confirm` for the delete confirmation (no modal library)

**Scale/Scope**: One visitor, tens of names; two new components, three new pure functions, one module deleted

## Constitution Check

*GATE: pass before Phase 0; re-checked after Phase 1.*

| Principle | Status | Evidence |
|---|---|---|
| Purpose & Scope | ✅ | *Organise* (delete, re-role), *list* (grouped lists), *combine* (feeds combinations). Browser storage only |
| I. Minimalism | ✅ | Net deletion: `src/data/config.ts` (+ test), `merge`, the `Names` type and `cfg` plumbing, and the now-unreachable "Choose how to use this name" check go. `window.confirm` instead of a modal. No new dependency |
| II. React + strict TS | ✅ | Function components and hooks; `pnpm build` and `pnpm lint` stay green |
| III. Test-first | ✅ | All new logic is pure and built red-green; page structure asserted by server render; handler wiring covered by manual steps (residual risk, research R9) |
| IV. Speedy deploys | ✅ | No CI changes |
| V. Zero runtime cost | ✅ | No new runtime calls; storage access stays in try/catch |
| Technical Constraints: accessibility | ✅ | Real `<button>`s with accessible names containing the name; alerts in `role="alert"`; native confirm is keyboard operable |

**Post-design re-check**: unchanged, all ✅. No Complexity Tracking entries.

## Project Structure

### Documentation (this feature)

```text
specs/004-manage-names/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── data/                          # DELETED (config.ts, config.test.ts)
├── lib/
│   ├── rules.ts                   # CHANGED: CategoryId/Lists/Stored live here; tidy, removeName, demote, promote; sorted addName; merge, Names, role-missing check removed
│   ├── rules.test.ts              # CHANGED
│   ├── names.ts                   # CHANGED: operate on one category's Lists; adds middleOnly
│   ├── names.test.ts              # CHANGED
│   ├── store.ts                   # CHANGED: parse runs tidy; useNames returns Stored; no merge; persist() helper (alert when unsaved)
│   └── store.test.ts              # CHANGED: sorted/deduped on load
├── components/
│   ├── AddNameForm.tsx            # CHANGED: role state defaults to 'both', resets after add; no config arg
│   ├── DeleteButton.tsx           # NEW: confirm, removeName, optional onDeleted
│   └── MoveButton.tsx             # NEW: promote/demote, shows promote error
└── pages/
    ├── CategoryList.tsx           # CHANGED: two groups, controls, empty state
    ├── NamePage.tsx               # CHANGED: Stored data; Delete button; redirect after delete
    └── *.test.tsx                 # CHANGED: seed names instead of relying on samples
```

**Structure Decision**: single project. Rules stay pure in `src/lib`; components only confirm, call a rule, and save to the store.

## Notes

- Amends 001 (FR-009 shipped configuration, sample data) and 002 (editing/removing out of scope, "upgrade" impossible, no radio preselected). Their text stays as history; the 004 spec's Assumptions record the amendment.
- `CLAUDE.md` still points at the 001 plan. Not updated: your global rules forbid automatic project `CLAUDE.md` writes.

## Complexity Tracking

No violations.
