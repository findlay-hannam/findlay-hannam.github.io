import { useState } from 'react'
import type { FormEvent } from 'react'
import { setSurname } from '../lib/rules'
import { store, useNames } from '../lib/store'

type Props = {
  /** Called after a valid save, with whether it could be kept beyond this visit. */
  onSaved?: (persisted: boolean) => void
  /** When given, a Close button is shown after Save. */
  onClose?: () => void
}

export default function SurnameForm({ onSaved, onClose }: Props) {
  const { surname } = useNames()
  const [value, setValue] = useState(surname ?? '')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const r = setSurname(store.getSnapshot(), value)
    if (!r.ok) return setError(r.error)
    setError('')
    const persisted = store.save(r.value)
    setNotice(persisted ? '' : 'Saved for this visit only. Browser storage is unavailable.')
    onSaved?.(persisted)
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Last name
        <input value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={error ? true : undefined} />
      </label>
      {error && <small role="alert">{error}</small>}
      {notice && <small role="status">{notice}</small>}
      <button type="submit">Save last name</button>
      {onClose && (
        <button type="button" className="secondary" onClick={onClose}>
          Close
        </button>
      )}
    </form>
  )
}
