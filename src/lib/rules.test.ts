import { describe, expect, it } from 'vitest'
import { addName, clean, demote, emptyStored, promote, removeName, setSurname, tidy } from './rules'
import type { Stored } from './rules'

describe('emptyStored', () => {
  it('has no surname and empty lists', () => {
    expect(emptyStored).toEqual({ boys: { first: [], middle: [] }, girls: { first: [], middle: [] } })
    expect(emptyStored.surname).toBeUndefined()
  })
})

describe('tidy', () => {
  const lists = (first: string[], middle: string[] = first) => ({ first, middle })
  const t = (boys: { first: string[]; middle: string[] }) => tidy({ ...emptyStored, boys }).boys

  it('dedupes ignoring case, keeping the first spelling', () => {
    expect(t(lists(['Amy', 'amy']))).toEqual({ first: ['Amy'], middle: ['Amy'] })
  })
  it('sorts ignoring case', () => {
    expect(t(lists(['bob', 'Alice', 'carl'])).first).toEqual(['Alice', 'bob', 'carl'])
  })
  it('sorts accented letters with their base letter', () => {
    expect(t(lists(['Eve', 'Émile', 'Adam'])).first).toEqual(['Adam', 'Émile', 'Eve'])
  })
  it('adds a first name missing from middle', () => {
    expect(t(lists(['Amy'], []))).toEqual({ first: ['Amy'], middle: ['Amy'] })
  })
  it('applies to both categories and leaves the surname alone', () => {
    const r = tidy({ surname: 'Smith', boys: lists(['b', 'A']), girls: lists(['d', 'C']) })
    expect(r.boys.first).toEqual(['A', 'b'])
    expect(r.girls.middle).toEqual(['C', 'd'])
    expect(r.surname).toBe('Smith')
  })
  it('does not mutate its input', () => {
    const input = { ...emptyStored, boys: lists(['b', 'A']) }
    const before = JSON.stringify(input)
    tidy(input)
    expect(JSON.stringify(input)).toBe(before)
  })
})

describe('clean', () => {
  it('trims and keeps internal spacing, accents and apostrophes', () => {
    expect(clean("  Zoë  O'Brien ", 'name')).toEqual({ ok: true, value: "Zoë  O'Brien" })
  })
  it.each(['', '   '])('rejects empty %j with a label-specific message', (raw) => {
    expect(clean(raw, 'surname')).toEqual({ ok: false, error: 'Enter a last name.' })
    expect(clean(raw, 'name')).toEqual({ ok: false, error: 'Enter a name.' })
  })
  it('rejects over 50 characters, accepts exactly 50', () => {
    expect(clean('a'.repeat(51), 'surname')).toEqual({ ok: false, error: 'Last name must be 50 characters or fewer.' })
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
    expect(setSurname(emptyStored, ' ')).toEqual({ ok: false, error: 'Enter a last name.' })
    expect(setSurname(emptyStored, 'a'.repeat(51)).ok).toBe(false)
  })
  it('does not mutate its input', () => {
    const before = JSON.stringify(withNames)
    setSurname(withNames, 'Smith')
    expect(JSON.stringify(withNames)).toBe(before)
  })
})

describe('addName', () => {
  const base: Stored = {
    ...emptyStored,
    boys: {
      first: ["Finn O'Brien", 'Fin', 'Oliver'],
      middle: ['Fin', "Finn O'Brien", 'James', 'Lee', 'Oliver'],
    },
    girls: { first: ['Ada'], middle: ['Ada', 'Rose'] },
  }
  const ok = (r: ReturnType<typeof addName>) => {
    if (!r.ok) throw new Error(r.error)
    return r.value
  }
  const err = (r: ReturnType<typeof addName>) => (r.ok ? 'no error' : r.error)

  it("'both' appends the trimmed name to first and middle", () => {
    const s = ok(addName(emptyStored, 'boys', '  Noah ', 'both'))
    expect(s.boys).toEqual({ first: ['Noah'], middle: ['Noah'] })
  })
  it("'middle' appends to middle only", () => {
    const s = ok(addName(emptyStored, 'boys', 'Lee', 'middle'))
    expect(s.boys).toEqual({ first: [], middle: ['Lee'] })
  })
  it('returns lists in alphabetical order', () => {
    const s = ok(addName({ ...emptyStored, boys: { first: ['Zed'], middle: ['Zed'] } }, 'boys', 'Noah', 'both'))
    expect(s.boys).toEqual({ first: ['Noah', 'Zed'], middle: ['Noah', 'Zed'] })
  })
  it('leaves the other category and the surname untouched', () => {
    const s = ok(addName({ ...emptyStored, surname: 'Smith' }, 'boys', 'Noah', 'both'))
    expect(s.girls).toEqual({ first: [], middle: [] })
    expect(s.surname).toBe('Smith')
  })
  it('allows the same name in the other category', () => {
    const s = ok(addName(base, 'girls', 'Oliver', 'both'))
    expect(s.girls.first).toEqual(['Ada', 'Oliver'])
  })
  it('reuses the empty and length messages', () => {
    expect(err(addName(emptyStored, 'boys', ' ', 'both'))).toBe('Enter a name.')
    expect(err(addName(emptyStored, 'boys', 'a'.repeat(51), 'both'))).toBe('Name must be 50 characters or fewer.')
  })

  describe('duplicates (any role, any case, first or middle-only)', () => {
    it.each([
      ['oliver', 'both'], // first name
      ['OLIVER', 'middle'], // first name, middle role
      ['james', 'both'], // middle-only
      ['James', 'middle'], // middle-only
      ['fin', 'both'], // first name
      ['LEE', 'middle'], // middle-only
      ['lee', 'both'], // middle-only, now as both
    ] as const)('rejects %s as %s', (name, role) => {
      expect(err(addName(base, 'boys', name, role))).toBe(`${name} is already in the boys names.`)
    })
  })

  it('rejects a slug collision for a first name, naming the existing one', () => {
    expect(err(addName(base, 'boys', 'Finn OBrien', 'both'))).toBe(
      "Finn OBrien clashes with Finn O'Brien, which has the same page address.",
    )
  })
  it('skips the slug check for middle-only names', () => {
    expect(addName(base, 'boys', 'Finn OBrien', 'middle').ok).toBe(true)
  })
  it('rejects a first name with no letters or digits (no usable page address)', () => {
    expect(err(addName(emptyStored, 'boys', '--', 'both'))).toBe('Name must include a letter or number.')
  })
  it('does not mutate its input', () => {
    const before = JSON.stringify(base)
    addName(base, 'boys', 'Noah', 'both')
    expect(JSON.stringify(base)).toBe(before)
  })
})

describe('removeName', () => {
  const base: Stored = {
    ...emptyStored,
    boys: { first: ['Noah', 'Oliver'], middle: ['Lee', 'Noah', 'Oliver'] },
    girls: { first: ['Noah'], middle: ['Noah'] },
  }

  it('removes a first-and-middle name from both lists, ignoring case', () => {
    expect(removeName(base, 'boys', 'noah').boys).toEqual({ first: ['Oliver'], middle: ['Lee', 'Oliver'] })
  })
  it('removes a middle-only name from middle', () => {
    expect(removeName(base, 'boys', 'Lee').boys).toEqual({ first: ['Noah', 'Oliver'], middle: ['Noah', 'Oliver'] })
  })
  it('leaves the other category alone even when it holds the same spelling', () => {
    expect(removeName(base, 'boys', 'Noah').girls).toEqual({ first: ['Noah'], middle: ['Noah'] })
  })
  it('returns an equal value when the name is absent', () => {
    expect(removeName(base, 'boys', 'Nobody')).toEqual(base)
  })
  it('keeps the surname', () => {
    expect(removeName({ ...base, surname: 'Smith' }, 'boys', 'Noah').surname).toBe('Smith')
  })
  it('does not mutate its input', () => {
    const before = JSON.stringify(base)
    removeName(base, 'boys', 'Noah')
    expect(JSON.stringify(base)).toBe(before)
  })
})

describe('demote', () => {
  const base: Stored = {
    surname: 'Smith',
    boys: { first: ['Noah', 'Oliver'], middle: ['Lee', 'Noah', 'Oliver'] },
    girls: { first: ['Noah'], middle: ['Noah'] },
  }

  it('removes the name from first but keeps it in middle', () => {
    expect(demote(base, 'boys', 'Noah').boys).toEqual({ first: ['Oliver'], middle: ['Lee', 'Noah', 'Oliver'] })
  })
  it('leaves the other category and the surname alone', () => {
    const r = demote(base, 'boys', 'Noah')
    expect(r.girls).toEqual(base.girls)
    expect(r.surname).toBe('Smith')
  })
  it('does not mutate its input', () => {
    const before = JSON.stringify(base)
    demote(base, 'boys', 'Noah')
    expect(JSON.stringify(base)).toBe(before)
  })
})

describe('promote', () => {
  const base: Stored = {
    ...emptyStored,
    boys: { first: ['Noah', 'Oliver'], middle: ['Lee', 'Noah', 'Oliver'] },
  }

  it('adds a middle-only name to first, in alphabetical place', () => {
    const r = promote(base, 'boys', 'Lee')
    expect(r).toEqual({
      ok: true,
      value: { ...base, boys: { first: ['Lee', 'Noah', 'Oliver'], middle: ['Lee', 'Noah', 'Oliver'] } },
    })
  })
  it('rejects a name whose page address clashes with an existing first name', () => {
    const clash: Stored = { ...emptyStored, boys: { first: ['Mary-Ann'], middle: ['Mary Ann', 'Mary-Ann'] } }
    expect(promote(clash, 'boys', 'Mary Ann')).toEqual({
      ok: false,
      error: 'Mary Ann clashes with Mary-Ann, which has the same page address.',
    })
  })
  it('rejects a name with no letters or digits', () => {
    const odd: Stored = { ...emptyStored, boys: { first: [], middle: ['--'] } }
    expect(promote(odd, 'boys', '--')).toEqual({ ok: false, error: 'Name must include a letter or number.' })
  })
  it('does not mutate its input, on success or error', () => {
    const before = JSON.stringify(base)
    promote(base, 'boys', 'Lee')
    promote(base, 'boys', 'Noah')
    expect(JSON.stringify(base)).toBe(before)
  })
})
