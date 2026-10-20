import { app, ipcMain } from 'electron'
import type { ApiResult } from '@shared/ipc'
import type { FieldError, ReminderType, Settings } from '@shared/types'
import { parseReminderMinutes } from '@shared/reminders'
import { isDuplicateAction, isUuid, validateContactInput, validateSettingsPatch } from '@shared/validation'
import { toCalendarDate } from '@shared/dates'
import type { ContactService } from '../services/contactService'
import type { SettingsRepository } from '../database/settingsRepository'
import type { ImportExportService } from '../services/importExportService'
import type { ReminderChecker } from '../notifications/scheduler'
import { deliverTestNotification } from '../notifications/deliver'

interface IpcDeps {
  contacts: ContactService
  settings: SettingsRepository
  transfer: ImportExportService
  reminders: ReminderChecker
  onSettingsChanged: (settings: Settings, patch: Partial<Settings>) => void
}

export function registerIpc(deps: IpcDeps): void {
  ipcMain.handle('contacts:list', () => guard(() => ok(deps.contacts.list())))
  ipcMain.handle('contacts:create', (_event, input: unknown) =>
    guard(() => {
      const validated = validateContactInput(input, toCalendarDate(new Date()))
      if (!validated.ok) return invalid(validated.errors)
      return ok(deps.contacts.create(validated.value))
    })
  )
  ipcMain.handle('contacts:update', (_event, id: unknown, input: unknown) =>
    guard(() => {
      if (!isUuid(id)) return fail('notFound')
      const validated = validateContactInput(input, toCalendarDate(new Date()))
      if (!validated.ok) return invalid(validated.errors)
      const previous = deps.contacts.list().find((contact) => contact.id === id)
      const updated = deps.contacts.update(id, validated.value)
      if (!updated) return fail('notFound')
      if (previous && previous.reminderTime !== updated.reminderTime) deps.reminders.rescheduleContact(id)
      return ok(updated)
    })
  )
  ipcMain.handle('contacts:delete', (_event, id: unknown) =>
    guard(() => {
      if (!isUuid(id) || !deps.contacts.remove(id)) return fail('notFound')
      return ok(null)
    })
  )
  ipcMain.handle('settings:get', () => guard(() => ok(deps.settings.get())))
  ipcMain.handle('settings:update', (_event, patch: unknown) =>
    guard(() => {
      const validated = validateSettingsPatch(patch)
      if (!validated.ok) return invalid(validated.errors)
      const settings = deps.settings.update(validated.value)
      deps.onSettingsChanged(settings, validated.value)
      return ok(settings)
    })
  )
  ipcMain.handle('notifications:test', () =>
    guard(() => {
      const shown = deliverTestNotification(deps.settings.get().language)
      if (!shown) return fail('invalid')
      return ok(null)
    })
  )
  ipcMain.handle('notifications:check', () => guard(() => ok({ delivered: deps.reminders.check() })))
  ipcMain.handle('notifications:dismiss-today', (_event, input: unknown) =>
    guard(() => {
      const target = readSnoozeTarget(input)
      if (!target) return fail('invalid')
      deps.reminders.acknowledge(target.contactId, target.reminderType, target.occurrenceYear)
      return ok(null)
    })
  )
  ipcMain.handle('notifications:snooze-today', (_event, input: unknown) =>
    guard(() => {
      const target = readSnoozeTarget(input)
      if (!target || !isRecord(input)) return fail('invalid')
      const remindTime = typeof input.remindTime === 'string' ? input.remindTime : ''
      if (parseReminderMinutes(remindTime) == null) return fail('invalidTime')
      const now = new Date()
      const nowMinutes = now.getHours() * 60 + now.getMinutes()
      const chosen = parseReminderMinutes(remindTime)
      if (chosen == null || chosen <= nowMinutes) return fail('laterTime')
      deps.reminders.snoozeToday(target.contactId, target.reminderType, target.occurrenceYear, remindTime)
      return ok(null)
    })
  )
  ipcMain.handle('data:export-json', () => guard(async () => ok(await deps.transfer.exportJson())))
  ipcMain.handle('data:export-csv', () => guard(async () => ok(await deps.transfer.exportCsv())))
  ipcMain.handle('data:pick-import', () => guard(async () => ok(await deps.transfer.pickImport())))
  ipcMain.handle('data:commit-import', (_event, drafts: unknown, action: unknown) =>
    guard(() => {
      if (!Array.isArray(drafts) || !isDuplicateAction(action)) return fail('import')
      return ok(deps.transfer.commitImport(drafts, action))
    })
  )
  ipcMain.handle('app:version', () => ok(app.getVersion()))
}

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data }
}

function fail(error: string, fieldErrors?: FieldError[]): ApiResult<never> {
  return fieldErrors ? { ok: false, error, fieldErrors } : { ok: false, error }
}

function invalid(fieldErrors: FieldError[]): ApiResult<never> {
  return fail('validation', fieldErrors)
}

const REMINDER_TYPES: readonly ReminderType[] = ['on_day', 'days_1', 'days_3', 'days_7']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readSnoozeTarget(input: unknown): { contactId: string; reminderType: ReminderType; occurrenceYear: number } | null {
  if (!isRecord(input) || !isUuid(input.contactId)) return null
  if (typeof input.reminderType !== 'string' || !REMINDER_TYPES.includes(input.reminderType as ReminderType)) return null
  if (typeof input.occurrenceYear !== 'number' || !Number.isInteger(input.occurrenceYear)) return null
  if (input.occurrenceYear < 1900 || input.occurrenceYear > 2200) return null
  return {
    contactId: input.contactId,
    reminderType: input.reminderType as ReminderType,
    occurrenceYear: input.occurrenceYear
  }
}

async function guard<T>(work: () => ApiResult<T> | Promise<ApiResult<T>>): Promise<ApiResult<T>> {
  try {
    return await work()
  } catch (error) {
    console.error(error)
    const code = error instanceof Error ? error.message : 'invalid'
    if (code === 'import' || code === 'header' || code === 'empty' || code === 'invalidAvatar' || code === 'notFound') {
      return fail(code === 'invalidAvatar' ? 'invalidAvatar' : code)
    }
    return fail('invalid')
  }
}
