# Quickstart: Manage Names

## Prerequisites

`pnpm install`

## Automated

```sh
pnpm test    # pure functions, store load/tidy, page structure
pnpm lint
pnpm build
```

Expect: all green, coverage ≥ 80% lines on `src/lib` and `src/pages`.

## Manual (click handlers have no automated test)

Run `pnpm dev`, open the printed URL in a fresh private window. Set last name "Smith" on `/`.

| # | Do | Expect |
|---|---|---|
| 1 | Open `/boys` | "No names yet."; add form with "First and middle name" selected; no sample names |
| 2 | Open `/boys/oliver` | "Name not found" |
| 3 | Add "Noah" without touching the radios | Appears under "First names (Click to see with middle names)" as a link |
| 4 | Select "Middle name only", add "Lee", then look at the form | "Lee" appears under "Middle names only" (not a link); form is back on "First and middle name" |
| 5 | Add "Ada", "noah" | "Ada" listed before "Noah" (alphabetical); "noah" rejected as already existing, typed text and radio unchanged |
| 6 | Open `/boys/noah` | Combinations "Noah Ada Smith", "Noah Lee Smith" in that order; no "Noah Noah Smith" |
| 7 | On `/boys` select "Make middle only: Ada" | Ada moves to the middle-only group; `/boys/ada` shows "Name not found"; still appears in Noah's combinations |
| 8 | Select "Make first and middle: Ada" | Ada returns to the linked group in alphabetical place |
| 9 | Add "Mary Ann" as Middle name only, add "Mary-Ann" as First and middle, then select "Make first and middle: Mary Ann" | Both adds accepted; promote shows "Mary Ann clashes with Mary-Ann, which has the same page address."; nothing changes |
| 10 | Select Delete on "Lee", press Cancel | Nothing changes |
| 11 | Select Delete on "Lee", press OK | Lee gone from lists and every combination; refresh keeps it gone |
| 12 | Open `/boys/noah`, select Delete, OK | Taken to `/boys`; Noah gone |
| 13 | Open `/girls` | None of the boys changes visible |
| 14 | Tab to a Delete button, press Enter, answer the dialog from the keyboard | Works without a mouse; screen reader names the person ("Delete Noah") |
| 15 | With old data from 002 in storage (unsorted names) and reload | Lists appear alphabetical; no names lost |
| 16 | Block site storage, delete a name | Name disappears; an alert says changes last for this visit only |
