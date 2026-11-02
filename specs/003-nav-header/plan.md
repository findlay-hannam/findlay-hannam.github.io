# Implementation Plan: Navigation Header

**Branch**: `003-nav-header` | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-nav-header/spec.md`

## Summary

Add one `<nav>` to the existing site header in `App.tsx`, outside the route `<Switch>`, so it
renders on every page including not-found. Three real links: Boys (`/boys`), Girls (`/girls`),
Set Last Name (`/`). Delete the Boys/Girls list on the landing page and every "Back to…" and
"Back home" link in page content. Change visible "surname" wording to "last name". No new
files in `src/`, no new dependencies.

## Technical Context

**Language/Version**: TypeScript (strict), React 19, Node 22

**Primary Dependencies**: none new (`wouter` `Link`, `@picocss/pico` nav styles already present)

**Storage**: N/A (no data change)

**Testing**: Vitest; `renderToString` via existing `renderAt` helper; assertions on the rendered `<nav>` landmark and on absent links

**Target Platform**: Static site on GitHub Pages

**Project Type**: Single-page web app (static)

**Performance Goals**: In-app navigation without full page reload (SC-005), already true of `wouter` links

**Constraints**: Zero runtime cost; three items must fit a phone-width viewport without horizontal page scroll (FR-010)

**Scale/Scope**: One markup block added, four files with links removed, one wording change

## Constitution Check

*GATE: pass before Phase 0; re-checked after Phase 1.*

| Principle | Status | Evidence |
|---|---|---|
| Purpose & Scope | ✅ | *List*: one-step access to boys and girls lists. *Combine*: one-step access to the last name that combinations use. No accounts or backend |
| I. Minimalism | ✅ | Net deletion: three links and a list removed, one nav added. No new component, file or dependency; nav is inline in `App.tsx` |
| II. React + strict TS | ✅ | Function components; `pnpm build` and `pnpm lint` stay green |
| III. Test-first | ✅ | Page tests written first: header on every route, three links in order, absent back links. Existing tests that asserted removed links are rewritten, not deleted silently |
| IV. Speedy deploys | ✅ | No CI changes |
| V. Zero runtime cost | ✅ | No runtime calls |
| Technical Constraints: accessibility | ✅ | `<nav aria-label>` landmark, real anchors (keyboard operable), no new controls |

**Post-design re-check**: unchanged, all ✅. No Complexity Tracking entries.

## Project Structure

### Documentation (this feature)

```text
specs/003-nav-header/
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
├── App.tsx                        # CHANGED: <nav aria-label="Main"> in the site header
├── components/
│   └── SurnameForm.tsx            # CHANGED: visible text "Last name" / "Save last name"
├── lib/
│   ├── rules.ts                   # CHANGED: user-facing messages say "last name"
│   └── rules.test.ts              # CHANGED: expected messages
└── pages/
    ├── Home.tsx                   # CHANGED: remove Boys/Girls <nav>; "last name" wording
    ├── NamePage.tsx               # CHANGED: remove both "Back to the … list" links
    ├── NotFound.tsx               # CHANGED: remove "Back home"
    └── *.test.tsx                 # CHANGED: header assertions; link-removal assertions
```

**Structure Decision**: single project, no new modules. Internal identifiers (`surname`,
`SurnameForm`, `setSurname`) are not renamed: only visible text changes (research R5).

## Notes

- Amends 001 (FR-005 link-back requirements, FR-008 landing links) and edits 002's visible wording. History in those specs is left as written; the 003 spec's Assumptions record the amendment.
- `CLAUDE.md` still points at the 001 plan. Not updated: your global rules forbid automatic project `CLAUDE.md` writes.

## Complexity Tracking

No violations.
