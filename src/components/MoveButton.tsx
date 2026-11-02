import { useState } from 'react'
import { demote, promote } from '../lib/rules'
import type { CategoryId } from '../lib/rules'
import { persist, store } from '../lib/store'

type Props = { category: CategoryId; name: string; to: 'first' | 'middle' }

export default function MoveButton({ category, name, to }: Props) {
  const [error, setError] = useState('')
  const label = to === 'middle' ? 'Make middle only' : 'Make first and middle'

  function onClick() {
    if (to === 'middle') return persist(demote(store.getSnapshot(), category, name))
    const r = promote(store.getSnapshot(), category, name)
    if (!r.ok) return setError(r.error)
    setError('')
    persist(r.value)
  }

  return (
    <>
      <button type="button" className="secondary outline" aria-label={`${label}: ${name}`} onClick={onClick}>
        {label}
      </button>
      {error && <small role="alert">{error}</small>}
    </>
  )
}
