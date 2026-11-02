# Data Model: Navigation Header

No stored data changes. The header is a fixed, ordered list of three options.

| # | Label | Destination |
|---|---|---|
| 1 | Boys | `/boys` |
| 2 | Girls | `/girls` |
| 3 | Set Last Name | `/` |

- Defined inline in `src/App.tsx`; not configurable, not stored (constitution I: no config for constant values).
- The `Stored` shape and `baby-names:v1` key from 002 are untouched; existing saved data keeps working.
