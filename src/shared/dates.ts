import type { CalendarDate } from './types'

export function toCalendarDate(date: Date): CalendarDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  }
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

export function isValidCalendarDate(date: CalendarDate): boolean {
  if (!Number.isInteger(date.year) || !Number.isInteger(date.month) || !Number.isInteger(date.day)) {
    return false
  }
  if (date.month < 1 || date.month > 12) return false
  if (date.day < 1 || date.day > daysInMonth(date.year, date.month)) return false
  return true
}

export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year - b.year
  if (a.month !== b.month) return a.month - b.month
  return a.day - b.day
}

export function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days))
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate()
  }
}

export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  const start = Date.UTC(from.year, from.month - 1, from.day)
  const end = Date.UTC(to.year, to.month - 1, to.day)
  return Math.round((end - start) / 86_400_000)
}

export function localDateTime(date: CalendarDate, minutesFromMidnight: number): Date {
  const hours = Math.floor(minutesFromMidnight / 60)
  const minutes = minutesFromMidnight % 60
  return new Date(date.year, date.month - 1, date.day, hours, minutes, 0, 0)
}

export function sameCalendarDate(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day
}
