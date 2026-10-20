import { Cake, CalendarDays, Gift, PartyPopper, Users } from 'lucide-react'
import { bucketUpcoming, celebrationOnYear, upcomingBirthdays } from '@shared/birthdays'
import { messages } from '@shared/i18n'
import { displayName } from '@shared/names'
import { useAppState } from '@/contexts/AppState'
import { daysText, formatCalendarDate, monthTitle } from '@/lib/format'
import { look } from '@/lib/look'
import { PageHeader } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/contacts/Avatar'
import { MonthGrid, shiftMonth } from '@/components/calendar/MonthGrid'
import { cn } from '@/lib/cn'
import type { UpcomingBirthday } from '@shared/types'

export function DashboardPage() {
  const { contacts, settings, today, openCalendar, openEdit, setPage } = useAppState()
  const copy = messages(settings.language)
  const visual = look(settings.language)
  const upcoming = upcomingBirthdays(contacts, today, settings.feb29Behavior)
  const buckets = bucketUpcoming(upcoming)
  const thisMonth = contacts.filter((contact) => {
    const celebration = celebrationOnYear(contact.birthMonth, contact.birthDay, today.year, settings.feb29Behavior)
    return celebration.month === today.month && celebration.year === today.year
  }).length
  const nearest = buckets.all.slice(0, 5)

  return (
    <div>
      <PageHeader title={`${visual.welcome} 👋`} subtitle={visual.upcomingLine.replace('{count}', String(buckets.next30.length))} />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat icon={Cake} tint="bg-[#f6f1ff] text-primary" label={copy.dashboard.today} value={buckets.today.length} hint={buckets.today.length === 1 ? visual.personHas : visual.peopleHave} />
            <Stat icon={Gift} tint="bg-[#fff6ee] text-orange-500" label={copy.dashboard.tomorrow} value={buckets.tomorrow.length} hint={visual.peopleHave} />
            <Stat icon={CalendarDays} tint="bg-[#eef6ff] text-sky-500" label={visual.nearest} value={buckets.next7.length} hint={visual.within7} />
          </div>
          <Card className="mt-4 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-medium">
                <Cake size={16} className="text-primary" />
                {visual.nearest}
              </h2>
              <button type="button" className="text-sm text-primary" onClick={() => setPage('contacts')}>
                {visual.seeAll} →
              </button>
            </div>
            {nearest.length === 0 ? (
              <p className="text-sm text-muted-foreground">{copy.dashboard.empty}</p>
            ) : (
              <ul className="divide-y divide-border">
                {nearest.map((item) => (
                  <li key={item.contact.id}>
                    <button type="button" onClick={() => openEdit(item.contact)} className="flex w-full items-center gap-3 py-3 text-left">
                      <Avatar contact={item.contact} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{displayName(item.contact)}</span>
                        <span className="text-xs text-muted-foreground">
                          {daysText(settings.language, item.daysUntil)}, {formatCalendarDate(item.celebration, settings.language, 'd MMMM')}
                        </span>
                      </span>
                      <WhenPill days={item.daysUntil} language={settings.language} todayLabel={visual.todayBang} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="mt-4 p-4">
            <h2 className="mb-3 font-medium">{visual.stats}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat icon={Users} value={contacts.length} label={visual.contactsWord} />
              <MiniStat icon={PartyPopper} value={thisMonth} label={visual.thisMonthWord} />
              <MiniStat icon={Gift} value={buckets.next7.length} label={visual.weekWord} />
            </div>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">{monthTitle(today, settings.language)}</h2>
              <div className="flex gap-1">
                <button type="button" className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted" onClick={() => openCalendar(shiftMonth(today, -1))} aria-label="-">
                  ‹
                </button>
                <button type="button" className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted" onClick={() => openCalendar(shiftMonth(today, 1))} aria-label="+">
                  ›
                </button>
              </div>
            </div>
            <MonthGrid
              compact
              cursor={today}
              today={today}
              selected={today}
              contacts={contacts}
              feb29={settings.feb29Behavior}
              language={settings.language}
              onSelect={openCalendar}
            />
          </Card>
          <div className="rounded-3xl bg-gradient-to-br from-[#f7f2ff] to-[#eef4ff] p-4 text-sm dark:from-accent dark:to-muted">
            <p className="font-medium">{visual.promoTitle}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{visual.promoBody}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  tint,
  label,
  value,
  hint
}: {
  icon: typeof Cake
  tint: string
  label: string
  value: number
  hint: string
}) {
  return (
    <Card className="p-4">
      <span className={cn('grid h-9 w-9 place-items-center rounded-2xl', tint)}>
        <Icon size={16} />
      </span>
      <div className="mt-3 text-sm text-muted-foreground">{label}</div>
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </Card>
  )
}

function MiniStat({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-muted px-3 py-3">
      <Icon size={16} className="text-primary" />
      <div className="mt-2 text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

export function WhenPill({ days, language, todayLabel }: { days: number; language: 'pl' | 'en'; todayLabel: string }) {
  const label = days === 0 ? todayLabel : daysText(language, days)
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap',
        days === 0 && 'bg-rose-50 text-rose-500',
        days === 1 && 'bg-amber-50 text-amber-600',
        days > 1 && 'bg-violet-50 text-violet-600'
      )}
    >
      {label}
    </span>
  )
}

export type { UpcomingBirthday }
