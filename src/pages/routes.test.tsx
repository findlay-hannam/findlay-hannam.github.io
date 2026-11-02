import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { fixture, mainHtml, navCount, navHtml, navItems, renderAt, resetStore, seed } from '../test/renderAt'

describe('routes', () => {
  beforeEach(() => seed(fixture))
  afterEach(resetStore)

  describe('header on every page (FR-001–FR-005)', () => {
    const paths = ['/', '/boys', '/girls', '/boys/oliver', '/boys/nope', '/nope', '/Boys/', '/boys/oliver/extra']

    it.each(paths)('%s has one labelled nav with Boys, Girls, Set Last Name in order', (path) => {
      const html = renderAt(path)
      expect(navCount(html)).toBe(1)
      expect(navHtml(html)).toContain('aria-label="Main"')
      expect(navItems(html)).toEqual([
        { tag: 'a', href: '/boys', text: 'Boys' },
        { tag: 'a', href: '/girls', text: 'Girls' },
        { tag: 'button', text: 'Set Last Name' },
      ])
      expect(navHtml(html)).toContain('<button type="button"')
      expect(navHtml(html)).toContain('aria-haspopup="dialog"')
      expect(html.indexOf('<nav')).toBeLessThan(html.indexOf('<main'))
      expect(html).not.toContain('<dialog')
    })

    it('has no site title or tagline above the nav (more room for content)', () => {
      const html = renderAt('/')
      const aboveMain = html.slice(0, html.indexOf('<main'))
      expect(aboveMain).not.toContain('<h1')
      expect(aboveMain).not.toContain('<hgroup')
      expect(aboveMain).not.toContain('Baby Names')
      expect(aboveMain).not.toContain('Combine, organise')
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

  describe('section theme and nav pills', () => {
    it.each([
      ['/boys', 'boys'],
      ['/Boys/', 'boys'],
      ['/boys/oliver', 'boys'],
      ['/boys/nope', 'boys'],
      ['/girls', 'girls'],
      ['/girls/ada', 'girls'],
      ['/', 'home'],
      ['/nope', 'home'],
      ['/nope/x', 'home'],
    ])('%s is themed %s', (path, theme) => {
      expect(renderAt(path)).toContain(`data-category="${theme}"`)
    })

    it('colour-codes the nav links by destination', () => {
      const tags = navHtml(renderAt('/')).match(/<(?:a|button)\b[^>]*>/g) ?? []
      expect(tags).toHaveLength(3)
      expect(tags[0]).toContain('pill-boys')
      expect(tags[1]).toContain('pill-girls')
      expect(tags[2]).toContain('pill-home')
    })
  })

  describe('homepage (FR-010, FR-011)', () => {
    const paragraph = (html: string) => (mainHtml(html).match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '').replace(/<[^>]*>/g, '')

    it('has a heading and one short purpose statement', () => {
      const main = mainHtml(renderAt('/'))
      expect(main).toContain('<h1>Baby Names</h1>')
      expect(main.match(/<p\b/g) ?? []).toHaveLength(1)
      const text = paragraph(renderAt('/'))
      expect((text.match(/[.!?](\s|$)/g) ?? []).length).toBeLessThanOrEqual(2)
      expect(text.trim().split(/\s+/).length).toBeLessThanOrEqual(40)
      expect(text).toContain('first and middle names')
      expect(text).toContain('last name')
      expect(text).toContain('boys and girls')
    })

    it('has no form, link, button or navigation in its content', () => {
      const main = mainHtml(renderAt('/'))
      for (const tag of ['<form', '<input', '<button', '<a ', '<nav']) expect(main).not.toContain(tag)
    })

    it('no longer has the old last-name prompt or status line', () => {
      const main = mainHtml(renderAt('/'))
      expect(main).not.toContain('Set your last name to see full names')
      expect(main).not.toContain('Last name:')
      expect(main).not.toContain('Save last name')
    })

    it('reads the same with and without a saved last name', () => {
      const withName = mainHtml(renderAt('/'))
      resetStore()
      expect(mainHtml(renderAt('/'))).toBe(withName)
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
