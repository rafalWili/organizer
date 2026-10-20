import type Database from 'better-sqlite3'
import { DEFAULT_SETTINGS } from '@shared/defaults'
import { parseReminderMinutes } from '@shared/reminders'
import type { Feb29Behavior, Language, ReminderPreferences, Settings, ThemeMode } from '@shared/types'

export interface SettingsRepository {
  get: () => Settings
  update: (patch: Partial<Settings>) => Settings
}

export function createSettingsRepository(database: Database.Database): SettingsRepository {
  const read = database.prepare('SELECT value FROM settings WHERE key = ?')
  const write = database.prepare(
    `INSERT INTO settings (key, value) VALUES (@key, @value)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  )

  function persist(settings: Settings): Settings {
    write.run({ key: 'app', value: JSON.stringify(settings) })
    return settings
  }

  return {
    get: () => {
      const row = read.get('app') as { value: string } | undefined
      if (!row) return persist(cloneSettings(DEFAULT_SETTINGS))
      try {
        return normalizeSettings(JSON.parse(row.value) as Partial<Settings>)
      } catch {
        return persist(cloneSettings(DEFAULT_SETTINGS))
      }
    },
    update: (patch) => {
      const current = read.get('app') as { value: string } | undefined
      const base = current ? safeParse(current.value) : cloneSettings(DEFAULT_SETTINGS)
      return persist(normalizeSettings({ ...base, ...patch }))
    }
  }
}

function safeParse(value: string): Settings {
  try {
    return normalizeSettings(JSON.parse(value) as Partial<Settings>)
  } catch {
    return cloneSettings(DEFAULT_SETTINGS)
  }
}

function cloneSettings(settings: Settings): Settings {
  return {
    ...settings,
    defaultReminders: { ...settings.defaultReminders }
  }
}

function normalizeSettings(value: Partial<Settings>): Settings {
  return {
    theme: oneOf<ThemeMode>(value.theme, ['light', 'dark', 'system'], DEFAULT_SETTINGS.theme),
    language: oneOf<Language>(value.language, ['pl', 'en'], DEFAULT_SETTINGS.language),
    notificationsEnabled: typeof value.notificationsEnabled === 'boolean' ? value.notificationsEnabled : DEFAULT_SETTINGS.notificationsEnabled,
    reminderTime:
      typeof value.reminderTime === 'string' && parseReminderMinutes(value.reminderTime) != null
        ? value.reminderTime
        : DEFAULT_SETTINGS.reminderTime,
    defaultReminders: normalizeReminders(value.defaultReminders),
    autoLaunch: typeof value.autoLaunch === 'boolean' ? value.autoLaunch : DEFAULT_SETTINGS.autoLaunch,
    minimizeToTray: typeof value.minimizeToTray === 'boolean' ? value.minimizeToTray : DEFAULT_SETTINGS.minimizeToTray,
    feb29Behavior: oneOf<Feb29Behavior>(value.feb29Behavior, ['feb28', 'mar1'], DEFAULT_SETTINGS.feb29Behavior),
    gracePeriodHours:
      typeof value.gracePeriodHours === 'number' &&
      Number.isInteger(value.gracePeriodHours) &&
      value.gracePeriodHours >= 1 &&
      value.gracePeriodHours <= 168
        ? value.gracePeriodHours
        : DEFAULT_SETTINGS.gracePeriodHours
  }
}

function normalizeReminders(value: ReminderPreferences | undefined): ReminderPreferences {
  if (!value) return { ...DEFAULT_SETTINGS.defaultReminders }
  return {
    onDay: value.onDay === true,
    daysBefore1: value.daysBefore1 === true,
    daysBefore3: value.daysBefore3 === true,
    daysBefore7: value.daysBefore7 === true
  }
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback
}
