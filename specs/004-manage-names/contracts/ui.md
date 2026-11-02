# UI Contract: Manage Names

Routes and header unchanged ([001](../../001-name-routing/contracts/routes.md), [003](../../003-nav-header/contracts/ui.md)).

## `/<category>`

- Order: add-name form (or last-name prompt when unset), then groups.
- If both groups are empty: "No names yet."
- Otherwise each non-empty group is a heading plus a list; names in alphabetical order, case ignored:

| Group heading | Item content | Controls per item |
|---|---|---|
| "First and middle names" | name as a link to `/<category>/<slug>` | **Make middle only**, **Delete** |
| "Middle names only" | name as plain text (no link) | **Make first and middle**, **Delete** |

- Controls appear whether or not a last name is set.

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

- Radios: "First and middle name" **checked** on first display and again after each successful add; "Middle name only" unchecked.
- Rejected add: typed name and radio choice unchanged; error in `role="alert"`.
- Removed message: "Choose how to use this name." (no longer reachable).

## Fresh visitor

No names anywhere: `/boys`, `/girls` show "No names yet."; any `/<category>/<slug>` shows "Name not found" (including former sample addresses such as `/boys/oliver`).

## Storage

Key `baby-names:v1`, shape as in [data-model.md](../data-model.md), unchanged.
