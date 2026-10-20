import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Tabs({
  tabs,
  value,
  onChange
}: {
  tabs: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div role="tablist" className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-xl px-3 py-1.5 text-sm transition',
            value === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function TabPanel({ id, active, children }: { id: string; active: string; children: ReactNode }) {
  if (id !== active) return null
  return (
    <div role="tabpanel" className="mt-4">
      {children}
    </div>
  )
}
