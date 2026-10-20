import { dialog, type BrowserWindow } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { MAX_IMPORT_BYTES } from '@shared/defaults'
import { buildImportPreview } from '@shared/importing'
import { contactIdentity } from '@shared/names'
import { parseCsv, toCsv, type CsvContactRow } from '@shared/csv'
import { toCalendarDate } from '@shared/dates'
import { isDuplicateAction, validateImportDraft } from '@shared/validation'
import type {
  DuplicateAction,
  FileDialogResult,
  ImportCommitResult,
  ImportContactDraft,
  ImportPreview
} from '@shared/types'
import type { AvatarService } from './avatarService'
import type { ContactService } from './contactService'

export interface ImportExportService {
  exportJson: () => Promise<FileDialogResult>
  exportCsv: () => Promise<FileDialogResult>
  pickImport: () => Promise<{ canceled: true } | { canceled: false; preview: ImportPreview }>
  commitImport: (drafts: ImportContactDraft[], duplicateAction: DuplicateAction) => ImportCommitResult
}

export function createImportExportService(
  contacts: ContactService,
  avatars: AvatarService,
  getWindow: () => BrowserWindow | null
): ImportExportService {
  return {
    exportJson: async () => {
      const result = await saveDialog(getWindow, {
        title: 'Birthdayly JSON',
        defaultPath: `birthdayly-${stamp()}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }]
      })
      if (result.canceled || !result.filePath) return { canceled: true, filePath: null }
      const payload = {
        app: 'birthdayly',
        version: 1,
        exportedAt: new Date().toISOString(),
        contacts: contacts.list().map((contact) => ({
          firstName: contact.firstName,
          lastName: contact.lastName,
          birthDay: contact.birthDay,
          birthMonth: contact.birthMonth,
          birthYear: contact.birthYear,
          notes: contact.notes,
          reminders: contact.reminders,
          reminderTime: contact.reminderTime,
          avatarDataUrl: avatars.toDataUrl(filenameFromUrl(contact.avatarUrl))
        }))
      }
      await writeFile(result.filePath, JSON.stringify(payload, null, 2), 'utf8')
      return { canceled: false, filePath: result.filePath }
    },
    exportCsv: async () => {
      const result = await saveDialog(getWindow, {
        title: 'Birthdayly CSV',
        defaultPath: `birthdayly-${stamp()}.csv`,
        filters: [{ name: 'CSV', extensions: ['csv'] }]
      })
      if (result.canceled || !result.filePath) return { canceled: true, filePath: null }
      const rows: CsvContactRow[] = contacts.list().map((contact) => ({
        first_name: contact.firstName,
        last_name: contact.lastName ?? '',
        birth_day: String(contact.birthDay),
        birth_month: String(contact.birthMonth),
        birth_year: contact.birthYear == null ? '' : String(contact.birthYear),
        notes: contact.notes ?? '',
        remind_on_day: contact.reminders.onDay ? '1' : '0',
        remind_1: contact.reminders.daysBefore1 ? '1' : '0',
        remind_3: contact.reminders.daysBefore3 ? '1' : '0',
        remind_7: contact.reminders.daysBefore7 ? '1' : '0',
        remind_time: contact.reminderTime ?? ''
      }))
      await writeFile(result.filePath, toCsv(rows), 'utf8')
      return { canceled: false, filePath: result.filePath }
    },
    pickImport: async () => {
      const result = await dialog.showOpenDialog(parentWindow(getWindow), {
        title: 'Birthdayly',
        properties: ['openFile'],
        filters: [{ name: 'JSON or CSV', extensions: ['json', 'csv'] }]
      })
      const filePath = result.filePaths[0]
      if (result.canceled || !filePath) return { canceled: true }
      const file = await readFile(filePath)
      if (file.byteLength > MAX_IMPORT_BYTES) throw new Error('import')
      const text = file.toString('utf8')
      const candidates = filePath.toLowerCase().endsWith('.csv') ? candidatesFromCsv(text) : candidatesFromJson(text)
      const identities = new Map(contacts.list().map((contact) => [contactIdentity(contact), contact.id]))
      return {
        canceled: false,
        preview: buildImportPreview(candidates, identities, toCalendarDate(new Date()))
      }
    },
    commitImport: (drafts, duplicateAction) => {
      if (!isDuplicateAction(duplicateAction) || !Array.isArray(drafts)) throw new Error('import')
      const today = toCalendarDate(new Date())
      const known = new Map(contacts.list().map((contact) => [contactIdentity(contact), contact.id]))
      const summary: ImportCommitResult = { created: 0, merged: 0, skipped: 0, invalid: 0 }

      for (const draft of drafts) {
        const validated = validateImportDraft(draft, today)
        if (!validated.ok) {
          summary.invalid += 1
          continue
        }
        const identity = contactIdentity(validated.value)
        const existingId = known.get(identity)
        const input = { ...validated.value, removeAvatar: false }
        if (existingId) {
          if (duplicateAction === 'skip') {
            summary.skipped += 1
            continue
          }
          const updated = contacts.update(existingId, input)
          if (!updated) {
            summary.invalid += 1
            continue
          }
          summary.merged += 1
          continue
        }
        const created = contacts.create(input)
        known.set(identity, created.id)
        summary.created += 1
      }
      return summary
    }
  }
}

function parentWindow(getWindow: () => BrowserWindow | null): BrowserWindow {
  const window = getWindow()
  if (!window || window.isDestroyed()) throw new Error('import')
  return window
}

async function saveDialog(
  getWindow: () => BrowserWindow | null,
  options: Electron.SaveDialogOptions
): Promise<Electron.SaveDialogReturnValue> {
  const window = getWindow()
  if (window && !window.isDestroyed()) return dialog.showSaveDialog(window, options)
  return dialog.showSaveDialog(options)
}

function stamp(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function filenameFromUrl(url: string | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''))
  } catch {
    return null
  }
}

function candidatesFromJson(text: string): unknown[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    throw new Error('import')
  }
  if (typeof parsed !== 'object' || parsed === null || !('contacts' in parsed)) throw new Error('import')
  const contacts = (parsed as { contacts?: unknown }).contacts
  if (!Array.isArray(contacts)) throw new Error('import')
  return contacts
}

function candidatesFromCsv(text: string): unknown[] {
  const parsed = parseCsv(text)
  if (parsed.error) throw new Error(parsed.error)
  return parsed.rows.map((row) => ({
    firstName: row.first_name,
    lastName: row.last_name,
    birthDay: integerOrRaw(row.birth_day),
    birthMonth: integerOrRaw(row.birth_month),
    birthYear: row.birth_year.trim() === '' ? null : integerOrRaw(row.birth_year),
    notes: row.notes,
    reminders: {
      onDay: flag(row.remind_on_day),
      daysBefore1: flag(row.remind_1),
      daysBefore3: flag(row.remind_3),
      daysBefore7: flag(row.remind_7)
    },
    reminderTime: row.remind_time.trim() === '' ? null : row.remind_time,
    avatarDataUrl: null
  }))
}

function integerOrRaw(value: string): number | string {
  if (!/^-?\d+$/.test(value.trim())) return value.trim()
  return Number(value)
}

function flag(value: string): boolean {
  return ['1', 'true', 'yes', 'y', 'tak'].includes(value.trim().toLowerCase())
}
