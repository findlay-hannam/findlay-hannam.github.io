# Implementation Plan: Last Name Modal and Homepage

**Branch**: `005-last-name-modal` | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-last-name-modal/spec.md`

## Summary

Turn the header's "Set Last Name" from a link to `/` into a button that opens a modal built on
the native `<dialog>` element (`showModal()`), which gives Escape-to-close, a focus trap, an
inert page behind and focus return for free. The modal reuses the existing last-name form
(prefilled, Save, plus a Close button) and closes itself after a persisted save. The modal is
mounted only while open, so server-rendered pages and existing tests stay clean. `/` becomes a
short, static homepage: a heading and at most two sentences, no form, no links. No new
dependencies and no data changes.

## Technical Context

**Language/Version**: TypeScript (strict), React 19, Node 22

**Primary Dependencies**: none new (native `<dialog>`; Pico already styles `dialog > article`)

**Storage**: unchanged (`localStorage` key `baby-names:v1`)

**Testing**: Vitest; `renderToString` for static markup (header items, homepage copy, the modal's markup rendered directly); open/close behaviour verified by a scratch headless-Chrome script and the manual table in the quickstart. No DOM test library.

**Target Platform**: Static site on GitHub Pages; evergreen browsers (`<dialog>` is baseline since 2022)

**Project Type**: Single-page web app (static)

**Performance Goals**: Modal opens instantly (sync); no network

**Constraints**: Zero runtime cost; no new dependency; fits 320 px wide screens (SC-004, FR-013)

**Scale/Scope**: One new component, three edited components, one page rewritten, CSS selectors extended

## Constitution Check

*GATE: pass before Phase 0; re-checked after Phase 1.*

| Principle | Status | Evidence |
|---|---|---|
| Purpose & Scope | ✅ | *Combine*: last name feeds every combination. *List*: clear start into the lists. Browser storage only |
| I. Minimalism | ✅ | Native `<dialog>` instead of a modal library or hand-rolled focus trap; existing `SurnameForm` reused; no new state library; the `/` page shrinks to static text |
| II. React + strict TS | ✅ | Function components and hooks; `pnpm build` and `pnpm lint` stay green |
| III. Test-first | ✅ | Markup contracts (header items, homepage copy and word count, modal contents) written as failing tests first. Open/close glue is thin and verified by the scripted browser check and manual rows (residual risk, research R9) |
| IV. Speedy deploys | ✅ | No CI changes |
| V. Zero runtime cost | ✅ | No new runtime calls |
| Technical Constraints: accessibility | ✅ | Native dialog semantics, labelled input, `role="alert"` errors, keyboard operable, focus managed by the platform |

**Post-design re-check**: unchanged, all ✅. No Complexity Tracking entries.

## Project Structure

### Documentation (this feature)

```text
specs/005-last-name-modal/
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
├── App.tsx                          # CHANGED: Set Last Name is a <button>; `open` state; mounts the modal while open
├── app.css                          # CHANGED: .pill styles also for button; modal tweaks
├── components/
│   ├── LastNameModal.tsx            # NEW: <dialog> wrapper, showModal on mount, close paths
│   ├── LastNameModal.test.tsx       # NEW: markup of the modal rendered directly
│   └── SurnameForm.tsx              # CHANGED: optional onSaved(persisted) and onClose (adds Close button)
├── pages/
│   ├── Home.tsx                     # CHANGED: static homepage copy only
│   └── routes.test.tsx              # CHANGED: header items (2 links + 1 button), homepage tests
└── test/
    └── renderAt.tsx                 # CHANGED: navItems helper replaces navLinks
```

**Structure Decision**: single project. The modal's open state lives in `App`, next to the header button that opens it, and nowhere else.

## Notes

- Amends 002 (FR-001: last-name prompt on `/`) and 003 (FR-002/FR-004 destination `/` for Set Last Name; US1 scenario 3; the nav is three links). The label and position stay.
- `CLAUDE.md` still points at the 001 plan. Not updated: your global rules forbid automatic project `CLAUDE.md` writes.

## Complexity Tracking

No violations.
