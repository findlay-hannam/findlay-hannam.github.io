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
        { tag: 'button', text: 'Last name: Hannam' },
      ])
      expect(navHtml(html)).toContain('<button type="button"')
      expect(navHtml(html)).toContain('aria-haspopup="dialog"')
      expect(html.indexOf('<nav')).toBeLessThan(html.indexOf('<main'))
      expect(html).not.toContain('<dialog')
    })

    it('has no site title or tagline above the nav (more room for content)', () => {
      const html = renderAt('/')
      const aboveMain = html.slice(0, html.indexOf('<main')).replace(/<title>[\s\S]*?<\/title>/g, '')
      expect(aboveMain).not.toContain('<h1')
      expect(aboveMain).not.toContain('<hgroup')
      expect(aboveMain).not.toContain('Baby Names')
      expect(aboveMain).not.toContain('Combine, organise')
    })

    it('is identical on every page apart from which pill is marked current', () => {
      const bare = (path: string) => navHtml(renderAt(path)).replace(/ aria-current="[^"]*"/g, '')
      const first = bare(paths[0])
      for (const path of paths) expect(bare(path)).toBe(first)
    })

    it.each([
      ['/boys', 'Boys', 'page'],
      ['/Boys/', 'Boys', 'page'],
      ['/boys/oliver', 'Boys', 'true'],
      ['/girls', 'Girls', 'page'],
      ['/girls/ada', 'Girls', 'true'],
    ])('%s marks the %s pill as current (%s) and no other', (path, label, value) => {
      const tags = navHtml(renderAt(path)).match(/<a\b[^>]*>[^<]*<\/a>/g) ?? []
      const current = tags.filter((t) => t.includes('aria-current'))
      expect(current).toHaveLength(1)
      expect(current[0]).toContain(`aria-current="${value}"`)
      expect(current[0]).toContain(`>${label}<`)
    })

    it.each(['/', '/nope'])('%s marks no pill as current', (path) => {
      expect(navHtml(renderAt(path))).not.toContain('aria-current')
    })

    it('shows the saved last name on the button, or "Set Last Name" when none (suggestion 7)', () => {
      expect(navItems(renderAt('/boys'))[2]).toEqual({ tag: 'button', text: 'Last name: Hannam' })
      resetStore()
      expect(navItems(renderAt('/boys'))[2]).toEqual({ tag: 'button', text: 'Set Last Name' })
      expect(navHtml(renderAt('/boys'))).not.toContain('undefined')
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

  describe('page titles (suggestion 10)', () => {
    it.each([
      ['/', 'Baby Names'],
      ['/boys', 'Boys names · Baby Names'],
      ['/girls', 'Girls names · Baby Names'],
      ['/boys/oliver', 'Oliver · Baby Names'],
      ['/boys/nope', 'Name not found · Baby Names'],
      ['/nope', 'Page not found · Baby Names'],
    ])('%s is titled "%s"', (path, title) => {
      const titles = renderAt(path).match(/<title>([\s\S]*?)<\/title>/g) ?? []
      expect(titles).toEqual([`<title>${title}</title>`])
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
