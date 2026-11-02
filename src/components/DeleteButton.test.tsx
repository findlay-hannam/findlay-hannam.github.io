import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import DeleteButton, { ConfirmDelete } from './DeleteButton'

describe('DeleteButton (suggestion 8: themed confirmation)', () => {
  it('renders just the labelled button until asked', () => {
    const html = renderToString(<DeleteButton category="boys" name="Noah" />)
    expect(html).toMatch(/<button[^>]*aria-label="Delete Noah"[^>]*>Delete<\/button>/)
    expect(html).not.toContain('<dialog')
  })

  it('asks in a themed dialog: title, explanation, Cancel before Delete', () => {
    const html = renderToString(<ConfirmDelete category="boys" name="Noah" onClose={() => {}} />)
    expect(html).toMatch(/<dialog[^>]*aria-labelledby="delete-title"/)
    expect(html).toMatch(/<h2[^>]*id="delete-title"[^>]*>Delete Noah\?<\/h2>/)
    expect(html).toContain('Noah will be removed from the boys names and every combination.')
    const cancel = html.indexOf('>Cancel</button>')
    const del = html.indexOf('>Delete</button>')
    expect(cancel).toBeGreaterThan(-1)
    expect(del).toBeGreaterThan(cancel)
  })
})
