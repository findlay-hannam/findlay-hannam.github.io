import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { emptyStored } from '../lib/rules'
import { renderAt, resetStore, seed } from '../test/renderAt'

describe('routes', () => {
  beforeEach(() => seed({ ...emptyStored, surname: 'Hannam' }))
  afterEach(resetStore)

  it('/ prompts for a surname when unset, and still links to Boys and Girls', () => {
    resetStore()
    const html = renderAt('/')
    expect(html).toContain('<label')
    expect(html).toContain('Surname')
    expect(html).toContain('Save surname')
    expect(html).toContain('Set your surname to see full names.')
    expect(html).toContain('href="/boys"')
    expect(html).toContain('href="/girls"')
  })

  it('/ shows the surname with a change form when set', () => {
    seed({ ...emptyStored, surname: 'Smith' })
    const html = renderAt('/')
    expect(html).toContain('Smith')
    expect(html).toContain('Save surname')
    expect(html).not.toContain('Set your surname to see full names.')
    expect(html).toContain('href="/boys"')
  })

  it('/ links to Boys and Girls', () => {
    const html = renderAt('/')
    expect(html).toContain('href="/boys"')
    expect(html).toContain('href="/girls"')
  })

  it.each(['/nope', '/nope/x', '/boys/oliver/extra', '/a/b/c'])('%s shows not found with a link home', (path) => {
    const html = renderAt(path)
    expect(html).toContain('Page not found')
    expect(html).toContain('href="/"')
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
