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
