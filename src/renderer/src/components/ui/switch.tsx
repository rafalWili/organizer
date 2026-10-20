import { cn } from '@/lib/cn'

export function Switch({
  checked,
  onCheckedChange,
  labelledBy
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  labelledBy?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition',
          checked && 'translate-x-5'
        )}
      />
    </button>
  )
}
