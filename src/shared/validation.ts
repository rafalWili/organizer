import {
  MAX_GRACE_HOURS,
  MAX_NAME_LENGTH,
  MAX_NOTES_LENGTH,
  MIN_BIRTH_YEAR,
  MIN_GRACE_HOURS
} from './defaults'
import { compareCalendarDates, isLeapYear, isValidCalendarDate } from './dates'
import type { CalendarDate } from './types'
import { parseReminderMinutes } from './reminders'
import type {
  ContactInput,
  Feb29Behavior,
  FieldError,
  ImportContactDraft,
  Language,
  ReminderPreferences,
  Settings,
  ThemeMode
} from './types'

export interface ValidationSuccess<T> {
  ok: true
  value: T
  errors: []
}

export interface ValidationFailure {
  ok: false
  errors: FieldError[]
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

function failure(errors: FieldError[]): ValidationFailure {
  return { ok: false, errors }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function readNullableString(value: unknown): string | null | undefined {
  if (value == null) return null
  return typeof value === 'string' ? value : undefined
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function readInteger(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null
  return value
}

function readNullableInteger(value: unknown): number | null | undefined {
  if (value == null || value === '') return null
  const integer = readInteger(value)
  return integer == null ? undefined : integer
}

function readReminderTime(source: Record<string, unknown>): string | null | undefined {
  if (!('reminderTime' in source) || source.reminderTime == null || source.reminderTime === '') return null
  if (typeof source.reminderTime === 'string' && parseReminderMinutes(source.reminderTime) != null) return source.reminderTime
  return undefined
}

export function validateReminders(value: unknown): ValidationResult<ReminderPreferences> {
  if (!isRecord(value)) return failure([{ field: 'reminders', code: 'invalid' }])
  const onDay = readBoolean(value.onDay)
  const daysBefore1 = readBoolean(value.daysBefore1)
  const daysBefore3 = readBoolean(value.daysBefore3)
  const daysBefore7 = readBoolean(value.daysBefore7)
  if (onDay == null || daysBefore1 == null || daysBefore3 == null || daysBefore7 == null) {
    return failure([{ field: 'reminders', code: 'invalid' }])
  }
  return { ok: true, value: { onDay, daysBefore1, daysBefore3, daysBefore7 }, errors: [] }
}

function validateBirthdayFields(
  source: Record<string, unknown>,
  today: CalendarDate
): { errors: FieldError[]; value: Omit<ContactInput, 'avatarDataUrl' | 'removeAvatar'> | null } {
  const errors: FieldError[] = []
  const firstRaw = readString(source.firstName)
  const firstName = firstRaw?.trim() ?? ''
  if (!firstName) errors.push({ field: 'firstName', code: 'required' })
  else if (firstName.length > MAX_NAME_LENGTH) errors.push({ field: 'firstName', code: 'tooLong' })

  const lastRaw = readNullableString(source.lastName)
  let lastName: string | null = null
  if (lastRaw === undefined) errors.push({ field: 'lastName', code: 'invalid' })
  else {
    const trimmed = (lastRaw ?? '').trim()
    if (trimmed.length > MAX_NAME_LENGTH) errors.push({ field: 'lastName', code: 'tooLong' })
    lastName = trimmed ? trimmed : null
  }

  const birthDay = readInteger(source.birthDay)
  const birthMonth = readInteger(source.birthMonth)
  const birthYear = readNullableInteger(source.birthYear)
  if (birthYear === undefined) errors.push({ field: 'birthYear', code: 'invalid' })

  if (birthDay == null || birthMonth == null) {
    errors.push({ field: 'birthday', code: 'invalidDate' })
  } else if (birthMonth === 2 && birthDay === 29) {
    if (birthYear != null && !isLeapYear(birthYear)) errors.push({ field: 'birthYear', code: 'feb29Year' })
  } else {
    const probeYear = birthYear ?? 2000
    if (!isValidCalendarDate({ year: probeYear, month: birthMonth, day: birthDay })) {
      errors.push({ field: 'birthday', code: 'invalidDate' })
    }
  }

  if (birthYear != null) {
    const currentYear = today.year
    if (birthYear < MIN_BIRTH_YEAR || birthYear > currentYear) {
      errors.push({ field: 'birthYear', code: 'invalidYear' })
    } else if (
      birthDay != null &&
      birthMonth != null &&
      compareCalendarDates({ year: birthYear, month: birthMonth, day: birthDay }, today) > 0
    ) {
      errors.push({ field: 'birthday', code: 'futureBirth' })
    }
  }

  const notesRaw = readNullableString(source.notes)
  let notes: string | null = null
  if (notesRaw === undefined) errors.push({ field: 'notes', code: 'invalid' })
  else {
    const trimmed = (notesRaw ?? '').trim()
    if (trimmed.length > MAX_NOTES_LENGTH) errors.push({ field: 'notes', code: 'tooLong' })
    notes = trimmed ? trimmed : null
  }

  const reminders = validateReminders(source.reminders)
  if (!reminders.ok) errors.push(...reminders.errors)

  const reminderTime = readReminderTime(source)
  if (reminderTime === undefined) errors.push({ field: 'reminderTime', code: 'invalidTime' })

  if (
    errors.length > 0 ||
    !firstName ||
    birthDay == null ||
    birthMonth == null ||
    birthYear === undefined ||
    !reminders.ok ||
    reminderTime === undefined
  ) {
    return { errors, value: null }
  }

  return {
    errors,
    value: {
      firstName,
      lastName,
      birthDay,
      birthMonth,
      birthYear,
      notes,
      reminders: reminders.value,
      reminderTime
    }
  }
}

const AVATAR_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,[a-zA-Z0-9+/=\r\n]+$/

export function validateAvatarDataUrl(value: string): boolean {
  if (!AVATAR_PATTERN.test(value)) return false
  const comma = value.indexOf(',')
  const payload = value.slice(comma + 1).replace(/\s/g, '')
  const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0
  const bytes = Math.floor((payload.length * 3) / 4) - padding
  return bytes > 0 && bytes <= 2 * 1024 * 1024
}

export function validateContactInput(input: unknown, today: CalendarDate): ValidationResult<ContactInput> {
  if (!isRecord(input)) return failure([{ field: 'contact', code: 'invalid' }])
  const base = validateBirthdayFields(input, today)
  const errors = [...base.errors]
  const avatarDataUrl = readNullableString(input.avatarDataUrl)
  const removeAvatar = readBoolean(input.removeAvatar)
  if (avatarDataUrl === undefined) errors.push({ field: 'avatar', code: 'invalidAvatar' })
  else if (avatarDataUrl && !validateAvatarDataUrl(avatarDataUrl)) errors.push({ field: 'avatar', code: 'invalidAvatar' })
  if (removeAvatar == null) errors.push({ field: 'avatar', code: 'invalidAvatar' })

  if (errors.length > 0 || !base.value || removeAvatar == null) return failure(errors)
  return {
    ok: true,
    errors: [],
    value: {
      ...base.value,
      avatarDataUrl: avatarDataUrl ?? null,
      removeAvatar
    }
  }
}

export function validateImportDraft(input: unknown, today: CalendarDate): ValidationResult<ImportContactDraft> {
  if (!isRecord(input)) return failure([{ field: 'contact', code: 'invalid' }])
  const base = validateBirthdayFields(input, today)
  const errors = [...base.errors]
  const avatarDataUrl = readNullableString(input.avatarDataUrl)
  if (avatarDataUrl === undefined) errors.push({ field: 'avatar', code: 'invalidAvatar' })
  else if (avatarDataUrl && !validateAvatarDataUrl(avatarDataUrl)) errors.push({ field: 'avatar', code: 'invalidAvatar' })
  if (errors.length > 0 || !base.value) return failure(errors)
  return {
    ok: true,
    errors: [],
    value: { ...base.value, avatarDataUrl: avatarDataUrl ?? null }
  }
}

const THEMES: readonly ThemeMode[] = ['light', 'dark', 'system']
const LANGUAGES: readonly Language[] = ['pl', 'en']
const FEB29: readonly Feb29Behavior[] = ['feb28', 'mar1']

export function validateSettingsPatch(input: unknown): ValidationResult<Partial<Settings>> {
  if (!isRecord(input)) return failure([{ field: 'settings', code: 'invalid' }])
  const errors: FieldError[] = []
  const patch: Partial<Settings> = {}

  if ('theme' in input) {
    if (typeof input.theme === 'string' && THEMES.includes(input.theme as ThemeMode)) patch.theme = input.theme as ThemeMode
    else errors.push({ field: 'theme', code: 'invalid' })
  }
  if ('language' in input) {
    if (typeof input.language === 'string' && LANGUAGES.includes(input.language as Language)) {
      patch.language = input.language as Language
    } else errors.push({ field: 'language', code: 'invalid' })
  }
  if ('notificationsEnabled' in input) {
    const value = readBoolean(input.notificationsEnabled)
    if (value == null) errors.push({ field: 'notificationsEnabled', code: 'invalid' })
    else patch.notificationsEnabled = value
  }
  if ('reminderTime' in input) {
    if (typeof input.reminderTime === 'string' && parseReminderMinutes(input.reminderTime) != null) {
      patch.reminderTime = input.reminderTime
    } else errors.push({ field: 'reminderTime', code: 'invalidTime' })
  }
  if ('defaultReminders' in input) {
    const reminders = validateReminders(input.defaultReminders)
    if (!reminders.ok) errors.push({ field: 'defaultReminders', code: 'invalid' })
    else patch.defaultReminders = reminders.value
  }
  if ('autoLaunch' in input) {
    const value = readBoolean(input.autoLaunch)
    if (value == null) errors.push({ field: 'autoLaunch', code: 'invalid' })
    else patch.autoLaunch = value
  }
  if ('minimizeToTray' in input) {
    const value = readBoolean(input.minimizeToTray)
    if (value == null) errors.push({ field: 'minimizeToTray', code: 'invalid' })
    else patch.minimizeToTray = value
  }
  if ('feb29Behavior' in input) {
    if (typeof input.feb29Behavior === 'string' && FEB29.includes(input.feb29Behavior as Feb29Behavior)) {
      patch.feb29Behavior = input.feb29Behavior as Feb29Behavior
    } else errors.push({ field: 'feb29Behavior', code: 'invalid' })
  }
  if ('gracePeriodHours' in input) {
    const value = readInteger(input.gracePeriodHours)
    if (value == null || value < MIN_GRACE_HOURS || value > MAX_GRACE_HOURS) {
      errors.push({ field: 'gracePeriodHours', code: 'invalidGrace' })
    } else patch.gracePeriodHours = value
  }

  if (errors.length > 0) return failure(errors)
  return { ok: true, value: patch, errors: [] }
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export function isDuplicateAction(value: unknown): value is 'merge' | 'skip' {
  return value === 'merge' || value === 'skip'
}
