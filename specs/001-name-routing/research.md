# Research: Name Routing

## R1. Router
- **Decision**: `wouter`.
- **Rationale**: ~2 kB gzipped, hooks API, supports `/boys/:slug`, optional trailing slash, and SSR via `ssrPath` (used for tests). Meets Minimalism better than a full router.
- **Alternatives**: React Router (large, loaders/data APIs unused); hand-rolled History API router (~30 lines but re-implements links, params, popstate: more code to test than a 2 kB dependency); hash routing (breaks the required `/boys` URLs).

## R2. Deep links on GitHub Pages
- **Decision**: Build step copies `dist/index.html` to `dist/404.html`. Pages serves it for unknown paths, so the router boots and renders the right page.
- **Rationale**: Zero cost, no server, satisfies FR-006.
- **Alternatives**: Pre-render every route to static HTML (needs an SSG tool, heavier); query-string redirect trick (ugly URLs).
- **Known limit**: Pages returns HTTP 404 for those loads. Fine for a hobby site; revisit if SEO matters. Not a user-visible problem.

## R3. Data source
- **Decision**: Typed TS module `src/data/config.ts` exporting `{ surname, boys: { first[], middle[] }, girls: { first[], middle[] } }`.
- **Rationale**: Type-checked at build, tree-shaken, no fetch, no parsing. Matches clarified model (per-category middle names, one surname).
- **Alternatives**: JSON file (no type safety without extra step); fetch at runtime (network, loading states).

## R4. Slugs and uniqueness
- **Decision**: `slugify` lowercases, strips accents (NFD), drops apostrophes, replaces other non-alphanumerics with `-`, trims dashes. A config test asserts slugs are unique per category (FR-010), so a collision fails `pnpm test` in pre-push and CI.
- **Rationale**: "Rejected or flagged" is met at build/test time with no runtime code.
- **Alternatives**: Runtime dedupe (hides the problem).

## R5. Testing pages without a DOM
- **Decision**: `renderToString` with wouter's `<Router ssrPath>`; assert on the HTML string.
- **Rationale**: No jsdom or Testing Library dependencies; covers routing, not-found, empty states.
- **Alternatives**: jsdom + Testing Library (adds two or three dev deps; defer until interaction tests are needed).
- **Not covered by unit tests**: real browser back/forward and clicks (wouter's own responsibility); covered by the manual quickstart.

## R6. Case and trailing slash
- **Decision**: Render in place, no redirect (a static host cannot redirect anyway). Rely on wouter for trailing slash; lowercase the path before matching if wouter is case-sensitive (confirmed by the first red test).
- **Status**: Decided; implementation detail verified by the US3 route tests.

## R7. Coverage gate
- **Decision**: Add `@vitest/coverage-v8` with an 80% lines threshold on `src/lib` and `src/pages`; `pnpm test` runs with coverage.
- **Rationale**: Constitution Principle III makes 80% mandatory; today nothing enforces it.
