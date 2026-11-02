import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { emptyStored } from '../lib/rules'
import type { Stored } from '../lib/rules'
import { fixture, mainHtml, renderAt, resetStore, seed } from '../test/renderAt'
import CategoryList from './CategoryList'

describe('/boys and /girls', () => {
  beforeEach(() => seed(fixture))
  afterEach(resetStore)

  it('lists only boys names on /boys, as links in a list', () => {
    const html = renderAt('/boys')
    expect(html).toContain('<ul')
    for (const n of fixture.boys.first) expect(html).toContain(`>${n.replace("'", '&#x27;')} Hannam</a>`)
    expect(html).toContain('href="/boys/oliver"')
    for (const n of fixture.girls.first) expect(html).not.toContain(n)
  })

  it('keeps one content link per listed name (FR-008)', () => {
    const main = mainHtml(renderAt('/boys'))
    const anchors = main.match(/<a /g) ?? []
    expect(anchors).toHaveLength(fixture.boys.first.length)
    expect(main).toContain('href="/boys/oliver"')
  })

  it('lists only girls names on /girls', () => {
    const html = renderAt('/girls')
    expect(html).toContain('href="/girls/ada"')
    expect(html).not.toContain('Oliver')
  })

  it('shows an empty-state message when a category has no names', () => {
    const empty: Stored = { ...emptyStored, surname: 'X' }
    const html = renderToString(<CategoryList category="boys" names={empty} />)
    expect(html).toContain('No names yet')
    expect(html).not.toContain('<ul')
  })

  describe('as a fresh visitor (FR-001, SC-004)', () => {
    beforeEach(resetStore)

    it.each(['/boys', '/girls'])('%s shows the empty state and no sample names', (path) => {
      const html = renderAt(path)
      expect(html).toContain('No names yet.')
      expect(mainHtml(html)).not.toContain('<li')
      for (const sample of ['Oliver', 'Arthur', 'Finn', 'Ada', 'Zoë', 'Mary Ann']) expect(html).not.toContain(sample)
    })
  })

  describe('with a surname set', () => {
    it('shows a compact one-row add form with a role dropdown, "First and middle name" selected by default (FR-009)', () => {
      const html = mainHtml(renderAt('/boys'))
      // one row: name input, role dropdown, button, in that order
      const row = html.match(/<div class="add-row">([\s\S]*?)<\/div>/)?.[1] ?? ''
      expect(row.indexOf('<input')).toBeGreaterThanOrEqual(0)
      expect(row.indexOf('<input')).toBeLessThan(row.indexOf('<select'))
      expect(row.indexOf('<select')).toBeLessThan(row.indexOf('<button'))
      expect(row).toContain('>Add name</button>')
      // labelled controls without taking vertical space
      expect(row).toMatch(/<input[^>]*aria-label="Name"/)
      expect(row).toMatch(/<select[^>]*aria-label="Use as"/)
      // radios are gone
      expect(html).not.toContain('type="radio"')
      expect(html).not.toContain('<fieldset')
      // the dropdown offers both roles, first-and-middle selected
      const options = row.match(/<option[^>]*>[^<]*<\/option>/g) ?? []
      expect(options).toHaveLength(2)
      expect(options[0]).toContain('value="both"')
      expect(options[0]).toContain('First and middle name')
      expect(options[0]).toMatch(/selected/)
      expect(options[1]).toContain('value="middle"')
      expect(options[1]).toContain('Middle name only')
      expect(options[1]).not.toMatch(/selected/)
    })

    it('links added first-and-middle names and shows middle-only names without a link', () => {
      seed({ ...emptyStored, surname: 'Hannam', boys: { first: ['Noah'], middle: ['Noah', 'Lee'] } })
      const html = renderAt('/boys')
      expect(html).toContain('href="/boys/noah"')
      expect(html).toContain('>Lee<')
      expect(html).not.toContain('href="/boys/lee"')
    })

    it('does not show boys additions on /girls', () => {
      seed({ ...emptyStored, surname: 'Hannam', boys: { first: ['Noah'], middle: ['Noah'] } })
      expect(renderAt('/girls')).not.toContain('Noah')
    })
  })

  describe('with no surname set', () => {
    beforeEach(() => seed({ ...fixture, surname: undefined }))

    it('shows the last name prompt instead of the add-name form, and still lists names', () => {
      const html = renderAt('/girls')
      expect(html).toContain('Save last name')
      expect(html).not.toContain('Add name')
      expect(html).toContain('href="/girls/ada"')
    })

    it('shows the add-name form once a surname is saved', () => {
      seed({ ...emptyStored, surname: 'Hannam' })
      const html = renderAt('/girls')
      expect(html).toContain('Add name')
      expect(html).not.toContain('Save last name')
    })
  })

  describe('groups and delete controls (FR-002, FR-003)', () => {
    const groups: Stored = {
      ...emptyStored,
      surname: 'Hannam',
      boys: { first: ['Oliver', 'arthur'], middle: ['arthur', 'Oliver', 'lee', 'James'] },
    }
    beforeEach(() => seed(groups))

    it('shows first-and-middle names as links and middle-only names as plain text, alphabetically', () => {
      const main = mainHtml(renderAt('/boys'))
      expect(main).toContain('First names (Click to see with middle names)')
      expect(main).toContain('Middle names only')
      expect(main.indexOf('href="/boys/arthur"')).toBeLessThan(main.indexOf('href="/boys/oliver"'))
      expect(main).toContain('>arthur Hannam</a>')
      expect(main).toContain('>Oliver Hannam</a>')
      expect(main.indexOf('>James<')).toBeLessThan(main.indexOf('>lee<'))
      expect(main).not.toContain('href="/boys/lee"')
      expect(main).not.toContain('href="/boys/james"')
      expect((main.match(/>arthur/g) ?? []).length).toBe(1)
    })

    it('reads "First Last" when a last name is set, and just the first name when not', () => {
      expect(mainHtml(renderAt('/boys'))).toContain('>Oliver Hannam</a>')
      seed({ ...groups, surname: undefined })
      const main = mainHtml(renderAt('/boys'))
      expect(main).toContain('>Oliver</a>')
      expect(main).not.toContain('undefined')
    })

    it('puts the link and its buttons in one flex row, link first (layout hook)', () => {
      const main = mainHtml(renderAt('/boys'))
      expect(main).toMatch(
        /<li class="name-row"><a href="\/boys\/arthur">arthur Hannam<\/a><button[^>]*aria-label="Make middle only: arthur"[^>]*>Make middle only<\/button><button[^>]*aria-label="Delete arthur"/,
      )
      expect(main).toMatch(/<li class="name-row"><span>James<\/span><button[^>]*aria-label="Make first and middle: James"/)
    })

    it.each(['arthur', 'Oliver', 'James', 'lee'])('has a delete button for %s', (name) => {
      expect(mainHtml(renderAt('/boys'))).toContain(`aria-label="Delete ${name}"`)
    })

    it('offers the right role change per group (FR-007, FR-008)', () => {
      const main = mainHtml(renderAt('/boys'))
      for (const name of ['arthur', 'Oliver']) expect(main).toContain(`aria-label="Make middle only: ${name}"`)
      for (const name of ['James', 'lee']) expect(main).toContain(`aria-label="Make first and middle: ${name}"`)
      expect(main).not.toContain('aria-label="Make first and middle: arthur"')
      expect(main).not.toContain('aria-label="Make middle only: lee"')
      expect(main).toContain('>Make middle only</button>')
      expect(main).toContain('>Make first and middle</button>')
    })

    it('shows the empty state and no group headings when both groups are empty', () => {
      seed({ ...emptyStored, surname: 'Hannam' })
      const main = mainHtml(renderAt('/boys'))
      expect(main).toContain('No names yet.')
      expect(main).not.toContain('First names (Click')
      expect(main).not.toContain('Middle names only')
    })

    it('omits the middle-only heading when there are no middle-only names', () => {
      seed({ ...emptyStored, surname: 'Hannam', boys: { first: ['Noah'], middle: ['Noah'] } })
      const main = mainHtml(renderAt('/boys'))
      expect(main).toContain('First names (Click to see with middle names)')
      expect(main).not.toContain('Middle names only')
    })

    it('shows delete buttons with no last name set', () => {
      seed({ ...groups, surname: undefined })
      expect(mainHtml(renderAt('/boys'))).toContain('aria-label="Delete Oliver"')
    })
  })
})
