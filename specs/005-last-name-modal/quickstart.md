# Quickstart: Last Name Modal and Homepage

## Prerequisites

`pnpm install`

## Automated

```sh
pnpm test    # header items, homepage copy, modal markup
pnpm lint
pnpm build
```

Expect: all green, coverage ≥ 80% lines on `src/lib` and `src/pages`.

## Scripted browser check (scratch script, outside the repo)

A small Node script drives headless Chrome over the DevTools protocol against `pnpm build && pnpm preview`: it seeds `localStorage`, clicks controls, sends Escape, reads `document.activeElement`, `location.pathname` and the saved value, and takes screenshots. It covers rows 2–9 below. Run it, then look at the screenshots for rows 1 and 11.

## Manual / scripted rows

Run `pnpm dev` (or `pnpm preview`), open the printed URL in a fresh private window.

| # | Do | Expect |
|---|---|---|
| 1 | Open `/` | Short "what this is for" text (≤ 2 sentences); no form; no links in the content; header has Boys, Girls, Set Last Name |
| 2 | Click Set Last Name on `/boys` | Modal opens; address still `/boys`; page behind unchanged; input focused |
| 3 | Type "Smith", click Save last name | Modal closes; focus is back on Set Last Name; "Oliver Smith"-style names show `Smith` without reload |
| 4 | Open the modal again | Input shows "Smith" |
| 5 | Clear the input, Save | "Enter a last name."; modal stays open; saved name still "Smith" after closing |
| 6 | Type "Jones" then click Close | Closes; saved name still "Smith"; reopening shows "Smith" (typed text gone) |
| 7 | Type "Jones" then press Escape | Same as row 6; focus returns to the button |
| 8 | Type "Jones" then click outside the card | Same as row 6 |
| 9 | Tab repeatedly with the modal open (scripted in T010) | Focus stays inside the modal; Shift+Tab wraps; page behind unreachable |
| 10 | Open the modal on a not-found page (`/nope`) and on `/girls/ada` | Opens on both |
| 11 | Resize to 320 px wide | Homepage text fully visible without scrolling; modal fits, no horizontal scroll |
| 12 | With no last name, open `/girls` | In-page last-name prompt still shown; saving it updates the modal's prefilled value next time |
| 13 | Block site storage, save in the modal | Notice "Saved for this visit only…" appears; modal stays open until closed |
| 14 | Open the modal, press the browser back button | Leaves the page as usual; no modal left open |
