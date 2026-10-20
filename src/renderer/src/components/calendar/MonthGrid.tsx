import { birthdaysOnDate } from '@shared/birthdays'
import { addCalendarDays, sameCalendarDate, toCalendarDate } from '@shared/dates'
import type { CalendarDate, Contact, Feb29Behavior, Language } from '@shared/types'
import { cn } from '@/lib/cn'
import { messages } from '@shared/i18n'
import { Avatar } from '@/components/contacts/Avatar'

export function MonthGrid({
  cursor,
  today,
  selected,
  contacts,
  feb29,
  language,
  compact = false,
  onSelect
}: {
  cursor: CalendarDate
  today: CalendarDate
  selected: CalendarDate | null
  contacts: Contact[]
  feb29: Feb29Behavior
  language: Language
  compact?: boolean
  onSelect: (date: CalendarDate) => void
}) {
  const copy = messages(language)
  const cells = monthCells(cursor)

  return (
    <div
      className="grid grid-cols-7 gap-1"
      onKeyDown={(event) => {
        if (!selected) return
        const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key]
        if (!delta) return
        event.preventDefault()
        onSelect(addCalendarDays(selected, delta))
      }}
    >
      {copy.weekdays.map((day) => (
        <div key={day} className="pb-2 text-center text-[11px] font-medium text-muted-foreground">
          {day}
        </div>
      ))}
      {cells.map((date) => {
        const people = birthdaysOnDate(contacts, date, feb29)
        const outside = date.month !== cursor.month
        const isToday = sameCalendarDate(date, today)
        const isSelected = selected ? sameCalendarDate(date, selected) : false
        const marker = people.length > 0 ? markerKind(date, today) : null
        return (
          <button
            key={`${date.year}-${date.month}-${date.day}`}
            type="button"
            onClick={() => onSelect(date)}
            className={cn(
              'flex flex-col items-center rounded-2xl px-1 py-1 transition',
              compact ? 'h-10' : 'h-[4.7rem]',
              outside && 'text-muted-foreground/50',
              !isSelected && 'hover:bg-muted'
            )}
          >
            <span
              className={cn(
                'grid h-8 w-8 place-items-center rounded-full text-sm',
                isSelected && 'bg-primary font-medium text-primary-foreground',
                !isSelected && isToday && 'ring-2 ring-primary',
                !isSelected && marker === 'soon' && 'bg-accent text-accent-foreground'
              )}
            >
              {date.day}
            </span>
            {!compact && people.length > 0 && (
              <span className="mt-1 flex -space-x-1">
                {people.slice(0, 2).map((person) => (
                  <span key={person.id} className="rounded-full ring-2 ring-white dark:ring-card">
                    <Avatar contact={person} size={18} />
                  </span>
                ))}
              </span>
            )}
            {people.length > 0 && (
              <span
                className={cn(
                  'mt-1 h-1.5 w-1.5 rounded-full',
                  marker === 'soon' && 'bg-primary',
                  marker === 'week' && 'bg-orange-400',
                  marker === 'month' && 'bg-emerald-400',
                  marker === 'birthday' && 'bg-violet-300'
                )}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

function monthCells(cursor: CalendarDate): CalendarDate[] {
  const first = new Date(cursor.year, cursor.month - 1, 1)
  const lead = (first.getDay() + 6) % 7
  const start = new Date(cursor.year, cursor.month - 1, 1 - lead)
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return toCalendarDate(date)
  })
  let count = cells.length
  while (count > 28 && cells.slice(count - 7, count).every((date) => date.month !== cursor.month)) count -= 7
  return cells.slice(0, count)
}

function markerKind(date: CalendarDate, today: CalendarDate): 'soon' | 'week' | 'month' | 'birthday' {
  const days = daysUntil(today, date)
  if (days >= 0 && days <= 7) return 'soon'
  if (weekKey(date) === weekKey(today)) return 'week'
  if (date.year === today.year && date.month === today.month) return 'month'
  return 'birthday'
}

function weekKey(date: CalendarDate): string {
  const value = new Date(date.year, date.month - 1, date.day)
  const offset = (value.getDay() + 6) % 7
  value.setDate(value.getDate() - offset)
  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`
}

function daysUntil(today: CalendarDate, date: CalendarDate): number {
  const from = Date.UTC(today.year, today.month - 1, today.day)
  const to = Date.UTC(date.year, date.month - 1, date.day)
  return Math.round((to - from) / 86_400_000)
}

export function visibleMonth(date: CalendarDate): CalendarDate {
  return { year: date.year, month: date.month, day: 1 }
}

export function shiftMonth(date: CalendarDate, delta: number): CalendarDate {
  const next = new Date(date.year, date.month - 1 + delta, 1)
  return toCalendarDate(next)
}
