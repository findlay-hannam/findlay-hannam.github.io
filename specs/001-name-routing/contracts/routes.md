# UI Contract: Routes

| Path | Page | Content | Not-found / empty |
|---|---|---|---|
| `/` | Home | Links to `/boys` and `/girls` (FR-008) | n/a |
| `/boys`, `/girls` | CategoryList | All first names of that category, each linking to `/<category>/<slug>` (FR-001, FR-002) | "No names yet" when the list is empty |
| `/boys/:slug`, `/girls/:slug` | NamePage | Combinations for that first name only: one per middle name, formatted `First Middle Surname` (FR-003, FR-004) | Unknown slug → NotFound with link back to the category list; no middle names → empty-state message |
| anything else | NotFound | Message + link to `/` (FR-005) | n/a |

## Rules
- Paths are lowercase canonical; trailing slash and case variants resolve to the same page (spec edge case).
- A slug from one category on the other category's path is not-found.
- Every route works on direct load, refresh and bookmark (FR-006), via the build-time `404.html` copy.
- In-app navigation uses real `<a href>` links so back/forward and open-in-new-tab work (FR-007).
