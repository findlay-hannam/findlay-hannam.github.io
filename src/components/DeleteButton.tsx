import { useState } from 'react'
import { removeName } from '../lib/rules'
import type { CategoryId } from '../lib/rules'
import { persist, store } from '../lib/store'
import Modal from './Modal'

type Props = { category: CategoryId; name: string; onDeleted?: () => void }

/** The themed "are you sure?" dialog. Cancel comes first, so it gets the initial focus. */
export function ConfirmDelete({ category, name, onClose, onDeleted }: Props & { onClose: () => void }) {
  return (
    <Modal title={`Delete ${name}?`} titleId="delete-title" onClose={onClose}>
      {(close) => (
        <>
          <p>{`${name} will be removed from the ${category} names and every combination.`}</p>
          <div className="dialog-actions">
            <button type="button" className="secondary" onClick={close}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                close()
                persist(removeName(store.getSnapshot(), category, name))
                onDeleted?.()
              }}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

export default function DeleteButton({ category, name, onDeleted }: Props) {
  const [asking, setAsking] = useState(false)
  return (
    <>
      <button type="button" className="secondary outline" aria-label={`Delete ${name}`} onClick={() => setAsking(true)}>
        Delete
      </button>
      {asking && <ConfirmDelete category={category} name={name} onDeleted={onDeleted} onClose={() => setAsking(false)} />}
    </>
  )
}
