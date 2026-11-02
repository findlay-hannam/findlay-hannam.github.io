# UI Contract: Name Input

Routes are unchanged from [001](../../001-name-routing/contracts/routes.md). This adds forms and stored data.

## Per-route content

| Route | Surname unset | Surname set |
|---|---|---|
| `/` | `SurnameForm` (prompt) above the Boys/Girls links | Current surname shown with `SurnameForm` (change); Boys/Girls links |
| `/<category>` | `SurnameForm` instead of `AddNameForm`; list still shown | `AddNameForm` and the list |
| `/<category>/<slug>` (found) | `SurnameForm` instead of combinations | Combinations, as 001 |
| `/<category>/<slug>` (unknown) | Not found, as 001 | Not found, as 001 |

## SurnameForm

- Label: "Surname"; text input; submit "Save surname".
- Errors (`role="alert"`): "Enter a surname." / "Surname must be 50 characters or fewer."

## AddNameForm

- Label: "Name"; text input.
- `fieldset` + `legend` "Use as", radios, none preselected (required):
  - "First and middle name" (`both`)
  - "Middle name only" (`middle`)
- Submit "Add name". On success: input cleared, error cleared, list and combinations update in place.
- Errors (`role="alert"`): "Enter a name." / "Name must be 50 characters or fewer." / "Choose how to use this name." / "{name} is already in the {category} names." (any role; checks first and middle names) / "{name} clashes with {existing}, which has the same page address."
- Notice when persistence fails: "Saved for this visit only. Browser storage is unavailable."

## Combinations

A name page never lists a combination whose middle name equals its first name (ignoring case).

## Storage

- Key `baby-names:v1`, JSON matching `Stored` in [data-model.md](../data-model.md). Unreadable value is ignored.
