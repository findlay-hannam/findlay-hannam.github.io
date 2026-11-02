import { useState } from 'react'
import type { FormEvent } from 'react'
import { setSurname } from '../lib/rules'
import { store, useNames } from '../lib/store'

export default function SurnameForm() {
  const { surname } = useNames()
  const [value, setValue] = useState(surname ?? '')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const r = setSurname(store.getSnapshot(), value)
    if (!r.ok) return setError(r.error)
    setError('')
    setNotice(store.save(r.value) ? '' : 'Saved for this visit only. Browser storage is unavailable.')
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Surname
        <input value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={error ? true : undefined} />
      </label>
      {error && <small role="alert">{error}</small>}
      {notice && <small role="status">{notice}</small>}
      <button type="submit">Save surname</button>
    </form>
  )
}
