import { deliveryKey, findDueReminders } from '@shared/reminders'
import type { ContactService } from '../services/contactService'
import type { NotificationHistoryRepository } from '../database/notificationHistoryRepository'
import type { ReminderOverrideRepository } from '../database/reminderOverrideRepository'
import type { SettingsRepository } from '../database/settingsRepository'
import { deliverBirthdayNotification } from './deliver'
import { showMainWindow, runtime } from '../runtime'
import type { ReminderType, TodaySnoozeRequest } from '@shared/types'

export interface ReminderChecker {
  check: (options?: { includeUnacknowledged?: boolean; reschedule?: boolean }) => number
  acknowledge: (contactId: string, reminderType: ReminderType, occurrenceYear: number) => void
  snoozeToday: (contactId: string, reminderType: ReminderType, occurrenceYear: number, remindTime: string) => void
  rescheduleContact: (contactId: string) => void
}

export function createReminderChecker(
  contacts: ContactService,
  settings: SettingsRepository,
  history: NotificationHistoryRepository,
  overrides: ReminderOverrideRepository
): ReminderChecker {
  let running = false
  const pending = new Set<string>()
  const checker: ReminderChecker = {
    check: (options) => {
      if (running) return 0
      running = true
      try {
        if (options?.reschedule) {
          pending.clear()
          history.forgetUnacknowledged()
        }
        const current = settings.get()
        if (!current.notificationsEnabled) return 0
        const delivered = history.keys()
        if (options?.includeUnacknowledged) {
          for (const key of history.unacknowledged()) delivered.delete(key)
        }
        const now = new Date()
        let count = 0
        for (const contact of contacts.list()) {
          const due = findDueReminders({
            now,
            contact,
            feb29: current.feb29Behavior,
            reminderTime: current.reminderTime,
            gracePeriodHours: current.gracePeriodHours,
            deliveredKeys: delivered,
            overrides: overrides.map()
          })
          for (const reminder of due) {
            const key = deliveryKey(reminder.contactId, reminder.reminderType, reminder.occurrenceYear)
            if (pending.has(key)) continue
            pending.add(key)
            const shown = deliverBirthdayNotification(
              {
                language: current.language,
                reminderType: reminder.reminderType,
                firstName: contact.firstName,
                age: reminder.age
              },
              {
                onShow: () => {
                  history.record(reminder.contactId, reminder.reminderType, reminder.occurrenceYear)
                  pending.delete(key)
                },
                onFail: () => pending.delete(key),
                onAcknowledge: () =>
                  history.acknowledge(reminder.contactId, reminder.reminderType, reminder.occurrenceYear),
                onRemindLater: () => {
                  const request: TodaySnoozeRequest = {
                    contactId: reminder.contactId,
                    reminderType: reminder.reminderType,
                    occurrenceYear: reminder.occurrenceYear,
                    firstName: contact.firstName,
                    currentTime: reminder.reminderTime
                  }
                  showMainWindow()
                  const window = runtime.mainWindow
                  if (window && !window.isDestroyed()) window.webContents.send('notifications:snooze', request)
                }
              }
            )
            if (!shown) pending.delete(key)
            else count += 1
          }
        }
        return count
      } finally {
        running = false
      }
    },
    acknowledge: (contactId, reminderType, occurrenceYear) => {
      pending.delete(deliveryKey(contactId, reminderType, occurrenceYear))
      history.acknowledge(contactId, reminderType, occurrenceYear)
    },
    snoozeToday: (contactId, reminderType, occurrenceYear, remindTime) => {
      pending.delete(deliveryKey(contactId, reminderType, occurrenceYear))
      overrides.set(contactId, reminderType, occurrenceYear, remindTime)
      history.forget(contactId, reminderType, occurrenceYear)
    },
    rescheduleContact: (contactId) => {
      for (const key of [...pending]) {
        if (key.startsWith(`${contactId}:`)) pending.delete(key)
      }
      history.forgetContactUnacknowledged(contactId)
      checker.check()
    }
  }
  return checker
}

export function startReminderLoop(checker: ReminderChecker): () => void {
  checker.check({ includeUnacknowledged: true })
  const timer = setInterval(() => checker.check(), 60_000)
  return () => clearInterval(timer)
}
