import { describe, expect, it } from 'vitest'
import type { Config } from '../data/config'
import { combinations, findName, firstNames } from './names'

const cfg: Config = {
  boys: { first: ['Oliver', "Finn O'Brien"], middle: ['James'] },
  girls: { first: ['Zoë'], middle: [] },
}

describe('firstNames', () => {
  it('returns names with slugs for the requested category only', () => {
    expect(firstNames('boys', cfg)).toEqual([
      { name: 'Oliver', slug: 'oliver' },
      { name: "Finn O'Brien", slug: 'finn-obrien' },
    ])
    expect(firstNames('girls', cfg)).toEqual([{ name: 'Zoë', slug: 'zoe' }])
  })
})

describe('findName', () => {
  it('finds a name by slug in its own category', () => {
    expect(findName('boys', 'finn-obrien', cfg)).toEqual({ name: "Finn O'Brien", slug: 'finn-obrien' })
  })
  it('returns undefined for an unknown slug', () => {
    expect(findName('boys', 'nope', cfg)).toBeUndefined()
  })
  it('does not find a girls slug under boys', () => {
    expect(findName('boys', 'zoe', cfg)).toBeUndefined()
  })
})

describe('combinations', () => {
  it('crosses the first name with every middle name of its category plus the surname', () => {
    expect(combinations('boys', 'Oliver', 'Smith', cfg)).toEqual([
      { first: 'Oliver', middle: 'James', surname: 'Smith', full: 'Oliver James Smith' },
    ])
  })
  it('is empty when the category has no middle names', () => {
    expect(combinations('girls', 'Zoë', 'Smith', cfg)).toEqual([])
  })
  const fin: Config = {
    boys: { first: ['Fin'], middle: ['Fin', 'Noah'] },
    girls: { first: [], middle: [] },
  }
  it('skips a middle name equal to the first name (FR-015)', () => {
    expect(combinations('boys', 'Fin', 'Smith', fin).map((c) => c.full)).toEqual(['Fin Noah Smith'])
  })
  it('ignores case when skipping self-pairing', () => {
    expect(combinations('boys', 'fin', 'Smith', fin).map((c) => c.full)).toEqual(['fin Noah Smith'])
  })
  it('leaves other first names unaffected', () => {
    expect(combinations('boys', 'Oliver', 'Smith', fin).map((c) => c.full)).toEqual([
      'Oliver Fin Smith',
      'Oliver Noah Smith',
    ])
  })
})
