import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * One "⋯" menu per name, so rows stay calm. Native <details> handles toggling and keyboard;
 * while open, a press anywhere outside it or Escape closes it (Escape returns focus to ⋯).
 * Presses and Escape inside an open dialog (e.g. the delete confirmation) are left to the dialog.
 */
export default function RowMenu({ name, children }: { name: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const d = ref.current
    const inDialog = (t: EventTarget | null) => t instanceof Element && !!t.closest('dialog')
    const onPointerDown = (e: PointerEvent) => {
      if (d && !d.contains(e.target as Node) && !inDialog(e.target)) d.open = false
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !d || document.querySelector('dialog[open]')) return
      d.open = false
      d.querySelector('summary')?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <details ref={ref} className="row-menu" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary aria-label={`Actions for ${name}`}>⋯</summary>
      <div className="row-menu-items">{children}</div>
    </details>
  )
}
