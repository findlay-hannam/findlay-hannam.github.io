# UI Contract: Last Name Modal and Homepage

Page routes unchanged except `/` ([001](../../001-name-routing/contracts/routes.md)). Header from [003](../../003-nav-header/contracts/ui.md) changes as below.

## Header

`<nav aria-label="Main">` still has three items in order:

| # | Label | Element | Behaviour |
|---|---|---|---|
| 1 | Boys | `<a href="/boys" class="pill pill-boys">` | navigates |
| 2 | Girls | `<a href="/girls" class="pill pill-girls">` | navigates |
| 3 | "Set Last Name", or "Last name: {saved}" once one is saved (truncated with an ellipsis if long) | `<button type="button" class="pill pill-home" aria-haspopup="dialog">` | opens the modal; no navigation |

## Modal (rendered only while open)

```text
<dialog aria-labelledby="last-name-title">
  <article>
    <header><h2 id="last-name-title">Set last name</h2></header>
    <form>
      <label>Last name <input value="{current or empty}"></label>
      [<small role="alert">{error}</small>]  [<small role="status">{notice}</small>]
      <button type="submit">Save last name</button>  <button type="button">Close</button>
    </form>
  </article>
</dialog>
```

| Action | Result |
|---|---|
| Save valid last name, persisted | saved; modal closes; full-name views update |
| Save empty / over 50 characters | `role="alert"` "Enter a last name." / "Last name must be 50 characters or fewer."; stays open; nothing saved |
| Save, storage unavailable | applied for the visit; `role="status"` "Saved for this visit only. Browser storage is unavailable."; stays open |
| Close button, Escape, click on the overlay outside the card | closes; saved last name unchanged; typed text discarded |
| Any close | focus returns to the Set Last Name button |

While open the page behind is inert. Modal colours follow the current section (`data-category`).

## `/` (homepage)

- Card with `<h1>Baby Names</h1>` in the header band and one paragraph of at most 2 sentences and 40 words (see research R6).
- No form, no `<a>`, no `<nav>`, no buttons in its content. Identical with or without a saved last name.

## Unchanged

- In-page last-name prompts on category and name pages with no last name (002).
- All other pages and their controls.

> After 005: the dialog shell is shared as `src/components/Modal.tsx` (also used by the delete confirmation); behaviour unchanged.
