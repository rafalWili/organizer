import { useEffect, useMemo, useState } from 'react'
import { Cake, ChevronLeft, ChevronRight } from 'lucide-react'
import { ageTurning, birthdaysOnDate, upcomingBirthdays } from '@shared/birthdays'
import { addCalendarDays, toCalendarDate } from '@shared/dates'
import { messages } from '@shared/i18n'
import { displayName } from '@shared/names'
import type { CalendarDate, Contact } from '@shared/types'
import { useAppState } from '@/contexts/AppState'
import { formatCalendarDate, monthTitle } from '@/lib/format'
import { look } from '@/lib/look'
import { PageHeader } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MonthGrid, shiftMonth, visibleMonth } from '@/components/calendar/MonthGrid'
import { Avatar } from '@/components/contacts/Avatar'
import { WhenPill } from '@/pages/DashboardPage'
import { cn } from '@/lib/cn'

type CalendarMode = 'month' | 'week' | 'list'

export function CalendarPage() {
  const { contacts, settings, today, calendarFocus, openEdit, setPage } = useAppState()
  const copy = messages(settings.language)
  const visual = look(settings.language)
  const [cursor, setCursor] = useState<CalendarDate>(visibleMonth(calendarFocus ?? today))
  const [selected, setSelected] = useState<CalendarDate>(calendarFocus ?? today)
  const [mode, setMode] = useState<CalendarMode>('month')

  useEffect(() => {
    if (!calendarFocus) return
    setSelected(calendarFocus)
    setCursor(visibleMonth(calendarFocus))
  }, [calendarFocus])

  const people = birthdaysOnDate(contacts, selected, settings.feb29Behavior)
  const nearest = upcomingBirthdays(contacts, today, settings.feb29Behavior).slice(0, 4)
  const monthPeople = useMemo(() => {
    return contacts
      .map((contact) => ({ contact, celebration: celebrationInMonth(contact, cursor, settings.feb29Behavior) }))
      .filter((item): item is { contact: Contact; celebration: CalendarDate } => item.celebration != null)
      .sort((a, b) => a.celebration.day - b.celebration.day)
  }, [contacts, cursor, settings.feb29Behavior])

  function select(date: CalendarDate) {
    setSelected(date)
    if (mode !== 'week') setCursor(visibleMonth(date))
  }

  const weekStart = startOfWeek(selected)

  return (
    <div>
      <PageHeader title={copy.calendar.title} subtitle={copy.calendar.subtitle} />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => (mode === 'week' ? select(addCalendarDays(selected, -7)) : setCursor(shiftMonth(cursor, -1)))}
                aria-label="-"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => (mode === 'week' ? select(addCalendarDays(selected, 7)) : setCursor(shiftMonth(cursor, 1)))}
                aria-label="+"
              >
                <ChevronRight size={16} />
              </Button>
              <h2 className="text-lg font-semibold">{monthTitle(mode === 'week' ? selected : cursor, settings.language)}</h2>
            </div>
            <div className="flex rounded-full bg-muted p-1 text-sm">
              <ModeButton active={mode === 'month' && sameDay(selected, today)} onClick={() => select(today)}>
                {copy.actions.today}
              </ModeButton>
              <ModeButton active={mode === 'month'} onClick={() => setMode('month')}>
                {visual.monthView}
              </ModeButton>
              <ModeButton active={mode === 'week'} onClick={() => setMode('week')}>
                {visual.weekView}
              </ModeButton>
              <ModeButton active={mode === 'list'} onClick={() => setMode('list')}>
                {visual.listView}
              </ModeButton>
            </div>
          </div>
          {mode === 'month' && (
            <MonthGrid
              cursor={cursor}
              today={today}
              selected={selected}
              contacts={contacts}
              feb29={settings.feb29Behavior}
              language={settings.language}
              onSelect={select}
            />
          )}
          {mode === 'week' && (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, index) => addCalendarDays(weekStart, index)).map((date) => {
                const dayPeople = birthdaysOnDate(contacts, date, settings.feb29Behavior)
                const active = sameDay(date, selected)
                return (
                  <button
                    key={`${date.month}-${date.day}`}
                    type="button"
                    onClick={() => select(date)}
                    className={cn('min-h-36 rounded-2xl border p-2 text-left', active ? 'border-primary bg-accent' : 'border-border')}
                  >
                    <div className="text-xs text-muted-foreground">{copy.weekdays[(new Date(date.year, date.month - 1, date.day).getDay() + 6) % 7] ?? ''}</div>
                    <div className={cn('mt-1 grid h-8 w-8 place-items-center rounded-full text-sm', active && 'bg-primary text-primary-foreground')}>{date.day}</div>
                    <div className="mt-2 space-y-1">
                      {dayPeople.map((person) => (
                        <div key={person.id} className="truncate text-xs">{displayName(person)}</div>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          {mode === 'list' && (
            <ul className="divide-y divide-border">
              {monthPeople.length === 0 && <li className="py-6 text-sm text-muted-foreground">{copy.dashboard.empty}</li>}
              {monthPeople.map(({ contact, celebration }) => (
                <li key={contact.id}>
                  <button type="button" className="flex w-full items-center gap-3 py-3 text-left" onClick={() => openEdit(contact)}>
                    <Avatar contact={contact} />
                    <span className="flex-1 font-medium">{displayName(contact)}</span>
                    <span className="text-sm text-muted-foreground">{formatCalendarDate(celebration, settings.language, 'd MMMM')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {mode === 'month' && (
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <Legend color="bg-violet-300" label={visual.legendBirthday} />
              <Legend color="bg-primary" label={visual.legendSoon} />
              <Legend color="bg-orange-400" label={visual.legendWeek} />
              <Legend color="bg-emerald-400" label={visual.legendMonth} />
            </div>
          )}
        </Card>
        <Card className="bg-gradient-to-b from-[#fbf8ff] to-white p-4 dark:from-muted dark:to-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                <Cake size={18} className="text-primary" />
                {formatCalendarDate(selected, settings.language, 'd MMMM')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {people.length} {people.length === 1 ? visual.personHas : visual.peopleHave}
              </p>
            </div>
          </div>
          {people.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">{copy.calendar.selectedEmpty}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {people.map((contact) => {
                const age = ageTurning(contact.birthYear, selected)
                const reminded = contact.reminders.onDay || contact.reminders.daysBefore1 || contact.reminders.daysBefore3 || contact.reminders.daysBefore7
                return (
                  <li key={contact.id} className="rounded-2xl border border-border bg-card p-3">
                    <button type="button" onClick={() => openEdit(contact)} className="flex w-full items-center gap-3 text-left">
                      <Avatar contact={contact} size={46} />
                      <span>
                        <span className="block font-medium">{displayName(contact)}</span>
                        {age != null && age >= 1 && (
                          <span className="text-xs text-primary">{visual.turnsAge.replace('{age}', String(age))}</span>
                        )}
                      </span>
                    </button>
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                      <span className="text-primary">🔔</span>
                      {reminded ? `${visual.reminderOn} · ${contact.reminderTime ?? settings.reminderTime}` : visual.noReminder}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {nearest.map((item) => (
            <button key={item.contact.id} type="button" onClick={() => openEdit(item.contact)} className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3 text-left">
              <Avatar contact={item.contact} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{displayName(item.contact)}</span>
                <span className="text-xs text-muted-foreground">{formatCalendarDate(item.celebration, settings.language, 'd MMMM')}</span>
              </span>
              <WhenPill days={item.daysUntil} language={settings.language} todayLabel={visual.todayBang} />
            </button>
          ))}
          {nearest.length === 0 && <p className="text-sm text-muted-foreground">{copy.dashboard.empty}</p>}
        </div>
      </Card>
    </div>
  )
}

function celebrationInMonth(contact: Contact, cursor: CalendarDate, feb29: 'feb28' | 'mar1'): CalendarDate | null {
  const people = birthdaysOnDate([contact], { year: cursor.year, month: cursor.month, day: 1 }, feb29)
  if (people.length > 0 && contact.birthMonth === cursor.month) {
    return { year: cursor.year, month: contact.birthMonth, day: contact.birthDay }
  }
  for (let day = 1; day <= 31; day += 1) {
    const date = { year: cursor.year, month: cursor.month, day }
    if (birthdaysOnDate([contact], date, feb29).length > 0) return date
  }
  return null
}

function startOfWeek(date: CalendarDate): CalendarDate {
  const value = new Date(date.year, date.month - 1, date.day)
  const offset = (value.getDay() + 6) % 7
  value.setDate(value.getDate() - offset)
  return toCalendarDate(value)
}

function sameDay(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} className={cn('rounded-full px-3 py-1', active ? 'bg-white text-primary shadow-sm dark:bg-card' : 'text-muted-foreground')}>
      {children}
    </button>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('h-2 w-2 rounded-full', color)} />
      {label}
    </span>
  )
}
