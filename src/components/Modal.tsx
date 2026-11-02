import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type Props = {
  title: string
  titleId: string
  onClose: () => void
  /** Receives `close`, which closes via the dialog so focus returns to the opener. */
  children: (close: () => void) => ReactNode
}

/**
 * A themed modal on the native <dialog>: Escape, focus trap, inert page and focus return
 * come from the platform. Mount it only while open; every close goes through dialog.close().
 */
export default function Modal({ title, titleId, onClose, children }: Props) {
  // The element comes in through a callback ref, so `close` uses state rather than reading a ref.
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null)
  const downOnBackdrop = useRef(false)
  const close = () => dialog?.close()

  useEffect(() => {
    if (dialog && !dialog.open) dialog.showModal()
  }, [dialog])

  return (
    <dialog
      ref={setDialog}
      aria-labelledby={titleId}
      onClose={onClose}
      // Close on a click outside the card, but only if the press also started outside, so
      // dragging a text selection out of an input does not close it.
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (downOnBackdrop.current && e.target === e.currentTarget) e.currentTarget.close()
      }}
    >
      <article>
        <header>
          <h2 id={titleId}>{title}</h2>
        </header>
        {children(close)}
      </article>
    </dialog>
  )
}
