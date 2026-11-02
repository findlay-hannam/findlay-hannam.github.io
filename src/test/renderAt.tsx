import { renderToString } from 'react-dom/server'
import { Router } from 'wouter'
import App from '../App'

export const renderAt = (path: string) =>
  renderToString(
    <Router ssrPath={path}>
      <App />
    </Router>,
  )
