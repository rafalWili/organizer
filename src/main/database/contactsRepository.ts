import { randomUUID } from 'node:crypto'
import type Database from 'better-sqlite3'
import { parseReminderMinutes } from '@shared/reminders'
import type { ContactInput, ReminderPreferences } from '@shared/types'

export interface StoredContact {
  id: string
  firstName: string
  lastName: string | null
  birthDay: number
  birthMonth: number
  birthYear: number | null
  avatarPath: string | null
  notes: string | null
  reminders: ReminderPreferences
  reminderTime: string | null
  createdAt: string
  updatedAt: string
}

interface ContactRow {
  id: string
  first_name: string
  last_name: string | null
  birth_day: number
  birth_month: number
  birth_year: number | null
  avatar_path: string | null
  notes: string | null
  created_at: string
  updated_at: string
  on_day: number
  days_before_1: number
  days_before_3: number
  days_before_7: number
  reminder_time: string | null
}

const SELECT_COLUMNS = `
  c.id, c.first_name, c.last_name, c.birth_day, c.birth_month, c.birth_year,
  c.avatar_path, c.notes, c.created_at, c.updated_at,
  r.on_day, r.days_before_1, r.days_before_3, r.days_before_7, r.reminder_time
`

function mapRow(row: ContactRow): StoredContact {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    birthDay: row.birth_day,
    birthMonth: row.birth_month,
    birthYear: row.birth_year,
    avatarPath: row.avatar_path,
    notes: row.notes,
    reminders: {
      onDay: row.on_day === 1,
      daysBefore1: row.days_before_1 === 1,
      daysBefore3: row.days_before_3 === 1,
      daysBefore7: row.days_before_7 === 1
    },
    reminderTime:
      typeof row.reminder_time === 'string' && parseReminderMinutes(row.reminder_time) != null
        ? row.reminder_time
        : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function flag(value: boolean): number {
  return value ? 1 : 0
}

export interface ContactsRepository {
  list: () => StoredContact[]
  get: (id: string) => StoredContact | null
  create: (input: ContactInput, avatarPath: string | null) => StoredContact
  update: (id: string, input: ContactInput, avatarPath: string | null) => StoredContact | null
  remove: (id: string) => StoredContact | null
}

export function createContactsRepository(database: Database.Database): ContactsRepository {
  const listStatement = database.prepare(
    `SELECT ${SELECT_COLUMNS}
     FROM contacts c
     INNER JOIN reminder_preferences r ON r.contact_id = c.id
     ORDER BY c.first_name COLLATE NOCASE ASC, COALESCE(c.last_name, '') COLLATE NOCASE ASC`
  )
  const getStatement = database.prepare(
    `SELECT ${SELECT_COLUMNS}
     FROM contacts c
     INNER JOIN reminder_preferences r ON r.contact_id = c.id
     WHERE c.id = ?`
  )
  const insertContact = database.prepare(
    `INSERT INTO contacts (
      id, first_name, last_name, birth_day, birth_month, birth_year, avatar_path, notes, created_at, updated_at
    ) VALUES (
      @id, @firstName, @lastName, @birthDay, @birthMonth, @birthYear, @avatarPath, @notes, @createdAt, @updatedAt
    )`
  )
  const insertReminders = database.prepare(
    `INSERT INTO reminder_preferences (
      contact_id, on_day, days_before_1, days_before_3, days_before_7, reminder_time
    ) VALUES (
      @id, @onDay, @daysBefore1, @daysBefore3, @daysBefore7, @reminderTime
    )`
  )
  const updateContact = database.prepare(
    `UPDATE contacts SET
      first_name = @firstName,
      last_name = @lastName,
      birth_day = @birthDay,
      birth_month = @birthMonth,
      birth_year = @birthYear,
      avatar_path = @avatarPath,
      notes = @notes,
      updated_at = @updatedAt
     WHERE id = @id`
  )
  const updateReminders = database.prepare(
    `UPDATE reminder_preferences SET
      on_day = @onDay,
      days_before_1 = @daysBefore1,
      days_before_3 = @daysBefore3,
      days_before_7 = @daysBefore7,
      reminder_time = @reminderTime
     WHERE contact_id = @id`
  )
  const deleteContact = database.prepare('DELETE FROM contacts WHERE id = ?')

  const createTx = database.transaction((input: ContactInput, avatarPath: string | null) => {
    const now = new Date().toISOString()
    const id = randomUUID()
    insertContact.run({
      id,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDay: input.birthDay,
      birthMonth: input.birthMonth,
      birthYear: input.birthYear,
      avatarPath,
      notes: input.notes,
      createdAt: now,
      updatedAt: now
    })
    insertReminders.run({ id, ...flags(input.reminders), reminderTime: input.reminderTime })
    return id
  })

  const updateTx = database.transaction((id: string, input: ContactInput, avatarPath: string | null) => {
    const result = updateContact.run({
      id,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDay: input.birthDay,
      birthMonth: input.birthMonth,
      birthYear: input.birthYear,
      avatarPath,
      notes: input.notes,
      updatedAt: new Date().toISOString()
    })
    if (result.changes === 0) return false
    updateReminders.run({ id, ...flags(input.reminders), reminderTime: input.reminderTime })
    return true
  })

  return {
    list: () => (listStatement.all() as ContactRow[]).map(mapRow),
    get: (id) => {
      const row = getStatement.get(id) as ContactRow | undefined
      return row ? mapRow(row) : null
    },
    create: (input, avatarPath) => {
      const id = createTx(input, avatarPath)
      const created = getStatement.get(id) as ContactRow | undefined
      if (!created) throw new Error('notFound')
      return mapRow(created)
    },
    update: (id, input, avatarPath) => {
      const updated = updateTx(id, input, avatarPath)
      if (!updated) return null
      const row = getStatement.get(id) as ContactRow | undefined
      return row ? mapRow(row) : null
    },
    remove: (id) => {
      const existing = getStatement.get(id) as ContactRow | undefined
      if (!existing) return null
      deleteContact.run(id)
      return mapRow(existing)
    }
  }
}

function flags(reminders: ReminderPreferences): Record<string, number> {
  return {
    onDay: flag(reminders.onDay),
    daysBefore1: flag(reminders.daysBefore1),
    daysBefore3: flag(reminders.daysBefore3),
    daysBefore7: flag(reminders.daysBefore7)
  }
}
