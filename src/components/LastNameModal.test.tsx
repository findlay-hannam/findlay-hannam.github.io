import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { emptyStored } from '../lib/rules'
import { resetStore, seed } from '../test/renderAt'
import LastNameModal from './LastNameModal'
import SurnameForm from './SurnameForm'

describe('LastNameModal markup (FR-003, FR-007)', () => {
  afterEach(resetStore)

  it('is a labelled dialog with a title, a prefilled field, Save and Close', () => {
    seed({ ...emptyStored, surname: 'Hannam' })
    const html = renderToString(<LastNameModal onClose={() => {}} />)
    expect(html).toMatch(/<dialog[^>]*aria-labelledby="last-name-title"/)
    expect(html).not.toMatch(/<dialog[^>]*\sopen/)
    expect(html).toMatch(/<h2[^>]*id="last-name-title"[^>]*>Set last name<\/h2>/)
    expect(html).toMatch(/<label[^>]*>\s*Last name\s*<input[^>]*value="Hannam"/)
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*>Save last name<\/button>/)
    expect(html).toMatch(/<button[^>]*type="button"[^>]*>Close<\/button>/)
    expect(html).not.toMatch(/surname/i)
  })

  it('has an empty field when no last name is saved', () => {
    resetStore()
    const html = renderToString(<LastNameModal onClose={() => {}} />)
    expect(html).not.toContain('value="Hannam"')
    expect(html).not.toContain('undefined')
    expect(html).toContain('Save last name')
  })
})

describe('in-page last-name form (FR-012)', () => {
  it('has no Close button', () => {
    const html = renderToString(<SurnameForm />)
    expect(html).toContain('Save last name')
    expect(html).not.toContain('Close')
  })
})
