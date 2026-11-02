import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Router } from 'wouter'
import { config } from '../data/config'
import type { Names } from '../lib/rules'
import { emptyStored } from '../lib/rules'
import { slugify } from '../lib/slug'
import { mainHtml, renderAt, resetStore, seed } from '../test/renderAt'
import NamePage from './NamePage'

const esc = (s: string) => s.replace(/'/g, '&#x27;')

describe('/<category>/<slug>', () => {
  beforeEach(() => seed({ ...emptyStored, surname: 'Hannam' }))
  afterEach(resetStore)

  it('shows only that name’s combinations', () => {
    const html = renderAt('/boys/oliver')
    expect(html).toContain('Oliver James Hannam')
    expect(html).toContain('Oliver Edward Hannam')
    expect(html).not.toContain('Arthur')
  })

  it('uses the category’s own middle names', () => {
    const html = renderAt('/girls/ada')
    expect(html).toContain('Ada Rose Hannam')
    expect(html).not.toContain('James')
  })

  it.each(['/boys/nope', '/boys/ada'])('%s shows not found with no links in its content', (path) => {
    const html = renderAt(path)
    expect(html).toContain('Name not found')
    expect(html).not.toContain('Back to the')
    expect(mainHtml(html)).not.toContain('<a ')
  })

  it('a found name page has no back link and no anchors in its content (FR-007)', () => {
    const html = renderAt('/boys/oliver')
    expect(html).not.toContain('Back to the')
    expect(mainHtml(html)).not.toContain('<a ')
  })

  it('shows an empty state when the category has no middle names', () => {
    const names: Names = { surname: 'X', cfg: { boys: { first: ['Sam'], middle: [] }, girls: { first: [], middle: [] } } }
    const html = renderToString(
      <Router ssrPath="/">
        <NamePage category="boys" slug="sam" names={names} />
      </Router>,
    )
    expect(html).toContain('No combinations yet')
  })

  it('never pairs a first name with itself as a middle name (FR-015)', () => {
    const names: Names = {
      surname: 'X',
      cfg: { boys: { first: ['Fin'], middle: ['Fin', 'Noah'] }, girls: { first: [], middle: [] } },
    }
    const html = renderToString(
      <Router ssrPath="/">
        <NamePage category="boys" slug="fin" names={names} />
      </Router>,
    )
    expect(html).toContain('Fin Noah X')
    expect(html).not.toContain('Fin Fin')
  })

  it('includes added names as middle names for every first name in that category', () => {
    seed({ ...emptyStored, surname: 'Hannam', boys: { first: ['Noah'], middle: ['Noah', 'Lee'] } })
    const oliver = renderAt('/boys/oliver')
    expect(oliver).toContain('Oliver Noah Hannam')
    expect(oliver).toContain('Oliver Lee Hannam')
    expect(renderAt('/boys/noah')).toContain('Noah Lee Hannam')
    expect(renderAt('/boys/noah')).not.toContain('Noah Noah')
  })

  it('does not leak boys additions into girls pages', () => {
    seed({ ...emptyStored, surname: 'Hannam', boys: { first: ['Noah'], middle: ['Noah', 'Lee'] } })
    const ada = renderAt('/girls/ada')
    expect(ada).not.toContain('Noah')
    expect(ada).not.toContain('Lee')
    expect(renderAt('/girls/noah')).toContain('Name not found')
  })

  describe('with no surname set', () => {
    beforeEach(resetStore)

    it('shows the last name prompt instead of combinations', () => {
      const html = renderAt('/boys/oliver')
      expect(html).toContain('Save last name')
      expect(html).not.toContain('Oliver James')
    })

    it('shows combinations once a surname is saved', () => {
      seed({ ...emptyStored, surname: 'Hannam' })
      const html = renderAt('/boys/oliver')
      expect(html).toContain('Oliver James Hannam')
      expect(html).not.toContain('Save last name')
    })

    it('still shows not found for an unknown slug', () => {
      const html = renderAt('/boys/nope')
      expect(html).toContain('Name not found')
      expect(html).not.toContain('Save last name')
    })
  })

  it('renders every configured name page (SC-001)', () => {
    for (const category of ['boys', 'girls'] as const) {
      const { first, middle } = config[category]
      for (const name of first) {
        const html = renderAt(`/${category}/${slugify(name)}`)
        expect(html, name).toContain('<h2>' + esc(name))
        for (const m of middle) expect(html).toContain(esc(`${name} ${m} Hannam`))
      }
    }
  })
})
