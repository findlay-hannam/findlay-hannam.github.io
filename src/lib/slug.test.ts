import { describe, expect, it } from 'vitest'
import { slugify } from './slug'

describe('slugify', () => {
  it('lowercases', () => expect(slugify('Ada')).toBe('ada'))
  it('strips accents', () => expect(slugify('Zoë')).toBe('zoe'))
  it('drops apostrophes', () => expect(slugify("O'Neil")).toBe('oneil'))
  it('turns spaces into dashes', () => expect(slugify('Mary Ann')).toBe('mary-ann'))
  it('trims and collapses dashes', () => expect(slugify('  -Ann--Marie- ')).toBe('ann-marie'))
  it('returns empty for names with no latin letters', () => expect(slugify('名前')).toBe(''))
})
