import { useEffect, useRef } from 'react'
import SurnameForm from './SurnameForm'

/** A modal dialog for setting the last name. Mounted only while open; every close goes through dialog.close(). */
export default function LastNameModal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const downOnBackdrop = useRef(false)

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby="last-name-title"
      onClose={onClose}
      // Close on a click outside the card, but only if the press also started outside, so
      // dragging a text selection out of the input does not close it.
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (downOnBackdrop.current && e.target === e.currentTarget) e.currentTarget.close()
      }}
    >
      <article>
        <header>
          <h2 id="last-name-title">Set last name</h2>
        </header>
        <SurnameForm
          onSaved={(persisted) => {
            if (persisted) ref.current?.close()
          }}
          onClose={() => ref.current?.close()}
        />
      </article>
    </dialog>
  )
}
