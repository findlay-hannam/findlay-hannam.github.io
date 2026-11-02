# Research: Last Name Modal and Homepage

## R1. How to build the modal

- **Decision**: the native `<dialog>` element opened with `showModal()`.
- **Rationale**: it provides, with no code of ours: Escape closes, a focus trap, an inert page behind, top-layer stacking, and focus returning to the element that opened it. That covers FR-006 (Escape) and FR-007 (accessible dialog) directly. Pico already styles `dialog > article` as an overlay with a card, so the look matches. Constitution I: platform feature over a library; accessibility basics for free.
- **Alternatives**: a modal library (new dependency); a hand-rolled overlay with `role="dialog"` (needs our own focus trap, Escape handler, inert handling and focus return: more code, more bugs).

## R2. Mount only while open

- **Decision**: `App` holds `open` state and renders `<LastNameModal onClose={…}/>` only when `open` is true. The modal calls `showModal()` in an effect on mount and calls `onClose` from the dialog's `close` event.
- **Rationale**: server-rendered HTML (and all existing page tests) contain no dialog or form, so assertions like "no `Save last name` on this page" still mean what they say. Remounting each time also gives the prefilled current value and discards unsaved text on close (FR-003, FR-006) without any reset logic.
- **Alternatives**: always render a closed `<dialog>` and toggle it (keeps a hidden duplicate form in every page and breaks the "absent" assertions; needs explicit resets).

## R3. Close paths and focus

- **Decision**: all closes go through the platform: Escape (native), the Close button and a click on the dialog backdrop call `dialog.close()`, and a persisted Save also calls `dialog.close()`. The `close` event then calls `onClose`, which unmounts the modal. Nothing else touches focus.
- **Rationale**: `close()` restores focus to the element focused before `showModal()` (the header button), satisfying FR-007 and SC-003. One unmount path avoids drift.
- **Backdrop click**: Pico renders `<dialog>` as a full-viewport flex overlay with the card as its child, so a click whose `target` is the dialog element itself is a click outside the card. Close only when both `mousedown` and `click` hit the dialog element itself: a text-selection drag that starts in the input and ends on the overlay reports its `click` on the dialog and would otherwise close it and lose the typed text.
- **Alternatives**: closing by setting state only (skips the platform's focus restore).

## R4. Save closes only when persisted

- **Decision**: `SurnameForm` gains an optional `onSaved(persisted: boolean)`. The modal passes `(persisted) => persisted && dialog.close()`. When storage is unavailable the form shows its existing notice and the modal stays open (FR-009).
- **Rationale**: reuses the form's validation, messages (`role="alert"`) and notice unchanged (FR-004, FR-005).
- **Alternatives**: a second form component (duplicated validation and messages).

## R5. Header: link to button

- **Decision**: "Set Last Name" becomes `<button type="button" class="pill pill-home" aria-haspopup="dialog">` in the same `<li>` and position. Boys and Girls stay `wouter` links.
- **Rationale**: it performs an action, not a navigation (FR-001); a button is the correct semantics and keeps the three-item nav (FR-002). CSS selectors for `.pill` are extended to the button so it looks the same.
- **Alternatives**: keep an anchor with `preventDefault` (wrong semantics, still announced as a link).

## R6. Homepage copy

- **Decision**: `Home` renders a card with an `<h1>Baby Names</h1>` in the header band and one `<p>`: "Plan baby names the easy way: add first and middle names for boys and girls, set your last name, and see every full-name combination. Pick Boys or Girls above to start." (31 words, 2 sentences). No form, no anchors, no state dependency.
- **Rationale**: FR-010, FR-011. A homepage `h1` also restores the page heading that was removed earlier from the header. Pointing at the header uses plain text, not a link.
- **Test**: strip tags from the paragraph, assert ≤ 2 sentences and ≤ 40 words, and assert identical output with and without a saved last name.
- **Alternatives**: marketing-style hero (more space, more copy, against the "concise" ask).

## R7. Modal styling and themes

- **Decision**: rely on Pico's `dialog` + `dialog > article` styles; render the modal inside `.app` so the section's CSS variables (accent, ink) apply. Make the form's Save and Close buttons sit on one row; the header band reuses the card style.
- **Rationale**: FR-013. Custom properties inherit through the DOM tree even for top-layer elements, so no theme plumbing is needed.
- **Alternatives**: portal to `body` (loses the theme variables).

## R8. React StrictMode guard

- **Decision**: in the mount effect use `if (!d.open) d.showModal()`.
- **Rationale**: StrictMode runs effects twice in development; calling `showModal()` on an open modal can throw in some engines.

## R9. Testing without a DOM library

- **Decision**: unit-test what is static markup: header items (`navItems` helper), homepage copy and its word count, and the modal rendered directly with `renderToString` (dialog with accessible name, prefilled input, Save and Close buttons). Behaviour (opens without navigating, closes by button/Escape/outside click, focus returns, invalid keeps it open, blocked storage keeps it open) is verified by a scratch headless-Chrome script driven over the DevTools protocol (outside the repo) plus the manual table in [quickstart.md](quickstart.md).
- **Rationale**: no new dev dependency (constitution I). Headless Chrome is already available locally and exercises the real `<dialog>`, which jsdom does not implement faithfully.
- **Residual risk**: this behaviour is not in `pnpm test`, so CI would not catch a regression.
- **Alternatives**: `@testing-library/react` + jsdom (new dev dependencies, and jsdom lacks `showModal` focus behaviour).
