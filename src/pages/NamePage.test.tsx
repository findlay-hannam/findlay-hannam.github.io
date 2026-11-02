import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Router } from 'wouter'
import { config } from '../data/config'
import type { Config } from '../data/config'
import { slugify } from '../lib/slug'
import { renderAt } from '../test/renderAt'
import NamePage from './NamePage'

const esc = (s: string) => s.replace(/'/g, '&#x27;')

describe('/<category>/<slug>', () => {
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

  it('shows not found with a link back to the list for an unknown slug', () => {
    const html = renderAt('/boys/nope')
    expect(html).toContain('Name not found')
    expect(html).toContain('href="/boys"')
  })

  it('treats a slug from the other category as not found', () => {
    expect(renderAt('/boys/ada')).toContain('Name not found')
  })

  it('shows an empty state when the category has no middle names', () => {
    const cfg: Config = { surname: 'X', boys: { first: ['Sam'], middle: [] }, girls: { first: [], middle: [] } }
    const html = renderToString(
      <Router ssrPath="/">
        <NamePage category="boys" slug="sam" cfg={cfg} />
      </Router>,
    )
    expect(html).toContain('No combinations yet')
  })

  it('renders every configured name page (SC-001)', () => {
    for (const category of ['boys', 'girls'] as const) {
      const { first, middle } = config[category]
      for (const name of first) {
        const html = renderAt(`/${category}/${slugify(name)}`)
        expect(html, name).toContain('<h2>' + esc(name))
        for (const m of middle) expect(html).toContain(esc(`${name} ${m} ${config.surname}`))
      }
    }
  })
})
