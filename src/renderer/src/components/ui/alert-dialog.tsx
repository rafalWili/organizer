import type { ReactNode } from 'react'
import { Button } from './button'
import { Dialog } from './dialog'

export function AlertDialog({
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
  pending = false
}: {
  title: string
  body: ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onClose: () => void
  pending?: boolean
}) {
  return (
    <Dialog title={title} onClose={onClose}>
      <p className="text-sm text-muted-foreground">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
