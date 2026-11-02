import { describe, expect, it } from 'vitest'
import type { Config } from '../data/config'
import { addName, clean, emptyStored, merge, setSurname } from './rules'
import type { Stored } from './rules'

const cfg: Config = {
  boys: { first: ['Oliver'], middle: ['James'] },
  girls: { first: ['Ada'], middle: ['Rose'] },
}

describe('emptyStored', () => {
  it('has no surname and empty lists', () => {
    expect(emptyStored).toEqual({ boys: { first: [], middle: [] }, girls: { first: [], middle: [] } })
    expect(emptyStored.surname).toBeUndefined()
  })
})

describe('merge', () => {
  const stored: Stored = {
    surname: 'Smith',
    boys: { first: ['Noah'], middle: ['Noah', 'Lee'] },
    girls: { first: [], middle: [] },
  }

  it('puts built-in names first, then added, per category', () => {
    const { cfg: m } = merge(cfg, stored)
    expect(m.boys.first).toEqual(['Oliver', 'Noah'])
    expect(m.boys.middle).toEqual(['James', 'Noah', 'Lee'])
    expect(m.girls).toEqual({ first: ['Ada'], middle: ['Rose'] })
  })

  it('passes the surname through, undefined when unset', () => {
    expect(merge(cfg, stored).surname).toBe('Smith')
    expect(merge(cfg, emptyStored).surname).toBeUndefined()
  })

  it('dedupes ignoring case, built-in wins', () => {
    const dup: Stored = { ...emptyStored, boys: { first: ['oliver'], middle: ['JAMES', 'Lee'] } }
    const { cfg: m } = merge(cfg, dup)
    expect(m.boys.first).toEqual(['Oliver'])
    expect(m.boys.middle).toEqual(['James', 'Lee'])
  })

  it('does not mutate its inputs', () => {
    const before = JSON.stringify([cfg, stored])
    merge(cfg, stored)
    expect(JSON.stringify([cfg, stored])).toBe(before)
  })
})

describe('clean', () => {
  it('trims and keeps internal spacing, accents and apostrophes', () => {
    expect(clean("  Zoë  O'Brien ", 'name')).toEqual({ ok: true, value: "Zoë  O'Brien" })
  })
  it.each(['', '   '])('rejects empty %j with a label-specific message', (raw) => {
    expect(clean(raw, 'surname')).toEqual({ ok: false, error: 'Enter a surname.' })
    expect(clean(raw, 'name')).toEqual({ ok: false, error: 'Enter a name.' })
  })
  it('rejects over 50 characters, accepts exactly 50', () => {
    expect(clean('a'.repeat(51), 'surname')).toEqual({ ok: false, error: 'Surname must be 50 characters or fewer.' })
    expect(clean('a'.repeat(51), 'name')).toEqual({ ok: false, error: 'Name must be 50 characters or fewer.' })
    expect(clean('a'.repeat(50), 'name').ok).toBe(true)
  })
})

describe('setSurname', () => {
  const withNames: Stored = { surname: 'Old', boys: { first: ['Noah'], middle: [] }, girls: { first: [], middle: [] } }

  it('sets the trimmed surname, keeping added names', () => {
    expect(setSurname(withNames, '  Smith ')).toEqual({ ok: true, value: { ...withNames, surname: 'Smith' } })
  })
  it('sets a surname from empty state', () => {
    const r = setSurname(emptyStored, 'Smith')
    expect(r.ok && r.value.surname).toBe('Smith')
  })
  it('rejects empty and over-long input', () => {
    expect(setSurname(emptyStored, ' ')).toEqual({ ok: false, error: 'Enter a surname.' })
    expect(setSurname(emptyStored, 'a'.repeat(51)).ok).toBe(false)
  })
  it('does not mutate its input', () => {
    const before = JSON.stringify(withNames)
    setSurname(withNames, 'Smith')
    expect(JSON.stringify(withNames)).toBe(before)
  })
})

describe('addName', () => {
  const built: Config = {
    boys: { first: ['Oliver', "Finn O'Brien"], middle: ['James'] },
    girls: { first: ['Ada'], middle: ['Rose'] },
  }
  const ok = (r: ReturnType<typeof addName>) => {
    if (!r.ok) throw new Error(r.error)
    return r.value
  }
  const err = (r: ReturnType<typeof addName>) => (r.ok ? 'no error' : r.error)

  it("'both' appends the trimmed name to first and middle", () => {
    const s = ok(addName(emptyStored, built, 'boys', '  Noah ', 'both'))
    expect(s.boys).toEqual({ first: ['Noah'], middle: ['Noah'] })
  })
  it("'middle' appends to middle only", () => {
    const s = ok(addName(emptyStored, built, 'boys', 'Lee', 'middle'))
    expect(s.boys).toEqual({ first: [], middle: ['Lee'] })
  })
  it('leaves the other category and the surname untouched', () => {
    const s = ok(addName({ ...emptyStored, surname: 'Smith' }, built, 'boys', 'Noah', 'both'))
    expect(s.girls).toEqual({ first: [], middle: [] })
    expect(s.surname).toBe('Smith')
  })
  it('allows the same name in the other category', () => {
    const s = ok(addName(emptyStored, built, 'girls', 'Oliver', 'both'))
    expect(s.girls.first).toEqual(['Oliver'])
  })
  it('requires a role', () => {
    expect(err(addName(emptyStored, built, 'boys', 'Noah', undefined))).toBe('Choose how to use this name.')
  })
  it('reuses the empty and length messages, checked before the role', () => {
    expect(err(addName(emptyStored, built, 'boys', ' ', undefined))).toBe('Enter a name.')
    expect(err(addName(emptyStored, built, 'boys', 'a'.repeat(51), 'both'))).toBe('Name must be 50 characters or fewer.')
  })

  describe('duplicates (any role, any case, first or middle, built-in or added)', () => {
    const added: Stored = { ...emptyStored, boys: { first: ['Fin'], middle: ['Fin', 'Lee'] } }
    it.each([
      ['oliver', 'both'], // built-in first
      ['OLIVER', 'middle'], // built-in first, middle role
      ['james', 'both'], // built-in middle
      ['James', 'middle'], // built-in middle
      ['fin', 'both'], // added first
      ['LEE', 'middle'], // added middle
      ['lee', 'both'], // added middle-only, now as both
    ] as const)('rejects %s as %s', (name, role) => {
      expect(err(addName(added, built, 'boys', name, role))).toBe(`${name} is already in the boys names.`)
    })
  })

  it('rejects a slug collision for a first name, naming the existing one', () => {
    expect(err(addName(emptyStored, built, 'boys', 'Finn OBrien', 'both'))).toBe(
      "Finn OBrien clashes with Finn O'Brien, which has the same page address.",
    )
  })
  it('skips the slug check for middle-only names', () => {
    expect(addName(emptyStored, built, 'boys', 'Finn OBrien', 'middle').ok).toBe(true)
  })
  it('rejects a first name with no letters or digits (no usable page address)', () => {
    expect(err(addName(emptyStored, built, 'boys', '--', 'both'))).toBe('Name must include a letter or number.')
  })
  it('does not mutate its input', () => {
    const before = JSON.stringify(emptyStored)
    addName(emptyStored, built, 'boys', 'Noah', 'both')
    expect(JSON.stringify(emptyStored)).toBe(before)
  })
})
