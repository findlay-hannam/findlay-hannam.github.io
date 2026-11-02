# UI Contract: Navigation Header

> Amended by 005-last-name-modal: "Set Last Name" now opens a modal (it is a button; Boys and Girls stay links) instead of linking to `/`, which is now a static homepage.

Routes are unchanged from [001](../../001-name-routing/contracts/routes.md); page content changes as below.

## Header (every route, including not-found)

- Exactly one `<nav aria-label="Main">` containing a list of three links, in order:

| Label | `href` |
|---|---|
| Boys | `/boys` |
| Girls | `/girls` |
| Set Last Name | `/` |

- Rendered outside the route switch; identical on every page; real anchors.
- Site title (`h1`) and tagline: removed after 003 to save space (see below). The nav is centred.

## Page content changes

| Page | Before | After |
|---|---|---|
| `/` | Last-name form plus a Boys/Girls link list | Last-name form only (visible text "Last name") |
| `/<category>` | Add-name form or prompt, name list | Unchanged (names still link to their pages) |
| `/<category>/<slug>` | Combinations, then "Back to the {category} list" | Combinations only |
| `/<category>/<slug>` (unknown) | "Name not found" and a back link | "Name not found" only |
| anything else | "Page not found" and "Back home" | "Page not found" only |

## Visible wording

"Surname" → "Last name": form label, button ("Save last name"), `/` lead-in and status line, and validation messages ("Enter a last name.", "Last name must be 50 characters or fewer.").

> Amended after 003: the "Baby Names / Combine, organise and list names." heading is removed, the header holds only the nav, and the nav is centred (`src/app.css`). `index.html` keeps `<title>Baby Names</title>`.

> Amended after 005: the pill for the section you are in carries `aria-current` (`page` on its list, `true` on one of its name pages) and a ring; the nav is otherwise identical on every page. Every page sets its own `<title>` (e.g. "Boys names · Baby Names", "Oliver · Baby Names").
