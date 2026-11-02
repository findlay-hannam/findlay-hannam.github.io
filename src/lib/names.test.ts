import { describe, expect, it } from 'vitest'
import type { Config } from '../data/config'
import { combinations, findName, firstNames } from './names'

const cfg: Config = {
  surname: 'Smith',
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
    expect(combinations('boys', 'Oliver', cfg)).toEqual([
      { first: 'Oliver', middle: 'James', surname: 'Smith', full: 'Oliver James Smith' },
    ])
  })
  it('is empty when the category has no middle names', () => {
    expect(combinations('girls', 'Zoë', cfg)).toEqual([])
  })
})
