export type ThemeMode = 'light' | 'dark' | 'system'
export type Language = 'pl' | 'en'
export type Feb29Behavior = 'feb28' | 'mar1'
export type ReminderType = 'on_day' | 'days_1' | 'days_3' | 'days_7'
export type ContactSort = 'name' | 'upcoming' | 'created'
export type DuplicateAction = 'merge' | 'skip'
export type PageId = 'dashboard' | 'calendar' | 'contacts' | 'settings'

export interface ReminderPreferences {
  onDay: boolean
  daysBefore1: boolean
  daysBefore3: boolean
  daysBefore7: boolean
}

export interface Contact {
  id: string
  firstName: string
  lastName: string | null
  birthDay: number
  birthMonth: number
  birthYear: number | null
  avatarUrl: string | null
  notes: string | null
  reminders: ReminderPreferences
  reminderTime: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactInput {
  firstName: string
  lastName: string | null
  birthDay: number
  birthMonth: number
  birthYear: number | null
  notes: string | null
  reminders: ReminderPreferences
  reminderTime: string | null
  avatarDataUrl: string | null
  removeAvatar: boolean
}

export interface Settings {
  theme: ThemeMode
  language: Language
  notificationsEnabled: boolean
  reminderTime: string
  defaultReminders: ReminderPreferences
  autoLaunch: boolean
  minimizeToTray: boolean
  feb29Behavior: Feb29Behavior
  gracePeriodHours: number
}

export interface CalendarDate {
  year: number
  month: number
  day: number
}

export interface UpcomingBirthday {
  contact: Contact
  celebration: CalendarDate
  daysUntil: number
  age: number | null
}

export interface ImportContactDraft {
  firstName: string
  lastName: string | null
  birthDay: number
  birthMonth: number
  birthYear: number | null
  notes: string | null
  reminders: ReminderPreferences
  reminderTime: string | null
  avatarDataUrl: string | null
}

export interface FieldError {
  field: string
  code: string
}

export interface ImportPreviewRow {
  label: string
  draft: ImportContactDraft | null
  errors: FieldError[]
  duplicate: boolean
}

export interface ImportPreview {
  rows: ImportPreviewRow[]
  validCount: number
  invalidCount: number
  duplicateCount: number
}

export interface ImportCommitResult {
  created: number
  merged: number
  skipped: number
  invalid: number
}

export interface FileDialogResult {
  canceled: boolean
  filePath: string | null
}

export interface NotificationCheckResult {
  delivered: number
}

export interface TodaySnoozeRequest {
  contactId: string
  reminderType: ReminderType
  occurrenceYear: number
  firstName: string
  currentTime: string
}

export const REMINDER_OFFSETS: Record<ReminderType, number> = {
  on_day: 0,
  days_1: 1,
  days_3: 3,
  days_7: 7
}
