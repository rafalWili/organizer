import type { FieldError } from './types'
import type {
  Contact,
  ContactInput,
  DuplicateAction,
  FileDialogResult,
  ImportCommitResult,
  ImportContactDraft,
  ImportPreview,
  NotificationCheckResult,
  Settings,
  TodaySnoozeRequest
} from './types'

export interface ApiFailure {
  ok: false
  error: string
  fieldErrors?: FieldError[]
}

export type ApiResult<T> = { ok: true; data: T } | ApiFailure

export interface BirthdaylyApi {
  contacts: {
    list: () => Promise<ApiResult<Contact[]>>
    create: (input: ContactInput) => Promise<ApiResult<Contact>>
    update: (id: string, input: ContactInput) => Promise<ApiResult<Contact>>
    remove: (id: string) => Promise<ApiResult<null>>
  }
  settings: {
    get: () => Promise<ApiResult<Settings>>
    update: (patch: Partial<Settings>) => Promise<ApiResult<Settings>>
  }
  notifications: {
    test: () => Promise<ApiResult<null>>
    checkNow: () => Promise<ApiResult<NotificationCheckResult>>
    onSnooze: (listener: (request: TodaySnoozeRequest) => void) => () => void
    snoozeToday: (input: TodaySnoozeRequest & { remindTime: string }) => Promise<ApiResult<null>>
    dismissToday: (input: Pick<TodaySnoozeRequest, 'contactId' | 'reminderType' | 'occurrenceYear'>) => Promise<ApiResult<null>>
  }
  data: {
    exportJson: () => Promise<ApiResult<FileDialogResult>>
    exportCsv: () => Promise<ApiResult<FileDialogResult>>
    pickImport: () => Promise<ApiResult<{ canceled: true } | { canceled: false; preview: ImportPreview }>>
    commitImport: (
      drafts: ImportContactDraft[],
      duplicateAction: DuplicateAction
    ) => Promise<ApiResult<ImportCommitResult>>
  }
  app: {
    version: () => Promise<ApiResult<string>>
  }
}
