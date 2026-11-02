import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { config } from '../data/config'
import type { Config } from '../data/config'
import { renderAt } from '../test/renderAt'
import CategoryList from './CategoryList'

describe('/boys and /girls', () => {
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
    const empty: Config = { surname: 'X', boys: { first: [], middle: [] }, girls: { first: [], middle: [] } }
    const html = renderToString(<CategoryList category="boys" cfg={empty} />)
    expect(html).toContain('No names yet')
    expect(html).not.toContain('<ul')
  })
})
