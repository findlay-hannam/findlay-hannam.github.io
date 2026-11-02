import { renderToString } from 'react-dom/server'
import { Router } from 'wouter'
import App from '../App'
import { emptyStored } from '../lib/rules'
import type { Stored } from '../lib/rules'
import { store } from '../lib/store'

export const seed = (stored: Stored) => void store.save(stored)
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

export const navLinks = (html: string) =>
  [...navHtml(html).matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({ href: m[1], text: m[2] }))

export const mainHtml = (html: string) => html.match(/<main\b[^>]*>([\s\S]*)<\/main>/)?.[1] ?? ''
