import { describe, expect, it } from 'vitest'
import { deliveryKey, findDueReminders } from '@shared/reminders'
import { birthdayNotification } from '@shared/notificationsCopy'
import type { Contact } from '@shared/types'

const contact: Contact = {
  id: '22222222-2222-4222-8222-222222222222',
  firstName: 'Anna',
  lastName: null,
  birthDay: 20,
  birthMonth: 10,
  birthYear: 1996,
  avatarUrl: null,
  notes: null,
  reminders: { onDay: true, daysBefore1: true, daysBefore3: false, daysBefore7: true },
  reminderTime: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

function dueAt(now: Date, gracePeriodHours: number, deliveredKeys = new Set<string>()) {
  return findDueReminders({
    now,
    contact,
    feb29: 'feb28',
    reminderTime: '09:00',
    gracePeriodHours,
    deliveredKeys
  })
}

describe('reminder delivery', () => {
  it('is due after the reminder time and inside the grace period', () => {
    const due = dueAt(new Date(2026, 9, 20, 10, 0, 0), 12)
    expect(due.map((item) => item.reminderType)).toEqual(['on_day'])
    expect(due[0]?.age).toBe(30)
  })

  it('does not say a birthday is tomorrow once that day has arrived', () => {
    const due = dueAt(new Date(2026, 9, 20, 10, 0, 0), 36)
    expect(due.map((item) => item.reminderType)).toEqual(['on_day'])
  })

  it('still sends the day-before reminder on the day before', () => {
    const due = dueAt(new Date(2026, 9, 19, 10, 0, 0), 12)
    expect(due.map((item) => item.reminderType)).toEqual(['days_1'])
  })

  it('waits until the configured local time', () => {
    expect(dueAt(new Date(2026, 9, 20, 8, 59, 0), 12)).toEqual([])
  })

  it('drops overdue reminders outside the grace period', () => {
    expect(dueAt(new Date(2026, 9, 20, 22, 0, 0), 12)).toEqual([])
  })

  it('still delivers a missed reminder on the next morning when grace allows it', () => {
    const due = dueAt(new Date(2026, 9, 21, 8, 0, 0), 36)
    expect(due.map((item) => item.reminderType)).toContain('on_day')
  })

  it('does not deliver the same reminder twice for one birthday occurrence', () => {
    const key = deliveryKey(contact.id, 'on_day', 2026)
    expect(dueAt(new Date(2026, 9, 20, 10, 0, 0), 12, new Set([key]))).toEqual([])
  })

  it('schedules a seven-day reminder across the new year', () => {
    const january = {
      ...contact,
      birthMonth: 1,
      birthDay: 2,
      reminders: { onDay: false, daysBefore1: false, daysBefore3: false, daysBefore7: true }
    }
    const due = findDueReminders({
      now: new Date(2026, 11, 26, 9, 30, 0),
      contact: january,
      feb29: 'feb28',
      reminderTime: '09:00',
      gracePeriodHours: 12,
      deliveredKeys: new Set()
    })
    expect(due).toEqual([
      expect.objectContaining({ reminderType: 'days_7', occurrenceYear: 2027 })
    ])
  })

  it('celebrates a leap-day birthday on February 28 when that mode is selected', () => {
    const leap = { ...contact, birthMonth: 2, birthDay: 29, birthYear: 2004 }
    const due = findDueReminders({
      now: new Date(2026, 1, 28, 9, 15, 0),
      contact: leap,
      feb29: 'feb28',
      reminderTime: '09:00',
      gracePeriodHours: 6,
      deliveredKeys: new Set()
    })
    expect(due.map((item) => item.reminderType)).toContain('on_day')
    expect(due[0]?.occurrenceYear).toBe(2026)
  })

  it('uses a person’s own reminder time instead of the global one', () => {
    const due = findDueReminders({
      now: new Date(2026, 9, 20, 15, 5, 0),
      contact: { ...contact, reminderTime: '15:00' },
      feb29: 'feb28',
      reminderTime: '09:00',
      gracePeriodHours: 12,
      deliveredKeys: new Set()
    })
    expect(due.map((item) => item.reminderType)).toEqual(['on_day'])
    expect(due[0]?.reminderTime).toBe('15:00')
  })

  it('waits for a person’s later hour even when the global time has passed', () => {
    const due = findDueReminders({
      now: new Date(2026, 9, 20, 10, 0, 0),
      contact: { ...contact, reminderTime: '18:00' },
      feb29: 'feb28',
      reminderTime: '09:00',
      gracePeriodHours: 12,
      deliveredKeys: new Set()
    })
    expect(due).toEqual([])
  })

  it('uses a today-only override without changing the person’s usual time', () => {
    const key = deliveryKey(contact.id, 'on_day', 2026)
    const due = findDueReminders({
      now: new Date(2026, 9, 20, 18, 5, 0),
      contact: { ...contact, reminderTime: '09:00' },
      feb29: 'feb28',
      reminderTime: '09:00',
      gracePeriodHours: 2,
      deliveredKeys: new Set(),
      overrides: new Map([[key, '18:00']])
    })
    expect(due.map((item) => item.reminderType)).toEqual(['on_day'])
    expect(due[0]?.reminderTime).toBe('18:00')
  })

  it('uses the Polish birthday notification copy', () => {
    expect(birthdayNotification('pl', 'on_day', 'Anna', null)).toEqual({
      title: '🎂 Dzisiaj urodziny!',
      body: 'Dzisiaj Anna obchodzi urodziny. Nie zapomnij złożyć życzeń!'
    })
  })
})
