import { describe, expect, it } from 'vitest'
import { slugify } from '../lib/slug'
import { config } from './config'

describe('config invariants', () => {
  it('has a non-empty surname', () => expect(config.surname.trim()).not.toBe(''))

  for (const category of ['boys', 'girls'] as const) {
    describe(category, () => {
      const { first, middle } = config[category]

      it('has no empty names', () => {
        for (const n of [...first, ...middle]) expect(n.trim()).not.toBe('')
      })
      it('has non-empty slugs', () => {
        for (const n of first) expect(slugify(n), n).not.toBe('')
      })
      it('has unique slugs (FR-010)', () => {
        const slugs = first.map(slugify)
        expect(new Set(slugs).size).toBe(slugs.length)
      })
    })
  }
})
