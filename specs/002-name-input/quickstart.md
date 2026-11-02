# Quickstart: Name Input

## Prerequisites

`pnpm install`

## Automated

```sh
pnpm test    # rules, store, pages (gates push and deploy)
pnpm lint
pnpm build
```

Expect: all green, coverage ≥ 80% lines on `src/` logic.

## Manual (covers form wiring that server-render tests cannot)

Run `pnpm dev`, open the printed URL in a fresh private window.

| # | Do | Expect |
|---|---|---|
| 1 | Open `/` | Surname prompt shown |
| 2 | Submit empty | "Enter a surname."; nothing saved |
| 3 | Submit "Smith" | Prompt replaced by "Smith" with a change form; refresh keeps it |
| 4 | Clear site data, open `/girls` directly | Surname prompt instead of add form; list still shown |
| 5 | Save "Smith" there | Add form appears, no navigation |
| 6 | Open `/boys/oliver` after clearing data | Prompt instead of combinations; save → combinations "Oliver James Smith" appear in place |
| 7 | On `/boys` add "Noah" as First and middle | Appears in list; `/boys/noah` works; `/boys/oliver` shows "Oliver Noah Smith" |
| 8 | On `/boys` add "Lee" as Middle name only | Not in list; `/boys/oliver` shows "Oliver Lee Smith" |
| 9 | Add "noah" again as First and middle | "noah is already in the boys names."; nothing added |
| 10 | Add "Lee" again as Middle name only | Duplicate message |
| 11 | Add "Lee" as First and middle | Duplicate message (already a middle name); nothing added |
| 11b | Add "Oliver" as Middle name only on `/boys` | Duplicate message (built-in first name) |
| 11c | Add "Fin" as First and middle, open `/boys/fin` | No "Fin Fin Smith"; "Fin Noah Smith", "Fin Lee Smith" etc. present |
| 11d | Submit Add name with empty Name | "Enter a name."; nothing added |
| 11e | Submit a 51-character name | "Name must be 50 characters or fewer." |
| 11f | Submit with no "Use as" chosen | "Choose how to use this name." |
| 11g | Add "Finn OBrien" as First and middle on `/boys` (built-in "Finn O'Brien") | Clash message naming "Finn O'Brien" |
| 11h | Complete rows 2 and 9 using keyboard only | Every control reachable and labelled; Enter submits |
| 11i | Trigger any rejection with a screen reader on | Message announced without moving focus |
| 12 | Open `/girls` | None of the boys additions present |
| 13 | Change surname to "Jones" | All combinations show "Jones" |
| 14 | Block site storage (browser setting), add a name | Name shows; notice says it is saved for this visit only |
