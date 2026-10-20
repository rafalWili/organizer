import { describe, expect, it } from 'vitest'
import { daysBetween } from '@shared/dates'
import {
  ageTurning,
  bucketUpcoming,
  celebrationOnYear,
  nextCelebration,
  sortUpcoming,
  upcomingForContact
} from '@shared/birthdays'
import type { Contact } from '@shared/types'

const anna: Contact = {
  id: '11111111-1111-4111-8111-111111111111',
  firstName: 'Anna',
  lastName: 'Nowak',
  birthDay: 20,
  birthMonth: 10,
  birthYear: 1990,
  avatarUrl: null,
  notes: null,
  reminders: { onDay: true, daysBefore1: false, daysBefore3: false, daysBefore7: false },
  reminderTime: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

describe('birthday calendar dates', () => {
  it('keeps February 29 in a leap year', () => {
    expect(celebrationOnYear(2, 29, 2028, 'feb28')).toEqual({ year: 2028, month: 2, day: 29 })
  })

  it('moves February 29 to February 28 or March 1', () => {
    expect(celebrationOnYear(2, 29, 2026, 'feb28')).toEqual({ year: 2026, month: 2, day: 28 })
    expect(celebrationOnYear(2, 29, 2026, 'mar1')).toEqual({ year: 2026, month: 3, day: 1 })
  })

  it('rolls to next year after the celebration day', () => {
    expect(nextCelebration(10, 20, { year: 2026, month: 10, day: 21 }, 'feb28')).toEqual({
      year: 2027,
      month: 10,
      day: 20
    })
  })

  it('treats today as the next birthday', () => {
    const upcoming = upcomingForContact(anna, { year: 2026, month: 10, day: 20 }, 'feb28')
    expect(upcoming.daysUntil).toBe(0)
    expect(upcoming.age).toBe(36)
  })

  it('skips age when the birth year is unknown', () => {
    expect(ageTurning(null, { year: 2026, month: 5, day: 2 })).toBeNull()
  })

  it('counts whole calendar days across a daylight-saving change', () => {
    expect(daysBetween({ year: 2026, month: 3, day: 28 }, { year: 2026, month: 3, day: 30 })).toBe(2)
  })

  it('sorts upcoming birthdays and fills the dashboard buckets', () => {
    const today = { year: 2026, month: 10, day: 20 }
    const tomorrow = upcomingForContact({ ...anna, id: 'a', firstName: 'Basia', birthDay: 21 }, today, 'feb28')
    const later = upcomingForContact({ ...anna, id: 'b', firstName: 'Celina', birthDay: 25 }, today, 'feb28')
    const sorted = sortUpcoming([later, tomorrow])
    expect(sorted.map((item) => item.contact.firstName)).toEqual(['Basia', 'Celina'])
    const buckets = bucketUpcoming(sorted)
    expect(buckets.tomorrow).toHaveLength(1)
    expect(buckets.next7.map((item) => item.contact.firstName)).toEqual(['Basia', 'Celina'])
    expect(buckets.next30).toHaveLength(2)
  })
})
