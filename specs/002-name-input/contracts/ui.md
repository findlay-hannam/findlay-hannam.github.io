# UI Contract: Name Input

> Amended by 003-nav-header: visible wording is 'last name'; messages now read 'Enter a last name.' and 'Last name must be 50 characters or fewer.'

> Amended by 004-manage-names: names can now be deleted and promoted/demoted between roles; "First and middle name" is preselected; the built-in config, `merge` and `Names` are gone (the visitor's `Stored` lists are the only data).

> Amended by 005-last-name-modal: the last-name prompt on `/` is replaced by a modal opened from the header; `/` is now a static homepage. The in-page prompts on category and name pages stay.

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
