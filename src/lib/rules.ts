import type { CategoryId, Config } from '../data/config'
import { slugify } from './slug'

export type Role = 'both' | 'middle'
export type Added = { first: string[]; middle: string[] }
export type Stored = { surname?: string } & Record<CategoryId, Added>
export type Names = { surname?: string; cfg: Config }
export type Result<T> = { ok: true; value: T } | { ok: false; error: string }

export const emptyStored: Stored = { boys: { first: [], middle: [] }, girls: { first: [], middle: [] } }

const dedupe = (list: string[]) => {
  const seen = new Set<string>()
  return list.filter((n) => {
    const k = n.toLowerCase()
    return seen.has(k) ? false : (seen.add(k), true)
  })
}

const mergeCategory = (built: Config[CategoryId], added: Added) => ({
  first: dedupe([...built.first, ...added.first]),
  middle: dedupe([...built.middle, ...added.middle]),
})

export const merge = (cfg: Config, stored: Stored): Names => ({
  surname: stored.surname,
  cfg: { boys: mergeCategory(cfg.boys, stored.boys), girls: mergeCategory(cfg.girls, stored.girls) },
})

const MAX = 50

export function clean(raw: string, label: 'surname' | 'name'): Result<string> {
  const value = raw.trim()
  const Label = label === 'surname' ? 'Surname' : 'Name'
  if (value === '') return { ok: false, error: `Enter a ${label}.` }
  if (value.length > MAX) return { ok: false, error: `${Label} must be ${MAX} characters or fewer.` }
  return { ok: true, value }
}

export function setSurname(stored: Stored, raw: string): Result<Stored> {
  const r = clean(raw, 'surname')
  return r.ok ? { ok: true, value: { ...stored, surname: r.value } } : r
}

export function addName(
  stored: Stored,
  cfg: Config,
  category: CategoryId,
  raw: string,
  role: Role | undefined,
): Result<Stored> {
  const c = clean(raw, 'name')
  if (!c.ok) return c
  if (role === undefined) return { ok: false, error: 'Choose how to use this name.' }
  const name = c.value
  const { first, middle } = merge(cfg, stored).cfg[category]
  if ([...first, ...middle].some((n) => n.toLowerCase() === name.toLowerCase()))
    return { ok: false, error: `${name} is already in the ${category} names.` }
  if (role === 'both') {
    const slug = slugify(name)
    if (slug === '') return { ok: false, error: 'Name must include a letter or number.' }
    const clash = first.find((f) => slugify(f) === slug)
    if (clash) return { ok: false, error: `${name} clashes with ${clash}, which has the same page address.` }
  }
  const added = stored[category]
  return {
    ok: true,
    value: {
      ...stored,
      [category]: {
        first: role === 'both' ? [...added.first, name] : added.first,
        middle: [...added.middle, name],
      },
    },
  }
}
