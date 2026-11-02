# UI Contract: Manage Names

Routes and header unchanged ([001](../../001-name-routing/contracts/routes.md), [003](../../003-nav-header/contracts/ui.md)).

## `/<category>`

- Order: add-name form (or last-name prompt when unset), then groups.
- If both groups are empty: "No {category}’ names yet. Add the first one above." (or "…Set your last name above, then add the first one." when no last name is set).
- Otherwise each non-empty group is a heading plus a list; names in alphabetical order, case ignored:

| Group heading | Item content | Controls per item |
|---|---|---|
| "First names" | one full-width tappable row linking to `/<category>/<slug>`: "{First} {Last name}" (just "{First}" when no last name is set), then "›" (no per-row count: every first name has the same number of combinations) | **Make middle only**, **Delete**, inside the row's "⋯" menu |
| "Middle names only" | name as a plain row (no link) | **Make first and middle**, **Delete**, inside the row's "⋯" menu |

- Controls appear whether or not a last name is set.
- Each item is one flex row (`li.name-row`): the name row (link or text), then a `<details class="row-menu">` whose `<summary aria-label="Actions for {name}">⋯</summary>` opens a small card holding the two buttons. Rows, the ⋯ target and menu buttons are at least 44 px tall. On a name page the lone Delete is small on wide screens and 44 px tall on phones.

## Controls

| Control | Visible text | `aria-label` | Behaviour |
|---|---|---|---|
| Delete | `Delete` | `Delete {name}` | opens a themed dialog "Delete {name}?" with Cancel (focused first) and Delete; Delete removes the name from this category, Cancel/Escape/outside click do nothing. On a name page, Delete then navigates to `/<category>` |
| Demote | `Make middle only` | `Make middle only: {name}` | Moves the name to the middle-only group; its page stops existing |
| Promote | `Make first and middle` | `Make first and middle: {name}` | Moves the name to the first-and-middle group. On a clash shows `{name} clashes with {existing}, which has the same page address.` in `role="alert"` next to the control; nothing changes |

All are `<button type="button">`. If a delete or move cannot be persisted, `window.alert("Saved for this visit only. Browser storage is unavailable.")` is shown after the change applies.

## `/<category>/<slug>` (found)

- Header band: the name, with "{n} combinations" / "1 combination" / "No combinations yet" under it. Combinations are soft cards, "{First} **{Middle}** {Last}", in alphabetical order of middle name; with none, "Add more middle names to the {category} list to see full names."; or the last-name prompt.
- Adds a Delete control (same label and behaviour as above) after the content.
- No other navigation or role-change controls (003, FR-007 here).

## Add-name form

- One compact row (`div.add-row`): name text input (`aria-label="Name"`, placeholder "Name"), role dropdown (`<select aria-label="Use as">`), then the **Add name** button. On narrow screens the row wraps.
- Dropdown options: "First and middle name" (`both`, **selected** on first display and again after each successful add) and "Middle name only" (`middle`). No radios or fieldset.
- Rejected add: typed name and dropdown choice unchanged; error in `role="alert"` below the row.
- Successful add: `role="status"` "Added {name} as a first and middle name." / "…as a middle name only.", cleared as soon as the visitor types again.
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
