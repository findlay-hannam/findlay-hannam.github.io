import { useState } from 'react'
import type { FormEvent } from 'react'
import { addName } from '../lib/rules'
import type { CategoryId, Role } from '../lib/rules'
import { store } from '../lib/store'

export default function AddNameForm({ category, initialName = '' }: { category: CategoryId; initialName?: string }) {
  const [value, setValue] = useState(initialName)
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
    const added = `Added ${value.trim()} as ${role === 'both' ? 'a first and middle name' : 'a middle name only'}.`
    setNotice(store.save(r.value) ? added : 'Saved for this visit only. Browser storage is unavailable.')
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="add-row">
        <input
          aria-label="Name"
          placeholder="Name"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setNotice('')
          }}
          aria-invalid={error ? true : undefined}
        />
        <select aria-label="Use as" value={role} onChange={(e) => setRole(e.target.value === 'middle' ? 'middle' : 'both')}>
          <option value="both">First and middle name</option>
          <option value="middle">Middle name only</option>
        </select>
        <button type="submit">Add name</button>
      </div>
      {error && <small role="alert">{error}</small>}
      {notice && <small role="status">{notice}</small>}
    </form>
  )
}
