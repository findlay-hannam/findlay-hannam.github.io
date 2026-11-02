import { useState } from 'react'
import { demote, promote } from '../lib/rules'
import type { CategoryId } from '../lib/rules'
import { persist, store } from '../lib/store'

type Props = {
  category: CategoryId
  name: string
  to: 'first' | 'middle'
  /** Full visible text (and accessible name) instead of the short default, e.g. "Make Lee a first name". */
  label?: string
}

export default function MoveButton({ category, name, to, label: fullLabel }: Props) {
  const [error, setError] = useState('')
  const label = fullLabel ?? (to === 'middle' ? 'Make middle only' : 'Make first and middle')
  const ariaLabel = fullLabel ?? `${label}: ${name}`

  function onClick() {
    if (to === 'middle') return persist(demote(store.getSnapshot(), category, name))
    const r = promote(store.getSnapshot(), category, name)
    if (!r.ok) return setError(r.error)
    setError('')
    persist(r.value)
  }

  return (
    <>
      <button type="button" className="secondary outline" aria-label={ariaLabel} onClick={onClick}>
        {label}
      </button>
      {error && <small role="alert">{error}</small>}
    </>
  )
}
