import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { config } from '../data/config'
import type { Names } from '../lib/rules'
import { emptyStored } from '../lib/rules'
import { renderAt, resetStore, seed } from '../test/renderAt'
import CategoryList from './CategoryList'

describe('/boys and /girls', () => {
  beforeEach(() => seed({ ...emptyStored, surname: 'Hannam' }))
  afterEach(resetStore)

  it('lists only boys names on /boys, as links in a list', () => {
    const html = renderAt('/boys')
    expect(html).toContain('<ul')
    for (const n of config.boys.first) expect(html).toContain(`>${n.replace("'", '&#x27;')}</a>`)
    expect(html).toContain('href="/boys/oliver"')
    for (const n of config.girls.first) expect(html).not.toContain(n)
  })

  it('lists only girls names on /girls', () => {
    const html = renderAt('/girls')
    expect(html).toContain('href="/girls/ada"')
    expect(html).not.toContain('Oliver')
  })

  it('shows an empty-state message when a category has no names', () => {
    const empty: Names = { surname: 'X', cfg: { boys: { first: [], middle: [] }, girls: { first: [], middle: [] } } }
    const html = renderToString(<CategoryList category="boys" names={empty} />)
    expect(html).toContain('No names yet')
    expect(html).not.toContain('<ul')
  })

  describe('with a surname set', () => {
    it('shows the add-name form with an unselected role choice', () => {
      const html = renderAt('/boys')
      expect(html).toContain('<label')
      expect(html).toContain('Name')
      expect(html).toContain('<fieldset')
      expect(html).toContain('<legend>Use as</legend>')
      expect(html).toContain('First and middle name')
      expect(html).toContain('Middle name only')
      expect(html).toContain('type="radio"')
      expect(html).not.toContain('checked')
      expect(html).toContain('Add name')
    })

    it('lists added first-and-middle names but not middle-only names', () => {
      seed({ ...emptyStored, surname: 'Hannam', boys: { first: ['Noah'], middle: ['Noah', 'Lee'] } })
      const html = renderAt('/boys')
      expect(html).toContain('href="/boys/noah"')
      expect(html).not.toContain('>Lee<')
      expect(html).not.toContain('href="/boys/lee"')
    })

    it('does not show boys additions on /girls', () => {
      seed({ ...emptyStored, surname: 'Hannam', boys: { first: ['Noah'], middle: ['Noah'] } })
      expect(renderAt('/girls')).not.toContain('Noah')
    })
  })

  describe('with no surname set', () => {
    beforeEach(resetStore)

    it('shows the surname prompt instead of the add-name form, and still lists names', () => {
      const html = renderAt('/girls')
      expect(html).toContain('Save surname')
      expect(html).not.toContain('Add name')
      expect(html).toContain('href="/girls/ada"')
    })

    it('shows the add-name form once a surname is saved', () => {
      seed({ ...emptyStored, surname: 'Hannam' })
      const html = renderAt('/girls')
      expect(html).toContain('Add name')
      expect(html).not.toContain('Save surname')
    })
  })
})
