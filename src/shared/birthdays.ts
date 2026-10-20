import type { CalendarDate, Contact, Feb29Behavior, UpcomingBirthday } from './types'
import { addCalendarDays, compareCalendarDates, daysBetween, isLeapYear } from './dates'
import { displayName } from './names'

export function celebrationOnYear(
  birthMonth: number,
  birthDay: number,
  year: number,
  feb29: Feb29Behavior
): CalendarDate {
  if (birthMonth === 2 && birthDay === 29 && !isLeapYear(year)) {
    return feb29 === 'mar1' ? { year, month: 3, day: 1 } : { year, month: 2, day: 28 }
  }
  return { year, month: birthMonth, day: birthDay }
}

export function nextCelebration(
  birthMonth: number,
  birthDay: number,
  today: CalendarDate,
  feb29: Feb29Behavior
): CalendarDate {
  const thisYear = celebrationOnYear(birthMonth, birthDay, today.year, feb29)
  if (compareCalendarDates(thisYear, today) >= 0) return thisYear
  return celebrationOnYear(birthMonth, birthDay, today.year + 1, feb29)
}

export function ageTurning(birthYear: number | null, celebration: CalendarDate): number | null {
  if (birthYear == null) return null
  const age = celebration.year - birthYear
  return age >= 0 ? age : null
}

export function upcomingForContact(
  contact: Contact,
  today: CalendarDate,
  feb29: Feb29Behavior
): UpcomingBirthday {
  const celebration = nextCelebration(contact.birthMonth, contact.birthDay, today, feb29)
  return {
    contact,
    celebration,
    daysUntil: daysBetween(today, celebration),
    age: ageTurning(contact.birthYear, celebration)
  }
}

export function sortUpcoming(items: UpcomingBirthday[]): UpcomingBirthday[] {
  return [...items].sort((a, b) => {
    if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil
    return displayName(a.contact).localeCompare(displayName(b.contact), 'pl')
  })
}

export function upcomingBirthdays(
  contacts: Contact[],
  today: CalendarDate,
  feb29: Feb29Behavior
): UpcomingBirthday[] {
  return sortUpcoming(contacts.map((contact) => upcomingForContact(contact, today, feb29)))
}

export interface UpcomingBuckets {
  today: UpcomingBirthday[]
  tomorrow: UpcomingBirthday[]
  next7: UpcomingBirthday[]
  next30: UpcomingBirthday[]
  all: UpcomingBirthday[]
}

export function bucketUpcoming(items: UpcomingBirthday[]): UpcomingBuckets {
  return {
    today: items.filter((item) => item.daysUntil === 0),
    tomorrow: items.filter((item) => item.daysUntil === 1),
    next7: items.filter((item) => item.daysUntil >= 0 && item.daysUntil <= 7),
    next30: items.filter((item) => item.daysUntil >= 0 && item.daysUntil <= 30),
    all: items.filter((item) => item.daysUntil >= 0)
  }
}

export function birthdaysOnDate(
  contacts: Contact[],
  date: CalendarDate,
  feb29: Feb29Behavior
): Contact[] {
  return contacts
    .filter((contact) => {
      const celebration = celebrationOnYear(contact.birthMonth, contact.birthDay, date.year, feb29)
      return celebration.year === date.year && celebration.month === date.month && celebration.day === date.day
    })
    .sort((a, b) => displayName(a).localeCompare(displayName(b), 'pl'))
}

export function shiftCelebration(celebration: CalendarDate, offsetDays: number): CalendarDate {
  return addCalendarDays(celebration, -offsetDays)
}
