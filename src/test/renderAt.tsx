import { renderToString } from 'react-dom/server'
import { Router } from 'wouter'
import App from '../App'
import { emptyStored, tidy } from '../lib/rules'
import type { Stored } from '../lib/rules'
import { store } from '../lib/store'

export const seed = (stored: Stored) => void store.save(tidy(stored))

// Shared page-test data: every first name is also a middle name (the stored-data invariant).
export const fixture: Stored = {
  surname: 'Hannam',
  boys: { first: ['Arthur', 'Oliver'], middle: ['Arthur', 'Edward', 'James', 'Oliver'] },
  girls: { first: ['Ada'], middle: ['Ada', 'Rose'] },
}
export const resetStore = () => void store.save(emptyStored)

export const renderAt = (path: string) =>
  renderToString(
    <Router ssrPath={path}>
      <App />
    </Router>,
  )

// Test helpers for inspecting rendered markup.
export const navCount = (html: string) => (html.match(/<nav\b/g) ?? []).length

export const navHtml = (html: string) => html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? ''

/** Every link and button in the first <nav>, in document order. `href` only for anchors. */
export const navItems = (html: string) =>
  [...navHtml(html).matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)].map((m) => {
    const href = m[2].match(/href="([^"]*)"/)?.[1]
    return {
      tag: m[1] as 'a' | 'button',
      ...(href === undefined ? {} : { href }),
      text: m[3].replace(/<[^>]*>/g, '').trim(),
    }
  })

export const mainHtml = (html: string) => html.match(/<main\b[^>]*>([\s\S]*)<\/main>/)?.[1] ?? ''
