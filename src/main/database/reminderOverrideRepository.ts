import { deliveryKey } from '@shared/reminders'
import type { ReminderType } from '@shared/types'
import type Database from 'better-sqlite3'

export interface ReminderOverrideRepository {
  map: () => Map<string, string>
  set: (contactId: string, reminderType: ReminderType, occurrenceYear: number, remindTime: string) => void
}

export function createReminderOverrideRepository(database: Database.Database): ReminderOverrideRepository {
  const list = database.prepare(
    'SELECT contact_id, reminder_type, occurrence_year, remind_time FROM reminder_overrides'
  )
  const upsert = database.prepare(
    `INSERT INTO reminder_overrides (contact_id, reminder_type, occurrence_year, remind_time)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (contact_id, reminder_type, occurrence_year)
     DO UPDATE SET remind_time = excluded.remind_time`
  )

  return {
    map: () => {
      const overrides = new Map<string, string>()
      const rows = list.all() as {
        contact_id: string
        reminder_type: ReminderType
        occurrence_year: number
        remind_time: string
      }[]
      for (const row of rows) overrides.set(deliveryKey(row.contact_id, row.reminder_type, row.occurrence_year), row.remind_time)
      return overrides
    },
    set: (contactId, reminderType, occurrenceYear, remindTime) => {
      upsert.run(contactId, reminderType, occurrenceYear, remindTime)
    }
  }
}
