import { slugify } from './slug'
import type { CategoryId, Lists } from './rules'

export const isCategory = (x: string): x is CategoryId => x === 'boys' || x === 'girls'

export const firstNames = (lists: Lists) => lists.first.map((name) => ({ name, slug: slugify(name) }))

export const findName = (lists: Lists, slug: string) => firstNames(lists).find((n) => n.slug === slug)

/** Middle names that are not also first names. */
export const middleOnly = (lists: Lists) => {
  const first = new Set(lists.first.map((n) => n.toLowerCase()))
  return lists.middle.filter((n) => !first.has(n.toLowerCase()))
}

// A first name is never combined with itself as its middle name (FR-015).
export const combinations = (lists: Lists, first: string, surname: string) =>
  lists.middle
    .filter((middle) => middle.toLowerCase() !== first.toLowerCase())
    .map((middle) => ({ first, middle, surname, full: `${first} ${middle} ${surname}` }))

/** The middle-only name whose page address would be `slug`, if any. */
export const findMiddleOnly = (lists: Lists, slug: string) => middleOnly(lists).find((n) => slugify(n) === slug)

/** A readable guess at the name behind a page address ("mary-ann" → "Mary Ann"); accents and apostrophes are lost. */
export const nameFromSlug = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
