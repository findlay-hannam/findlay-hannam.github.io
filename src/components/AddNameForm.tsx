import { useState } from 'react'
import type { FormEvent } from 'react'
import { addName } from '../lib/rules'
import type { CategoryId, Role } from '../lib/rules'
import { store } from '../lib/store'

export default function AddNameForm({ category }: { category: CategoryId }) {
  const [value, setValue] = useState('')
  const [role, setRole] = useState<Role>('both')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const r = addName(store.getSnapshot(), category, value, role)
    if (!r.ok) return setError(r.error)
    setError('')
    setValue('')
    setRole('both')
    setNotice(store.save(r.value) ? '' : 'Saved for this visit only. Browser storage is unavailable.')
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Name
        <input value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={error ? true : undefined} />
      </label>
      <fieldset>
        <legend>Use as</legend>
        <label>
          <input type="radio" name="role" checked={role === 'both'} onChange={() => setRole('both')} />
          First and middle name
        </label>
        <label>
          <input type="radio" name="role" checked={role === 'middle'} onChange={() => setRole('middle')} />
          Middle name only
        </label>
      </fieldset>
      {error && <small role="alert">{error}</small>}
      {notice && <small role="status">{notice}</small>}
      <button type="submit">Add name</button>
    </form>
  )
}
