import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Router } from 'wouter'
import { demote, emptyStored, promote } from '../lib/rules'
import type { Stored } from '../lib/rules'
import { slugify } from '../lib/slug'
import { fixture, mainHtml, renderAt, resetStore, seed } from '../test/renderAt'
import NamePage from './NamePage'

const esc = (s: string) => s.replace(/'/g, '&#x27;')

describe('/<category>/<slug>', () => {
  beforeEach(() => seed(fixture))
  afterEach(resetStore)

  it('shows only that name’s combinations', () => {
    const html = renderAt('/boys/oliver')
    expect(html).toContain('Oliver James Hannam')
    expect(html).toContain('Oliver Edward Hannam')
    expect(html).not.toContain('Arthur Edward')
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
    const names: Stored = { ...emptyStored, surname: 'X', boys: { first: ['Sam'], middle: [] } }
    const html = renderToString(
      <Router ssrPath="/">
        <NamePage category="boys" slug="sam" names={names} />
      </Router>,
    )
    expect(html).toContain('No combinations yet')
  })

  it('never pairs a first name with itself as a middle name (FR-015)', () => {
    const names: Stored = { ...emptyStored, surname: 'X', boys: { first: ['Fin'], middle: ['Fin', 'Noah'] } }
    const html = renderToString(
      <Router ssrPath="/">
        <NamePage category="boys" slug="fin" names={names} />
      </Router>,
    )
    expect(html).toContain('Fin Noah X')
    expect(html).not.toContain('Fin Fin')
  })

  it('includes added names as middle names for every first name in that category', () => {
    seed({ ...emptyStored, surname: 'Hannam', boys: { first: ['Noah', 'Oliver'], middle: ['Lee', 'Noah', 'Oliver'] } })
    const oliver = renderAt('/boys/oliver')
    expect(oliver).toContain('Oliver Noah Hannam')
    expect(oliver).toContain('Oliver Lee Hannam')
    expect(renderAt('/boys/noah')).toContain('Noah Lee Hannam')
    expect(renderAt('/boys/noah')).not.toContain('Noah Noah')
  })

  it('does not leak boys additions into girls pages', () => {
    seed({ ...fixture, boys: { first: ['Noah'], middle: ['Lee', 'Noah'] } })
    const ada = renderAt('/girls/ada')
    expect(ada).not.toContain('Noah')
    expect(ada).not.toContain('Lee')
    expect(renderAt('/girls/noah')).toContain('Name not found')
  })

  describe('with no surname set', () => {
    beforeEach(() => seed({ ...fixture, surname: undefined }))

    it('shows the last name prompt instead of combinations', () => {
      const html = renderAt('/boys/oliver')
      expect(html).toContain('Save last name')
      expect(html).not.toContain('Oliver James')
    })

    it('shows combinations once a surname is saved', () => {
      seed(fixture)
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

  describe('role changes (FR-007, FR-008, FR-014)', () => {
    it('a demoted name has no page but stays a middle name, in alphabetical order', () => {
      seed(demote(fixture, 'boys', 'Oliver'))
      expect(renderAt('/boys/oliver')).toContain('Name not found')
      const arthur = renderAt('/boys/arthur')
      expect(arthur).toContain('Arthur Oliver Hannam')
      expect(arthur.indexOf('Arthur Edward Hannam')).toBeLessThan(arthur.indexOf('Arthur James Hannam'))
      expect(arthur.indexOf('Arthur James Hannam')).toBeLessThan(arthur.indexOf('Arthur Oliver Hannam'))
    })

    it('a promoted middle-only name gets a page with its combinations', () => {
      const r = promote(fixture, 'boys', 'Edward')
      if (!r.ok) throw new Error(r.error)
      seed(r.value)
      const html = renderAt('/boys/edward')
      expect(html).toContain('<h2>Edward')
      expect(html).toContain('Edward Arthur Hannam')
      expect(html).not.toContain('Edward Edward')
    })
  })

  describe('delete control (FR-004)', () => {
    it('is on a found name page', () => {
      expect(renderAt('/boys/oliver')).toContain('aria-label="Delete Oliver"')
    })
    it('is on a found name page with no last name set', () => {
      seed({ ...fixture, surname: undefined })
      expect(renderAt('/boys/oliver')).toContain('aria-label="Delete Oliver"')
    })
    it('is not on a not-found page', () => {
      expect(renderAt('/boys/nope')).not.toContain('Delete')
    })
  })

  it('renders every seeded name page (SC-001)', () => {
    for (const category of ['boys', 'girls'] as const) {
      const { first, middle } = fixture[category]
      for (const name of first) {
        const html = renderAt(`/${category}/${slugify(name)}`)
        expect(html, name).toContain('<h2>' + esc(name))
        for (const m of middle.filter((x) => x !== name)) expect(html).toContain(esc(`${name} ${m} Hannam`))
      }
    }
  })

  describe('as a fresh visitor (FR-001)', () => {
    beforeEach(resetStore)

    it.each(['/boys/oliver', '/girls/ada'])('%s shows not found', (path) => {
      expect(renderAt(path)).toContain('Name not found')
    })
  })
})
