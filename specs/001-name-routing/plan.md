# Implementation Plan: Name Routing

**Branch**: `001-name-routing` | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-name-routing/spec.md`

## Summary

Add client-side routing for `/`, `/boys`, `/girls` and `/<category>/<slug>`. Names come from
a typed, checked-in config. A name page shows the cross-product of that first name with the
category's middle names plus one fixed surname. Pure logic (slugify, combinations, lookup)
is unit-tested first; pages are tested via server-render, so no DOM test library is needed.
Deep links on GitHub Pages work via a `404.html` copy of `index.html` made at build time.

## Technical Context

**Language/Version**: TypeScript (strict), React 19, Node 22

**Primary Dependencies**: `wouter` (router, ~2 kB gzipped), `@picocss/pico` (already added)

**Storage**: N/A. Static typed config in `src/data/config.ts`

**Testing**: Vitest; logic as pure unit tests, pages via `react-dom/server` `renderToString`; `@vitest/coverage-v8` added for the 80% gate

**Target Platform**: Static site on GitHub Pages (user site, served at `/`)

**Project Type**: Single-page web app (static)

**Performance Goals**: Page changes under 1 s (SC-004); no network on navigation

**Constraints**: Zero runtime cost; no backend; initial JS lean (<50 kB gzipped added per dependency)

**Scale/Scope**: Tens to low hundreds of names; four route shapes

## Constitution Check

*GATE: pass before Phase 0; re-checked after Phase 1.*

| Principle | Status | Evidence |
|---|---|---|
| Purpose & Scope | ✅ | Lists names (*list*) and shows first×middle combinations (*combine*); no accounts or backend |
| I. Minimalism | ✅ | One dependency (`wouter`), justified in [research.md](research.md) R1; no state library, no config layer |
| II. React + strict TS | ✅ | Function components, strict types, `pnpm build` + `pnpm lint` stay green |
| III. Test-first | ✅ | Logic modules built red-green; coverage tool added to enforce 80% (task) |
| IV. Speedy deploys | ✅ | Only adds a file copy to the build; no new CI steps beyond coverage-in-test |
| V. Zero runtime cost | ✅ | Static data, no network calls |
| Technical Constraints: accessibility | ✅ | Semantic landmarks (Pico), real `<a href>` links, headings and lists; asserted in page tests (CategoryList, NamePage) |

**Post-design re-check**: unchanged, all ✅. No Complexity Tracking entries.

## Project Structure

### Documentation (this feature)

```text
specs/001-name-routing/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── routes.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── main.tsx
├── App.tsx              # layout shell + <Switch> of routes
├── data/
│   ├── config.ts        # typed names config (boys, girls, surname)
│   └── config.test.ts   # invariants: unique, non-empty slugs
├── lib/
│   ├── slug.ts          # slugify
│   ├── names.ts         # firstNames, findName, combinations
│   ├── names.test.ts
│   └── slug.test.ts
├── test/
│   └── renderAt.tsx     # SSR render helper for page tests
└── pages/
    ├── Home.tsx
    ├── CategoryList.tsx
    ├── NamePage.tsx
    ├── NotFound.tsx
    └── *.test.tsx       # renderToString route tests, one per page
```

**Structure Decision**: single project. Logic lives in `src/lib` (pure, test-first); `src/pages` is thin presentational React.

## Complexity Tracking

No violations.
