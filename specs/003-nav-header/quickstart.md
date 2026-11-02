# Quickstart: Navigation Header

## Prerequisites

`pnpm install`

## Automated

```sh
pnpm test    # includes header and removed-link assertions
pnpm lint
pnpm build
```

Expect: all green, coverage ≥ 80% lines on `src/lib` and `src/pages`.

## Manual (layout cannot be asserted by server-render tests)

Run `pnpm dev`, open the printed URL.

| # | Do | Expect |
|---|---|---|
| 1 | Open `/` | Header with Boys, Girls, Set Last Name; last-name form below; no Boys/Girls list in the page body |
| 2 | Select Boys, then a name | List, then combinations; header still present; no "Back to…" link under the combinations |
| 3 | Select Set Last Name | `/` opens with the form |
| 4 | Open `/nope` and `/boys/nope` | Header present; no "Back home" or "Back to…" link |
| 5 | Deep-link `/girls/ada` in a fresh tab, refresh, bookmark and reopen | Header present each time |
| 6 | Browser back and forward across steps 1–3 | Header stays; no full reload |
| 7 | Tab through the header | Each of the three links focuses in order; Enter follows it |
| 8 | Resize to a 320 px wide window | Three options visible; no horizontal page scroll |
| 9 | Look for the words "surname" on `/` and the add/last-name forms | None visible; "Last name" used |
