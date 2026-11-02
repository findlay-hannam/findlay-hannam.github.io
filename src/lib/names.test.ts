import { describe, expect, it } from 'vitest'
import type { Lists } from './rules'
import { combinations, findName, firstNames, middleOnly } from './names'

const lists: Lists = { first: ['Oliver', "Finn O'Brien"], middle: ['James', 'Oliver'] }

describe('firstNames', () => {
  it('returns names with slugs, in list order', () => {
    expect(firstNames(lists)).toEqual([
      { name: 'Oliver', slug: 'oliver' },
      { name: "Finn O'Brien", slug: 'finn-obrien' },
    ])
  })
  it('is empty for empty lists', () => {
    expect(firstNames({ first: [], middle: [] })).toEqual([])
  })
})

describe('findName', () => {
  it('finds a name by slug', () => {
    expect(findName(lists, 'finn-obrien')).toEqual({ name: "Finn O'Brien", slug: 'finn-obrien' })
  })
  it('returns undefined for an unknown slug', () => {
    expect(findName(lists, 'nope')).toBeUndefined()
  })
})

describe('middleOnly', () => {
  it('returns middle names that are not first names, in order', () => {
    expect(middleOnly({ first: ['Oliver'], middle: ['James', 'Oliver', 'lee'] })).toEqual(['James', 'lee'])
  })
  it('ignores case when comparing', () => {
    expect(middleOnly({ first: ['oliver'], middle: ['Oliver'] })).toEqual([])
  })
})

describe('combinations', () => {
  it('crosses the first name with the middle names, skipping itself', () => {
    expect(combinations(lists, 'Oliver', 'Smith')).toEqual([
      { first: 'Oliver', middle: 'James', surname: 'Smith', full: 'Oliver James Smith' },
    ])
  })
  it('is empty when there are no middle names', () => {
    expect(combinations({ first: ['Zoë'], middle: [] }, 'Zoë', 'Smith')).toEqual([])
  })

  const fin: Lists = { first: ['Fin'], middle: ['Fin', 'Noah'] }
  it('skips a middle name equal to the first name (FR-015)', () => {
    expect(combinations(fin, 'Fin', 'Smith').map((c) => c.full)).toEqual(['Fin Noah Smith'])
  })
  it('ignores case when skipping self-pairing', () => {
    expect(combinations(fin, 'fin', 'Smith').map((c) => c.full)).toEqual(['fin Noah Smith'])
  })
  it('leaves other first names unaffected, in middle-list order', () => {
    expect(combinations(fin, 'Oliver', 'Smith').map((c) => c.full)).toEqual(['Oliver Fin Smith', 'Oliver Noah Smith'])
  })
})
