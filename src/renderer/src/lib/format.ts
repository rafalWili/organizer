import { format } from 'date-fns'
import type { Locale } from 'date-fns'
import { enUS, pl } from 'date-fns/locale'
import type { CalendarDate, Language } from '@shared/types'

export function localeFor(language: Language): Locale {
  return language === 'en' ? enUS : pl
}

export function formatCalendarDate(date: CalendarDate, language: Language, pattern = 'd MMMM yyyy'): string {
  return format(new Date(date.year, date.month - 1, date.day), pattern, { locale: localeFor(language) })
}

export function monthTitle(date: CalendarDate, language: Language): string {
  const label = format(new Date(date.year, date.month - 1, 1), 'LLLL yyyy', { locale: localeFor(language) })
  return label.charAt(0).toLocaleUpperCase(language) + label.slice(1)
}

export function monthName(month: number, language: Language): string {
  const label = format(new Date(2024, month - 1, 1), 'LLLL', { locale: localeFor(language) })
  return label.charAt(0).toLocaleUpperCase(language) + label.slice(1)
}

export function daysText(language: Language, days: number): string {
  if (days === 0) return language === 'pl' ? 'Dzisiaj' : 'Today'
  if (days === 1) return language === 'pl' ? 'Jutro' : 'Tomorrow'
  return language === 'pl' ? `Za ${days} dni` : `In ${days} days`
}

export function ageText(language: Language, age: number): string {
  if (language === 'en') return `turns ${age}`
  const mod10 = age % 10
  const mod100 = age % 100
  const noun = mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'lata' : 'lat'
  return `skończy ${age} ${noun}`
}
