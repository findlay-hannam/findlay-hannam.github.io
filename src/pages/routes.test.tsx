import { describe, expect, it } from 'vitest'
import { renderAt } from '../test/renderAt'

describe('routes', () => {
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
