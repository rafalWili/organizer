import { randomUUID } from 'node:crypto'
import type Database from 'better-sqlite3'
import { deliveryKey } from '@shared/reminders'
import type { ReminderType } from '@shared/types'

export interface NotificationHistoryRepository {
  keys: () => Set<string>
  unacknowledged: () => Set<string>
  record: (contactId: string, reminderType: ReminderType, occurrenceYear: number) => void
  acknowledge: (contactId: string, reminderType: ReminderType, occurrenceYear: number) => void
  forgetUnacknowledged: () => void
  forgetContactUnacknowledged: (contactId: string) => void
  forget: (contactId: string, reminderType: ReminderType, occurrenceYear: number) => void
}

export function createNotificationHistoryRepository(database: Database.Database): NotificationHistoryRepository {
  const list = database.prepare(
    'SELECT contact_id, reminder_type, occurrence_year FROM notification_history'
  )
  const listUnacknowledged = database.prepare(
    `SELECT contact_id, reminder_type, occurrence_year FROM notification_history WHERE acknowledged_at IS NULL`
  )
  const insert = database.prepare(
    `INSERT OR IGNORE INTO notification_history (id, contact_id, reminder_type, occurrence_year, delivered_at)
     VALUES (?, ?, ?, ?, ?)`
  )
  const forgetUnacknowledgedStatement = database.prepare(
    'DELETE FROM notification_history WHERE acknowledged_at IS NULL'
  )
  const forgetContactUnacknowledgedStatement = database.prepare(
    'DELETE FROM notification_history WHERE contact_id = ? AND acknowledged_at IS NULL'
  )
  const acknowledgeStatement = database.prepare(
    `UPDATE notification_history SET acknowledged_at = ?
     WHERE contact_id = ? AND reminder_type = ? AND occurrence_year = ? AND acknowledged_at IS NULL`
  )

  function toKeys(rows: { contact_id: string; reminder_type: ReminderType; occurrence_year: number }[]): Set<string> {
    return new Set(rows.map((row) => deliveryKey(row.contact_id, row.reminder_type, row.occurrence_year)))
  }

  return {
    keys: () => toKeys(list.all() as { contact_id: string; reminder_type: ReminderType; occurrence_year: number }[]),
    unacknowledged: () =>
      toKeys(listUnacknowledged.all() as { contact_id: string; reminder_type: ReminderType; occurrence_year: number }[]),
    record: (contactId, reminderType, occurrenceYear) => {
      insert.run(randomUUID(), contactId, reminderType, occurrenceYear, new Date().toISOString())
    },
    acknowledge: (contactId, reminderType, occurrenceYear) => {
      acknowledgeStatement.run(new Date().toISOString(), contactId, reminderType, occurrenceYear)
    },
    forgetUnacknowledged: () => {
      forgetUnacknowledgedStatement.run()
    },
    forgetContactUnacknowledged: (contactId) => {
      forgetContactUnacknowledgedStatement.run(contactId)
    },
    forget: (contactId, reminderType, occurrenceYear) => {
      database
        .prepare(
          'DELETE FROM notification_history WHERE contact_id = ? AND reminder_type = ? AND occurrence_year = ?'
        )
        .run(contactId, reminderType, occurrenceYear)
    }
  }
}
