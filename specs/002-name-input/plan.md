# Implementation Plan: Name Input

**Branch**: `002-name-input` | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-name-input/spec.md`

## Summary

Let the visitor enter a surname and add names per category, stored in `localStorage`. The
built-in surname is deleted; built-in names stay. A small store (React's built-in
`useSyncExternalStore` over one `localStorage` key) feeds pages a merged view: built-in
names plus added names, plus the surname. Rules (validation, duplicates, no self-pairing,
merging) are pure functions, built test-first. Pages without a surname show a prompt in
place of the add form (category) or combinations (name page); `/` shows the prompt or the
current surname. No new dependencies.

## Technical Context

**Language/Version**: TypeScript (strict), React 19, Node 22

**Primary Dependencies**: none new (`wouter`, `@picocss/pico` already present)

**Storage**: browser `localStorage`, single key `baby-names:v1`, all access in try/catch (constitution V)

**Testing**: Vitest; rules and store as pure unit tests (store takes an injectable `Storage`); pages via `renderToString` with the merged view seeded into the store (`seed()`), or passed as a `names` prop for direct renders. No DOM test library.

**Target Platform**: Static site on GitHub Pages

**Project Type**: Single-page web app (static)

**Performance Goals**: Added name visible immediately, no navigation (SC-005); sync work only

**Constraints**: Zero runtime cost; no backend; storage may be unavailable or corrupt (spec edge case)

**Scale/Scope**: One visitor, tens of added names; two new components, two new lib modules

## Constitution Check

*GATE: pass before Phase 0; re-checked after Phase 1.*

| Principle | Status | Evidence |
|---|---|---|
| Purpose & Scope | ✅ | *List* (added names appear in lists) and *combine* (they feed combinations); browser storage only, no accounts or backend |
| I. Minimalism | ✅ | No new dependency; `useSyncExternalStore` instead of a state library; built-in surname deleted (net removal); no edit/delete UI, no cross-tab sync |
| II. React + strict TS | ✅ | Function components and hooks; strict types; `pnpm build` and `pnpm lint` stay green |
| III. Test-first | ✅ | Rules and store built red-green; form components are thin markup (coverage-exempt), page states tested via server render |
| IV. Speedy deploys | ✅ | No CI changes |
| V. Zero runtime cost | ✅ | `localStorage` wrapped in try/catch; no network |
| Technical Constraints: accessibility | ✅ | Labelled inputs, radio group in `fieldset`/`legend`, errors in `role="alert"` (FR-013) |

**Post-design re-check**: unchanged, all ✅. No Complexity Tracking entries.

## Project Structure

### Documentation (this feature)

```text
specs/002-name-input/
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
├── data/
│   ├── config.ts        # CHANGED: drop `surname`; Config = Record<CategoryId, CategoryConfig>
│   └── config.test.ts   # CHANGED: drop surname assertion
├── lib/
│   ├── names.ts         # CHANGED: combinations takes surname; skips middle == first
│   ├── names.test.ts    # CHANGED
│   ├── rules.ts         # NEW: validate, addName, setSurname, merge (pure)
│   ├── rules.test.ts    # NEW
│   ├── store.ts         # NEW: localStorage-backed store + useNames hook
│   └── store.test.ts    # NEW: injected Storage; corrupt/unavailable cases
├── components/
│   ├── SurnameForm.tsx  # NEW: prompt (unset) / change (set)
│   └── AddNameForm.tsx  # NEW: name + role radios
└── pages/
    ├── Home.tsx         # CHANGED: surname prompt or surname + change
    ├── CategoryList.tsx # CHANGED: add form, or prompt when no surname
    ├── NamePage.tsx     # CHANGED: prompt in place of combinations when no surname
    └── *.test.tsx       # CHANGED: inject `names`; new unset-surname cases
```

**Structure Decision**: single project. Rules are pure in `src/lib/rules.ts`; the store is
the only code that touches `localStorage`; components hold only form state and call both.

## Notes

- 001's fixed surname is removed here (per clarification). Its spec text is left as history;
  this feature's FR-003 and Assumptions record the amendment.
- `CLAUDE.md` still points at the 001 plan. Not updated: your global rules forbid automatic
  project `CLAUDE.md` writes.

## Complexity Tracking

No violations.
