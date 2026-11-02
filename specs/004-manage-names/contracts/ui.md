# UI Contract: Manage Names

Routes and header unchanged ([001](../../001-name-routing/contracts/routes.md), [003](../../003-nav-header/contracts/ui.md)).

## `/<category>`

- Order: add-name form (or last-name prompt when unset), then groups.
- If both groups are empty: "No names yet."
- Otherwise each non-empty group is a heading plus a list; names in alphabetical order, case ignored:

| Group heading | Item content | Controls per item |
|---|---|---|
| "First names (Click to see with middle names)" | link to `/<category>/<slug>` reading "{First} {Last name}" (just "{First}" when no last name is set) | **Make middle only**, **Delete** |
| "Middle names only" | name as plain text (no link) | **Make first and middle**, **Delete** |

- Controls appear whether or not a last name is set.
- Each item is one flex row (`li.name-row`): the name or link first, then the buttons beside it, left aligned, in a small secondary style (`src/app.css`).

## Controls

| Control | Visible text | `aria-label` | Behaviour |
|---|---|---|---|
| Delete | `Delete` | `Delete {name}` | `window.confirm("Delete {name}?")`; OK removes the name from this category, Cancel does nothing. On a name page, OK then navigates to `/<category>` |
| Demote | `Make middle only` | `Make middle only: {name}` | Moves the name to the middle-only group; its page stops existing |
| Promote | `Make first and middle` | `Make first and middle: {name}` | Moves the name to the first-and-middle group. On a clash shows `{name} clashes with {existing}, which has the same page address.` in `role="alert"` next to the control; nothing changes |

All are `<button type="button">`. If a delete or move cannot be persisted, `window.alert("Saved for this visit only. Browser storage is unavailable.")` is shown after the change applies.

## `/<category>/<slug>` (found)

- Unchanged content (combinations in alphabetical order of middle name, or the last-name prompt).
- Adds a Delete control (same label and behaviour as above) after the content.
- No other navigation or role-change controls (003, FR-007 here).

## Add-name form

- One compact row (`div.add-row`): name text input (`aria-label="Name"`, placeholder "Name"), role dropdown (`<select aria-label="Use as">`), then the **Add name** button. On narrow screens the row wraps.
- Dropdown options: "First and middle name" (`both`, **selected** on first display and again after each successful add) and "Middle name only" (`middle`). No radios or fieldset.
- Rejected add: typed name and dropdown choice unchanged; error in `role="alert"` below the row.
- Removed message: "Choose how to use this name." (no longer reachable).

## Fresh visitor

No names anywhere: `/boys`, `/girls` show "No names yet."; any `/<category>/<slug>` shows "Name not found" (including former sample addresses such as `/boys/oliver`).

## Storage

Key `baby-names:v1`, shape as in [data-model.md](../data-model.md), unchanged.

## Look and feel (added after 004)

- `src/App.tsx` wraps the page in `<div class="app" data-category="boys|girls|home">`, from the first path segment (case-insensitive); anything that is not `/boys…` or `/girls…` is `home`.
- `src/app.css` maps three palettes onto Pico's CSS variables: baby blue (boys), baby pink (girls), warm cream (home, not-found). Page background tinted, content in a white rounded card with a solid accent header band, pill-shaped buttons, system rounded font stack (no web fonts). Every text/background pair is at least 4.5:1.
- Nav links are colour-coded pills by destination: Boys blue, Girls pink, Set Last Name cream (`pill pill-boys|pill-girls|pill-home`).
- `index.html` sets `data-theme="light"` so Pico's dark mode never fights the pastel palette.
