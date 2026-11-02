import { slugify } from './slug'

export type CategoryId = 'boys' | 'girls'
export type Role = 'both' | 'middle'
// Invariant (kept by `tidy`): every first name is also a middle name.
export type Lists = { first: string[]; middle: string[] }
export type Stored = { surname?: string } & Record<CategoryId, Lists>
export type Result<T> = { ok: true; value: T } | { ok: false; error: string }

export const emptyStored: Stored = { boys: { first: [], middle: [] }, girls: { first: [], middle: [] } }

const byName = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' })

const dedupe = (list: string[]) => {
  const seen = new Set<string>()
  return list.filter((n) => {
    const k = n.toLowerCase()
    return seen.has(k) ? false : (seen.add(k), true)
  })
}

const tidyLists = ({ first, middle }: Lists): Lists => {
  const f = dedupe(first)
  return { first: [...f].sort(byName), middle: dedupe([...middle, ...f]).sort(byName) }
}

/** Dedupe (ignoring case), keep first names inside middle names, and sort alphabetically. */
export const tidy = (stored: Stored): Stored => ({
  ...stored,
  boys: tidyLists(stored.boys),
  girls: tidyLists(stored.girls),
})

const MAX = 50

export function clean(raw: string, label: 'surname' | 'name'): Result<string> {
  const value = raw.trim()
  const noun = label === 'surname' ? 'last name' : 'name'
  if (value === '') return { ok: false, error: `Enter a ${noun}.` }
  if (value.length > MAX) return { ok: false, error: `${noun[0].toUpperCase()}${noun.slice(1)} must be ${MAX} characters or fewer.` }
  return { ok: true, value }
}

export function setSurname(stored: Stored, raw: string): Result<Stored> {
  const r = clean(raw, 'surname')
  return r.ok ? { ok: true, value: { ...stored, surname: r.value } } : r
}

/** Why `name` cannot be a first name (it needs a page address), or undefined if it can. */
function firstNameError(first: string[], name: string): string | undefined {
  const slug = slugify(name)
  if (slug === '') return 'Name must include a letter or number.'
  const clash = first.find((f) => slugify(f) === slug)
  return clash ? `${name} clashes with ${clash}, which has the same page address.` : undefined
}

export function addName(
  stored: Stored,
  category: CategoryId,
  raw: string,
  role: Role,
): Result<Stored> {
  const c = clean(raw, 'name')
  if (!c.ok) return c
  const name = c.value
  const { first, middle } = stored[category]
  if ([...first, ...middle].some((n) => n.toLowerCase() === name.toLowerCase()))
    return { ok: false, error: `${name} is already in the ${category} names.` }
  if (role === 'both') {
    const error = firstNameError(first, name)
    if (error) return { ok: false, error }
  }
  return {
    ok: true,
    value: tidy({
      ...stored,
      [category]: { first: role === 'both' ? [...first, name] : first, middle: [...middle, name] },
    }),
  }
}

/** Remove a name from every role in one category (ignoring case). */
export function removeName(stored: Stored, category: CategoryId, name: string): Stored {
  const keep = (n: string) => n.toLowerCase() !== name.toLowerCase()
  const { first, middle } = stored[category]
  return tidy({ ...stored, [category]: { first: first.filter(keep), middle: middle.filter(keep) } })
}

/** First-and-middle becomes middle-only: leaves `first`, stays in `middle`. */
export function demote(stored: Stored, category: CategoryId, name: string): Stored {
  const { first, middle } = stored[category]
  return tidy({
    ...stored,
    [category]: { first: first.filter((n) => n.toLowerCase() !== name.toLowerCase()), middle },
  })
}

/** Middle-only becomes first-and-middle, unless it cannot have its own page address. */
export function promote(stored: Stored, category: CategoryId, name: string): Result<Stored> {
  const { first, middle } = stored[category]
  const error = firstNameError(first, name)
  if (error) return { ok: false, error }
  return { ok: true, value: tidy({ ...stored, [category]: { first: [...first, name], middle } }) }
}
