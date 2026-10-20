import { CalendarDays, Gift, Heart, House, Settings, Users } from 'lucide-react'
import { messages } from '@shared/i18n'
import type { PageId } from '@shared/types'
import { cn } from '@/lib/cn'
import { look } from '@/lib/look'
import { useAppState } from '@/contexts/AppState'

const items: { id: PageId; icon: typeof House }[] = [
  { id: 'dashboard', icon: House },
  { id: 'calendar', icon: CalendarDays },
  { id: 'contacts', icon: Users },
  { id: 'settings', icon: Settings }
]

export function Sidebar() {
  const { page, setPage, settings } = useAppState()
  const copy = messages(settings.language)
  const visual = look(settings.language)

  return (
    <aside className="flex w-[15.5rem] shrink-0 flex-col border-r border-border bg-sidebar px-4 py-5">
      <div className="mb-8 flex items-center gap-3 px-2">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-primary">
          <Gift size={20} />
        </span>
        <div>
          <div className="text-[15px] font-semibold tracking-tight">{copy.appName}</div>
          <div className="max-w-[9.5rem] text-[11px] leading-4 text-muted-foreground">{visual.tagline}</div>
        </div>
      </div>
      <nav aria-label={copy.navLabel} className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const label = copy.nav[item.id]
          const active = page === item.id
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => setPage(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition',
                active ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        })}
      </nav>
      <div className="mt-auto rounded-3xl bg-gradient-to-b from-[#f7f3ff] to-[#f3eeff] p-4 text-sm dark:from-accent dark:to-muted">
        <Gift className="mb-3 text-primary" size={28} />
        <p className="font-medium leading-5">{visual.promoTitle}</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{visual.promoBody}</p>
        <Heart className="mt-4 text-primary" size={16} />
      </div>
    </aside>
  )
}
