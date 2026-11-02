import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { emptyStored } from '../lib/rules'
import { mainHtml, navCount, navHtml, navLinks, renderAt, resetStore, seed } from '../test/renderAt'

describe('routes', () => {
  beforeEach(() => seed({ ...emptyStored, surname: 'Hannam' }))
  afterEach(resetStore)

  describe('header on every page (FR-001–FR-005)', () => {
    const paths = ['/', '/boys', '/girls', '/boys/oliver', '/boys/nope', '/nope', '/Boys/', '/boys/oliver/extra']

    it.each(paths)('%s has one labelled nav with Boys, Girls, Set Last Name in order', (path) => {
      const html = renderAt(path)
      expect(navCount(html)).toBe(1)
      expect(navHtml(html)).toContain('aria-label="Main"')
      expect(navLinks(html)).toEqual([
        { href: '/boys', text: 'Boys' },
        { href: '/girls', text: 'Girls' },
        { href: '/', text: 'Set Last Name' },
      ])
      expect(html.indexOf('<nav')).toBeLessThan(html.indexOf('<main'))
    })

    it('is identical on every page', () => {
      const first = navHtml(renderAt(paths[0]))
      for (const path of paths) expect(navHtml(renderAt(path))).toBe(first)
    })

    it('is identical with and without a last name set', () => {
      const set = navHtml(renderAt('/'))
      resetStore()
      expect(navHtml(renderAt('/'))).toBe(set)
    })
  })

  describe('last name wording on / (FR-011)', () => {
    it('prompts for a last name when unset', () => {
      resetStore()
      const html = renderAt('/')
      expect(html).toContain('<label')
      expect(html).toContain('Last name')
      expect(html).toContain('Save last name')
      expect(html).toContain('Set your last name to see full names.')
      expect(mainHtml(html)).not.toMatch(/surname/i)
    })

    it('shows the last name with a change form when set', () => {
      seed({ ...emptyStored, surname: 'Smith' })
      const html = renderAt('/')
      expect(html).toContain('Last name: Smith')
      expect(html).toContain('Save last name')
      expect(html).not.toContain('Set your last name to see full names.')
      expect(mainHtml(html)).not.toMatch(/surname/i)
    })
  })

  it('/ has no navigation in its content (FR-006)', () => {
    const main = mainHtml(renderAt('/'))
    expect(main).not.toContain('<nav')
    expect(main).not.toContain('href="/boys"')
    expect(main).not.toContain('href="/girls"')
  })

  it.each(['/nope', '/nope/x', '/boys/oliver/extra', '/a/b/c'])('%s shows not found with no links in its content', (path) => {
    const html = renderAt(path)
    expect(html).toContain('Page not found')
    expect(html).not.toContain('Back home')
    expect(mainHtml(html)).not.toContain('<a ')
  })

  it.each([
    ['/Boys', '/boys'],
    ['/boys/', '/boys'],
    ['/BOYS/', '/boys'],
    ['/boys/OLIVER', '/boys/oliver'],
    ['/Girls/Ada/', '/girls/ada'],
  ])('%s renders the same as %s', (path, canonical) => {
    expect(renderAt(path)).toBe(renderAt(canonical))
  })
})
