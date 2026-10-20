import type { ReminderPreferences, Settings } from './types'

export const DEFAULT_REMINDERS: ReminderPreferences = {
  onDay: true,
  daysBefore1: true,
  daysBefore3: false,
  daysBefore7: false
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  language: 'pl',
  notificationsEnabled: true,
  reminderTime: '09:00',
  defaultReminders: { ...DEFAULT_REMINDERS },
  autoLaunch: false,
  minimizeToTray: true,
  feb29Behavior: 'feb28',
  gracePeriodHours: 36
}

export const MIN_BIRTH_YEAR = 1900
export const MAX_NOTES_LENGTH = 2000
export const MAX_NAME_LENGTH = 80
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024
export const MIN_GRACE_HOURS = 1
export const MAX_GRACE_HOURS = 168
