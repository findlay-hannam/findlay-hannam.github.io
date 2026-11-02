import { config } from '../data/config'
import type { CategoryId, Config } from '../data/config'
import { slugify } from './slug'

export const isCategory = (x: string): x is CategoryId => x === 'boys' || x === 'girls'

export const firstNames = (category: CategoryId, cfg: Config = config) =>
  cfg[category].first.map((name) => ({ name, slug: slugify(name) }))

export const findName = (category: CategoryId, slug: string, cfg: Config = config) =>
  firstNames(category, cfg).find((n) => n.slug === slug)

export const combinations = (category: CategoryId, first: string, cfg: Config = config) =>
  cfg[category].middle.map((middle) => ({
    first,
    middle,
    surname: cfg.surname,
    full: `${first} ${middle} ${cfg.surname}`,
  }))
