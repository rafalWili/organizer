import { useEffect, useRef, type ReactNode } from 'react'

export function Dialog({
  title,
  onClose,
  children,
  wide = false,
  drawer = false
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  drawer?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const suppressClose = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (!element.open) element.showModal()
    return () => {
      if (!element.open) return
      // Dev StrictMode closes and reopens the dialog. That close must not clear the form.
      suppressClose.current = true
      element.close()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      className={drawer ? 'drawer' : wide ? 'wide' : undefined}
      onClose={() => {
        if (suppressClose.current) {
          suppressClose.current = false
          return
        }
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={drawer ? 'h-full overflow-auto p-6' : 'max-h-[calc(100vh-4rem)] overflow-auto p-5'}>
        <div className="flex items-start justify-between gap-3">
          <h2 id="dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="close">
            ×
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  )
}
