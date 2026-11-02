# Quickstart: Validate Name Routing

## Prerequisites
- `pnpm install`
- Sample data in `src/data/config.ts` with at least two boys, one girl, two middle names per category, one surname.

## Automated
```sh
pnpm test      # unit + route tests, with coverage gate (>= 80%)
pnpm lint
pnpm build     # also produces dist/404.html
```
Expected: all green; `dist/404.html` exists and matches `dist/index.html`.

## Manual (browser)
```sh
pnpm build && pnpm preview
```
1. Open `/` → links to Boys and Girls. 
2. `/boys` → only boys names; `/girls` → only girls names.
3. Click a name → `/boys/<slug>` shows one `First Middle Surname` per boys middle name.
4. Back button returns to `/boys`.
5. Refresh on `/boys/<slug>` → page still renders.
6. `/boys/does-not-exist`, `/girls/<a-boys-slug>`, `/nope` → not-found with a way back.
7. `/Boys` and `/boys/` → same as `/boys`.

## Post-deploy
Repeat steps 2, 3 and 5 on the live site (Pages serves `404.html` for deep links).

See [contracts/routes.md](contracts/routes.md) and [data-model.md](data-model.md).
