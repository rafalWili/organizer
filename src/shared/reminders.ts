import type { Contact, Feb29Behavior, ReminderPreferences, ReminderType } from './types'
import { REMINDER_OFFSETS } from './types'
import { celebrationOnYear, shiftCelebration } from './birthdays'
import { compareCalendarDates, localDateTime, toCalendarDate } from './dates'
import { displayName } from './names'

export interface DueReminder {
  contactId: string
  contactName: string
  reminderType: ReminderType
  occurrenceYear: number
  age: number | null
  reminderTime: string
}

export function deliveryKey(contactId: string, reminderType: ReminderType, occurrenceYear: number): string {
  return `${contactId}:${reminderType}:${occurrenceYear}`
}

export function enabledReminderTypes(preferences: ReminderPreferences): ReminderType[] {
  const types: ReminderType[] = []
  if (preferences.onDay) types.push('on_day')
  if (preferences.daysBefore1) types.push('days_1')
  if (preferences.daysBefore3) types.push('days_3')
  if (preferences.daysBefore7) types.push('days_7')
  return types
}

export function parseReminderMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim())
  if (!match) return null
  const hours = match[1]
  const minutes = match[2]
  if (hours === undefined || minutes === undefined) return null
  return Number(hours) * 60 + Number(minutes)
}

export function findDueReminders(input: {
  now: Date
  contact: Contact
  feb29: Feb29Behavior
  reminderTime: string
  gracePeriodHours: number
  deliveredKeys: ReadonlySet<string>
  overrides?: ReadonlyMap<string, string>
}): DueReminder[] {
  if (parseReminderMinutes(input.reminderTime) == null || input.gracePeriodHours <= 0) return []

  const today = toCalendarDate(input.now)
  const years = [today.year - 1, today.year, today.year + 1]
  const due: DueReminder[] = []

  for (const year of years) {
    const celebration = celebrationOnYear(input.contact.birthMonth, input.contact.birthDay, year, input.feb29)
    for (const reminderType of enabledReminderTypes(input.contact.reminders)) {
      const key = deliveryKey(input.contact.id, reminderType, year)
      if (input.deliveredKeys.has(key)) continue
      if (reminderType !== 'on_day' && compareCalendarDates(today, celebration) >= 0) continue
      const chosen = input.overrides?.get(key) ?? input.contact.reminderTime ?? input.reminderTime
      if (typeof chosen !== 'string') continue
      const minutes = parseReminderMinutes(chosen)
      if (minutes == null) continue
      const remindOn = shiftCelebration(celebration, REMINDER_OFFSETS[reminderType])
      const start = localDateTime(remindOn, minutes).getTime()
      const end = start + input.gracePeriodHours * 3_600_000
      const timestamp = input.now.getTime()
      if (timestamp < start || timestamp > end) continue
      const age = input.contact.birthYear == null ? null : year - input.contact.birthYear
      due.push({
        contactId: input.contact.id,
        contactName: displayName(input.contact),
        reminderType,
        occurrenceYear: year,
        age: age != null && age >= 0 ? age : null,
        reminderTime: chosen
      })
    }
  }

  return due
}
