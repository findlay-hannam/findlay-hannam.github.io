import { persist, store } from '../lib/store'
import { removeName } from '../lib/rules'
import type { CategoryId } from '../lib/rules'

type Props = { category: CategoryId; name: string; onDeleted?: () => void }

export default function DeleteButton({ category, name, onDeleted }: Props) {
  function onClick() {
    if (!window.confirm(`Delete ${name}?`)) return
    persist(removeName(store.getSnapshot(), category, name))
    onDeleted?.()
  }

  return (
    <button type="button" className="secondary outline" aria-label={`Delete ${name}`} onClick={onClick}>
      Delete
    </button>
  )
}
